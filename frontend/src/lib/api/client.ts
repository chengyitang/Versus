import axios from 'axios';

// Remove the base URL to use relative paths
export const client = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetcher = async (url: string) => {
  try {
    const response = await client.get(url);
    console.log('API Response:', response);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
} 