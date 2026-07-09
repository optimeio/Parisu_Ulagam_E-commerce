import React, { useState, useContext, useRef } from 'react';
import { ToastContext } from '../context/ToastContext';
import './SignupPage.css';

export default function SignupPage({ onLoginClick, theme }) {
  const { addToast } = useContext(ToastContext);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});

  const nameRef = useRef(null);
  const rightContainerRef = useRef(null);
  const emailRef = useRef(null);
  const mobileRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const termsRef = useRef(null);
  const otpRef = useRef(null);

  const heroBannerSrc = '/images/hero-classic.png';

  const validateStep1 = () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = 'Full Name is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) newErrors.email = 'Please enter a valid email address.';
    if (!/^\d{10}$/.test(mobile)) newErrors.mobile = 'Mobile number must be exactly 10 digits.';
    if (!password || password.length < 8) newErrors.password = 'Password must be at least 8 characters.';
    if (!confirmPassword || password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
    if (!gender) newErrors.gender = 'Please select your gender.';
    if (!terms) newErrors.terms = 'You must agree to the Terms & Conditions and Privacy Policy.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      if (newErrors.fullName) nameRef.current?.focus();
      else if (newErrors.email) emailRef.current?.focus();
      else if (newErrors.mobile) mobileRef.current?.focus();
      else if (newErrors.password) passwordRef.current?.focus();
      else if (newErrors.confirmPassword) confirmPasswordRef.current?.focus();
      else if (newErrors.terms) termsRef.current?.focus();
      return false;
    }
    return true;
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!validateStep1()) return;
    setLoading(true);
    try {
      const r = await fetch('/api/users/register-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName, email, mobile })
      });
      const data = await r.json();
      if (data.success) {
        setStep(2);
        addToast('Verification code sent to your email!', 'success');
        setTimeout(() => otpRef.current?.focus(), 150);
      } else {
        addToast(data.message || 'Failed to send verification code. Please try again.', 'error');
      }
    } catch {
      addToast('Connection error. Please check your network and try again.', 'error');
    }
    setLoading(false);
  };

  const handleVerifyAndComplete = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setErrors({ otp: 'Please enter the 6-digit verification code.' });
      otpRef.current?.focus();
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const verifyRes = await fetch('/api/users/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp })
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        setErrors({ otp: verifyData.message || 'Invalid or expired verification code.' });
        setLoading(false);
        return;
      }
      const completeRes = await fetch('/api/users/complete-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email,
          mobile,
          password,
          address: '',
          extraDetails: '',
          registrationToken: verifyData.registrationToken
        })
      });
      const completeData = await completeRes.json();
      if (completeData.success) {
        addToast('Your account has been created successfully! Please log in.', 'success');
        if (onLoginClick) onLoginClick();
      } else {
        addToast(completeData.message || 'Registration failed. Please try again.', 'error');
      }
    } catch {
      addToast('Connection error. Please try again.', 'error');
    }
    setLoading(false);
  };

  const EyeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
  const EyeOffIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

  return (
    <div className="su-page">
      {/* LEFT COLUMN */}
      <div className="su-left">
        <div className="su-left-inner">
          <img src={heroBannerSrc} alt="Parisu Ulagam Collection" className="su-banner-img" />
          <h1 className="su-banner-title">Create your account</h1>
          <p className="su-banner-subtitle">
            Join us today and enjoy exclusive deals, faster checkout, and a better shopping experience.
          </p>
          <ul className="su-features">
            <li className="su-feature-item">
              <span className="su-feature-icon">✨</span>
              <div className="su-feature-text">
                <strong>Exclusive Offers</strong>
                <span>Members-only deals &amp; early access</span>
              </div>
            </li>
            <li className="su-feature-item">
              <span className="su-feature-icon">🛒</span>
              <div className="su-feature-text">
                <strong>Easy Shopping</strong>
                <span>Faster checkout with saved details</span>
              </div>
            </li>
            <li className="su-feature-item">
              <span className="su-feature-icon">🔒</span>
              <div className="su-feature-text">
                <strong>Secure &amp; Safe</strong>
                <span>Industry-standard data protection</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="su-right" ref={rightContainerRef}>
        <div className="su-card">

          {step === 1 && (
            <form onSubmit={handleCreateAccount} noValidate>
              <div className="su-card-header">
                <div className="su-card-icon-wrap">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                  </svg>
                </div>
                <h2 className="su-card-title">Create Account</h2>
                <p className="su-card-subtitle">Fill in your details to get started</p>
                <div className="su-step-dots">
                  <span className="su-dot su-dot-active" />
                  <span className="su-dot" />
                </div>
              </div>

              <div className="su-field">
                <label htmlFor="su-fullname">Full Name <span className="su-req">*</span></label>
                <input id="su-fullname" ref={nameRef} type="text" autoComplete="name"
                  value={fullName} onChange={e => setFullName(e.target.value)}
                  className={errors.fullName ? 'su-input su-input-err' : 'su-input'}
                  placeholder="Enter your full name" />
                {errors.fullName && <span className="su-err">{errors.fullName}</span>}
              </div>

              <div className="su-field">
                <label htmlFor="su-email">Email Address <span className="su-req">*</span></label>
                <input id="su-email" ref={emailRef} type="email" autoComplete="email"
                  value={email} onChange={e => setEmail(e.target.value)}
                  className={errors.email ? 'su-input su-input-err' : 'su-input'}
                  placeholder="your@email.com" />
                {errors.email && <span className="su-err">{errors.email}</span>}
              </div>

              <div className="su-field">
                <label htmlFor="su-mobile">Mobile Number <span className="su-req">*</span></label>
                <input id="su-mobile" ref={mobileRef} type="tel" autoComplete="tel"
                  value={mobile}
                  onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className={errors.mobile ? 'su-input su-input-err' : 'su-input'}
                  placeholder="10-digit mobile number"
                  maxLength={10} />
                {errors.mobile && <span className="su-err">{errors.mobile}</span>}
              </div>

              <div className="su-field">
                <label htmlFor="su-pass">Password <span className="su-req">*</span></label>
                <div className="su-pass-wrap">
                  <input id="su-pass" ref={passwordRef} autoComplete="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password} onChange={e => setPassword(e.target.value)}
                    className={errors.password ? 'su-input su-input-err' : 'su-input'}
                    placeholder="Min. 8 characters" />
                  <button type="button" className="su-eye-btn" onClick={() => setShowPassword(v => !v)}
                    aria-label="Toggle password visibility">
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.password && <span className="su-err">{errors.password}</span>}
              </div>

              <div className="su-field">
                <label htmlFor="su-cpass">Confirm Password <span className="su-req">*</span></label>
                <div className="su-pass-wrap">
                  <input id="su-cpass" ref={confirmPasswordRef} autoComplete="new-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className={errors.confirmPassword ? 'su-input su-input-err' : 'su-input'}
                    placeholder="Re-enter your password" />
                  <button type="button" className="su-eye-btn" onClick={() => setShowConfirmPassword(v => !v)}
                    aria-label="Toggle confirm password visibility">
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="su-err">{errors.confirmPassword}</span>}
              </div>

              <div className="su-field">
                <label>Gender Selection <span className="su-req">*</span></label>
                <div className="su-radio-group">
                  <label className="su-radio-label">
                    <input type="radio" name="su-gender" value="Male"
                      checked={gender === 'Male'} onChange={e => setGender(e.target.value)} />
                    <span className="su-radio-box">
                      <span className="su-radio-dot" />
                    </span>
                    Male
                  </label>
                  <label className="su-radio-label">
                    <input type="radio" name="su-gender" value="Female"
                      checked={gender === 'Female'} onChange={e => setGender(e.target.value)} />
                    <span className="su-radio-box">
                      <span className="su-radio-dot" />
                    </span>
                    Female
                  </label>
                </div>
                {errors.gender && <span className="su-err">{errors.gender}</span>}
              </div>

              <div className="su-field">
                <label className="su-checkbox-label">
                  <input id="inputField1" name="inputField1" ref={termsRef} type="checkbox" checked={terms}
                    onChange={e => setTerms(e.target.checked)} className="su-checkbox" />
                  <span className="su-checkbox-box" />
                  <span className="su-terms-text">
                    I agree to the <span className="su-link">Terms &amp; Conditions</span> and <span className="su-link">Privacy Policy</span>
                  </span>
                </label>
                {errors.terms && <span className="su-err">{errors.terms}</span>}
              </div>

              <button type="submit" className="su-submit-btn" disabled={loading}>
                {loading
                  ? <><span className="su-spinner" /> Creating Account...</>
                  : '✦ Create Account'
                }
              </button>

              <p className="su-footer">
                Already have an account?{' '}
                <button type="button" className="su-link-btn" onClick={onLoginClick}>Login</button>
              </p>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyAndComplete} noValidate>
              <div className="su-card-header">
                <div className="su-card-icon-wrap">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </div>
                <h2 className="su-card-title">Verify Email</h2>
                <p className="su-card-subtitle">
                  We sent a 6-digit code to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
                </p>
                <div className="su-step-dots">
                  <span className="su-dot su-dot-done" />
                  <span className="su-dot su-dot-active" />
                </div>
              </div>

              <div className="su-field">
                <label htmlFor="su-otp">Enter 6-Digit Code <span className="su-req">*</span></label>
                <input id="su-otp" ref={otpRef} type="text" inputMode="numeric" maxLength={6}
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className={errors.otp ? 'su-input su-otp-input su-input-err' : 'su-input su-otp-input'}
                  placeholder="000000" />
                {errors.otp && <span className="su-err" style={{ textAlign: 'center', display: 'block' }}>{errors.otp}</span>}
              </div>

              <button type="submit" className="su-submit-btn" disabled={loading}>
                {loading
                  ? <><span className="su-spinner" /> Verifying...</>
                  : '✓ Complete Registration'
                }
              </button>

              <p className="su-footer">
                <button type="button" className="su-link-btn"
                  onClick={() => { setStep(1); setErrors({}); setOtp(''); }}>
                  ← Back to details
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
