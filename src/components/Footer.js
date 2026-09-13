import Link from "next/link";
import Image from "next/image";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/resume-analysis", label: "Job match" },
      { href: "/analytics", label: "Analytics" },
      { href: "/section-improvement", label: "Improve" },
      { href: "/#pricing", label: "Pricing" },
    ],
  },
  { title: "Resources", links: [{ href: "/blog", label: "Blog" }] },
  {
    title: "Legal",
    links: [
      { href: "/privacy-policy", label: "Privacy policy" },
      { href: "/terms-of-service", label: "Terms of service" },
    ],
  },
];

// Server component: nothing here needs the client. The old version shipped
// framer-motion to fade the footer in, which communicated nothing.
export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-canvas">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid gap-10 py-12 md:grid-cols-[1fr_auto] md:gap-16">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image src="/logo.svg" alt="" width={24} height={24} />
              <span className="font-semibold tracking-tight text-ink">ResumeInsight</span>
            </Link>
            <p className="mt-3 text-sm text-ink-3">
              Resume feedback you can act on: a match score, the keywords you are missing, and rewrites you can paste in.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-14">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <h2 className="text-[13px] font-medium text-ink">{column.title}</h2>
                <ul className="mt-3 space-y-2.5 text-sm">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-ink-3 transition-colors hover:text-ink">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-line py-6 text-[13px] text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} ResumeInsight. Built by{" "}
            <a
              href="https://www.linkedin.com/in/varad-patil-web-dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-2 underline underline-offset-3 decoration-line-strong transition-colors hover:text-ink"
            >
              Varad Patil
            </a>
          </p>
          <p>Payments processed by Razorpay</p>
        </div>
      </div>
    </footer>
  );
}
