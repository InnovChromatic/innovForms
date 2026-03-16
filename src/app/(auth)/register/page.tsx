/**
 * =============================================================================
 * Register Page — Light Theme with Font Awesome
 * =============================================================================
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEnvelope, faLock, faSpinner } from "@fortawesome/free-solid-svg-icons";
import styles from "../auth.module.css";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      setSuccess("Account created! Redirecting...");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.authHeader}>
        <Image src="/title_logo.jpg" alt="InnovForms Logo" width={80} height={80} style={{ borderRadius: "var(--radius-md)", objectFit: "cover", marginBottom: "var(--space-md)" }} />
        <h1>Create Account</h1>
        <p>Join InnovForms to start building forms</p>
      </div>

      {error && (
        <div className={`${styles.authMessage} ${styles.authError}`}>{error}</div>
      )}
      {success && (
        <div className={`${styles.authMessage} ${styles.authSuccess}`}>{success}</div>
      )}

      <form onSubmit={handleRegister} className={styles.authForm}>
        <div className="input-group">
          <label htmlFor="fullName" className="input-label">
            <FontAwesomeIcon icon={faUser} style={{ marginRight: 6, color: "var(--text-tertiary)" }} />
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            className="input-field"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

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
            placeholder="Min 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <div className="input-group">
          <label htmlFor="confirmPassword" className="input-label">
            <FontAwesomeIcon icon={faLock} style={{ marginRight: 6, color: "var(--text-tertiary)" }} />
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            className="input-field"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
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
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <div className={styles.authFooter}>
        Already have an account?{" "}
        <Link href="/login">Sign in</Link>
      </div>
    </>
  );
}
