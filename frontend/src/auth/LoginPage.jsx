import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
const startGoogleLogin = () => {
  const redirectUrl = window.location.origin + "/auth/callback";
  window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
};

export default function LoginPage() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate("/studio", { replace: true });
  }, [loading, user, navigate]);

  const errorMsg = location.state?.error;

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6" data-testid="login-page">
      <div className="absolute inset-0">
        <img src="https://images.pexels.com/photos/34172822/pexels-photo-34172822.jpeg" alt="" className="w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/85 to-black" />
      </div>
      <div className="relative w-full max-w-md text-center">
        <Lock size={28} className="text-[#D4AF37] mx-auto mb-6" strokeWidth={1.4} />
        <p className="font-sans-twc text-[11px] uppercase tracking-[0.3em] text-[#D4AF37] mb-4">Studio Sign-In</p>
        <h1 className="font-serif-twc text-5xl md:text-6xl text-[#FDFBF7] tracking-tight leading-[0.95]">
          Enter your<br /><span className="italic text-zinc-400">Cinema OS.</span>
        </h1>
        <p className="font-sans-twc text-sm text-zinc-400 mt-6 leading-relaxed max-w-sm mx-auto">
          One-click sign-in with Google. No passwords, no friction. The Wed Cinema doesn&apos;t see your password.
        </p>

        {errorMsg && <p className="mt-6 text-red-400 font-sans-twc text-xs uppercase tracking-wider" data-testid="login-error">{errorMsg}</p>}

        <button
          onClick={startGoogleLogin}
          className="mt-10 w-full bg-[#FDFBF7] hover:bg-white text-black font-sans-twc font-medium px-6 py-4 rounded-sm tracking-wide transition-colors inline-flex items-center justify-center gap-3"
          data-testid="login-google-btn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z" />
          </svg>
          Sign in with Google
        </button>

        <p className="mt-8 font-sans-twc text-[10px] uppercase tracking-[0.28em] text-zinc-600">
          By signing in you agree to be cinematic about wedding delivery.
        </p>

        <Link to="/" className="inline-flex items-center gap-2 mt-12 text-zinc-500 hover:text-white font-sans-twc text-xs uppercase tracking-[0.22em] transition" data-testid="login-back">
          <ArrowLeft size={14} /> Back to The Wed Cinema
        </Link>
      </div>
    </div>
  );
}
