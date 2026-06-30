import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Upload, HardDrive, Server, Activity, Eye, Tv, Smartphone,
  RotateCw, Cloud, Shield, Check, X, ChevronRight, Settings, AlertCircle,
  Film, Image as ImageIcon, Sparkles
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const STRAPLINE = "Built by Wedding Filmmakers. Designed for Real Wedding Problems. Powered by The Wed Cinema™.";

function Stat({ label, value, sub, icon: Icon }) {
  return (
    <div className="border border-white/10 rounded-md p-6 bg-white/[0.02] hover:border-white/20 transition" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="font-sans-twc text-[10px] uppercase tracking-[0.28em] text-zinc-500">{label}</p>
        {Icon && <Icon size={16} className="text-[#D4AF37]" strokeWidth={1.6} />}
      </div>
      <p className="font-serif-twc text-4xl text-[#FDFBF7] tracking-tight">{value}</p>
      {sub && <p className="font-sans-twc text-xs text-zinc-500 mt-2">{sub}</p>}
    </div>
  );
}

function HlsTarget({ res, status }) {
  const tone = {
    done:    { label: "Done",    cls: "text-[#D4AF37] border-[#D4AF37]/40 bg-[#1a1410]" },
    running: { label: "Encoding", cls: "text-[#FDFBF7] border-white/30 bg-white/5 animate-pulse" },
    pending: { label: "Pending", cls: "text-zinc-500 border-white/10 bg-transparent" },
  }[status] || { label: status, cls: "text-zinc-400 border-white/10" };
  return (
    <div className={`rounded-sm p-4 border ${tone.cls}`} data-testid={`hls-${res.toLowerCase().replace(/\s+/g, '-')}`}>
      <p className="font-serif-twc text-2xl text-[#FDFBF7]">{res}</p>
      <p className="font-sans-twc text-[10px] uppercase tracking-[0.28em] mt-2">{tone.label}</p>
    </div>
  );
}

function StudioOS() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("ingest"); // ingest | rules | storage
  const [category, setCategory] = useState(null);
  const [deliverable, setDeliverable] = useState(null);
  const [size, setSize] = useState(null);
  const [meta, setMeta] = useState("");
  const [uploadingProgress, setUploadingProgress] = useState(null); // null | 0..100
  const [rules, setRules] = useState({ allow_downloads: true, watermark: true });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API}/studio/stats`);
        setData(data);
        setCategory(data.categories[0]);
        setDeliverable(data.deliverable_types[0]);
        setSize(data.size_simulations[1]);
        setRules({ allow_downloads: data.rules.allow_client_downloads, watermark: data.rules.auto_watermark_low_bitrates });
      } catch (e) {
        console.error("studio stats failed", e);
      }
    })();
  }, []);

  // Simulated chunked TUS upload
  useEffect(() => {
    if (uploadingProgress === null) return;
    if (uploadingProgress >= 100) {
      const t = setTimeout(() => setUploadingProgress(null), 1800);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setUploadingProgress((p) => Math.min(100, (p ?? 0) + Math.floor(4 + Math.random() * 9))), 350);
    return () => clearTimeout(t);
  }, [uploadingProgress]);

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center text-zinc-500 font-sans-twc text-xs uppercase tracking-[0.3em]" data-testid="studio-loading">Booting the Video Delivery OS…</div>;
  }

  return (
    <div className="min-h-screen bg-black" data-testid="studio-os">
      {/* Top bar */}
      <div className="border-b border-white/5 backdrop-blur-md bg-black/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-zinc-500 hover:text-white inline-flex items-center gap-2 font-sans-twc text-xs uppercase tracking-[0.22em] transition" data-testid="studio-back">
              <ArrowLeft size={14} /> The Wed Cinema
            </Link>
            <span className="hidden md:inline text-zinc-700">/</span>
            <span className="hidden md:inline font-sans-twc text-[11px] uppercase tracking-[0.28em] text-zinc-400">Studio OS</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-serif-twc text-2xl text-[#D4AF37]" data-testid="studio-initials">{data.studio.initials}</span>
            <span className="hidden md:inline font-sans-twc text-[11px] uppercase tracking-[0.22em] text-zinc-400">{data.studio.name}</span>
            <button className="ml-3 border border-white/15 hover:bg-white/10 text-white font-sans-twc text-[11px] uppercase tracking-[0.22em] px-3 py-2 rounded-sm transition" data-testid="studio-save-close">Save & Close</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <p className="font-sans-twc text-[11px] uppercase tracking-[0.3em] text-[#D4AF37] mb-3">Studio Command Center</p>
          <h1 className="font-serif-twc text-5xl md:text-7xl text-[#FDFBF7] tracking-tighter leading-[0.95]">Video Delivery <span className="italic text-zinc-400">OS.</span></h1>
          <p className="font-sans-twc text-zinc-400 leading-relaxed mt-6 max-w-2xl">A photographer-grade control room — ingest 50GB+ cinematic masters, watch FFmpeg generate HLS ladders in real time, set delivery rules, and observe how your clients actually watch their wedding.</p>
        </motion.div>

        {/* Tabs */}
        <div className="mt-12 inline-flex items-center gap-1 border border-white/10 rounded-sm p-1 bg-white/[0.02]" data-testid="studio-tabs">
          {[
            { id: "ingest",  label: "Ingest & Transcode" },
            { id: "rules",   label: "Delivery Rules" },
            { id: "storage", label: "Storage & Engagement" },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-sm font-sans-twc text-[11px] uppercase tracking-[0.22em] transition ${tab === t.id ? "bg-[#D4AF37] text-black" : "text-zinc-400 hover:text-white"}`} data-testid={`studio-tab-${t.id}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Bodies */}
        {tab === "ingest" && (
          <div className="mt-10 grid lg:grid-cols-2 gap-6" data-testid="ingest-pane">
            {/* Initialize Ingest */}
            <div className="border border-white/10 rounded-md p-8 bg-white/[0.02]">
              <p className="font-sans-twc text-[10px] uppercase tracking-[0.28em] text-[#D4AF37] mb-2">Step 01</p>
              <h2 className="font-serif-twc text-3xl text-[#FDFBF7] tracking-tight mb-6">Initialize Wedding Ingest</h2>

              <label className="block font-sans-twc text-[10px] uppercase tracking-[0.28em] text-zinc-500 mb-2">Select Category</label>
              <select value={category || ""} onChange={(e) => setCategory(e.target.value)} className="w-full bg-black border border-white/15 hover:border-white/30 focus:border-[#D4AF37] outline-none rounded-sm px-3 py-3 font-sans-twc text-sm text-[#FDFBF7] mb-5 transition" data-testid="ingest-category">
                {data.categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>

              <label className="block font-sans-twc text-[10px] uppercase tracking-[0.28em] text-zinc-500 mb-2">Select Deliverable</label>
              <select value={deliverable || ""} onChange={(e) => setDeliverable(e.target.value)} className="w-full bg-black border border-white/15 hover:border-white/30 focus:border-[#D4AF37] outline-none rounded-sm px-3 py-3 font-sans-twc text-sm text-[#FDFBF7] mb-5 transition" data-testid="ingest-deliverable">
                {data.deliverable_types.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>

              <label className="block font-sans-twc text-[10px] uppercase tracking-[0.28em] text-zinc-500 mb-2">Simulated File Size</label>
              <select value={size || ""} onChange={(e) => setSize(e.target.value)} className="w-full bg-black border border-white/15 hover:border-white/30 focus:border-[#D4AF37] outline-none rounded-sm px-3 py-3 font-sans-twc text-sm text-[#FDFBF7] mb-5 transition" data-testid="ingest-size">
                {data.size_simulations.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>

              <label className="block font-sans-twc text-[10px] uppercase tracking-[0.28em] text-zinc-500 mb-2">Category Detail / Meta</label>
              <input value={meta} onChange={(e) => setMeta(e.target.value)} placeholder="e.g. Mehndi night · drone reel · Jaipur" className="w-full bg-black border border-white/15 hover:border-white/30 focus:border-[#D4AF37] outline-none rounded-sm px-3 py-3 font-sans-twc text-sm text-[#FDFBF7] mb-6 transition" data-testid="ingest-meta" />

              <button
                disabled={uploadingProgress !== null}
                onClick={() => setUploadingProgress(0)}
                className="w-full bg-[#D4AF37] hover:bg-[#F3E5AB] disabled:opacity-50 text-black font-sans-twc font-medium px-6 py-3 rounded-sm tracking-wide transition-colors inline-flex items-center justify-center gap-2"
                data-testid="ingest-start"
              >
                <Upload size={16} /> {uploadingProgress === null ? "Start Chunk Upload (TUS)" : `Uploading… ${uploadingProgress}%`}
              </button>
              {uploadingProgress !== null && (
                <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden" data-testid="ingest-progress">
                  <div className="h-full bg-[#D4AF37] transition-all duration-200" style={{ width: `${uploadingProgress}%` }} />
                </div>
              )}
            </div>

            {/* Transcode Monitor */}
            <div className="border border-white/10 rounded-md p-8 bg-white/[0.02]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="font-sans-twc text-[10px] uppercase tracking-[0.28em] text-[#D4AF37] mb-2">Step 02</p>
                  <h2 className="font-serif-twc text-3xl text-[#FDFBF7] tracking-tight">FFmpeg Transcode Monitor</h2>
                </div>
                <span className="font-sans-twc text-[10px] uppercase tracking-[0.28em] text-zinc-500 inline-flex items-center gap-2"><Activity size={12} className="text-[#D4AF37]" /> {data.jobs.active.length} active</span>
              </div>

              <div className="space-y-4 mb-6">
                {data.jobs.active.map((j) => (
                  <div key={j.id} className="border border-white/10 rounded-sm p-4 bg-black" data-testid={`job-${j.id}`}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <p className="font-sans-twc text-sm text-[#FDFBF7] truncate">{j.filename}</p>
                        <p className="font-sans-twc text-[10px] uppercase tracking-[0.22em] text-zinc-500 mt-1">{j.deliverable} · {j.size_gb}GB · {j.phase}</p>
                      </div>
                      <span className="font-serif-twc text-2xl text-[#D4AF37]">{j.progress}%</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#D4AF37]" style={{ width: `${j.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <p className="font-sans-twc text-[10px] uppercase tracking-[0.28em] text-zinc-500 mb-3">HLS Encoding Resolution Targets</p>
              <div className="grid grid-cols-3 gap-2">
                {data.jobs.hls_targets.map((t) => <HlsTarget key={t.res} {...t} />)}
              </div>
            </div>
          </div>
        )}

        {tab === "rules" && (
          <div className="mt-10 grid md:grid-cols-2 gap-6" data-testid="rules-pane">
            <div className="border border-white/10 rounded-md p-8 bg-white/[0.02]">
              <h2 className="font-serif-twc text-3xl text-[#FDFBF7] tracking-tight mb-2">Allow Client Downloads</h2>
              <p className="font-sans-twc text-sm text-zinc-400 mb-6">Shows download button on video player & photo vault.</p>
              <button onClick={() => setRules((r) => ({ ...r, allow_downloads: !r.allow_downloads }))} className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${rules.allow_downloads ? "bg-[#D4AF37]" : "bg-white/10"}`} data-testid="rule-downloads-toggle" aria-pressed={rules.allow_downloads}>
                <span className={`inline-block h-6 w-6 transform rounded-full bg-black transition ${rules.allow_downloads ? "translate-x-9" : "translate-x-1"}`} />
              </button>
              <p className="mt-4 font-sans-twc text-[11px] uppercase tracking-[0.22em] text-zinc-500">{rules.allow_downloads ? "Downloads enabled" : "Streaming only"}</p>
            </div>
            <div className="border border-white/10 rounded-md p-8 bg-white/[0.02]">
              <h2 className="font-serif-twc text-3xl text-[#FDFBF7] tracking-tight mb-2">Automated Watermarking</h2>
              <p className="font-sans-twc text-sm text-zinc-400 mb-6">Bake "{data.studio.name}" watermark into low-bitrate (480p/720p) downloads.</p>
              <button onClick={() => setRules((r) => ({ ...r, watermark: !r.watermark }))} className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${rules.watermark ? "bg-[#D4AF37]" : "bg-white/10"}`} data-testid="rule-watermark-toggle" aria-pressed={rules.watermark}>
                <span className={`inline-block h-6 w-6 transform rounded-full bg-black transition ${rules.watermark ? "translate-x-9" : "translate-x-1"}`} />
              </button>
              <p className="mt-4 font-sans-twc text-[11px] uppercase tracking-[0.22em] text-zinc-500">{rules.watermark ? "Auto watermark ON" : "No watermark"}</p>
            </div>

            <div className="md:col-span-2 border border-white/10 rounded-md p-8 bg-white/[0.02]" data-testid="pending-uploads">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h2 className="font-serif-twc text-3xl text-[#FDFBF7] tracking-tight">Pending Guest Uploads <span className="text-[#D4AF37] font-sans-twc text-xs uppercase tracking-[0.28em] align-middle ml-3">New</span></h2>
                <span className="font-sans-twc text-[10px] uppercase tracking-[0.22em] text-zinc-500">{data.pending_guest_uploads.length} awaiting approval</span>
              </div>
              <div className="divide-y divide-white/5">
                {data.pending_guest_uploads.map((g) => (
                  <div key={g.id} className="py-4 flex items-center justify-between gap-4" data-testid={`pending-${g.id}`}>
                    <div>
                      <p className="font-serif-twc text-xl text-[#FDFBF7]">{g.guest}</p>
                      <p className="font-sans-twc text-[11px] uppercase tracking-[0.22em] text-zinc-500 mt-1">{g.files} files · {g.size_mb} MB · {g.submitted}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="border border-white/15 hover:bg-white/10 text-zinc-300 hover:text-white font-sans-twc text-[10px] uppercase tracking-[0.22em] px-3 py-2 rounded-sm transition inline-flex items-center gap-2" data-testid={`reject-${g.id}`}>
                        <X size={12} /> Reject
                      </button>
                      <button className="bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-sans-twc text-[10px] uppercase tracking-[0.22em] px-3 py-2 rounded-sm transition inline-flex items-center gap-2" data-testid={`approve-${g.id}`}>
                        <Check size={12} /> Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "storage" && (
          <div className="mt-10 space-y-6" data-testid="storage-pane">
            {/* Storage */}
            <div className="border border-white/10 rounded-md p-8 bg-white/[0.02]">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h2 className="font-serif-twc text-3xl text-[#FDFBF7] tracking-tight">{data.storage.label}</h2>
                <span className="font-sans-twc text-[10px] uppercase tracking-[0.28em] text-[#D4AF37] inline-flex items-center gap-2"><Cloud size={12} /> {data.storage.savings_note}</span>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <Stat label="Total Encoded Storage" value={`${data.storage.used_gb} GB`} sub={`of ${data.storage.total_gb} GB · ${Math.round((data.storage.used_gb / data.storage.total_gb) * 100)}% used`} icon={HardDrive} />
                <Stat label="Egress Bandwidth" value={`${data.storage.egress_gb} GB`} sub="this month" icon={Server} />
                <Stat label="Monthly Cost" value={`₹${data.storage.monthly_cost_inr.toFixed(2)}`} sub={data.storage.savings_note} icon={Sparkles} />
              </div>
              <div className="mt-6 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB]" style={{ width: `${Math.round((data.storage.used_gb / data.storage.total_gb) * 100)}%` }} />
              </div>
            </div>

            {/* Engagement */}
            <div className="border border-white/10 rounded-md p-8 bg-white/[0.02]">
              <h2 className="font-serif-twc text-3xl text-[#FDFBF7] tracking-tight mb-2">Engagement Statistics</h2>
              <p className="font-sans-twc text-sm text-zinc-400 mb-6">Real-time viewership across TV displays and mobile.</p>
              <div className="grid md:grid-cols-3 gap-4">
                <Stat label="TV Views" value={`${data.engagement.tv_views_pct}%`} sub="Big-screen cinema sessions" icon={Tv} />
                <Stat label="Mobile Views" value={`${data.engagement.mobile_views_pct}%`} sub="Phone & tablet" icon={Smartphone} />
                <Stat label="Replay Rate" value={`${data.engagement.replay_rate_pct}%`} sub="Watched at least twice" icon={RotateCw} />
              </div>
            </div>
          </div>
        )}

        {/* Strapline */}
        <footer className="mt-20 pt-8 border-t border-white/5 text-center">
          <p className="font-sans-twc text-[11px] uppercase tracking-[0.28em] text-zinc-500" data-testid="brand-strapline">{STRAPLINE}</p>
        </footer>
      </div>
    </div>
  );
}

export default StudioOS;
