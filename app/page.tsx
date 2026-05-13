"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const TICKER_ITEMS = [
  { stat: "80°C", text: "average sauna temp" },
  { stat: "+37°C", text: "threshold for sperm damage" },
  { stat: "−12%", text: "testosterone from chronic heat" },
  { stat: null, text: "your sessions. ", bold: "your biology. protected." },
];

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [barVisible, setBarVisible] = useState(false);
  const [barDismissed, setBarDismissed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const update = () => {
      const heroBottom = hero.getBoundingClientRect().bottom;
      setBarVisible(heroBottom < window.innerHeight / 2);
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("waitlist-seen")) {
      const t = setTimeout(() => setModalOpen(true), 1000);
      return () => clearTimeout(t);
    }
  }, []);

  const closeModal = () => {
    localStorage.setItem("waitlist-seen", "1");
    setModalOpen(false);
  };

  const tickerItems = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <>
      <nav>
        <div className="nav-logo">Sauna Briefs</div>
        <div className="nav-right">
          <span className="nav-link">Science</span>
          <span className="nav-link">How It Works</span>
          <a href="#waitlist" className="nav-btn">Waitlist</a>
        </div>
      </nav>

      <div className="hero" ref={heroRef} style={{ position: "relative" }}>
        <Image
          className="hero-img"
          src="/winner.png"
          alt="Sauna Briefs"
          fill
          sizes="100vw"
          quality={90}
          style={{ objectFit: "cover", objectPosition: "center 30%" }}
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
            <p className="hero-right-label">Early Access</p>
            <p className="hero-desc">
              The Original Sauna Briefs™ — with a built-in ice pack pouch. Sauna as long as
              you want, without cooking your testosterone or fertility.
            </p>
            <div id="waitlist" className="hero-form-row">
              <input type="email" placeholder="your@email.com" />
              <button>Get Access</button>
            </div>
            <p className="hero-fine">
              <strong>20% off at launch</strong> · No spam.
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

      <div className="below">
        <h2>
          The Sauna<br />Is Good.<br />
          <em>The Heat<br />Isn&apos;t.</em>
        </h2>
        <div>
          <div className="below-stat">
            <div className="below-stat-num">+37°C</div>
            <div className="below-stat-text">
              The temperature at which sperm production begins to drop. Your sauna runs at
              80°C. Do the math.
            </div>
          </div>
          <div className="below-stat">
            <div className="below-stat-num">−12%</div>
            <div className="below-stat-text">
              Reduction in testosterone linked to chronic scrotal heat exposure. Every
              session adds up.
            </div>
          </div>
          <div className="below-stat">
            <div className="below-stat-num">72h</div>
            <div className="below-stat-text">
              How long sperm suppression can last after a single sauna session. You
              didn&apos;t know that. Now you do.
            </div>
          </div>
        </div>
      </div>

      <div className="product">
        <div className="product-visual" style={{ position: "relative" }}>
          <Image
            src="/product-hero-v4.png"
            alt="Sauna Briefs product"
            fill
            quality={95}
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
          />
          <div className="product-tag">The Original</div>
        </div>
        <div className="product-info">
          <p className="product-label">Sauna Briefs™</p>
          <h2 className="product-name">
            Built For<br /><em>The Heat.</em>
          </h2>
          <p className="product-desc">
            The only brief engineered for the sauna — with a built-in ice pack pouch to
            keep your core temperature where it belongs.
          </p>
          <div className="product-feature-list">
            <div className="product-feature">
              <div className="product-feature-dot" />
              <div className="product-feature-text">
                Built-in ice pack pouch — holds a standard slim ice pack
              </div>
            </div>
            <div className="product-feature">
              <div className="product-feature-dot" />
              <div className="product-feature-text">
                Heat-resistant, moisture-wicking performance fabric
              </div>
            </div>
            <div className="product-feature">
              <div className="product-feature-dot" />
              <div className="product-feature-text">
                Designed to be worn for full sauna sessions
              </div>
            </div>
          </div>
          <div className="product-price-row">
            <span className="product-price">$49</span>
            <span className="product-price-note">20% off at launch</span>
          </div>
          <div className="product-cta">
            <button className="product-btn">Notify Me at Launch</button>
            <p className="product-btn-note">Launching soon — be first in line.</p>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>
            <p className="modal-eyebrow">Early Access</p>
            <h2 className="modal-headline">
              Protect What<br /><em>Matters.</em>
            </h2>
            <p className="modal-desc">
              Join the waitlist and get <strong>20% off</strong> when Sauna Briefs launches.
              No spam. Just your spot in line.
            </p>
            <div className="modal-form-row">
              <input type="email" placeholder="your@email.com" />
              <button onClick={closeModal}>Join Waitlist</button>
            </div>
            <p className="modal-fine">20% off at launch · Unsubscribe anytime</p>
          </div>
        </div>
      )}

      {!barDismissed && (
        <div
          className="sticky-bar"
          style={{ opacity: barVisible ? 1 : 0, pointerEvents: barVisible ? "auto" : "none" }}
        >
          <span className="sticky-bar-label">20% off at launch</span>
          <div className="sticky-bar-email-row">
            <input type="email" placeholder="your@email.com" />
            <button>Join</button>
          </div>
          <button className="sticky-bar-close" onClick={() => setBarDismissed(true)}>✕</button>
        </div>
      )}
    </>
  );
}
