"use client";

import { useState } from "react";
import Image from "next/image";
import {
  mediaItems,
  youtubeThumbnailUrl,
  youtubeWatchUrl,
} from "@/lib/media";
import Reveal from "./Reveal";

/**
 * MediaSpotlight — bloco editorial de destaque de mídia.
 *
 * Layout: vídeo principal grande à esquerda (facade YouTube — só carrega
 * iframe depois do clique) + 3 cards menores à direita. Os 4 itens são
 * os primeiros do `mediaItems`. Pra trocar o destaque, basta reordenar
 * `lib/media.ts`.
 *
 * Facade evita carregar o player do YouTube na visita inicial — só usa
 * thumbnail estática. Melhora LCP e CLS dramaticamente.
 */
export default function MediaSpotlight() {
  const [main, secondary1, secondary2, secondary3] = mediaItems;
  const secondaries = [secondary1, secondary2, secondary3].filter(Boolean);
  const [playing, setPlaying] = useState(false);

  if (!main) return null;

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      {/* ── Vídeo principal (facade) ─────────────────────────────────── */}
      <div className="lg:col-span-7">
        <Reveal>
          <div className="relative aspect-video overflow-hidden bg-ink-900 shadow-xl shadow-ink-900/15">
            {playing ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${main.id}?autoplay=1&rel=0`}
                title={main.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                className="group absolute inset-0 cursor-pointer"
                aria-label={`Assistir: ${main.title}`}
              >
                <Image
                  src={youtubeThumbnailUrl(main.id)}
                  alt={main.title}
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-editorial group-hover:scale-[1.02]"
                  priority={false}
                />
                {/* gradient overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/60 via-ink-900/0 to-ink-900/0" />
                {/* play button */}
                <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-paper-100/95 shadow-2xl backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="translate-x-[2px] text-ink-900"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                {/* channel chip top-left */}
                <span className="absolute left-5 top-5 inline-flex items-center bg-paper-100/95 px-3 py-1.5 text-[0.7rem] uppercase tracking-wider2 text-ink-900 backdrop-blur-sm">
                  {main.channel}
                  {main.program ? ` · ${main.program}` : ""}
                </span>
              </button>
            )}
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="mt-6">
            <h3 className="font-serif text-[1.7rem] leading-[1.18] tracking-editorial text-ink-900 md:text-[2rem]">
              {main.title}
            </h3>
            {main.context && (
              <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-600">
                {main.context}
              </p>
            )}
          </div>
        </Reveal>
      </div>

      {/* ── 3 cards secundários ──────────────────────────────────────── */}
      <div className="lg:col-span-5">
        <Reveal delay={0.1}>
          <div className="mb-6 flex items-baseline justify-between border-b border-ink-900/10 pb-3">
            <span className="text-[0.7rem] uppercase tracking-wider3 text-muted-500">
              Outras aparições recentes
            </span>
          </div>
        </Reveal>
        <ul className="grid gap-7">
          {secondaries.map((item, i) => (
            <Reveal key={item.id} delay={0.15 + i * 0.06}>
              <li>
                <a
                  href={youtubeWatchUrl(item.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group grid grid-cols-12 gap-5"
                >
                  <div className="relative col-span-5 aspect-video overflow-hidden bg-ink-800">
                    <Image
                      src={youtubeThumbnailUrl(item.id)}
                      alt={item.title}
                      fill
                      sizes="(min-width: 1024px) 20vw, 40vw"
                      className="object-cover transition-transform duration-500 ease-editorial group-hover:scale-[1.06]"
                    />
                  </div>
                  <div className="col-span-7">
                    <div className="text-[0.65rem] uppercase tracking-wider2 text-gold-600">
                      {item.channel}
                      {item.program ? ` · ${item.program}` : ""}
                    </div>
                    <div className="mt-1.5 font-serif text-[1.02rem] leading-[1.22] tracking-editorial text-ink-900 transition-colors group-hover:text-navy-800">
                      {item.title}
                    </div>
                  </div>
                </a>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </div>
  );
}
