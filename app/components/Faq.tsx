import Link from "next/link";

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "What size should I get?",
    a: (
      <>
        Go by your normal underwear size and check the size chart in the shop section. Wrong call? Exchange unworn
        briefs for another size within 30 days.
      </>
    ),
  },
  {
    q: "How do I use it?",
    a: (
      <>
        Freeze both ice packs. Before you go in, slide one into the pouch at the front of the briefs. The spare rides in
        the cooler, so it&apos;s still cold when you swap mid-session or go back for round two.
      </>
    ),
  },
  {
    q: "How long does the ice pack stay cold?",
    a: (
      <>
        20+ minutes in a 180°F sauna. Staying longer or going back for round two? Swap in the spare from the cooler.
      </>
    ),
  },
  {
    q: "How do I wash them?",
    a: (
      <>
        Take the ice pack out first. Machine wash on a gentle cycle with similar colors, and tumble dry low. No bleach,
        and don&apos;t iron over the print. 95% cotton, 5% elastane.
      </>
    ),
  },
  {
    q: "Where do you ship, and how fast?",
    a: <>US only for now. Shipping is free and orders ship within 2 business days via USPS, with tracking by email.</>,
  },
  {
    q: "What's your return policy?",
    a: (
      <>
        Size exchanges within 30 days on unworn briefs with tags: you cover return shipping, we ship the new size
        free. Unopened kits can be returned within 30 days for a refund. Worn briefs can&apos;t be returned — hygiene.
        Anything arrives damaged, we replace it free. <Link href="/returns">Full policy →</Link>
      </>
    ),
  },
];

export default function Faq() {
  return (
    <section className="faq" id="faq">
      <h2>
        Questions.<em>Answered.</em>
      </h2>
      <div className="faq-list">
        {FAQS.map((item) => (
          <details key={item.q} className="faq-item">
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
