import Link from "next/link";
import Footer from "./Footer";

export default function PolicyPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="policy-nav">
        <Link href="/" className="nav-logo">Sauna Briefs</Link>
        <Link href="/#shop" className="nav-btn">Shop</Link>
      </div>
      <main className="policy">
        <h1>{title}</h1>
        {updated && <p className="policy-updated">Last updated {updated}</p>}
        <div className="policy-body">{children}</div>
      </main>
      <Footer />
    </>
  );
}
