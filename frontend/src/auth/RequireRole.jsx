import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";

/**
 * Gate a route to one or more roles. Falls back to /login when unauthenticated,
 * to / (home) when authenticated but role mismatch.
 */
export default function RequireRole({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-zinc-500 font-sans-twc text-xs uppercase tracking-[0.3em]" data-testid="role-loading">Checking access…</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (!roles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-6" data-testid="role-denied">
        <div>
          <p className="font-serif-twc text-5xl text-[#FDFBF7]">403</p>
          <p className="font-sans-twc text-zinc-400 mt-4">Your role ({user.role}) doesn&apos;t have access to this page.</p>
          <a href="/" className="inline-block mt-8 text-[#D4AF37] hover:text-[#F3E5AB] font-sans-twc text-xs uppercase tracking-[0.22em]">Back home</a>
        </div>
      </div>
    );
  }
  return children;
}
