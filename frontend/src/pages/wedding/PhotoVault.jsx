import { Download } from "lucide-react";

export default function PhotoVault({ photos }) {
  return (
    <section className="py-12" data-testid="photo-vault">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="font-sans-twc text-[11px] uppercase tracking-[0.3em] text-[#D4AF37] mb-3">The Photo Vault</p>
            <h2 className="font-serif-twc text-4xl md:text-5xl text-[#FDFBF7] tracking-tight">High-resolution<br /><span className="italic text-zinc-400">memories.</span></h2>
          </div>
          <button className="bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-sans-twc text-xs uppercase tracking-[0.22em] px-5 py-3 rounded-sm transition inline-flex items-center gap-2" data-testid="vault-download-all">
            <Download size={14} /> Download All
          </button>
        </div>
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {photos.map((src) => (
            <div key={src} className="break-inside-avoid overflow-hidden rounded-md group cursor-zoom-in" data-testid={`photo-${photos.indexOf(src)}`}>
              <img src={src} alt="" loading="lazy" className="w-full h-auto transition-transform duration-700 group-hover:scale-105" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
