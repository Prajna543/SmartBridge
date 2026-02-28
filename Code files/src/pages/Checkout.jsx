import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [formData, setFormData] = useState({
    deliveryAddress: '',
    contactNumber: '',
    paymentMethod: 'cash',
  });

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
            price,
            restaurant_id
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      if (!data || data.length === 0) {
        navigate('/cart');
        return;
      }

      setCartItems(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  const getTotal = () => {
    return cartItems.reduce((sum, item) => {
      return sum + (parseFloat(item.products.price) * item.quantity);
    }, 0);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);

    try {
      if (!formData.deliveryAddress || !formData.contactNumber) {
        alert('Please fill in all required fields');
        setPlacing(false);
        return;
      }

      const restaurantId = cartItems[0].products.restaurant_id;
      const totalPrice = getTotal() + 5;

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          restaurant_id: restaurantId,
          total_price: totalPrice,
          payment_method: formData.paymentMethod,
          order_status: 'pending',
          delivery_address: formData.deliveryAddress,
          contact_number: formData.contactNumber,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.products.id,
        quantity: item.quantity,
        price: item.products.price,
      }));

      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (orderItemsError) throw orderItemsError;

      const { error: clearCartError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (clearCartError) throw clearCartError;

      alert('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
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
        <h1 style={styles.title}>Checkout</h1>

        <div style={styles.content}>
          <div style={styles.formContainer}>
            <div className="card">
              <h2 style={styles.sectionTitle}>Delivery Information</h2>

              <form onSubmit={placeOrder} style={styles.form}>
                <div>
                  <label className="label">Delivery Address *</label>
                  <textarea
                    name="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={handleInputChange}
                    className="input"
                    rows="3"
                    placeholder="Enter your full delivery address"
                    required
                  />
                </div>

                <div>
                  <label className="label">Contact Number *</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="+1 234 567 8900"
                    required
                  />
                </div>

                <div>
                  <label className="label">Payment Method</label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="cash">Cash on Delivery</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="online">Online Payment</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={styles.submitButton}
                  disabled={placing}
                >
                  {placing ? 'Placing Order...' : 'Place Order'}
                </button>
              </form>
            </div>
          </div>

          <div style={styles.summary}>
            <div className="card">
              <h2 style={styles.sectionTitle}>Order Summary</h2>

              <div style={styles.items}>
                {cartItems.map((item) => (
                  <div key={item.id} style={styles.item}>
                    <span style={styles.itemName}>
                      {item.products.name} x{item.quantity}
                    </span>
                    <span style={styles.itemPrice}>
                      ${(parseFloat(item.products.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div style={styles.divider}></div>

              <div style={styles.summaryRow}>
                <span>Subtotal</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>

              <div style={styles.summaryRow}>
                <span>Delivery Fee</span>
                <span>$5.00</span>
              </div>

              <div style={styles.divider}></div>

              <div style={styles.total}>
                <span>Total</span>
                <span>${(getTotal() + 5).toFixed(2)}</span>
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
  loading: {
    textAlign: 'center',
    padding: '3rem',
    color: 'var(--text-secondary)',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '2rem',
    alignItems: 'start',
  },
  formContainer: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  submitButton: {
    width: '100%',
    marginTop: '1rem',
  },
  summary: {
    position: 'sticky',
    top: '100px',
  },
  items: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1rem',
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
  },
  itemName: {
    color: 'var(--text-secondary)',
  },
  itemPrice: {
    fontWeight: '500',
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border)',
    margin: '1rem 0',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
    color: 'var(--text-secondary)',
  },
  total: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1.25rem',
    fontWeight: 'bold',
  },
};

export default Checkout;
