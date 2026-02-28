import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/Navbar';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRestaurants: 0,
    pendingRestaurants: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: users } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' });

      const { data: restaurants } = await supabase
        .from('restaurants')
        .select('id', { count: 'exact' });

      const { data: pendingRestaurants } = await supabase
        .from('restaurants')
        .select('id', { count: 'exact' })
        .eq('approved', false);

      const { data: orders } = await supabase
        .from('orders')
        .select('total_price');

      const totalRevenue = orders?.reduce((sum, order) =>
        sum + parseFloat(order.total_price), 0) || 0;

      setStats({
        totalUsers: users?.length || 0,
        totalRestaurants: restaurants?.length || 0,
        pendingRestaurants: pendingRestaurants?.length || 0,
        totalOrders: orders?.length || 0,
        totalRevenue: totalRevenue,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.loading}>Loading...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container" style={styles.container}>
        <h1 style={styles.title}>Admin Dashboard</h1>

        <div className="grid grid-cols-4 gap-3">
          <div className="card" style={styles.statCard}>
            <div style={styles.statIcon}>👥</div>
            <div style={styles.statContent}>
              <h3 style={styles.statValue}>{stats.totalUsers}</h3>
              <p style={styles.statLabel}>Total Users</p>
            </div>
          </div>

          <div className="card" style={styles.statCard}>
            <div style={styles.statIcon}>🍽️</div>
            <div style={styles.statContent}>
              <h3 style={styles.statValue}>{stats.totalRestaurants}</h3>
              <p style={styles.statLabel}>Total Restaurants</p>
            </div>
          </div>

          <div className="card" style={styles.statCard}>
            <div style={styles.statIcon}>⏳</div>
            <div style={styles.statContent}>
              <h3 style={styles.statValue}>{stats.pendingRestaurants}</h3>
              <p style={styles.statLabel}>Pending Approvals</p>
            </div>
          </div>

          <div className="card" style={styles.statCard}>
            <div style={styles.statIcon}>📦</div>
            <div style={styles.statContent}>
              <h3 style={styles.statValue}>{stats.totalOrders}</h3>
              <p style={styles.statLabel}>Total Orders</p>
            </div>
          </div>
        </div>

        <div className="card" style={styles.revenueCard}>
          <h2 style={styles.revenueTitle}>Total Revenue</h2>
          <p style={styles.revenueAmount}>${stats.totalRevenue.toFixed(2)}</p>
        </div>

        <div style={styles.quickLinks}>
          <h2 style={styles.sectionTitle}>Quick Links</h2>
          <div className="grid grid-cols-3 gap-3">
            <Link to="/admin/restaurants" className="card" style={styles.linkCard}>
              <span style={styles.linkIcon}>🍽️</span>
              <h3 style={styles.linkTitle}>Manage Restaurants</h3>
              <p style={styles.linkDescription}>
                Approve or reject restaurant applications
              </p>
            </Link>

            <Link to="/admin/orders" className="card" style={styles.linkCard}>
              <span style={styles.linkIcon}>📦</span>
              <h3 style={styles.linkTitle}>View All Orders</h3>
              <p style={styles.linkDescription}>
                Monitor and manage all orders
              </p>
            </Link>

            <Link to="/admin/users" className="card" style={styles.linkCard}>
              <span style={styles.linkIcon}>👥</span>
              <h3 style={styles.linkTitle}>Manage Users</h3>
              <p style={styles.linkDescription}>
                View and manage user accounts
              </p>
            </Link>
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
  loading: {
    textAlign: 'center',
    padding: '3rem',
    color: 'var(--text-secondary)',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.5rem',
  },
  statIcon: {
    fontSize: '3rem',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '0.25rem',
    color: 'var(--primary)',
  },
  statLabel: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
  },
  revenueCard: {
    marginTop: '2rem',
    padding: '2rem',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #fef3f3 0%, #f0fdf4 100%)',
  },
  revenueTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: 'var(--text-primary)',
  },
  revenueAmount: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: 'var(--primary)',
  },
  quickLinks: {
    marginTop: '3rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
  },
  linkCard: {
    textDecoration: 'none',
    color: 'inherit',
    padding: '2rem',
    textAlign: 'center',
    transition: 'transform 0.2s',
  },
  linkIcon: {
    fontSize: '3rem',
    display: 'block',
    marginBottom: '1rem',
  },
  linkTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: 'var(--text-primary)',
  },
  linkDescription: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
};

export default AdminDashboard;
