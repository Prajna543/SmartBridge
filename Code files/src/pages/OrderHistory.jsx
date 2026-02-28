import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          restaurants (
            id,
            name
          ),
          order_items (
            id,
            quantity,
            price,
            products (
              id,
              name,
              image_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'badge-warning',
      confirmed: 'badge-info',
      preparing: 'badge-info',
      delivered: 'badge-success',
      cancelled: 'badge-error',
    };

    return (
      <span className={`badge ${statusColors[status] || 'badge-info'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.loading}>Loading orders...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container" style={styles.container}>
        <h1 style={styles.title}>Order History</h1>

        {orders.length === 0 ? (
          <div style={styles.empty}>
            <span style={styles.emptyIcon}>📦</span>
            <h2>No orders yet</h2>
            <p style={styles.emptyText}>Your order history will appear here</p>
          </div>
        ) : (
          <div style={styles.orders}>
            {orders.map((order) => (
              <div key={order.id} className="card" style={styles.order}>
                <div style={styles.orderHeader}>
                  <div>
                    <h3 style={styles.orderTitle}>
                      Order #{order.id.substring(0, 8)}
                    </h3>
                    <p style={styles.orderDate}>
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div style={styles.orderStatus}>
                    {getStatusBadge(order.order_status)}
                  </div>
                </div>

                <div style={styles.restaurantInfo}>
                  <span style={styles.restaurantIcon}>🍽️</span>
                  <span style={styles.restaurantName}>{order.restaurants.name}</span>
                </div>

                <div style={styles.items}>
                  {order.order_items.map((item) => (
                    <div key={item.id} style={styles.item}>
                      <div style={styles.itemImage}>
                        {item.products.image_url ? (
                          <img
                            src={item.products.image_url}
                            alt={item.products.name}
                            style={styles.image}
                          />
                        ) : (
                          <div style={styles.imagePlaceholder}>
                            <span>🍔</span>
                          </div>
                        )}
                      </div>
                      <div style={styles.itemInfo}>
                        <span style={styles.itemName}>{item.products.name}</span>
                        <span style={styles.itemQuantity}>Qty: {item.quantity}</span>
                      </div>
                      <span style={styles.itemPrice}>
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={styles.orderFooter}>
                  <div style={styles.orderDetails}>
                    <p style={styles.detail}>
                      <strong>Delivery Address:</strong> {order.delivery_address}
                    </p>
                    <p style={styles.detail}>
                      <strong>Contact:</strong> {order.contact_number}
                    </p>
                    <p style={styles.detail}>
                      <strong>Payment:</strong> {order.payment_method}
                    </p>
                  </div>
                  <div style={styles.total}>
                    <span>Total:</span>
                    <span style={styles.totalAmount}>
                      ${parseFloat(order.total_price).toFixed(2)}
                    </span>
                  </div>
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
  orders: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  order: {
    padding: '1.5rem',
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid var(--border)',
  },
  orderTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  orderDate: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
  },
  orderStatus: {
    display: 'flex',
    alignItems: 'center',
  },
  restaurantInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
    fontSize: '1rem',
    fontWeight: '500',
  },
  restaurantIcon: {
    fontSize: '1.5rem',
  },
  restaurantName: {
    color: 'var(--text-primary)',
  },
  items: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  itemImage: {
    width: '60px',
    height: '60px',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
    flexShrink: 0,
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
    fontSize: '1.5rem',
  },
  itemInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  itemName: {
    fontWeight: '500',
  },
  itemQuantity: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
  },
  itemPrice: {
    fontWeight: '600',
    color: 'var(--primary)',
  },
  orderFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: '1rem',
    borderTop: '1px solid var(--border)',
    gap: '2rem',
  },
  orderDetails: {
    flex: 1,
  },
  detail: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    marginBottom: '0.25rem',
  },
  total: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.25rem',
  },
  totalAmount: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'var(--primary)',
  },
};

export default OrderHistory;
