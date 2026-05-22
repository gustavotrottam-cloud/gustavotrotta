/**
 * Editorial portrait placeholder.
 * Replace with a real <Image /> once Gustavo's professional photo is available.
 * Designed to read as "premium editorial portrait" even while empty.
 */
export default function PortraitFrame({
  caption,
  ratio = "portrait",
}: {
  caption?: string;
  ratio?: "portrait" | "square" | "wide";
}) {
  const aspect =
    ratio === "portrait" ? "aspect-[4/5]" : ratio === "square" ? "aspect-square" : "aspect-[16/10]";

  return (
    <figure className="relative">
      <div
        className={`relative overflow-hidden ${aspect} bg-gradient-to-br from-ink-800 via-navy-900 to-ink-700`}
      >
        <div className="grain absolute inset-0" />
        {/* subtle vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.55)_100%)]" />
        {/* monogram */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-serif text-[8rem] leading-none text-paper-100/10">GT</span>
        </div>
        {/* corner marks */}
        <span className="absolute left-4 top-4 h-3 w-3 border-l border-t border-paper-100/30" />
        <span className="absolute right-4 top-4 h-3 w-3 border-r border-t border-paper-100/30" />
        <span className="absolute left-4 bottom-4 h-3 w-3 border-l border-b border-paper-100/30" />
        <span className="absolute right-4 bottom-4 h-3 w-3 border-r border-b border-paper-100/30" />
      </div>
      {caption && (
        <figcaption className="mt-3 text-[0.72rem] uppercase tracking-wider2 text-muted-500">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
