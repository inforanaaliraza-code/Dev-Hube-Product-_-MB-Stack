export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export type AuthType = "none" | "bearer" | "basic" | "apikey";

export type BodyType = "none" | "json" | "raw" | "form" | "urlencoded";

export type TestType = "status" | "body_contains" | "header" | "time_lt";

export interface KeyValueRow {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface AuthConfig {
  type: AuthType;
  token: string;
  username: string;
  password: string;
  apiKey: string;
  apiValue: string;
  apiIn: "header" | "query";
}

export interface TestAssertion {
  id: string;
  type: TestType;
  target: string;
  expected: string;
  enabled: boolean;
}

export interface ApiRequestDoc {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  params: KeyValueRow[];
  headers: KeyValueRow[];
  auth: AuthConfig;
  bodyType: BodyType;
  bodyRaw: string;
  bodyJson: string;
  formRows: KeyValueRow[];
  tests: TestAssertion[];
}

export interface ApiCollection {
  id: string;
  name: string;
  requests: ApiRequestDoc[];
}

export interface ApiEnvironment {
  id: string;
  name: string;
  variables: KeyValueRow[];
}

export interface HistoryEntry {
  id: string;
  at: number;
  request: ApiRequestDoc;
  status: number;
  durationMs: number;
}

export interface ApiTestResponse {
  ok: boolean;
  status: number;
  statusText: string;
  durationMs: number;
  sizeBytes: number;
  contentType: string;
  bodyKind: "json" | "html" | "xml" | "text";
  finalUrl: string;
  headers: Record<string, string>;
  body: string;
  error?: string;
  truncated?: boolean;
}

export interface TestResult {
  id: string;
  label: string;
  passed: boolean;
  message: string;
}
