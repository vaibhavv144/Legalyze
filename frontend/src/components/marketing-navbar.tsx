import { Scale, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Use cases", href: "#use-cases" },
  { label: "Pricing", href: "#pricing" },
];

export function MarketingNavbar({ loggedIn }: { loggedIn: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-[#e8e6e1] bg-[#fbfbfa]/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex w-full max-w-[1536px] items-center justify-between px-6 py-4 md:px-10 lg:px-20">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-[#161513] text-[#fbfbfa] transition-transform duration-300 group-hover:rotate-[-8deg]">
            <Scale className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-[#161513]">Legalyze</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative text-sm text-[#78736b] transition-colors hover:text-[#161513]"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-[#161513] transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {loggedIn ? (
            <Link
              to="/app/dashboard"
              className="rounded-md bg-[#0c0b0a] px-4 py-2 text-sm font-semibold text-white antialiased transition-colors hover:bg-[#2f2c28]"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-[#3a3a37] transition-colors hover:text-[#161513]"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-[#0c0b0a] px-4 py-2 text-sm font-semibold text-white antialiased transition-colors hover:bg-[#2f2c28] active:scale-[0.98]"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="grid h-9 w-9 place-items-center rounded-md text-[#161513] transition-colors hover:bg-[#f1efea] md:hidden"
        >
          {open ? <X className="h-5 w-5" strokeWidth={1.75} /> : <Menu className="h-5 w-5" strokeWidth={1.75} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[#e8e6e1] bg-[#fbfbfa] md:hidden">
          <nav className="mx-auto flex w-full max-w-[1536px] flex-col px-6 py-4 md:px-10 lg:px-20">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-[#e8e6e1] py-3 text-sm text-[#3a3a37] last:border-0"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-4 flex flex-col gap-2">
              {loggedIn ? (
                <Link
                  to="/app/dashboard"
                  className="rounded-md bg-[#0c0b0a] px-4 py-2.5 text-center text-sm font-semibold text-white antialiased"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-md border border-[#e8e6e1] px-4 py-2.5 text-center text-sm font-medium text-[#161513]"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-md bg-[#0c0b0a] px-4 py-2.5 text-center text-sm font-semibold text-white antialiased"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
