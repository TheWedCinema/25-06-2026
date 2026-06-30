import { useRef, useState } from "react";
import { ScanFace, Upload, Loader2, Sparkles } from "lucide-react";

export default function NeuralScan() {
  const fileRef = useRef(null);
  const [stage, setStage] = useState("idle"); // idle | scanning | result
  const [preview, setPreview] = useState(null);
  const [matches] = useState(() => Math.floor(28 + Math.random() * 84));

  const onSelect = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPreview(URL.createObjectURL(f));
    setStage("scanning");
    setTimeout(() => setStage("result"), 1600);
  };

  const reset = () => {
    setStage("idle");
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <section className="py-12" data-testid="neural-scan">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="relative overflow-hidden rounded-md border border-white/10 bg-gradient-to-br from-[#0a0a0a] to-black p-8 md:p-12 grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7">
            <p className="font-sans-twc text-[11px] uppercase tracking-[0.3em] text-[#D4AF37] mb-3 inline-flex items-center gap-2">
              <ScanFace size={12} /> Neural Scan · AI Face Recognition
            </p>
            <h3 className="font-serif-twc text-4xl md:text-5xl text-[#FDFBF7] tracking-tight leading-[0.95]">
              Find your<br /><span className="italic text-zinc-400">personal memory.</span>
            </h3>
            <p className="font-sans-twc text-sm text-zinc-400 leading-relaxed mt-5 max-w-md">
              Upload a selfie — our model instantly sorts every high-res frame featuring you across the entire wedding portfolio.
            </p>

            {stage === "idle" && (
              <button onClick={() => fileRef.current?.click()} className="mt-7 bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-sans-twc text-xs uppercase tracking-[0.22em] px-6 py-3 rounded-sm transition inline-flex items-center gap-2" data-testid="neural-scan-upload">
                <Upload size={14} /> Selfie Filter — Upload Snapshot
              </button>
            )}
            {stage === "scanning" && (
              <p className="mt-7 font-sans-twc text-[11px] uppercase tracking-[0.28em] text-[#D4AF37] inline-flex items-center gap-2" data-testid="neural-scan-loading">
                <Loader2 size={14} className="animate-spin" /> Scanning frames…
              </p>
            )}
            {stage === "result" && (
              <div className="mt-7 space-y-4" data-testid="neural-scan-result">
                <p className="font-sans-twc text-[11px] uppercase tracking-[0.28em] text-[#D4AF37] inline-flex items-center gap-2">
                  <Sparkles size={14} /> {matches} matching frames found
                </p>
                <p className="font-sans-twc text-sm text-zinc-400">We&apos;ve curated your personal cut. Open it in the Photo Vault.</p>
                <button onClick={reset} className="border border-white/15 hover:bg-white/10 text-zinc-300 hover:text-white font-sans-twc text-[10px] uppercase tracking-[0.22em] px-4 py-2 rounded-sm transition" data-testid="neural-scan-reset">
                  Try Another Photo
                </button>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={onSelect} className="hidden" data-testid="neural-scan-input" />
          </div>

          <div className="md:col-span-5">
            <div className="relative aspect-square rounded-md overflow-hidden border border-white/10 bg-white/[0.02]">
              {preview ? (
                <img src={preview} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ScanFace size={64} className="text-[#D4AF37] opacity-40" strokeWidth={1} />
                </div>
              )}
              {stage === "scanning" && (
                <div className="absolute inset-0">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-b from-[#D4AF37] to-transparent animate-pulse" />
                  <div className="absolute inset-0 bg-[#D4AF37]/5 animate-pulse" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
