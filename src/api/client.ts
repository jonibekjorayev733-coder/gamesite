// API client configuration
export const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
};

export const getApiUrl = (path: string): string => {
  const baseUrl = getApiBaseUrl();
  if (path.startsWith("/")) {
    return baseUrl + path;
  }
  return baseUrl + "/" + path;
};

interface FetchOptions extends RequestInit {
  token?: string | null;
}

export const apiFetch = async <T>(
  path: string,
  options?: FetchOptions
): Promise<T> => {
  const url = getApiUrl(path);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers ? (options.headers as Record<string, string>) : {}),
  };

  if (options?.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || errorData.message || `Request failed: ${response.status}`
    );
  }

  return response.json() as Promise<T>;
};
