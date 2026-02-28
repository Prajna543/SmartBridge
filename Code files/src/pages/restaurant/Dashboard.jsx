import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';

const RestaurantDashboard = () => {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    available: true,
  });

  useEffect(() => {
    fetchRestaurantAndProducts();
  }, []);

  const fetchRestaurantAndProducts = async () => {
    try {
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (restaurantError) throw restaurantError;
      setRestaurant(restaurantData);

      if (restaurantData) {
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('restaurant_id', restaurantData.id)
          .order('created_at', { ascending: false });

        if (productsError) throw productsError;
        setProducts(productsData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productForm)
          .eq('id', editingProduct.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert({
            ...productForm,
            restaurant_id: restaurant.id,
          });

        if (error) throw error;
      }

      setShowModal(false);
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: '',
        category: '',
        image_url: '',
        available: true,
      });
      fetchRestaurantAndProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category || '',
      image_url: product.image_url || '',
      available: product.available,
    });
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      fetchRestaurantAndProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const toggleAvailability = async (product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ available: !product.available })
        .eq('id', product.id);

      if (error) throw error;
      fetchRestaurantAndProducts();
    } catch (error) {
      console.error('Error updating availability:', error);
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
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>{restaurant.name}</h1>
            <p style={styles.subtitle}>Manage your restaurant and menu items</p>
            {!restaurant.approved && (
              <span className="badge badge-warning" style={styles.statusBadge}>
                Pending Approval
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              setProductForm({
                name: '',
                description: '',
                price: '',
                category: '',
                image_url: '',
                available: true,
              });
              setShowModal(true);
            }}
            className="btn btn-primary"
          >
            Add Product
          </button>
        </div>

        {products.length === 0 ? (
          <div style={styles.empty}>
            <span style={styles.emptyIcon}>🍔</span>
            <h2>No Products Yet</h2>
            <p style={styles.emptyText}>Start by adding your first menu item</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {products.map((product) => (
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
                  <div style={styles.productHeader}>
                    <h3 style={styles.productName}>{product.name}</h3>
                    <span className={product.available ? 'badge badge-success' : 'badge badge-error'}>
                      {product.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>

                  {product.category && (
                    <p style={styles.category}>{product.category}</p>
                  )}

                  {product.description && (
                    <p style={styles.description}>{product.description}</p>
                  )}

                  <p style={styles.price}>${parseFloat(product.price).toFixed(2)}</p>

                  <div style={styles.actions}>
                    <button
                      onClick={() => toggleAvailability(product)}
                      className="btn btn-sm btn-ghost"
                    >
                      {product.available ? 'Mark Unavailable' : 'Mark Available'}
                    </button>
                    <button
                      onClick={() => handleEdit(product)}
                      className="btn btn-sm btn-outline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="btn btn-sm btn-ghost"
                      style={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <h2 style={styles.modalTitle}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>

              <form onSubmit={handleProductSubmit} style={styles.form}>
                <div>
                  <label className="label">Product Name *</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">Description</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="input"
                    rows="3"
                  />
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formCol}>
                    <label className="label">Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="input"
                      required
                    />
                  </div>

                  <div style={styles.formCol}>
                    <label className="label">Category</label>
                    <input
                      type="text"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="input"
                      placeholder="e.g., Pizza, Burger"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Image URL</label>
                  <input
                    type="url"
                    value={productForm.image_url}
                    onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                    className="input"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div style={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    checked={productForm.available}
                    onChange={(e) => setProductForm({ ...productForm, available: e.target.checked })}
                    id="available"
                  />
                  <label htmlFor="available" style={styles.checkboxLabel}>
                    Available for order
                  </label>
                </div>

                <div style={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingProduct(null);
                    }}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: 'var(--text-secondary)',
  },
  statusBadge: {
    marginTop: '0.5rem',
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
  productHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem',
  },
  productName: {
    fontSize: '1.25rem',
    fontWeight: '600',
  },
  category: {
    fontSize: '0.875rem',
    color: 'var(--text-light)',
    marginBottom: '0.5rem',
  },
  description: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    marginBottom: '1rem',
    flex: 1,
  },
  price: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'var(--primary)',
    marginBottom: '1rem',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  deleteButton: {
    color: 'var(--error)',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modalContent: {
    backgroundColor: 'var(--bg-primary)',
    borderRadius: 'var(--radius-lg)',
    padding: '2rem',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  formCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  checkboxLabel: {
    cursor: 'pointer',
  },
  modalActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '1rem',
  },
};

export default RestaurantDashboard;
