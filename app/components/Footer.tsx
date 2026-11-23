import Link from "next/link";
import type { ReactNode } from "react";

export default function Footer({ children }: { children?: ReactNode }) {
  return (
    <footer className="site-footer">
      {children}
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
