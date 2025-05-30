// components/ScrollSmootherWrapper.jsx
"use client";
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const ScrollSmootherWrapper = ({ children }) => {
  const smoothWrapperRef = useRef(null);
  const smoothContentRef = useRef(null);
  const smootherRef = useRef(null);

  useEffect(() => {
    if (!smoothWrapperRef.current || !smoothContentRef.current) return;

    // Create ScrollSmoother instance
    smootherRef.current = ScrollSmoother.create({
      wrapper: smoothWrapperRef.current,
      content: smoothContentRef.current,
      smooth: 0.8,               // Much more responsive (lower = faster response)
      effects: true,             // Enable data-speed effects
      smoothTouch: 0.1,          // Mobile touch smoothing (0.1 = subtle)
      normalizeScroll: true,     // Handle different input types consistently
      ignoreMobileResize: true,  // Better mobile performance
    });

    // Optional: Add scroll position indicator for debugging
    // console.log('ScrollSmoother initialized');

    return () => {
      if (smootherRef.current) {
        smootherRef.current.kill();
        smootherRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={smoothWrapperRef}
      id="smooth-wrapper"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden', // Required for ScrollSmoother
      }}
    >
      <div
        ref={smoothContentRef}
        id="smooth-content"
        style={{
          position: 'relative',
          width: '100%',
          willChange: 'transform', // Performance optimization
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ScrollSmootherWrapper;