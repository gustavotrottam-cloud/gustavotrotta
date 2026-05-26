import Image from "next/image";
import {
  mediaItems,
  youtubeThumbnailUrl,
  youtubeWatchUrl,
} from "@/lib/media";
import Reveal from "./Reveal";

/**
 * MediaGrid — grade completa de aparições.
 * `skipFirst` permite excluir os N primeiros (usado quando MediaSpotlight
 * já os destaca acima e queremos evitar duplicação).
 */
export default function MediaGrid({ skipFirst = 0 }: { skipFirst?: number } = {}) {
  const items = skipFirst > 0 ? mediaItems.slice(skipFirst) : mediaItems;
  if (items.length === 0) return null;
  return (
    <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <Reveal key={item.id} delay={(i % 3) * 0.08}>
          <a
            href={youtubeWatchUrl(item.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            <div className="relative aspect-video overflow-hidden bg-ink-800">
              <Image
                src={youtubeThumbnailUrl(item.id)}
                alt={item.title}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 ease-editorial group-hover:scale-[1.04]"
              />
              {/* hover overlay + play icon */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink-900/0 transition-colors duration-300 group-hover:bg-ink-900/35">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-paper-100/95 opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 scale-90">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-ink-900 translate-x-[1px]"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </div>
            </div>
            <div className="mt-5">
              <div className="text-[0.7rem] uppercase tracking-wider2 text-gold-600">
                {item.channel}
                {item.program ? ` · ${item.program}` : ""}
              </div>
              <h3 className="mt-3 font-serif text-[1.25rem] leading-[1.22] tracking-editorial text-ink-900 transition-colors duration-300 group-hover:text-navy-800">
                {item.title}
              </h3>
            </div>
          </a>
        </Reveal>
      ))}
    </div>
  );
}
