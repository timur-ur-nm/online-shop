import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { heroSlides } from "../../data/db";

const SLIDES = heroSlides.length;

export default function HeroSection() {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (index: number) => setCurrent(index);

  return (
    <div className="relative h-[280px] overflow-hidden rounded-lg sm:h-[360px] lg:h-[440px]">
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            className="relative h-full w-full shrink-0 overflow-hidden"
          >
            <img
              src={slide.background}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="container relative mx-auto flex h-full flex-col items-center justify-between px-4 pt-4 md:flex-row md:items-center md:justify-center md:py-0">
              <div className="flex max-h-[70%] flex-col items-center justify-center text-right text-black sm:max-h-[50%] md:max-h-[80%] md:items-start lg:max-h-[100%]">
                <h2 className="text-3xl font-bold md:text-6xl">
                  {t("pages.hero.title")}
                </h2>
                <p className="mt-2 text-xl font-semibold md:text-3xl">
                  {t("pages.hero.price")}
                </p>
              </div>
              <img
                src={slide.phoneImage}
                alt={t("pages.hero.title")}
                className="max-h-[70%] w-auto object-contain sm:max-h-[50%] md:max-h-[80%] md:self-end lg:max-h-[100%]"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Previous"
        onClick={() => goTo((current - 1 + SLIDES) % SLIDES)}
        className="absolute left-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-700 transition-colors hover:bg-white"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={() => goTo((current + 1) % SLIDES)}
        className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-700 transition-colors hover:bg-white"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
