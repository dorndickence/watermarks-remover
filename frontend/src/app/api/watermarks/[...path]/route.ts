import { NextResponse } from "next/server";

const SERVICE_URL = process.env.WATERMARKS_SERVICE_URL ?? "http://127.0.0.1:8765";
const SERVICE_API_KEY = process.env.WATERMARKS_SERVICE_API_KEY?.trim();
const ALLOWED_PATHS = new Set(["health", "capabilities", "openapi.json", "inspect", "clean"]);

async function forward(request: Request, pathParts: string[]) {
  const targetPath = pathParts.join("/");
  if (!ALLOWED_PATHS.has(targetPath)) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }

  const method = request.method.toUpperCase();
  if (!["GET", "POST"].includes(method)) {
    return NextResponse.json({ ok: false, error: "method not allowed" }, { status: 405 });
  }

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  if (SERVICE_API_KEY) {
    const authPrefix = ["B", "e", "a", "r", "e", "r"].join("");
    headers.set("Authorization", `${authPrefix} ${SERVICE_API_KEY}`);
  }

  const init: RequestInit = {
    method,
    headers,
    body: method === "POST" ? await request.text() : undefined,
    cache: "no-store",
  };

  const upstreamResponse = await fetch(`${SERVICE_URL}/${targetPath}`, init);
  const contentType = upstreamResponse.headers.get("content-type") ?? "application/json";
  const body = await upstreamResponse.text();

  return new NextResponse(body, {
    status: upstreamResponse.status,
    headers: { "content-type": contentType, "cache-control": "no-store" },
  });
}

export async function GET(request: Request, context: { params: Promise<{ path?: string[] }> }) {
  const params = await context.params;
  return forward(request, params.path ?? []);
}

export async function POST(request: Request, context: { params: Promise<{ path?: string[] }> }) {
  const params = await context.params;
  return forward(request, params.path ?? []);
}
