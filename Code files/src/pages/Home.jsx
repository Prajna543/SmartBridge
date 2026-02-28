import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRestaurants(restaurants);
    } else {
      const filtered = restaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRestaurants(filtered);
    }
  }, [searchQuery, restaurants]);

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRestaurants(data || []);
      setFilteredRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.hero}>
          <h1 style={styles.heroTitle}>Order Delicious Food</h1>
          <p style={styles.heroSubtitle}>From your favorite restaurants, delivered to your door</p>

          <div style={styles.searchContainer}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              placeholder="Search for restaurants..."
              style={styles.searchInput}
            />
            <span style={styles.searchIcon}>🔍</span>
          </div>
        </div>

        <div className="container" style={styles.content}>
          <h2 style={styles.sectionTitle}>
            {searchQuery ? `Search Results (${filteredRestaurants.length})` : 'Featured Restaurants'}
          </h2>

          {loading ? (
            <div style={styles.loading}>Loading restaurants...</div>
          ) : filteredRestaurants.length === 0 ? (
            <div style={styles.empty}>
              <span style={styles.emptyIcon}>🍽️</span>
              <h3>No restaurants found</h3>
              <p style={styles.emptyText}>
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : 'No restaurants available at the moment'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {filteredRestaurants.map((restaurant) => (
                <Link
                  key={restaurant.id}
                  to={`/restaurant/${restaurant.id}`}
                  style={styles.card}
                  className="card"
                >
                  <div style={styles.imageContainer}>
                    {restaurant.image_url ? (
                      <img
                        src={restaurant.image_url}
                        alt={restaurant.name}
                        style={styles.image}
                      />
                    ) : (
                      <div style={styles.imagePlaceholder}>
                        <span style={styles.imagePlaceholderIcon}>🍽️</span>
                      </div>
                    )}
                  </div>

                  <div style={styles.cardContent}>
                    <h3 style={styles.restaurantName}>{restaurant.name}</h3>
                    <p style={styles.restaurantDescription}>
                      {restaurant.description || 'Delicious food awaits you'}
                    </p>
                    {restaurant.address && (
                      <p style={styles.address}>
                        <span>📍</span> {restaurant.address}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const styles = {
  container: {
    minHeight: 'calc(100vh - 80px)',
  },
  hero: {
    background: 'linear-gradient(135deg, #fef3f3 0%, #f0fdf4 100%)',
    padding: '4rem 1rem',
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSubtitle: {
    fontSize: '1.25rem',
    color: 'var(--text-secondary)',
    marginBottom: '2.5rem',
  },
  searchContainer: {
    maxWidth: '600px',
    margin: '0 auto',
    position: 'relative',
  },
  searchInput: {
    paddingLeft: '3rem',
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '1.25rem',
  },
  content: {
    padding: '3rem 1rem',
  },
  sectionTitle: {
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
    padding: '3rem',
  },
  emptyIcon: {
    fontSize: '4rem',
    display: 'block',
    marginBottom: '1rem',
  },
  emptyText: {
    color: 'var(--text-secondary)',
    marginTop: '0.5rem',
  },
  card: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
    height: '100%',
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: '200px',
    overflow: 'hidden',
    borderRadius: 'var(--radius-lg)',
    marginBottom: '1rem',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'var(--bg-tertiary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderIcon: {
    fontSize: '4rem',
  },
  cardContent: {
    padding: '0.5rem 0',
  },
  restaurantName: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: 'var(--text-primary)',
  },
  restaurantDescription: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    marginBottom: '0.75rem',
    lineHeight: '1.5',
  },
  address: {
    fontSize: '0.875rem',
    color: 'var(--text-light)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
};

export default Home;
