import { useState } from 'react';

export function useAPI(apiBaseUrl) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAPI = async (endpoint, isText = false, method = "GET") => {
        setLoading(true);
        try {
            const headers = method === "GET" ? {} : {
                'Content-Type': 'application/json',
            };

            const response = await fetch(`${apiBaseUrl}${endpoint}`, {
                method: method,
                headers: headers,
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = isText ? await response.text() : await response.json();
            setLoading(false);
            return data;
        } catch (error) {
            setLoading(false);
            setError(error.message);
            throw error;
        }
    };

    return {
        fetchAPI,
        loading,
        setLoading,
        error,
        setError
    };
} 