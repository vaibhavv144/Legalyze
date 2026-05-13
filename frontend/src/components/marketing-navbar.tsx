import { Scale, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

export function MarketingNavbar({ loggedIn }: { loggedIn: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return (
    <header
      className={`sticky top-0 z-50 transition-all ${
        scrolled
          ? "border-b border-slate-800/80 bg-[#050b18]/75 shadow-[0_12px_40px_rgba(2,6,23,0.5)] backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto mt-3 flex max-w-[1400px] items-center justify-between rounded-2xl border border-slate-800/80 bg-[#060c1c]/65 px-4 py-3 backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white">
            <Scale className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-wide text-slate-100">Legalyze</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <a className="transition hover:text-white" href="#features">Features</a>
          <a className="transition hover:text-white" href="#how">How it works</a>
          <a className="transition hover:text-white" href="#pricing">Pricing</a>
          <a className="transition hover:text-white" href="#about">About</a>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {loggedIn ? (
            <Link to="/app/dashboard">
              <Button className="h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-[0_10px_30px_rgba(37,99,235,0.4)]">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-slate-200 hover:bg-slate-800 hover:text-white">Login</Button>
              </Link>
              <Link to="/register">
                <Button className="h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-[0_10px_30px_rgba(37,99,235,0.4)]">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>
        <button className="text-slate-200 md:hidden">
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
