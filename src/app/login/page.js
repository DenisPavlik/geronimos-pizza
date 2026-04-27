"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AuthCard from "@/components/layout/AuthCard";


function EmailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginInProgress, setLoginInProgress] = useState(false);

  async function handleFormSubmit(ev) {
    ev.preventDefault();
    setLoginInProgress(true);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: "/",
    });

    console.log("🧪 signIn result:", result);

    if (result?.error) {
      alert("Login failed: " + result.error);
    } else {
      window.location.href = result.url || "/";
    }

    setLoginInProgress(false);
  }

  return (
    <AuthCard>
      {/* Brand icon */}
      <div className="flex justify-center mb-5">
        <div className="bg-primary/10 rounded-full p-3">
          <Image src="/pizza_slice.png" alt="" width={38} height={38} />
        </div>
      </div>

      {/* Heading */}
      <h1 className="font-josefin text-2xl font-bold text-center text-gray-800 mb-1">
        Welcome back
      </h1>
      <p className="text-center text-gray-400 text-sm font-josefin mb-7">
        Sign in to continue ordering your favorite pizza.
      </p>

      {/* Form */}
      <form onSubmit={handleFormSubmit}>
        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-500 font-josefin uppercase tracking-wide">
            Email address
          </label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <EmailIcon />
            </span>
            <input
              type="email"
              name="email"
              placeholder="email@example.com"
              value={email}
              disabled={loginInProgress}
              onChange={(ev) => setEmail(ev.target.value)}
              style={{ paddingLeft: "2.25rem", marginBottom: 0 }}
            />
          </div>
        </div>

        <div className="mb-2">
          <label className="text-xs font-semibold text-gray-500 font-josefin uppercase tracking-wide">
            Password
          </label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <LockIcon />
            </span>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={password}
              disabled={loginInProgress}
              onChange={(ev) => setPassword(ev.target.value)}
              style={{ paddingLeft: "2.25rem", marginBottom: 0 }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loginInProgress}
          className="mt-5 py-3"
          style={{ borderRadius: "9999px" }}
        >
          Sign In
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-josefin whitespace-nowrap">
          or continue with
        </span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Google */}
      <button
        type="button"
        className="rounded-full bg-white py-3 items-center gap-3 border-gray-200 text-gray-600 font-josefin"
        onClick={() => signIn("google", { callbackUrl: "/" })}
      >
        <Image src="/google.png" alt="google" width={20} height={20} />
        Continue with Google
      </button>

      {/* Switch link */}
      <p className="text-center text-sm text-gray-400 font-josefin mt-6">
        Don&apos;t have an account?{" "}
        <Link
          className="text-primary font-semibold hover:underline"
          href="/register"
        >
          Register here &rsaquo;
        </Link>
      </p>
    </AuthCard>
  );
}
