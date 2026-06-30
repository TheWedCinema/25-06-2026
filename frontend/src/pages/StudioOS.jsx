import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, LogOut, ShieldCheck } from "lucide-react";
import { BRAND_STRAPLINE } from "@/constants/brand";
import { PAGE_FADE_IN } from "@/constants/motion";
import { useAuth } from "@/auth/AuthContext";
import IngestTab from "@/pages/studio/IngestTab";
import RulesTab from "@/pages/studio/RulesTab";
import StorageTab from "@/pages/studio/StorageTab";
import GalleryTab from "@/pages/studio/GalleryTab";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TABS = [
  { id: "ingest",  label: "Ingest & Transcode" },
  { id: "rules",   label: "Delivery Rules" },
  { id: "storage", label: "Storage & Engagement" },
  { id: "gallery", label: "Photo Categories" },
];

function StudioOS() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("ingest");
  const [category, setCategory] = useState(null);
  const [deliverable, setDeliverable] = useState(null);
  const [size, setSize] = useState(null);
  const [meta, setMeta] = useState("");
  const [uploadingProgress, setUploadingProgress] = useState(null);
  const [rules, setRules] = useState({ allow_downloads: true, watermark: true });

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: d } = await axios.get(`${API}/studio/stats`);
        if (cancelled) return;
        setData(d);
        setCategory(d.categories[0]);
        setDeliverable(d.deliverable_types[0]);
        setSize(d.size_simulations[1]);
        setRules({ allow_downloads: d.rules.allow_client_downloads, watermark: d.rules.auto_watermark_low_bitrates });
      } catch {
        if (!cancelled) setData({ error: true });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center text-zinc-500 font-sans-twc text-xs uppercase tracking-[0.3em]" data-testid="studio-loading">Booting the Video Delivery OS…</div>;
  }
  if (data.error) {
    return <div className="min-h-screen flex items-center justify-center text-zinc-500 font-sans-twc text-xs uppercase tracking-[0.3em]" data-testid="studio-error">Unable to reach Video Delivery OS</div>;
  }

  return (
    <div className="min-h-screen bg-black" data-testid="studio-os">
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
            {user && (
              <div className="ml-3 flex items-center gap-2 pl-3 border-l border-white/10" data-testid="studio-user-pill">
                {user.picture && <img src={user.picture} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-white/10" referrerPolicy="no-referrer" />}
                <span className="hidden lg:inline font-sans-twc text-[11px] uppercase tracking-[0.22em] text-zinc-300">{user.name}</span>
              </div>
            )}
            {user?.role === "super_admin" && (
              <Link to="/admin" className="border border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 text-[#D4AF37] font-sans-twc text-[11px] uppercase tracking-[0.22em] px-3 py-2 rounded-sm transition inline-flex items-center gap-2" data-testid="studio-admin-link">
                <ShieldCheck size={12} /> <span className="hidden md:inline">Admin</span>
              </Link>
            )}
            <button onClick={handleLogout} className="ml-2 border border-white/15 hover:bg-white/10 text-white font-sans-twc text-[11px] uppercase tracking-[0.22em] px-3 py-2 rounded-sm transition inline-flex items-center gap-2" data-testid="studio-logout">
              <LogOut size={12} /> <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16">
        <motion.div {...PAGE_FADE_IN}>
          <p className="font-sans-twc text-[11px] uppercase tracking-[0.3em] text-[#D4AF37] mb-3">Studio Command Center</p>
          <h1 className="font-serif-twc text-5xl md:text-7xl text-[#FDFBF7] tracking-tighter leading-[0.95]">Video Delivery <span className="italic text-zinc-400">OS.</span></h1>
          <p className="font-sans-twc text-zinc-400 leading-relaxed mt-6 max-w-2xl">A photographer-grade control room — ingest 50GB+ cinematic masters, watch FFmpeg generate HLS ladders in real time, set delivery rules, and observe how your clients actually watch their wedding.</p>
        </motion.div>

        <div className="mt-12 inline-flex items-center gap-1 border border-white/10 rounded-sm p-1 bg-white/[0.02]" data-testid="studio-tabs">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-sm font-sans-twc text-[11px] uppercase tracking-[0.22em] transition ${tab === t.id ? "bg-[#D4AF37] text-black" : "text-zinc-400 hover:text-white"}`} data-testid={`studio-tab-${t.id}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "ingest" && (
          <IngestTab
            data={data}
            category={category} setCategory={setCategory}
            deliverable={deliverable} setDeliverable={setDeliverable}
            size={size} setSize={setSize}
            meta={meta} setMeta={setMeta}
            uploadingProgress={uploadingProgress} setUploadingProgress={setUploadingProgress}
          />
        )}
        {tab === "rules" && <RulesTab data={data} rules={rules} setRules={setRules} />}
        {tab === "storage" && <StorageTab data={data} />}
        {tab === "gallery" && <GalleryTab />}

        <footer className="mt-20 pt-8 border-t border-white/5 text-center">
          <p className="font-sans-twc text-[11px] uppercase tracking-[0.28em] text-zinc-500" data-testid="brand-strapline">{BRAND_STRAPLINE}</p>
        </footer>
      </div>
    </div>
  );
}

export default StudioOS;
