
import { useState } from "react";
import { supabase } from "./supabaseClient";
import "./Auth.css";

export default function Auth() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  async function submit(event) {
    event.preventDefault();

    if (!supabase) {
      setMessage(
        "Supabase is not configured. Add your project URL and publishable key to .env.local, then restart Vite."
      );
      setMessageType("error");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        setMessageType("success");
        setMessage(
          data.session
            ? "Account created. You are signed in."
            : "Account created. Check your email to confirm your account, then sign in."
        );

        if (data.session) window.location.reload();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;
        window.location.reload();
      }
    } catch (error) {
      setMessageType("error");
      setMessage(error?.message || "Unable to continue. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-decoration auth-decoration-one" />
      <div className="auth-decoration auth-decoration-two" />

      <form className="auth-card" onSubmit={submit}>
        <div className="auth-brand-mark">P</div>

        <p className="auth-eyebrow">YOUR STORY, BEAUTIFULLY TOLD</p>

        <h1>
          Portfolio<span>Forge</span>
        </h1>

        <p className="auth-subtitle">
          {mode === "signin"
            ? "Welcome back! Sign in to manage your portfolios."
            : "Create an account and start building your portfolio."}
        </p>

        <label htmlFor="auth-email">Email address</label>
        <input
          id="auth-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
        />

        <label htmlFor="auth-password">Password</label>
        <input
          id="auth-password"
          type="password"
          minLength={6}
          autoComplete={
            mode === "signin" ? "current-password" : "new-password"
          }
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 6 characters"
        />

        {message && (
          <p className={`auth-message ${messageType}`} role="status">
            {message}
          </p>
        )}

        <button className="auth-submit" type="submit" disabled={busy}>
          {busy
            ? "Please wait..."
            : mode === "signin"
              ? "Sign In →"
              : "Create Account →"}
        </button>

        <p className="auth-switch">
          {mode === "signin"
            ? "New to PortfolioForge?"
            : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setMessage("");
            }}
          >
            {mode === "signin" ? "Create account" : "Sign in"}
          </button>
        </p>
      </form>
    </main>
  );
}
