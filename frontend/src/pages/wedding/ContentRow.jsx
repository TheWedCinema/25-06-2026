import { Play, Share2 } from "lucide-react";

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

export default function ContentRow({ row, onPlay }) {
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
