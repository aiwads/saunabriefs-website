"use client";

import { useRef } from "react";
import Image from "next/image";
import BuySection from "./components/BuySection";
import Faq from "./components/Faq";
import Footer from "./components/Footer";
import StickyBuyBar from "./components/StickyBuyBar";
import { PRICE_CENTS, formatPrice } from "@/lib/catalog";

const TICKER_ITEMS = [
  { stat: "180°F", text: "average sauna temp" },
  { stat: null, text: "Your sessions. Your rules. ", bold: "Stay cool." },
];

const PRICE = formatPrice(PRICE_CENTS);

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  // The marquee scrolls by 50%, so it needs two identical halves; each half repeats the short item list
  // three times so the bar stays full on wide screens.
  const tickerHalf = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];
  const tickerItems = [...tickerHalf, ...tickerHalf];

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
          sizes="(max-width: 768px) 178vh, 100vw"
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
              <span className="h1-line1">Feel The Burn.</span>
              <em>Just Not Down There.</em>
            </h1>
          </div>
          <div className="hero-right">
            <p className="hero-desc">
              Your body loves the heat. Your boys don&apos;t. The Original Sauna Briefs™ keep an ice pack right where it
              counts.
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
          <em>The Heat<br />Down There<br />Isn&apos;t.</em>
        </h2>
        <div>
          <div className="below-stat">
            <div className="below-stat-label">Built to run cool</div>
            <div className="below-stat-num">Under 95°F</div>
            <div className="below-stat-text">
              Where your boys need to stay to make healthy sperm, a few degrees cooler than the rest of your body.
              That&apos;s why they hang outside it.<sup><a href="#sources">1</a></sup>
            </div>
          </div>
          <div className="below-stat">
            <div className="below-stat-label">Then you hit the sauna</div>
            <div className="below-stat-num">104°F</div>
            <div className="below-stat-text">
              How hot your skin gets in a typical sauna.<sup><a href="#sources">2</a></sup> Studies have linked regular scrotal heating to
              lower sperm counts over time.<sup><a href="#sources">3</a></sup>
            </div>
          </div>
          {/* TODO: once the owner provides X, consider "[X]°F cooler — Inside the Sauna Briefs pouch after 15
              minutes in a 176°F sauna. (Our test.)" */}
          <div className="below-stat">
            <div className="below-stat-label">With Sauna Briefs</div>
            <div className="below-stat-num">0 compromises</div>
            <div className="below-stat-text">
              The full sauna session, with a built-in way to keep things cooler.
            </div>
          </div>
        </div>
      </div>

      <BuySection />
      <Faq />
      <Footer>
        <div className="footer-notes" id="sources">
          <p className="footer-notes-title">Sources</p>
          <ol>
            <li>
              <a href="https://pubmed.ncbi.nlm.nih.gov/16893399/" target="_blank" rel="noopener noreferrer">
                Song &amp; Seo, Int J Androl (2006)
              </a>
            </li>
            <li>
              <a href="https://pubmed.ncbi.nlm.nih.gov/11165553/" target="_blank" rel="noopener noreferrer">
                Hannuksela &amp; Ellahham, Am J Med (2001)
              </a>
            </li>
            <li>
              <a href="https://pubmed.ncbi.nlm.nih.gov/23411620/" target="_blank" rel="noopener noreferrer">
                Garolla et al., Human Reproduction (2013)
              </a>
            </li>
          </ol>
          <p className="footer-disclaimer">
            For general information only, not medical advice. Sauna Briefs is not a medical device and is not intended
            to diagnose, treat, or prevent any condition. Talk to your doctor about fertility concerns.
          </p>
        </div>
      </Footer>
      <StickyBuyBar heroRef={heroRef} />
    </>
  );
}
