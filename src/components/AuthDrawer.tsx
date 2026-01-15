'use client';

import { useState } from 'react';
import { X, Mail, Lock, User, Building2, Briefcase, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth, CustomerProfile, CustomerType } from '@/contexts/AuthContext';
import styles from './AuthDrawer.module.css';

type AuthMode = 'login' | 'register' | 'profile';

interface AuthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export default function AuthDrawer({ isOpen, onClose, initialMode = 'login' }: AuthDrawerProps) {
  const { login, register, completeProfile, needsProfile } = useAuth();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Profile form state
  const [customerType, setCustomerType] = useState<CustomerType | null>(null);

  // Private profile
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  // Professional profile
  const [orgId, setOrgId] = useState('');
  const [orgName, setOrgName] = useState('');
  const [contactPerson, setContactPerson] = useState('');

  // Employee profile
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [department, setDepartment] = useState('');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setCustomerType(null);
    setFirstName('');
    setLastName('');
    setAddress('');
    setPhone('');
    setOrgId('');
    setOrgName('');
    setContactPerson('');
    setEmployeeEmail('');
    setDepartment('');
  };

  const handleClose = () => {
    resetForm();
    setMode(initialMode);
    onClose();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    setLoading(false);

    if (result.success) {
      if (needsProfile) {
        setMode('profile');
      } else {
        handleClose();
      }
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await register(email, password);

    setLoading(false);

    if (result.success) {
      setMode('profile');
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerType) {
      setError('Please select a customer type');
      return;
    }

    let profile: CustomerProfile;

    if (customerType === 'private') {
      if (!firstName || !lastName || !address || !phone) {
        setError('Please fill in all fields');
        return;
      }
      profile = { type: 'private', firstName, lastName, address, phone };
    } else if (customerType === 'professional') {
      if (!orgId || !orgName || !contactPerson || !address || !phone) {
        setError('Please fill in all fields');
        return;
      }
      profile = { type: 'professional', orgId, orgName, contactPerson, address, phone };
    } else {
      if (!employeeEmail) {
        setError('Please fill in your employee email');
        return;
      }
      profile = { type: 'employee', employeeEmail, department: department || undefined };
    }

    setLoading(true);

    const result = await completeProfile(profile);

    setLoading(false);

    if (result.success) {
      handleClose();
    } else {
      setError(result.error || 'Failed to save profile');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={handleClose} />
      <div className={styles.drawer}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {mode === 'login' && 'Sign In'}
            {mode === 'register' && 'Create Account'}
            {mode === 'profile' && 'Complete Your Profile'}
          </h2>
          <button onClick={handleClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className={styles.form}>
              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.inputGroup}>
                <label className={styles.label}>Email</label>
                <div className={styles.inputWrapper}>
                  <Mail size={18} className={styles.inputIcon} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Password</label>
                <div className={styles.inputWrapper}>
                  <Lock size={18} className={styles.inputIcon} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? <Loader2 size={20} className={styles.spinner} /> : 'Sign In'}
              </button>

              <p className={styles.switchText}>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); }}
                  className={styles.switchButton}
                >
                  Create one
                </button>
              </p>

              <div className={styles.demoCredentials}>
                <p><strong>Demo accounts:</strong></p>
                <p>admin@buildymcbuild.com / password123</p>
                <p>john@example.com / password123</p>
              </div>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className={styles.form}>
              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.inputGroup}>
                <label className={styles.label}>Email</label>
                <div className={styles.inputWrapper}>
                  <Mail size={18} className={styles.inputIcon} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Password</label>
                <div className={styles.inputWrapper}>
                  <Lock size={18} className={styles.inputIcon} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className={styles.input}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Confirm Password</label>
                <div className={styles.inputWrapper}>
                  <Lock size={18} className={styles.inputIcon} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? <Loader2 size={20} className={styles.spinner} /> : 'Continue'}
              </button>

              <p className={styles.switchText}>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
                  className={styles.switchButton}
                >
                  Sign in
                </button>
              </p>
            </form>
          )}

          {/* Profile Form (Step 2) */}
          {mode === 'profile' && (
            <form onSubmit={handleCompleteProfile} className={styles.form}>
              {error && <div className={styles.error}>{error}</div>}

              <p className={styles.profileIntro}>
                Tell us about yourself to personalize your experience.
              </p>

              {/* Customer Type Selection */}
              {!customerType && (
                <div className={styles.customerTypeGrid}>
                  <button
                    type="button"
                    onClick={() => setCustomerType('private')}
                    className={styles.customerTypeCard}
                  >
                    <User size={32} />
                    <span className={styles.customerTypeTitle}>Private</span>
                    <span className={styles.customerTypeDesc}>Personal use</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCustomerType('professional')}
                    className={styles.customerTypeCard}
                  >
                    <Building2 size={32} />
                    <span className={styles.customerTypeTitle}>Professional</span>
                    <span className={styles.customerTypeDesc}>Business customer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCustomerType('employee')}
                    className={styles.customerTypeCard}
                  >
                    <Briefcase size={32} />
                    <span className={styles.customerTypeTitle}>Employee</span>
                    <span className={styles.customerTypeDesc}>Internal staff</span>
                  </button>
                </div>
              )}

              {/* Private Customer Form */}
              {customerType === 'private' && (
                <>
                  <button
                    type="button"
                    onClick={() => setCustomerType(null)}
                    className={styles.backButton}
                  >
                    <ArrowLeft size={16} />
                    Change customer type
                  </button>

                  <div className={styles.inputRow}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        className={styles.input}
                        required
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        className={styles.input}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Main St, City, State ZIP"
                      className={styles.input}
                      required
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 555-123-4567"
                      className={styles.input}
                      required
                    />
                  </div>

                  <button type="submit" className={styles.submitButton} disabled={loading}>
                    {loading ? <Loader2 size={20} className={styles.spinner} /> : 'Complete Registration'}
                  </button>
                </>
              )}

              {/* Professional Customer Form */}
              {customerType === 'professional' && (
                <>
                  <button
                    type="button"
                    onClick={() => setCustomerType(null)}
                    className={styles.backButton}
                  >
                    <ArrowLeft size={16} />
                    Change customer type
                  </button>

                  <div className={styles.inputRow}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Organization ID</label>
                      <input
                        type="text"
                        value={orgId}
                        onChange={(e) => setOrgId(e.target.value)}
                        placeholder="ORG-001"
                        className={styles.input}
                        required
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Organization Name</label>
                      <input
                        type="text"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder="Acme Woodworks Inc."
                        className={styles.input}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Contact Person</label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="Jane Smith"
                      className={styles.input}
                      required
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Business Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="456 Industrial Ave, City, State ZIP"
                      className={styles.input}
                      required
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 555-123-4567"
                      className={styles.input}
                      required
                    />
                  </div>

                  <button type="submit" className={styles.submitButton} disabled={loading}>
                    {loading ? <Loader2 size={20} className={styles.spinner} /> : 'Complete Registration'}
                  </button>
                </>
              )}

              {/* Employee Form */}
              {customerType === 'employee' && (
                <>
                  <button
                    type="button"
                    onClick={() => setCustomerType(null)}
                    className={styles.backButton}
                  >
                    <ArrowLeft size={16} />
                    Change customer type
                  </button>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Employee Email</label>
                    <input
                      type="email"
                      value={employeeEmail}
                      onChange={(e) => setEmployeeEmail(e.target.value)}
                      placeholder="your.name@buildymcbuild.com"
                      className={styles.input}
                      required
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Department (Optional)</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Sales, Support, etc."
                      className={styles.input}
                    />
                  </div>

                  <button type="submit" className={styles.submitButton} disabled={loading}>
                    {loading ? <Loader2 size={20} className={styles.spinner} /> : 'Complete Registration'}
                  </button>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </>
  );
}
