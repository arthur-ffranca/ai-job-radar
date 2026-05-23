from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.resume_parser import parse_resume_upload

router = APIRouter()

SUPPORTED_CONTENT_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
SUPPORTED_EXTENSIONS = (".pdf", ".docx")


@router.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)) -> dict[str, object]:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Uploaded file is missing a filename.")

    filename = file.filename.strip()
    extension_ok = filename.lower().endswith(SUPPORTED_EXTENSIONS)
    content_type_ok = file.content_type in SUPPORTED_CONTENT_TYPES

    if not extension_ok and not content_type_ok:
        raise HTTPException(
            status_code=415,
            detail="Unsupported file type. Upload a PDF or DOCX resume.",
        )

    contents = await file.read()

    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    print("UPLOAD FILENAME:", filename)
    print("UPLOAD FILE SIZE:", len(contents))
    print("UPLOAD CONTENT TYPE:", file.content_type or "")

    try:
        return parse_resume_upload(
            filename=filename,
            contents=contents,
            content_type=file.content_type or "",
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Resume text extraction failed.",
        ) from exc
