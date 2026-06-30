import { useEffect, useState } from "react";
import axios from "axios";
import {
  Image as ImageIcon, Github, ExternalLink, RefreshCw, FileText, Layers, ArrowLeft, FolderOpen
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function fmtBytes(b) {
  if (!b) return "—";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}

function CategoryCard({ cat, onOpen }) {
  return (
    <button onClick={() => onOpen(cat)} className="group text-left border border-white/10 hover:border-[#D4AF37]/40 rounded-md overflow-hidden bg-white/[0.02] transition-all duration-500" data-testid={`photo-cat-${cat.slug}`}>
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={cat.cover_image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        {cat.source === "github" && (
          <span className="absolute top-3 right-3 bg-black/70 backdrop-blur px-2 py-1 rounded font-sans-twc text-[10px] uppercase tracking-wider text-[#D4AF37] inline-flex items-center gap-1.5">
            <Github size={11} /> Synced
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-serif-twc text-2xl text-[#FDFBF7] mb-1">{cat.name}</h3>
        <p className="font-sans-twc text-xs text-zinc-400 leading-relaxed">{cat.tagline}</p>
        {cat.github && (
          <p className="font-sans-twc text-[10px] uppercase tracking-[0.22em] text-zinc-500 mt-3 inline-flex items-center gap-2">
            <FolderOpen size={11} className="text-[#D4AF37]" /> {cat.github.owner}/{cat.github.repo}
          </p>
        )}
      </div>
    </button>
  );
}

function CategoryDrillIn({ cat, onBack }) {
  const [items, setItems] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [meta, setMeta] = useState(cat);

  const doSync = async () => {
    setSyncing(true);
    try {
      const { data } = await axios.get(`${API}/photos/categories/${cat.id}/sync`, { withCredentials: true });
      setItems(data.items);
      setMeta(data.category);
    } finally { setSyncing(false); }
  };

  useEffect(() => { doSync(); }, []);

  return (
    <div data-testid={`photo-cat-detail-${cat.slug}`}>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <button onClick={onBack} className="text-zinc-500 hover:text-white inline-flex items-center gap-2 font-sans-twc text-xs uppercase tracking-[0.22em] transition" data-testid="photo-cat-back">
          <ArrowLeft size={14} /> Categories
        </button>
        <div className="flex items-center gap-3">
          {meta.github && (
            <a href={`https://github.com/${meta.github.owner}/${meta.github.repo}`} target="_blank" rel="noreferrer" className="border border-white/15 hover:bg-white/10 text-white font-sans-twc text-[11px] uppercase tracking-[0.22em] px-4 py-2 rounded-sm transition inline-flex items-center gap-2" data-testid="photo-cat-open-github">
              <Github size={12} /> Open on GitHub <ExternalLink size={11} />
            </a>
          )}
          <button onClick={doSync} disabled={syncing} className="bg-[#D4AF37] hover:bg-[#F3E5AB] disabled:opacity-60 text-black font-sans-twc text-[11px] uppercase tracking-[0.22em] px-4 py-2 rounded-sm transition inline-flex items-center gap-2" data-testid="photo-cat-resync">
            <RefreshCw size={12} className={syncing ? "animate-spin" : ""} /> {syncing ? "Syncing…" : "Resync"}
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="font-serif-twc text-4xl text-[#FDFBF7] tracking-tight">{meta.name}</h2>
        <p className="font-sans-twc text-sm text-zinc-400 mt-2">{meta.tagline}</p>
        <p className="font-sans-twc text-[10px] uppercase tracking-[0.28em] text-zinc-500 mt-3">
          {meta.item_count ?? items?.length ?? 0} assets · last synced {meta.last_synced_at ? new Date(meta.last_synced_at).toLocaleString() : "—"}
        </p>
      </div>

      {!items && <p className="font-sans-twc text-zinc-500 text-xs uppercase tracking-[0.28em]" data-testid="photo-cat-loading">Loading manifest…</p>}
      {items && items.length === 0 && <p className="font-sans-twc text-zinc-500 text-xs uppercase tracking-[0.28em]" data-testid="photo-cat-empty">No assets yet — commits will appear here automatically.</p>}
      {items && items.length > 0 && (
        <div className="border border-white/10 rounded-md bg-white/[0.02] divide-y divide-white/5" data-testid="photo-cat-items">
          {items.map((it) => (
            <div key={it.sha || it.name} className="flex items-center justify-between gap-4 p-4 hover:bg-white/[0.03] transition" data-testid={`asset-${it.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`}>
              <div className="flex items-center gap-3 min-w-0">
                <FileText size={16} className="text-[#D4AF37] flex-shrink-0" strokeWidth={1.6} />
                <div className="min-w-0">
                  <p className="font-sans-twc text-sm text-[#FDFBF7] truncate">{it.name}</p>
                  <p className="font-sans-twc text-[10px] uppercase tracking-[0.22em] text-zinc-500 mt-0.5">{fmtBytes(it.size_bytes)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {it.html_url && (
                  <a href={it.html_url} target="_blank" rel="noreferrer" className="border border-white/15 hover:bg-white/10 text-zinc-300 hover:text-white font-sans-twc text-[10px] uppercase tracking-[0.22em] px-3 py-1.5 rounded-sm transition inline-flex items-center gap-1.5">
                    <ExternalLink size={11} /> View
                  </a>
                )}
                {it.download_url && (
                  <a href={it.download_url} target="_blank" rel="noreferrer" className="border border-white/15 hover:bg-white/10 text-zinc-300 hover:text-white font-sans-twc text-[10px] uppercase tracking-[0.22em] px-3 py-1.5 rounded-sm transition">
                    Raw
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GalleryTab() {
  const [cats, setCats] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API}/photos/categories`, { withCredentials: true });
        setCats(data);
      } catch {
        setCats([]);
      }
    })();
  }, []);

  if (selected) return (
    <div className="mt-10" data-testid="gallery-pane">
      <CategoryDrillIn cat={selected} onBack={() => setSelected(null)} />
    </div>
  );

  return (
    <div className="mt-10" data-testid="gallery-pane">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <p className="font-sans-twc text-[10px] uppercase tracking-[0.28em] text-[#D4AF37] mb-2 inline-flex items-center gap-2"><Layers size={11} /> Photo Categories</p>
          <h2 className="font-serif-twc text-3xl text-[#FDFBF7] tracking-tight">Gallery Library</h2>
        </div>
        <span className="font-sans-twc text-[10px] uppercase tracking-[0.22em] text-zinc-500 inline-flex items-center gap-2">
          <ImageIcon size={11} className="text-[#D4AF37]" /> Auto-synced from GitHub
        </span>
      </div>

      {!cats && <p className="font-sans-twc text-zinc-500 text-xs uppercase tracking-[0.28em]" data-testid="gallery-loading">Loading categories…</p>}
      {cats && cats.length === 0 && <p className="font-sans-twc text-zinc-500 text-xs uppercase tracking-[0.28em]" data-testid="gallery-empty">No categories yet.</p>}
      {cats && cats.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="gallery-grid">
          {cats.map((c) => <CategoryCard key={c.id} cat={c} onOpen={setSelected} />)}
        </div>
      )}
    </div>
  );
}
