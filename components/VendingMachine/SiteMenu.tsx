"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { vendingRows } from "@/lib/vendingItems";
import styles from "./VendingMachine.module.css";

const [caseStudies, more] = vendingRows;

/**
 * Plain navigation for visitors who'd rather not use the machine: every page in one panel,
 * opened from the top-left corner.
 */
export default function SiteMenu({ hidden }: { hidden: boolean }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setOpen(false);
      button.current?.focus();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        ref={button}
        type="button"
        className={styles.siteMenuButton}
        data-hidden={hidden}
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen((o) => !o)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h10" />
        </svg>
        <span>Menu</span>
      </button>

      {open && <div className={styles.siteMenuScrim} onClick={close} aria-hidden="true" />}

      <div
        id="site-menu"
        ref={panel}
        className={styles.siteMenuPanel}
        data-open={open}
        data-ui
        aria-hidden={!open}
        inert={!open}
      >
        <div className={styles.siteMenuHead}>
          <p className={styles.siteMenuName}>Khrystyna Arnoldy</p>
          <button type="button" className={styles.siteMenuClose} onClick={() => { close(); button.current?.focus(); }} aria-label="Close menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12" />
              <path d="M18 6 6 18" />
            </svg>
          </button>
        </div>

        <nav aria-label="Site">
          <p className={styles.siteMenuGroup}>Case studies</p>
          <ul className={styles.siteMenuList}>
            {caseStudies.map((item) =>
              item.action.type === "navigate" ? (
                <li key={item.id}>
                  <Link href={item.action.href} className={styles.siteMenuLink} onClick={close}>
                    <span className={styles.siteMenuEyebrow}>{item.title}</span>
                    <span className={styles.siteMenuTitle}>{item.tagline}</span>
                  </Link>
                </li>
              ) : null,
            )}
          </ul>

          <p className={styles.siteMenuGroup}>More</p>
          <ul className={styles.siteMenuList}>
            {more.map((item) => (
              <li key={item.id}>
                {item.action.type === "navigate" ? (
                  <Link href={item.action.href} className={styles.siteMenuLink} onClick={close}>
                    <span className={styles.siteMenuEyebrow}>{item.title}</span>
                    <span className={styles.siteMenuTitle}>{item.tagline}</span>
                  </Link>
                ) : (
                  <a href={item.action.href} download={item.action.filename} className={styles.siteMenuLink} onClick={close}>
                    <span className={styles.siteMenuEyebrow}>{item.title} · PDF</span>
                    <span className={styles.siteMenuTitle}>{item.tagline}</span>
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
