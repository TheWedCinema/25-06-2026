import { useEffect } from "react";
import { Upload, Activity } from "lucide-react";
import { HlsTarget } from "@/pages/studio/_shared";
import {
  UPLOAD_TICK_MS, UPLOAD_DONE_RESET_MS,
  UPLOAD_CHUNK_MIN_PCT, UPLOAD_CHUNK_RANGE_PCT,
} from "@/constants/timings";

const MAX_PCT = 100;

export default function IngestTab({
  data, category, setCategory, deliverable, setDeliverable,
  size, setSize, meta, setMeta, uploadingProgress, setUploadingProgress,
}) {
  // Simulated chunked TUS upload — functional setState (no stale-closure risk)
  useEffect(() => {
    if (uploadingProgress === null) return undefined;
    if (uploadingProgress >= MAX_PCT) {
      const t = setTimeout(() => setUploadingProgress(null), UPLOAD_DONE_RESET_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(
      () => setUploadingProgress((prev) => Math.min(MAX_PCT, (prev ?? 0) + Math.floor(UPLOAD_CHUNK_MIN_PCT + Math.random() * UPLOAD_CHUNK_RANGE_PCT))),
      UPLOAD_TICK_MS,
    );
    return () => clearTimeout(t);
  }, [uploadingProgress, setUploadingProgress]);

  return (
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
  );
}
