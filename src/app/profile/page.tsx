'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { User, Building2, MapPin, Phone, Mail } from 'lucide-react';
import styles from './profile.module.css';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
    if (!isLoading && isAuthenticated && user?.customerType === 'employee') {
      router.push('/admin');
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!user || !user.profile) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Profile Not Complete</h1>
          <p className={styles.subtitle}>Please complete your profile to view this page.</p>
        </div>
      </div>
    );
  }

  const profile = user.profile;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.avatar}>
            {profile.type === 'professional' ? (
              <Building2 size={32} />
            ) : (
              <User size={32} />
            )}
          </div>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>
              {profile.type === 'private'
                ? `${profile.firstName} ${profile.lastName}`
                : profile.type === 'professional'
                  ? profile.orgName
                  : user.email}
            </h1>
            <p className={styles.subtitle}>
              {profile.type === 'private' && 'Private Customer'}
              {profile.type === 'professional' && 'Business Customer'}
            </p>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Contact Information</h2>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <Mail className={styles.infoIcon} size={18} />
              <div>
                <p className={styles.infoLabel}>Email</p>
                <p className={styles.infoValue}>{user.email}</p>
              </div>
            </div>

            {profile.type === 'private' && (
              <>
                <div className={styles.infoItem}>
                  <Phone className={styles.infoIcon} size={18} />
                  <div>
                    <p className={styles.infoLabel}>Phone</p>
                    <p className={styles.infoValue}>{profile.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <MapPin className={styles.infoIcon} size={18} />
                  <div>
                    <p className={styles.infoLabel}>Address</p>
                    <p className={styles.infoValue}>{profile.address || 'Not provided'}</p>
                  </div>
                </div>
              </>
            )}

            {profile.type === 'professional' && (
              <>
                <div className={styles.infoItem}>
                  <Building2 className={styles.infoIcon} size={18} />
                  <div>
                    <p className={styles.infoLabel}>Organization ID</p>
                    <p className={styles.infoValue}>{profile.orgId}</p>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <User className={styles.infoIcon} size={18} />
                  <div>
                    <p className={styles.infoLabel}>Contact Person</p>
                    <p className={styles.infoValue}>{profile.contactPerson}</p>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <Phone className={styles.infoIcon} size={18} />
                  <div>
                    <p className={styles.infoLabel}>Phone</p>
                    <p className={styles.infoValue}>{profile.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <MapPin className={styles.infoIcon} size={18} />
                  <div>
                    <p className={styles.infoLabel}>Address</p>
                    <p className={styles.infoValue}>{profile.address || 'Not provided'}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Account Details</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <div>
                <p className={styles.infoLabel}>Customer Type</p>
                <p className={styles.infoValue}>
                  {user.customerType === 'private' && 'Private Customer'}
                  {user.customerType === 'professional' && 'Professional / Business'}
                </p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <div>
                <p className={styles.infoLabel}>Account ID</p>
                <p className={styles.infoValue}>{user.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
