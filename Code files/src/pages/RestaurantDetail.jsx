import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [addingToCart, setAddingToCart] = useState({});

  useEffect(() => {
    fetchRestaurantAndProducts();
  }, [id]);

  const fetchRestaurantAndProducts = async () => {
    try {
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .eq('approved', true)
        .maybeSingle();

      if (restaurantError) throw restaurantError;
      if (!restaurantData) {
        navigate('/');
        return;
      }

      setRestaurant(restaurantData);

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('restaurant_id', id)
        .eq('available', true)
        .order('category', { ascending: true });

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const addToCart = async (productId) => {
    setAddingToCart({ ...addingToCart, [productId]: true });

    try {
      const { data: existingItem, error: fetchError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingItem) {
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity: 1,
          });

        if (insertError) throw insertError;
      }

      alert('Item added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart');
    } finally {
      setAddingToCart({ ...addingToCart, [productId]: false });
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

  if (!restaurant) {
    return (
      <>
        <Navbar />
        <div style={styles.empty}>Restaurant not found</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          {restaurant.image_url ? (
            <img
              src={restaurant.image_url}
              alt={restaurant.name}
              style={styles.headerImage}
            />
          ) : (
            <div style={styles.headerPlaceholder}>
              <span style={styles.headerPlaceholderIcon}>🍽️</span>
            </div>
          )}
          <div style={styles.headerOverlay}>
            <div className="container">
              <h1 style={styles.restaurantName}>{restaurant.name}</h1>
              {restaurant.description && (
                <p style={styles.restaurantDescription}>{restaurant.description}</p>
              )}
              <div style={styles.restaurantMeta}>
                {restaurant.address && (
                  <span style={styles.metaItem}>
                    📍 {restaurant.address}
                  </span>
                )}
                {restaurant.contact && (
                  <span style={styles.metaItem}>
                    📞 {restaurant.contact}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container" style={styles.content}>
          <div style={styles.categories}>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
                style={styles.categoryButton}
              >
                {category === 'all' ? 'All Items' : category}
              </button>
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <div style={styles.empty}>
              <span style={styles.emptyIcon}>🍽️</span>
              <h3>No items available</h3>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {filteredProducts.map((product) => (
                <div key={product.id} className="card" style={styles.productCard}>
                  <div style={styles.productImage}>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        style={styles.image}
                      />
                    ) : (
                      <div style={styles.imagePlaceholder}>
                        <span style={styles.imagePlaceholderIcon}>🍔</span>
                      </div>
                    )}
                  </div>

                  <div style={styles.productContent}>
                    <h3 style={styles.productName}>{product.name}</h3>
                    {product.description && (
                      <p style={styles.productDescription}>{product.description}</p>
                    )}
                    <div style={styles.productFooter}>
                      <span style={styles.price}>${parseFloat(product.price).toFixed(2)}</span>
                      <button
                        onClick={() => addToCart(product.id)}
                        className="btn btn-primary btn-sm"
                        disabled={addingToCart[product.id]}
                      >
                        {addingToCart[product.id] ? 'Adding...' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
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
  header: {
    position: 'relative',
    height: '300px',
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  headerPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'var(--bg-tertiary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerPlaceholderIcon: {
    fontSize: '6rem',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
    padding: '2rem 0',
    color: 'white',
  },
  restaurantName: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: 'white',
  },
  restaurantDescription: {
    fontSize: '1.1rem',
    marginBottom: '1rem',
    opacity: 0.9,
  },
  restaurantMeta: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  content: {
    padding: '2rem 1rem',
  },
  categories: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  categoryButton: {
    textTransform: 'capitalize',
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
  productCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  productImage: {
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
  productContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  productName: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  productDescription: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    marginBottom: '1rem',
    flex: 1,
  },
  productFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  price: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'var(--primary)',
  },
};

export default RestaurantDetail;
