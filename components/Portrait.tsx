import Image from "next/image";

/**
 * Editorial portrait with real photo support.
 * Renders a `next/image` with the editorial corner marks + optional caption.
 * If the source file is missing in `public/`, Next will 404 the image — the
 * surrounding frame still renders so the layout doesn't collapse.
 */
export default function Portrait({
  src,
  alt,
  caption,
  ratio = "portrait",
  priority = false,
  objectPosition = "center",
}: {
  src: string;
  alt: string;
  caption?: string;
  ratio?: "portrait" | "square" | "wide";
  priority?: boolean;
  objectPosition?: string;
}) {
  const aspect =
    ratio === "portrait"
      ? "aspect-[4/5]"
      : ratio === "square"
      ? "aspect-square"
      : "aspect-[16/10]";

  return (
    <figure className="relative">
      <div
        className={`relative overflow-hidden ${aspect} bg-gradient-to-br from-ink-800 via-navy-900 to-ink-700`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 42vw, 100vw"
          priority={priority}
          className="object-cover"
          style={{ objectPosition }}
        />
        {/* subtle vignette to integrate with the editorial palette */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_55%,_rgba(0,0,0,0.35)_100%)]" />
        {/* editorial corner marks */}
        <span className="pointer-events-none absolute left-4 top-4 h-3 w-3 border-l border-t border-paper-100/60" />
        <span className="pointer-events-none absolute right-4 top-4 h-3 w-3 border-r border-t border-paper-100/60" />
        <span className="pointer-events-none absolute left-4 bottom-4 h-3 w-3 border-l border-b border-paper-100/60" />
        <span className="pointer-events-none absolute right-4 bottom-4 h-3 w-3 border-r border-b border-paper-100/60" />
      </div>
      {caption && (
        <figcaption className="mt-3 text-[0.72rem] uppercase tracking-wider2 text-muted-500">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
