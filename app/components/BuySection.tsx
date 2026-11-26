"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SIZES, PRICE_CENTS, MAX_QTY, BOX_CONTENTS, formatPrice, type Size } from "@/lib/catalog";
import SizeChart from "./SizeChart";

// src: null = placeholder until the real photo is added to /public
const IMAGES: { src: string | null; alt: string }[] = [
  { src: "/product-main.jpg", alt: "Sauna Briefs in black" },
  { src: "/product-alt.jpg", alt: "Sauna Briefs with ice pack pouch" },
  { src: "/product-gel.jpg", alt: "Slim gel ice pack" },
  { src: null, alt: "Pouch open" },
  { src: null, alt: "Ice pack being inserted" },
  { src: null, alt: "On-body side view" },
];

type Stock = Record<Size, number> | null; // null = unknown; the server is the real gate

export default function BuySection() {
  const [stock, setStock] = useState<Stock>(null);
  const [size, setSize] = useState<Size | null>(null);
  const [qty, setQty] = useState(1);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState(0);
  const [chartOpen, setChartOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/stock", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => alive && setStock(d?.stock ?? null))
      .catch(() => alive && setStock(null));
    return () => {
      alive = false;
    };
  }, []);

  // Browser Back from Stripe can restore this page from the back/forward cache with the button still pending.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => e.persisted && setPending(false);
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  const inStock = (s: Size) => stock === null || stock[s] > 0;
  const allSoldOut = stock !== null && SIZES.every((s) => stock[s] <= 0);
  const maxQty = size && stock ? Math.min(MAX_QTY, stock[size]) : MAX_QTY;

  const pickSize = (s: Size) => {
    setSize(s);
    setError(null);
    const cap = stock ? Math.min(MAX_QTY, stock[s]) : MAX_QTY;
    setQty((q) => Math.max(1, Math.min(q, cap)));
  };

  const buy = async () => {
    if (pending) return;
    if (!size) {
      setError("Pick a size first.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ size, quantity: qty }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        window.location.assign(data.url);
        return; // keep the button disabled while the browser leaves
      }
      setError(data.error ?? "Checkout is unavailable right now. Please try again.");
    } catch {
      setError("Checkout is unavailable right now. Please try again.");
    }
    setPending(false);
  };

  return (
    <section className="product" id="shop">
      <div className="buy-gallery">
        <div className="product-visual">
          {IMAGES[image].src ? (
            <Image
              src={IMAGES[image].src}
              alt={IMAGES[image].alt}
              fill
              quality={90}
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div className="img-placeholder" role="img" aria-label={`${IMAGES[image].alt} (photo coming soon)`}>
              <span>{IMAGES[image].alt}</span>
              <small>Photo coming soon</small>
            </div>
          )}
          <div className="product-tag">The Original</div>
        </div>
        <div className="buy-thumbs">
          {IMAGES.map((img, i) => (
            <button
              key={img.alt}
              className={`buy-thumb${i === image ? " is-active" : ""}`}
              onClick={() => setImage(i)}
              aria-label={`Show image ${i + 1}: ${img.alt}`}
            >
              {img.src ? (
                <Image src={img.src} alt="" fill sizes="120px" style={{ objectFit: "cover" }} />
              ) : (
                <div className="img-placeholder is-thumb"><span>{img.alt}</span></div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="product-info">
        <p className="product-label">Sauna Briefs™ · Black</p>
        <h2 className="product-name">
          Built For<em>The Heat.</em>
        </h2>
        <div className="product-price-row">
          <span className="product-price">{formatPrice(PRICE_CENTS)}</span>
          <span className="product-price-note">Free US shipping</span>
        </div>

        <div className="buy-box">
          <p className="buy-box-label">What&apos;s in the box</p>
          <ul>
            {BOX_CONTENTS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="buy-box-note">Ice packs are reusable.</p>
        </div>

        <div className="buy-row-label">
          <span>Size</span>
          <button className="buy-link" onClick={() => setChartOpen(true)}>Size chart</button>
        </div>
        <div className="size-grid">
          {SIZES.map((s) => {
            const out = !inStock(s);
            return (
              <button
                key={s}
                className={`size-btn${size === s ? " is-selected" : ""}${out ? " is-out" : ""}`}
                onClick={() => pickSize(s)}
                disabled={out}
                aria-disabled={out}
                aria-pressed={size === s}
                aria-label={out ? `${s} — sold out` : s}
              >
                {s}
              </button>
            );
          })}
        </div>

        <div className="buy-action">
          <div className="qty">
            <button aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}>
              −
            </button>
            <span data-testid="qty">{qty}</span>
            <button
              aria-label="Increase quantity"
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              disabled={qty >= maxQty}
            >
              +
            </button>
          </div>
          <button className="product-btn" onClick={buy} disabled={pending || allSoldOut}>
            {allSoldOut ? "Sold out" : pending ? "Opening checkout…" : "Buy Now"}
          </button>
        </div>
        {error && (
          <p className="buy-error" role="alert">
            {error}
          </p>
        )}
        <div className="buy-pay" aria-label="Payment options at checkout">
          <span className="buy-pay-label">Pay with</span>
          <span className="pay-badge">Apple Pay</span>
          <span className="pay-badge">Google Pay</span>
          <span className="pay-badge">Link</span>
          <span className="pay-badge">Card</span>
        </div>
        <p className="buy-tax">+ tax where applicable</p>
        <div className="buy-trust">
          <span>Free US shipping</span>
          <Link href="/returns">30-day size exchanges</Link>
          <span>Secure checkout by Stripe</span>
        </div>
      </div>
      <SizeChart open={chartOpen} onClose={() => setChartOpen(false)} />
    </section>
  );
}
