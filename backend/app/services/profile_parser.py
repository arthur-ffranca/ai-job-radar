from __future__ import annotations

import json
import os
import re
import sys
from copy import deepcopy
from pathlib import Path
from typing import Any

import httpx

BACKEND_DIR = Path(__file__).resolve().parents[2]
ENV_PATH = BACKEND_DIR / ".env"
GROQ_BASE_URL = "https://api.groq.com/openai/v1"
OPENAI_BASE_URL = "https://api.openai.com/v1"


def _load_local_env() -> None:
    if not ENV_PATH.exists():
        return

    for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
        clean = line.strip()
        if not clean or clean.startswith("#") or "=" not in clean:
            continue

        key, value = clean.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


_load_local_env()


def _safe_debug_print(label: str, value: object = "") -> None:
    text = f"{label}{value}"
    encoding = sys.stdout.encoding or "utf-8"
    print(text.encode(encoding, errors="replace").decode(encoding, errors="replace"))


UNIVERSAL_EXTRACTION_PROMPT = """You are an expert resume parser. Extract structured information from the resume text below.

Rules:
- Work for any profession and industry.
- Preserve the candidate's real background.
- Do not infer skills that are not present.
- Do not invent companies, degrees, certifications or tools.
- If a field is missing, return an empty string or empty array.
- Extract tools from all sections, including experience bullets.
- Extract education even if it appears in Portuguese, English or mixed language.
- Extract languages even if written as Idiomas, Languages, Línguas.
- Extract certifications even if written as Certificações, Courses, Certificates.
- Extract technical tools, business skills, industries and domain knowledge.
- Infer seniority only from years, titles and context, and return confidence.

Return strict JSON using exactly this shape:
{
  "name": "",
  "email": "",
  "phone": "",
  "location": "",
  "headline": "",
  "summary": "",
  "current_role": "",
  "current_company": "",
  "seniority": {
    "level": "",
    "confidence": ""
  },
  "experience": [
    {
      "company": "",
      "role": "",
      "period": "",
      "location": "",
      "bullets": [],
      "tools_detected": [],
      "domain_skills_detected": []
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "field": "",
      "period": "",
      "location": ""
    }
  ],
  "languages": [
    {
      "language": "",
      "level": ""
    }
  ],
  "certifications": [
    {
      "name": "",
      "issuer": "",
      "date": ""
    }
  ],
  "tools": [],
  "technical_skills": [],
  "business_skills": [],
  "industries": [],
  "keywords": [],
  "target_role_suggestions": []
}"""

EMPTY_PROFILE: dict[str, Any] = {
    "name": "",
    "email": "",
    "phone": "",
    "location": "",
    "headline": "",
    "summary": "",
    "current_role": "",
    "current_company": "",
    "seniority": {
        "level": "",
        "confidence": "",
    },
    "experience": [],
    "education": [],
    "languages": [],
    "certifications": [],
    "tools": [],
    "technical_skills": [],
    "business_skills": [],
    "industries": [],
    "keywords": [],
    "target_role_suggestions": [],
}

EXPERIENCE_TEMPLATE = {
    "company": "",
    "role": "",
    "period": "",
    "location": "",
    "bullets": [],
    "tools_detected": [],
    "domain_skills_detected": [],
}

EDUCATION_TEMPLATE = {
    "institution": "",
    "degree": "",
    "field": "",
    "period": "",
    "location": "",
}

LANGUAGE_TEMPLATE = {
    "language": "",
    "level": "",
}

CERTIFICATION_TEMPLATE = {
    "name": "",
    "issuer": "",
    "date": "",
}


class ProfileParserError(ValueError):
    pass


def _as_string(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, (int, float)):
        return str(value)
    return ""


def _as_string_list(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []

    output: list[str] = []
    seen: set[str] = set()
    for item in value:
        clean = _as_string(item)
        key = clean.lower()
        if clean and key not in seen:
            seen.add(key)
            output.append(clean)
    return output


def _normalize_object_list(value: Any, template: dict[str, Any]) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []

    normalized: list[dict[str, Any]] = []
    for item in value:
        if not isinstance(item, dict):
            continue

        next_item: dict[str, Any] = {}
        for key, default in template.items():
            if isinstance(default, list):
                next_item[key] = _as_string_list(item.get(key))
            else:
                next_item[key] = _as_string(item.get(key))

        if any(next_item.values()):
            normalized.append(next_item)

    return normalized


def validate_profile_json(value: Any) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise ProfileParserError("Resume parser returned a non-object JSON value.")

    profile = deepcopy(EMPTY_PROFILE)

    for key in [
        "name",
        "email",
        "phone",
        "location",
        "headline",
        "summary",
        "current_role",
        "current_company",
    ]:
        profile[key] = _as_string(value.get(key))

    seniority = value.get("seniority")
    if isinstance(seniority, dict):
        profile["seniority"] = {
            "level": _as_string(seniority.get("level")),
            "confidence": _as_string(seniority.get("confidence")),
        }
    elif isinstance(seniority, str):
        profile["seniority"] = {
            "level": seniority.strip(),
            "confidence": "",
        }

    profile["experience"] = _normalize_object_list(value.get("experience"), EXPERIENCE_TEMPLATE)
    profile["education"] = _normalize_object_list(value.get("education"), EDUCATION_TEMPLATE)
    profile["languages"] = _normalize_object_list(value.get("languages"), LANGUAGE_TEMPLATE)
    profile["certifications"] = _normalize_object_list(value.get("certifications"), CERTIFICATION_TEMPLATE)

    for key in [
        "tools",
        "technical_skills",
        "business_skills",
        "industries",
        "keywords",
        "target_role_suggestions",
    ]:
        profile[key] = _as_string_list(value.get(key))

    return profile


def _extract_json_object(text: str) -> dict[str, Any]:
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            raise
        parsed = json.loads(match.group(0))

    if not isinstance(parsed, dict):
        raise ProfileParserError("Resume parser did not return a JSON object.")

    return parsed


def _fallback_contact_profile(raw_text: str) -> dict[str, Any]:
    profile = deepcopy(EMPTY_PROFILE)
    lines = [line.strip(" \t-*") for line in raw_text.splitlines() if line.strip(" \t-*")]

    email_match = re.search(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+", raw_text)
    phone_match = re.search(r"(?:\+?\d[\d\s().-]{7,}\d)", raw_text)

    profile["email"] = email_match.group(0) if email_match else ""
    profile["phone"] = phone_match.group(0).strip() if phone_match else ""

    for line in lines[:8]:
        if re.search(r"@|www|linkedin|github|\d{3,}", line, re.IGNORECASE):
            continue
        words = line.split()
        if 2 <= len(words) <= 6:
            profile["name"] = line
            break

    return profile


def _merge_contact_fallback(profile: dict[str, Any], fallback: dict[str, Any]) -> dict[str, Any]:
    for key in ["name", "email", "phone"]:
        if not profile.get(key) and fallback.get(key):
            profile[key] = fallback[key]
    return profile


def _llm_config() -> dict[str, str]:
    groq_api_key = os.getenv("GROQ_API_KEY")
    if groq_api_key:
        return {
            "provider": "groq",
            "api_key": groq_api_key,
            "base_url": os.getenv("GROQ_BASE_URL", GROQ_BASE_URL).rstrip("/"),
            "model": os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
        }

    openai_api_key = os.getenv("OPENAI_API_KEY")
    if openai_api_key:
        return {
            "provider": "openai",
            "api_key": openai_api_key,
            "base_url": os.getenv("OPENAI_BASE_URL", OPENAI_BASE_URL).rstrip("/"),
            "model": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        }

    raise ProfileParserError("GROQ_API_KEY or OPENAI_API_KEY is not configured.")


def _chat_completion(messages: list[dict[str, str]]) -> tuple[str, dict[str, str]]:
    config = _llm_config()
    timeout = float(os.getenv("OPENAI_TIMEOUT_SECONDS", "45"))
    url = f"{config['base_url']}/chat/completions"

    _safe_debug_print("LLM PROVIDER: ", config["provider"])
    _safe_debug_print("LLM MODEL: ", config["model"])
    _safe_debug_print("LLM ENDPOINT: ", url)

    response = httpx.post(
        url,
        headers={
            "Authorization": f"Bearer {config['api_key']}",
            "Content-Type": "application/json",
        },
        json={
            "model": config["model"],
            "response_format": {"type": "json_object"},
            "messages": messages,
            "temperature": 0,
        },
        timeout=timeout,
    )
    response.raise_for_status()

    body = response.json()
    return body["choices"][0]["message"]["content"], {
        "llm_provider": config["provider"],
        "llm_model": config["model"],
        "llm_endpoint": url,
    }


def _parse_with_llm(raw_text: str) -> tuple[dict[str, Any], dict[str, Any]]:
    messages = [
        {
            "role": "system",
            "content": UNIVERSAL_EXTRACTION_PROMPT,
        },
        {
            "role": "user",
            "content": f"Resume text:\n\n{raw_text}",
        },
    ]
    debug: dict[str, Any] = {
        "prompt_size": len(UNIVERSAL_EXTRACTION_PROMPT),
        "raw_text_size": len(raw_text),
        "llm_response": "",
        "llm_response_preview": "",
        "json_parse_error": "",
        "llm_retry_response": "",
        "llm_retry_response_preview": "",
        "json_retry_parse_error": "",
        "llm_provider": "",
        "llm_model": "",
        "llm_endpoint": "",
    }

    _safe_debug_print("LLM PROMPT SIZE: ", len(UNIVERSAL_EXTRACTION_PROMPT))
    _safe_debug_print("LLM RAW TEXT SIZE: ", len(raw_text))

    first_response, provider_debug = _chat_completion(messages)
    debug.update(provider_debug)
    debug["llm_response"] = first_response
    debug["llm_response_preview"] = first_response[:1000]
    _safe_debug_print("RAW AI RESPONSE:\n", first_response)

    try:
        parsed_json = _extract_json_object(first_response)
        _safe_debug_print("PARSED JSON:\n", json.dumps(parsed_json, ensure_ascii=False, indent=2))
        return validate_profile_json(parsed_json), debug
    except Exception as first_error:
        debug["json_parse_error"] = str(first_error)
        _safe_debug_print("JSON PARSING ERROR: ", first_error)
        correction_messages = [
            {
                "role": "system",
                "content": "Return ONLY valid JSON.",
            },
            {
                "role": "user",
                "content": (
                    f"The previous response could not be parsed or validated: {first_error}\n\n"
                    f"Required schema and rules:\n{UNIVERSAL_EXTRACTION_PROMPT}\n\n"
                    f"Previous response:\n{first_response}"
                ),
            },
        ]
        corrected_response, provider_debug = _chat_completion(correction_messages)
        debug.update(provider_debug)
        debug["llm_retry_response"] = corrected_response
        debug["llm_retry_response_preview"] = corrected_response[:1000]
        _safe_debug_print("RAW AI RETRY RESPONSE:\n", corrected_response)
        try:
            corrected_json = _extract_json_object(corrected_response)
            _safe_debug_print("PARSED RETRY JSON:\n", json.dumps(corrected_json, ensure_ascii=False, indent=2))
            return validate_profile_json(corrected_json), debug
        except Exception as retry_error:
            debug["json_retry_parse_error"] = str(retry_error)
            _safe_debug_print("JSON RETRY PARSING ERROR: ", retry_error)
            raise


def parse_profile_from_text(raw_text: str) -> dict[str, Any]:
    profile, _debug = parse_profile_with_debug(raw_text)
    return profile


def parse_profile_with_debug(raw_text: str) -> tuple[dict[str, Any], dict[str, Any]]:
    if not raw_text.strip():
        raise ValueError("Resume text is empty.")

    fallback = _fallback_contact_profile(raw_text)
    debug: dict[str, Any] = {
        "prompt_size": len(UNIVERSAL_EXTRACTION_PROMPT),
        "raw_text_size": len(raw_text),
        "llm_response": "",
        "llm_response_preview": "",
        "json_parse_error": "",
        "llm_retry_response": "",
        "llm_retry_response_preview": "",
        "json_retry_parse_error": "",
        "parser_error": "",
        "used_fallback": False,
        "llm_provider": "",
        "llm_model": "",
        "llm_endpoint": "",
    }

    try:
        profile, llm_debug = _parse_with_llm(raw_text)
        debug.update(llm_debug)
    except Exception as exc:
        try:
            config = _llm_config()
            debug["llm_provider"] = config["provider"]
            debug["llm_model"] = config["model"]
            debug["llm_endpoint"] = f"{config['base_url']}/chat/completions"
        except Exception:
            pass
        debug["parser_error"] = str(exc)
        debug["used_fallback"] = True
        _safe_debug_print("LLM PARSING FAILED: ", exc)
        profile = validate_profile_json({})

    profile = _merge_contact_fallback(profile, fallback)
    _safe_debug_print("FINAL PARSED PROFILE:\n", json.dumps(profile, ensure_ascii=False, indent=2))
    return profile, debug
