// src/app/Navigation.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { useGSAP } from '@gsap/react';

const Navigation = ({ 
  sessionKey = "wedding_site_auth",
  onRsvpClick
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = React.useRef(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = sessionStorage.getItem(sessionKey);
      setIsAuthenticated(authStatus === "true");
    };

    checkAuth();
    
    // Listen for storage changes (if user logs out in another tab)
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [sessionKey]);

  // Handle logout
  const handleLogout = () => {
    sessionStorage.removeItem(sessionKey);
    setIsAuthenticated(false);
    setIsMenuOpen(false);
    
    // Reload the page to reset the app state
    window.location.reload();
  };

  // Smooth scroll to sections with ScrollSmoother compatibility
  const scrollToSection = (sectionId) => {
    try {
      const element = document.getElementById(sectionId);
      if (!element) {
        console.warn(`Element with id "${sectionId}" not found`);
        return;
      }

      // Use ScrollSmoother's scrollTo method for proper smooth scrolling
      const smoother = ScrollSmoother.get();
      if (smoother && smoother.scrollTo) {
        // Add a small delay to ensure DOM is stable
        requestAnimationFrame(() => {
          try {
            smoother.scrollTo(element, true, "top top");
          } catch (error) {
            console.warn('ScrollSmoother scrollTo failed:', error);
            // Fallback to regular scroll
            element.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          }
        });
      } else {
        // Fallback: use regular smooth scroll
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    } catch (error) {
      console.error('Error in scrollToSection:', error);
    }
    
    setIsMenuOpen(false);
  };

  // Navigation entrance animation
  useGSAP(() => {
    if (!navRef.current || !isAuthenticated) return;

    // Kill any existing animations on this element
    gsap.killTweensOf(navRef.current);

    gsap.fromTo(navRef.current, 
      { 
        y: -100,
        opacity: 0 
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        delay: 2 // After other animations settle
      }
    );

    // Cleanup function
    return () => {
      if (navRef.current) {
        gsap.killTweensOf(navRef.current);
      }
    };
  }, [isAuthenticated]);

  // Don't render navigation if not authenticated
  if (!isAuthenticated) return null;

  return (
    <>
      <nav 
        ref={navRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          padding: '1rem 2rem',
          opacity: 0,
          transform: 'translateY(-100px)'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Logo/Brand */}
          <div 
            onClick={() => scrollToSection('hero')}
            style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#2c3e50',
              cursor: 'pointer',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = '#667eea'}
            onMouseLeave={(e) => e.target.style.color = '#2c3e50'}
          >
            S & J
          </div>

          {/* Desktop Navigation */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem'
          }}>
            <div style={{ 
              display: window.innerWidth <= 768 ? 'none' : 'flex',
              gap: '2rem'
            }}>
              <button
                onClick={() => scrollToSection('hero')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: '#2c3e50',
                  cursor: 'pointer',
                  padding: '0.5rem 0',
                  transition: 'color 0.3s ease',
                  borderBottom: '2px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#667eea';
                  e.target.style.borderBottomColor = '#667eea';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#2c3e50';
                  e.target.style.borderBottomColor = 'transparent';
                }}
              >
                Home
              </button>
              
              <button
                onClick={() => scrollToSection('schedule')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: '#2c3e50',
                  cursor: 'pointer',
                  padding: '0.5rem 0',
                  transition: 'color 0.3s ease',
                  borderBottom: '2px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#667eea';
                  e.target.style.borderBottomColor = '#667eea';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#2c3e50';
                  e.target.style.borderBottomColor = 'transparent';
                }}
              >
                Schedule
              </button>

              <button
                onClick={() => scrollToSection('bridal-party')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: '#2c3e50',
                  cursor: 'pointer',
                  padding: '0.5rem 0',
                  transition: 'color 0.3s ease',
                  borderBottom: '2px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#667eea';
                  e.target.style.borderBottomColor = '#667eea';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#2c3e50';
                  e.target.style.borderBottomColor = 'transparent';
                }}
              >
                Bridal Party
              </button>
            </div>

            {/* RSVP Button */}
            <button
              onClick={() => {
                onRsvpClick?.();
                setIsMenuOpen(false); // Close mobile menu if open
              }}
              style={{
                background: 'linear-gradient(135deg, #e91e63 0%, #ad1457 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                padding: '0.75rem 1.5rem',
                fontSize: '0.9rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(233, 30, 99, 0.3)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px) scale(1.05)';
                e.target.style.boxShadow = '0 6px 20px rgba(233, 30, 99, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 4px 15px rgba(233, 30, 99, 0.3)';
              }}
            >
              💕 RSVP
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                color: '#666',
                border: '1px solid #ddd',
                borderRadius: '6px',
                padding: '0.5rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f5f5f5';
                e.target.style.borderColor = '#999';
                e.target.style.color = '#333';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.borderColor = '#ddd';
                e.target.style.color = '#666';
              }}
            >
              Logout
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                display: window.innerWidth <= 768 ? 'flex' : 'none',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                color: '#2c3e50',
                cursor: 'pointer',
                padding: '0.5rem',
                flexDirection: 'column',
                gap: '3px'
              }}
            >
              <div style={{
                width: '20px',
                height: '2px',
                background: '#2c3e50',
                transition: 'all 0.3s ease',
                transform: isMenuOpen ? 'rotate(45deg) translateY(5px)' : 'none'
              }} />
              <div style={{
                width: '20px',
                height: '2px',
                background: '#2c3e50',
                transition: 'all 0.3s ease',
                opacity: isMenuOpen ? 0 : 1
              }} />
              <div style={{
                width: '20px',
                height: '2px',
                background: '#2c3e50',
                transition: 'all 0.3s ease',
                transform: isMenuOpen ? 'rotate(-45deg) translateY(-5px)' : 'none'
              }} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          style={{
            position: 'fixed',
            top: '80px', // Below the nav bar
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem',
            animation: 'slideDown 0.3s ease-out'
          }}
        >
          <button
            onClick={() => scrollToSection('hero')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#2c3e50',
              cursor: 'pointer',
              padding: '1rem',
              transition: 'color 0.3s ease'
            }}
          >
            Home
          </button>
          
          <button
            onClick={() => scrollToSection('schedule')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#2c3e50',
              cursor: 'pointer',
              padding: '1rem',
              transition: 'color 0.3s ease'
            }}
          >
            Schedule
          </button>

          <button
            onClick={() => scrollToSection('bridal-party')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#2c3e50',
              cursor: 'pointer',
              padding: '1rem',
              transition: 'color 0.3s ease'
            }}
          >
            Bridal Party
          </button>

          <button
            onClick={() => {
              onRsvpClick?.();
              setIsMenuOpen(false);
            }}
            style={{
              background: 'linear-gradient(135deg, #e91e63 0%, #ad1457 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              padding: '1rem 2rem',
              fontSize: '1.2rem',
              fontWeight: '700',
              cursor: 'pointer',
              margin: '1rem 0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            💕 RSVP
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default Navigation;