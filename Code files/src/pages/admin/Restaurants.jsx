import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/Navbar';

const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select(`
          *,
          profiles (
            id,
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveRestaurant = async (restaurantId) => {
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ approved: true })
        .eq('id', restaurantId);

      if (error) throw error;
      fetchRestaurants();
      alert('Restaurant approved successfully!');
    } catch (error) {
      console.error('Error approving restaurant:', error);
      alert('Failed to approve restaurant');
    }
  };

  const rejectRestaurant = async (restaurantId) => {
    if (!confirm('Are you sure you want to reject this restaurant?')) return;

    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ approved: false })
        .eq('id', restaurantId);

      if (error) throw error;
      fetchRestaurants();
      alert('Restaurant rejected');
    } catch (error) {
      console.error('Error rejecting restaurant:', error);
      alert('Failed to reject restaurant');
    }
  };

  const deleteRestaurant = async (restaurantId) => {
    if (!confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', restaurantId);

      if (error) throw error;
      fetchRestaurants();
      alert('Restaurant deleted successfully');
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      alert('Failed to delete restaurant');
    }
  };

  const filteredRestaurants = filter === 'all'
    ? restaurants
    : filter === 'approved'
    ? restaurants.filter(r => r.approved)
    : restaurants.filter(r => !r.approved);

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
        <h1 style={styles.title}>Manage Restaurants</h1>

        <div style={styles.filters}>
          <button
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
          >
            All ({restaurants.length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={filter === 'approved' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
          >
            Approved ({restaurants.filter(r => r.approved).length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={filter === 'pending' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
          >
            Pending ({restaurants.filter(r => !r.approved).length})
          </button>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div style={styles.empty}>
            <span style={styles.emptyIcon}>🍽️</span>
            <h2>No Restaurants Found</h2>
            <p style={styles.emptyText}>
              {filter === 'all' ? 'No restaurants yet' : `No ${filter} restaurants`}
            </p>
          </div>
        ) : (
          <div style={styles.restaurants}>
            {filteredRestaurants.map((restaurant) => (
              <div key={restaurant.id} className="card" style={styles.restaurantCard}>
                <div style={styles.restaurantHeader}>
                  <div style={styles.restaurantInfo}>
                    {restaurant.image_url && (
                      <img
                        src={restaurant.image_url}
                        alt={restaurant.name}
                        style={styles.restaurantImage}
                      />
                    )}
                    <div>
                      <h3 style={styles.restaurantName}>{restaurant.name}</h3>
                      <p style={styles.ownerInfo}>
                        Owner: {restaurant.profiles.full_name || restaurant.profiles.email}
                      </p>
                      <p style={styles.ownerEmail}>{restaurant.profiles.email}</p>
                    </div>
                  </div>
                  <div>
                    {restaurant.approved ? (
                      <span className="badge badge-success">Approved</span>
                    ) : (
                      <span className="badge badge-warning">Pending</span>
                    )}
                  </div>
                </div>

                <div style={styles.restaurantDetails}>
                  {restaurant.description && (
                    <p style={styles.description}>{restaurant.description}</p>
                  )}
                  {restaurant.address && (
                    <p style={styles.detail}>
                      <strong>Address:</strong> {restaurant.address}
                    </p>
                  )}
                  {restaurant.contact && (
                    <p style={styles.detail}>
                      <strong>Contact:</strong> {restaurant.contact}
                    </p>
                  )}
                  <p style={styles.detail}>
                    <strong>Registered:</strong> {new Date(restaurant.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div style={styles.actions}>
                  {!restaurant.approved ? (
                    <button
                      onClick={() => approveRestaurant(restaurant.id)}
                      className="btn btn-secondary btn-sm"
                    >
                      Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => rejectRestaurant(restaurant.id)}
                      className="btn btn-outline btn-sm"
                    >
                      Revoke Approval
                    </button>
                  )}
                  <button
                    onClick={() => deleteRestaurant(restaurant.id)}
                    className="btn btn-ghost btn-sm"
                    style={styles.deleteButton}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
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
  emptyText: {
    color: 'var(--text-secondary)',
    marginTop: '0.5rem',
  },
  filters: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  restaurants: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  restaurantCard: {
    padding: '1.5rem',
  },
  restaurantHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid var(--border)',
  },
  restaurantInfo: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
  },
  restaurantImage: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: 'var(--radius)',
  },
  restaurantName: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  ownerInfo: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    marginBottom: '0.25rem',
  },
  ownerEmail: {
    fontSize: '0.875rem',
    color: 'var(--text-light)',
  },
  restaurantDetails: {
    marginBottom: '1rem',
  },
  description: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    marginBottom: '0.75rem',
  },
  detail: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    marginBottom: '0.5rem',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
  },
  deleteButton: {
    color: 'var(--error)',
  },
};

export default AdminRestaurants;
