"use client";
import { useRef } from "react";
import styles from "./page.module.css";
import Hero from "./Hero";
import Schedule from "./Schedule";
import BridalParty from "./BridalParty";
import PasswordProtection from "./PasswordProtection";

export default function Home() {
  const pageRef = useRef(null);

  const handleAuthenticated = () => {
    console.log('Guest authenticated for wedding site!');
    // You could add analytics, tracking, or other logic here
  };

  return (
    <PasswordProtection
      correctPasswordHash={process.env.NEXT_PUBLIC_SITE_PASSWORD_HASH}
      sessionKey="wedding_site_auth"
      title="💍 Stephanie & Joel's Wedding"
      description="Please enter the password to access our wedding website."
      placeholder="Enter guest password"
      onAuthenticated={handleAuthenticated}
    >
      <div ref={pageRef} className={styles.page}>
        <main>
          <section className={styles.heroSection}>
            <Hero />
          </section>

          <section className={styles.scheduleSection}>
            <Schedule />
          </section>

          <section className={styles.BridalPartySection}>
            <BridalParty />
          </section>
        </main>
      </div>
    </PasswordProtection>
  );
}