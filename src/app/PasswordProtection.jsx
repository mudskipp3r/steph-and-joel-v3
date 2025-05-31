// src/app/PasswordProtection.jsx
import React, { useState, useEffect } from 'react';

const PasswordProtection = ({
  children,
  correctPasswordHash = process.env.NEXT_PUBLIC_SITE_PASSWORD_HASH || "f3347c6800b7fe2ba143f514c5a471f5fcf35bbf26a5cc6cb60207cd840e3fdb", // Your actual password hash as fallback
  sessionKey = "wedding_site_auth",
  title = "🔒 Protected Content",
  description = "Please enter the password to access this site.",
  placeholder = "Enter password",
  onAuthenticated
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    const authStatus = sessionStorage.getItem(sessionKey);
    if (authStatus === "true") {
      setIsAuthenticated(true);
      onAuthenticated?.();
    }
  }, [sessionKey, onAuthenticated]);

  // Hash password function
  const hashPassword = async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setShowError(false);

    try {
      const hashedPassword = await hashPassword(password);
      
      if (hashedPassword === correctPasswordHash) {
        sessionStorage.setItem(sessionKey, "true");
        setIsAuthenticated(true);
        onAuthenticated?.();
      } else {
        setShowError(true);
        setPassword('');
        
        // Hide error after 3 seconds
        setTimeout(() => setShowError(false), 3000);
      }
    } catch (error) {
      console.error('Password verification failed:', error);
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // If authenticated, render children without logout button
  // (logout will be handled by the Navigation component)
  if (isAuthenticated) {
    return (
      <div className="password-protected-content">
        {children}
      </div>
    );
  }

  // Render password modal
  return (
    <div className="password-overlay">
      <div className="password-modal">
        <h2>{title}</h2>
        <p>{description}</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={placeholder}
            className="password-input"
            required
            disabled={isLoading}
            autoFocus
          />
          <button 
            type="submit" 
            className="password-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Access Site'}
          </button>
          <div className={`error-message ${showError ? 'show' : ''}`}>
            Incorrect password. Please try again.
          </div>
        </form>
      </div>

      <style jsx>{`
        .password-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          backdrop-filter: blur(5px);
        }

        .password-modal {
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          text-align: center;
          max-width: 400px;
          width: 90%;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .password-modal h2 {
          color: #333;
          margin-bottom: 20px;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .password-modal p {
          color: #666;
          margin-bottom: 30px;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .password-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 16px;
          margin-bottom: 20px;
          transition: border-color 0.3s ease;
        }

        .password-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .password-input:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }

        .password-btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .password-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .password-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .password-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .error-message {
          color: #e53e3e;
          font-size: 0.9rem;
          margin-top: 10px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .error-message.show {
          opacity: 1;
        }

        .password-protected-content {
          min-height: 100vh;
        }
      `}</style>
    </div>
  );
};

export default PasswordProtection;