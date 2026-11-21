"use client";

import { useRef } from "react";
import Image from "next/image";
import BuySection from "./components/BuySection";
import Faq from "./components/Faq";
import Footer from "./components/Footer";
import StickyBuyBar from "./components/StickyBuyBar";
import { PRICE_CENTS, formatPrice } from "@/lib/catalog";

const TICKER_ITEMS = [
  { stat: "80°C", text: "average sauna temp" },
  { stat: "+37°C", text: "threshold for sperm damage" },
  { stat: "−12%", text: "testosterone from chronic heat" },
  { stat: null, text: "your sessions. ", bold: "your biology. protected." },
];

const PRICE = formatPrice(PRICE_CENTS);

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const tickerItems = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <>
      <nav>
        <div className="nav-logo">Sauna Briefs</div>
        <div className="nav-right">
          <a href="#science" className="nav-link">Science</a>
          <a href="#faq" className="nav-link">How It Works</a>
          <a href="#shop" className="nav-btn">Shop — {PRICE}</a>
        </div>
      </nav>

      <div className="hero" ref={heroRef} style={{ position: "relative" }}>
        <Image
          className="hero-img"
          src="/hero.jpg"
          alt="Man in a sauna wearing Sauna Briefs"
          fill
          sizes="100vw"
          quality={90}
          style={{ objectFit: "cover" }}
          priority
        />
        <div className="hero-overlay-bottom" />
        <div className="hero-overlay-left" />
        <div className="hero-glow" />
        <div className="hero-content">
          <div className="hero-left">
            <h1>
              <span className="h1-line1">All The Heat.</span>
              <em>None Of The Damage.</em>
            </h1>
          </div>
          <div className="hero-right">
            <p className="hero-desc">
              The Original Sauna Briefs™ — with a built-in ice pack pouch. Sauna as long as you want, without cooking
              your testosterone or fertility.
            </p>
            <a href="#shop" className="hero-cta">Shop now</a>
            <p className="hero-fine">
              <strong>{PRICE}</strong> · Free US shipping
            </p>
          </div>
        </div>
      </div>

      <div className="ticker">
        <div className="ticker-inner">
          {tickerItems.map((item, i) => (
            <div key={i} className="ticker-item">
              {item.stat && <span>{item.stat}</span>}
              {item.text}
              {item.bold && <span>{item.bold}</span>}
              <div className="ticker-dot" />
            </div>
          ))}
        </div>
      </div>

      <div className="below" id="science">
        <h2>
          The Sauna<br />Is Good.<br />
          <em>The Heat<br />Isn&apos;t.</em>
        </h2>
        <div>
          <div className="below-stat">
            <div className="below-stat-num">+37°C</div>
            <div className="below-stat-text">
              The temperature at which sperm production begins to drop. Your sauna runs at 80°C. Do the math.
            </div>
          </div>
          <div className="below-stat">
            <div className="below-stat-num">−12%</div>
            <div className="below-stat-text">
              Reduction in testosterone linked to chronic scrotal heat exposure. Every session adds up.
            </div>
          </div>
          <div className="below-stat">
            <div className="below-stat-num">72h</div>
            <div className="below-stat-text">
              How long sperm suppression can last after a single sauna session. You didn&apos;t know that. Now you do.
            </div>
          </div>
        </div>
      </div>

      <BuySection />
      <Faq />
      <Footer />
      <StickyBuyBar heroRef={heroRef} />
    </>
  );
}
