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
  const [mapError, setMapError] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);

  const events = [
    {
      id: 1,
      time: "6:30 AM",
      title: "Tea ceremony",
      location: "Stephanie's house",
      address: "6 Orchard St, Epping, NSW 2121",
      coordinates: { lat: -33.7667, lng: 151.0833 },
      color: "#E8F5E8",
      accentColor: "#4CAF50"
    },
    {
      id: 2,
      time: "12:30 PM", 
      title: "Church ceremony",
      location: "Saint Brigid's Catholic Church",
      address: "Livingstone Rd, Marrickville, NSW 2204",
      coordinates: { lat: -33.9133, lng: 151.1553 },
      color: "#FFF3E0",
      accentColor: "#FF9800"
    },
    {
      id: 3,
      time: "6:30 PM",
      title: "Reception",
      location: "The Sky Ballroom",
      address: "Level 3/462 Chapel Rd, Bankstown NSW 2200", 
      coordinates: { lat: -33.9198, lng: 151.0346 },
      color: "#F3E5F5",
      accentColor: "#9C27B0"
    }
  ];

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

  // Improved map initialization with better error handling
  const initializeMap = () => {
    if (!mapRef.current || !window.google?.maps) {
      console.log('Google Maps not ready, retrying...');
      return;
    }

    try {
      setIsMapLoading(true);
      setMapError(false);

      const newMap = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center: events[0].coordinates,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: 'cooperative',
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

      // Wait for map to be ready before creating markers
      window.google.maps.event.addListenerOnce(newMap, 'idle', () => {
        try {
          // Create markers for all events
          const newMarkers = events.map((event, index) => {
            const marker = new window.google.maps.Marker({
              position: event.coordinates,
              map: newMap,
              title: event.location,
              animation: window.google.maps.Animation.DROP,
              icon: {
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                  <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="12" fill="${event.accentColor}" stroke="white" stroke-width="3"/>
                    <text x="16" y="20" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">${index + 1}</text>
                  </svg>
                `)}`,
                scaledSize: new window.google.maps.Size(32, 32),
                anchor: new window.google.maps.Point(16, 16)
              }
            });

            // Add click listener to marker
            marker.addListener('click', () => {
              setActiveEvent(index);
            });

            return { marker, event };
          });

          setMap(newMap);
          setMarkers(newMarkers);
          setIsMapLoading(false);
          console.log('Google Maps initialized successfully');
        } catch (error) {
          console.error('Error creating markers:', error);
          setMapError(true);
          setIsMapLoading(false);
        }
      });

      // Handle map errors
      window.google.maps.event.addListener(newMap, 'error', (error) => {
        console.error('Google Maps error:', error);
        setMapError(true);
        setIsMapLoading(false);
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(true);
      setIsMapLoading(false);
    }
  };

  // Load Google Maps API with improved error handling
  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google?.maps) {
      initializeMap();
      return;
    }

    // Check if script is already being loaded
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      // Wait for existing script to load
      const checkGoogleMaps = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(checkGoogleMaps);
          initializeMap();
        }
      }, 100);

      // Clear interval after 10 seconds to prevent infinite checking
      setTimeout(() => {
        clearInterval(checkGoogleMaps);
        if (!window.google?.maps) {
          setMapError(true);
          setIsMapLoading(false);
        }
      }, 10000);
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    // Temporary debug logging
    console.log('API Key loaded:', apiKey ? 'Yes (length: ' + apiKey.length + ')' : 'No');
    console.log('All env vars:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')));
    
    if (!apiKey) {
      console.error('Google Maps API key not found. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.');
      setMapError(true);
      setIsMapLoading(false);
      return;
    }

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry&v=3.54`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google Maps script loaded');
      // Small delay to ensure Google Maps is fully ready
      setTimeout(initializeMap, 100);
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Google Maps script:', error);
      setMapError(true);
      setIsMapLoading(false);
    };
    
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      // Don't remove the script as it might be used by other components
      // Just clear any intervals or timeouts if they exist
    };
  }, []);

  // Smooth pan with intelligent zoom
  const smoothPanToLocation = (targetCoords, currentCoords) => {
    if (!map) return;

    const distance = calculateDistance(currentCoords, targetCoords);
    
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
    } else { // Close distance (<2km)
      zoomOutLevel = 12;
      finalZoom = 15;
    }

    // Smooth animation sequence
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
    if (!map || !markers.length || mapError) return;

    const activeEventData = events[activeEvent];
    const currentCenter = map.getCenter();
    
    if (currentCenter) {
      const currentCoords = {
        lat: currentCenter.lat(),
        lng: currentCenter.lng()
      };
      
      // Smooth pan to the new location
      smoothPanToLocation(activeEventData.coordinates, currentCoords);
    }
  }, [activeEvent, map, markers, mapError]);

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

  const openInGoogleMaps = (event) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)}`;
    window.open(url, '_blank');
  };

  return (
    <div 
      ref={containerRef}
      style={{
        display: 'flex',
        background: '#f8f9fa'
      }}
    >
      {/* Left Side - Scrolling Timeline */}
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
                    onClick={() => openInGoogleMaps(event)}
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
                    Open in Google Maps
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
          {/* Loading State */}
          {isMapLoading && !mapError && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f8f9fa',
              zIndex: 10
            }}>
              <div style={{
                textAlign: 'center',
                color: '#666'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid #ddd',
                  borderTop: '4px solid #667eea',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 1rem'
                }} />
                <p>Loading map...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {mapError && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f8f9fa',
              zIndex: 10
            }}>
              <div style={{
                textAlign: 'center',
                color: '#666',
                padding: '2rem'
              }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1rem'
                }}>📍</div>
                <h3 style={{ marginBottom: '1rem' }}>Map unavailable</h3>
                <p style={{ marginBottom: '1.5rem' }}>
                  Unable to load the interactive map, but you can still view location details.
                </p>
                <button 
                  onClick={() => openInGoogleMaps(events[activeEvent])}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Open in Google Maps
                </button>
              </div>
            </div>
          )}

          {/* Map Element */}
          <div 
            ref={mapRef}
            style={{
              width: '100%',
              height: '100%',
              minHeight: '400px',
              opacity: mapError ? 0 : 1
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Schedule;