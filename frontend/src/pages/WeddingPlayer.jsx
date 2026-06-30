import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, ArrowLeft, Lock, Tv, X, Share2, Download, Check, Phone,
  MessageCircle, Upload, ChevronRight, Image as ImageIcon, Film, Settings
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const BRAND_STRAPLINE = "Built by Wedding Filmmakers. Designed for Real Wedding Problems. Powered by The Wed Cinema™.";

/* ───────────────────────── PIN Gate ───────────────────────── */
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

/* ───────────────────────── Profile Selector ───────────────────────── */
function ProfileSelect({ wedding, onSelect }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16" data-testid="profile-select">
      <p className="font-sans-twc text-[11px] uppercase tracking-[0.3em] text-[#D4AF37] mb-4">{wedding.studio_initials} {wedding.studio}</p>
      <h1 className="font-serif-twc text-5xl md:text-6xl text-[#FDFBF7] tracking-tight">Who's watching?</h1>
      <div className="mt-16 flex flex-wrap items-start justify-center gap-10 md:gap-16">
        {wedding.profiles.map((p, i) => (
          <motion.button
            key={p.id}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.6 }}
            onClick={() => onSelect(p)}
            className="group text-center"
            data-testid={`profile-${p.id}`}
          >
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-md overflow-hidden border border-white/10 group-hover:border-[#D4AF37] transition-colors duration-300">
              <img src={p.avatar} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <p className="font-sans-twc text-sm text-zinc-400 group-hover:text-white mt-4 tracking-wide transition-colors">{p.name}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── Player Overlay ───────────────────────── */
function PlayerOverlay({ src, title, onClose }) {
  const videoRef = useRef(null);
  const [quality, setQuality] = useState("Auto / 4K");
  const qualities = ["Auto / 4K", "2K HD", "1080p", "720p"];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", handler); };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-black"
      data-testid="player-overlay"
    >
      <div className="absolute top-5 left-6 right-6 z-10 flex items-center justify-between">
        <button onClick={onClose} className="text-zinc-300 hover:text-white inline-flex items-center gap-2 font-sans-twc text-xs uppercase tracking-[0.22em]" data-testid="player-close">
          <ArrowLeft size={16} /> Back
        </button>
        <p className="font-sans-twc text-xs uppercase tracking-[0.3em] text-zinc-400" data-testid="player-title">{title}</p>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <button className="text-zinc-300 hover:text-white inline-flex items-center gap-2 font-sans-twc text-xs uppercase tracking-[0.22em]" data-testid="player-quality">
              <Settings size={14} /> {quality}
            </button>
            <div className="absolute right-0 top-full mt-2 bg-black/90 backdrop-blur border border-white/10 rounded-sm py-2 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all min-w-[140px]">
              {qualities.map((q) => (
                <button key={q} onClick={() => setQuality(q)} className={`block w-full text-left px-4 py-2 text-xs font-sans-twc uppercase tracking-[0.18em] ${q === quality ? "text-[#D4AF37]" : "text-zinc-300 hover:text-white"}`} data-testid={`quality-${q.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`}>
                  {q}
                </button>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-300 hover:text-white" data-testid="player-x"><X size={20} /></button>
        </div>
      </div>
      <video ref={videoRef} src={src} autoPlay controls playsInline className="w-full h-full object-contain bg-black" data-testid="player-video" />
    </motion.div>
  );
}

/* ───────────────────────── Watch on TV Modal ───────────────────────── */
function TvModal({ open, onClose }) {
  const [code] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" data-testid="tv-modal">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-md p-8 md:p-12 text-center">
        <button onClick={onClose} className="absolute top-4 right-5 text-zinc-500 hover:text-white text-2xl" data-testid="tv-close">×</button>
        <Tv size={28} className="text-[#D4AF37] mx-auto mb-6" strokeWidth={1.4} />
        <p className="font-sans-twc text-[11px] uppercase tracking-[0.3em] text-[#D4AF37] mb-3">Watch on TV</p>
        <h3 className="font-serif-twc text-4xl text-[#FDFBF7] tracking-tight">Connect your phone<br /><span className="italic text-zinc-400">to your Smart TV.</span></h3>
        <p className="font-sans-twc text-sm text-zinc-400 mt-6">Open <span className="text-[#FDFBF7]">watch.wedcinema.com</span> on your TV browser and enter:</p>
        <div className="mt-6 border border-[#D4AF37]/40 bg-[#1a1410] rounded-sm py-6 px-4">
          <p className="font-serif-twc text-5xl md:text-6xl text-[#FDFBF7] tracking-[0.18em]" data-testid="tv-code">{code}</p>
        </div>
        <p className="font-sans-twc text-[10px] uppercase tracking-[0.28em] text-zinc-500 mt-8">— Or cast directly —</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {["Chromecast", "AirPlay", "Apple TV"].map((c) => (
            <button key={c} className="border border-white/15 hover:bg-white/10 text-zinc-300 font-sans-twc text-[11px] uppercase tracking-[0.22em] px-4 py-2 rounded-sm transition" data-testid={`cast-${c.toLowerCase().replace(/\s+/g, '-')}`}>{c}</button>
          ))}
        </div>
        <p className="font-sans-twc text-[10px] uppercase tracking-[0.28em] text-zinc-600 mt-8">Your phone becomes the remote · Swipe horizontal: seek · Swipe vertical: volume</p>
      </div>
    </div>
  );
}

/* ───────────────────────── OTT Content Rows ───────────────────────── */
function ContentCard({ item, onPlay, share }) {
  return (
    <button onClick={() => onPlay(item)} className="ott-card text-left group rounded-md overflow-hidden border border-white/10 bg-white/[0.02] hover:border-[#D4AF37]/40 transition-all duration-500 flex-shrink-0 w-72 md:w-80" data-testid={`content-${item.id}`}>
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={item.thumb} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="w-14 h-14 rounded-full bg-[#D4AF37] flex items-center justify-center">
            <Play size={20} fill="black" className="text-black ml-0.5" />
          </div>
        </div>
        <span className="absolute top-3 right-3 bg-black/60 backdrop-blur px-2 py-1 rounded font-sans-twc text-[10px] uppercase tracking-wider text-zinc-200">{item.duration}</span>
      </div>
      <div className="p-5">
        <h3 className="font-serif-twc text-xl text-[#FDFBF7] mb-1">{item.title}</h3>
        <p className="font-sans-twc text-xs text-zinc-400 leading-relaxed">{item.synopsis}</p>
        {share && (
          <span className="mt-3 inline-flex items-center gap-2 text-[#D4AF37] font-sans-twc text-[10px] uppercase tracking-[0.28em]">
            <Share2 size={12} /> Get Reel
          </span>
        )}
      </div>
    </button>
  );
}

function ContentRow({ row, onPlay }) {
  return (
    <section className="py-10" data-testid={`row-${row.id}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <h2 className="font-serif-twc text-3xl md:text-4xl text-[#FDFBF7] tracking-tight">{row.title}</h2>
          {row.share && (
            <span className="font-sans-twc text-[10px] uppercase tracking-[0.28em] text-zinc-500 inline-flex items-center gap-2">
              <Share2 size={12} className="text-[#D4AF37]" /> Share on Instagram
            </span>
          )}
        </div>
        <div className="flex gap-5 overflow-x-auto pb-4 ott-row -mx-6 md:-mx-12 px-6 md:px-12 snap-x">
          {row.items.map((item) => (
            <div key={item.id} className="snap-start">
              <ContentCard item={item} onPlay={onPlay} share={row.share} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Photo Vault ───────────────────────── */
function PhotoVault({ photos }) {
  return (
    <section className="py-12" data-testid="photo-vault">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="font-sans-twc text-[11px] uppercase tracking-[0.3em] text-[#D4AF37] mb-3">The Photo Vault</p>
            <h2 className="font-serif-twc text-4xl md:text-5xl text-[#FDFBF7] tracking-tight">High-resolution<br /><span className="italic text-zinc-400">memories.</span></h2>
          </div>
          <button className="bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-sans-twc text-xs uppercase tracking-[0.22em] px-5 py-3 rounded-sm transition inline-flex items-center gap-2" data-testid="vault-download-all">
            <Download size={14} /> Download All
          </button>
        </div>
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {photos.map((src, i) => (
            <div key={i} className="break-inside-avoid overflow-hidden rounded-md group cursor-zoom-in" data-testid={`photo-${i}`}>
              <img src={src} alt="" loading="lazy" className="w-full h-auto transition-transform duration-700 group-hover:scale-105" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Studio Card ───────────────────────── */
function StudioCard({ wedding }) {
  return (
    <section className="py-16 border-t border-white/5" data-testid="studio-card">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="font-sans-twc text-[11px] uppercase tracking-[0.3em] text-[#D4AF37] mb-3">{wedding.studio_tagline}</p>
          <div className="flex items-baseline gap-4">
            <span className="font-serif-twc text-6xl text-[#D4AF37]">{wedding.studio_initials}</span>
            <p className="font-serif-twc text-3xl text-[#FDFBF7]">{wedding.studio}</p>
          </div>
          <p className="font-sans-twc text-zinc-400 leading-relaxed mt-5 max-w-md">Capturing moments that turn into lifelong memories. Powered by cutting-edge cinema tech.</p>
        </div>
        <div className="flex flex-wrap gap-3 md:justify-end">
          <button className="bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-sans-twc text-xs uppercase tracking-[0.22em] px-5 py-3 rounded-sm transition inline-flex items-center gap-2" data-testid="studio-chat">
            <MessageCircle size={14} /> Chat with us
          </button>
          <a href="tel:+919876543210" className="border border-white/20 hover:bg-white/10 text-white font-sans-twc text-xs uppercase tracking-[0.22em] px-5 py-3 rounded-sm transition inline-flex items-center gap-2" data-testid="studio-call">
            <Phone size={14} /> Call Studio
          </a>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Main Wedding Player ───────────────────────── */
function WeddingPlayer() {
  const { slug } = useParams();
  const [meta, setMeta] = useState(null);
  const [wedding, setWedding] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [playing, setPlaying] = useState(null);
  const [tvOpen, setTvOpen] = useState(false);
  const [tab, setTab] = useState("cinema");
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
    } catch (e) { console.error("clipboard failed", e); }
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
  if (!meta) return <div className="min-h-screen flex items-center justify-center text-zinc-500 font-sans-twc text-xs uppercase tracking-[0.3em]" data-testid="wedding-loading">Loading the cinema…</div>;
  if (!wedding) return <PinGate meta={meta} onUnlock={setWedding} />;
  if (!profile) return <ProfileSelect wedding={wedding} onSelect={setProfile} />;

  const trailerItem = { id: "trailer", title: "Trailer", url: wedding.trailer_url };
  const firstFeature = wedding.rows[0].items[0];

  return (
    <div className="min-h-screen bg-black" data-testid="ott-experience">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-30 backdrop-blur-md bg-black/50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3" data-testid="ott-brand">
            <span className="font-serif-twc text-2xl text-[#D4AF37]">{wedding.studio_initials}</span>
            <span className="hidden md:inline font-sans-twc text-[11px] uppercase tracking-[0.28em] text-zinc-400">{wedding.studio}</span>
          </Link>
          <div className="flex items-center gap-1 md:gap-2 text-xs font-sans-twc uppercase tracking-[0.22em]">
            <button onClick={() => setTab("cinema")} className={`px-3 md:px-4 py-2 rounded-sm transition inline-flex items-center gap-2 ${tab === "cinema" ? "text-[#FDFBF7]" : "text-zinc-500 hover:text-white"}`} data-testid="tab-cinema">
              <Film size={14} /> Cinema
            </button>
            <button onClick={() => setTab("photos")} className={`px-3 md:px-4 py-2 rounded-sm transition inline-flex items-center gap-2 ${tab === "photos" ? "text-[#FDFBF7]" : "text-zinc-500 hover:text-white"}`} data-testid="tab-photos">
              <ImageIcon size={14} /> Photos
            </button>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <button onClick={handleShare} className="hidden md:inline-flex text-zinc-300 hover:text-white items-center gap-2 font-sans-twc text-xs uppercase tracking-[0.22em] transition" data-testid="ott-share">
              {copied ? <><Check size={14} className="text-[#D4AF37]" /> Copied</> : <><Share2 size={14} /> Share</>}
            </button>
            <button onClick={() => setTvOpen(true)} className="text-zinc-300 hover:text-white inline-flex items-center gap-2 font-sans-twc text-xs uppercase tracking-[0.22em] transition" data-testid="ott-cast">
              <Tv size={14} /> <span className="hidden md:inline">Cast to TV</span>
            </button>
            <div className="flex items-center gap-2" data-testid="ott-profile-pill">
              <img src={profile.avatar} alt={profile.name} className="w-7 h-7 rounded-sm object-cover border border-white/10" />
              <span className="hidden lg:inline font-sans-twc text-[11px] uppercase tracking-[0.22em] text-zinc-400">{profile.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative h-screen min-h-[640px] w-full overflow-hidden" data-testid="ott-hero">
        <div className="absolute inset-0">
          <img src={wedding.poster_image} alt={wedding.couple} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        </div>
        <div className="relative h-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-end pb-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4" data-testid="ott-badges">
              <span className="font-sans-twc text-[10px] uppercase tracking-[0.28em] text-[#D4AF37] border border-[#D4AF37]/40 px-2 py-1 rounded-sm">Live Premiere</span>
              <span className="font-sans-twc text-[10px] uppercase tracking-[0.28em] text-zinc-300 border border-white/15 px-2 py-1 rounded-sm">4K HDR</span>
              <span className="font-sans-twc text-[10px] uppercase tracking-[0.28em] text-zinc-300 border border-white/15 px-2 py-1 rounded-sm">DRM Protected</span>
            </div>
            <p className="font-sans-twc text-[11px] uppercase tracking-[0.3em] text-[#D4AF37] mb-3" data-testid="ott-studio">{wedding.studio} presents</p>
            <h1 className="font-serif-twc text-6xl md:text-8xl text-[#FDFBF7] tracking-tighter leading-[0.92]" data-testid="ott-couple">{wedding.couple}</h1>
            <p className="font-sans-twc text-xs uppercase tracking-[0.28em] text-zinc-400 mt-4">{wedding.date} · {wedding.venue}</p>
            <p className="font-sans-twc text-base md:text-lg text-zinc-300 leading-relaxed mt-6 max-w-xl" data-testid="ott-logline">{wedding.logline}</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <button onClick={() => setPlaying(firstFeature)} className="bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-sans-twc font-medium px-8 py-4 rounded-sm tracking-wide transition-colors inline-flex items-center gap-2" data-testid="ott-play-film">
                <Play size={18} fill="currentColor" /> Play Film
              </button>
              <button onClick={() => setPlaying(trailerItem)} className="bg-white/5 hover:bg-white/10 border border-white/20 backdrop-blur-md text-white font-sans-twc font-medium px-8 py-4 rounded-sm tracking-wide transition-colors inline-flex items-center gap-2" data-testid="ott-play-trailer">
                <Play size={16} /> Play Trailer
              </button>
              <button onClick={() => setTvOpen(true)} className="border border-white/20 hover:bg-white/10 text-white font-sans-twc font-medium px-8 py-4 rounded-sm tracking-wide transition inline-flex items-center gap-2" data-testid="ott-watch-tv">
                <Tv size={16} /> Watch on TV
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Body — Cinema vs Photos */}
      {tab === "cinema" ? (
        <>
          <div className="pt-6">
            {wedding.rows.map((row) => <ContentRow key={row.id} row={row} onPlay={setPlaying} />)}
          </div>

          {/* Guest Upload */}
          <section className="py-12" data-testid="guest-upload-section">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
              <div className="border border-dashed border-white/15 hover:border-[#D4AF37]/50 transition rounded-md p-10 md:p-14 text-center bg-white/[0.02]">
                <Upload size={28} className="text-[#D4AF37] mx-auto mb-5" strokeWidth={1.4} />
                <h3 className="font-serif-twc text-3xl text-[#FDFBF7] tracking-tight">Share your memories</h3>
                <p className="font-sans-twc text-sm text-zinc-400 mt-3 max-w-md mx-auto">Upload your best photos & videos. Subject to photographer approval.</p>
                <button className="mt-6 bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-sans-twc text-xs uppercase tracking-[0.22em] px-5 py-3 rounded-sm transition inline-flex items-center gap-2" data-testid="guest-upload-btn">
                  <Upload size={14} /> Guest Upload
                </button>
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className="pt-6"><PhotoVault photos={wedding.photos} /></div>
      )}

      <StudioCard wedding={wedding} />

      {/* Brand strapline */}
      <footer className="border-t border-white/5 py-10" data-testid="ott-footer">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <p className="font-sans-twc text-[11px] uppercase tracking-[0.28em] text-zinc-500" data-testid="brand-strapline">{BRAND_STRAPLINE}</p>
        </div>
      </footer>

      <AnimatePresence>
        {playing && <PlayerOverlay src={playing.url} title={playing.title} onClose={() => setPlaying(null)} />}
      </AnimatePresence>
      <TvModal open={tvOpen} onClose={() => setTvOpen(false)} />
    </div>
  );
}

export default WeddingPlayer;
