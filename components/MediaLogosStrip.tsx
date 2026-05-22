import Reveal from "./Reveal";

/**
 * Monochrome wordmark strip — visual stand-in for a real "as seen on" logo wall.
 * Each channel name carries a typographic treatment that gestures at its real
 * brand identity (CNN's heavy condensed, VEJA's bold italic, etc.) while
 * staying in the editorial palette. Swap for real SVG logos when available.
 */
const channels = [
  { name: "CNN BRASIL", className: "font-black tracking-tighter" },
  { name: "JOVEM PAN", className: "font-extrabold tracking-tighter" },
  { name: "VEJA+", className: "font-extrabold italic tracking-tight" },
  { name: "RECORD NEWS", className: "font-bold tracking-wide" },
  { name: "Money Times", className: "font-medium tracking-normal normal-case" },
  { name: "JORNAL DA RECORD", className: "font-serif font-semibold tracking-tight" },
];

export default function MediaLogosStrip() {
  return (
    <Reveal>
      <div className="border-y border-ink-900/15 py-10 md:py-12">
        <div className="text-center">
          <div className="eyebrow">Vistos em</div>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-5 text-ink-900/75 md:gap-x-14 lg:gap-x-16">
            {channels.map((c) => (
              <span
                key={c.name}
                className={`text-[1rem] uppercase md:text-[1.2rem] ${c.className}`}
              >
                {c.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
