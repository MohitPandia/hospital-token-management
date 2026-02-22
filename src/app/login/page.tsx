"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [registerMode, setRegisterMode] = useState(false);
  const [hospitalName, setHospitalName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid email or password.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    if (!hospitalName.trim() || !registerEmail.trim() || !registerPassword.trim()) {
      setRegisterError("Please fill hospital name, email and password.");
      return;
    }
    setRegisterLoading(true);
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hospitalName: hospitalName.trim(),
          email: registerEmail.trim(),
          password: registerPassword,
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        setRegisterError(data.error || "Registration failed.");
        return;
      }
      const signInRes = await signIn("credentials", {
        email: registerEmail.trim(),
        password: registerPassword,
        redirect: false,
      });
      if (signInRes?.error) {
        setRegisterError("Registered. Please log in below.");
        setRegisterMode(false);
        setEmail(registerEmail.trim());
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col p-6 pb-[max(1.5rem,var(--safe-bottom))] max-w-md mx-auto justify-center">
      <Link
        href="/"
        className="self-start flex items-center gap-1 text-teal-700 font-medium mb-8 min-h-[var(--touch-min)]"
      >
        ← Back
      </Link>
      {registerMode ? (
        <>
          <h1 className="text-xl sm:text-2xl font-bold text-teal-900 mb-1">
            Register hospital
          </h1>
          <p className="text-teal-600 mb-6">Create your hospital account.</p>
          <form onSubmit={handleRegister} className="card p-6 space-y-5">
            <div>
              <label htmlFor="reg-hospital" className="label">Hospital name</label>
              <input
                id="reg-hospital"
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                required
                className="input-field"
                placeholder="e.g. Pandya Hospital"
              />
            </div>
            <div>
              <label htmlFor="reg-email" className="label">Admin email</label>
              <input
                id="reg-email"
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required
                autoComplete="email"
                className="input-field"
                placeholder="you@hospital.com"
              />
            </div>
            <div>
              <label htmlFor="reg-password" className="label">Password</label>
              <input
                id="reg-password"
                type="password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            {registerError && (
              <p className="text-sm text-red-600 font-medium">{registerError}</p>
            )}
            <button
              type="submit"
              disabled={registerLoading}
              className="btn-primary w-full py-4 text-lg"
            >
              {registerLoading ? "Registering…" : "Register"}
            </button>
          </form>
          <p className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setRegisterMode(false)}
              className="text-teal-700 font-semibold underline underline-offset-2 min-h-[var(--touch-min)] inline-flex items-center"
            >
              Already have an account? Log in
            </button>
          </p>
        </>
      ) : (
        <>
          <h1 className="text-xl sm:text-2xl font-bold text-teal-900 mb-1">Login</h1>
          <p className="text-teal-600 mb-6">Sign in to manage your hospital.</p>
          <form onSubmit={handleLogin} className="card p-6 space-y-5">
            <div>
              <label htmlFor="login-email" className="label">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="input-field"
                placeholder="you@hospital.com"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="label">Password</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-lg"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <p className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setRegisterMode(true)}
              className="text-teal-700 font-semibold underline underline-offset-2 min-h-[var(--touch-min)] inline-flex items-center"
            >
              New hospital? Register here
            </button>
          </p>
        </>
      )}
    </main>
  );
}
