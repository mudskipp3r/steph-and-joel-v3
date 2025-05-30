"use client";
import React, { useRef } from "react";
import Image from "next/image";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Calendar from './Calendar';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const foregroundRef = useRef(null);
  const textRef = useRef(null);
  const heroRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const subtitleRef = useRef(null);
  const backgroundRef = useRef(null);

  useGSAP(() => {
    const text = textRef.current;
    const backgroundImage = backgroundRef.current;
    const foreground = foregroundRef.current;
    const hero = heroRef.current;
    const line1 = line1Ref.current;
    const line2 = line2Ref.current;
    const subtitle = subtitleRef.current;

    if (!text || !backgroundImage || !foreground || !hero) return;

    // Prevent multiple animations from running
    if (hero.dataset.animated === 'true') return;
    hero.dataset.animated = 'true';

    // Set initial states with proper transforms
    gsap.set([line1, line2, subtitle], { 
      y: 60, 
      opacity: 0,
      rotationX: 45,
      transformOrigin: "center bottom"
    });

    // Set initial background position for smoother parallax
    gsap.set(backgroundImage, {
      scale: 1.1, // Start slightly larger to avoid edge gaps during parallax
      transformOrigin: "center center"
    });

    // Improved text entrance timeline with better easing
    const textTimeline = gsap.timeline({ delay: 0.5 });
    
    textTimeline
      .to(line1, {
        y: 0,
        opacity: 1,
        rotationX: 0,
        duration: 1.2,
        ease: "power3.out"
      })
      .to(line2, {
        y: 0,
        opacity: 1,
        rotationX: 0,
        duration: 1.2,
        ease: "power3.out"
      }, "-=0.8") // Overlap more for smoother flow
      .to(subtitle, {
        y: 0,
        opacity: 1,
        rotationX: 0,
        duration: 1.2,
        ease: "power3.out"
      }, "-=0.6");

    // Add subtle floating animation after entrance completes
    textTimeline.to(text, {
      y: -8,
      duration: 3,
      ease: "power1.inOut", 
      repeat: -1,
      yoyo: true,
      delay: 0.5
    });

    // Optimized parallax with smoother performance
    let parallaxTween;
    
    ScrollTrigger.create({
      trigger: hero,
      start: "top top",
      end: "bottom top",
      onUpdate: (self) => {
        // Kill existing tween to prevent stacking
        if (parallaxTween) parallaxTween.kill();
        
        const progress = self.progress;
        const backgroundY = progress * -80; // Slower background movement
        const foregroundY = progress * -40; // Medium foreground movement
        const textY = progress * -120; // Fastest text movement
        
        // Use a single tween for all transforms to improve performance
        parallaxTween = gsap.set([backgroundImage, foreground, text], {
          y: (i) => {
            if (i === 0) return backgroundY; // background
            if (i === 1) return foregroundY; // foreground
            return textY; // text
          },
          force3D: true, // Force hardware acceleration
          ease: "none"
        });
      },
      onLeave: () => {
        if (parallaxTween) parallaxTween.kill();
      },
      onEnterBack: () => {
        if (parallaxTween) parallaxTween.kill();
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === hero) {
          trigger.kill();
        }
      });
      if (parallaxTween) parallaxTween.kill();
      if (hero) {
        hero.dataset.animated = 'false';
      }
    };
  }, []);

  return (
    <section ref={heroRef} style={{
      position: "relative",
      height: "100vh",
      display: "flex",
      overflow: "hidden", // Prevent any overflow issues
      willChange: "transform", // Optimize for animations
    }}>
      {/* Background Container with improved rendering */}
      <div style={{
        position: "absolute",
        top: "-5%", // Slight expansion to prevent edge gaps
        left: "-5%",
        width: "110%",
        height: "110%",
        zIndex: 1,
      }}>
        <Image
          ref={backgroundRef}
          src="/images/background.png"
          fill={true}
          alt="Wedding background"
          priority 
          quality={95} // Higher quality for sharper images
          sizes="100vw"
          style={{
            objectFit: "cover",
            objectPosition: "center center",
            willChange: "transform",
            backfaceVisibility: "hidden", // Prevent flickering
            WebkitBackfaceVisibility: "hidden",
          }}
        />
      </div>
      
      {/* Text Content with improved positioning */}
      <div 
        ref={textRef} 
        style={{ 
          position: "absolute",
          top: "22%",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          textAlign: "center",
          color: "white",
          willChange: "transform",
          backfaceVisibility: "hidden",
        }}
      >
        <h1 style={{ 
          fontSize: "clamp(2.8rem, 8vw, 4.5rem)", // Slightly larger for more impact
          marginBottom: "1.2rem",
          fontWeight: "700",
          textShadow: "0 4px 8px rgba(0, 0, 0, 0.6), 0 2px 4px rgba(0, 0, 0, 0.4)", // Enhanced shadow
          lineHeight: "1.1",
          margin: "0 0 1.2rem 0",
          letterSpacing: "-0.02em" // Tighter letter spacing for elegance
        }}>
          <div 
            ref={line1Ref} 
            style={{ 
              opacity: 0, 
              transform: "translateY(60px) rotateX(45deg)",
              transformOrigin: "center bottom",
              willChange: "transform, opacity"
            }}
          >
            Stephanie and Joel
          </div>
          <div 
            ref={line2Ref} 
            style={{ 
              opacity: 0, 
              transform: "translateY(60px) rotateX(45deg)",
              transformOrigin: "center bottom",
              willChange: "transform, opacity"
            }}
          >
            are getting married!
          </div>
        </h1>
        <p 
          ref={subtitleRef}
          style={{ 
            fontSize: "clamp(1.1rem, 3vw, 1.4rem)", // Slightly larger
            textShadow: "0 3px 6px rgba(0, 0, 0, 0.6), 0 1px 3px rgba(0, 0, 0, 0.4)",
            margin: "0",
            opacity: 0,
            transform: "translateY(60px) rotateX(45deg)",
            transformOrigin: "center bottom",
            fontWeight: "400",
            letterSpacing: "0.05em", // Spaced out subtitle
            willChange: "transform, opacity"
          }}
        >
          Save the Date
        </p>
      </div>

      {/* Calendar Container with improved positioning */}
      <div 
        style={{
          position: "absolute",
          bottom: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          willChange: "transform",
        }}
      >
        <Calendar />
      </div>

      {/* Foreground Container with improved rendering */}
      <div style={{
        position: "absolute",
        bottom: "-15%", // More extension for better coverage
        left: "-10%",
        width: "120%",
        height: "85%",
        zIndex: 3,
        pointerEvents: "none",
        willChange: "transform",
      }}>
        <Image
          ref={foregroundRef}
          src="/images/foreground.png"
          fill={true}
          alt="Wedding foreground decoration"
          quality={95} // Higher quality
          sizes="120vw"
          style={{
            objectFit: "cover",
            objectPosition: "bottom center",
            willChange: "transform",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        />
      </div>
    </section>
  );
}