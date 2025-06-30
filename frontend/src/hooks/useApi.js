import { useState } from 'https://cdn.skypack.dev/react';

const API_BASE_URL = 'http://localhost:8000';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = async (url, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const fullUrl = `${API_BASE_URL}${url}`;
      const response = await fetch(fullUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const get = (url) => request(url);

  const post = (url, data, options = {}) => {
    const isFormData = data instanceof FormData;
    
    return request(url, {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      ...options,
    });
  };

  const put = (url, data) => request(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  const del = (url) => request(url, {
    method: 'DELETE',
  });

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: del,
  };
};
