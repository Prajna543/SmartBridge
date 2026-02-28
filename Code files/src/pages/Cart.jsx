import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

const Cart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (
            id,
            name,
            description,
            price,
            image_url,
            restaurant_id,
            restaurants (
              id,
              name
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId);

      if (error) throw error;
      fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      fetchCartItems();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const clearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const getTotal = () => {
    return cartItems.reduce((sum, item) => {
      return sum + (parseFloat(item.products.price) * item.quantity);
    }, 0);
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) return;

    const restaurantIds = [...new Set(cartItems.map(item => item.products.restaurant_id))];
    if (restaurantIds.length > 1) {
      alert('You can only order from one restaurant at a time. Please remove items from other restaurants.');
      return;
    }

    navigate('/checkout');
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.loading}>Loading cart...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container" style={styles.container}>
        <h1 style={styles.title}>Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div style={styles.empty}>
            <span style={styles.emptyIcon}>🛒</span>
            <h2>Your cart is empty</h2>
            <p style={styles.emptyText}>Add some delicious items to get started!</p>
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary"
              style={styles.emptyButton}
            >
              Browse Restaurants
            </button>
          </div>
        ) : (
          <div style={styles.content}>
            <div style={styles.items}>
              {cartItems.map((item) => (
                <div key={item.id} className="card" style={styles.item}>
                  <div style={styles.itemImage}>
                    {item.products.image_url ? (
                      <img
                        src={item.products.image_url}
                        alt={item.products.name}
                        style={styles.image}
                      />
                    ) : (
                      <div style={styles.imagePlaceholder}>
                        <span style={styles.imagePlaceholderIcon}>🍔</span>
                      </div>
                    )}
                  </div>

                  <div style={styles.itemDetails}>
                    <h3 style={styles.itemName}>{item.products.name}</h3>
                    <p style={styles.restaurantName}>
                      {item.products.restaurants.name}
                    </p>
                    {item.products.description && (
                      <p style={styles.itemDescription}>{item.products.description}</p>
                    )}
                  </div>

                  <div style={styles.itemActions}>
                    <div style={styles.quantityControl}>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="btn btn-ghost btn-sm"
                        style={styles.quantityButton}
                      >
                        -
                      </button>
                      <span style={styles.quantity}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="btn btn-ghost btn-sm"
                        style={styles.quantityButton}
                      >
                        +
                      </button>
                    </div>

                    <p style={styles.itemPrice}>
                      ${(parseFloat(item.products.price) * item.quantity).toFixed(2)}
                    </p>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="btn btn-ghost btn-sm"
                      style={styles.removeButton}
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="card" style={styles.summary}>
              <h2 style={styles.summaryTitle}>Order Summary</h2>

              <div style={styles.summaryRow}>
                <span>Subtotal</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>

              <div style={styles.summaryRow}>
                <span>Delivery Fee</span>
                <span>$5.00</span>
              </div>

              <div style={styles.summaryDivider}></div>

              <div style={styles.summaryTotal}>
                <span>Total</span>
                <span>${(getTotal() + 5).toFixed(2)}</span>
              </div>

              <button
                onClick={proceedToCheckout}
                className="btn btn-primary"
                style={styles.checkoutButton}
              >
                Proceed to Checkout
              </button>

              <button
                onClick={clearCart}
                className="btn btn-ghost"
                style={styles.clearButton}
              >
                Clear Cart
              </button>
            </div>
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
    marginBottom: '2rem',
  },
  emptyButton: {
    marginTop: '1rem',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '2rem',
    alignItems: 'start',
  },
  items: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  item: {
    display: 'flex',
    gap: '1.5rem',
    padding: '1.5rem',
  },
  itemImage: {
    width: '120px',
    height: '120px',
    flexShrink: 0,
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
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
    fontSize: '3rem',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  restaurantName: {
    fontSize: '0.9rem',
    color: 'var(--text-light)',
    marginBottom: '0.5rem',
  },
  itemDescription: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
  },
  itemActions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.75rem',
  },
  quantityControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '0.25rem',
  },
  quantityButton: {
    minWidth: '2rem',
  },
  quantity: {
    minWidth: '2rem',
    textAlign: 'center',
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: 'var(--primary)',
  },
  removeButton: {
    color: 'var(--error)',
  },
  summary: {
    position: 'sticky',
    top: '100px',
    padding: '1.5rem',
  },
  summaryTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1rem',
    color: 'var(--text-secondary)',
  },
  summaryDivider: {
    height: '1px',
    backgroundColor: 'var(--border)',
    margin: '1rem 0',
  },
  summaryTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
  },
  checkoutButton: {
    width: '100%',
    marginBottom: '0.75rem',
  },
  clearButton: {
    width: '100%',
  },
};

export default Cart;
