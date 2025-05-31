import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";

function RsvpModal({ onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [plusOneEnabled, setPlusOneEnabled] = useState(false);
  const [promoCodeError, setPromoCodeError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPromoField, setShowPromoField] = useState(false);

  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  // GSAP entrance animation
  useEffect(() => {
    if (overlayRef.current && contentRef.current) {
      // Set initial states
      gsap.set(overlayRef.current, { opacity: 0 });
      gsap.set(contentRef.current, { 
        scale: 0.7, 
        y: 50, 
        opacity: 0,
        rotationX: -15
      });

      // Create entrance timeline
      const tl = gsap.timeline();
      
      tl.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out"
      })
      .to(contentRef.current, {
        scale: 1,
        y: 0,
        opacity: 1,
        rotationX: 0,
        duration: 0.5,
        ease: "back.out(1.7)"
      }, "-=0.1");
    }

    // Prevent body scroll when modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleClose = () => {
    if (overlayRef.current && contentRef.current) {
      // Create exit animation
      const tl = gsap.timeline({
        onComplete: onClose
      });
      
      tl.to(contentRef.current, {
        scale: 0.8,
        y: -30,
        opacity: 0,
        rotationX: 15,
        duration: 0.3,
        ease: "power2.in"
      })
      .to(overlayRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in"
      }, "-=0.1");
    } else {
      onClose();
    }
  };

  const handlePlusOneChange = (e) => {
    const isChecked = e.target.checked;
    setShowPromoField(isChecked);

    if (!isChecked) {
      setPromoCode("");
      setPlusOneEnabled(false);
      setPromoCodeError("");
    }
  };

  const verifyPromoCode = async (code) => {
    if (!code.trim()) {
      setPlusOneEnabled(false);
      setPromoCodeError("");
      return;
    }

    setIsVerifying(true);
    setPromoCodeError("");

    try {
      const response = await fetch("/.netlify/functions/verify-promo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ promoCode: code }),
      });

      const result = await response.json();

      if (result.valid) {
        setPlusOneEnabled(true);
        setPromoCodeError("");
      } else {
        setPlusOneEnabled(false);
        setPromoCodeError("Invalid promo code");
      }
    } catch (error) {
      setPlusOneEnabled(false);
      setPromoCodeError("Error verifying code");
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePromoCodeChange = (e) => {
    const code = e.target.value;
    setPromoCode(code);
    setPlusOneEnabled(false);
    setPromoCodeError("");
  };

  const handleVerifyClick = () => {
    verifyPromoCode(promoCode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const formData = new FormData(e.target);
      
      if (plusOneEnabled) {
        formData.append("plusOne", "yes");
      }

      const response = await fetch("/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(formData).toString(),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        throw new Error("Form submission failed");
      }
    } catch (error) {
      setSubmitError("There was an error submitting your RSVP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalStyles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
      // Enable native scrolling
      overflowY: "auto",
      WebkitOverflowScrolling: "touch" // iOS smooth scrolling
    },
    modalContainer: {
      background: "white",
      borderRadius: "12px",
      width: "100%",
      maxWidth: "700px",
      maxHeight: "90vh",
      position: "relative",
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
      margin: "auto",
      // Ensure modal can scroll if content is too tall
      overflowY: "auto",
      WebkitOverflowScrolling: "touch"
    },
    closeButton: {
      position: "absolute",
      top: "1rem",
      right: "1rem",
      background: "rgba(255, 255, 255, 0.9)",
      border: "none",
      fontSize: "2rem",
      cursor: "pointer",
      color: "#666",
      width: "40px",
      height: "40px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "50%",
      transition: "all 0.3s ease",
      backdropFilter: "blur(10px)",
      zIndex: 10
    },
    form: {
      padding: "2rem",
      paddingTop: "3rem"
    },
    section: {
      marginBottom: "2rem",
      paddingBottom: "1.5rem",
      borderBottom: "1px solid #f0f0f0"
    },
    inputGroup: {
      marginBottom: "1rem"
    },
    label: {
      display: "block",
      marginBottom: "0.5rem",
      fontWeight: "500",
      color: "#2c3e50"
    },
    input: {
      width: "100%",
      padding: "0.75rem",
      border: "2px solid #e1e8ed",
      borderRadius: "8px",
      fontSize: "1rem",
      transition: "border-color 0.3s ease",
      fontFamily: "inherit",
      boxSizing: "border-box"
    },
    submitButton: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      padding: "1rem 2.5rem",
      border: "none",
      borderRadius: "50px",
      fontSize: "1.1rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      textTransform: "uppercase",
      letterSpacing: "1px"
    },
    promoContainer: {
      display: "flex",
      gap: "0.5rem",
      alignItems: "flex-start"
    },
    verifyButton: {
      padding: "0.75rem 1.25rem",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "0.9rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      whiteSpace: "nowrap",
      minWidth: "80px"
    }
  };

  if (isSubmitted) {
    return (
      <div ref={modalRef}>
        <div ref={overlayRef} style={modalStyles.overlay} onClick={handleClose}>
          <div ref={contentRef} style={modalStyles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <button style={modalStyles.closeButton} onClick={handleClose}>
              ×
            </button>
            <div style={{
              textAlign: "center",
              padding: "4rem 2rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "400px"
            }}>
              <div style={{
                fontSize: "4rem",
                color: "#27ae60",
                marginBottom: "1rem",
                background: "rgba(39, 174, 96, 0.1)",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold"
              }}>
                ✓
              </div>
              <h2 style={{ color: "#2c3e50", marginBottom: "1rem", fontSize: "2rem" }}>
                Thank You!
              </h2>
              <p style={{ color: "#666", fontSize: "1.1rem", marginBottom: "0.5rem", maxWidth: "400px" }}>
                Your RSVP has been submitted successfully!
              </p>
              <p style={{ color: "#666", fontSize: "1.1rem", marginBottom: "2rem", maxWidth: "400px" }}>
                We'll send a confirmation email shortly.
              </p>
              <button
                onClick={handleClose}
                style={{
                  ...modalStyles.submitButton,
                  background: "linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={modalRef}>
      <div ref={overlayRef} style={modalStyles.overlay} onClick={handleClose}>
        <div ref={contentRef} style={modalStyles.modalContainer} onClick={(e) => e.stopPropagation()}>
          <button style={modalStyles.closeButton} onClick={handleClose}>
            ×
          </button>
          
          <form onSubmit={handleSubmit} style={modalStyles.form}>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <h2 style={{ color: "#2c3e50", marginBottom: "1rem", fontSize: "2rem" }}>
                RSVP to Stephanie & Joel's Wedding
              </h2>
              <p style={{ color: "#666", fontSize: "1.1rem" }}>
                We're so excited to celebrate with you! Please fill out this form by January 15th, 2026.
              </p>
            </div>

            {submitError && (
              <div style={{
                backgroundColor: "#fee",
                border: "1px solid #fcc",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1.5rem",
                color: "#e74c3c",
                textAlign: "center",
                fontWeight: "500"
              }}>
                {submitError}
              </div>
            )}

            {/* Hidden fields for Netlify */}
            <input type="hidden" name="form-name" value="wedding-rsvp" />
            
            {/* Guest Information */}
            <section style={modalStyles.section}>
              <h3 style={{ color: "#34495e", marginBottom: "1rem", fontSize: "1.3rem" }}>
                Guest Information
              </h3>
              
              <div style={modalStyles.inputGroup}>
                <label style={modalStyles.label} htmlFor="guestName">Full Name *</label>
                <input
                  style={modalStyles.input}
                  type="text"
                  id="guestName"
                  name="guestName"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div style={modalStyles.inputGroup}>
                <label style={modalStyles.label} htmlFor="email">Email Address *</label>
                <input
                  style={modalStyles.input}
                  type="email"
                  id="email"
                  name="email"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div style={modalStyles.inputGroup}>
                <label style={modalStyles.label} htmlFor="phone">Phone Number</label>
                <input
                  style={modalStyles.input}
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="(555) 123-4567"
                />
              </div>
            </section>

            {/* Attendance */}
            <section style={modalStyles.section}>
              <h3 style={{ color: "#34495e", marginBottom: "1rem", fontSize: "1.3rem" }}>
                Will you be attending? *
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", padding: "0.5rem", borderRadius: "8px" }}>
                  <input type="radio" name="attendance" value="yes" required />
                  <span>Yes, I'll be there! 🎉</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", padding: "0.5rem", borderRadius: "8px" }}>
                  <input type="radio" name="attendance" value="no" required />
                  <span>Sorry, I can't make it 😢</span>
                </label>
              </div>
            </section>

            {/* Plus One */}
            <section style={modalStyles.section}>
              <h3 style={{ color: "#34495e", marginBottom: "1rem", fontSize: "1.3rem" }}>
                Plus One
              </h3>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    name="plusOneIntent"
                    onChange={handlePlusOneChange}
                  />
                  <span>I'll be bringing a plus one</span>
                </label>
              </div>

              {showPromoField && (
                <div style={modalStyles.inputGroup}>
                  <label style={modalStyles.label} htmlFor="promoCode">
                    Plus One Access Code
                    <span style={{ fontSize: "0.85rem", color: "#666", fontWeight: "400", marginLeft: "0.5rem" }}>
                      (required to bring a plus one)
                    </span>
                  </label>
                  <div style={modalStyles.promoContainer}>
                    <input
                      style={{
                        ...modalStyles.input,
                        flex: 1,
                        borderColor: promoCodeError ? "#e74c3c" : plusOneEnabled ? "#27ae60" : "#e1e8ed"
                      }}
                      type="text"
                      id="promoCode"
                      value={promoCode}
                      onChange={handlePromoCodeChange}
                      placeholder="Enter your plus one access code"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyClick}
                      disabled={!promoCode.trim() || isVerifying}
                      style={{
                        ...modalStyles.verifyButton,
                        opacity: (!promoCode.trim() || isVerifying) ? 0.5 : 1,
                        cursor: (!promoCode.trim() || isVerifying) ? "not-allowed" : "pointer"
                      }}
                    >
                      {isVerifying ? "Verifying..." : "Verify"}
                    </button>
                  </div>
                  {promoCodeError && (
                    <span style={{ fontSize: "0.85rem", color: "#e74c3c", marginTop: "0.25rem", display: "block" }}>
                      {promoCodeError}
                    </span>
                  )}
                  {plusOneEnabled && (
                    <span style={{ fontSize: "0.85rem", color: "#27ae60", marginTop: "0.25rem", display: "block", fontWeight: "500" }}>
                      ✓ Plus one access granted!
                    </span>
                  )}
                </div>
              )}

              {plusOneEnabled && (
                <div style={modalStyles.inputGroup}>
                  <label style={modalStyles.label} htmlFor="plusOneName">Plus One's Full Name</label>
                  <input
                    style={modalStyles.input}
                    type="text"
                    id="plusOneName"
                    name="plusOneName"
                    placeholder="Enter your plus one's full name"
                  />
                  <input type="hidden" name="plusOne" value="yes" />
                </div>
              )}
            </section>

            {/* Meal Preferences */}
            <section style={modalStyles.section}>
              <h3 style={{ color: "#34495e", marginBottom: "1rem", fontSize: "1.3rem" }}>
                Meal Preferences
              </h3>

              <div style={modalStyles.inputGroup}>
                <label style={modalStyles.label} htmlFor="mealPreference">Your Meal Choice</label>
                <select
                  style={modalStyles.input}
                  id="mealPreference"
                  name="mealPreference"
                >
                  <option value="">Please select...</option>
                  <option value="beef">Herb-Crusted Beef Tenderloin</option>
                  <option value="chicken">Lemon Herb Roasted Chicken</option>
                  <option value="salmon">Pan-Seared Salmon</option>
                  <option value="vegetarian">Vegetarian Pasta Primavera</option>
                  <option value="vegan">Vegan Mediterranean Bowl</option>
                </select>
              </div>

              {plusOneEnabled && (
                <div style={modalStyles.inputGroup}>
                  <label style={modalStyles.label} htmlFor="plusOneMeal">Plus One's Meal Choice</label>
                  <select
                    style={modalStyles.input}
                    id="plusOneMeal"
                    name="plusOneMeal"
                  >
                    <option value="">Please select...</option>
                    <option value="beef">Herb-Crusted Beef Tenderloin</option>
                    <option value="chicken">Lemon Herb Roasted Chicken</option>
                    <option value="salmon">Pan-Seared Salmon</option>
                    <option value="vegetarian">Vegetarian Pasta Primavera</option>
                    <option value="vegan">Vegan Mediterranean Bowl</option>
                  </select>
                </div>
              )}

              <div style={modalStyles.inputGroup}>
                <label style={modalStyles.label} htmlFor="dietaryRestrictions">
                  Dietary Restrictions or Allergies
                </label>
                <textarea
                  style={{...modalStyles.input, minHeight: "80px", resize: "vertical"}}
                  id="dietaryRestrictions"
                  name="dietaryRestrictions"
                  placeholder="Please let us know about any dietary restrictions, allergies, or special requirements..."
                  rows="3"
                />
              </div>
            </section>

            {/* Additional Information */}
            <section style={modalStyles.section}>
              <h3 style={{ color: "#34495e", marginBottom: "1rem", fontSize: "1.3rem" }}>
                Additional Information
              </h3>

              <div style={modalStyles.inputGroup}>
                <label style={modalStyles.label} htmlFor="songRequest">Song Request</label>
                <input
                  style={modalStyles.input}
                  type="text"
                  id="songRequest"
                  name="songRequest"
                  placeholder="Any special song you'd love to hear at the reception?"
                />
              </div>

              <div style={modalStyles.inputGroup}>
                <label style={modalStyles.label} htmlFor="message">Message for the Couple</label>
                <textarea
                  style={{...modalStyles.input, minHeight: "100px", resize: "vertical"}}
                  id="message"
                  name="message"
                  placeholder="Leave a sweet message for Stephanie & Joel!"
                  rows="4"
                />
              </div>
            </section>

            {/* Submit Button */}
            <div style={{ textAlign: "center", marginTop: "2rem", paddingTop: "2rem", borderTop: "2px solid #f0f0f0" }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  ...modalStyles.submitButton,
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? "not-allowed" : "pointer"
                }}
              >
                {isSubmitting ? "Submitting..." : "Submit RSVP"}
              </button>
              <p style={{ marginTop: "1rem", color: "#666", fontSize: "0.9rem" }}>
                Thank you for taking the time to RSVP!
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RsvpModal;