// API helper functions

const defaultHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

const defaultOptions = {
  mode: 'cors' as RequestMode,
  credentials: 'same-origin' as RequestCredentials,
  headers: defaultHeaders,
  cache: 'no-cache' as RequestCache
};

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');
  
  // Ensure endpoint starts with /api/
  const apiEndpoint = endpoint.startsWith('/api/') ? endpoint : `/api/${endpoint}`;
  
  const response = await fetch(`${API_URL}${apiEndpoint}`, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  });

  if (!response.ok) {
    console.error('API Error:', {
      endpoint,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries([...response.headers.entries()]),
      url: response.url
    });
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

export async function get(endpoint: string) {
  return fetchApi(endpoint, { method: 'GET' });
}

export async function post(endpoint: string, data: any) {
  return fetchApi(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function put(endpoint: string, data: any) {
  return fetchApi(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function del(endpoint: string) {
  return fetchApi(endpoint, { method: 'DELETE' });
}
