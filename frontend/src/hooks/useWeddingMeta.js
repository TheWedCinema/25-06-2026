import { useEffect, useState } from "react";
import axios from "axios";
import { HTTP_NOT_FOUND } from "@/constants/timings";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

/**
 * Fetches wedding metadata (pre-PIN payload) for a slug.
 * Returns { meta, error } — both null while loading.
 */
export default function useWeddingMeta(slug) {
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.get(`${API}/weddings/${slug}/meta`);
        if (!cancelled) setMeta(data);
      } catch (e) {
        if (!cancelled) {
          setError(e.response?.status === HTTP_NOT_FOUND ? "Wedding not found" : "Unable to load");
        }
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  return { meta, error };
}
