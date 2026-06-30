import { Check, X } from "lucide-react";

export default function RulesTab({ data, rules, setRules }) {
  const toggleDownloads = () => setRules((r) => ({ ...r, allow_downloads: !r.allow_downloads }));
  const toggleWatermark = () => setRules((r) => ({ ...r, watermark: !r.watermark }));

  return (
    <div className="mt-10 grid md:grid-cols-2 gap-6" data-testid="rules-pane">
      <div className="border border-white/10 rounded-md p-8 bg-white/[0.02]">
        <h2 className="font-serif-twc text-3xl text-[#FDFBF7] tracking-tight mb-2">Allow Client Downloads</h2>
        <p className="font-sans-twc text-sm text-zinc-400 mb-6">Shows download button on video player & photo vault.</p>
        <button onClick={toggleDownloads} className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${rules.allow_downloads ? "bg-[#D4AF37]" : "bg-white/10"}`} data-testid="rule-downloads-toggle" aria-pressed={rules.allow_downloads}>
          <span className={`inline-block h-6 w-6 transform rounded-full bg-black transition ${rules.allow_downloads ? "translate-x-9" : "translate-x-1"}`} />
        </button>
        <p className="mt-4 font-sans-twc text-[11px] uppercase tracking-[0.22em] text-zinc-500">{rules.allow_downloads ? "Downloads enabled" : "Streaming only"}</p>
      </div>
      <div className="border border-white/10 rounded-md p-8 bg-white/[0.02]">
        <h2 className="font-serif-twc text-3xl text-[#FDFBF7] tracking-tight mb-2">Automated Watermarking</h2>
        <p className="font-sans-twc text-sm text-zinc-400 mb-6">Bake &ldquo;{data.studio.name}&rdquo; watermark into low-bitrate (480p/720p) downloads.</p>
        <button onClick={toggleWatermark} className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${rules.watermark ? "bg-[#D4AF37]" : "bg-white/10"}`} data-testid="rule-watermark-toggle" aria-pressed={rules.watermark}>
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
  );
}
