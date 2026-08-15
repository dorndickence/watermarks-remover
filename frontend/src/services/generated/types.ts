import type { paths } from "./openapi";

export type InspectRequest =
  paths["/inspect"]["post"]["requestBody"] extends {
    content: { "application/json": infer Body };
  }
    ? Body
    : never;

export type CleanRequest =
  paths["/clean"]["post"]["requestBody"] extends {
    content: { "application/json": infer Body };
  }
    ? Body
    : never;

export type InspectResponse =
  paths["/inspect"]["post"]["responses"][200]["content"]["application/json"];
export type CleanResponse =
  paths["/clean"]["post"]["responses"][200]["content"]["application/json"];
