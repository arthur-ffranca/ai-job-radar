export const runtime = "nodejs";

function resolveBackendUrl() {
  if (process.env.API_URL) {
    return process.env.API_URL;
  }

  if (process.env.API_INTERNAL_HOST) {
    return `http://${process.env.API_INTERNAL_HOST}`;
  }

  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  return "http://127.0.0.1:8000";
}

export async function POST(request: Request) {
  const incomingFormData = await request.formData();
  const file = incomingFormData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ detail: "Missing resume file." }, { status: 400 });
  }

  const backendFormData = new FormData();
  backendFormData.append("file", file, file.name);

  const backendUrl = resolveBackendUrl();
  let backendResponse: globalThis.Response;

  try {
    backendResponse = await fetch(`${backendUrl}/parse-resume`, {
      method: "POST",
      body: backendFormData,
    });
  } catch (error) {
    console.error("[AI Job Radar] Resume proxy failed", {
      backendUrl,
      error,
    });

    return Response.json(
      {
        detail: "Resume parser service is unavailable.",
        backendUrl,
      },
      { status: 502 }
    );
  }

  const responseText = await backendResponse.text();

  return new Response(responseText, {
    status: backendResponse.status,
    headers: {
      "content-type": backendResponse.headers.get("content-type") || "application/json",
    },
  });
}
