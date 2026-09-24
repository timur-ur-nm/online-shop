import { useEffect, useState } from "react";
import promo from "../../assets/promo.png";

const SLIDES = 3;

export default function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (index: number) => setCurrent(index);

  return (
    <div className="relative overflow-hidden rounded-lg">
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {Array.from({ length: SLIDES }).map((_, i) => (
          <img key={i} src={promo} alt="promo" className="w-full shrink-0 object-cover" />
        ))}
      </div>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {Array.from({ length: SLIDES }).map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Slide ${i + 1}`}
            onClick={() => goTo(i)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i === current ? "w-6 bg-[#0071E4]" : "w-2.5 bg-white/70 hover:bg-white"
            }`}
          />
        ))}
      </div>

      <button
        type="button"
        aria-label="Previous"
        onClick={() => goTo((current - 1 + SLIDES) % SLIDES)}
        className="absolute left-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-700 transition-colors hover:bg-white"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={() => goTo((current + 1) % SLIDES)}
        className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-700 transition-colors hover:bg-white"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}