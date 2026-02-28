import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/Navbar';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = filter === 'all'
    ? users
    : users.filter(user => user.role === filter);

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
        <h1 style={styles.title}>Manage Users</h1>

        <div style={styles.filters}>
          <button
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
          >
            All Users ({users.length})
          </button>
          <button
            onClick={() => setFilter('user')}
            className={filter === 'user' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
          >
            Customers ({users.filter(u => u.role === 'user').length})
          </button>
          <button
            onClick={() => setFilter('restaurant')}
            className={filter === 'restaurant' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
          >
            Restaurant Owners ({users.filter(u => u.role === 'restaurant').length})
          </button>
          <button
            onClick={() => setFilter('admin')}
            className={filter === 'admin' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
          >
            Admins ({users.filter(u => u.role === 'admin').length})
          </button>
        </div>

        {filteredUsers.length === 0 ? (
          <div style={styles.empty}>
            <span style={styles.emptyIcon}>👥</span>
            <h2>No Users Found</h2>
          </div>
        ) : (
          <div className="card" style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Joined</th>
                  <th style={styles.th}>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <div style={styles.userCell}>
                        <div style={styles.avatar}>
                          <span>👤</span>
                        </div>
                        <span style={styles.userName}>
                          {user.full_name || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td style={styles.td}>{user.email}</td>
                    <td style={styles.td}>
                      <span
                        className={`badge ${
                          user.role === 'admin' ? 'badge-error' :
                          user.role === 'restaurant' ? 'badge-info' :
                          'badge-success'
                        }`}
                        style={styles.roleBadge}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td style={styles.td}>
                      {new Date(user.updated_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
  empty: {
    textAlign: 'center',
    padding: '4rem 1rem',
  },
  emptyIcon: {
    fontSize: '5rem',
    display: 'block',
    marginBottom: '1.5rem',
  },
  filters: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  tableContainer: {
    padding: '0',
    overflow: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    backgroundColor: 'var(--bg-tertiary)',
    borderBottom: '2px solid var(--border)',
  },
  th: {
    padding: '1rem',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '0.875rem',
    color: 'var(--text-primary)',
  },
  tableRow: {
    borderBottom: '1px solid var(--border)',
    transition: 'background-color 0.2s',
  },
  td: {
    padding: '1rem',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-tertiary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
  },
  userName: {
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  roleBadge: {
    textTransform: 'capitalize',
  },
};

export default AdminUsers;
