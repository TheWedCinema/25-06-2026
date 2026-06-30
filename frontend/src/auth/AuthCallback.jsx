import { useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

/**
 * Handles the Emergent OAuth return: reads #session_id=... from URL,
 * exchanges it via /api/auth/session, then redirects to /studio.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = window.location.hash || "";
    const match = hash.match(/session_id=([^&]+)/);
    if (!match) {
      navigate("/login", { replace: true });
      return;
    }
    const session_id = decodeURIComponent(match[1]);

    (async () => {
      try {
        await axios.post(`${API}/auth/session`, { session_id }, { withCredentials: true });
        await refresh();
        // strip hash + go to studio
        window.history.replaceState({}, "", "/studio");
        navigate("/studio", { replace: true });
      } catch {
        navigate("/login", { replace: true, state: { error: "Sign-in failed. Please try again." } });
      }
    })();
  }, [navigate, refresh]);

  return (
    <div className="min-h-screen flex items-center justify-center text-zinc-500 font-sans-twc text-xs uppercase tracking-[0.3em]" data-testid="auth-callback">
      Signing you in…
    </div>
  );
}
