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

  useGSAP(() => {
    const text = textRef.current;
    const backgroundImage = document.querySelector('.backgroundImage');
    const foreground = foregroundRef.current;
    const hero = heroRef.current;
    const line1 = line1Ref.current;
    const line2 = line2Ref.current;
    const subtitle = subtitleRef.current;

    if (!text || !backgroundImage || !foreground || !hero) return;

    // Set initial states - all text lines hidden
    gsap.set([line1, line2, subtitle], { 
      y: 50, 
      opacity: 0 
    });

    // Line-by-line text entrance animation
    const tl = gsap.timeline({ delay: 0.3 });
    
    tl.to(line1, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power3.out"
    })
    .to(line2, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power3.out"
    }, "-=0.3")
    .to(subtitle, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power3.out"
    }, "-=0.5");

    // Add subtle floating animation to entire text container after entrance
    tl.call(() => {
      gsap.to(text, {
        y: -10,
        duration: 4,
        ease: "sine.inOut", 
        repeat: -1,
        yoyo: true,
      });
    });

    // Gentle parallax on scroll
    ScrollTrigger.create({
      trigger: hero,
      start: "top top",
      end: "bottom top",
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        
        // Gentle parallax movements
        gsap.set(backgroundImage, {
          y: progress * -50 // Background moves slower
        });
        
        gsap.set(foreground, {
          y: progress * -30 // Just move, don't scale during scroll
        });
        
        gsap.set(text, {
          y: progress * -150 // Text moves fastest for depth
        });
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === hero) {
          trigger.kill();
        }
      });
    };
  }, []);

  return (
    <section ref={heroRef} style={{
      position: "relative",
      height: "100vh",
      display: "flex",
      zIndex: 0,
    }}>
      {/* Background Container */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
      }}>
        <Image
          className="backgroundImage"
          src="/images/background.png"
          fill={true}
          alt="background"
          priority 
          style={{
            objectFit: "cover"
          }}
        />
      </div>
      
      {/* Text Content */}
      <div 
        ref={textRef} 
        style={{ 
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          textAlign: "center",
          color: "white"
        }}
      >
        <h1 style={{ 
          fontSize: "clamp(2.5rem, 8vw, 4rem)", 
          marginBottom: "1rem",
          fontWeight: "700",
          textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
          lineHeight: "1.2",
          margin: "0 0 1rem 0"
        }}>
          <div ref={line1Ref} style={{ opacity: 0, transform: "translateY(50px)" }}>
            Stephanie and Joel
          </div>
          <div ref={line2Ref} style={{ opacity: 0, transform: "translateY(50px)" }}>
            are getting married!
          </div>
        </h1>
        <p 
          ref={subtitleRef}
          style={{ 
            fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
            textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
            margin: "0",
            opacity: 0,
            transform: "translateY(50px)"
          }}
        >
          Save the Date
        </p>
      </div>

      {/* Calendar Container - Let Calendar handle its own entrance */}
      <div 
        style={{
          position: "absolute",
          bottom: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
        }}
      >
        <Calendar />
      </div>

      {/* Foreground Container - scaled up for coverage, no animation scaling */}
      <div style={{
        position: "absolute",
        bottom: "-10%", // Move down to ensure coverage
        left: "-10%", // Extend left
        width: "120%", // Make wider
        height: "80%", // Make taller
        zIndex: 3,
        pointerEvents: "none",
        transform: "scale(1.1)", // Fixed scale for coverage
      }}>
        <Image
          ref={foregroundRef}
          src="/images/foreground.png"
          fill={true}
          alt="foreground"
          style={{
            objectFit: "cover",
            objectPosition: "bottom"
          }}
        />
      </div>
    </section>
  );
}