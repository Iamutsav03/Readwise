import React, { useState } from "react";
import { useAuth } from "./useAuth";
import { BookOpen, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const { login, signup } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--rw-app-bg)",
      fontFamily: "'DM Sans', sans-serif",
      color: "var(--rw-text-primary)",
      padding: "20px"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        .auth-container {
          width: 100%;
          max-width: 420px;
          background: var(--rw-card-bg);
          border: 1px solid var(--rw-border);
          border-radius: 16px;
          padding: 40px;
          box-shadow: var(--rw-shadow);
          animation: fade-in-up 0.5s ease-out forwards;
        }

        .auth-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 32px;
        }

        .auth-logo-icon {
          width: 36px;
          height: 36px;
          background: var(--rw-accent);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--rw-accent-text);
        }

        .auth-logo-text {
          font-family: "'Playfair Display', Georgia, serif";
          font-size: 26px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: var(--rw-text-primary);
        }

        .auth-tabs {
          display: flex;
          background: var(--rw-hover-bg);
          border-radius: 8px;
          padding: 4px;
          margin-bottom: 32px;
        }

        .auth-tab {
          flex: 1;
          padding: 10px 0;
          text-align: center;
          font-size: 14px;
          font-weight: 500;
          color: var(--rw-text-muted);
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .auth-tab.active {
          background: var(--rw-card-bg);
          color: var(--rw-text-primary);
          box-shadow: 0 2px 4px rgba(0,0,0,0.15);
        }

        .auth-input-group {
          margin-bottom: 20px;
        }

        .auth-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: var(--rw-text-secondary, #b4b9c6);
          margin-bottom: 8px;
        }

        .auth-input {
          width: 100%;
          padding: 12px 16px;
          background: var(--rw-hover-bg);
          border: 1px solid var(--rw-border);
          border-radius: 8px;
          color: var(--rw-text-primary);
          font-family: inherit;
          font-size: 15px;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .auth-input:focus {
          outline: none;
          border-color: var(--rw-accent);
          box-shadow: 0 0 0 3px var(--rw-accent-muted);
        }

        .auth-button {
          width: 100%;
          padding: 14px;
          background: var(--rw-accent);
          color: var(--rw-accent-text);
          border: none;
          border-radius: 8px;
          font-family: inherit;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .auth-button:hover:not(:disabled) {
          background: var(--rw-accent-hover);
          transform: translateY(-1px);
        }

        .auth-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .auth-error {
          background: color-mix(in srgb, var(--rw-danger) 12%, transparent);
          border: 1px solid color-mix(in srgb, var(--rw-danger) 30%, transparent);
          color: var(--rw-danger);
          padding: 12px;
          border-radius: 8px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
          animation: shake 0.4s ease-in-out;
        }

        .auth-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .auth-password-toggle {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: var(--rw-text-muted, #8b92a5);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          transition: color 0.2s ease;
        }

        .auth-password-toggle:hover {
          color: var(--rw-text-primary, #ffffff);
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>

      <div className="auth-container">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <BookOpen size={20} />
          </div>
          <div className="auth-logo-text">ReadWise</div>
        </div>

        <div className="auth-tabs">
          <div 
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setError(""); setPassword(""); setConfirmPassword(""); }}
          >
            Sign In
          </div>
          <div 
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setError(""); setPassword(""); setConfirmPassword(""); }}
          >
            Create Account
          </div>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <label className="auth-label">Email Address</label>
            <input 
              type="email" 
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="auth-input-group" style={{ marginBottom: isLogin ? "32px" : "20px" }}>
            <label className="auth-label">Password</label>
            <div className="auth-input-wrapper">
              <input 
                type={showPassword ? "text" : "password"}
                className="auth-input"
                style={{ paddingRight: "40px" }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLogin ? "Enter your password" : "Min. 8 characters"}
                required
                minLength={isLogin ? 1 : 8}
              />
              <button 
                type="button" 
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="auth-input-group" style={{ marginBottom: "32px" }}>
              <label className="auth-label">Confirm Password</label>
              <div className="auth-input-wrapper">
                <input 
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  style={{ paddingRight: "40px" }}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  minLength={8}
                />
                <button 
                  type="button" 
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? (
              <><Loader2 size={18} className="spin" style={{ animation: "rw-spin 1s linear infinite" }} /> Please wait...</>
            ) : (
              isLogin ? "Sign In" : "Create Account"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
