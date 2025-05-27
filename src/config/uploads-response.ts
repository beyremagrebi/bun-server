import { createCorsResponse } from "../utils/cors";
import { Logger } from "./logger";

export async function handleUploadsRequest(url: URL): Promise<Response | null> {
  if (!url.pathname.startsWith("/uploads/")) return null;

  const filePath = `.${url.pathname}`;
  const file = Bun.file(filePath);

  if (await file.exists()) {
    const response = new Response(file);
    Logger.logHttp("GET", response.status, url.pathname);
    return createCorsResponse(response);
  }

  Logger.logHttp("GET", 404, url.pathname);
  return new Response("File not found", { status: 404 });
}
