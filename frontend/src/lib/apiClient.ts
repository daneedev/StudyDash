type ApiFetchOptions = RequestInit & {
  auth?: boolean;
};

type ApiErrorPayload = {
  message?: string;
};

function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL;
}

function getAuthToken() {
  return localStorage.getItem("auth_token");
}

async function readResponsePayload(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof (payload as ApiErrorPayload).message === "string"
  ) {
    return (payload as ApiErrorPayload).message;
  }

  return fallback;
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { auth = true, headers, ...requestOptions } = options;
  const token = auth ? getAuthToken() : null;

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...requestOptions,
    headers: {
      ...(requestOptions.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const payload = await readResponsePayload(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(payload, "Nastala chyba při komunikaci se serverem."),
    );
  }

  return payload as T;
}
