import Link from "next/link";

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "What size should I get?",
    a: (
      <>
        Go by your normal underwear size and check the size chart in the shop section. Wrong call? Size exchanges are
        free within 30 days on unworn briefs.
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
    // OWNER: confirm how long the pack stays cold in a real session
    q: "How long does the ice pack stay cold?",
    a: (
      <>
        Long enough for most of a typical session. On long or very hot sessions, swap in the spare from the cooler.
      </>
    ),
  },
  {
    // OWNER: confirm care instructions
    q: "How do I wash them?",
    a: <>Take the ice pack out, machine wash cold, hang dry. Skip the dryer to keep the fit and the pouch in shape.</>,
  },
  {
    q: "Where do you ship, and how fast?",
    a: <>US only for now. Shipping is free and orders ship within 2 business days via USPS, with tracking by email.</>,
  },
  {
    q: "What's your return policy?",
    a: (
      <>
        Free size exchanges within 30 days on unworn briefs with tags. Worn briefs can&apos;t be returned — hygiene.
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
