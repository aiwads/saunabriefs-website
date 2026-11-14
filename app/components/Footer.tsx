import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <Link href="/" className="nav-logo">Sauna Briefs</Link>
        <div className="footer-links" role="navigation" aria-label="Policies">
          <Link href="/returns">Returns &amp; Exchanges</Link>
          <Link href="/shipping">Shipping</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <a href="mailto:hello@saunabriefs.com">hello@saunabriefs.com</a>
        </div>
        <p className="footer-copy">© 2026 Sauna Briefs</p>
      </div>
    </footer>
  );
}
