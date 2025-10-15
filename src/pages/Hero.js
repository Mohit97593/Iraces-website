import React from "react";
import HeroCarousel from "../components/hero/HeroCarousel";
import HeroModal from "../components/hero/HeroModal";
import TopNav from "../components/Navbar/TopNav";

export default function Hero() {
  return (
    <div>
      <TopNav />
      <HeroCarousel />
      <HeroModal />
      {/* below the hero you can add more sections later */}
    </div>
  );
}
