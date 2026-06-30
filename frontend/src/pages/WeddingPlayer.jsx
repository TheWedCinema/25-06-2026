import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, ArrowLeft, Tv, Share2, Check, Upload, Image as ImageIcon, Film
} from "lucide-react";
import { BRAND_STRAPLINE } from "@/constants/brand";
import PinGate from "@/pages/wedding/PinGate";
import ProfileSelect from "@/pages/wedding/ProfileSelect";
import PlayerOverlay from "@/pages/wedding/PlayerOverlay";
import TvModal from "@/pages/wedding/TvModal";
import ContentRow from "@/pages/wedding/ContentRow";
import PhotoVault from "@/pages/wedding/PhotoVault";
import StudioCard from "@/pages/wedding/StudioCard";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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
    } catch {
      /* clipboard API blocked — non-critical */
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
