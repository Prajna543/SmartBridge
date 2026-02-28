import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

const Profile = () => {
  const { user, profile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
    }
  }, [profile]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (error) throw error;
      setMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container" style={styles.container}>
        <h1 style={styles.title}>My Profile</h1>

        <div style={styles.content}>
          <div className="card" style={styles.card}>
            <div style={styles.avatarSection}>
              <div style={styles.avatar}>
                <span style={styles.avatarIcon}>👤</span>
              </div>
              <div style={styles.userInfo}>
                <h2 style={styles.userName}>{profile?.full_name || user.email}</h2>
                <p style={styles.userEmail}>{user.email}</p>
                <span className={`badge badge-info`} style={styles.roleBadge}>
                  {profile?.role || 'user'}
                </span>
              </div>
            </div>

            {message && (
              <div style={{
                ...styles.message,
                ...(message.includes('success') ? styles.messageSuccess : styles.messageError)
              }}>
                {message}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} style={styles.form}>
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  value={user.email}
                  className="input"
                  disabled
                  style={styles.disabledInput}
                />
                <p style={styles.helperText}>Email cannot be changed</p>
              </div>

              <div>
                <label className="label">Account Type</label>
                <input
                  type="text"
                  value={profile?.role || 'user'}
                  className="input"
                  disabled
                  style={styles.disabledInput}
                />
                <p style={styles.helperText}>Account type is set during registration</p>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={styles.submitButton}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>

          <div className="card" style={styles.infoCard}>
            <h3 style={styles.infoTitle}>Account Information</h3>
            <div style={styles.infoList}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>User ID:</span>
                <span style={styles.infoValue}>{user.id.substring(0, 16)}...</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Account Created:</span>
                <span style={styles.infoValue}>
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Last Sign In:</span>
                <span style={styles.infoValue}>
                  {new Date(user.last_sign_in_at || user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const styles = {
  container: {
    padding: '2rem 1rem',
    minHeight: 'calc(100vh - 80px)',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '2rem',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '2rem',
    alignItems: 'start',
  },
  card: {
    padding: '2rem',
  },
  avatarSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    marginBottom: '2rem',
    paddingBottom: '2rem',
    borderBottom: '1px solid var(--border)',
  },
  avatar: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-tertiary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3rem',
  },
  avatarIcon: {
    fontSize: '3rem',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '0.25rem',
  },
  userEmail: {
    color: 'var(--text-secondary)',
    marginBottom: '0.5rem',
  },
  roleBadge: {
    textTransform: 'capitalize',
  },
  message: {
    padding: '1rem',
    borderRadius: 'var(--radius)',
    marginBottom: '1.5rem',
  },
  messageSuccess: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  messageError: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  disabledInput: {
    backgroundColor: 'var(--bg-tertiary)',
    cursor: 'not-allowed',
  },
  helperText: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    marginTop: '0.5rem',
  },
  submitButton: {
    marginTop: '0.5rem',
  },
  infoCard: {
    padding: '1.5rem',
  },
  infoTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  infoLabel: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
  },
  infoValue: {
    fontWeight: '500',
  },
};

export default Profile;
