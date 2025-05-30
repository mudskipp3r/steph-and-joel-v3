"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function Calendar() {
  const [isMobile, setIsMobile] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(0);
  const calendarGridRef = useRef(null);
  const monthTextRef = useRef(null);
  const yearTextRef = useRef(null);
  const calendarRef = useRef(null);
  const circleRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Generate months from current to wedding
  const generateMonths = () => {
    const months = [];
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const startYear = 2025;
    const startMonth = 4; // May
    const endYear = 2026;
    const endMonth = 1; // February

    let currentYear = startYear;
    let currentMonthIndex = startMonth;

    while (
      currentYear < endYear ||
      (currentYear === endYear && currentMonthIndex <= endMonth)
    ) {
      months.push({
        name: monthNames[currentMonthIndex],
        year: currentYear,
        index: currentMonthIndex,
        shortName: monthNames[currentMonthIndex].substring(0, 3),
      });

      currentMonthIndex++;
      if (currentMonthIndex > 11) {
        currentMonthIndex = 0;
        currentYear++;
      }
    }

    return months;
  };

  const months = generateMonths();
  const todayDate = { year: 2025, month: 4, day: 27 }; // May 27, 2025
  const weddingDate = { year: 2026, month: 1, day: 6 }; // February 6, 2026

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    const firstDay = new Date(year, month, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  // Generate one continuous grid for all months
  const generateContinuousCalendarData = () => {
    const allCalendarData = [];
    
    months.forEach((month, monthIndex) => {
      const daysInMonth = getDaysInMonth(month.index, month.year);
      const firstDay = getFirstDayOfMonth(month.index, month.year);

      // Get previous month for leading days
      const prevMonth = month.index === 0 ? 11 : month.index - 1;
      const prevYear = month.index === 0 ? month.year - 1 : month.year;
      const daysInPrevMonth = getDaysInMonth(prevMonth, prevYear);

      const monthData = [];

      // Add leading days from previous month
      for (let i = firstDay - 1; i >= 0; i--) {
        monthData.push({
          day: (daysInPrevMonth - i).toString(),
          isCurrentMonth: false,
          monthIndex,
          cellIndex: monthData.length
        });
      }

      // Add current month days
      for (let day = 1; day <= daysInMonth; day++) {
        const isToday = month.year === todayDate.year && 
                       month.index === todayDate.month && 
                       day === todayDate.day;
                       
        const isWeddingDay = month.year === weddingDate.year && 
                            month.index === weddingDate.month && 
                            day === weddingDate.day;
        
        monthData.push({
          day: day.toString(),
          isCurrentMonth: true,
          isToday,
          isWeddingDay,
          monthIndex,
          cellIndex: monthData.length
        });
      }

      // Add trailing days from next month
      const totalCells = 42; // 6 rows * 7 columns
      const remainingCells = totalCells - monthData.length;
      for (let day = 1; day <= remainingCells; day++) {
        monthData.push({
          day: day.toString(),
          isCurrentMonth: false,
          monthIndex,
          cellIndex: monthData.length
        });
      }

      allCalendarData.push(...monthData);
    });

    return allCalendarData;
  };

  const allCalendarData = generateContinuousCalendarData();

  const getDayStyle = (dayData) => {
    let backgroundColor = "transparent";
    let color = "#2c3e50";
    let fontWeight = "normal";

    if (dayData.isToday) {
      backgroundColor = "#28a745";
      color = "white";
      fontWeight = "bold";
    } else if (dayData.isWeddingDay) {
      backgroundColor = "#dc3545";
      color = "white";
      fontWeight = "bold";
    } else if (!dayData.isCurrentMonth) {
      color = "#ccc";
    }

    return {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "clamp(0.85rem, 2.2vw, 1.1rem)", // Slightly larger for taller calendar
      fontWeight: fontWeight,
      textAlign: "center",
      padding: "clamp(0.2rem, 0.6vw, 0.4rem)", // Slightly more padding
      minHeight: "clamp(24px, 4vw, 42px)", // Taller cells for taller calendar
      color: color,
      backgroundColor: backgroundColor,
      borderRadius: dayData.isToday || dayData.isWeddingDay ? "50%" : "0",
      position: "relative",
      overflow: "hidden",
      boxSizing: "border-box",
    };
  };

  useGSAP(() => {
    const calendar = calendarRef.current;
    const calendarGrid = calendarGridRef.current;
    const monthText = monthTextRef.current;
    const yearText = yearTextRef.current;

    if (!calendar || !calendarGrid || !monthText || !yearText) return;

    // Prevent multiple animations from running
    if (calendar.dataset.animated === 'true') return;
    calendar.dataset.animated = 'true';

    // Calendar entrance animation
    gsap.set(calendar, { opacity: 0, y: 50 });

    const entranceTl = gsap.timeline({ delay: 1.2 }); // Start sooner - was 1.8
    entranceTl
      .to(calendar, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power3.out",
      })
      .to({}, { duration: 0.3 }) // Shorter pause
      .add(() => {
        // Single smooth animation through all months
        const totalMonths = months.length - 1;
        const totalDuration = 2.5; // Slightly faster - was 3 seconds
        const cellsPerMonth = 42; // 6 rows * 7 columns
        const rowsPerMonth = 6; // 6 rows per month
        
        // Calculate how many rows to scroll to reach the last month
        const totalRowsToScroll = totalMonths * rowsPerMonth;
        const rowHeight = 100 / Math.ceil(allCalendarData.length / 7); // Percentage height per row
        
        gsap.to(calendarGrid, {
          y: `-${totalRowsToScroll * rowHeight}%`, // Move by exact number of rows needed
          duration: totalDuration,
          ease: "power2.inOut",
          onUpdate: function() {
            const progress = this.progress();
            const currentIndex = Math.round(progress * totalMonths);
            
            if (currentIndex < months.length) {
              const month = months[currentIndex];
              if (month) {
                setCurrentMonth(currentIndex);
                monthText.textContent = month.shortName;
                yearText.textContent = month.year.toString();
              }
            }
          },
          onComplete: () => {
            const lastMonth = months[months.length - 1];
            if (lastMonth) {
              setCurrentMonth(months.length - 1);
              monthText.textContent = lastMonth.shortName;
              yearText.textContent = lastMonth.year.toString();
            }
            
            // Draw the handwritten circle around the wedding date
            const circle = circleRef.current;
            if (circle) {
              gsap.set(circle, { opacity: 1 });
              gsap.fromTo(circle.querySelector('path'), 
                {
                  strokeDasharray: "200 200",
                  strokeDashoffset: 200
                },
                {
                  strokeDashoffset: 0,
                  duration: 1.5,
                  ease: "power2.out",
                  delay: 0.5 // Small delay after calendar stops
                }
              );
            }
          }
        });;
      });

    return () => {
      // Cleanup
      if (calendar) {
        calendar.dataset.animated = 'false';
      }
      gsap.killTweensOf([calendar, calendarGrid, monthText, yearText]);
    };
  }, []);

  return (
    <div
      ref={calendarRef}
      style={{
        backgroundColor: "white",
        borderRadius: "clamp(0.75rem, 2vw, 1rem)",
        boxShadow:
          "rgba(255, 255, 255, 0.1) 0px 1px 1px 0px inset, rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px",
        width: "clamp(280px, 90vw, 720px)",
        maxWidth: "100%",
        opacity: 0,
        transform: "translateY(50px)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          padding: "clamp(1.5rem, 4vw, 2.5rem)",
          gap: "clamp(1rem, 3vw, 2rem)",
          alignItems: isMobile ? "center" : "stretch",
        }}
      >
        {/* Calendar Left - Date Info */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "start",
            alignItems: isMobile ? "center" : "start",
            textAlign: isMobile ? "center" : "left",
            marginBottom: isMobile ? "1rem" : "0",
            minWidth: isMobile ? "auto" : "clamp(120px, 15vw, 180px)", // Fixed width for consistent layout
            flexShrink: 0, // Prevent shrinking
          }}
        >
          <h1
            ref={monthTextRef}
            style={{
              fontSize: "clamp(2.5rem, 8vw, 4rem)",
              margin: "0",
              lineHeight: "1",
              fontWeight: "700",
              color: "#2c3e50",
              width: "100%", // Take full width of container
            }}
          >
            {months[currentMonth]?.shortName || "May"}
          </h1>
          <p
            ref={yearTextRef}
            style={{
              fontSize: "clamp(1rem, 3vw, 1.5rem)",
              margin: "0",
              color: "#666",
              fontWeight: "500",
            }}
          >
            {months[currentMonth]?.year || "2025"}
          </p>
        </div>

        {/* Calendar Right - Fixed Headers + Animated Grid */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: isMobile ? "320px" : "none",
            height: isMobile
              ? "clamp(280px, 60vw, 400px)" // Increased height for mobile
              : "clamp(200px, 30vw, 280px)", // Increased height for desktop
            overflow: "hidden",
          }}
        >
          {/* Fixed Day Headers */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "clamp(20px, 4vw, 40px)",
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "clamp(3px, 1vw, 6px)", // Match the grid gap
              zIndex: 10,
              backgroundColor: "white",
              paddingBottom: "clamp(3px, 1vw, 6px)" // Match the gap
            }}
          >
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div
                key={day}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "clamp(0.7rem, 2vw, 0.875rem)",
                  fontWeight: "bold",
                  textAlign: "center",
                  color: "#2c3e50",
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Handwritten Circle for Wedding Date */}
          {currentMonth === months.length - 1 && (
            <svg
              ref={circleRef}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 1000,
                opacity: 0, // Hidden initially
              }}
              viewBox="0 0 100 100"
            >
              <path
                d="M 30 35 Q 20 25, 35 20 Q 50 15, 65 20 Q 80 25, 70 35 Q 75 50, 70 65 Q 80 75, 65 80 Q 50 85, 35 80 Q 20 75, 30 65 Q 25 50, 30 35"
                fill="none"
                stroke="#dc3545"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  filter: "drop-shadow(0 2px 4px rgba(220, 53, 69, 0.3))",
                }}
              />
            </svg>
          )}

          {/* Scrolling Dates Container */}
          <div
            style={{
              position: "absolute",
              top: "clamp(24px, 5vw, 44px)", // Start below the fixed headers
              left: 0,
              width: "100%",
              height: "calc(100% - clamp(24px, 5vw, 44px))",
              overflow: "hidden"
            }}
          >
            <div
              ref={calendarGridRef}
              style={{
                position: "relative",
                width: "100%",
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gridTemplateRows: `repeat(${Math.ceil(allCalendarData.length / 7)}, clamp(24px, 4vw, 42px))`, // Match the cell height
                gap: "clamp(3px, 1vw, 6px)",
                backgroundColor: "white",
              }}
            >
              {allCalendarData.map((dayData, index) => (
                <div
                  key={`day-${index}`}
                  style={getDayStyle(dayData)}
                >
                  {dayData.day}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}