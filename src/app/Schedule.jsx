"use client";
import React, { useRef, useState, useEffect } from 'react';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const Schedule = () => {
  const containerRef = useRef(null);
  const rightRef = useRef(null);
  const mapRef = useRef(null);
  const [activeEvent, setActiveEvent] = useState(0);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  const events = [
    {
      id: 1,
      time: "6:30 AM",
      title: "Tea ceremony",
      location: "Stephanie's house",
      address: "6 Orchard St, Epping, NSW 2121",
      coordinates: { lat: -33.7667, lng: 151.0833 }, // Epping coordinates
      color: "#E8F5E8",
      accentColor: "#4CAF50"
    },
    {
      id: 2,
      time: "12:30 PM", 
      title: "Church ceremony",
      location: "Saint Brigid's Catholic Church",
      address: "Livingstone Rd, Marrickville, NSW 2204",
      coordinates: { lat: -33.9133, lng: 151.1553 }, // Marrickville coordinates
      color: "#FFF3E0",
      accentColor: "#FF9800"
    },
    {
      id: 3,
      time: "6:30 PM",
      title: "Reception",
      location: "The Sky Ballroom",
      address: "Level 3/462 Chapel Rd, Bankstown NSW 2200", 
      coordinates: { lat: -33.9198, lng: 151.0346 }, // Bankstown coordinates
      color: "#F3E5F5",
      accentColor: "#9C27B0"
    }
  ];

  // Initialize Google Map
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !window.google) return;

      const newMap = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center: events[0].coordinates,
        styles: [
          {
            "featureType": "all",
            "elementType": "geometry.fill",
            "stylers": [{"weight": "2.00"}]
          },
          {
            "featureType": "all",
            "elementType": "geometry.stroke",
            "stylers": [{"color": "#9c9c9c"}]
          },
          {
            "featureType": "all",
            "elementType": "labels.text",
            "stylers": [{"visibility": "on"}]
          },
          {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [{"color": "#f2f2f2"}]
          },
          {
            "featureType": "water",
            "elementType": "all",
            "stylers": [{"color": "#e6f3ff"}]
          }
        ]
      });

      // Create markers for all events
      const newMarkers = events.map((event, index) => {
        const marker = new window.google.maps.Marker({
          position: event.coordinates,
          map: newMap,
          title: event.location
        });

        return { marker };
      });

      setMap(newMap);
      setMarkers(newMarkers);
    };

    // Load Google Maps API if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCaXKqM2Vx4e84Ucn7nzZ-0JF7pZEA8B-4&callback=initMap`;
      script.async = true;
      script.defer = true;
      window.initMap = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, []);

  // Calculate distance between two coordinates (in km)
  const calculateDistance = (coord1, coord2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Smooth pan with intelligent zoom
  const smoothPanToLocation = (targetCoords, currentCoords) => {
    if (!map) return;

    const distance = calculateDistance(currentCoords, targetCoords);
    const currentZoom = map.getZoom();
    
    // Always zoom out and back in to make location changes clear
    let zoomOutLevel, finalZoom;
    
    if (distance > 10) { // Very far (>10km)
      zoomOutLevel = 10;
      finalZoom = 14;
    } else if (distance > 5) { // Far (5-10km)
      zoomOutLevel = 11;
      finalZoom = 15;
    } else if (distance > 2) { // Medium distance (2-5km)
      zoomOutLevel = 12;
      finalZoom = 15;
    } else { // Close distance (<2km) - still zoom out for clarity
      zoomOutLevel = 12;
      finalZoom = 15;
    }

    // Always animate with zoom out, pan, zoom in sequence
    map.setZoom(zoomOutLevel);
    
    setTimeout(() => {
      map.panTo(targetCoords);
    }, 300);
    
    setTimeout(() => {
      map.setZoom(finalZoom);
    }, 1000);
  };

  // Update map when active event changes
  useEffect(() => {
    if (!map || !markers.length) return;

    const activeEventData = events[activeEvent];
    const currentCenter = map.getCenter();
    const currentCoords = {
      lat: currentCenter.lat(),
      lng: currentCenter.lng()
    };
    
    // Smooth pan to the new location
    smoothPanToLocation(activeEventData.coordinates, currentCoords);
    
    // Update marker sizes and styles with animation delay
    setTimeout(() => {
      markers.forEach((markerObj, index) => {
        // All markers use standard red Google Maps markers
        // No special styling needed - they're already standard markers
      });
    }, 600);

  }, [activeEvent, map, markers]);

  useGSAP(() => {
    const container = containerRef.current;
    const rightSide = rightRef.current;

    if (!container || !rightSide) return;

    // Pin the right side (map) while left side (timeline) scrolls
    ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "bottom bottom",
      pin: rightSide
    });

    // Create scroll triggers for each event to update the map
    events.forEach((event, index) => {
      const eventElement = document.querySelector(`[data-event-id="${event.id}"]`);
      
      if (eventElement) {
        ScrollTrigger.create({
          trigger: eventElement,
          start: "top 60%",
          end: "bottom 40%",
          onEnter: () => {
            setActiveEvent(index);
          },
          onEnterBack: () => {
            setActiveEvent(index);
          }
        });
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      style={{
        display: 'flex',
        background: '#f8f9fa'
      }}
    >
      {/* Left Side - Scrolling Timeline (Your original code) */}
      <div style={{
        width: '50%'
      }}>
        <div style={{
          margin: 'auto',
          width: '80%',
          padding: '2rem 0'
        }}>
          {events.map((event, index) => (
            <div
              key={event.id}
              data-event-id={event.id}
              style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative',
                padding: '2rem'
              }}
            >
              {/* Timeline dot */}
              <div style={{
                position: 'absolute',
                left: '-2rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '24px',
                height: '24px',
                background: activeEvent === index ? event.accentColor : '#ccc',
                borderRadius: '50%',
                border: '4px solid white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transition: 'all 0.4s ease',
                zIndex: 5
              }} />

              {/* Event content card */}
              <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '3rem',
                boxShadow: activeEvent === index ? 
                  `0 15px 40px ${event.accentColor}30` : 
                  '0 8px 25px rgba(0,0,0,0.1)',
                transition: 'all 0.5s ease',
                border: activeEvent === index ? 
                  `3px solid ${event.accentColor}` : 
                  '3px solid transparent',
                transform: activeEvent === index ? 'scale(1.02)' : 'scale(1)'
              }}>
                <div style={{
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  color: event.accentColor,
                  marginBottom: '1rem'
                }}>
                  {event.time}
                </div>
                
                <h3 style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: '#2c3e50',
                  margin: '0 0 1.5rem 0'
                }}>
                  {event.title}
                </h3>
                
                <div style={{
                  fontSize: '1.4rem',
                  fontWeight: '600',
                  color: '#495057',
                  marginBottom: '1rem'
                }}>
                  {event.location}
                </div>
                
                <div style={{
                  fontSize: '1.1rem',
                  color: '#6c757d',
                  lineHeight: '1.6',
                  marginBottom: '2rem'
                }}>
                  {event.address}
                </div>

                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <button 
                    onClick={() => {
                      if (map && markers[index]) {
                        const currentCenter = map.getCenter();
                        const currentCoords = {
                          lat: currentCenter.lat(),
                          lng: currentCenter.lng()
                        };
                        smoothPanToLocation(event.coordinates, currentCoords);
                      }
                    }}
                    style={{
                      padding: '1rem 2rem',
                      background: event.accentColor,
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: `0 4px 15px ${event.accentColor}40`
                    }}
                  >
                    View on Map
                  </button>
                  
                  <button style={{
                    padding: '1rem 2rem',
                    background: 'transparent',
                    color: event.accentColor,
                    border: `2px solid ${event.accentColor}`,
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}>
                    Add to Calendar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Pinned Map */}
      <div 
        ref={rightRef}
        style={{
          width: '50%',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: events[activeEvent]?.color || '#E8F5E8',
          transition: 'background-color 0.8s ease',
          position: 'sticky',
          top: 0
        }}
      >
        {/* Map Container */}
        <div style={{
          flex: 1,
          borderRadius: '0px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div 
            ref={mapRef}
            style={{
              width: '100%',
              height: '100%',
              minHeight: '400px'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Schedule;