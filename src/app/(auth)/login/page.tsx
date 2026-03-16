/**
 * =============================================================================
 * Login Page — Light Theme with Font Awesome
 * =============================================================================
 */

"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faSpinner } from "@fortawesome/free-solid-svg-icons";
import styles from "../auth.module.css";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.authHeader}>
        <div className={styles.authLogo}>IF</div>
        <h1>Welcome Back</h1>
        <p>Sign in to your InnovForms account</p>
      </div>

      {error && (
        <div className={`${styles.authMessage} ${styles.authError}`}>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className={styles.authForm}>
        <div className="input-group">
          <label htmlFor="email" className="input-label">
            <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: 6, color: "var(--text-tertiary)" }} />
            Email Address
          </label>
          <input
            id="email"
            type="email"
            className="input-field"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="input-group">
          <label htmlFor="password" className="input-label">
            <FontAwesomeIcon icon={faLock} style={{ marginRight: 6, color: "var(--text-tertiary)" }} />
            Password
          </label>
          <input
            id="password"
            type="password"
            className="input-field"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          className={`btn btn-primary ${styles.authSubmit}`}
          disabled={loading}
        >
          {loading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div className={styles.authFooter}>
        Don&apos;t have an account?{" "}
        <Link href="/register">Create one</Link>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="page-loader"><div className="spinner spinner-lg" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
