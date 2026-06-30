import { Cloud, HardDrive, Server, Sparkles, Tv, Smartphone, RotateCw } from "lucide-react";
import { Stat } from "@/pages/studio/_shared";

export default function StorageTab({ data }) {
  const usedPct = Math.round((data.storage.used_gb / data.storage.total_gb) * 100);
  return (
    <div className="mt-10 space-y-6" data-testid="storage-pane">
      <div className="border border-white/10 rounded-md p-8 bg-white/[0.02]">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className="font-serif-twc text-3xl text-[#FDFBF7] tracking-tight">{data.storage.label}</h2>
          <span className="font-sans-twc text-[10px] uppercase tracking-[0.28em] text-[#D4AF37] inline-flex items-center gap-2"><Cloud size={12} /> {data.storage.savings_note}</span>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <Stat label="Total Encoded Storage" value={`${data.storage.used_gb} GB`} sub={`of ${data.storage.total_gb} GB · ${usedPct}% used`} icon={HardDrive} />
          <Stat label="Egress Bandwidth" value={`${data.storage.egress_gb} GB`} sub="this month" icon={Server} />
          <Stat label="Monthly Cost" value={`₹${data.storage.monthly_cost_inr.toFixed(2)}`} sub={data.storage.savings_note} icon={Sparkles} />
        </div>
        <div className="mt-6 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB]" style={{ width: `${usedPct}%` }} />
        </div>
      </div>

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
  );
}
