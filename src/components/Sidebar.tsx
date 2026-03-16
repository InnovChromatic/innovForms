/**
 * =============================================================================
 * Sidebar Component — Light/Dark Professional Navigation
 * =============================================================================
 * A clean dark sidebar with Font Awesome icons, role-based nav items,
 * user info section, sign-out, and full mobile responsiveness.
 */

"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGauge,
  faFileLines,
  faInbox,
  faClipboardList,
  faPaperPlane,
  faArrowRightFromBracket,
  faBars,
  faXmark,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  userRole: "admin" | "user";
  userName: string;
  userEmail: string;
}

/** Admin navigation items */
const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: faGauge },
  { href: "/admin/forms", label: "Forms", icon: faFileLines },
  { href: "/admin/responses", label: "Responses", icon: faInbox },
];

/** User navigation items */
const USER_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: faGauge },
  { href: "/dashboard/submissions", label: "My Submissions", icon: faClipboardList },
];

export default function Sidebar({ userRole, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = userRole === "admin" ? ADMIN_NAV : USER_NAV;

  /** Sign out handler */
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  /** Check if a nav item is active */
  const isActive = (href: string) => {
    if (href === "/admin" || href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className={styles.mobileToggle}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        <FontAwesomeIcon icon={mobileOpen ? faXmark : faBars} />
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className={styles.overlay}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.open : ""}`}>
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.logo}>IF</div>
          <span className={styles.brandText}>InnovForms</span>
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Navigation */}
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive(item.href) ? styles.active : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              <FontAwesomeIcon icon={item.icon} className={styles.navIcon} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom section */}
        <div className={styles.bottom}>
          <div className={styles.divider} />

          {/* User info */}
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              <FontAwesomeIcon icon={faUser} />
            </div>
            <div className={styles.userMeta}>
              <div className={styles.userName}>{userName}</div>
              <div className={styles.userEmail}>{userEmail}</div>
            </div>
          </div>

          {/* Sign out */}
          <button className={styles.signOut} onClick={handleSignOut}>
            <FontAwesomeIcon icon={faArrowRightFromBracket} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
