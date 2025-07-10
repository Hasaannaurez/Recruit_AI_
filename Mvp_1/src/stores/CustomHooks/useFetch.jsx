import { useState, useEffect } from 'react';

const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      try {
        const res = await fetch(url, { ...options, signal });
        
        if (!res.ok) {
          throw Error('Error fetching data');
        }

        const data = await res.json();
        setData(data);
        setIsPending(false);
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Fetch aborted');
        } else {
          console.log(err.message);
          setError(err.message);
          setIsPending(false);
        }
      }
    };

    fetchData();

    // Cleanup function to abort fetch if component unmounts
    return () => controller.abort();
  }, [url, options]);

  return { data, isPending, error };
};

export default useFetch;
