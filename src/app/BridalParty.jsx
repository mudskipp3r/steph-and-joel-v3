"use client";
import React, { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { Observer } from 'gsap/Observer';

gsap.registerPlugin(Observer);

const BridalParty = () => {
  const containerRef = useRef(null);
  const carouselRef = useRef(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Custom card data (Joel's creations!)
  const customCards = [
    { id: 1, name: "Jay", role: "Best Man", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&crop=face", stats: { charm: 95, loyalty: 100, humor: 88 } },
    { id: 2, name: "Sarah", role: "Maid of Honor", image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=600&h=800&fit=crop&crop=face", stats: { grace: 98, wisdom: 92, kindness: 100 } },
    { id: 3, name: "Mike", role: "Groomsman", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=800&fit=crop&crop=face", stats: { strength: 90, fun: 95, reliability: 88 } },
    { id: 4, name: "Emily", role: "Bridesmaid", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=800&fit=crop&crop=face", stats: { creativity: 94, energy: 89, support: 96 } },
    { id: 5, name: "Alex", role: "Groomsman", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=800&fit=crop&crop=face", stats: { adventure: 92, humor: 87, dedication: 94 } },
    { id: 6, name: "Jessica", role: "Bridesmaid", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop&crop=face", stats: { elegance: 97, intelligence: 91, warmth: 93 } },
    { id: 7, name: "David", role: "Groomsman", image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=600&h=800&fit=crop&crop=face", stats: { leadership: 89, loyalty: 98, courage: 85 } }
  ];

  // Duplicate cards for infinite scroll
  const allCards = [...customCards, ...customCards];

  useEffect(() => {
    let total = 0;
    let xTo;
    let itemValues = [];
    
    const content = carouselRef.current;
    const cards = content?.querySelectorAll('.card');
    
    if (!content || !cards) return;

    const cardsLength = customCards.length;
    const half = content.clientWidth / 2;
    const wrap = gsap.utils.wrap(-half, 0);
    
    xTo = gsap.quickTo(content, "x", {
      duration: 0.5,
      ease: 'power3',
      modifiers: {
        x: gsap.utils.unitize(wrap),
      },
    });

    // Generate random values for card scatter effect
    for (let i = 0; i < cardsLength; i++) {
      itemValues.push((Math.random() - 0.5) * 20);
    }

    // Create timeline for card scatter on press
    const tl = gsap.timeline({ paused: true });
    tl.to(cards, {
      rotate: (index) => (itemValues[index % cardsLength]),
      xPercent: (index) => (itemValues[index % cardsLength]),
      yPercent: (index) => (itemValues[index % cardsLength]),
      scale: 0.95,
      duration: 0.5,
      ease: 'back.inOut(3)',
    });

    // Set up Observer for drag interactions
    Observer.create({
      target: content,
      type: "pointer,touch",
      onPress: () => tl.play(),
      onDrag: (self) => {
        total += self.deltaX;
        xTo(total);
      },
      onRelease: () => {
        tl.reverse();
      },
      onStop: () => {
        tl.reverse();
      },
    });

    // Auto-scroll ticker
    const tick = (time, deltaTime) => {
      total -= deltaTime / 15; // Slower auto-scroll
      xTo(total);
    };

    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      Observer.getAll().forEach(obs => obs.kill());
    };
  }, []);

  // Handle mouse movement for 3D card effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    if (selectedCard) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [selectedCard]);

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const closeCard = () => {
    setSelectedCard(null);
  };

  // Calculate 3D rotation based on mouse position
  const getCardTransform = () => {
    if (!selectedCard) return '';
    
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const rotateX = (mousePos.y - centerY) / 20;
    const rotateY = (mousePos.x - centerX) / 20;
    
    return `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) translateZ(100px)`;
  };

  return (
    <section 
      ref={containerRef}
      style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        position: 'relative'
      }}
    >
      {/* Header */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        padding: '25px',
        letterSpacing: '-0.03em',
        textTransform: 'uppercase',
        color: '#F1F1F1',
        zIndex: 10
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 'clamp(2rem, 3.5vw, 4rem)',
          fontWeight: '500',
          fontFamily: 'Inter, sans-serif'
        }}>
          <p style={{ margin: 0 }}>Bridal Party</p>
          <p style={{ margin: 0 }}>Custom Cards</p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          marginTop: '10px'
        }}>
          <div style={{
            width: '23px',
            height: '23px',
            background: '#667eea',
            borderRadius: '50%'
          }} />
          <p style={{
            margin: 0,
            fontSize: '13px',
            fontFamily: 'IBM Plex Mono',
            fontWeight: '500'
          }}>
            Drag the carousel • Click cards for 3D view
          </p>
        </div>
      </div>

      {/* Draggable Carousel */}
      <div 
        ref={carouselRef}
        style={{
          width: 'max-content',
          whiteSpace: 'nowrap',
          display: 'flex',
          gap: '1vw',
          padding: '0 1vw 0 0',
          userSelect: 'none',
          cursor: 'grab'
        }}
      >
        {allCards.map((card, index) => (
          <div
            key={`${card.id}-${index}`}
            className="card"
            onClick={() => handleCardClick(card)}
            style={{
              width: '25vw',
              aspectRatio: '2/3',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transformOrigin: 'center bottom'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
              e.currentTarget.style.filter = 'brightness(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          >
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(145deg, #2a2a3e, #1e1e2e)',
              borderRadius: '16px',
              padding: '1rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(102, 126, 234, 0.2)',
              border: '2px solid rgba(102, 126, 234, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Holographic shine effect */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                animation: 'shine 3s infinite',
                pointerEvents: 'none'
              }} />

              {/* Card content */}
              <div style={{
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  flex: 1,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  marginBottom: '1rem'
                }}>
                  <img 
                    src={card.image}
                    alt={card.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
                
                <div style={{
                  color: '#F1F1F1',
                  textAlign: 'center'
                }}>
                  <h3 style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: 'clamp(1.2rem, 2vw, 1.8rem)',
                    fontWeight: '700',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                  }}>
                    {card.name}
                  </h3>
                  <p style={{
                    margin: 0,
                    fontSize: 'clamp(0.9rem, 1.5vw, 1.2rem)',
                    color: '#667eea',
                    fontWeight: '600'
                  }}>
                    {card.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3D Card Modal */}
      {selectedCard && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(10px)'
          }}
          onClick={closeCard}
        >
          <div 
            style={{
              width: '400px',
              height: '600px',
              transform: getCardTransform(),
              transition: 'transform 0.1s ease-out',
              cursor: 'none'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(145deg, #2a2a3e, #1e1e2e)',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
              border: '3px solid rgba(102, 126, 234, 0.5)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Enhanced holographic effect */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                animation: 'shine 2s infinite',
                pointerEvents: 'none'
              }} />

              {/* Card content */}
              <div style={{
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                color: '#F1F1F1'
              }}>
                <div style={{
                  flex: 1,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  marginBottom: '1.5rem'
                }}>
                  <img 
                    src={selectedCard.image}
                    alt={selectedCard.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                  }}>
                    {selectedCard.name}
                  </h2>
                  <p style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    color: '#667eea',
                    fontWeight: '600'
                  }}>
                    {selectedCard.role}
                  </p>
                </div>

                {/* Stats */}
                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '12px',
                  padding: '1rem'
                }}>
                  <h4 style={{
                    margin: '0 0 1rem 0',
                    fontSize: '1.2rem',
                    textAlign: 'center',
                    color: '#667eea'
                  }}>
                    Special Attributes
                  </h4>
                  {Object.entries(selectedCard.stats).map(([stat, value]) => (
                    <div key={stat} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ textTransform: 'capitalize' }}>{stat}</span>
                      <span style={{ color: '#667eea', fontWeight: '700' }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
    </section>
  );
};

export default BridalParty;