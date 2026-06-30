import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ArrowLeft, Lock, Tv, Volume2, Maximize, X, Share2, Download, Check } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function PinGate({ meta, onUnlock }) {
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
    } finally {
      setLoading(false);
    }
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
        <p className="font-sans-twc text-sm text-zinc-400 mt-4 leading-relaxed">{meta.episode_count} episodes · {meta.date}<br />{meta.venue}</p>

        <form onSubmit={submit} className="mt-12 space-y-6" data-testid="pin-form">
          <p className="font-sans-twc text-xs uppercase tracking-[0.28em] text-zinc-500">Enter the 4-digit PIN to begin</p>
          <input
            type="text"
            inputMode="numeric"
            maxLength={8}
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="• • • •"
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

function PlayerOverlay({ src, title, onClose }) {
  const videoRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", handler); };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] bg-black" data-testid="player-overlay">
      <div className="absolute top-5 left-6 right-6 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-zinc-300 hover:text-white inline-flex items-center gap-2 font-sans-twc text-xs uppercase tracking-[0.22em]" data-testid="player-close">
            <ArrowLeft size={16} /> Back
          </button>
        </div>
        <p className="font-sans-twc text-xs uppercase tracking-[0.3em] text-zinc-400" data-testid="player-title">{title}</p>
        <button onClick={onClose} className="text-zinc-300 hover:text-white" data-testid="player-x"><X size={20} /></button>
      </div>
      <video
        ref={videoRef}
        src={src}
        autoPlay
        controls
        playsInline
        className="w-full h-full object-contain bg-black"
        data-testid="player-video"
      />
    </div>
  );
}

function WeddingPlayer() {
  const { slug } = useParams();
  const [meta, setMeta] = useState(null);
  const [wedding, setWedding] = useState(null);
  const [error, setError] = useState(null);
  const [playing, setPlaying] = useState(null); // {url, title}
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API}/weddings/${slug}/meta`);
        setMeta(data);
      } catch (e) {
        setError(e.response?.status === 404 ? "Wedding not found" : "Unable to load");
      }
    })();
  }, [slug]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("clipboard failed", e);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-6" data-testid="wedding-error">
        <div>
          <p className="font-serif-twc text-5xl text-[#FDFBF7]">404</p>
          <p className="font-sans-twc text-zinc-400 mt-4">{error}</p>
          <Link to="/" className="inline-flex items-center gap-2 mt-8 text-[#D4AF37] hover:text-[#F3E5AB] font-sans-twc text-xs uppercase tracking-[0.22em]">
            <ArrowLeft size={14} /> Back home
          </Link>
        </div>
      </div>
    );
  }

  if (!meta) {
    return <div className="min-h-screen flex items-center justify-center text-zinc-500 font-sans-twc text-xs uppercase tracking-[0.3em]" data-testid="wedding-loading">Loading the cinema…</div>;
  }

  if (!wedding) {
    return <PinGate meta={meta} onUnlock={setWedding} />;
  }

  // Unlocked OTT experience
  return (
    <div className="min-h-screen bg-black" data-testid="ott-experience">
      {/* Top utility bar */}
      <div className="fixed top-0 left-0 right-0 z-30 backdrop-blur-md bg-black/40 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" data-testid="ott-brand">
            <span className="font-serif-twc text-xl text-[#FDFBF7]">The Wed <span className="text-[#D4AF37] italic">Cinema</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <button onClick={handleShare} className="text-zinc-300 hover:text-white inline-flex items-center gap-2 font-sans-twc text-xs uppercase tracking-[0.22em] transition" data-testid="ott-share">
              {copied ? <><Check size={14} className="text-[#D4AF37]" /> Link Copied</> : <><Share2 size={14} /> Share</>}
            </button>
            <button className="text-zinc-300 hover:text-white inline-flex items-center gap-2 font-sans-twc text-xs uppercase tracking-[0.22em] transition" data-testid="ott-cast">
              <Tv size={14} /> Cast to TV
            </button>
          </div>
        </div>
      </div>

      {/* Cinematic hero */}
      <section className="relative h-screen min-h-[640px] w-full overflow-hidden" data-testid="ott-hero">
        <div className="absolute inset-0">
          <img src={wedding.poster_image} alt={wedding.couple} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        </div>
        <div className="relative h-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-end pb-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} className="max-w-2xl">
            <p className="font-sans-twc text-[11px] uppercase tracking-[0.3em] text-[#D4AF37] mb-4" data-testid="ott-studio">{wedding.studio} presents</p>
            <h1 className="font-serif-twc text-6xl md:text-8xl text-[#FDFBF7] tracking-tighter leading-[0.92]" data-testid="ott-couple">{wedding.couple}</h1>
            <p className="font-sans-twc text-xs uppercase tracking-[0.28em] text-zinc-400 mt-4">{wedding.date} · {wedding.venue}</p>
            <p className="font-sans-twc text-base md:text-lg text-zinc-300 leading-relaxed mt-6 max-w-xl">{wedding.logline}</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <button onClick={() => setPlaying({ url: wedding.trailer_url, title: "Trailer" })} className="bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-sans-twc font-medium px-8 py-4 rounded-sm tracking-wide transition-colors inline-flex items-center gap-2" data-testid="ott-play-trailer">
                <Play size={18} fill="currentColor" /> Play Trailer
              </button>
              <button onClick={() => setPlaying({ url: wedding.episodes[0].url, title: wedding.episodes[0].title })} className="bg-white/5 hover:bg-white/10 border border-white/20 backdrop-blur-md text-white font-sans-twc font-medium px-8 py-4 rounded-sm tracking-wide transition-colors inline-flex items-center gap-2" data-testid="ott-start-watching">
                Start from Episode 1
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Episodes */}
      <section className="py-20 md:py-28 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
            <h2 className="font-serif-twc text-4xl md:text-5xl text-[#FDFBF7] tracking-tight">Episodes</h2>
            <p className="font-sans-twc text-xs uppercase tracking-[0.28em] text-zinc-500">{wedding.episodes.length} chapters · 4K HLS</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 ott-row">
            {wedding.episodes.map((e, i) => (
              <button
                key={e.id}
                onClick={() => setPlaying({ url: e.url, title: e.title })}
                className="ott-card text-left group rounded-md overflow-hidden border border-white/10 bg-white/[0.02] hover:border-[#D4AF37]/40 transition-all duration-500"
                data-testid={`ott-episode-${i}`}
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={e.thumb} alt={e.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="w-14 h-14 rounded-full bg-[#D4AF37] flex items-center justify-center">
                      <Play size={20} fill="black" className="text-black ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute top-3 right-3 bg-black/60 backdrop-blur px-2 py-1 rounded font-sans-twc text-[10px] uppercase tracking-wider text-zinc-200">{e.duration}</span>
                </div>
                <div className="p-5">
                  <p className="font-sans-twc text-[10px] uppercase tracking-[0.28em] text-[#D4AF37] mb-1">Episode {String(i + 1).padStart(2, "0")}</p>
                  <h3 className="font-serif-twc text-2xl text-[#FDFBF7] mb-2">{e.title}</h3>
                  <p className="font-sans-twc text-sm text-zinc-400 leading-relaxed">{e.synopsis}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Studio footer / branding */}
      <section className="py-20 bg-black border-t border-white/5" data-testid="ott-studio-footer">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="font-sans-twc text-[11px] uppercase tracking-[0.3em] text-[#D4AF37] mb-2">Filmed by</p>
            <p className="font-serif-twc text-3xl text-[#FDFBF7]">{wedding.studio}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="border border-white/20 hover:bg-white/10 text-white font-sans-twc text-xs uppercase tracking-[0.22em] px-6 py-3 rounded-sm transition" data-testid="ott-book-studio">Book {wedding.studio} for your wedding</button>
            <button className="border border-white/10 hover:bg-white/5 text-zinc-300 font-sans-twc text-xs uppercase tracking-[0.22em] px-6 py-3 rounded-sm transition inline-flex items-center gap-2" data-testid="ott-download">
              <Download size={14} /> Download 4K
            </button>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {playing && <PlayerOverlay src={playing.url} title={playing.title} onClose={() => setPlaying(null)} />}
      </AnimatePresence>
    </div>
  );
}

export default WeddingPlayer;
