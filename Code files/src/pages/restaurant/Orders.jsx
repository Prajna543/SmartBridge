import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';

const RestaurantOrders = () => {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRestaurantAndOrders();
  }, []);

  const fetchRestaurantAndOrders = async () => {
    try {
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (restaurantError) throw restaurantError;
      setRestaurant(restaurantData);

      if (restaurantData) {
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            profiles (
              id,
              full_name,
              email
            ),
            order_items (
              id,
              quantity,
              price,
              products (
                id,
                name
              )
            )
          `)
          .eq('restaurant_id', restaurantData.id)
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;
        setOrders(ordersData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      fetchRestaurantAndOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
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

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.order_status === filter);

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
        <div className="container" style={styles.container}>
          <div style={styles.empty}>
            <span style={styles.emptyIcon}>🍽️</span>
            <h2>No Restaurant Found</h2>
            <p style={styles.emptyText}>
              Your restaurant account is pending admin approval.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container" style={styles.container}>
        <h1 style={styles.title}>Restaurant Orders</h1>

        <div style={styles.filters}>
          <button
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={filter === 'pending' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
          >
            Pending ({orders.filter(o => o.order_status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={filter === 'confirmed' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
          >
            Confirmed ({orders.filter(o => o.order_status === 'confirmed').length})
          </button>
          <button
            onClick={() => setFilter('preparing')}
            className={filter === 'preparing' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
          >
            Preparing ({orders.filter(o => o.order_status === 'preparing').length})
          </button>
          <button
            onClick={() => setFilter('delivered')}
            className={filter === 'delivered' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
          >
            Delivered ({orders.filter(o => o.order_status === 'delivered').length})
          </button>
        </div>

        {filteredOrders.length === 0 ? (
          <div style={styles.empty}>
            <span style={styles.emptyIcon}>📦</span>
            <h2>No Orders Found</h2>
            <p style={styles.emptyText}>
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </p>
          </div>
        ) : (
          <div style={styles.orders}>
            {filteredOrders.map((order) => (
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
                  <div>{getStatusBadge(order.order_status)}</div>
                </div>

                <div style={styles.customerInfo}>
                  <h4 style={styles.sectionTitle}>Customer Information</h4>
                  <p style={styles.infoText}>
                    <strong>Name:</strong> {order.profiles.full_name || order.profiles.email}
                  </p>
                  <p style={styles.infoText}>
                    <strong>Email:</strong> {order.profiles.email}
                  </p>
                  <p style={styles.infoText}>
                    <strong>Contact:</strong> {order.contact_number}
                  </p>
                  <p style={styles.infoText}>
                    <strong>Delivery Address:</strong> {order.delivery_address}
                  </p>
                  <p style={styles.infoText}>
                    <strong>Payment Method:</strong> {order.payment_method}
                  </p>
                </div>

                <div style={styles.items}>
                  <h4 style={styles.sectionTitle}>Order Items</h4>
                  {order.order_items.map((item) => (
                    <div key={item.id} style={styles.item}>
                      <span>{item.products.name}</span>
                      <span>x{item.quantity}</span>
                      <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div style={styles.orderFooter}>
                  <div style={styles.total}>
                    <span>Total Amount:</span>
                    <span style={styles.totalAmount}>
                      ${parseFloat(order.total_price).toFixed(2)}
                    </span>
                  </div>

                  <div style={styles.actions}>
                    {order.order_status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          className="btn btn-primary btn-sm"
                        >
                          Confirm Order
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          className="btn btn-ghost btn-sm"
                          style={styles.cancelButton}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {order.order_status === 'confirmed' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="btn btn-primary btn-sm"
                      >
                        Start Preparing
                      </button>
                    )}
                    {order.order_status === 'preparing' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="btn btn-secondary btn-sm"
                      >
                        Mark as Delivered
                      </button>
                    )}
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
  filters: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
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
    marginBottom: '1.5rem',
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
  customerInfo: {
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid var(--border)',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
  },
  infoText: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    marginBottom: '0.5rem',
  },
  items: {
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid var(--border)',
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    fontSize: '0.9rem',
  },
  orderFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  total: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  totalAmount: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'var(--primary)',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
  },
  cancelButton: {
    color: 'var(--error)',
  },
};

export default RestaurantOrders;
