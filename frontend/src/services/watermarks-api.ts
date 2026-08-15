import createClient from "openapi-fetch";

import type { paths } from "@/services/generated/openapi";
import type {
  CleanRequest,
  CleanResponse,
  InspectRequest,
  InspectResponse,
} from "@/services/generated/types";

const client = createClient<paths>({ baseUrl: "/api/watermarks" });

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Request failed";
}

export async function inspectFile(payload: InspectRequest): Promise<InspectResponse> {
  const { data, error } = await client.POST("/inspect", { body: payload });
  if (error || !data) {
    throw new Error(errorMessage(error));
  }
  return data;
}

export async function cleanFile(payload: CleanRequest): Promise<CleanResponse> {
  const { data, error } = await client.POST("/clean", { body: payload });
  if (error || !data) {
    throw new Error(errorMessage(error));
  }
  return data;
}

export async function getHealth() {
  const { data, error } = await client.GET("/health");
  if (error || !data) {
    throw new Error(errorMessage(error));
  }
  return data;
}
