"use client";
import { useRef, useState } from "react";
import styles from "./page.module.css";
import Hero from "./Hero";
import Schedule from "./Schedule";
import BridalParty from "./BridalParty";
import RsvpModal from "./RsvpModal";
import PasswordProtection from "./PasswordProtection";
import ScrollSmootherWrapper from "./ScrollSmootherWrapper";
import Navigation from './Navigation';
import FAQ from './FAQ';

export default function Home() {
  const [isRsvpModalOpen, setIsRsvpModalOpen] = useState(false);
  const pageRef = useRef(null);

  const handleAuthenticated = () => {
    console.log("Guest authenticated for wedding site!");
  };

  function handleOpenRsvpModal() {
    setIsRsvpModalOpen(true);
  }

  function handleCloseRsvpModal() {
    setIsRsvpModalOpen(false);
  }

  return (
    <PasswordProtection
      correctPasswordHash={process.env.NEXT_PUBLIC_SITE_PASSWORD_HASH}
      sessionKey="wedding_site_auth"
      title="💍 Stephanie & Joel's Wedding"
      description="Please enter the password to access our wedding website."
      placeholder="Enter guest password"
      onAuthenticated={handleAuthenticated}
    >
      {isRsvpModalOpen && <RsvpModal onClose={handleCloseRsvpModal} />}

      <ScrollSmootherWrapper>
        <Navigation 
          onRsvpClick={handleOpenRsvpModal}
          sessionKey="wedding_site_auth"
        />
        <div ref={pageRef} className={styles.page}>
          <main>
            <section id="hero" className={styles.heroSection}>
              <Hero />
            </section>

            <section id="schedule" className={styles.scheduleSection}>
              <Schedule />
            </section>

            <section id="bridal-party" className={styles.bridalPartySection}>
              <BridalParty />
            </section>
            <section id="faq" className={styles.faqSection}>
              <FAQ />
            </section>
          </main>
        </div>
      </ScrollSmootherWrapper>
    </PasswordProtection>
  );
}