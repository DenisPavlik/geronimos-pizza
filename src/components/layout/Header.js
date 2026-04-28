"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useContext, useState } from "react";
import { CartContext } from "../AppContext";
import ShoppingCart from "@/components/icons/ShoppingCart";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function HamburgerButton({ open, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      className="w-10 h-10 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
    >
      <div className="w-6 flex flex-col gap-[5px] items-center">
        <span
          className={`block h-0.5 w-6 bg-gray-700 rounded-full origin-center
            transition-transform duration-300 ease-in-out motion-reduce:transition-none
            ${open ? "rotate-45 translate-y-[7px]" : ""}`}
        />
        <span
          className={`block h-0.5 bg-gray-700 rounded-full
            transition-all duration-200 ease-in-out motion-reduce:transition-none
            ${open ? "w-0 opacity-0" : "w-6 opacity-100"}`}
        />
        <span
          className={`block h-0.5 w-6 bg-gray-700 rounded-full origin-center
            transition-transform duration-300 ease-in-out motion-reduce:transition-none
            ${open ? "-rotate-45 -translate-y-[7px]" : ""}`}
        />
      </div>
    </button>
  );
}

function AuthLinks({ status, userName, onClose }) {
  if (status === "authenticated") {
    return (
      <>
        <Link
          href="/profile"
          onClick={onClose}
          className="whitespace-nowrap text-gray-600 font-josefin hover:text-primary transition-colors"
        >
          Hello, {userName}
        </Link>
        <button
          onClick={() => { signOut(); onClose?.(); }}
          className="!bg-primary !border-primary !text-white !rounded-full !px-8 !py-2 !w-auto hover:!opacity-90 transition-opacity"
        >
          Logout
        </button>
      </>
    );
  }
  if (status === "unauthenticated") {
    return (
      <>
        <Link
          href="/login"
          onClick={onClose}
          className="text-gray-600 font-josefin font-light text-lg hover:text-primary transition-colors text-center"
        >
          Login
        </Link>
        <Link
          href="/register"
          onClick={onClose}
          className="bg-primary text-white text-center font-josefin rounded-full px-8 py-3 text-lg hover:opacity-90 transition-opacity"
        >
          Register
        </Link>
      </>
    );
  }
  return null;
}

export default function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const session = useSession();
  const status = session?.status;
  const userData = session.data?.user;
  const { cartProducts } = useContext(CartContext);

  let userName = userData?.name || userData?.email;
  if (userName && userName.includes(" ")) {
    userName = userName.split(" ")[0];
  }

  const close = () => setMobileNavOpen(false);

  return (
    <header>
      {/* ── Mobile top bar ── */}
      <div className="flex items-center lg:hidden justify-between">
        <Link className="text-primary font-lilita text-3xl" href="/">
          Geronimo&apos;s pizza
        </Link>
        <div className="flex gap-4 items-center">
          <Link href="/cart" className="relative">
            <ShoppingCart />
            {cartProducts?.length > 0 && (
              <span className="absolute -top-2 -right-4 bg-primary text-white rounded-full text-xs p-1 leading-3 font-roboto">
                {cartProducts.length}
              </span>
            )}
          </Link>
          <HamburgerButton
            open={mobileNavOpen}
            onClick={() => setMobileNavOpen((prev) => !prev)}
          />
        </div>
      </div>

      {/* ── Mobile overlay + slide-down panel ── */}
      <div
        className={`fixed inset-0 z-50 lg:hidden
          transition-all duration-300 motion-reduce:transition-none
          ${mobileNavOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm
            transition-opacity duration-300 motion-reduce:transition-none
            ${mobileNavOpen ? "opacity-100" : "opacity-0"}`}
          onClick={close}
          aria-hidden="true"
        />

        {/* Panel */}
        <div
          className={`absolute top-0 left-0 right-0 bg-white rounded-b-3xl shadow-2xl
            px-6 pt-5 pb-10
            transition-transform duration-300 ease-out motion-reduce:transition-none
            ${mobileNavOpen ? "translate-y-0" : "-translate-y-full"}`}
        >
          {/* Panel header row */}
          <div className="flex justify-between items-center mb-8">
            <Link
              href="/"
              className="text-primary font-lilita text-3xl"
              onClick={close}
            >
              Geronimo&apos;s pizza
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/cart" className="relative" onClick={close}>
                <ShoppingCart />
                {cartProducts?.length > 0 && (
                  <span className="absolute -top-2 -right-4 bg-primary text-white rounded-full text-xs p-1 leading-3 font-roboto">
                    {cartProducts.length}
                  </span>
                )}
              </Link>
              <HamburgerButton open={mobileNavOpen} onClick={close} />
            </div>
          </div>

          {/* Nav links with stagger */}
          <nav aria-label="Mobile navigation">
            {NAV_LINKS.map(({ href, label }, i) => (
              <div
                key={href}
                className={`transition-[opacity,transform] duration-300 ease-out motion-reduce:translate-x-0 motion-reduce:opacity-100
                  ${mobileNavOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-5"}`}
                style={{ transitionDelay: mobileNavOpen ? `${i * 55 + 120}ms` : "0ms" }}
              >
                <Link
                  href={href}
                  onClick={close}
                  className="flex items-center justify-between font-josefin text-2xl font-light text-gray-700
                    py-4 border-b border-gray-100 last:border-0
                    hover:text-primary hover:pl-2 transition-[color,padding-left] duration-150"
                >
                  {label}
                  <span className="text-gray-300 text-lg">›</span>
                </Link>
              </div>
            ))}
          </nav>

          {/* Auth section */}
          <div
            className={`flex flex-col gap-3 mt-8
              transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none
              ${mobileNavOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
            style={{ transitionDelay: mobileNavOpen ? "360ms" : "0ms" }}
          >
            <AuthLinks status={status} userName={userName} onClose={close} />
          </div>
        </div>
      </div>

      {/* ── Desktop nav (unchanged) ── */}
      <div className="hidden lg:flex items-center justify-between">
        <nav className="flex items-center gap-8 text-gray-500 font-josefin">
          <Link className="text-primary relative -top-1 font-lilita text-3xl" href="/">
            Geronimo&apos;s pizza
          </Link>
          <Link href="/">Home</Link>
          <Link href="/menu">Menu</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <nav className="flex items-center gap-4 text-gray-500 font-josefin">
          <AuthLinks status={status} userName={userName} />
          <Link href="/cart" className="relative">
            <ShoppingCart />
            {cartProducts?.length > 0 && (
              <span className="absolute -top-2 -right-4 bg-primary text-white rounded-full text-xs p-1 leading-3 font-roboto">
                {cartProducts.length}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
