export type ApiError = {
  name: 'ApiError';
  status?: number;
  message: string;
  url: string;
  responseText?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export async function fetchJson<T>(
  url: string,
  options?: RequestInit & { timeoutMs?: number }
): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = options?.timeoutMs ?? 15_000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(options?.headers ?? {}),
      },
    });

    if (!res.ok) {
      const responseText = await res.text().catch(() => undefined);
      const err: ApiError = {
        name: 'ApiError',
        status: res.status,
        message: `Request failed with status ${res.status}`,
        url,
        responseText,
      };
      throw err;
    }

    const text = await res.text();
    const json = text.length ? (JSON.parse(text) as unknown) : null;
    return json as T;
  } catch (e) {
    if (isRecord(e) && e.name === 'AbortError') {
      const err: ApiError = {
        name: 'ApiError',
        message: 'Request timed out',
        url,
      };
      throw err;
    }
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}
