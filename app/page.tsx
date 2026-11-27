"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import BuySection from "./components/BuySection";
import Faq from "./components/Faq";
import Footer from "./components/Footer";
import StickyBuyBar from "./components/StickyBuyBar";
import AnnouncementBar from "./components/AnnouncementBar";

const TICKER_ITEMS = [
  { stat: "180°F", text: "average sauna temp" },
  { stat: null, text: "Your sessions. Your rules. ", bold: "Stay cool." },
];

// Page background (--bg); used for the area Safari shows when you bounce past the bottom.
export const PAGE_DARK = "#0D0D0B";

// Icon row under the hero "Shop now" button.
const HERO_PERKS = [
  { label: "Ice pack pouch", icon: <path d="M12 2v20M4 6l16 12M20 6L4 18" /> },
  {
    label: "Cooler included",
    icon: (
      <>
        <rect x="3" y="7" width="18" height="12" rx="2" />
        <path d="M8 7V5h8v2" />
      </>
    ),
  },
  {
    label: "Free US shipping",
    icon: (
      <>
        <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" />
        <circle cx="7" cy="17" r="1.6" />
        <circle cx="17" cy="17" r="1.6" />
      </>
    ),
  },
];

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Safari fills the pull-down (overscroll) area with the html background colour. globals.css makes it
  // the bar blue on this page from first paint (html:has(.announce)); once scrolled down, switch it to
  // the dark page colour so the bounce below the footer stays dark.
  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      root.style.backgroundColor = window.scrollY < window.innerHeight / 2 ? "" : PAGE_DARK;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      root.style.backgroundColor = "";
    };
  }, []);
  // The marquee scrolls by 50%, so it needs two identical halves; each half repeats the short item list
  // three times so the bar stays full on wide screens.
  const tickerHalf = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];
  const tickerItems = [...tickerHalf, ...tickerHalf];

  return (
    <>
      <AnnouncementBar />
      <header className="site-header">
        <div className="header-left">
          <button
            type="button"
            className="menu-btn"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>
          <a href="#science" className="nav-link">Science</a>
          <a href="#faq" className="nav-link">FAQ</a>
        </div>
        <a
          href="/"
          className="header-logo"
          aria-label="Sauna Briefs home"
          onClick={(e) => {
            e.preventDefault();
            setMenuOpen(false);
            window.history.replaceState(null, "", "/");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <span className="header-logo-name">Sauna Briefs</span>
          <span className="header-tagline">Cooling sauna underwear</span>
        </a>
        <div className="header-right">
          <a href="#shop" className="header-shop">Shop</a>
        </div>
        <nav id="site-menu" className={menuOpen ? "site-menu is-open" : "site-menu"} aria-label="Main">
          {[
            ["#shop", "Shop"],
            ["#science", "Science"],
            ["#faq", "FAQ"],
          ].map(([href, label]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}>
              {label}
            </a>
          ))}
        </nav>
      </header>

      <div className="hero" ref={heroRef} style={{ position: "relative" }}>
        <Image
          className="hero-img"
          src="/hero-v2.jpg"
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
            <ul className="hero-perks">
              {HERO_PERKS.map((perk) => (
                <li key={perk.label}>
                  <span className="hero-perk-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      {perk.icon}
                    </svg>
                  </span>
                  {perk.label}
                </li>
              ))}
            </ul>
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
            <div className="below-stat-num is-cool">Under 95°F</div>
            <div className="below-stat-text">
              Where your boys need to stay to make healthy sperm, a few degrees cooler than the rest of your body.
              That&apos;s why they <span className="hang">hang</span> outside it.<sup><a href="#sources">1</a></sup>
            </div>
          </div>
          <div className="below-stat">
            <div className="below-stat-label">Then you hit the sauna</div>
            <div className="below-stat-num is-hot">104°F</div>
            <div className="below-stat-text">
              How hot your skin gets in a typical sauna.<sup><a href="#sources">2</a></sup> Studies have linked regular scrotal heating to
              lower sperm counts over time.<sup><a href="#sources">3</a></sup>
            </div>
          </div>
          <div className="below-stat">
            <div className="below-stat-label">Every degree counts</div>
            <div className="below-stat-num is-cream">~1.8°F</div>
            <div className="below-stat-text">
              In one study, cooling the scrotum by just ~1.8°F each night, along with a few habit changes, significantly
              raised sperm counts within 12 weeks.<sup><a href="#sources">4</a></sup>
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
            <li>
              <a href="https://pubmed.ncbi.nlm.nih.gov/11277880/" target="_blank" rel="noopener noreferrer">
                Jung et al., Reproduction (2001)
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
