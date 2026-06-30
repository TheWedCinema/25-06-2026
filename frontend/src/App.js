import { useCallback, useEffect, useState } from "react";
import "@/App.css";
import axios from "axios";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Play, Tv, Film, Users, ScanFace, QrCode, Sparkles, Shield,
  Cloud, Check, Instagram, Star, ArrowRight, Zap
} from "lucide-react";
import WeddingPlayer from "@/pages/WeddingPlayer";
import StudioOS from "@/pages/StudioOS";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

function Nav({ onApply }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-black/40 border-b border-white/5" data-testid="main-nav">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-3" data-testid="nav-brand">
          <span className="font-serif-twc text-2xl tracking-tight text-[#FDFBF7]">The Wed <span className="text-[#D4AF37] italic">Cinema</span></span>
        </a>
        <div className="hidden md:flex items-center gap-10 text-sm font-sans-twc tracking-wide text-zinc-400">
          <a href="#problem" className="hover:text-white transition" data-testid="nav-problem">Problem</a>
          <a href="#features" className="hover:text-white transition" data-testid="nav-features">Platform</a>
          <a href="/w/aanya-vikram" className="hover:text-white transition" data-testid="nav-ott">OTT Demo</a>
          <a href="/studio" className="hover:text-white transition" data-testid="nav-studio">Studio OS</a>
          <a href="#pricing" className="hover:text-white transition" data-testid="nav-pricing">Pricing</a>
        </div>
        <button onClick={onApply} className="bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-sans-twc font-medium text-xs uppercase tracking-[0.18em] px-5 py-3 rounded-sm transition-colors" data-testid="nav-apply-btn">
          Apply – Founders
        </button>
      </div>
    </nav>
  );
}

function Hero({ onApply, remaining }) {
  return (
    <section id="top" className="relative h-screen min-h-[720px] w-full overflow-hidden" data-testid="hero-section">
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/34172822/pexels-photo-34172822.jpeg"
          alt="Cinematic wedding"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-overlay" />
      </div>

      <div className="relative h-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-end pb-24 md:pb-32">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-4xl">
          <motion.p variants={fadeUp} className="font-sans-twc text-[11px] md:text-xs uppercase tracking-[0.32em] text-[#D4AF37] mb-6">
            India's First Wedding OTT Platform
          </motion.p>
          <motion.h1 variants={fadeUp} className="font-serif-twc text-[56px] leading-[0.95] md:text-[96px] lg:text-[120px] md:leading-[0.92] text-[#FDFBF7] tracking-tighter">
            Deliver weddings<br />
            <span className="italic text-[#D4AF37]">like Netflix.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-8 max-w-2xl font-sans-twc text-base md:text-lg text-zinc-300 leading-relaxed">
            Photos. 4K films. AI galleries. One-click TV. A single cinematic link replaces every hard drive, pen-drive and WeTransfer link you've ever sent.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col sm:flex-row gap-4">
            <button onClick={onApply} className="bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-sans-twc font-medium px-8 py-4 rounded-sm tracking-wide transition-colors inline-flex items-center justify-center gap-2 group" data-testid="hero-cta-apply">
              Book a Live Demo
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <a href="/w/aanya-vikram" className="bg-white/5 hover:bg-white/10 border border-white/20 backdrop-blur-md text-white font-sans-twc font-medium px-8 py-4 rounded-sm tracking-wide transition-colors inline-flex items-center justify-center gap-2" data-testid="hero-cta-watch">
              <Play size={16} fill="currentColor" /> Watch Demo Wedding
            </a>
          </motion.div>
          {remaining !== null && (
            <motion.p variants={fadeUp} className="mt-10 font-sans-twc text-xs uppercase tracking-[0.28em] text-zinc-500" data-testid="hero-spots">
              <span className="text-[#D4AF37]">●</span> {remaining} of 100 founding studio spots remaining
            </motion.p>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function TrustBadges() {
  const badges = [
    { icon: Film, label: "4K HLS Streaming" },
    { icon: Cloud, label: "50GB+ Uploads" },
    { icon: ScanFace, label: "AI Face Search" },
    { icon: Tv, label: "One-Click TV" },
    { icon: Shield, label: "PIN Secured" },
  ];
  return (
    <section className="border-y border-white/5 bg-black py-8" data-testid="trust-badges">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-5 gap-y-6 gap-x-8">
        {badges.map((b) => (
          <div key={b.label} className="flex items-center gap-3 opacity-60 hover:opacity-100 transition" data-testid={`trust-badge-${b.label.toLowerCase().replace(/\s+/g, '-')}`}>
            <b.icon size={18} className="text-[#D4AF37]" />
            <span className="font-sans-twc text-[10px] md:text-xs uppercase tracking-[0.22em] text-zinc-300">{b.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Problem() {
  const pains = [
    "Hard drives die. Pen-drives get lost.",
    "4K films are too big to share on WhatsApp.",
    "Families can't watch the film on their TV.",
    "Clients lose access. Photographers lose their brand.",
  ];
  return (
    <section id="problem" className="py-28 md:py-40 bg-black" data-testid="problem-section">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-5">
          <p className="font-sans-twc text-xs uppercase tracking-[0.3em] text-[#D4AF37] mb-6">The Industry's Open Secret</p>
          <h2 className="font-serif-twc text-5xl md:text-6xl lg:text-7xl leading-[0.95] text-[#FDFBF7] tracking-tight">
            Wedding<br />
            delivery<br />
            <span className="italic text-zinc-500">is broken.</span>
          </h2>
        </div>
        <motion.ul initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="md:col-span-7 md:pt-4 space-y-8">
          {pains.map((p) => (
            <motion.li key={p} variants={fadeUp} className="border-b border-white/10 pb-6" data-testid="pain-point">
              <p className="font-serif-twc text-2xl md:text-3xl text-[#FDFBF7] leading-snug">{p}</p>
            </motion.li>
          ))}
          <motion.p variants={fadeUp} className="font-sans-twc text-lg text-zinc-400 leading-relaxed pt-4 italic">
            Your client spent lakhs on the wedding. Don't make them watch it on a pen drive.
          </motion.p>
        </motion.ul>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: ScanFace, title: "AI Face Search", body: "Guests upload a selfie. AI instantly finds every photo of them across the wedding.", span: 2 },
    { icon: Film, title: "Wedding OTT", body: "Episodic timeline — Haldi, Mehndi, Sangeet, Ceremony, Highlights." },
    { icon: Tv, title: "One-Click TV Cast", body: "Chromecast, AirPlay, Android TV. No cables, no setup." },
    { icon: QrCode, title: "QR Share", body: "Branded QR code at the venue — guests scan & download instantly." },
    { icon: Sparkles, title: "AI Trailers", body: "Auto-generated highlight reels & anniversary films from your raw footage.", span: 2 },
    { icon: Cloud, title: "50GB+ Uploads", body: "Resumable multipart uploads on S3. No more failed transfers." },
    { icon: Users, title: "Photographer Branding", body: "Your logo on the intro trailer. Your CTA on every screen." },
    { icon: Shield, title: "PIN-Protected", body: "Token auth + signed CDN URLs. GDPR-ready by default." },
  ];
  return (
    <section id="features" className="py-28 md:py-40 bg-black border-t border-white/5" data-testid="features-section">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="md:grid md:grid-cols-12 gap-12 mb-20">
          <div className="md:col-span-7">
            <p className="font-sans-twc text-xs uppercase tracking-[0.3em] text-[#D4AF37] mb-6">The Platform</p>
            <h2 className="font-serif-twc text-5xl md:text-6xl text-[#FDFBF7] tracking-tight leading-[0.95]">
              One platform.<br />
              <span className="italic text-zinc-400">Every wedding solution.</span>
            </h2>
          </div>
          <p className="md:col-span-5 md:pt-12 font-sans-twc text-zinc-400 leading-relaxed">
            Replace eight tools with one cinematic delivery experience — built by wedding filmmakers, designed for the way modern couples actually consume their wedding.
          </p>
        </div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger} className="grid md:grid-cols-3 gap-4 md:gap-6">
          {items.map((it) => (
            <motion.div
              key={it.title}
              variants={fadeUp}
              className={`group bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-md p-8 md:p-10 hover:border-[#D4AF37]/40 hover:bg-white/[0.04] transition-all duration-500 ${it.span === 2 ? 'md:col-span-2' : ''}`}
              data-testid={`feature-card-${it.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <it.icon size={28} className="text-[#D4AF37] mb-6" strokeWidth={1.4} />
              <h3 className="font-serif-twc text-2xl md:text-3xl text-[#FDFBF7] mb-3 tracking-tight">{it.title}</h3>
              <p className="font-sans-twc text-sm md:text-base text-zinc-400 leading-relaxed">{it.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Upload", d: "Drag-drop 4K films and thousands of photos. Resumable multipart on S3." },
    { n: "02", t: "AI Processes", d: "FFmpeg encodes 240p–4K HLS. AI tags faces, scenes & chapters." },
    { n: "03", t: "Share One Link", d: "Branded URL + PIN. Send via WhatsApp, QR or email." },
    { n: "04", t: "Client Watches", d: "Phone, laptop, or one-click to TV. Continue-watching included." },
  ];
  return (
    <section className="py-28 md:py-40 bg-black border-t border-white/5" data-testid="how-section">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <p className="font-sans-twc text-xs uppercase tracking-[0.3em] text-[#D4AF37] mb-6">The Flow</p>
        <h2 className="font-serif-twc text-5xl md:text-6xl text-[#FDFBF7] mb-20 max-w-3xl tracking-tight leading-[0.95]">
          From raw footage to <span className="italic text-zinc-400">cinema</span> in minutes.
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((s) => (
            <div key={s.n} className="relative border-t border-white/15 pt-6 group" data-testid={`step-${s.n}`}>
              <span className="absolute -top-3 left-0 font-serif-twc text-7xl md:text-8xl text-white/[0.06] leading-none select-none">{s.n}</span>
              <div className="relative">
                <h3 className="font-serif-twc text-2xl md:text-3xl text-[#FDFBF7] mb-3 mt-8">{s.t}</h3>
                <p className="font-sans-twc text-sm text-zinc-400 leading-relaxed">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OttEpisodes() {
  const episodes = [
    { title: "Haldi", duration: "08:42", url: "https://images.unsplash.com/photo-1525135850648-b42365991054" },
    { title: "Mehndi", duration: "12:18", url: "https://images.unsplash.com/photo-1505932794465-147d1f1b2c97" },
    { title: "Sangeet", duration: "15:04", url: "https://images.unsplash.com/photo-1514178703120-3fa66528901d" },
    { title: "Ceremony", duration: "22:51", url: "https://images.unsplash.com/photo-1530082625928-db66d39c5a21" },
  ];
  return (
    <section id="episodes" className="py-28 md:py-40 bg-black border-t border-white/5" data-testid="ott-section">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
          <div>
            <p className="font-sans-twc text-xs uppercase tracking-[0.3em] text-[#D4AF37] mb-6">The Wedding, Episodic</p>
            <h2 className="font-serif-twc text-5xl md:text-6xl text-[#FDFBF7] tracking-tight leading-[0.95] max-w-2xl">
              Aanya & Vikram<br /><span className="italic text-zinc-400">A cinematic series.</span>
            </h2>
          </div>
          <p className="font-sans-twc text-xs uppercase tracking-[0.22em] text-zinc-500">Episodes · 4K · HLS Adaptive</p>
        </div>

        <div className="ott-row grid md:grid-cols-4 gap-4">
          {episodes.map((e, i) => (
            <div key={e.title} className="ott-card relative aspect-[16/10] overflow-hidden rounded-md cursor-pointer transition-all duration-700 ease-out group" data-testid={`episode-${i}`}>
              <img src={e.url} alt={e.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-16 h-16 rounded-full bg-[#D4AF37] flex items-center justify-center">
                  <Play size={22} fill="black" className="text-black ml-1" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
                <div>
                  <p className="font-sans-twc text-[10px] uppercase tracking-[0.22em] text-[#D4AF37] mb-1">Episode {String(i + 1).padStart(2, '0')}</p>
                  <h3 className="font-serif-twc text-2xl text-[#FDFBF7]">{e.title}</h3>
                </div>
                <span className="font-sans-twc text-xs text-zinc-300">{e.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TVConnect() {
  return (
    <section className="py-28 md:py-40 bg-black border-t border-white/5" data-testid="tv-section">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-6">
          <p className="font-sans-twc text-xs uppercase tracking-[0.3em] text-[#D4AF37] mb-6">One-Click TV</p>
          <h2 className="font-serif-twc text-5xl md:text-6xl text-[#FDFBF7] tracking-tight leading-[0.95]">
            Watch the wedding<br />on the <span className="italic text-[#D4AF37]">50-inch.</span>
          </h2>
          <p className="font-sans-twc text-zinc-400 leading-relaxed mt-8 max-w-md">
            Chromecast, Apple TV, Android TV, Samsung & LG Smart TVs. Phone becomes a remote. No cables, no app installs, no Bluetooth chaos.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
            {["Chromecast", "AirPlay", "Android TV", "WebOS", "Tizen"].map((p) => (
              <span key={p} className="font-sans-twc text-xs uppercase tracking-[0.22em] text-zinc-500 inline-flex items-center gap-2">
                <Check size={14} className="text-[#D4AF37]" /> {p}
              </span>
            ))}
          </div>
        </div>
        <div className="md:col-span-6">
          <div className="relative rounded-md overflow-hidden gold-glow">
            <img src="https://images.unsplash.com/photo-1646861039459-fd9e3aabf3fb" alt="Watching on TV" className="w-full h-[480px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}

function FounderQuote() {
  return (
    <section className="py-28 md:py-40 bg-black border-t border-white/5" data-testid="founder-quote-section">
      <div className="max-w-5xl mx-auto px-6 md:px-12 text-center">
        <p className="font-sans-twc text-[11px] uppercase tracking-[0.3em] text-[#D4AF37] mb-8">A Note from the Founder</p>
        <p className="font-serif-twc text-3xl md:text-5xl lg:text-6xl text-[#FDFBF7] leading-[1.1] tracking-tight" data-testid="founder-quote">
          "I make photographers look like filmmakers<br className="hidden md:inline" />
          and make wedding delivery feel like <span className="italic text-[#D4AF37]">Netflix.</span>"
        </p>
        <p className="font-sans-twc text-sm text-zinc-500 mt-10 tracking-[0.18em] uppercase">— The Founder, The Wed Cinema</p>
      </div>
    </section>
  );
}

function Founders({ onApply, remaining }) {
  return (
    <section id="founders" className="py-28 md:py-40 bg-black border-t border-white/5" data-testid="founders-section">
      <div className="max-w-5xl mx-auto px-6 md:px-12 text-center">
        <p className="font-sans-twc text-xs uppercase tracking-[0.3em] text-[#D4AF37] mb-6">Founding Photographers</p>
        <h2 className="font-serif-twc text-5xl md:text-7xl text-[#FDFBF7] tracking-tight leading-[0.95]">
          Limited to <span className="italic text-[#D4AF37]">100 studios.</span>
        </h2>
        <p className="font-sans-twc text-zinc-400 leading-relaxed mt-8 max-w-2xl mx-auto">
          Lifetime 50% off · 2TB founder storage · Private Slack with the founders · Lifetime "Founding Studio" badge across all client deliveries.
        </p>
        {remaining !== null && (
          <div className="mt-10 inline-flex items-center gap-4 border border-white/10 rounded-sm px-6 py-3" data-testid="founders-counter">
            <Star size={16} className="text-[#D4AF37]" fill="currentColor" />
            <span className="font-sans-twc text-xs uppercase tracking-[0.28em] text-zinc-300">
              {remaining} of 100 spots remaining
            </span>
          </div>
        )}
        <div className="mt-10">
          <button onClick={onApply} className="bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-sans-twc font-medium px-10 py-4 rounded-sm tracking-wide transition-colors inline-flex items-center gap-2 group" data-testid="founders-apply-btn">
            Apply for the Founders Program <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}

function Pricing({ onApply }) {
  const tiers = [
    { name: "Starter", price: "₹25k", per: "/year", weddings: "10 weddings", perks: ["1080p streaming", "100GB storage", "QR sharing", "Basic analytics"] },
    { name: "Professional", price: "₹75k", per: "/year", weddings: "30 weddings", perks: ["2K streaming", "500GB storage", "AI face search", "Branded delivery"] },
    { name: "Studio", price: "₹2L", per: "/year", weddings: "Unlimited", featured: true, perks: ["4K HLS streaming", "2TB storage", "All AI features", "White-label app", "Priority encoding"] },
    { name: "Enterprise", price: "Custom", per: "", weddings: "Multi-studio", perks: ["Dedicated infra", "Custom domain", "API access", "SLA & DPA", "On-prem option"] },
  ];
  return (
    <section id="pricing" className="py-28 md:py-40 bg-black border-t border-white/5" data-testid="pricing-section">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="md:grid md:grid-cols-12 gap-12 mb-20">
          <div className="md:col-span-7">
            <p className="font-sans-twc text-xs uppercase tracking-[0.3em] text-[#D4AF37] mb-6">Pricing</p>
            <h2 className="font-serif-twc text-5xl md:text-6xl text-[#FDFBF7] tracking-tight leading-[0.95]">
              Priced per <span className="italic text-zinc-400">studio</span>,<br />not per wedding.
            </h2>
          </div>
          <p className="md:col-span-5 md:pt-12 font-sans-twc text-zinc-400 leading-relaxed">
            Founder pricing locks in 50% off — forever. Pay-per-wedding available for one-off deliveries.
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {tiers.map((t, i) => (
            <div key={t.name} className={`p-8 rounded-md flex flex-col h-full transition-all duration-500 ${t.featured ? 'gold-glow bg-gradient-to-b from-[#1a1410] to-black border border-[#D4AF37]/50' : 'border border-white/10 bg-white/[0.02] hover:border-white/25'}`} data-testid={`pricing-tier-${i}`}>
              {t.featured && <span className="font-sans-twc text-[10px] uppercase tracking-[0.28em] text-[#D4AF37] mb-4">Most Loved</span>}
              <h3 className="font-serif-twc text-3xl text-[#FDFBF7]">{t.name}</h3>
              <p className="font-sans-twc text-xs uppercase tracking-[0.22em] text-zinc-500 mt-2">{t.weddings}</p>
              <div className="mt-8 mb-8">
                <span className="font-serif-twc text-5xl text-[#FDFBF7]">{t.price}</span>
                <span className="font-sans-twc text-sm text-zinc-500">{t.per}</span>
              </div>
              <ul className="space-y-3 flex-1">
                {t.perks.map((p) => (
                  <li key={p} className="font-sans-twc text-sm text-zinc-300 flex items-start gap-2">
                    <Check size={14} className="text-[#D4AF37] mt-1 flex-shrink-0" /> {p}
                  </li>
                ))}
              </ul>
              <button onClick={onApply} className={`mt-8 w-full py-3 rounded-sm font-sans-twc text-xs uppercase tracking-[0.22em] transition ${t.featured ? 'bg-[#D4AF37] hover:bg-[#F3E5AB] text-black' : 'border border-white/20 hover:bg-white/10 text-white'}`} data-testid={`pricing-cta-${i}`}>
                {t.name === 'Enterprise' ? 'Talk to Us' : 'Start Free Trial'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ApplyModal({ open, onClose, onSubmitted }) {
  const [form, setForm] = useState({ full_name: "", studio_name: "", email: "", city: "", instagram: "", weddings_per_year: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setSuccess(false);
      setError(null);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [open]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await axios.post(`${API}/founders/apply`, form);
      setSuccess(true);
      onSubmitted();
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" data-testid="apply-modal">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} data-testid="apply-modal-backdrop" />
      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-md p-8 md:p-12 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-5 text-zinc-500 hover:text-white text-2xl leading-none" data-testid="apply-close-btn" aria-label="Close">×</button>

        {!success ? (
          <>
            <p className="font-sans-twc text-xs uppercase tracking-[0.3em] text-[#D4AF37] mb-4">Founding Studio Application</p>
            <h3 className="font-serif-twc text-4xl md:text-5xl text-[#FDFBF7] tracking-tight leading-[0.95]">Tell us about<br /><span className="italic text-zinc-400">your studio.</span></h3>
            <p className="font-sans-twc text-sm text-zinc-400 mt-4">We onboard founding members in batches. Reviewed within 48 hours.</p>

            <form onSubmit={submit} className="mt-10 space-y-7" data-testid="apply-form">
              <input className="input-line" placeholder="Your full name *" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} data-testid="apply-input-name" />
              <input className="input-line" placeholder="Studio name *" required value={form.studio_name} onChange={(e) => setForm({ ...form, studio_name: e.target.value })} data-testid="apply-input-studio" />
              <input type="email" className="input-line" placeholder="Email address *" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="apply-input-email" />
              <div className="grid md:grid-cols-2 gap-6">
                <input className="input-line" placeholder="City *" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} data-testid="apply-input-city" />
                <input className="input-line" placeholder="Instagram handle" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} data-testid="apply-input-instagram" />
              </div>
              <input className="input-line" placeholder="Weddings per year (e.g. 12–25)" value={form.weddings_per_year} onChange={(e) => setForm({ ...form, weddings_per_year: e.target.value })} data-testid="apply-input-volume" />
              <textarea className="input-line" placeholder="What's your biggest delivery headache today?" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} data-testid="apply-input-message" />

              {error && <p className="text-red-400 font-sans-twc text-sm" data-testid="apply-error">{error}</p>}

              <button type="submit" disabled={loading} className="w-full bg-[#D4AF37] hover:bg-[#F3E5AB] disabled:opacity-60 text-black font-sans-twc font-medium px-8 py-4 rounded-sm tracking-wide transition-colors inline-flex items-center justify-center gap-2" data-testid="apply-submit-btn">
                {loading ? "Submitting..." : (<>Apply for Founding Membership <ArrowRight size={18} /></>)}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-10" data-testid="apply-success">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#D4AF37]/15 border border-[#D4AF37] flex items-center justify-center mb-6">
              <Check size={28} className="text-[#D4AF37]" />
            </div>
            <h3 className="font-serif-twc text-4xl text-[#FDFBF7] tracking-tight">You're on the list.</h3>
            <p className="font-sans-twc text-zinc-400 mt-4 max-w-md mx-auto">We'll review your application and reach out within 48 hours with your private demo link.</p>
            <button onClick={onClose} className="mt-8 border border-white/20 hover:bg-white/10 text-white font-sans-twc text-xs uppercase tracking-[0.22em] px-8 py-3 rounded-sm transition" data-testid="apply-success-close">
              Back to the cinema
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FinalCTA({ onApply }) {
  return (
    <section className="py-32 md:py-48 bg-black border-t border-white/5 text-center" data-testid="final-cta">
      <div className="max-w-4xl mx-auto px-6">
        <p className="font-sans-twc text-xs uppercase tracking-[0.3em] text-[#D4AF37] mb-8">The Industry's Reset Button</p>
        <h2 className="font-serif-twc text-5xl md:text-7xl lg:text-8xl text-[#FDFBF7] tracking-tighter leading-[0.92]">
          Stop delivering<br />hard drives.<br />
          <span className="italic text-[#D4AF37]">Start delivering<br />experiences.</span>
        </h2>
        <div className="mt-14">
          <button onClick={onApply} className="bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-sans-twc font-medium px-10 py-5 rounded-sm tracking-wide transition-colors inline-flex items-center gap-3 group" data-testid="final-cta-btn">
            <Zap size={18} /> Book Your Live Demo <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black py-12" data-testid="footer">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-wrap items-center justify-between gap-6">
        <span className="font-serif-twc text-xl text-[#FDFBF7]">The Wed <span className="text-[#D4AF37] italic">Cinema</span></span>
        <div className="flex items-center gap-6 text-xs font-sans-twc uppercase tracking-[0.22em] text-zinc-500">
          <a href="#features" className="hover:text-white transition">Platform</a>
          <a href="#pricing" className="hover:text-white transition">Pricing</a>
          <a href="#" className="hover:text-white transition">Privacy</a>
          <a href="#" className="hover:text-white transition inline-flex items-center gap-2"><Instagram size={14} /> Instagram</a>
        </div>
        <p className="font-sans-twc text-xs text-zinc-600">© 2026 The Wed Cinema · Built by wedding filmmakers, for wedding photographers.</p>
      </div>
      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-8 pt-6 border-t border-white/5 text-center">
        <p className="font-sans-twc text-[11px] uppercase tracking-[0.28em] text-zinc-500" data-testid="brand-strapline">Built by Wedding Filmmakers. Designed for Real Wedding Problems. Powered by The Wed Cinema™.</p>
      </div>
    </footer>
  );
}

function Landing() {
  const [open, setOpen] = useState(false);
  const [remaining, setRemaining] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/founders/stats`);
      setRemaining(data.remaining);
    } catch {
      /* non-blocking: counter is purely informational */
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return (
    <div className="App grain" data-testid="app-root">
      <Nav onApply={() => setOpen(true)} />
      <Hero onApply={() => setOpen(true)} remaining={remaining} />
      <TrustBadges />
      <Problem />
      <Features />
      <HowItWorks />
      <OttEpisodes />
      <TVConnect />
      <FounderQuote />
      <Founders onApply={() => setOpen(true)} remaining={remaining} />
      <Pricing onApply={() => setOpen(true)} />
      <FinalCTA onApply={() => setOpen(true)} />
      <Footer />
      <ApplyModal open={open} onClose={() => setOpen(false)} onSubmitted={fetchStats} />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/w/:slug" element={<WeddingPlayer />} />
        <Route path="/studio" element={<StudioOS />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
