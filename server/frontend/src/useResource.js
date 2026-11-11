import { useEffect, useState } from 'react';
import { api } from './api';

export function useResource(endpoint) {
  const [result, setResult] = useState({});
  useEffect(() => {
    if (!endpoint) return undefined;
    let active = true;
    api(endpoint).then(
      (data) => { if (active) setResult({ endpoint, data }); },
      (error) => { if (active) setResult({ endpoint, error: error.message }); }
    );
    return () => { active = false; };
  }, [endpoint]);
  return result.endpoint === endpoint ? result : {};
}
