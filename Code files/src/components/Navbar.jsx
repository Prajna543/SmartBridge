import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

const Navbar = () => {
  const { user, profile, signOut, isAdmin, isRestaurant } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.container}>
        <Link to="/" style={styles.logo}>
          <span style={styles.logoIcon}>🍕</span>
          <span style={styles.logoText}>SB Foods</span>
        </Link>

        <button
          style={styles.hamburger}
          onClick={() => setShowMenu(!showMenu)}
          className="md-hidden"
        >
          ☰
        </button>

        <div style={{
          ...styles.menu,
          ...(showMenu ? styles.menuOpen : {})
        }}>
          {user ? (
            <>
              <Link to="/" style={styles.link}>Home</Link>
              <Link to="/cart" style={styles.link}>Cart</Link>
              <Link to="/orders" style={styles.link}>My Orders</Link>

              {isRestaurant && (
                <>
                  <Link to="/restaurant-dashboard" style={styles.link}>My Restaurant</Link>
                  <Link to="/restaurant-orders" style={styles.link}>Restaurant Orders</Link>
                </>
              )}

              {isAdmin && (
                <Link to="/admin" style={styles.link}>Admin Panel</Link>
              )}

              <Link to="/profile" style={styles.link}>
                <span style={styles.profileIcon}>👤</span>
                {profile?.full_name || user.email}
              </Link>

              <button onClick={handleSignOut} className="btn btn-primary btn-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    backgroundColor: 'var(--bg-primary)',
    boxShadow: 'var(--shadow)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'var(--primary)',
    textDecoration: 'none',
  },
  logoIcon: {
    fontSize: '2rem',
  },
  logoText: {
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  hamburger: {
    display: 'none',
    fontSize: '1.5rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  menu: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  menuOpen: {
    display: 'flex',
  },
  link: {
    color: 'var(--text-primary)',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  profileIcon: {
    fontSize: '1.2rem',
  },
};

export default Navbar;
