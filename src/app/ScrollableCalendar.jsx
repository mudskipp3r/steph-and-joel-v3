"use client";
import React, { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const ScrollingCalendar = () => {
  const containerRef = useRef(null);
  const calendarGridRef = useRef(null);
  const monthTextRef = useRef(null);
  const yearTextRef = useRef(null);
  const [currentMonth, setCurrentMonth] = useState(0);

  // Generate months from May 2025 to February 2026
  const generateMonths = () => {
    const months = [];
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Start from May 2025 (current month)
    const startYear = 2025;
    const startMonth = 4; // May (0-indexed)
    const endYear = 2026;
    const endMonth = 1; // February (0-indexed)
    
    let currentYear = startYear;
    let currentMonthIndex = startMonth;
    
    while (currentYear < endYear || (currentYear === endYear && currentMonthIndex <= endMonth)) {
      months.push({
        name: monthNames[currentMonthIndex],
        year: currentYear,
        index: currentMonthIndex
      });
      
      currentMonthIndex++;
      if (currentMonthIndex > 11) {
        currentMonthIndex = 0;
        currentYear++;
      }
    }
    
    return months;
  };

  // Calculate days until wedding
  const calculateDaysUntilWedding = () => {
    const today = new Date(2025, 4, 27); // May 27, 2025
    const weddingDay = new Date(2026, 1, 6); // February 6, 2026
    const timeDiff = weddingDay.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
  };

  const months = generateMonths();
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weddingDate = { year: 2026, month: 1, day: 6 }; // February 6, 2026
  const todayDate = { year: 2025, month: 4, day: 27 }; // May 27, 2025
  const daysUntilWedding = calculateDaysUntilWedding();

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    const firstDay = new Date(year, month, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1; // Convert Sunday=0 to Monday=0
  };

  const generateCalendarDays = (monthData, monthArrayIndex) => {
    const daysInMonth = getDaysInMonth(monthData.index, monthData.year);
    const firstDay = getFirstDayOfMonth(monthData.index, monthData.year);
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, isCurrentMonth: false, key: `empty-${monthArrayIndex}-${i}` });
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = monthData.year === todayDate.year && 
                     monthData.index === todayDate.month && 
                     day === todayDate.day;
      const isWeddingDay = monthData.year === weddingDate.year && 
                          monthData.index === weddingDate.month && 
                          day === weddingDate.day;
      
      days.push({
        day,
        isCurrentMonth: true,
        isToday,
        isWeddingDay,
        key: `${monthData.name}-${day}-${monthArrayIndex}`
      });
    }

    // Fill to complete 6 rows (42 total cells)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({ day: i, isCurrentMonth: false, key: `next-${monthArrayIndex}-${i}` });
    }

    return days;
  };

  useGSAP(() => {
    const container = containerRef.current;
    const calendarGrid = calendarGridRef.current;
    const monthText = monthTextRef.current;
    const yearText = yearTextRef.current;

    if (!container || !calendarGrid) return;

    // Set initial state
    gsap.set(container, { opacity: 0, y: 50 });

    // Create the main timeline that triggers on scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none none"
      }
    });

    // Initial fade in
    tl.to(container, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power3.out"
    })
    .to({}, { duration: 0.3 }) // Brief pause to show today
    .add(() => {
      // Create smooth progression with gradually increasing durations
      const scrollTl = gsap.timeline();
      
      months.forEach((month, index) => {
        if (index === 0) return; // Skip first month (already showing)
        
        // Smooth progression from fast to slow
        let duration;
        if (index <= 2) duration = 0.08; // Very fast start
        else if (index <= 4) duration = 0.12; 
        else if (index <= 6) duration = 0.18;
        else if (index <= 7) duration = 0.25;
        else if (index <= 8) duration = 0.35;
        else duration = 0.45; // Gentle slow-down for final months
        
        scrollTl.add(() => {
          setCurrentMonth(index);
          if (monthText && yearText) {
            monthText.textContent = month.name;
            yearText.textContent = month.year;
          }
        })
        .to(calendarGrid, {
          y: `-${index * 100}%`,
          duration: duration,
          ease: "power1.out"
        });
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === container) {
          trigger.kill();
        }
      });
    };
  }, []);

  const getDayStyle = (dayInfo) => {
    const baseStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      aspectRatio: '1',
      margin: '0',
      fontWeight: dayInfo.isCurrentMonth ? '600' : '300',
      color: dayInfo.isCurrentMonth ? '#2c3e50' : '#ccc',
      fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
      background: dayInfo.isCurrentMonth ? '#ffffff' : '#f8f9fa',
      border: '1px solid #e0e0e0',
      position: 'relative'
    };

    if (dayInfo.isToday) {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
        color: 'white',
        fontWeight: '700',
        border: '1px solid #28a745'
      };
    }

    if (dayInfo.isWeddingDay) {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontWeight: '700',
        border: '1px solid #667eea',
        animation: 'pulse 2s infinite'
      };
    }

    return baseStyle;
  };

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      boxSizing: 'border-box'
    }}>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}
      </style>
      <div 
        ref={containerRef}
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '900px',
          height: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Fixed Header within component */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.98)',
          borderBottom: '1px solid rgba(0,0,0,0.1)',
          padding: '2rem 3rem 1rem 3rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '24px 24px 0 0'
        }}>
          <div>
            <h1 
              ref={monthTextRef}
              style={{
                margin: 0,
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: '700',
                color: '#2c3e50',
                lineHeight: 1
              }}
            >
              {months[currentMonth].name}
            </h1>
            <p 
              ref={yearTextRef}
              style={{
                margin: 0,
                fontSize: 'clamp(1.2rem, 3vw, 2rem)',
                color: '#666',
                fontWeight: '400'
              }}
            >
              {months[currentMonth].year}
            </p>
          </div>
          <div style={{
            textAlign: 'right',
            color: '#666',
            fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
            fontWeight: '600'
          }}>
            <div style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: '#667eea', fontWeight: '700' }}>
              {daysUntilWedding}
            </div>
            <div style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', marginTop: '4px' }}>
              days until wedding
            </div>
          </div>
        </div>

        {/* Day Headers - fixed within component */}
        <div style={{
          background: 'rgba(248, 249, 250, 0.9)',
          borderBottom: '1px solid rgba(0,0,0,0.1)',
          padding: '0 3rem'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '6px'
          }}>
            {dayNames.map(day => (
              <div key={day} style={{
                textAlign: 'center',
                fontWeight: '600',
                padding: '1.2rem 0',
                fontSize: 'clamp(0.8rem, 2vw, 1.1rem)',
                color: '#666',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* Scrolling Calendar Container */}
        <div style={{
          flex: 1,
          padding: '2rem 3rem',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div
            ref={calendarGridRef}
            style={{
              position: 'relative',
              width: '100%',
              height: '100%'
            }}
          >
            {months.map((month, monthIndex) => {
              const monthCalendarDays = generateCalendarDays(month, monthIndex);
              return (
                <div
                  key={`month-${monthIndex}`}
                  style={{
                    position: 'absolute',
                    top: `${monthIndex * 100}%`,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gridTemplateRows: 'repeat(6, 1fr)',
                    gap: '0',
                    background: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    padding: '0',
                    boxSizing: 'border-box'
                  }}
                >
                  {monthCalendarDays.map((dayInfo) => (
                    <div
                      key={`${monthIndex}-${dayInfo.key}`}
                      style={getDayStyle(dayInfo)}
                    >
                      {dayInfo.day}
                      {dayInfo.isToday && (
                        <div style={{
                          position: 'absolute',
                          bottom: '6px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: '0.6rem',
                          fontWeight: '700',
                          letterSpacing: '0.5px',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                        }}>
                          TODAY
                        </div>
                      )}
                      {dayInfo.isWeddingDay && (
                        <>
                          <div style={{
                            position: 'absolute',
                            bottom: '6px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '0.65rem',
                            fontWeight: '700',
                            letterSpacing: '0.5px',
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                          }}>
                            WEDDING
                          </div>
                          <div style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            fontSize: '1.1rem'
                          }}>
                            💒
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollingCalendar;