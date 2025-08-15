// API helper functions

const defaultHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'X-Requested-With': 'XMLHttpRequest'
};

const defaultOptions = {
  mode: 'cors' as RequestMode,
  credentials: 'include' as RequestCredentials,
  headers: defaultHeaders,
  cache: 'no-cache' as RequestCache
};

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  // Remove any leading or trailing slashes from endpoint
  const cleanEndpoint = endpoint.replace(/^\/+|\/+$/g, '');
  
  // Build the full URL - API endpoints no longer have /api prefix
  const fullUrl = `${API_URL}/${cleanEndpoint}`;
  
  console.log('Making API request to:', fullUrl);
  
  const response = await fetch(fullUrl, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  });

  // Clone the response so we can read it multiple times if needed
  const responseClone = response.clone();

  try {
    if (!response.ok) {
      const responseText = await responseClone.text();
      console.error('API Error:', {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()]),
        url: response.url,
        responseBody: responseText
      });
      throw new Error(`API Error: ${response.statusText}\nResponse: ${responseText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      // JSON parse error
      const responseText = await responseClone.text();
      console.error('JSON Parse Error:', {
        endpoint,
        error: error.message,
        responseText,
        headers: Object.fromEntries([...response.headers.entries()]),
        url: response.url
      });
      throw new Error(`Failed to parse JSON response: ${error.message}\nResponse: ${responseText}`);
    }
    throw error;
  }
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
