

import HeroSection from "./Home/HeroSection";
import PopularProducts from "./Home/PopularProducts";
import PromoBanner from "./Home/PromoBanner";
import NewArrivals from "./Home/NewArrivals";
import Benefits from "./Home/Benefits";
import Newsletter from "./Home/Newsletter";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <PopularProducts />
      <PromoBanner />
      <NewArrivals />
      <Benefits />
      <Newsletter />
    </div>
  );
}
