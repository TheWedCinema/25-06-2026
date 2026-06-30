import { useState } from "react";
import { Link } from "react-router-dom";
import { Lock, ArrowLeft } from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function PinGate({ meta, onUnlock }) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const { data } = await axios.post(`${API}/weddings/${meta.slug}/unlock`, { pin });
      onUnlock(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to unlock");
    } finally { setLoading(false); }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6" data-testid="pin-gate">
      <div className="absolute inset-0">
        <img src={meta.poster_image} alt="" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/85 to-black" />
      </div>
      <div className="relative w-full max-w-md text-center">
        <Lock size={28} className="text-[#D4AF37] mx-auto mb-6" strokeWidth={1.4} />
        <p className="font-sans-twc text-[11px] uppercase tracking-[0.3em] text-[#D4AF37] mb-4">{meta.studio} presents</p>
        <h1 className="font-serif-twc text-5xl md:text-6xl text-[#FDFBF7] tracking-tight leading-[0.95]">{meta.couple}</h1>
        <p className="font-sans-twc text-sm text-zinc-400 mt-4 leading-relaxed">{meta.date}<br />{meta.venue}</p>

        <form onSubmit={submit} className="mt-12 space-y-6" data-testid="pin-form">
          <p className="font-sans-twc text-xs uppercase tracking-[0.28em] text-zinc-500">Enter the 4-digit PIN to begin</p>
          <input
            type="text" inputMode="numeric" maxLength={8} autoFocus
            value={pin} onChange={(e) => setPin(e.target.value)} placeholder="• • • •"
            className="block mx-auto text-center bg-transparent border-b border-white/20 focus:border-[#D4AF37] outline-none text-[#FDFBF7] font-serif-twc text-4xl tracking-[0.6em] py-3 w-56 transition-colors"
            data-testid="pin-input"
          />
          {error && <p className="text-red-400 font-sans-twc text-xs uppercase tracking-wider" data-testid="pin-error">{error}</p>}
          <button type="submit" disabled={loading || pin.length < 4} className="bg-[#D4AF37] hover:bg-[#F3E5AB] disabled:opacity-50 text-black font-sans-twc font-medium px-8 py-3 rounded-sm tracking-wide transition-colors inline-flex items-center gap-2" data-testid="pin-submit">
            {loading ? "Unlocking..." : "Enter the Cinema"}
          </button>
          <p className="font-sans-twc text-[10px] uppercase tracking-[0.3em] text-zinc-600 pt-4" data-testid="demo-pin-hint">Demo PIN: 1234</p>
        </form>

        <Link to="/" className="inline-flex items-center gap-2 mt-12 text-zinc-500 hover:text-white font-sans-twc text-xs uppercase tracking-[0.22em] transition" data-testid="pin-back">
          <ArrowLeft size={14} /> Back to The Wed Cinema
        </Link>
      </div>
    </div>
  );
}
