import React, { useEffect, useState, useContext, useCallback } from 'react'; // Admin Dashboard v2
import { CartProvider, CartContext } from './context/CartContext';
import { CustomerDashboard } from './components/CustomerDashboard';
import { WishlistProvider, WishlistContext } from './context/WishlistContext';
import { ToastProvider, ToastContainer, ToastContext } from './context/ToastContext';
import LottieButton from './components/LottieButton';
import SignupPage from './components/SignupPage';
import SaleBanner from './components/SaleBanner';
import ImageSlider from './components/ImageSlider';
import InvoiceView from './components/InvoiceView';
import ProductReviews from './components/ProductReviews';
import { assetUrl } from './config';
import HeroCategorySlider from './components/HeroCategorySlider';
import FlyAnimation from './components/FlyAnimation';
import CouponsAdmin from './components/CouponsAdmin';

/* —— categories state is now managed dynamically within the component —— */

/* —— STORE COLLECTIONS DEF —— */
const STORE_COLLECTIONS = [
  { id: 'Women', label: "Women's Collection", desc: "Exquisite jewelry, royal pearl earrings, and custom ornaments.", image: '/images/col_women.png' },
  { id: 'Men', label: "Men's Collection", desc: "Premium engraved key chains, desk accessories, and corporate gifts.", image: '/images/col_men.png' },
  { id: 'Kids', label: "Kids' Collection", desc: "3D modules, cute light lamps, toys, and playful gadgets.", image: '/images/col_kids.png' },
  { id: 'Unisex & Couples', label: "Unisex & Couples", desc: "Beautiful wood engraving boxes, customized photo gifts, and love tokens.", image: '/images/col_unisex.png' }
];

const fallbackProducts = [
  {
    id: 'earrings-001',
    name: 'Royal Pearl Earrings',
    category: 'Earrings',
    price: 1499,
    badge: 'In Stock',
    badgeClass: 'instock',
    rating: 4.8,
    reviews: 128,
    description: 'Beautifully crafted earrings with royal finish, perfect for every occasion.',
    image: '/images/earrings.png',
  },
  {
    id: 'wood-art-002',
    name: 'Wooden Wall Art',
    category: 'Wood Engravings',
    price: 2899,
    badge: 'New',
    badgeClass: 'new',
    rating: 4.6,
    reviews: 54,
    description: 'Sculpted wooden wall art with rich royal silhouettes and warm finish.',
    image: '/images/woodbox.png',
  },
  {
    id: 'wood-art-001',
    name: 'Floral Wood Engraving',
    category: 'Wood Engravings',
    price: 2199,
    badge: 'Limited',
    badgeClass: 'limited',
    rating: 4.9,
    reviews: 94,
    description: 'Handmade engraved wood wall art with intricate royal floral patterns.',
    image: '/images/woodbox.png',
  },
  {
    id: 'keychain-001',
    name: 'Vintage Key Chain',
    category: 'Key Chains',
    price: 599,
    badge: 'Best Seller',
    badgeClass: 'bestseller',
    rating: 4.7,
    reviews: 76,
    description: 'Elegant vintage key chain crafted with charm and premium finish.',
    image: '/images/keychain.png',
  },
  {
    id: 'keychain-002',
    name: 'Leather Key Chain',
    category: 'Key Chains',
    price: 699,
    badge: 'New',
    badgeClass: 'new',
    rating: 4.5,
    reviews: 42,
    description: 'Premium leather key chain with gold-toned hardware and smooth finish.',
    image: '/images/keychain.png',
  },
];

/* —— helpers —— */
const ProductImageSlider = ({ mainImage, allImages, altText }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = React.useMemo(() => {
    if (!allImages || allImages.length === 0) return [mainImage];
    return [mainImage, ...allImages.filter(img => img !== mainImage)];
  }, [allImages, mainImage]);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [images]);

  if (images.length <= 1) {
    return <img className="product-card__image" src={images[0]} alt={altText} loading="lazy" />;
  }

  return (
    <>
      {images.map((img, idx) => (
        <img
          key={idx}
          className="product-card__image"
          src={img}
          alt={`${altText} - ${idx + 1}`}
          loading="lazy"
          style={{
            position: idx === 0 ? 'relative' : 'absolute',
            top: 0, left: 0,
            opacity: idx === currentIndex ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out, transform 0.5s ease',
            zIndex: idx === currentIndex ? 2 : 1
          }}
        />
      ))}
    </>
  );
};

function starsString(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.3;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
}

const ImageArrayUpload = ({ name, initialImages = [] }) => {
  const [images, setImages] = useState(Array.isArray(initialImages) ? initialImages : (initialImages ? [initialImages] : []));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <input type="hidden" name={name} value={JSON.stringify(images)} />
      <input type="file" name={`${name}Files`} multiple accept="image/*" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-primary)', width: '100%' }} />
      {images.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
          {images.map((img, idx) => (
            <div key={idx} style={{ position: 'relative', width: '60px', height: '60px', border: '1px solid var(--border)', borderRadius: '4px' }}>
              <img src={img} alt={`Preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
              <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} style={{ position: 'absolute', top: -6, right: -6, background: '#FF6F61', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', border: 'none', cursor: 'pointer', padding: 0 }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function InnerApp() {
  const theme = 'light';
  useEffect(() => {
    document.documentElement.removeAttribute('data-theme');
  }, []);

  /* —— contexts —— */
  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, setCartItems, getCartKey } = useContext(CartContext);
  const { wishlist, addToWishlist, removeFromWishlist, clearWishlist, setWishlist } = useContext(WishlistContext);
  const { addToast } = useContext(ToastContext);

  /* —— data —— */
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([
    { id: 'Earrings', label: 'Earrings', desc: 'Elegant designs that add charm to you.', image: '/images/earrings.png' },
    { id: 'Wood Engravings', label: 'Wood Engravings', desc: 'Royal craftsmanship in every detail.', image: '/images/woodbox.png' },
    { id: 'Key Chains', label: 'Key Chains', desc: 'Carry elegance everywhere you go.', image: '/images/keychain.png' },
    { id: 'offer', label: 'Sale', title: 'Sale', discount: '50% OFF', extraDiscount: 'Limited Time Only', products: [], image: '/images/offer_light.png' }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('pu-admin-token') || '');
  // Admin status flags
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminProducts, setAdminProducts] = useState([]);
  const [adminOffers, setAdminOffers] = useState([]);
  const [adminQueries, setAdminQueries] = useState([]);
  const [adminCategories, setAdminCategories] = useState([]);
  const [adminCustomers, setAdminCustomers] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminReturns, setAdminReturns] = useState([]);
  const [adminReviews, setAdminReviews] = useState([]);
  const [adminCustomRequests, setAdminCustomRequests] = useState([]);
  const [selectedAdminCustomer, setSelectedAdminCustomer] = useState(null);
  const [offers, setOffers] = useState([]);
  const [siteSettings, setSiteSettings] = useState(null);

  // Flying balloon animation state: { startX, startY, target: '#nav-cart-icon' | '#nav-wishlist-icon' }
  const [flyAnim, setFlyAnim] = useState(null);

  // Fetch offers list (Public)
  const fetchOffers = useCallback(async () => {
    try {
      const r = await fetch('/api/offers');
      if (r.ok) {
        const data = await r.json();
        if (Array.isArray(data)) {
          setOffers(data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch offers:', err);
    }
  }, []);

  // Fetch site settings (Public)
  const fetchSiteSettings = useCallback(async () => {
    try {
      const r = await fetch('/api/site-settings');
      if (r.ok) {
        const data = await r.json();
        if (data.success && data.settings) setSiteSettings(data.settings);
      }
    } catch (err) {
      console.error('Failed to fetch site settings:', err);
    }
  }, []);

  // Storefront products fetch
  const fetchProducts = useCallback(async () => {
    try {
      const r = await fetch('/api/products');
      if (!r.ok) throw new Error('fail');
      const data = await r.json();
      setProducts(data.length ? data : fallbackProducts);
    } catch {
      setError(true);
      setProducts(fallbackProducts);
    }
  }, []);

  // Fetch categories list (Public)
  const fetchCategories = useCallback(async () => {
    try {
      const r = await fetch('/api/categories');
      if (r.ok) {
        const data = await r.json();
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  // Admin products fetch (includes draft/archived)
  const fetchAdminProducts = useCallback(async (tokenToUse) => {
    const token = tokenToUse || adminToken;
    if (!token) return;
    try {
      const r = await fetch('/api/admin/products', {
        headers: { 'x-admin-token': token }
      });
      if (r.ok) {
        const data = await r.json();
        if (data.success === false) {
          // Token is likely invalid or expired
          setAdminToken('');
          setIsAdmin(false);
          setShowAdmin(false);
          localStorage.removeItem('pu-admin-token');
        } else if (Array.isArray(data)) {
          setAdminProducts(data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch admin products:', err);
    }
  }, [adminToken]);

  // Admin offers fetch
  const fetchAdminOffers = useCallback(async (tokenToUse) => {
    const token = tokenToUse || adminToken;
    if (!token) return;
    try {
      const r = await fetch('/api/admin/offers', {
        headers: { 'x-admin-token': token }
      });
      if (r.ok) {
        const data = await r.json();
        if (Array.isArray(data)) setAdminOffers(data);
      }
    } catch (err) {
      console.error('Failed to fetch admin offers:', err);
    }
  }, [adminToken]);

  // Admin queries fetch
  const fetchAdminQueries = useCallback(async (tokenToUse) => {
    const token = tokenToUse || adminToken;
    if (!token) return;
    try {
      const r = await fetch('/api/admin/queries', {
        headers: { 'x-admin-token': token }
      });
      if (r.ok) {
        const data = await r.json();
        if (Array.isArray(data)) setAdminQueries(data);
      }
    } catch (err) {
      console.error('Failed to fetch admin queries:', err);
    }
  }, [adminToken]);

  // Admin custom requests fetch
  const fetchAdminCustomRequests = useCallback(async (tokenToUse) => {
    const token = tokenToUse || adminToken;
    if (!token) return;
    try {
      const r = await fetch('/api/admin/custom-requests', {
        headers: { 'x-admin-token': token }
      });
      if (r.ok) {
        const data = await r.json();
        if (Array.isArray(data)) setAdminCustomRequests(data);
      }
    } catch (err) {
      console.error('Failed to fetch admin custom requests:', err);
    }
  }, [adminToken]);

  // Admin categories fetch
  const fetchAdminCategories = useCallback(async (tokenToUse) => {
    const token = tokenToUse || adminToken;
    if (!token) return;
    try {
      const r = await fetch('/api/admin/categories', {
        headers: { 'x-admin-token': token }
      });
      if (r.ok) {
        const data = await r.json();
        if (Array.isArray(data)) setAdminCategories(data);
      }
    } catch (err) {
      console.error('Failed to fetch admin categories:', err);
    }
  }, [adminToken]);

  // Admin customers fetch
  const fetchAdminCustomers = useCallback(async (tokenToUse) => {
    const token = tokenToUse || adminToken;
    if (!token) return;
    try {
      const r = await fetch('/api/admin/customers', { headers: { 'x-admin-token': token } });
      if (r.ok) {
        const data = await r.json();
        if (Array.isArray(data)) setAdminCustomers(data);
      }
    } catch (err) {
      console.error('Failed to fetch admin customers:', err);
    }
  }, [adminToken]);

  // Admin orders fetch
  const fetchAdminOrders = useCallback(async (tokenToUse) => {
    const token = tokenToUse || adminToken;
    if (!token) return;
    try {
      const r = await fetch('/api/admin/orders', { headers: { 'x-admin-token': token } });
      if (r.ok) {
        const data = await r.json();
        if (Array.isArray(data)) setAdminOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch admin orders:', err);
    }
  }, [adminToken]);

  // Admin returns fetch
  const fetchAdminReturns = useCallback(async (tokenToUse) => {
    const token = tokenToUse || adminToken;
    if (!token) return;
    try {
      const r = await fetch('/api/admin/returns', { headers: { 'x-admin-token': token } });
      if (r.ok) {
        const data = await r.json();
        if (data.success && Array.isArray(data.returns)) setAdminReturns(data.returns);
      }
    } catch (err) {
      console.error('Failed to fetch admin returns:', err);
    }
  }, [adminToken]);

  // Admin reviews fetch
  const fetchAdminReviews = useCallback(async (tokenToUse) => {
    const token = tokenToUse || adminToken;
    if (!token) return;
    try {
      const r = await fetch('/api/admin/reviews', { headers: { 'x-admin-token': token } });
      if (r.ok) {
        const data = await r.json();
        if (data.success && Array.isArray(data.reviews)) setAdminReviews(data.reviews);
      }
    } catch (err) {
      console.error('Failed to fetch admin reviews:', err);
    }
  }, [adminToken]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchCategories(), fetchOffers(), fetchSiteSettings()]);
      // Fetch public active shipping methods
      try {
        const r = await fetch('/api/shipping/active');
        if (r.ok) {
          const data = await r.json();
          if (Array.isArray(data)) setActiveShippingMethods(data);
        }
      } catch (err) {
        console.error('Failed to fetch shipping methods:', err);
      }
      setLoading(false);
    })();
  }, [fetchProducts, fetchCategories, fetchOffers, fetchSiteSettings]);

  // Auto load admin products, offers, queries, categories if token exists
  useEffect(() => {
    if (adminToken) {
      setIsAdmin(true);
      fetchAdminProducts(adminToken);
      fetchAdminOffers(adminToken);
      fetchAdminQueries(adminToken);
      fetchAdminCategories(adminToken);
      fetchAdminCustomers(adminToken);
      fetchAdminOrders(adminToken);
      fetchAdminReturns(adminToken);
      fetchAdminReviews(adminToken);
      fetchAdminCustomRequests(adminToken);
      
      // Fetch admin shipping methods
      fetch('/api/admin/shipping', { headers: { 'x-admin-token': adminToken } })
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setAdminShipping(data); })
        .catch(err => console.error('Failed to fetch admin shipping:', err));
    }
  }, [adminToken, fetchAdminProducts, fetchAdminOffers, fetchAdminQueries, fetchAdminCategories, fetchAdminCustomers, fetchAdminOrders, fetchAdminReturns, fetchAdminReviews]);

  /* —— Admin Dashboard Form States —— */
  const [adminFormOpen, setAdminFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState(null);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');

  // Inventory inline edit states
  const [editingStockId, setEditingStockId] = useState(null);
  const [editingStockValue, setEditingStockValue] = useState('');
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');

  // Offer form states
  const [offerFormOpen, setOfferFormOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerTitle, setOfferTitle] = useState('');
  const [offerDescription, setOfferDescription] = useState('');
  const [offerDiscount, setOfferDiscount] = useState('');
  const [offerValidUntil, setOfferValidUntil] = useState('');
  const [offerStatus, setOfferStatus] = useState('Active');
  const [deleteConfirmOffer, setDeleteConfirmOffer] = useState(null);

  // Category form states
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [categoryLabel, setCategoryLabel] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');
  const [categoryImageFile, setCategoryImageFile] = useState(null);
  const [categoryImageUrl, setCategoryImageUrl] = useState('');
  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  // Shipping form states
  const [shippingFormOpen, setShippingFormOpen] = useState(false);
  const [shippingProviderName, setShippingProviderName] = useState('');
  const [shippingCharge, setShippingCharge] = useState('');
  const [shippingIsActive, setShippingIsActive] = useState(true);
  const [editingShipping, setEditingShipping] = useState(null);
  const [deleteConfirmShipping, setDeleteConfirmShipping] = useState(null);
  const [adminShipping, setAdminShipping] = useState([]);

  // Checkout and Active Shipping Methods
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState(null);
  const [activeShippingMethods, setActiveShippingMethods] = useState([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { couponId, code, discountAmount, discountPercentage }
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Invoice state (shared for both admin and post-payment customer view)
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  // Individual fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formCollection, setFormCollection] = useState('');
  const [formBrand, setFormBrand] = useState('Parisu Ulagam');
  const [formPrice, setFormPrice] = useState('');
  const [formShippingCharge, setFormShippingCharge] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formBadge, setFormBadge] = useState('');
  const [formBadgeClass, setFormBadgeClass] = useState('new');
  const [formDescription, setFormDescription] = useState('');
  const [formSpecifications, setFormSpecifications] = useState('');
  const [formStatus, setFormStatus] = useState('Active');
  const [formOfferId, setFormOfferId] = useState('');
  const [formDiscountPercentage, setFormDiscountPercentage] = useState(0);
  
  // Images
  const [formImages, setFormImages] = useState([]); // File objects
  const [formExistingImages, setFormExistingImages] = useState([]); // existing image string paths

  // Reset form helper
  const resetForm = () => {
    setFormName('');
    setFormCategory(categories[0]?.id || 'Earrings');
    setFormCollection('');
    setFormBrand('Parisu Ulagam');
    setFormPrice('');
    setFormStock('');
    setFormBadge('');
    setFormBadgeClass('new');
    setFormDescription('');
    setFormSpecifications('');
    setFormStatus('Active');
    setFormOfferId('');
    setFormDiscountPercentage(0);
    setFormImages([]);
    setFormExistingImages([]);
    setEditingProduct(null);
  };

  // Open Add modal
  const openAddModal = () => {
    resetForm();
    setAdminFormOpen(true);
  };

  // Open Edit modal
  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormName(product.name || '');
    setFormCategory(product.category || 'Earrings');
    setFormCollection(product.collection || '');
    setFormBrand(product.brand || 'Parisu Ulagam');
    setFormPrice(product.price || '');
    setFormShippingCharge(product.shippingCharge || '0');
    setFormStock(product.stock || '0');
    setFormBadge(product.badge || '');
    setFormBadgeClass(product.badgeClass || 'new');
    setFormDescription(product.description || '');
    setFormSpecifications(product.specifications || '');
    setFormStatus(product.status || 'Active');
    setFormOfferId(product.offerId || '');
    setFormDiscountPercentage(product.discountPercentage || 0);
    setFormImages([]);
    setFormExistingImages(product.images || [product.image] || []);
    setAdminFormOpen(true);
  };

  // Handle Add/Edit Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formName || !formCategory || !formPrice) {
      addToast('Name, Category, and Price are required.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('name', formName);
    formData.append('category', formCategory);
    formData.append('collection', formCollection);
    formData.append('brand', formBrand);
    formData.append('price', formPrice);
    formData.append('shippingCharge', formShippingCharge);
    formData.append('stock', formStock);
    formData.append('badge', formBadge);
    formData.append('discountPercentage', formDiscountPercentage);
    formData.append('offerId', formOfferId);
    formData.append('badgeClass', formBadgeClass);
    formData.append('description', formDescription);
    formData.append('specifications', formSpecifications);
    formData.append('status', formStatus);
    formData.append('existingImages', JSON.stringify(formExistingImages));

    // Append newly uploaded images
    formImages.forEach(file => {
      formData.append('images', file);
    });

    const url = editingProduct 
      ? `/api/admin/products/${editingProduct.id}` 
      : '/api/admin/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const r = await fetch(url, {
        method,
        headers: {
          'x-admin-token': adminToken
        },
        body: formData
      });
      const data = await r.json();
      if (data.success) {
        addToast(data.message, 'success');
        setAdminFormOpen(false);
        resetForm();
        // Immediately refresh storefront and admin products
        await fetchProducts();
        await fetchAdminProducts();
      } else {
        addToast(data.message || 'Action failed', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Connection error', 'error');
    }
  };

  // Handle Delete
  const handleDeleteProduct = async (productId) => {
    try {
      const r = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'x-admin-token': adminToken
        }
      });
      const data = await r.json();
      if (data.success) {
        addToast('Product deleted successfully', 'success');
        setDeleteConfirmProduct(null);
        // Immediately refresh storefront and admin products
        await fetchProducts();
        await fetchAdminProducts();
      } else {
        addToast(data.message || 'Failed to delete product', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Connection error', 'error');
    }
  };

  // Handle image upload input change
  const handleImageFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFormImages(prev => [...prev, ...filesArray]);
    }
  };

  // Remove selected new image before uploading
  const removeNewImage = (index) => {
    setFormImages(prev => prev.filter((_, i) => i !== index));
  };

  // Remove existing image
  const removeExistingImage = (index) => {
    setFormExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  // —— Inventory: Quick stock update ——
  const handleStockUpdate = async (productId, newStock) => {
    try {
      const formData = new FormData();
      formData.append('stock', newStock);
      formData.append('existingImages', '[]');
      const r = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'x-admin-token': adminToken },
        body: formData
      });
      const data = await r.json();
      if (data.success) {
        addToast('Stock updated successfully', 'success');
        setEditingStockId(null);
        await fetchAdminProducts();
        await fetchProducts();
      } else {
        addToast(data.message || 'Failed to update stock', 'error');
      }
    } catch {
      addToast('Connection error', 'error');
    }
  };

  // —— Offers CRUD ——
  const resetOfferForm = () => {
    setOfferTitle('');
    setOfferDescription('');
    setOfferDiscount('');
    setOfferValidUntil('');
    setOfferStatus('Active');
    setEditingOffer(null);
  };

  const openAddOfferModal = () => {
    resetOfferForm();
    setOfferFormOpen(true);
  };

  const openEditOfferModal = (offer) => {
    setEditingOffer(offer);
    setOfferTitle(offer.title || '');
    setOfferDescription(offer.description || '');
    setOfferDiscount(offer.discountPercentage || '');
    setOfferValidUntil(offer.validUntil ? new Date(offer.validUntil).toISOString().split('T')[0] : '');
    setOfferStatus(offer.status || 'Active');
    setOfferFormOpen(true);
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    if (!offerTitle || !offerDiscount || !offerValidUntil) {
      addToast('Title, Discount %, and Valid Until are required.', 'error');
      return;
    }
    try {
      const url = editingOffer
        ? `/api/admin/offers/${editingOffer.id}`
        : '/api/admin/offers';
      const r = await fetch(url, {
        method: editingOffer ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({
          title: offerTitle,
          description: offerDescription,
          discountPercentage: parseFloat(offerDiscount),
          validUntil: offerValidUntil,
          status: offerStatus
        })
      });
      const data = await r.json();
      if (data.success) {
        addToast(editingOffer ? 'Offer updated!' : 'Offer created!', 'success');
        setOfferFormOpen(false);
        resetOfferForm();
        await fetchAdminOffers();
      } else {
        addToast(data.message || 'Failed to save offer', 'error');
      }
    } catch {
      addToast('Connection error', 'error');
    }
  };

  const handleDeleteOffer = async (offerId) => {
    try {
      const r = await fetch(`/api/admin/offers/${offerId}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken }
      });
      const data = await r.json();
      if (data.success) {
        addToast('Offer deleted', 'success');
        setDeleteConfirmOffer(null);
        await fetchAdminOffers();
      } else {
        addToast(data.message || 'Failed to delete offer', 'error');
      }
    } catch {
      addToast('Connection error', 'error');
    }
  };

  // —— Queries: Mark as resolved ——
  const handleResolveQuery = async (queryId) => {
    try {
      const r = await fetch(`/api/admin/queries/${queryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({ status: 'Resolved' })
      });
      const data = await r.json();
      if (data.success) {
        addToast('Query marked as resolved', 'success');
        await fetchAdminQueries();
      } else {
        addToast(data.message || 'Failed to update query', 'error');
      }
    } catch {
      addToast('Connection error', 'error');
    }
  };

  const handleReopenQuery = async (queryId) => {
    try {
      const r = await fetch(`/api/admin/queries/${queryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({ status: 'Open' })
      });
      const data = await r.json();
      if (data.success) {
        addToast('Query reopened', 'success');
        await fetchAdminQueries();
      } else {
        addToast(data.message || 'Failed to update query', 'error');
      }
    } catch {
      addToast('Connection error', 'error');
    }
  };

  // —— Categories CRUD (Admin) ——
  const resetCategoryForm = () => {
    setCategoryLabel('');
    setCategoryDesc('');
    setCategoryImageFile(null);
    setCategoryImageUrl('');
    setEditingCategory(null);
  };

  const openEditCategoryModal = (cat) => {
    setEditingCategory(cat);
    setCategoryLabel(cat.label || '');
    setCategoryDesc(cat.desc || '');
    setCategoryImageFile(null);
    setCategoryImageUrl(cat.image || '');
    setCategoryFormOpen(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryLabel) {
      addToast('Category Label is required.', 'error');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('label', categoryLabel);
      formData.append('desc', categoryDesc);
      if (categoryImageFile) {
        formData.append('image', categoryImageFile);
      } else {
        formData.append('imageUrl', categoryImageUrl);
      }

      const method = editingCategory ? 'PUT' : 'POST';
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories';

      const r = await fetch(url, {
        method: method,
        headers: {
          'x-admin-token': adminToken
        },
        body: formData
      });
      const data = await r.json();
      if (data.success) {
        addToast(editingCategory ? 'Category updated successfully!' : 'Category created successfully!', 'success');
        setCategoryFormOpen(false);
        resetCategoryForm();
        await fetchAdminCategories();
        await fetchCategories(); // refresh public storefront category view
      } else {
        addToast(data.message || 'Failed to process category', 'error');
      }
    } catch {
      addToast('Connection error', 'error');
    }
  };

  const handleDeleteCategory = async (catId) => {
    try {
      const r = await fetch(`/api/admin/categories/${catId}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken }
      });
      const data = await r.json();
      if (data.success) {
        addToast('Category deleted successfully', 'success');
        setDeleteConfirmCategory(null);
        await fetchAdminCategories();
        await fetchCategories(); // refresh public storefront category view
      } else {
        addToast(data.message || 'Failed to delete category', 'error');
      }
    } catch {
      addToast('Connection error', 'error');
    }
  };

  // Admin Logout
  const handleAdminLogout = () => {
    setAdminToken('');
    setIsAdmin(false);
    setShowAdmin(false);
    localStorage.removeItem('pu-admin-token');
    addToast('Logged out of Admin Portal', 'info');
  };

  /* —— UI state —— */
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen]);

  const [currentHash, setCurrentHash] = useState(window.location.hash);
  useEffect(() => {
    const handleHash = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const isProductRoute = currentHash.startsWith('#/product/');
  const routeProductId = isProductRoute ? currentHash.replace('#/product/', '') : null;
  const isSignupRoute = currentHash === '#/signup';

  const [selectedProduct, setSelectedProduct] = useState(null);
  
  useEffect(() => {
    if (routeProductId) {
      const localP = products.find(p => p.id === routeProductId || p._id === routeProductId);
      if (localP) {
        setSelectedProduct(localP);
        setActiveDetailImage(localP.images?.[0] || localP.image || '/images/hero.png');
        setSelectedColorIdx(0);
        setQty(1);
      } else {
        fetch(`/api/products/${routeProductId}`)
          .then(res => {
            if (!res.ok) throw new Error('Not found');
            return res.json();
          })
          .then(data => {
            setSelectedProduct(data);
            setActiveDetailImage(data.images?.[0] || data.image || '/images/hero.png');
            setSelectedColorIdx(0);
            setQty(1);
          })
          .catch(() => setSelectedProduct(null));
      }
    } else {
      setSelectedProduct(null);
    }
  }, [routeProductId, products]);

  const [activeDetailImage, setActiveDetailImage] = useState('');
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dashboardInitialTab, setDashboardInitialTab] = useState('profile');
  const [searchQuery, setSearchQuery] = useState('');
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [activeSection, setActiveSection] = useState('home');
  const [adminActiveTab, setAdminActiveTab] = useState('dashboard');

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.15 });

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [activeSection, currentHash]);

  /* —— Customer Account States —— */
  // 'login' | 'register-step1' | 'register-step2' | 'register-step3' | 'profile'
  const [accountMode, setAccountMode] = useState('login');
  const [accountOpen, setAccountOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pu-user') || 'null'); } catch { return null; }
  });
  const [userToken, setUserToken] = useState(() => localStorage.getItem('pu-user-token') || '');

  // Registration step 1
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regOtpCode, setRegOtpCode] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regExtraDetails, setRegExtraDetails] = useState('');
  const [regToken, setRegToken] = useState(''); // registration flow token after OTP
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regDevOtp, setRegDevOtp] = useState(''); // for local dev: show OTP returned

  // Forgot Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtpCode, setForgotOtpCode] = useState('');
  const [forgotPassword, setForgotPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotToken, setForgotToken] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);

  // Profile edit
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [profileMobile, setProfileMobile] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileExtraDetails, setProfileExtraDetails] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  const openAccountModal = (mode = 'login') => {
    setAccountMode(mode);
    setRegError('');
    setRegName(''); setRegEmail(''); setRegMobile('');
    setRegOtpCode(''); setRegPassword(''); setRegConfirmPassword('');
    setRegAddress(''); setRegExtraDetails('');
    setRegToken(''); setRegDevOtp('');
    setForgotError(''); setForgotEmail(''); setForgotOtpCode('');
    setForgotPassword(''); setForgotConfirmPassword(''); setForgotToken('');
    setAccountOpen(true);
  };

  const closeAccountModal = () => {
    setAccountOpen(false);
    setRegError('');
    setForgotError('');
  };

  // Sync wishlist to backend whenever it changes (if user is logged in)
  useEffect(() => {
    if (!userToken || !currentUser) return;
    const timer = setTimeout(() => {
      fetch('/api/users/sync-wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-token': userToken },
        body: JSON.stringify({ wishlist: wishlist.map(item => item.id) })
      }).then(res => {
        if (res.status === 401) handleUserLogout();
      }).catch(() => {});
    }, 800);
    return () => clearTimeout(timer);
  }, [wishlist, userToken, currentUser]);

  // Sync cart to backend whenever it changes (if user is logged in)
  useEffect(() => {
    if (!userToken || !currentUser) return;
    const cartPayload = cartItems.map(item => ({
      productId: item.id,
      quantity: item.quantity,
      name: item.name,
      price: item.price,
      image: item.selectedImage || item.image,
      selectedImage: item.selectedImage || item.image
    }));
    const timer = setTimeout(() => {
      fetch('/api/users/sync-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-token': userToken },
        body: JSON.stringify({ cart: cartPayload })
      }).then(res => {
        if (res.status === 401) handleUserLogout();
      }).catch(() => {});
    }, 800);
    return () => clearTimeout(timer);
  }, [cartItems, userToken, currentUser]);

  const handleUserLogout = () => {
    setCurrentUser(null);
    setUserToken('');
    localStorage.removeItem('pu-user');
    localStorage.removeItem('pu-user-token');
    clearCart();
    clearWishlist();
    addToast('Logged out successfully', 'info');
    closeAccountModal();
  };

  // Helper: load a user's server cart and wishlist into context
  const loadUserCartWishlist = (user, allProducts) => {
    // Restore wishlist (array of IDs mapped to product objects)
    if (Array.isArray(user.wishlist)) {
      const restoredWishlist = user.wishlist
        .map(id => allProducts.find(p => p.id === id || p._id === id))
        .filter(Boolean);
      setWishlist(restoredWishlist);
    }
    // Restore cart (array of {productId, quantity, selectedImage} mapped to product objects)
    if (Array.isArray(user.cart)) {
      const restoredCart = user.cart
        .map(item => {
          const product = allProducts.find(p => p.id === item.productId || p._id === item.productId);
          if (product) {
            const selectedImg = item.selectedImage || item.image || product.image;
            return {
              ...product,
              quantity: item.quantity,
              selectedImage: selectedImg,
              image: selectedImg
            };
          }
          return null;
        })
        .filter(Boolean);
      setCartItems(restoredCart);
    }
  };

  /* —— FORGOT PASSWORD HANDLERS —— */
  const handleForgotStep1 = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);
    try {
      const r = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await r.json();
      if (data.success) {
        setAccountMode('forgot-step2');
      } else {
        setForgotError(data.message || 'Failed to send reset code.');
      }
    } catch {
      setForgotError('Connection error. Please try again.');
    }
    setForgotLoading(false);
  };

  const handleForgotStep2 = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);
    try {
      const r = await fetch('/api/users/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, code: forgotOtpCode })
      });
      const data = await r.json();
      if (data.success) {
        setForgotToken(data.resetToken);
        setAccountMode('forgot-step3');
      } else {
        setForgotError(data.message || 'Invalid verification code.');
      }
    } catch {
      setForgotError('Connection error. Please try again.');
    }
    setForgotLoading(false);
  };

  const handleForgotStep3 = async (e) => {
    e.preventDefault();
    setForgotError('');
    if (forgotPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }
    setForgotLoading(true);
    try {
      const r = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken: forgotToken, newPassword: forgotPassword })
      });
      const data = await r.json();
      if (data.success) {
        addToast(data.message, 'success');
        setAccountMode('login');
      } else {
        setForgotError(data.message || 'Failed to reset password.');
      }
    } catch {
      setForgotError('Connection error. Please try again.');
    }
    setForgotLoading(false);
  };

  // Step 1: Request OTP
  const handleRegisterStep1 = async (e) => {
    e.preventDefault();
    setRegError('');
    if (!/^\d{10}$/.test(regMobile)) {
      setRegError('Mobile number must be exactly 10 digits.');
      return;
    }
    setRegLoading(true);
    try {
      const r = await fetch('/api/users/register-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, mobile: regMobile })
      });
      const data = await r.json();
      if (data.success) {
        setRegDevOtp(data.otp || ''); // dev: show returned OTP
        setAccountMode('register-step2');
      } else {
        setRegError(data.message || 'Failed to send verification code.');
      }
    } catch {
      setRegError('Connection error. Please try again.');
    }
    setRegLoading(false);
  };

  // Step 2: Verify OTP
  const handleRegisterStep2 = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegLoading(true);
    try {
      const r = await fetch('/api/users/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, code: regOtpCode })
      });
      const data = await r.json();
      if (data.success) {
        setRegToken(data.registrationToken);
        setAccountMode('register-step3');
      } else {
        setRegError(data.message || 'Invalid or expired verification code.');
      }
    } catch {
      setRegError('Connection error. Please try again.');
    }
    setRegLoading(false);
  };

  // Step 3: Complete Registration
  const handleRegisterStep3 = async (e) => {
    e.preventDefault();
    setRegError('');
    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match.');
      return;
    }
    setRegLoading(true);
    try {
      const r = await fetch('/api/users/complete-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName, email: regEmail, mobile: regMobile,
          password: regPassword, address: regAddress,
          extraDetails: regExtraDetails, registrationToken: regToken
        })
      });
      const data = await r.json();
      if (data.success) {
        setCurrentUser(data.user);
        setUserToken(data.token);
        localStorage.setItem('pu-user', JSON.stringify(data.user));
        localStorage.setItem('pu-user-token', data.token);
        
        loadUserCartWishlist(data.user, products);

        addToast(`Welcome, ${data.user.name}! Account created successfully.`, 'success');
        closeAccountModal();
      } else {
        setRegError(data.message || 'Failed to complete registration.');
      }
    } catch {
      setRegError('Connection error. Please try again.');
    }
    setRegLoading(false);
  };

  // --- Admin Shipping Handlers ---
  const handleShippingSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      providerName: shippingProviderName,
      shippingCharge: parseFloat(shippingCharge),
      isActive: shippingIsActive
    };
    try {
      const method = editingShipping ? 'PUT' : 'POST';
      const url = editingShipping ? `/api/admin/shipping/${editingShipping._id || editingShipping.id}` : '/api/admin/shipping';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Shipping method ${editingShipping ? 'updated' : 'created'}.`, 'success');
        setShippingFormOpen(false);
        fetchAdminShipping(adminToken);
      } else {
        addToast(data.message || 'Failed to save shipping method.', 'error');
      }
    } catch (err) {
      addToast('Connection error.', 'error');
    }
  };

  const handleSiteSettingsSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      const r = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'x-admin-token': adminToken },
        body: formData
      });
      const data = await r.json();
      if (r.ok && data.success) {
        setSiteSettings(data.settings);
        addToast('Site settings updated successfully!', 'success');
      } else {
        addToast(data.message || 'Failed to save settings', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const deleteShippingMethod = async (id) => {
    try {
      const res = await fetch(`/api/admin/shipping/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken }
      });
      const data = await res.json();
      if (data.success) {
        addToast('Shipping method deleted.', 'success');
        setDeleteConfirmShipping(null);
        fetchAdminShipping(adminToken);
      } else {
        addToast(data.message || 'Failed to delete shipping method.', 'error');
      }
    } catch (err) {
      addToast('Connection error.', 'error');
    }
  };

  const toggleShippingStatus = async (id) => {
    try {
      const res = await fetch(`/api/admin/shipping/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'x-admin-token': adminToken }
      });
      const data = await res.json();
      if (data.success) {
        addToast(data.message, 'success');
        fetchAdminShipping(adminToken);
      } else {
        addToast(data.message || 'Failed to toggle status.', 'error');
      }
    } catch (err) {
      addToast('Connection error.', 'error');
    }
  };

  // User Login
  const handleUserLogin = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegLoading(true);
    try {
      const r = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, password: regPassword })
      });
      const data = await r.json();
      if (data.success) {
        if (data.isAdmin) {
          setAdminToken(data.token);
          localStorage.setItem('pu-admin-token', data.token);
          setIsAdmin(true);
          setShowAdmin(true);
          addToast(`Welcome back, Admin!`, 'success');
          closeAccountModal();
        } else {
          setCurrentUser(data.user);
          setUserToken(data.token);
          localStorage.setItem('pu-user', JSON.stringify(data.user));
          localStorage.setItem('pu-user-token', data.token);
          
          loadUserCartWishlist(data.user, products);

          addToast(`Welcome back, ${data.user.name}!`, 'success');
          closeAccountModal();
        }
      } else {
        setRegError(data.message || 'Invalid email or password.');
      }
    } catch {
      setRegError('Connection error. Please try again.');
    }
    setRegLoading(false);
  };

  // Profile Update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileError('');
    if (profileMobile && !/^\d{10}$/.test(profileMobile)) {
      setProfileError('Mobile number must be exactly 10 digits.');
      return;
    }
    setProfileLoading(true);
    try {
      const r = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-token': userToken },
        body: JSON.stringify({ mobile: profileMobile, address: profileAddress, extraDetails: profileExtraDetails })
      });
      const data = await r.json();
      if (data.success) {
        setCurrentUser(data.user);
        localStorage.setItem('pu-user', JSON.stringify(data.user));
        setProfileEditMode(false);
        addToast('Profile updated successfully!', 'success');
      } else {
        setProfileError(data.message || 'Failed to update profile.');
      }
    } catch {
      setProfileError('Connection error. Please try again.');
    }
    setProfileLoading(false);
  };

  /* —— Filter & Sort states —— */
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCollection, setSelectedCollection] = useState('All');
  const [sortBy, setSortBy] = useState('Default');

  /* —— wishlist check —— */
  const isWished = useCallback(id => wishlist.some(w => w.id === id), [wishlist]);

  const toggleWish = (product, event) => {
    if (isWished(product.id)) {
      removeFromWishlist(product.id);
      addToast('Removed from wishlist', 'info');
    } else {
      addToWishlist(product);
      // Trigger flying balloon to wishlist icon instead of redirecting
      if (event) {
        const rect = event.currentTarget.getBoundingClientRect();
        setFlyAnim({
          startX: rect.left + rect.width / 2,
          startY: rect.top + rect.height / 2,
          target: '#nav-wishlist-icon'
        });
      } else {
        addToast('Added to wishlist ♡', 'success');
      }
    }
  };

  // Wrapper to trigger cart balloon animation
  const addToCartWithAnim = (product, qty, event) => {
    addToCart(product, qty);
    if (event) {
      const rect = event.currentTarget.getBoundingClientRect();
      setFlyAnim({
        startX: rect.left + rect.width / 2,
        startY: rect.top + rect.height / 2,
        target: '#nav-cart-icon'
      });
    } else {
      addToast(`${product.name} added to cart`, 'success');
    }
  };

  // getDiscountedPrice: product.price IS the selling price.
  // We keep this function for sorting & subtotal — it returns product.price always.
  // The "MRP" (higher struck-out price) is calculated in the display as price / (1 - disc/100).
  const getDiscountedPrice = (p) => {
    return p.price || 0;
  };
  // Helper to compute display MRP (struck-out "original" higher price)
  const getMRP = (p) => {
    if (p.discountPercentage && p.discountPercentage > 0) {
      return Math.round(p.price / (1 - p.discountPercentage / 100));
    }
    return p.price;
  };

  // Calculate cart total dynamically
  const cartTotal = cartItems.reduce((sum, item) => sum + ((item.discountPercentage > 0 ? getDiscountedPrice(item) : item.price) * item.quantity), 0);
  const itemsToCheckout = buyNowItem ? [buyNowItem] : cartItems;
  const checkoutSubtotal = buyNowItem ? ((buyNowItem.discountPercentage > 0 ? getDiscountedPrice(buyNowItem) : buyNowItem.price) * buyNowItem.quantity) : cartTotal;

  // Load Razorpay script
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Coupon apply handler
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const resp = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          cartItems: itemsToCheckout.map(item => ({
            productId: item._id || item.id,
            price: item.price,
            quantity: item.quantity
          }))
        })
      });
      const data = await resp.json();
      if (data.success) {
        setAppliedCoupon(data);
        setCouponError('');
        addToast(data.message, 'success');
      } else {
        setCouponError(data.message || 'Invalid coupon code.');
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponError('Failed to validate coupon. Please try again.');
    }
    setCouponLoading(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // Handle Checkout Process
  const handleCheckout = async () => {
    // Shipping method is now optional
    if (!checkoutAddress.trim()) {
      addToast('Please provide a shipping address', 'error');
      return;
    }
    
    const shipping = activeShippingMethods.find(s => s._id === selectedShippingMethod || s.id === selectedShippingMethod);
    const methodCharge = shipping ? shipping.shippingCharge : 0;
    const productShippingCharge = itemsToCheckout.reduce((sum, item) => sum + (item.shippingCharge || 0) * item.quantity, 0);
    const shippingCharge = methodCharge + productShippingCharge;
    const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    const grandTotal = Math.max(0, checkoutSubtotal + shippingCharge - couponDiscount);
    
    setCheckoutLoading(true);
    
    try {
      // 1. Load script
      const res = await loadRazorpay();
      if (!res) {
        addToast('Razorpay SDK failed to load. Are you online?', 'error');
        setCheckoutLoading(false);
        return;
      }
      
      // 2. Create order on backend
      const orderResp = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-token': userToken },
        body: JSON.stringify({ amount: grandTotal })
      });
      const orderData = await orderResp.json();
      
      if (!orderResp.ok || !orderData.success) {
        addToast(orderData.message || 'Failed to initialize payment', 'error');
        setCheckoutLoading(false);
        return;
      }
      
      // 3. Open Razorpay Checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Parisu Ulagam",
        description: `Order for ${itemsToCheckout.length} item(s)`,
        order_id: orderData.razorpayOrderId,
        handler: async function (response) {
          // 4. Verify Payment and Create final Order
          const verifyResp = await fetch('/api/users/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-token': userToken },
            body: JSON.stringify({
              items: itemsToCheckout.map(item => ({
                ...item,
                image: item.selectedImage || item.image,
                selectedImage: item.selectedImage || item.image
              })),
              subtotal: checkoutSubtotal,
              shippingCharge,
              totalAmount: grandTotal,
              shippingMethod: shipping ? shipping.providerName : '',
              shippingAddress: checkoutAddress,
              customerPhone: checkoutPhone || currentUser?.mobile || '',
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature
            })
          });
          
          const verifyData = await verifyResp.json();
          if (verifyData.success) {
            addToast('🎉 Payment successful! Order placed successfully.', 'success');
            if (!buyNowItem) {
              clearCart();
            }
            // Record coupon usage
            if (appliedCoupon && appliedCoupon.couponId) {
              try { fetch('/api/coupons/use', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ couponId: appliedCoupon.couponId }) }); } catch(e) {}
            }
            setBuyNowItem(null);
            setCheckoutOpen(false);
            setAppliedCoupon(null);
            setCouponCode('');
            setCouponError('');
            setCartOpen(false);
            // Refresh user profile so newly saved address appears in quick-select next time
            try {
              const profileResp = await fetch('/api/users/profile', {
                headers: { 'x-user-token': userToken }
              });
              if (profileResp.ok) {
                const updatedUser = await profileResp.json();
                if (updatedUser && updatedUser._id) {
                  setCurrentUser(updatedUser);
                  localStorage.setItem('pu-user', JSON.stringify(updatedUser));
                }
              }
            } catch (profileErr) {
              console.error('Failed to refresh user profile:', profileErr);
            }
            // Auto-show invoice after successful payment
            try {
              const invoiceResp = await fetch(`/api/users/orders/${verifyData.orderId}`, {
                headers: { 'x-user-token': userToken }
              });
              if (invoiceResp.ok) {
                const invoiceData = await invoiceResp.json();
                if (invoiceData.success && invoiceData.order) {
                  setSelectedInvoiceOrder(invoiceData.order);
                }
              }
            } catch (invErr) {
              console.error('Failed to load invoice:', invErr);
            }
          } else {
            addToast(verifyData.message || 'Order creation failed after payment.', 'error');
          }
        },
        prefill: {
          name: currentUser?.name || '',
          email: currentUser?.email || '',
          contact: checkoutPhone || currentUser?.mobile || ''
        },
        notes: {
          shipping_address: checkoutAddress
        },
        theme: {
          color: "#FF6F61"
        }
      };
      
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      
    } catch (error) {
      console.error(error);
      addToast('Checkout error occurred.', 'error');
    }
    setCheckoutLoading(false);
  };

  /* —— cart helpers —— */
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  /* —— search —— */
  const searchResults = searchQuery.trim()
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  /* —— Filter & Sort Logic —— */
  const filteredProducts = products.filter(p => {
    // Determine product's collection (auto-map fallback if empty)
    let productCol = p.collection;
    if (!productCol) {
      const cat = (p.category || '').toLowerCase();
      if (cat.includes('earring') || cat.includes('jewel')) {
        productCol = 'Women';
      } else if (cat.includes('keychain') || cat.includes('key chain')) {
        productCol = 'Men';
      } else if (cat.includes('3d') || cat.includes('toy') || cat.includes('module')) {
        productCol = 'Kids';
      } else if (cat.includes('wood') || cat.includes('engrav')) {
        productCol = 'Unisex & Couples';
      } else {
        productCol = 'Unisex & Couples';
      }
    }

    // Category check
    let matchCat = true;
    if (selectedCategory !== 'All') {
      if (selectedCategory === 'Offers') {
        matchCat = !!(p.discountPercentage > 0 || p.offerId);
      } else {
        matchCat = (p.category === selectedCategory);
      }
    }

    // Collection check
    let matchCol = true;
    if (selectedCollection !== 'All') {
      matchCol = (productCol === selectedCollection);
    }

    return matchCat && matchCol;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'Price: Low to High') return getDiscountedPrice(a) - getDiscountedPrice(b);
    if (sortBy === 'Price: High to Low') return getDiscountedPrice(b) - getDiscountedPrice(a);
    if (sortBy === 'Popularity') return (b.rating || 0) - (a.rating || 0);
    return 0; // Default order
  });

  /* —— login —— */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const r = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await r.json();
      if (data.success) {
        setIsAdmin(true);
        setShowAdmin(true);
        setLoginOpen(false);
        setAdminToken(data.token);
        localStorage.setItem('pu-admin-token', data.token);
        addToast('Welcome, Admin!', 'success');
        fetchAdminProducts(data.token);
        fetchAdminOffers(data.token);
        fetchAdminQueries(data.token);
        fetchAdminCategories(data.token);
        fetchAdminCustomRequests(data.token);
      } else {
        setLoginError(data.message || 'Invalid credentials');
      }
    } catch {
      setLoginError('Connection error');
    }
  };

  /* —— open product detail —— */
  const openDetail = (product) => {
    const pId = product.id || product._id;
    window.location.hash = `/product/${pId}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* —— admin view —— */
  if (showAdmin) {
    // Filter products in admin dashboard
    const adminFilteredProducts = adminProducts.filter(p => {
      const q = adminSearchQuery.toLowerCase();
      return p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q) || p.id?.toLowerCase().includes(q);
    });

    // Calculate stats
    const draftCount = adminProducts.filter(p => p.status === 'Draft').length;
    const archivedCount = adminProducts.filter(p => p.status === 'Archived').length;
    const activeCount = adminProducts.filter(p => p.status === 'Active').length;
    
    // Stock stats
    const totalStockItems = adminProducts.reduce((acc, p) => acc + (parseInt(p.stock) || 0), 0);
    const lowStockCount = adminProducts.filter(p => (parseInt(p.stock) || 0) > 0 && (parseInt(p.stock) || 0) < 5).length;
    const outOfStockCount = adminProducts.filter(p => (parseInt(p.stock) || 0) === 0).length;

    return (
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-header">
            <div className="brand__logo" style={{width:'40px', height:'40px', fontSize:'0.9rem'}}><img src="/royal_logo.png" alt="Parisu Ulagam" style={{width:'100%', height:'100%'}}/></div>
            <div className="brand__name" style={{fontSize:'1.1rem'}}>Admin Portal</div>
          </div>
          <nav className="admin-sidebar-nav">
            <button className={`admin-nav-item ${adminActiveTab === 'dashboard' ? 'active' : ''}`} onClick={() => setAdminActiveTab('dashboard')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'10px'}}><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
              Dashboard
            </button>
            <button className={`admin-nav-item ${adminActiveTab === 'products' ? 'active' : ''}`} onClick={() => setAdminActiveTab('products')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'10px'}}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              Products
            </button>
            <button className={`admin-nav-item ${adminActiveTab === 'categories' ? 'active' : ''}`} onClick={() => setAdminActiveTab('categories')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'10px'}}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>
              Categories
            </button>
            <button className={`admin-nav-item ${adminActiveTab === 'inventory' ? 'active' : ''}`} onClick={() => setAdminActiveTab('inventory')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'10px'}}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 12h6"/><path d="M9 16h6"/></svg>
              Inventory
            </button>
            <button className={`admin-nav-item ${adminActiveTab === 'offers' ? 'active' : ''}`} onClick={() => setAdminActiveTab('offers')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'10px'}}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              Offers
            </button>
            <button className={`admin-nav-item ${adminActiveTab === 'queries' ? 'active' : ''}`} onClick={() => setAdminActiveTab('queries')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'10px'}}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Queries
            </button>
            <button className={`admin-nav-item ${adminActiveTab === 'orders' ? 'active' : ''}`} onClick={() => setAdminActiveTab('orders')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'10px'}}><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
              Orders
            </button>
            <button className={`admin-nav-item ${adminActiveTab === 'canceledOrders' ? 'active' : ''}`} onClick={() => setAdminActiveTab('canceledOrders')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'10px'}}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              Canceled Orders
            </button>
            <button className={`admin-nav-item ${adminActiveTab === 'returns' ? 'active' : ''}`} onClick={() => setAdminActiveTab('returns')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'10px'}}><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M3.51 15A9 9 0 0 0 18.36 18.36L23 14"/></svg>
              Replacements
            </button>
            <button className={`admin-nav-item ${adminActiveTab === 'reviews' ? 'active' : ''}`} onClick={() => setAdminActiveTab('reviews')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'10px'}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Reviews
            </button>
            <button className={`admin-nav-item ${adminActiveTab === 'customers' ? 'active' : ''}`} onClick={() => setAdminActiveTab('customers')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'10px'}}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Customers
            </button>
            <button className={`admin-nav-item ${adminActiveTab === 'shipping' ? 'active' : ''}`} onClick={() => setAdminActiveTab('shipping')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'10px'}}><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              Shipping
            </button>
            <button className={`admin-nav-item ${adminActiveTab === 'coupons' ? 'active' : ''}`} onClick={() => setAdminActiveTab('coupons')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'10px'}}><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/></svg>
              Coupons
            </button>
            <button className={`admin-nav-item ${adminActiveTab === 'siteSettings' ? 'active' : ''}`} onClick={() => setAdminActiveTab('siteSettings')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'10px'}}><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
              Site Settings
            </button>
            <button className={`admin-nav-item ${adminActiveTab === 'customRequests' ? 'active' : ''}`} onClick={() => setAdminActiveTab('customRequests')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'10px'}}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              Custom Requests
            </button>
          </nav>
          <div className="admin-sidebar-footer">
            <button className="secondary-btn" onClick={() => setShowAdmin(false)} style={{width:'100%', marginBottom:'12px', padding:'10px'}}>
              <span>← View Store</span>
            </button>
            <button className="primary-btn" onClick={handleAdminLogout} style={{width:'100%', padding:'10px'}}>
              Log Out
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft:'8px'}}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </aside>

        <main className="admin-content">
          <header className="admin-content-header">
            <div>
              <h2>
                {adminActiveTab === 'dashboard' && 'Overview Dashboard'}
                {adminActiveTab === 'products' && 'Product Management'}
                {adminActiveTab === 'categories' && 'Category Management'}
                {adminActiveTab === 'inventory' && 'Inventory Management'}
                {adminActiveTab === 'offers' && 'Offers Management'}
                {adminActiveTab === 'queries' && 'Customer Queries'}
                {adminActiveTab === 'orders' && 'Order Management'}
                {adminActiveTab === 'canceledOrders' && 'Canceled Orders'}
                {adminActiveTab === 'returns' && 'Replacement & Returns'}
                {adminActiveTab === 'reviews' && 'Product Reviews'}
                {adminActiveTab === 'customers' && 'Customer Management'}
                {adminActiveTab === 'shipping' && 'Shipping Management'}
                {adminActiveTab === 'coupons' && 'Coupons'}
                {adminActiveTab === 'siteSettings' && 'Site Settings'}
                {adminActiveTab === 'customRequests' && 'Custom Requests'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop:'4px' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </header>

          <div className="admin-panel">
            {adminActiveTab === 'dashboard' && (
              <>
                <div className="admin-grid">
                  <div className="admin-stat">
                    <div className="admin-stat__number">{totalStockItems}</div>
                    <div className="admin-stat__label">Total Stock Items</div>
                  </div>
                  <div className="admin-stat">
                    <div className="admin-stat__number" style={{ color: lowStockCount > 0 ? '#d97706' : 'inherit' }}>{lowStockCount}</div>
                    <div className="admin-stat__label">Low Stock Alerts</div>
                  </div>
                  <div className="admin-stat">
                    <div className="admin-stat__number" style={{ color: outOfStockCount > 0 ? '#FF6F61' : 'inherit' }}>{outOfStockCount}</div>
                    <div className="admin-stat__label">Out of Stock Items</div>
                  </div>
                </div>
                <div className="admin-card" style={{ marginTop: '24px' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> Recent Sales & Activity Feed
                  </h3>
                  
                  {(() => {
                    const activities = [
                      ...adminOrders.map(o => ({
                        id: o.orderId,
                        type: 'order',
                        title: 'Order Placed',
                        desc: `Order #${o.orderId} by ${o.customerName} - ₹${o.totalAmount.toLocaleString('en-IN')}`,
                        date: o.createdAt,
                        badge: o.status,
                        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
                        color: 'var(--gold)'
                      })),
                      ...adminCustomers.map(c => ({
                        id: c.email,
                        type: 'customer',
                        title: 'New Signup',
                        desc: `${c.name} (${c.email}) registered an account`,
                        date: c.createdAt,
                        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
                        color: '#3b82f6'
                      })),
                      ...adminQueries.map(q => ({
                        id: q.id,
                        type: 'query',
                        title: 'Query Received',
                        desc: `Message from ${q.name}: "${q.subject || 'Inquiry'}"`,
                        date: q.createdAt,
                        badge: q.status,
                        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
                        color: '#d97706'
                      })),
                      ...adminReturns.map(r => ({
                        id: r._id,
                        type: 'return',
                        title: 'Replacement/Return Request',
                        desc: `Request for Order #${r.orderId} - Reason: ${r.reason}`,
                        date: r.createdAt,
                        badge: r.status,
                        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M3.51 15A9 9 0 0 0 18.36 18.36L23 14"/></svg>,
                        color: '#FF6F61'
                      })),
                      ...adminReviews.map(r => ({
                        id: r._id,
                        type: 'review',
                        title: 'Product Review Submitted',
                        desc: `Rating: ${r.rating} stars - "${r.comment?.substring(0, 30)}${r.comment?.length > 30 ? '...' : ''}"`,
                        date: r.createdAt,
                        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
                        color: '#eab308'
                      }))
                    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

                    if (activities.length === 0) {
                      return <p style={{ color: 'var(--text-muted)' }}>No recent activity to show.</p>;
                    }

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {activities.map((act, index) => (
                          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', border: `1.5px solid ${act.color}`, color: act.color }}>
                              {act.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: '700', fontSize: '0.92rem' }}>{act.title}</span>
                                {act.badge && (
                                  <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '12px', background: 'var(--gold-bg-strong)', color: 'var(--gold)', fontWeight: 'bold' }}>
                                    {act.badge}
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '2px' }}>{act.desc}</div>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                              {new Date(act.date).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </>
            )}

            {adminActiveTab === 'products' && (
              <>
                <div className="admin-grid" style={{marginBottom: '24px'}}>
                  <div className="admin-stat">
                    <div className="admin-stat__number">{adminProducts.length}</div>
                    <div className="admin-stat__label">Total Catalog</div>
                  </div>
                  <div className="admin-stat">
                    <div className="admin-stat__number">{activeCount}</div>
                    <div className="admin-stat__label">Active Online</div>
                  </div>
                  <div className="admin-stat">
                    <div className="admin-stat__number">{draftCount + archivedCount}</div>
                    <div className="admin-stat__label">Draft / Archived</div>
                  </div>
                </div>

                <div className="admin-actions-bar">
                  <div className="admin-search-wrap">
                    <span className="admin-search-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </span>
                    <input id="adminSearchQuery" name="adminSearchQuery"
                      className="admin-search-input"
                      type="text"
                      placeholder="Search catalog by name, category, or ID..."
                      value={adminSearchQuery}
                      onChange={e => setAdminSearchQuery(e.target.value)}
                    />
                  </div>
                  <button className="primary-btn" onClick={openAddModal}>
                    & Add New Product
                  </button>
                </div>

                <div className="admin-products-table-wrapper">
                  {adminFilteredProducts.length === 0 ? (
                    <p className="status-message">No matching products found in the catalog.</p>
                  ) : (
                    <table className="admin-products-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                  {adminFilteredProducts.map(p => {
                    const displayImg = p.images?.[0] || p.image || '/images/hero.png';
                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="admin-product-cell">
                            <img className="admin-product-thumb" src={displayImg} alt={p.name} />
                            <div className="admin-product-info">
                              <span className="admin-product-name">{p.name}</span>
                              <span className="admin-product-id">{p.id}</span>
                            </div>
                          </div>
                        </td>
                        <td>{p.category}</td>
                        <td style={{ fontWeight: '600' }}>₹{p.price?.toLocaleString('en-IN')}</td>
                        <td>{p.stock !== undefined ? p.stock : '—'}</td>
                        <td>
                          <span className={`admin-status-badge status--${(p.status || 'Active').toLowerCase()}`}>
                            {p.status || 'Active'}
                          </span>
                        </td>
                        <td>
                          <div className="admin-row-actions">
                            <button
                              className="admin-btn-icon"
                              title="Edit product"
                              onClick={() => openEditModal(p)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"/></svg>
                            </button>
                            <button
                              className="admin-btn-icon delete"
                              title="Delete product"
                              onClick={() => setDeleteConfirmProduct(p)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          </>
        )}

        {/* —— CATEGORIES TAB —— */}
        {adminActiveTab === 'categories' && (
          <>
            <div className="admin-grid" style={{marginBottom: '24px'}}>
              <div className="admin-stat">
                <div className="admin-stat__number">{categories.length}</div>
                <div className="admin-stat__label">Total Categories</div>
              </div>
            </div>

            <div className="admin-actions-bar">
              <div></div>
              <button className="primary-btn" onClick={() => { resetCategoryForm(); setCategoryFormOpen(true); }}>
                & Create New Category
              </button>
            </div>

            <div className="admin-products-table-wrapper">
              {categories.length === 0 ? (
                <p className="status-message">No categories found. Create a category to start organizing your catalog!</p>
              ) : (
                <table className="admin-products-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Category Label</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(c => (
                      <tr key={c.id}>
                        <td>
                          <img className="admin-product-thumb" src={c.image || '/images/hero.png'} alt={c.label} />
                        </td>
                        <td>
                          <span style={{fontWeight:'600'}}>{c.label}</span>
                          <span className="admin-product-id" style={{display:'block'}}>{c.id}</span>
                        </td>
                        <td>
                          <div style={{color:'var(--text-muted)'}}>{c.desc || '—'}</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="admin-btn-icon"
                              style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}
                              title="Edit category"
                              onClick={() => openEditCategoryModal(c)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"/></svg>
                            </button>
                            <button
                              className="admin-btn-icon delete"
                              title="Delete category"
                              onClick={() => setDeleteConfirmCategory(c)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* —— INVENTORY TAB —— */}
        {adminActiveTab === 'inventory' && (
          <>
            <div className="admin-grid" style={{marginBottom: '24px'}}>
              <div className="admin-stat">
                <div className="admin-stat__number">{adminProducts.length}</div>
                <div className="admin-stat__label">Total Products</div>
              </div>
              <div className="admin-stat">
                <div className="admin-stat__number">{totalStockItems}</div>
                <div className="admin-stat__label">Total Stock Units</div>
              </div>
              <div className="admin-stat">
                <div className="admin-stat__number" style={{ color: lowStockCount > 0 ? '#d97706' : 'inherit' }}>{lowStockCount}</div>
                <div className="admin-stat__label">Low Stock (&lt;5)</div>
              </div>
              <div className="admin-stat">
                <div className="admin-stat__number" style={{ color: outOfStockCount > 0 ? '#FF6F61' : 'inherit' }}>{outOfStockCount}</div>
                <div className="admin-stat__label">Out of Stock</div>
              </div>
            </div>

            <div className="admin-actions-bar">
              <div className="admin-search-wrap">
                <span className="admin-search-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </span>
                <input id="inventorySearchQuery" name="inventorySearchQuery"
                  className="admin-search-input"
                  type="text"
                  placeholder="Search by product name or category..."
                  value={inventorySearchQuery}
                  onChange={e => setInventorySearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-products-table-wrapper">
              {(() => {
                const inventoryFiltered = adminProducts.filter(p => {
                  const q = inventorySearchQuery.toLowerCase();
                  return p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q);
                });
                return inventoryFiltered.length === 0 ? (
                  <p className="status-message">No products found in inventory.</p>
                ) : (
                  <table className="admin-products-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Current Stock</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryFiltered.map(p => {
                        const stockVal = parseInt(p.stock) || 0;
                        const stockClass = stockVal === 0 ? 'stock-out' : stockVal < 5 ? 'stock-low' : 'stock-ok';
                        return (
                          <tr key={p.id}>
                            <td>
                              <div className="admin-product-cell">
                                <img className="admin-product-thumb" src={p.images?.[0] || p.image || '/images/hero.png'} alt={p.name} />
                                <span className="admin-product-name">{p.name}</span>
                              </div>
                            </td>
                            <td>{p.category}</td>
                            <td style={{ fontWeight: '600' }}>₹{p.price?.toLocaleString('en-IN')}</td>
                            <td>
                              {editingStockId === p.id ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <input id="editingStockValue" name="editingStockValue"
                                    type="number"
                                    min="0"
                                    value={editingStockValue}
                                    onChange={e => setEditingStockValue(e.target.value)}
                                    style={{ width: '80px', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '0.9rem' }}
                                    autoFocus
                                  />
                                  <button className="admin-btn-icon" title="Save" onClick={() => handleStockUpdate(p.id, editingStockValue)}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                  </button>
                                  <button className="admin-btn-icon" title="Cancel" onClick={() => setEditingStockId(null)}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                  </button>
                                </div>
                              ) : (
                                <span className={`inventory-stock-badge ${stockClass}`}>
                                  {stockVal}
                                </span>
                              )}
                            </td>
                            <td>
                              <span className={`admin-status-badge status--${(p.status || 'Active').toLowerCase()}`}>
                                {p.status || 'Active'}
                              </span>
                            </td>
                            <td>
                              <button
                                className="admin-btn-icon"
                                title="Edit stock"
                                onClick={() => { setEditingStockId(p.id); setEditingStockValue(String(stockVal)); }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"/></svg>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                );
              })()}
            </div>
          </>
        )}

        {/* —— OFFERS TAB —— */}
        {adminActiveTab === 'offers' && (
          <>
            <div className="admin-grid" style={{marginBottom: '24px'}}>
              <div className="admin-stat">
                <div className="admin-stat__number">{adminOffers.length}</div>
                <div className="admin-stat__label">Total Offers</div>
              </div>
              <div className="admin-stat">
                <div className="admin-stat__number">{adminOffers.filter(o => o.status === 'Active').length}</div>
                <div className="admin-stat__label">Active Offers</div>
              </div>
              <div className="admin-stat">
                <div className="admin-stat__number">{adminOffers.filter(o => new Date(o.validUntil) < new Date()).length}</div>
                <div className="admin-stat__label">Expired</div>
              </div>
            </div>

            <div className="admin-actions-bar">
              <div></div>
              <button className="primary-btn" onClick={openAddOfferModal}>
                & Create New Offer
              </button>
            </div>

            <div className="admin-products-table-wrapper">
              {adminOffers.length === 0 ? (
                <p className="status-message">No offers created yet. Create your first promotional offer!</p>
              ) : (
                <table className="admin-products-table">
                  <thead>
                    <tr>
                      <th>Offer Title</th>
                      <th>Discount</th>
                      <th>Valid Until</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminOffers.map(o => {
                      const isExpired = new Date(o.validUntil) < new Date();
                      return (
                        <tr key={o.id}>
                          <td>
                            <div>
                              <span style={{fontWeight:'600'}}>{o.title}</span>
                              {o.description && <div style={{fontSize:'0.82rem', color:'var(--text-muted)', marginTop:'2px'}}>{o.description}</div>}
                            </div>
                          </td>
                          <td><span style={{fontWeight:'700', color:'var(--accent)', fontSize:'1.1rem'}}>{o.discountPercentage}%</span></td>
                          <td>
                            <span style={{color: isExpired ? '#FF6F61' : 'inherit'}}>
                              {new Date(o.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              {isExpired && <span style={{fontSize:'0.75rem', display:'block', color:'#FF6F61'}}>Expired</span>}
                            </span>
                          </td>
                          <td>
                            <span className={`admin-status-badge status--${o.status === 'Active' ? 'active' : 'archived'}`}>
                              {o.status}
                            </span>
                          </td>
                          <td>
                            <div className="admin-row-actions">
                              <button className="admin-btn-icon" title="Edit offer" onClick={() => openEditOfferModal(o)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"/></svg>
                              </button>
                              <button className="admin-btn-icon delete" title="Delete offer" onClick={() => setDeleteConfirmOffer(o)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* —— QUERIES TAB —— */}
        {adminActiveTab === 'queries' && (
          <>
            <div className="admin-grid" style={{marginBottom: '24px'}}>
              <div className="admin-stat">
                <div className="admin-stat__number">{adminQueries.length}</div>
                <div className="admin-stat__label">Total Queries</div>
              </div>
              <div className="admin-stat">
                <div className="admin-stat__number" style={{color: adminQueries.filter(q => q.status === 'Open').length > 0 ? '#d97706' : 'inherit'}}>
                  {adminQueries.filter(q => q.status === 'Open').length}
                </div>
                <div className="admin-stat__label">Open</div>
              </div>
              <div className="admin-stat">
                <div className="admin-stat__number" style={{color:'#22c55e'}}>
                  {adminQueries.filter(q => q.status === 'Resolved').length}
                </div>
                <div className="admin-stat__label">Resolved</div>
              </div>
            </div>

            <div className="admin-products-table-wrapper">
              {adminQueries.length === 0 ? (
                <p className="status-message">No customer queries yet.</p>
              ) : (
                <table className="admin-products-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Subject</th>
                      <th>Message</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminQueries.map(q => (
                      <tr key={q.id}>
                        <td>
                          <div>
                            <span style={{fontWeight:'600'}}>{q.name}</span>
                            <div style={{fontSize:'0.82rem', color:'var(--text-muted)'}}>{q.email}</div>
                          </div>
                        </td>
                        <td>{q.subject || '—'}</td>
                        <td>
                          <div style={{maxWidth:'280px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}} title={q.message}>
                            {q.message}
                          </div>
                        </td>
                        <td>{new Date(q.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td>
                          <span className={`admin-status-badge ${q.status === 'Open' ? 'status--draft' : 'status--active'}`}>
                            {q.status}
                          </span>
                        </td>
                        <td>
                          {q.status === 'Open' ? (
                            <button className="admin-btn-icon" title="Mark as resolved" style={{color:'#22c55e'}} onClick={() => handleResolveQuery(q.id)}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </button>
                          ) : (
                            <button className="admin-btn-icon" title="Reopen query" style={{color:'#d97706'}} onClick={() => handleReopenQuery(q.id)}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {adminActiveTab === 'orders' && (
          <>
            <div className="admin-grid" style={{marginBottom: '24px'}}>
              <div className="admin-stat">
                <div className="admin-stat__number">{adminOrders.length}</div>
                <div className="admin-stat__label">Total Orders</div>
              </div>
              <div className="admin-stat">
                <div className="admin-stat__number" style={{color:'#d97706'}}>{adminOrders.filter(o => o.status === 'Payment Verification').length}</div>
                <div className="admin-stat__label">Awaiting Verification</div>
              </div>
              <div className="admin-stat">
                <div className="admin-stat__number" style={{color:'#22c55e'}}>{adminOrders.filter(o => o.status === 'Delivered').length}</div>
                <div className="admin-stat__label">Delivered</div>
              </div>
              <div className="admin-stat">
                <div className="admin-stat__number" style={{color:'var(--gold)'}}>&#8377;{adminOrders.reduce((s, o) => s + (o.totalAmount || 0), 0).toLocaleString('en-IN')}</div>
                <div className="admin-stat__label">Total Revenue</div>
              </div>
            </div>
            <div className="admin-products-table-wrapper">
              {adminOrders.length === 0 ? (
                <p className="status-message">No orders placed yet. Orders will appear here once customers checkout.</p>
              ) : (
                <table className="admin-products-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminOrders.map(o => {
                      const statusMap = { 'Payment Verification': 'status--draft', 'Packing': 'status--draft', 'On the way': 'status--active', 'Delivered': 'status--active', 'Cancelled': 'status--archived' };
                      return (
                        <tr key={o.orderId}>
                          <td><span style={{fontFamily:'monospace', fontWeight:'700'}}>#{o.orderId}</span></td>
                          <td>
                            <div style={{fontWeight:'600'}}>{o.customerName}</div>
                            <div style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>{o.userEmail}</div>
                            {/* Show ordered items with selected color images */}
                            {Array.isArray(o.items) && o.items.length > 0 && (
                              <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {o.items.map((item, iIdx) => {
                                  const itemImg = item.selectedImage || item.image;
                                  return (
                                    <div key={iIdx} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'var(--bg-secondary)', borderRadius: '6px', padding: '4px 8px', border: '1px solid var(--border)', fontSize: '0.75rem' }}>
                                      {itemImg && <img src={itemImg} alt={item.name} style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} />}
                                      <div>
                                        <div style={{ fontWeight: '600', whiteSpace: 'nowrap', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                                        <div style={{ color: 'var(--text-muted)' }}>Qty: {item.quantity}</div>
                                        {item.selectedImage && item.images && item.images.length > 1 && (
                                          <div style={{ color: 'var(--gold)', fontWeight: '700', fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.35857 19.5 5.5 20 5.5 20.5C5.5 21.3284 6.17157 22 7 22H12Z"/><circle cx="7.5" cy="10.5" r="1.5"/><circle cx="11.5" cy="7.5" r="1.5"/><circle cx="16.5" cy="9.5" r="1.5"/><circle cx="15.5" cy="14.5" r="1.5"/></svg> Color variant
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </td>
                          <td>{new Date(o.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</td>
                          <td style={{fontWeight:'700', color:'var(--gold)'}}>&#8377;{(o.totalAmount || 0).toLocaleString('en-IN')}</td>
                          <td><span className={`admin-status-badge ${statusMap[o.status] || 'status--draft'}`}>{o.status}</span></td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {o.paymentStatus === 'Paid' && (
                                <button
                                  onClick={() => setSelectedInvoiceOrder(o)}
                                  className="secondary-btn"
                                  style={{ padding: '4px 8px', fontSize: '0.75rem', marginBottom: '4px', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> View Invoice
                                </button>
                              )}
                              <select
                                value={o.status}
                                onChange={async (ev) => {
                                  const newStatus = ev.target.value;
                                  setAdminOrders(prev => prev.map(ord => ord.orderId === o.orderId ? { ...ord, status: newStatus } : ord));
                                  if (newStatus !== 'On the way' && newStatus !== 'Packing' && newStatus !== 'Delivered') {
                                    try {
                                      await fetch(`/api/admin/orders/${o.orderId}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
                                        body: JSON.stringify({ status: newStatus })
                                      });
                                      addToast('Order status updated.', 'success');
                                    } catch { addToast('Failed to update status.', 'error'); }
                                  }
                                }}
                                style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: '0.85rem', cursor: 'pointer', width: '100%' }}
                              >
                                {['Payment Verification','Packing','On the way','Delivered','Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                              
                              {(o.status === 'Packing' || o.status === 'On the way' || o.status === 'Delivered') && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'var(--bg-secondary)', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', marginTop: '4px' }}>
                                  <input 
                                    type="text" 
                                    placeholder="Courier Name (e.g. DTDC)" 
                                    defaultValue={o.courierName || ''}
                                    id={`courier-name-${o.orderId}`}
                                    style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', width: '100%' }}
                                  />
                                  <input 
                                    type="text" 
                                    placeholder="Tracking ID" 
                                    defaultValue={o.courierTrackingId || ''}
                                    id={`courier-track-${o.orderId}`}
                                    style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', width: '100%' }}
                                  />
                                  <button 
                                    type="button"
                                    className="primary-btn"
                                    style={{ padding: '4px 8px', fontSize: '0.72rem', alignSelf: 'flex-end', marginTop: '2px', height: 'auto', width: 'auto' }}
                                    onClick={async () => {
                                      const cName = document.getElementById(`courier-name-${o.orderId}`).value.trim();
                                      const cTrack = document.getElementById(`courier-track-${o.orderId}`).value.trim();
                                      try {
                                        const r = await fetch(`/api/admin/orders/${o.orderId}`, {
                                          method: 'PUT',
                                          headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
                                          body: JSON.stringify({ status: o.status, courierName: cName, courierTrackingId: cTrack })
                                        });
                                        if (r.ok) {
                                          setAdminOrders(prev => prev.map(ord => ord.orderId === o.orderId ? { ...ord, courierName: cName, courierTrackingId: cTrack } : ord));
                                          addToast('Courier tracking info saved.', 'success');
                                        }
                                      } catch { addToast('Failed to save tracking.', 'error'); }
                                    }}
                                  >
                                    Save Info
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
        {adminActiveTab === 'canceledOrders' && (
          <div className="admin-products-table-wrapper">
            <table className="admin-products-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {adminOrders.filter(o => o.status === 'Cancelled').length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No canceled orders found.</td></tr>
                ) : (
                  adminOrders.filter(o => o.status === 'Cancelled').map(o => (
                    <tr key={o._id || o.orderId}>
                      <td style={{ fontWeight: '600' }}>#{o.orderId}</td>
                      <td>{o.customerName}<br/><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{o.userEmail}</span></td>
                      <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td>₹{o.totalAmount?.toLocaleString('en-IN')}</td>
                      <td><span className="admin-status-badge archived" style={{background: 'rgba(255, 111, 97,0.12)', color: '#FF6F61'}}>Cancelled</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {adminActiveTab === 'returns' && (
          <div className="admin-products-table-wrapper">
            <table className="admin-products-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Reason</th>
                  <th>Request Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {adminReturns.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No replacement/return requests found.</td></tr>
                ) : (
                  adminReturns.map(r => (
                    <tr key={r._id}>
                      <td style={{ fontWeight: '600' }}>#{r.orderId}</td>
                      <td>{r.reason}</td>
                      <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`admin-status-badge ${r.status === 'Pending' ? 'draft' : r.status === 'Approved' ? 'active' : 'archived'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        {r.status === 'Pending' && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="primary-btn" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={async () => {
                              try {
                                const res = await fetch(`/api/admin/returns/${r._id}/status`, {
                                  method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
                                  body: JSON.stringify({ status: 'Approved' })
                                });
                                if (res.ok) fetchAdminReturns(adminToken);
                              } catch(e) {}
                            }}>Approve</button>
                            <button className="secondary-btn" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={async () => {
                              try {
                                const res = await fetch(`/api/admin/returns/${r._id}/status`, {
                                  method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
                                  body: JSON.stringify({ status: 'Rejected' })
                                });
                                if (res.ok) fetchAdminReturns(adminToken);
                              } catch(e) {}
                            }}>Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {adminActiveTab === 'reviews' && (
          <div className="admin-products-table-wrapper">
            <table className="admin-products-table">
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {adminReviews.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No reviews found.</td></tr>
                ) : (
                  adminReviews.map(r => (
                    <tr key={r._id}>
                      <td style={{ fontWeight: '600' }}>{r.productId}</td>
                      <td>{r.userEmail}</td>
                      <td><span style={{ color: '#eab308' }}>{'★'.repeat(r.rating)}</span></td>
                      <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.comment || '-'}</td>
                      <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className="icon-btn delete-btn" title="Delete Review" onClick={async () => {
                          if(confirm('Are you sure you want to delete this review?')) {
                            try {
                              const res = await fetch(`/api/admin/reviews/${r._id}`, {
                                method: 'DELETE', headers: { 'x-admin-token': adminToken }
                              });
                              if (res.ok) fetchAdminReviews(adminToken);
                            } catch(e) {}
                          }
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {adminActiveTab === 'customers' && (
          <>
            <div className="admin-grid" style={{marginBottom: '24px'}}>
              <div className="admin-stat">
                <div className="admin-stat__number">{adminCustomers.length}</div>
                <div className="admin-stat__label">Total Customers</div>
              </div>
              <div className="admin-stat">
                <div className="admin-stat__number" style={{color:'var(--gold)'}}>&#8377;{adminCustomers.reduce((s, c) => s + (c.totalSpent || 0), 0).toLocaleString('en-IN')}</div>
                <div className="admin-stat__label">Total Revenue</div>
              </div>
            </div>
            <div className="admin-products-table-wrapper">
              {adminCustomers.length === 0 ? (
                <p className="status-message">No registered customers yet. Customers will appear here once they sign up.</p>
              ) : (
                <table className="admin-products-table">
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Email</th>
                      <th>Mobile</th>
                      <th>Total Spent</th>
                      <th>Wishlist</th>
                      <th>Cart</th>
                      <th>Join Date</th>
                      <th style={{textAlign:'right'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminCustomers.map(c => (
                      <tr key={c.email}>
                        <td><div style={{fontWeight:'600'}}>{c.name}</div></td>
                        <td style={{color:'var(--text-muted)'}}>{c.email}</td>
                        <td>{c.mobile || '—'}</td>
                        <td style={{fontWeight:'600', color:'var(--gold)'}}>&#8377;{(c.totalSpent || 0).toLocaleString('en-IN')}</td>
                        <td>{(c.wishlist || []).length} items</td>
                        <td>{(c.cart || []).length} items</td>
                        <td>{new Date(c.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</td>
                        <td style={{textAlign:'right'}}>
                          <button className="primary-btn" style={{padding:'4px 10px', fontSize:'0.85rem'}} onClick={() => setSelectedAdminCustomer(c)}>View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* CUSTOMER DETAILS MODAL */}
        {selectedAdminCustomer && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-card" style={{ maxWidth: '850px', width: '90%' }}>
              <div className="admin-modal-header">
                <h3 className="admin-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Customer Profile: {selectedAdminCustomer.name}</h3>
                <button className="modal-close" onClick={() => setSelectedAdminCustomer(null)}>✕</button>
              </div>
              <div className="admin-modal-body" style={{ maxHeight: '75vh', overflowY: 'auto', padding: '24px' }}>
                
                {/* Profile Grid Info */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Email Address</div>
                    <div style={{ fontWeight: '600', marginTop: '4px', fontSize: '0.92rem', wordBreak: 'break-all' }}>{selectedAdminCustomer.email}</div>
                  </div>
                  <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Phone Number</div>
                    <div style={{ fontWeight: '600', marginTop: '4px', fontSize: '0.92rem' }}>{selectedAdminCustomer.mobile || 'N/A'}</div>
                  </div>
                  <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Default Address</div>
                    <div style={{ fontWeight: '500', marginTop: '4px', fontSize: '0.88rem' }}>{selectedAdminCustomer.address || 'No address added'}</div>
                  </div>
                  <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Total Purchases</div>
                    <div style={{ fontWeight: '700', marginTop: '4px', fontSize: '1.1rem', color: 'var(--gold)' }}>₹{(selectedAdminCustomer.totalSpent || 0).toLocaleString('en-IN')}</div>
                  </div>
                </div>
                
                {/* Wishlist Section */}
                <div style={{ marginBottom: '30px' }}>
                  <h4 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#FF6F61' }}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Wishlist Items ({selectedAdminCustomer.wishlist?.length || 0})
                  </h4>
                  {selectedAdminCustomer.wishlist?.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                      {selectedAdminCustomer.wishlist.map(id => {
                        const p = products.find(prod => prod.id === id || prod._id === id);
                        const displayImg = p?.images?.[0] || p?.image || '/images/hero.png';
                        return (
                          <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <img src={displayImg} alt={p ? p.name : id} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: '600', fontSize: '0.86rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p ? p.name : 'Unknown Product'}</div>
                              <div style={{ color: 'var(--gold)', fontSize: '0.82rem', fontWeight: '700', marginTop: '2px' }}>{p ? `₹${p.price.toLocaleString('en-IN')}` : '—'}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No items in wishlist.</p>}
                </div>

                {/* Cart Section */}
                <div style={{ marginBottom: '30px' }}>
                  <h4 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> Active Shopping Cart ({selectedAdminCustomer.cart?.length || 0})
                  </h4>
                  {selectedAdminCustomer.cart?.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                      {selectedAdminCustomer.cart.map((item, idx) => {
                        const p = products.find(prod => prod.id === item.productId || prod._id === item.productId);
                        const displayImg = item.selectedImage || item.image || p?.images?.[0] || p?.image || '/images/hero.png';
                        return (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <img src={displayImg} alt={p ? p.name : item.productId} style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: '600', fontSize: '0.86rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p ? p.name : 'Unknown Product'}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Qty: {item.quantity}</div>
                              {item.selectedImage && (
                                <div style={{ fontSize: '0.72rem', color: 'var(--gold)', fontWeight: '700', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.35857 19.5 5.5 20 5.5 20.5C5.5 21.3284 6.17157 22 7 22H12Z"/><circle cx="7.5" cy="10.5" r="1.5"/><circle cx="11.5" cy="7.5" r="1.5"/><circle cx="16.5" cy="9.5" r="1.5"/><circle cx="15.5" cy="14.5" r="1.5"/></svg> Color variant
                                </div>
                              )}
                              <div style={{ color: 'var(--gold)', fontSize: '0.82rem', fontWeight: '700', marginTop: '2px' }}>{p ? `₹${(p.price * item.quantity).toLocaleString('en-IN')}` : '—'}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Cart is empty.</p>}
                </div>

                {/* Orders Section */}
                <div>
                  <h4 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><polygon points="12 22.08 12 12 3 6.92 3 17.08 12 22.08"/><polygon points="12 22.08 12 12 21 6.92 21 17.08 12 22.08"/><polygon points="12 12 3 6.92 12 1.84 21 6.92 12 12"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> Purchase History ({adminOrders.filter(o => o.userEmail === selectedAdminCustomer.email).length})
                  </h4>
                  {adminOrders.filter(o => o.userEmail === selectedAdminCustomer.email).length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {adminOrders.filter(o => o.userEmail === selectedAdminCustomer.email).map(order => (
                        <div key={order.orderId} style={{ background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border)', padding: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '10px' }}>
                            <div>
                              <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Order #{order.orderId}</span>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '10px' }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '12px', background: 'var(--gold-bg-strong)', color: 'var(--gold)', fontWeight: 'bold' }}>{order.status}</span>
                              <span style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--gold)' }}>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                          {/* Order items with thumbnails */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {order.items.map((it, oIdx) => {
                              const itImg = it.selectedImage || it.image || '/images/hero.png';
                              return (
                                <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-primary)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                                  <img src={itImg} alt={it.name} style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} />
                                  <div style={{ fontSize: '0.78rem' }}>
                                    <div style={{ fontWeight: '600' }}>{it.name}</div>
                                    <div style={{ color: 'var(--text-muted)' }}>Qty: {it.quantity}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No orders placed yet.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {adminActiveTab === 'shipping' && (
          <>
            <div className="admin-actions-bar" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
              <button className="primary-btn" onClick={() => {
                setEditingShipping(null);
                setShippingProviderName('');
                setShippingCharge('');
                setShippingIsActive(true);
                setShippingFormOpen(true);
              }}>+ Add Shipping Method</button>
            </div>
            <div className="admin-products-table-wrapper">
              {adminShipping.length === 0 ? (
                <p className="status-message">No shipping methods configured.</p>
              ) : (
                <table className="admin-products-table">
                  <thead>
                    <tr>
                      <th>Provider Name</th>
                      <th>Shipping Charge</th>
                      <th>Status</th>
                      <th style={{textAlign: 'right'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminShipping.map(method => (
                      <tr key={method._id || method.id}>
                        <td>{method.providerName}</td>
                        <td>₹{method.shippingCharge}</td>
                        <td>
                          <button 
                            onClick={() => toggleShippingStatus(method._id || method.id)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '12px',
                              border: 'none',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                              background: method.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(255, 111, 97,0.15)',
                              color: method.isActive ? '#22c55e' : '#FF6F61'
                            }}
                          >
                            {method.isActive ? 'Active' : 'Disabled'}
                          </button>
                        </td>
                        <td style={{textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                          <button 
                            className="secondary-btn" 
                            style={{padding: '4px 10px', fontSize: '0.85rem'}}
                            onClick={() => {
                              setEditingShipping(method);
                              setShippingProviderName(method.providerName);
                              setShippingCharge(method.shippingCharge.toString());
                              setShippingIsActive(method.isActive);
                              setShippingFormOpen(true);
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            className="primary-btn" 
                            style={{padding: '4px 10px', fontSize: '0.85rem', background: '#FF6F61', borderColor: '#FF6F61'}}
                            onClick={() => setDeleteConfirmShipping(method)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Delete Confirmation Modal for Shipping */}
            {deleteConfirmShipping && (
              <div className="admin-modal-overlay" style={{ zIndex: 1200 }}>
                <div className="admin-modal-card" style={{ maxWidth: '400px', textAlign: 'center', padding: '30px' }}>
                  <h3 style={{ color: '#FF6F61', marginBottom: '15px' }}>Confirm Deletion</h3>
                  <p style={{ marginBottom: '25px', color: 'var(--text-primary)' }}>
                    Are you sure you want to delete the shipping method <strong>{deleteConfirmShipping.providerName}</strong>?
                  </p>
                  <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <button className="secondary-btn" onClick={() => setDeleteConfirmShipping(null)}>Cancel</button>
                    <button className="primary-btn" style={{ background: '#FF6F61', borderColor: '#FF6F61' }} onClick={() => deleteShippingMethod(deleteConfirmShipping._id || deleteConfirmShipping.id)}>
                      Yes, Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Form Modal */}
            {shippingFormOpen && (
              <div className="admin-modal-overlay" style={{ zIndex: 1100 }}>
                <div className="admin-modal-card" style={{ maxWidth: '500px' }}>
                  <div className="admin-modal-header">
                    <h3>{editingShipping ? 'Edit Shipping Method' : 'Add Shipping Method'}</h3>
                    <button className="modal-close" onClick={() => setShippingFormOpen(false)}>✕</button>
                  </div>
                  <form onSubmit={handleShippingSubmit}>
                    <div className="admin-modal-body">
                      <div className="admin-form-group">
                        <label>Provider Name *</label>
                        <input id="shippingProviderName" name="shippingProviderName"
                          type="text"
                          required
                          value={shippingProviderName}
                          onChange={e => setShippingProviderName(e.target.value)}
                          placeholder="e.g. ST Couriers"
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Shipping Charge (₹) *</label>
                        <input id="shippingCharge" name="shippingCharge"
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={shippingCharge}
                          onChange={e => setShippingCharge(e.target.value)}
                          placeholder="e.g. 150"
                        />
                      </div>
                      <div className="admin-form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                        <input name="shippingIsActive"
                          type="checkbox"
                          checked={shippingIsActive}
                          onChange={e => setShippingIsActive(e.target.checked)}
                          id="shipping-active"
                          style={{ width: 'auto' }}
                        />
                        <label htmlFor="shipping-active" style={{ marginBottom: 0 }}>Active (Available at checkout)</label>
                      </div>
                    </div>
                    <div className="admin-modal-footer">
                      <button type="button" className="secondary-btn" onClick={() => setShippingFormOpen(false)}>Cancel</button>
                      <button type="submit" className="primary-btn">Save</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

        {adminActiveTab === 'siteSettings' && (
          <div className="admin-card" style={{ maxWidth: '800px', margin: '0 auto 40px auto' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Edit Homepage Hero & Sale Banner
            </h3>
            <form onSubmit={handleSiteSettingsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* --- HERO SECTION SETTINGS --- */}
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
                <h4 style={{ color: 'var(--gold)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Hero Section Settings
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="admin-form-group">
                    <label>Hero Eyebrow</label>
                    <input type="text" name="heroEyebrow" defaultValue={siteSettings?.heroEyebrow || 'Timeless · Elegant · Royal'} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-primary)', width: '100%' }} />
                  </div>
                  <div className="admin-form-group">
                    <label>Hero Title (HTML supported)</label>
                    <input type="text" name="heroTitle" defaultValue={siteSettings?.heroTitle || 'Crafted for <span>Royalty,</span><br />Made for You.'} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-primary)', width: '100%' }} />
                  </div>
                </div>
                <div className="admin-form-group" style={{ marginTop: '15px' }}>
                  <label>Hero Description</label>
                  <textarea name="heroDescription" rows={3} defaultValue={siteSettings?.heroDescription || 'Discover our premium collection of handcrafted earrings, wood engravings & exquisite key chains — where tradition meets luxury.'} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-primary)', width: '100%', resize: 'vertical' }}></textarea>
                </div>
                <div className="admin-form-group" style={{ marginTop: '15px' }}>
                  <label>Hero Images</label>
                  <ImageArrayUpload name="heroClassicImage" initialImages={siteSettings?.heroClassicImage || ['/images/hero-classic.png']} />
                </div>
              </div>

              {/* --- OFFER BANNER SETTINGS --- */}
              <div style={{ paddingBottom: '20px' }}>
                <h4 style={{ color: 'var(--gold)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Offer Banner Settings
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="admin-form-group">
                    <label>Banner Enabled</label>
                    <select name="bannerEnabled" defaultValue={siteSettings?.bannerEnabled !== false ? 'true' : 'false'} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-primary)', width: '100%' }}>
                      <option value="true">Enabled</option>
                      <option value="false">Disabled</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Banner Title</label>
                    <input type="text" name="bannerTitle" defaultValue={siteSettings?.bannerTitle || 'Royal Collection Sale'} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-primary)', width: '100%' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                  <div className="admin-form-group">
                    <label>Banner Discount Text (e.g. 15% OFF, empty for fallback)</label>
                    <input type="text" name="bannerDiscount" defaultValue={siteSettings?.bannerDiscount || ''} placeholder="Leave empty to use active db offers or 15% OFF fallback" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-primary)', width: '100%' }} />
                  </div>
                  <div className="admin-form-group">
                    <label>Banner Badge Text</label>
                    <input type="text" name="bannerExtraDiscount" defaultValue={siteSettings?.bannerExtraDiscount || 'Limited Time Only'} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-primary)', width: '100%' }} />
                  </div>
                </div>
                <div className="admin-form-group" style={{ marginTop: '15px' }}>
                  <label>Banner Description</label>
                  <textarea name="bannerDescription" rows={3} defaultValue={siteSettings?.bannerDescription || 'Discover exquisite craftsmanship at unprecedented prices. Elevate your elegance today.'} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-primary)', width: '100%', resize: 'vertical' }}></textarea>
                </div>
                <div className="admin-form-group" style={{ marginTop: '15px' }}>
                  <label>Images</label>
                  <ImageArrayUpload name="bannerImageClassic" initialImages={siteSettings?.bannerImageClassic || ['/images/offer_classic.png']} />
                </div>
              </div>

              {/* --- ABOUT US & CONTACT SETTINGS --- */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', paddingBottom: '20px' }}>
                <h4 style={{ color: 'var(--gold)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  About Us & Contact Settings
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                  <div className="admin-form-group">
                    <label>About Us Title (HTML supported)</label>
                    <input type="text" name="aboutTitle" defaultValue={siteSettings?.aboutTitle || 'Where Tradition<br/>Meets <span class="gold-text">Elegance</span>'} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-primary)', width: '100%' }} />
                  </div>
                  <div className="admin-form-group">
                    <label>About Us Description</label>
                    <textarea name="aboutDescription" rows={4} defaultValue={siteSettings?.aboutDescription || 'Born from a passion for timeless artistry, Parisu Ulagam is a celebration of heritage craftsmanship and modern luxury. Every piece in our collection tells a story — of skilled artisans, precious materials, and designs that transcend generations.'} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-primary)', width: '100%', resize: 'vertical' }}></textarea>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                  <div className="admin-form-group">
                    <label>Contact Phone Number</label>
                    <input type="text" name="contactPhone" defaultValue={siteSettings?.contactPhone || '+91 94883 16728'} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-primary)', width: '100%' }} />
                  </div>
                  <div className="admin-form-group">
                    <label>Contact Email</label>
                    <input type="text" name="contactEmail" defaultValue={siteSettings?.contactEmail || 'thesmgroups@gmail.com'} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-primary)', width: '100%' }} />
                  </div>
                </div>
                <div className="admin-form-group" style={{ marginTop: '15px' }}>
                  <label>Contact Address (HTML / Linebreaks supported)</label>
                  <textarea name="contactAddress" rows={2} defaultValue={siteSettings?.contactAddress || 'IInd Floor, OM Shiva Towers, 259-B,<br/>Advaitha Ashram Rd, Fairlands, Salem - 636004'} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-primary)', width: '100%', resize: 'vertical' }}></textarea>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                  <div className="admin-form-group">
                    <label>About Us Accent Number (e.g. 5+)</label>
                    <input type="text" name="aboutAccentNum" defaultValue={siteSettings?.aboutAccentNum || '5+'} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-primary)', width: '100%' }} />
                  </div>
                  <div className="admin-form-group">
                    <label>About Us Accent Label (e.g. Years of Craftsmanship)</label>
                    <input type="text" name="aboutAccentLabel" defaultValue={siteSettings?.aboutAccentLabel || 'Years of Craftsmanship'} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-primary)', width: '100%' }} />
                  </div>
                </div>
                <div className="admin-form-group" style={{ marginTop: '15px' }}>
                  <label>About Us Main Image</label>
                  <ImageArrayUpload name="aboutImage" initialImages={siteSettings?.aboutImage || ['/images/toy-classic.png']} />
                </div>
              </div>

              <button type="submit" className="primary-btn" style={{ alignSelf: 'flex-start', padding: '12px 30px' }}>
                Save Settings
              </button>
            </form>
          </div>
        )}

        {/* —— COUPONS TAB —— */}
        {adminActiveTab === 'coupons' && (
          <CouponsAdmin adminToken={adminToken} products={adminProducts} addToast={addToast} />
        )}

        {/* —— CUSTOM REQUESTS TAB —— */}
        {adminActiveTab === 'customRequests' && (
          <>
            <div className="admin-grid" style={{ marginBottom: '24px' }}>
              <div className="admin-stat">
                <div className="admin-stat__number">{adminCustomRequests.length}</div>
                <div className="admin-stat__label">Total Requests</div>
              </div>
              <div className="admin-stat">
                <div className="admin-stat__number" style={{ color: '#d97706' }}>
                  {adminCustomRequests.filter(r => r.status === 'Pending').length}
                </div>
                <div className="admin-stat__label">Pending</div>
              </div>
              <div className="admin-stat">
                <div className="admin-stat__number" style={{ color: '#2563eb' }}>
                  {adminCustomRequests.filter(r => r.status === 'Processing').length}
                </div>
                <div className="admin-stat__label">Processing</div>
              </div>
              <div className="admin-stat">
                <div className="admin-stat__number" style={{ color: '#059669' }}>
                  {adminCustomRequests.filter(r => r.status === 'Completed').length}
                </div>
                <div className="admin-stat__label">Completed</div>
              </div>
            </div>
            <div className="admin-products-table-wrapper">
              {adminCustomRequests.length === 0 ? (
                <p className="status-message">No custom requests yet.</p>
              ) : (
                <table className="admin-products-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Product Type</th>
                      <th>Description</th>
                      <th>Images</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminCustomRequests.map(req => (
                      <tr key={req._id}>
                        <td>
                          <div style={{ fontWeight: '600' }}>{req.customerName}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{req.customerEmail}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{req.customerPhone}</div>
                        </td>
                        <td><span style={{ background: 'var(--gold-bg-strong)', color: 'var(--gold)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>{req.productType}</span></td>
                        <td style={{ maxWidth: '200px', fontSize: '0.85rem', color: 'var(--text-muted)', wordBreak: 'break-word' }}>{req.description}</td>
                        <td>
                          {req.referenceImages?.length > 0 ? (
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {req.referenceImages.map((img, i) => (
                                <img key={i} src={img} alt="Ref" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => window.open(img, '_blank')} />
                              ))}
                            </div>
                          ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No images</span>}
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {new Date(req.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td>
                          <span style={{
                            fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', color: '#fff',
                            background: req.status === 'Completed' ? '#059669' : req.status === 'Cancelled' ? '#dc2626' : req.status === 'Processing' ? '#2563eb' : req.status === 'Reviewed' ? '#7c3aed' : '#d97706'
                          }}>
                            {req.status}
                          </span>
                        </td>
                        <td>
                          <select
                            value={req.status}
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              try {
                                const r = await fetch(`/api/admin/custom-requests/${req._id}/status`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
                                  body: JSON.stringify({ status: newStatus })
                                });
                                if (r.ok) {
                                  fetchAdminCustomRequests();
                                }
                              } catch (err) {
                                console.error('Failed to update status:', err);
                              }
                            }}
                            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.82rem' }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Reviewed">Reviewed</option>
                            <option value="Processing">Processing</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        </div>
      </main>

        {/* —— PRODUCT FORM MODAL (Add / Edit) —— */}
        {adminFormOpen && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-card">
              <div className="admin-modal-header">
                <h3>{editingProduct ? 'Edit Catalog Product' : 'Add New Product to Catalog'}</h3>
                <button className="modal-close" onClick={() => setAdminFormOpen(false)}>✕</button>
              </div>

              <form onSubmit={handleFormSubmit}>
                <div className="admin-modal-body">
                  <div className="admin-form-grid">
                    {/* Name */}
                    <div className="admin-form-group full-width">
                      <label htmlFor="form-name">Product Name *</label>
                      <input
                        id="form-name"
                        type="text"
                        value={formName}
                        onChange={e => setFormName(e.target.value)}
                        required
                        placeholder="e.g. Royal Emerald Pearl Earrings"
                      />
                    </div>

                    {/* Category */}
                    <div className="admin-form-group">
                      <label htmlFor="form-category">Category *</label>
                      <select
                        id="form-category"
                        value={formCategory || (categories[0]?.id || 'Earrings')}
                        onChange={e => setFormCategory(e.target.value)}
                        required
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Collection */}
                    <div className="admin-form-group">
                      <label htmlFor="form-collection">Collection</label>
                      <select
                        id="form-collection"
                        value={formCollection}
                        onChange={e => setFormCollection(e.target.value)}
                        style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '10px', borderRadius: '6px', color: 'var(--text-primary)', width: '100%' }}
                      >
                        <option value="">None / Default</option>
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Kids">Kids</option>
                        <option value="Unisex & Couples">Unisex & Couples</option>
                        <option value="Custom & Corporate">Custom & Corporate</option>
                      </select>
                    </div>

                    {/* Brand */}
                    <div className="admin-form-group">
                      <label htmlFor="form-brand">Brand</label>
                      <input
                        id="form-brand"
                        type="text"
                        value={formBrand}
                        onChange={e => setFormBrand(e.target.value)}
                        placeholder="e.g. Parisu Ulagam"
                      />
                    </div>

                    {/* Status */}
                    <div className="admin-form-group">
                      <label htmlFor="form-status">Display Status *</label>
                      <select
                        id="form-status"
                        value={formStatus}
                        onChange={e => setFormStatus(e.target.value)}
                        required
                      >
                        <option value="Active">Active (Visible to public)</option>
                        <option value="Draft">Draft (Internal review)</option>
                        <option value="Archived">Archived (Hidden)</option>
                      </select>
                    </div>

                    {/* Price */}
                    <div className="admin-form-group">
                      <label htmlFor="form-price">Price (₹) *</label>
                      <input
                        id="form-price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formPrice}
                        onChange={e => setFormPrice(e.target.value)}
                        required
                        placeholder="Price in INR"
                      />
                    </div>

                    {/* Shipping Charge */}
                    <div className="admin-form-group">
                      <label htmlFor="form-shipping-charge">Shipping Charge (₹)</label>
                      <input
                        id="form-shipping-charge"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formShippingCharge}
                        onChange={e => setFormShippingCharge(e.target.value)}
                        placeholder="Additional shipping fee for this product"
                      />
                    </div>

                    {/* Stock */}
                    <div className="admin-form-group">
                      <label htmlFor="form-stock">Stock Quantity</label>
                      <input
                        id="form-stock"
                        type="number"
                        min="0"
                        value={formStock}
                        onChange={e => setFormStock(e.target.value)}
                        placeholder="Available quantity"
                      />
                    </div>

                    {/* Badge */}
                    <div className="admin-form-group">
                      <label htmlFor="form-badge">Promotional Badge</label>
                      <input
                        id="form-badge"
                        type="text"
                        value={formBadge}
                        onChange={e => setFormBadge(e.target.value)}
                        placeholder="e.g. Limited, Best Seller, New"
                      />
                    </div>

                    {/* Badge Class */}
                    <div className="admin-form-group">
                      <label htmlFor="form-badge-class">Badge Theme</label>
                      <select
                        id="form-badge-class"
                        value={formBadgeClass}
                        onChange={e => setFormBadgeClass(e.target.value)}
                      >
                        <option value="new">New (Blue)</option>
                        <option value="bestseller">Best Seller (Gold)</option>
                        <option value="limited">Limited (Orange)</option>
                        <option value="instock">In Stock (Green)</option>
                      </select>
                    </div>

                    {/* Applied Offer */}
                    <div className="admin-form-group">
                      <label htmlFor="form-offer">Apply Offer / Discount</label>
                      <select
                        id="form-offer"
                        value={formOfferId}
                        onChange={e => {
                          const oId = e.target.value;
                          setFormOfferId(oId);
                          const matchingOffer = adminOffers.find(o => o.id === oId);
                          setFormDiscountPercentage(matchingOffer ? matchingOffer.discountPercentage : 0);
                        }}
                      >
                        <option value="">No Active Offer</option>
                        {adminOffers.map(o => (
                          <option key={o.id} value={o.id}>
                            {o.title} ({o.discountPercentage}%)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Description */}
                    <div className="admin-form-group full-width">
                      <label htmlFor="form-desc">Product Description</label>
                      <textarea
                        id="form-desc"
                        value={formDescription}
                        onChange={e => setFormDescription(e.target.value)}
                        placeholder="Write a compelling story or details about the product..."
                      />
                    </div>

                    {/* Specifications */}
                    <div className="admin-form-group full-width">
                      <label htmlFor="form-specs">Specifications / Dimensions</label>
                      <textarea
                        id="form-specs"
                        value={formSpecifications}
                        placeholder="e.g. Material: Gold plated, Pearl type: Freshwater, Size: 2cm x 1cm"
                        onChange={e => setFormSpecifications(e.target.value)}
                      />
                    </div>

                    {/* Multi-Image File Upload Zone */}
                    <div className="admin-form-group full-width">
                      <label>Product Images</label>
                      <div
                        className="admin-image-upload-dropzone"
                        onClick={() => document.getElementById('admin-image-input').click()}
                      >
                        <div className="upload-icon">📤</div>
                        <div className="upload-text">Click to choose or drag images here</div>
                        <div className="upload-hint">Supports JPEG, PNG, WEBP, GIF up to 5MB</div>
                        <input
                          id="admin-image-input"
                          type="file"
                          multiple
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={handleImageFileChange}
                        />
                      </div>

                      {/* Preview selected and existing images */}
                      {((formExistingImages && formExistingImages.length > 0) || formImages.length > 0) && (
                        <div className="admin-image-previews">
                          {/* Existing images */}
                          {formExistingImages.map((imgUrl, idx) => (
                            <div key={`exist-${idx}`} className="admin-image-preview-item">
                              <img className="admin-image-preview-img" src={imgUrl} alt="Existing Preview" />
                              <button
                                type="button"
                                className="admin-image-remove-btn"
                                onClick={() => removeExistingImage(idx)}
                              >
                                
                              </button>
                            </div>
                          ))}

                          {/* New images preview */}
                          {formImages.map((file, idx) => {
                            const objectUrl = URL.createObjectURL(file);
                            return (
                              <div key={`new-${idx}`} className="admin-image-preview-item">
                                <img className="admin-image-preview-img" src={objectUrl} alt="New Preview" />
                                <button
                                  type="button"
                                  className="admin-image-remove-btn"
                                  onClick={() => removeNewImage(idx)}
                                >
                                  
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="admin-modal-footer">
                  <button type="button" className="secondary-btn" onClick={() => setAdminFormOpen(false)}>
                    <span>Cancel</span>
                  </button>
                  <button type="submit" className="primary-btn">
                    Save Product Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* —— DELETE CONFIRM DIALOG —— */}
        {deleteConfirmProduct && (
          <div className="admin-confirm-overlay">
            <div className="admin-confirm-card">
              <h4>Delete Catalog Product</h4>
              <p>Are you sure you want to permanently delete <strong>{deleteConfirmProduct.name}</strong>? This will remove all associated uploaded assets and cannot be undone.</p>
              <div className="admin-confirm-actions">
                <button className="secondary-btn" onClick={() => setDeleteConfirmProduct(null)}>
                  <span>Keep Product</span>
                </button>
                <button className="primary-btn" style={{ background: '#FF6F61', boxShadow: 'none' }} onClick={() => handleDeleteProduct(deleteConfirmProduct.id)}>
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* —— OFFER FORM MODAL (Add / Edit) —— */}
        {offerFormOpen && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-card" style={{maxWidth:'560px'}}>
              <div className="admin-modal-header">
                <h3>{editingOffer ? 'Edit Offer' : 'Create New Offer'}</h3>
                <button className="modal-close" onClick={() => { setOfferFormOpen(false); resetOfferForm(); }}>✕</button>
              </div>

              <form onSubmit={handleOfferSubmit}>
                <div className="admin-modal-body">
                  <div className="admin-form-grid">
                    <div className="admin-form-group full-width">
                      <label htmlFor="offer-title">Offer Title *</label>
                      <input
                        id="offer-title"
                        type="text"
                        value={offerTitle}
                        onChange={e => setOfferTitle(e.target.value)}
                        required
                        placeholder="e.g. Summer Sale - 20% Off"
                      />
                    </div>

                    <div className="admin-form-group full-width">
                      <label htmlFor="offer-desc">Description</label>
                      <textarea
                        id="offer-desc"
                        value={offerDescription}
                        onChange={e => setOfferDescription(e.target.value)}
                        placeholder="Describe the offer details..."
                      />
                    </div>

                    <div className="admin-form-group">
                      <label htmlFor="offer-discount">Discount (%) *</label>
                      <input
                        id="offer-discount"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={offerDiscount}
                        onChange={e => setOfferDiscount(e.target.value)}
                        required
                        placeholder="e.g. 20"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label htmlFor="offer-valid-until">Valid Until *</label>
                      <input
                        id="offer-valid-until"
                        type="date"
                        value={offerValidUntil}
                        onChange={e => setOfferValidUntil(e.target.value)}
                        required
                      />
                    </div>

                    <div className="admin-form-group">
                      <label htmlFor="offer-status">Status</label>
                      <select
                        id="offer-status"
                        value={offerStatus}
                        onChange={e => setOfferStatus(e.target.value)}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="admin-modal-footer">
                  <button type="button" className="secondary-btn" onClick={() => { setOfferFormOpen(false); resetOfferForm(); }}>
                    <span>Cancel</span>
                  </button>
                  <button type="submit" className="primary-btn">
                    {editingOffer ? 'Save Changes' : 'Create Offer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* —— OFFER DELETE CONFIRM —— */}
        {deleteConfirmOffer && (
          <div className="admin-confirm-overlay">
            <div className="admin-confirm-card">
              <h4>Delete Offer</h4>
              <p>Are you sure you want to permanently delete the offer <strong>{deleteConfirmOffer.title}</strong>? This cannot be undone.</p>
              <div className="admin-confirm-actions">
                <button className="secondary-btn" onClick={() => setDeleteConfirmOffer(null)}>
                  <span>Keep Offer</span>
                </button>
                <button className="primary-btn" style={{ background: '#FF6F61', boxShadow: 'none' }} onClick={() => handleDeleteOffer(deleteConfirmOffer.id)}>
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* —— CATEGORY FORM MODAL (Add / Create) —— */}
        {categoryFormOpen && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-card" style={{maxWidth:'560px'}}>
              <div className="admin-modal-header">
                <h3>{editingCategory ? 'Edit Category' : 'Create New Category'}</h3>
                <button className="modal-close" onClick={() => { setCategoryFormOpen(false); resetCategoryForm(); }}>✕</button>
              </div>

              <form onSubmit={handleCategorySubmit}>
                <div className="admin-modal-body">
                  <div className="admin-form-grid">
                    <div className="admin-form-group full-width">
                      <label htmlFor="category-label">Category Label *</label>
                      <input
                        id="category-label"
                        type="text"
                        value={categoryLabel}
                        onChange={e => setCategoryLabel(e.target.value)}
                        required
                        placeholder="e.g. Wooden Toys or Earrings"
                      />
                    </div>

                    <div className="admin-form-group full-width">
                      <label htmlFor="category-desc">Description</label>
                      <textarea
                        id="category-desc"
                        value={categoryDesc}
                        onChange={e => setCategoryDesc(e.target.value)}
                        placeholder="Describe what items are in this category..."
                      />
                    </div>

                    <div className="admin-form-group full-width">
                      <label htmlFor="category-image">Category Image File</label>
                      <input
                        id="category-image"
                        type="file"
                        accept="image/*"
                        onChange={e => setCategoryImageFile(e.target.files ? e.target.files[0] : null)}
                      />
                    </div>

                    <div className="admin-form-group full-width">
                      <label htmlFor="category-image-url">Or Image URL</label>
                      <input
                        id="category-image-url"
                        type="text"
                        value={categoryImageUrl}
                        onChange={e => setCategoryImageUrl(e.target.value)}
                        placeholder="e.g. /images/keychain.png"
                      />
                    </div>
                  </div>
                </div>

                <div className="admin-modal-footer">
                  <button type="button" className="secondary-btn" onClick={() => { setCategoryFormOpen(false); resetCategoryForm(); }}>
                    <span>Cancel</span>
                  </button>
                  <button type="submit" className="primary-btn">
                    {editingCategory ? 'Save Changes' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* —— CATEGORY DELETE CONFIRM —— */}
        {deleteConfirmCategory && (
          <div className="admin-confirm-overlay">
            <div className="admin-confirm-card">
              <h4>Delete Category</h4>
              <p>Are you sure you want to permanently delete the category <strong>{deleteConfirmCategory.label}</strong>? This cannot be undone.</p>
              <div className="admin-confirm-actions">
                <button className="secondary-btn" onClick={() => setDeleteConfirmCategory(null)}>
                  <span>Keep Category</span>
                </button>
                <button className="primary-btn" style={{ background: '#FF6F61', boxShadow: 'none' }} onClick={() => handleDeleteCategory(deleteConfirmCategory.id)}>
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedInvoiceOrder && (
          <InvoiceView order={selectedInvoiceOrder} onClose={() => setSelectedInvoiceOrder(null)} />
        )}

        <ToastContainer />
      </div>
    );
  }

  /* ═══════════ RENDER ═══════════ */
  return (
    <div className="app-shell">
      {/* —— TOPBAR —— */}

      {/* —— NAVIGATION —— */}
      <nav className="header-nav" aria-label="Primary navigation">
        <div className="brand">
          <div className="brand__logo" aria-hidden="true"><img src="/royal_logo.png" alt="Parisu Ulagam" style={{width:'100%', height:'100%'}}/></div>
          <div>
            <span className="sr-only">Parisu Ulagam</span>
            <div className="brand__name">Parisu Ulagam</div>
            <div className="brand__tag">Royal Living</div>
          </div>
        </div>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen(o => !o)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        {menuOpen && <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />}

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <button
            type="button"
            className="menu-close-btn"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            ✕
          </button>
          <div className="menu-drawer-logo"><img src="/royal_logo.png" alt="Parisu Ulagam" style={{width:'100%', height:'100%', objectFit:'contain'}}/></div>
          <a href="#home" className={activeSection === 'home' ? 'active' : ''} onClick={() => { setActiveSection('home'); setMenuOpen(false); }}>Home</a>
          <a href="#shop" className={activeSection === 'shop' ? 'active' : ''} onClick={() => { setActiveSection('shop'); setMenuOpen(false); }}>Shop</a>
          <a href="#categories" onClick={() => { setMenuOpen(false); document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' }); }}>Collections</a>
          <a href="#about" onClick={() => { setMenuOpen(false); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }}>About Us</a>
          <a href="#contact" onClick={() => { setMenuOpen(false); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}>Contact</a>
          
          <div className="menu-drawer-divider" />
          
          <button
            className="menu-drawer-action-btn"
            onClick={() => {
              setMenuOpen(false);
              if (isAdmin) {
                setShowAdmin(true);
              } else if (currentUser) {
                setProfileMobile(currentUser.mobile || '');
                setProfileAddress(currentUser.address || '');
                setProfileExtraDetails(currentUser.extraDetails || '');
                setProfileError(''); setProfileEditMode(false);
                setAccountMode('dashboard');
                setAccountOpen(true);
              } else {
                openAccountModal('login');
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isAdmin ? (
                <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'8px'}}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg> Admin Dashboard</>
              ) : currentUser ? (
                <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'8px'}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> {currentUser.name}</>
              ) : (
                <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'8px'}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> My Account</>
              )}
            </div>
          </button>
          {currentUser && (
            <button
              className="menu-drawer-action-btn"
              style={{ color: '#FF6F61' }}
              onClick={() => { setMenuOpen(false); handleUserLogout(); }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'8px'}}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Sign Out
              </div>
            </button>
          )}

        </div>

        <div className="nav-actions">
          <button className="icon-btn" aria-label="Search" onClick={() => setSearchOpen(true)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></button>
          <button className="icon-btn" aria-label="Account" onClick={() => {
            if (isAdmin) { setShowAdmin(true); }
            else if (currentUser) { 
              setProfileMobile(currentUser.mobile || '');
              setProfileAddress(currentUser.address || '');
              setProfileExtraDetails(currentUser.extraDetails || '');
              setProfileError(''); setProfileEditMode(false);
              setAccountMode('dashboard');
              setAccountOpen(true);
            }
            else { openAccountModal('login'); }
          }} style={{ position: 'relative' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            {currentUser && <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', border: '1.5px solid var(--bg-card)' }} />}
          </button>
          <button className="icon-btn" aria-label="Wishlist" onClick={() => {
            if (currentUser) {
              setDashboardInitialTab('wishlist');
              setAccountMode('dashboard');
              setAccountOpen(true);
            } else {
              setWishlistOpen(true);
            }
          }}>
            <svg id="nav-wishlist-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}
          </button>
          <button className="icon-btn" aria-label="Cart" onClick={() => {
            if (currentUser) {
              setDashboardInitialTab('cart');
              setAccountMode('dashboard');
              setAccountOpen(true);
            } else {
              setCartOpen(true);
            }
          }}>
            <svg id="nav-cart-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </button>

        </div>
      </nav>

      <main style={{ position: 'relative' }}>
        <div className="glow-orb-left" aria-hidden="true" />
        <div className="glow-orb-right" aria-hidden="true" />
        {/* Mobile-Only Search Box */}
        <div className="mobile-search-container">
          <div className="mobile-search-bar" onClick={() => setSearchOpen(true)}>
            <span>Search for products...</span>
            <span className="mobile-search-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></span>
          </div>
        </div>

        {!isSignupRoute && !isProductRoute && (
          <div className="top-category-nav">
            <button
              onClick={() => {
                setSelectedCategory('All');
                document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={selectedCategory === 'All' ? 'active' : ''}
            >
              Popular
            </button>
            {categories
              .filter(cat => cat.id !== 'offer')
              .map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={selectedCategory === cat.id ? 'active' : ''}
                >
                  {cat.label || cat.id}
                </button>
              ))}
            <button
              onClick={() => {
                setSelectedCategory('Offers');
                document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={selectedCategory === 'Offers' ? 'active' : ''}
            >
              Sale
            </button>
          </div>
        )}

        {isSignupRoute ? (
          <SignupPage
            theme={theme}
            onLoginClick={() => {
              window.location.hash = '';
              setTimeout(() => openAccountModal('login'), 80);
            }}
          />
        ) : isProductRoute ? (
          <div className="product-details-page" style={{ padding: '60px 5%', maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
            {(!selectedProduct && loading) ? (
              <div style={{ padding: '100px 0', textAlign: 'center' }}><div className="skeleton skeleton-card" style={{ maxWidth: '400px', margin: '0 auto', height: '400px' }}/></div>
            ) : !selectedProduct ? (
              <div style={{ padding: '100px 0', textAlign: 'center' }}>
                <h2>Product Not Found</h2>
                <button className="btn-primary" onClick={() => window.location.hash = ''} style={{ marginTop: '20px' }}>Return to Shop</button>
              </div>
            ) : (
              <>
                <div className="product-details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', marginBottom: '60px' }}>
                  {/* Left: Images */}
                  <div className="product-details-images" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
                      <img src={activeDetailImage} alt={selectedProduct.name} style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain', maxHeight: '500px' }} />
                      {selectedProduct.images && selectedProduct.images.length > 1 && (
                        <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '0.72rem', padding: '4px 10px', borderRadius: '20px', fontWeight: '600', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.35857 19.5 5.5 20 5.5 20.5C5.5 21.3284 6.17157 22 7 22H12Z"/><circle cx="7.5" cy="10.5" r="1.5"/><circle cx="11.5" cy="7.5" r="1.5"/><circle cx="16.5" cy="9.5" r="1.5"/><circle cx="15.5" cy="14.5" r="1.5"/></svg> Color {selectedColorIdx + 1} of {selectedProduct.images.length}
                        </div>
                      )}
                    </div>
                    {selectedProduct.images && selectedProduct.images.length > 1 && (
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Select Color Variant</div>
                        <div className="thumbnail-row" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                          {selectedProduct.images.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setActiveDetailImage(img);
                                setSelectedColorIdx(idx);
                              }}
                              style={{
                                background: 'var(--bg-secondary)',
                                border: selectedColorIdx === idx ? '2.5px solid var(--gold)' : '1px solid var(--border)',
                                borderRadius: '10px',
                                overflow: 'hidden',
                                minWidth: '80px',
                                height: '80px',
                                cursor: 'pointer',
                                position: 'relative',
                                boxShadow: selectedColorIdx === idx ? '0 0 0 3px rgba(201,168,76,0.25)' : 'none',
                                transition: 'all 0.2s ease',
                                padding: 0
                              }}
                              title={`Color variant ${idx + 1}`}
                            >
                              <img src={img} alt={`Color variant ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              {selectedColorIdx === idx && (
                                <div style={{ position: 'absolute', bottom: '4px', right: '4px', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff', fontWeight: 'bold' }}>✓</div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Right: Info */}
                  <div className="product-details-info" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h1 style={{ fontSize: '2rem', margin: 0, lineHeight: 1.2 }}>{selectedProduct.name}</h1>
                    <div className="price-row" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                       {selectedProduct.discountPercentage > 0 ? (
                         <>
                           <span style={{ fontSize: '1.5rem', color: 'var(--gold)', fontWeight: '800' }}>
                             ₹{selectedProduct.price?.toLocaleString('en-IN')}
                           </span>
                           <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                             ₹{getMRP(selectedProduct).toLocaleString('en-IN')}
                           </span>
                           <span style={{ background: 'rgba(255, 111, 97,0.1)', color: '#FF6F61', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold' }}>
                             {selectedProduct.discountPercentage}% OFF
                           </span>
                         </>
                       ) : (
                         <span style={{ fontSize: '1.5rem', fontWeight: '700' }}>₹{selectedProduct.price?.toLocaleString('en-IN')}</span>
                       )}
                    </div>
                    
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1.05rem', margin: 0 }}>
                      {selectedProduct.description}
                    </p>

                    <div className="quantity-selector" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px' }}>
                      <span style={{ fontWeight: '500' }}>Quantity:</span>
                      <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                        <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ padding: '8px 16px', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem' }}>-</button>
                        <span style={{ padding: '8px 12px', fontWeight: 'bold', minWidth: '40px', textAlign: 'center' }}>{qty}</span>
                        <button onClick={() => setQty(q => q + 1)} style={{ padding: '8px 16px', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem' }}>+</button>
                      </div>
                    </div>

                    <div className="action-buttons" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px', flexWrap: 'wrap' }}>
                      <button 
                        className="add-cart-btn" 
                        onClick={(e) => {
                          const productWithVariant = {
                            ...selectedProduct,
                            selectedImage: activeDetailImage,
                            image: activeDetailImage
                          };
                          addToCartWithAnim(productWithVariant, qty, e);
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ zIndex: 2 }}>
                          <circle cx="9" cy="21" r="1"></circle>
                          <circle cx="20" cy="21" r="1"></circle>
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        <span style={{ zIndex: 2 }}>ADD TO CART</span>
                      </button>
                      <button 
                        className="buy-now-btn" 
                        onClick={() => { 
                          if (!currentUser) {
                            openAccountModal('login');
                          } else {
                            const productWithVariant = {
                              ...selectedProduct,
                              selectedImage: activeDetailImage,
                              image: activeDetailImage
                            };
                            setBuyNowItem({ ...productWithVariant, quantity: qty });
                            const savedAddress = currentUser?.addresses?.[0]?.address || currentUser?.address || '';
                            const savedPhone = currentUser?.addresses?.[0]?.phone || currentUser?.mobile || '';
                            setCheckoutAddress(savedAddress);
                            setCheckoutPhone(savedPhone);
                            setCheckoutOpen(true);
                          }
                        }}
                      >
                        <span style={{ zIndex: 2 }}>Buy Now</span>
                      </button>
                    </div>
                  </div>
                </div>

                <ProductReviews productId={selectedProduct.id || selectedProduct._id} />

                {/* Related Products */}
                <div className="related-products" style={{ marginTop: '60px', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
                  <h2 style={{ fontSize: '1.8rem', marginBottom: '30px' }}>Related Products</h2>
                  <div className="product-grid">
                    {products
                      .filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id && p._id !== selectedProduct._id)
                      .slice(0, 4)
                      .map(p => (
                        <article key={p.id || p._id} className="product-card" onClick={() => openDetail(p)} tabIndex={0} role="button">
                          <div className="product-card__image-wrap">
                    <ProductImageSlider mainImage={p.image} allImages={p.images} altText={p.name} />
                          </div>
                          <div className="product-card__body">
                            <div className="product-card__name">{p.name}</div>
                            <div className="product-card__price-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              {p.discountPercentage > 0 ? (
                                <>
                                  <span className="product-card__price discounted-price" style={{ color: 'var(--gold)', fontWeight: '800' }}>
                                    ₹{p.price?.toLocaleString('en-IN')}
                                  </span>
                                  <span className="product-card__price original-price" style={{ textDecoration: 'line-through', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    ₹{getMRP(p).toLocaleString('en-IN')}
                                  </span>
                                  <span className="discount-badge" style={{ fontSize: '0.72rem', background: 'rgba(255, 111, 97,0.12)', color: '#FF6F61', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                                    {p.discountPercentage}% OFF
                                  </span>
                                </>
                              ) : (
                                <span className="product-card__price">₹{p.price?.toLocaleString('en-IN')}</span>
                              )}
                            </div>
                          </div>
                        </article>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
                {/* HERO CATEGORY SLIDER */}
        <HeroCategorySlider
          categories={categories.filter(cat => cat.id !== 'offer')}
          offers={offers}
          siteSettings={siteSettings}
          onShopCategory={(catId) => {
            setSelectedCategory(catId);
            document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* —— VALUE PROPOSITION BAR —— */}
        <div className="meesho-value-bar">
          <div className="meesho-value-item">
            <span className="meesho-value-icon">🪡</span>
            <span className="meesho-value-text">Hand Crafted</span>
          </div>
          <div className="meesho-value-divider" />
          <div className="meesho-value-item">
            <span className="meesho-value-icon">🎁</span>
            <span className="meesho-value-text">Premium Gifts</span>
          </div>
          <div className="meesho-value-divider" />
          <div className="meesho-value-item">
            <span className="meesho-value-icon">🏷️</span>
            <span className="meesho-value-text">Lowest Prices</span>
          </div>
        </div>

        {/* —— SALE BANNER —— */}
        <SaleBanner
          siteSettings={siteSettings}
          offers={offers}
          onShopNow={() => {
            setSelectedCategory('Offers');
            document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* —— COLLECTIONS — Meesho Arch Style —— */}
        <section id="categories" className="arch-collections-section" aria-label="Product collections">
          <div className="section-title-wrap">
            <div className="section-eyebrow">Our Exclusive Collections</div>
            <div className="section-main-title">Shop by <span className="gold-text">Collection</span></div>
          </div>

          <div className="arch-collections-row">
            {/* All */}
            <button
              className={`arch-col-item ${selectedCollection === 'All' ? 'active' : ''}`}
              onClick={() => { setSelectedCollection('All'); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }); }}
            >
              <div className="arch-col-frame arch-all">
                <img src="/images/col_all.png" alt="All Collections" className="arch-col-img" />
              </div>
              <span className="arch-col-label">All</span>
            </button>

            {STORE_COLLECTIONS.map(col => (
              <button
                key={col.id}
                className={`arch-col-item ${selectedCollection === col.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCollection(col.id);
                  document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <div className={`arch-col-frame arch-${col.id.toLowerCase().replace(/[^a-z]/g, '-')}`}>
                  <img src={col.image} alt={col.label} className="arch-col-img" />
                </div>
                <span className="arch-col-label">{col.id}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="section-divider" aria-hidden="true">
          <span className="section-divider-emblem">✦ ⚜ ✦</span>
        </div>

        {/* —— POPULAR PRODUCTS —— */}
        <section id="shop" className="popular-section" aria-label="Popular products">
          <div className="section-heading">
            <div className="section-heading__line" />
            <span className="section-heading__title">
              {selectedCollection !== 'All'
                ? `${selectedCollection}'s Products`
                : selectedCategory !== 'All' && selectedCategory !== 'Offers'
                ? `${selectedCategory}`
                : 'Popular Products'}
            </span>
            <div className="section-heading__line" />
            {(selectedCategory !== 'All' || selectedCollection !== 'All') && (
              <button className="clear-filter-btn" onClick={() => { setSelectedCategory('All'); setSelectedCollection('All'); }}>
                Clear All Filters
              </button>
            )}
            <a className="section-heading__action" href="#shop" onClick={(e) => { e.preventDefault(); setSelectedCategory('All'); setSelectedCollection('All'); }}>View All</a>
          </div>

          {/* Filter & Sort Controls Row */}
          <div className="shop-controls-row" style={{ flexDirection: 'column', gap: '16px', alignItems: 'stretch' }}>
            {/* Category Filter Row */}
            <div className="filter-group" style={{ flexWrap: 'wrap' }}>
              <span className="control-label">Category:</span>
              <button
                key="All"
                className={`filter-btn ${selectedCategory === 'All' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('All')}
              >
                All Categories
              </button>
              {offers.length > 0 && (
                <button
                  className={`filter-btn ${selectedCategory === 'Offers' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('Offers')}
                  style={{ color: 'var(--gold)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg> Offers
                </button>
              )}
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Collection Filter Row (Mens, Womens, Kids, Unisex) */}
            <div className="filter-group" style={{ flexWrap: 'wrap', borderTop: '1px dashed #FCEDD6', paddingTop: '10px' }}>
              <span className="control-label">Collection:</span>
              <button
                key="AllCol"
                className={`filter-btn ${selectedCollection === 'All' ? 'active' : ''}`}
                onClick={() => setSelectedCollection('All')}
              >
                All Collections
              </button>
              {STORE_COLLECTIONS.map(col => (
                <button
                  key={col.id}
                  className={`filter-btn ${selectedCollection === col.id ? 'active' : ''}`}
                  onClick={() => setSelectedCollection(col.id)}
                >
                  {col.id}
                </button>
              ))}
            </div>
            <div className="sort-group">
              <span className="control-label">Sort By:</span>
              <select
                className="sort-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                aria-label="Sort products"
              >
                <option value="Default">Default</option>
                <option value="Price: Low to High">Price: Low to High</option>
                <option value="Price: High to Low">Price: High to Low</option>
                <option value="Popularity">Popularity</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="product-grid">
              {[1,2,3,4,5].map(i => <div key={i} className="skeleton skeleton-card" />)}
            </div>
          ) : (
            <div className="product-grid">
              {sortedProducts.map(p => (
                <article key={p.id} className="product-card" onClick={() => openDetail(p)} tabIndex={0} role="button" aria-label={`View ${p.name}`}>
                  <div className="product-card__image-wrap">
                    <ProductImageSlider mainImage={p.image} allImages={p.images} altText={p.name} />
                    <button
                      className={`product-card__wishlist ${isWished(p.id) ? 'active' : ''}`}
                      aria-label={`Toggle wishlist for ${p.name}`}
                      onClick={e => { e.stopPropagation(); toggleWish(p, e); }}
                    >
                      {isWished(p.id) ? '♥' : '♡'}
                    </button>
                    {p.badge && <span className={`product-card__badge badge--${p.badgeClass || 'new'}`}>{p.badge}</span>}
                  </div>
                  <div className="product-card__body">
                    <div className="product-card__name">{p.name}</div>
                    <div className="product-card__price-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {p.discountPercentage > 0 ? (
                        <>
                          <span className="product-card__price discounted-price" style={{ color: 'var(--gold)', fontWeight: '700' }}>
                            ₹{getDiscountedPrice(p).toLocaleString('en-IN')}
                          </span>
                          <span className="product-card__price original-price" style={{ textDecoration: 'line-through', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                            ₹{getMRP(p).toLocaleString('en-IN')}
                          </span>
                          <span className="discount-badge" style={{ fontSize: '0.75rem', background: 'rgba(255, 111, 97, 0.12)', color: '#FF6F61', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                            {p.discountPercentage}% OFF
                          </span>
                        </>
                      ) : (
                        <span className="product-card__price">₹{p.price?.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
          {error && <p className="status-message error">Showing offline products. Connection will retry automatically.</p>}
        </section>

        <div className="section-divider" aria-hidden="true">
          <span className="section-divider-emblem">✦ ⚜ ✦</span>
        </div>

        {/* —— ABOUT —— */}
        <section id="about" className="about-section" aria-label="About Parisu Ulagam">
          <div className="about-inner">
            <div className="about-text-col">
              <div className="section-eyebrow">Our Story</div>
              <h2 className="about-title" dangerouslySetInnerHTML={{ __html: siteSettings?.aboutTitle || 'Where Tradition<br/>Meets <span className="gold-text">Elegance</span>' }}></h2>
              <p className="about-lead">
                {siteSettings?.aboutDescription || 'Born from a passion for timeless artistry, Parisu Ulagam is a celebration of heritage craftsmanship and modern luxury. Every piece in our collection tells a story — of skilled artisans, precious materials, and designs that transcend generations.'}
              </p>
              <div className="about-pillars">
                <div className="about-pillar animate-on-scroll">
                  <div className="about-pillar__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>
                  </div>
                  <h3>Handcrafted</h3>
                  <p>Each piece is meticulously crafted by skilled artisans with decades of experience.</p>
                </div>
                <div className="about-pillar animate-on-scroll">
                  <div className="about-pillar__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <h3>Premium Quality</h3>
                  <p>We use only the finest materials — from gold-plated metals to sustainably sourced wood.</p>
                </div>
                <div className="about-pillar animate-on-scroll">
                  <div className="about-pillar__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </div>
                  <h3>Made with Love</h3>
                  <p>Every creation carries the warmth of human touch and dedication to perfection.</p>
                </div>
              </div>
            </div>
            <div className="about-visual-col">
              <div className="about-image-stack">
                <div className="about-image-main">
                  <img 
                    src={siteSettings?.aboutImage?.[0] || '/images/toy-classic.png'} 
                    alt="Artisan craftsmanship" 
                    loading="lazy"
                    className={Array.isArray(siteSettings?.aboutImage) && siteSettings.aboutImage.length > 1 ? "about-img-primary" : ""}
                  />
                  {Array.isArray(siteSettings?.aboutImage) && siteSettings.aboutImage.length > 1 && (
                    <img 
                      src={siteSettings.aboutImage[1]} 
                      alt="Artisan craftsmanship hover" 
                      loading="lazy"
                      className="about-img-secondary"
                    />
                  )}
                </div>
                <div className="about-accent-box">
                  <div className="about-accent-number">{siteSettings?.aboutAccentNum || '5+'}</div>
                  <div className="about-accent-label">{siteSettings?.aboutAccentLabel || 'Years of Craftsmanship'}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="section-divider" aria-hidden="true">
          <span className="section-divider-emblem">✦ ⚜ ✦</span>
        </div>

        {/* —— CONTACT —— */}
        <section id="contact" className="contact-section" aria-label="Contact information">
          <div className="contact-inner">
            <div className="section-eyebrow">Get in Touch</div>
            <h2 className="contact-title animate-on-scroll">We'd Love to <span className="gold-text">Hear from You</span></h2>
            <p className="contact-subtitle animate-on-scroll">Whether you have a question about our collections, custom orders, or anything else — our team is ready to help.</p>
            <div className="contact-cards">
              <a href={`tel:${siteSettings?.contactPhone || '+919488316728'}`} className="contact-card animate-on-scroll" style={{ transitionDelay: '0.1s' }}>
                <div className="contact-card__icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </div>
                <div className="contact-card__label">Phone</div>
                <div className="contact-card__value">{siteSettings?.contactPhone || '+91 94883 16728'}</div>
              </a>
              <a href={`mailto:${siteSettings?.contactEmail || 'thesmgroups@gmail.com'}`} className="contact-card animate-on-scroll" style={{ transitionDelay: '0.2s' }}>
                <div className="contact-card__icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <div className="contact-card__label">Email</div>
                <div className="contact-card__value">{siteSettings?.contactEmail || 'thesmgroups@gmail.com'}</div>
              </a>
              <div className="contact-card animate-on-scroll" style={{ transitionDelay: '0.3s' }}>
                <div className="contact-card__icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div className="contact-card__label">Visit Us</div>
                <div className="contact-card__value" dangerouslySetInnerHTML={{ __html: siteSettings?.contactAddress || 'IInd Floor, OM Shiva Towers, 259-B,<br/>Advaitha Ashram Rd, Fairlands, Salem - 636004' }}></div>
              </div>
            </div>
          </div>
        </section>
        </>
        )}
      </main>

      {/* —— FOOTER —— */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="footer-brand-col">
              <div className="footer-brand">
                <img src="/royal_logo.png" alt="Parisu Ulagam" className="footer-logo-img" />
                <div>
                  <div className="footer-brand-name">Parisu Ulagam</div>
                  <div className="footer-brand-tag">Royal Living</div>
                </div>
              </div>
              <p className="footer-brand-desc">Crafting timeless pieces that blend heritage artistry with modern luxury. Every creation tells a story of elegance.</p>
            </div>
            <div className="footer-links-col">
              <h4 className="footer-col-title">Quick Links</h4>
              <a href="#home">Home</a>
              <a href="#shop">Shop</a>
              <a href="#categories">Collections</a>
              <a href="#about">About Us</a>
              <a href="#contact">Contact</a>
            </div>
            <div className="footer-links-col">
              <h4 className="footer-col-title">Categories</h4>
              {categories.map(cat => (
                <a key={cat.id} href="#shop" onClick={() => setSelectedCategory(cat.id)}>{cat.label}</a>
              ))}
            </div>
            <div className="footer-contact-col">
              <h4 className="footer-col-title">Contact Us</h4>
              <div className="footer-contact-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <a href={`tel:${siteSettings?.contactPhone || '+919488316728'}`}>{siteSettings?.contactPhone || '+91 94883 16728'}</a>
              </div>
              <div className="footer-contact-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <a href={`mailto:${siteSettings?.contactEmail || 'thesmgroups@gmail.com'}`}>{siteSettings?.contactEmail || 'thesmgroups@gmail.com'}</a>
              </div>
              <div className="footer-contact-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span dangerouslySetInnerHTML={{ __html: siteSettings?.contactAddress || 'IInd Floor, OM Shiva Towers, 259-B,<br/>Advaitha Ashram Rd, Fairlands, Salem - 636004' }}></span>
              </div>
            </div>
          </div>
          <div className="footer-divider"></div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Parisu Ulagam — Royal Living. All rights reserved.</span>
            <span className="footer-bottom-tagline">Handcrafted with ♡ in Salem, India</span>
          </div>
        </div>
      </footer>

      {/* —— MOBILE BOTTOM NAV —— */}
      <nav className="mobile-nav" aria-label="Mobile navigation">
        <div className="mobile-nav__items">
          <a
            href="#home"
            className={`mobile-nav__item ${activeSection === 'home' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('home');
              document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <svg className="mobile-nav__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>Home
          </a>
          <a
            href="#shop"
            className={`mobile-nav__item ${activeSection === 'shop' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('shop');
              document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <svg className="mobile-nav__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>Shop
          </a>
          <button className="mobile-nav__item" onClick={() => {
            if (currentUser) {
              setDashboardInitialTab('wishlist');
              setAccountMode('dashboard');
              setAccountOpen(true);
            } else {
              setWishlistOpen(true);
            }
          }}>
            <svg className="mobile-nav__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>Wishlist
          </button>
          <button className="mobile-nav__item" onClick={() => {
            if (currentUser) {
              setDashboardInitialTab('cart');
              setAccountMode('dashboard');
              setAccountOpen(true);
            } else {
              setCartOpen(true);
            }
          }}>
            <svg className="mobile-nav__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>Cart
          </button>
          <button className="mobile-nav__item" onClick={() => {
            if (isAdmin) {
              setShowAdmin(true);
            } else if (currentUser) {
              setDashboardInitialTab('profile');
              setAccountMode('dashboard');
              setAccountOpen(true);
            } else {
              openAccountModal('login');
            }
          }}>
            <svg className="mobile-nav__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>{isAdmin ? 'Admin' : 'Account'}
          </button>
        </div>
      </nav>

      {/* ═══════ OVERLAYS ═══════ */}

      {/* —— WISHLIST SIDEBAR —— */}
      {wishlistOpen && (
        <>
          <div className="cart-overlay" onClick={() => setWishlistOpen(false)} />
          <aside className="cart-sidebar">
            <div className="cart-header">
              <h3>My Wishlist ({wishlist.length})</h3>
              <button className="icon-btn" onClick={() => setWishlistOpen(false)} aria-label="Close wishlist">✕</button>
            </div>
            <div className="cart-items">
              {wishlist.length === 0 ? (
                <div className="cart-empty">
                  <span className="cart-empty__icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </span>
                  <p>Your wishlist is empty</p>
                </div>
              ) : (
                wishlist.map(item => (
                  <div key={item.id} className="cart-item">
                    <img className="cart-item__img" src={item.image} alt={item.name} />
                    <div className="cart-item__info">
                      <div className="cart-item__name">{item.name}</div>
                      {item.discountPercentage > 0 ? (
                        <div className="cart-item__price-row" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span className="cart-item__price" style={{ color: 'var(--gold)', fontWeight: '700' }}>
                            ₹{getDiscountedPrice(item).toLocaleString('en-IN')}
                          </span>
                          <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            ₹{item.price?.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ) : (
                        <div className="cart-item__price">₹{item.price?.toLocaleString('en-IN')}</div>
                      )}
                      <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                        <button
                          className="primary-btn"
                          style={{ padding: '6px 12px', fontSize: '0.7rem' }}
                          onClick={() => {
                            addToCart(item, 1);
                            addToast('Added to cart', 'success');
                          }}
                        >
                          Add to Cart
                        </button>
                        <span
                          className="cart-item__remove"
                          style={{ marginTop: '4px' }}
                          onClick={() => {
                            removeFromWishlist(item.id);
                            addToast('Removed from wishlist', 'info');
                          }}
                        >
                          Remove
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </>
      )}

      {/* —— CART SIDEBAR —— */}
      {cartOpen && (
        <>
          <div className="cart-overlay" onClick={() => setCartOpen(false)} />
          <aside className="cart-sidebar">
            <div className="cart-header">
              <h3>Shopping Cart ({cartCount})</h3>
              <button className="icon-btn" onClick={() => setCartOpen(false)} aria-label="Close cart">✕</button>
            </div>
            <div className="cart-items">
              {cartItems.length === 0 ? (
                <div className="cart-empty">
                  <span className="cart-empty__icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                  </span>
                  <p>Your cart is empty</p>
                </div>
              ) : (
                cartItems.map(item => {
                const itemKey = getCartKey(item);
                const displayImg = item.selectedImage || item.image;
                return (
                  <div key={itemKey} className="cart-item">
                    <img className="cart-item__img" src={displayImg} alt={item.name} />
                    <div className="cart-item__info">
                      <div className="cart-item__name">{item.name}</div>
                      {item.selectedImage && item.images && item.images.length > 1 && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--gold)', fontWeight: '600', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.35857 19.5 5.5 20 5.5 20.5C5.5 21.3284 6.17157 22 7 22H12Z"/><circle cx="7.5" cy="10.5" r="1.5"/><circle cx="11.5" cy="7.5" r="1.5"/><circle cx="16.5" cy="9.5" r="1.5"/><circle cx="15.5" cy="14.5" r="1.5"/></svg> Color variant selected
                        </div>
                      )}
                      {item.discountPercentage > 0 ? (
                        <div className="cart-item__price-row" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span className="cart-item__price" style={{ color: 'var(--gold)', fontWeight: '700' }}>
                            ₹{getDiscountedPrice(item).toLocaleString('en-IN')}
                          </span>
                          <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            ₹{item.price?.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ) : (
                        <div className="cart-item__price">₹{item.price?.toLocaleString('en-IN')}</div>
                      )}
                      <div className="cart-item__qty">
                        <button onClick={() => updateQuantity(itemKey, Math.max(1, item.quantity - 1))}>✕</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(itemKey, item.quantity + 1)}>+</button>
                      </div>
                      <span className="cart-item__remove" onClick={() => { removeFromCart(itemKey); addToast('Removed from cart', 'info'); }}>Remove</span>
                    </div>
                  </div>
                );
              })
              )}
            </div>
            {cartItems.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <span>Total</span>
                  <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <button 
                  className="cart-checkout-btn" 
                  onClick={() => {
                    if (!currentUser) {
                      setCartOpen(false);
                      openAccountModal('login');
                    } else {
                      // Pre-fill address and phone from profile
                      const savedAddress = currentUser?.addresses?.[0]?.address || currentUser?.address || '';
                      const savedPhone = currentUser?.addresses?.[0]?.phone || currentUser?.mobile || '';
                      setCheckoutAddress(savedAddress);
                      setCheckoutPhone(savedPhone);
                      setCheckoutOpen(true);
                    }
                  }}
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </aside>
        </>
      )}
          
      {/* —— CHECKOUT MODAL —— */}
          {checkoutOpen && (
            <div className="admin-modal-overlay" style={{ zIndex: 1100 }}>
              <div className="admin-modal-card" style={{ maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="admin-modal-header" style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> Checkout
                  </h3>
                  <button className="modal-close" onClick={() => { setCheckoutOpen(false); setBuyNowItem(null); }}>✕</button>
                </div>
                <div className="admin-modal-body">

                  {/* Shipping Address Section */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> Shipping Address
                    </h4>
                    {/* Quick select from saved addresses */}
                    {currentUser?.addresses && currentUser.addresses.length > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Quick select a saved address:</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {currentUser.addresses.map((addr, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setCheckoutAddress(addr.address);
                                setCheckoutPhone(addr.phone || currentUser?.mobile || '');
                              }}
                              style={{
                                textAlign: 'left', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer',
                                border: `1px solid ${checkoutAddress === addr.address ? 'var(--gold)' : 'var(--border)'}`,
                                background: checkoutAddress === addr.address ? 'rgba(201,168,76,0.08)' : 'var(--bg-secondary)',
                                color: 'var(--text-primary)'
                              }}
                            >
                              <div style={{ fontWeight: '600', fontSize: '0.8rem', color: 'var(--gold)', marginBottom: '3px' }}>{addr.label}</div>
                              <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>{addr.name}</div>
                              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{addr.address}</div>
                              {addr.phone && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg> {addr.phone}</div>}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Manual address fields */}
                    <div className="admin-form-group" style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '0.85rem' }}>Delivery Address *</label>
                      <textarea
                        rows={3}
                        value={checkoutAddress}
                        onChange={e => setCheckoutAddress(e.target.value)}
                        placeholder="Full address: Door No, Street, City, State, Pincode"
                        style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '10px', borderRadius: '6px', color: 'var(--text-primary)', width: '100%', resize: 'vertical', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label style={{ fontSize: '0.85rem' }}>Contact Phone Number</label>
                      <input id="checkoutPhone" name="checkoutPhone"
                        type="tel"
                        value={checkoutPhone}
                        onChange={e => setCheckoutPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '10px', borderRadius: '6px', color: 'var(--text-primary)', width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Order Summary
                    </h4>
                    <div style={{ background: 'var(--bg-secondary)', padding: '15px', borderRadius: '8px' }}>
                      {/* Item breakdown with selected images */}
                      {itemsToCheckout.map((item, idx) => {
                        const displayImg = item.selectedImage || item.image;
                        return (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                            <img src={displayImg} alt={item.name} style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)', flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.name}</div>
                              {item.selectedImage && item.images && item.images.length > 1 && (
                                <div style={{ fontSize: '0.72rem', color: 'var(--gold)', fontWeight: '600', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.35857 19.5 5.5 20 5.5 20.5C5.5 21.3284 6.17157 22 7 22H12Z"/><circle cx="7.5" cy="10.5" r="1.5"/><circle cx="11.5" cy="7.5" r="1.5"/><circle cx="16.5" cy="9.5" r="1.5"/><circle cx="15.5" cy="14.5" r="1.5"/></svg> Color variant selected
                                </div>
                              )}
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Qty: {item.quantity}</div>
                            </div>
                            <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>₹{((item.discountPercentage > 0 ? getDiscountedPrice(item) : item.price) * item.quantity).toLocaleString('en-IN')}</div>
                          </div>
                        );
                      })}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Subtotal ({itemsToCheckout.length} item{itemsToCheckout.length !== 1 ? 's' : ''})</span>
                        <span>₹{checkoutSubtotal.toLocaleString('en-IN')}</span>
                      </div>
                      
                      <div style={{ marginTop: '16px', marginBottom: '8px' }}>
                        <h4 style={{ marginBottom: '10px', fontSize: '0.9rem' }}>Select Shipping Method</h4>
                        {activeShippingMethods.length === 0 ? (
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No shipping methods available. Contact admin.</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {activeShippingMethods.map(method => (
                              <label key={method._id || method.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: `1px solid ${selectedShippingMethod === (method._id || method.id) ? 'var(--gold)' : 'var(--border)'}`, borderRadius: '8px', cursor: 'pointer', background: selectedShippingMethod === (method._id || method.id) ? 'rgba(201,168,76,0.07)' : 'transparent' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <input 
                                    type="radio" 
                                    name="shippingMethod" 
                                    value={method._id || method.id} 
                                    checked={selectedShippingMethod === (method._id || method.id)}
                                    onChange={(e) => setSelectedShippingMethod(e.target.value)}
                                  />
                                  <span style={{ fontWeight: '500' }}>{method.providerName}</span>
                                </div>
                                <span style={{ fontWeight: '700', color: 'var(--gold)' }}>₹{method.shippingCharge}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>

                      <p style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        Need a different courier or custom shipping? Contact our admin for assistance at <a href={`mailto:${siteSettings?.adminEmail || 'parisuulagam@gmail.com'}`} style={{ color: 'var(--gold)' }}>{siteSettings?.adminEmail || 'parisuulagam@gmail.com'}</a> or call <a href={`tel:${siteSettings?.contactPhone || '+919488316728'}`} style={{ color: 'var(--gold)' }}>{siteSettings?.contactPhone || '+91 94883 16728'}</a>.
                      </p>
                      {/* —— COUPON CODE —— */}
                      <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                        <h4 style={{ marginBottom: '8px', fontSize: '0.9rem' }}>Have a Coupon?</h4>
                        {appliedCoupon ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(76, 175, 80, 0.08)', border: '1px solid rgba(76, 175, 80, 0.3)', borderRadius: '8px' }}>
                            <div>
                              <span style={{ fontWeight: '700', color: '#4CAF50', letterSpacing: '1px' }}>{appliedCoupon.code}</span>
                              <span style={{ marginLeft: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>— {appliedCoupon.discountPercentage}% OFF (−₹{appliedCoupon.discountAmount.toLocaleString('en-IN')})</span>
                            </div>
                            <button type="button" onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', color: '#e53935', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem' }}>Remove</button>
                          </div>
                        ) : (
                          <div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input
                                type="text"
                                placeholder="Enter coupon code"
                                value={couponCode}
                                onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleApplyCoupon(); } }}
                                style={{ flex: 1, padding: '9px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}
                              />
                              <button type="button" onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()} style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: 'var(--gold)', color: '#fff', fontWeight: '600', cursor: 'pointer', opacity: couponLoading || !couponCode.trim() ? 0.5 : 1, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                {couponLoading ? '...' : 'Apply'}
                              </button>
                            </div>
                            {couponError && <p style={{ color: '#e53935', fontSize: '0.8rem', marginTop: '6px' }}>{couponError}</p>}
                          </div>
                        )}
                      </div>

                      {/* —— DISCOUNT LINE —— */}
                      {appliedCoupon && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', color: '#4CAF50', fontWeight: '600', fontSize: '0.92rem' }}>
                          <span>Coupon Discount ({appliedCoupon.discountPercentage}%)</span>
                          <span>−₹{appliedCoupon.discountAmount.toLocaleString('en-IN')}</span>
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border)', fontWeight: '700', fontSize: '1.1rem' }}>
                        <span>Grand Total</span>
                        <span style={{ color: 'var(--gold)' }}>
                          ₹{Math.max(0, (checkoutSubtotal + (selectedShippingMethod ? (activeShippingMethods.find(m => (m._id || m.id) === selectedShippingMethod)?.shippingCharge || 0) : 0) + itemsToCheckout.reduce((sum, item) => sum + (item.shippingCharge || 0) * item.quantity, 0)) - (appliedCoupon ? appliedCoupon.discountAmount : 0)).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
                <div className="admin-modal-footer" style={{ position: 'sticky', bottom: 0, background: 'var(--bg-card)', borderTop: '1px solid var(--border)', padding: '16px 24px' }}>
                  <button type="button" className="secondary-btn" onClick={() => { setCheckoutOpen(false); setBuyNowItem(null); }}>Back</button>
                  <button 
                    className="primary-btn" 
                    onClick={handleCheckout} 
                    disabled={checkoutLoading || !checkoutAddress.trim()}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    {checkoutLoading ? 'Processing...' : <><span style={{ display: 'flex', alignItems: 'center' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></span> Pay with Razorpay</>}
                  </button>
                </div>
              </div>
            </div>
          )}

      {/* —— SEARCH OVERLAY —— */}
      {searchOpen && (
        <div className="search-overlay" onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
          <div className="search-box" onClick={e => e.stopPropagation()}>
            <input id="searchQuery" name="searchQuery"
              className="search-input"
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
            />
            <div className="search-results">
              {searchResults.map(p => (
                <div key={p.id} className="search-result-item" onClick={() => { openDetail(p); setSearchOpen(false); setSearchQuery(''); }}>
                  <img className="search-result-item__img" src={p.image} alt={p.name} />
                  <div>
                    <div className="search-result-item__name">{p.name}</div>
                    {p.discountPercentage > 0 ? (
                      <div className="search-result-item__price-row" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className="search-result-item__price" style={{ color: 'var(--gold)', fontWeight: '700' }}>
                          ₹{getDiscountedPrice(p).toLocaleString('en-IN')}
                        </span>
                        <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          ₹{p.price?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ) : (
                      <div className="search-result-item__price">₹{p.price?.toLocaleString('en-IN')}</div>
                    )}
                  </div>
                </div>
              ))}
              {searchQuery.trim() && searchResults.length === 0 && (
                <p className="status-message">No products found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* —— ACCOUNT MODAL (Login / Register / Profile) —— */}
      {accountOpen && accountMode !== 'dashboard' && (
        <div className="login-overlay" onClick={closeAccountModal}>
          <div className="login-card" style={{ maxWidth: accountMode === 'profile' ? '500px' : '420px' }} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeAccountModal} aria-label="Close">✕</button>

            {/* ——— LOGIN MODE ——— */}
            {accountMode === 'login' && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ color: 'var(--gold)', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <h2 style={{ margin: 0 }}>Welcome Back</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '6px' }}>Sign in to your Parisu Ulagam account</p>
                </div>
                <form onSubmit={handleUserLogin}>
                  <div className="form-group">
                    <label htmlFor="user-login-email">Email Address</label>
                    <input id="user-login-email" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required placeholder="your@email.com" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="user-login-password">Password</label>
                    <div style={{ position: 'relative' }}>
                      <input id="user-login-password" type={showPassword ? 'text' : 'password'} value={regPassword} onChange={e => setRegPassword(e.target.value)} required style={{ paddingRight: '44px', width: '100%', boxSizing: 'border-box' }} placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(p => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0', display: 'flex' }}>
                        {showPassword ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                      </button>
                    </div>
                  </div>
                  {regError && <p style={{ color: '#FF6F61', fontSize: '0.85rem', marginBottom: '12px', padding: '10px 12px', background: 'rgba(255, 111, 97,0.08)', borderRadius: '8px', border: '1px solid rgba(255, 111, 97,0.2)' }}>{regError}</p>}
                  <div style={{ textAlign: 'right', marginBottom: '16px' }}>
                    <button type="button" onClick={() => setAccountMode('forgot-step1')} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600', padding: 0 }}>Forgot Password?</button>
                  </div>
                  <button type="submit" className="login-btn" disabled={regLoading} style={{ marginBottom: '16px' }}>
                    {regLoading ? 'Signing In...' : 'Sign In'}
                  </button>
                </form>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 12px' }}>Don't have an account?</p>
                  <button onClick={() => { closeAccountModal(); window.location.hash = '#/signup'; }} style={{ background: 'none', border: '1.5px solid var(--gold)', color: 'var(--gold)', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', width: '100%', letterSpacing: '0.05em' }}>
                    & Create Parisu Ulagam Account
                  </button>
                </div>
              </>
            )}

            {/* ——— FORGOT PASSWORD STEP 1: Request OTP ——— */}
            {accountMode === 'forgot-step1' && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ color: 'var(--gold)', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  <h2 style={{ margin: 0 }}>Reset Password</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>Enter your email to receive a reset code</p>
                </div>
                <form onSubmit={handleForgotStep1}>
                  <div className="form-group">
                    <label htmlFor="forgot-email">Email Address *</label>
                    <input id="forgot-email" type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required placeholder="your@email.com" />
                  </div>
                  {forgotError && <p style={{ color: '#FF6F61', fontSize: '0.85rem', marginBottom: '12px', padding: '10px 12px', background: 'rgba(255, 111, 97,0.08)', borderRadius: '8px', border: '1px solid rgba(255, 111, 97,0.2)' }}>{forgotError}</p>}
                  <button type="submit" className="login-btn" disabled={forgotLoading} style={{ marginBottom: '12px' }}>
                    {forgotLoading ? 'Sending Code...' : 'Send Verification Code'}
                  </button>
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    Remember your password? <button type="button" onClick={() => { setAccountMode('login'); setForgotError(''); }} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem' }}>Sign In</button>
                  </p>
                </form>
              </>
            )}

            {/* ——— FORGOT PASSWORD STEP 2: Verify OTP ——— */}
            {accountMode === 'forgot-step2' && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ color: 'var(--gold)', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m2 7 4.42 4.42a2.13 2.13 0 0 0 3 0L22 4"/><path d="m2 17 4.42-4.42a2.13 2.13 0 0 1 3 0L22 20"/></svg>
                  </div>
                  <h2 style={{ margin: 0 }}>Verify Email</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px', lineHeight: '1.5' }}>
                    We've sent a 6-digit code to <strong>{forgotEmail}</strong>
                  </p>
                </div>
                <form onSubmit={handleForgotStep2}>
                  <div className="form-group">
                    <label htmlFor="forgot-otp">Verification Code *</label>
                    <input id="forgot-otp" type="text" value={forgotOtpCode} onChange={e => setForgotOtpCode(e.target.value.replace(/\D/g, '').slice(0,6))} required placeholder="Enter 6-digit code" style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }} />
                  </div>
                  {forgotError && <p style={{ color: '#FF6F61', fontSize: '0.85rem', marginBottom: '12px', padding: '10px 12px', background: 'rgba(255, 111, 97,0.08)', borderRadius: '8px', border: '1px solid rgba(255, 111, 97,0.2)' }}>{forgotError}</p>}
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                    <button type="button" onClick={() => setAccountMode('forgot-step1')} className="secondary-btn" style={{ flex: 1 }}>Back</button>
                    <button type="submit" className="primary-btn" disabled={forgotLoading} style={{ flex: 2 }}>
                      {forgotLoading ? 'Verifying...' : 'Verify Code'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* ——— FORGOT PASSWORD STEP 3: New Password ——— */}
            {accountMode === 'forgot-step3' && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ color: 'var(--gold)', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  <h2 style={{ margin: 0 }}>Create New Password</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>Please enter your new password</p>
                </div>
                <form onSubmit={handleForgotStep3}>
                  <div className="form-group">
                    <label htmlFor="forgot-new-password">New Password * (Min 6 chars)</label>
                    <div style={{ position: 'relative' }}>
                      <input id="forgot-new-password" type={showForgotPassword ? 'text' : 'password'} value={forgotPassword} onChange={e => setForgotPassword(e.target.value)} required minLength={6} placeholder="••••••••" style={{ paddingRight: '44px', width: '100%', boxSizing: 'border-box' }} />
                      <button type="button" onClick={() => setShowForgotPassword(p => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        {showForgotPassword ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="forgot-confirm-password">Confirm New Password *</label>
                    <div style={{ position: 'relative' }}>
                      <input id="forgot-confirm-password" type={showForgotConfirmPassword ? 'text' : 'password'} value={forgotConfirmPassword} onChange={e => setForgotConfirmPassword(e.target.value)} required minLength={6} placeholder="••••••••" style={{ paddingRight: '44px', width: '100%', boxSizing: 'border-box' }} />
                      <button type="button" onClick={() => setShowForgotConfirmPassword(p => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        {showForgotConfirmPassword ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                      </button>
                    </div>
                  </div>
                  {forgotError && <p style={{ color: '#FF6F61', fontSize: '0.85rem', marginBottom: '12px', padding: '10px 12px', background: 'rgba(255, 111, 97,0.08)', borderRadius: '8px', border: '1px solid rgba(255, 111, 97,0.2)' }}>{forgotError}</p>}
                  <button type="submit" className="primary-btn" disabled={forgotLoading} style={{ width: '100%' }}>
                    {forgotLoading ? 'Resetting Password...' : 'Reset Password'}
                  </button>
                </form>
              </>
            )}

            {/* ——— REGISTER STEP 1: Name / Email / Mobile ——— */}
            {accountMode === 'register-step1' && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ color: 'var(--gold)', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                  </div>
                  <h2 style={{ margin: 0 }}>Create Account</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>Step 1 of 3 — Your Details</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
                    {[1,2,3].map(s => <div key={s} style={{ width: '28px', height: '4px', borderRadius: '2px', background: s === 1 ? 'var(--gold)' : 'var(--border)' }} />)}
                  </div>
                </div>
                <form onSubmit={handleRegisterStep1}>
                  <div className="form-group">
                    <label htmlFor="reg-name">Full Name *</label>
                    <input id="reg-name" type="text" value={regName} onChange={e => setRegName(e.target.value)} required placeholder="Enter your full name" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="reg-email">Email Address *</label>
                    <input id="reg-email" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required placeholder="your@email.com" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="reg-mobile">Mobile Number * (10 digits)</label>
                    <input id="reg-mobile" type="tel" value={regMobile} onChange={e => setRegMobile(e.target.value.replace(/\D/g, '').slice(0,10))} required placeholder="Enter 10-digit number" maxLength={10} />
                  </div>
                  {regError && <p style={{ color: '#FF6F61', fontSize: '0.85rem', marginBottom: '12px', padding: '10px 12px', background: 'rgba(255, 111, 97,0.08)', borderRadius: '8px', border: '1px solid rgba(255, 111, 97,0.2)' }}>{regError}</p>}
                  <button type="submit" className="login-btn" disabled={regLoading} style={{ marginBottom: '12px' }}>
                    {regLoading ? 'Sending Verification Code...' : 'Send Verification Code ←'}
                  </button>
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    Already have an account? <button type="button" onClick={() => { setAccountMode('login'); setRegError(''); }} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem' }}>Sign In</button>
                  </p>
                </form>
              </>
            )}

            {/* ——— REGISTER STEP 2: OTP Verification ——— */}
            {accountMode === 'register-step2' && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ color: 'var(--gold)', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </div>
                  <h2 style={{ margin: 0 }}>Verify Email</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>Step 2 of 3 — Email Verification</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
                    {[1,2,3].map(s => <div key={s} style={{ width: '28px', height: '4px', borderRadius: '2px', background: s <= 2 ? 'var(--gold)' : 'var(--border)' }} />)}
                  </div>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center', marginBottom: '20px' }}>
                  A 6-digit verification code has been sent to <strong style={{ color: 'var(--text-primary)' }}>{regEmail}</strong>
                </p>
                <form onSubmit={handleRegisterStep2}>
                  <div className="form-group">
                    <label htmlFor="reg-otp">Enter 6-Digit Verification Code</label>
                    <input id="reg-otp" type="text" inputMode="numeric" value={regOtpCode} onChange={e => setRegOtpCode(e.target.value.replace(/\D/g, '').slice(0,6))} required placeholder="000000" maxLength={6} style={{ fontSize: '1.4rem', letterSpacing: '0.3em', textAlign: 'center', fontFamily: 'monospace' }} />
                  </div>
                  {regError && <p style={{ color: '#FF6F61', fontSize: '0.85rem', marginBottom: '12px', padding: '10px 12px', background: 'rgba(255, 111, 97,0.08)', borderRadius: '8px', border: '1px solid rgba(255, 111, 97,0.2)' }}>{regError}</p>}
                  <button type="submit" className="login-btn" disabled={regLoading} style={{ marginBottom: '12px' }}>
                    {regLoading ? 'Verifying...' : 'Verify Email ←'}
                  </button>
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    Wrong email? <button type="button" onClick={() => { setAccountMode('register-step1'); setRegError(''); setRegOtpCode(''); }} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem' }}>Go Back</button>
                  </p>
                </form>
              </>
            )}

            {/* ——— REGISTER STEP 3: Password + Address + Extra ——— */}
            {accountMode === 'register-step3' && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ color: 'var(--gold)', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  </div>
                  <h2 style={{ margin: 0 }}>Complete Setup</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>Step 3 of 3 — Password & Address</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
                    {[1,2,3].map(s => <div key={s} style={{ width: '28px', height: '4px', borderRadius: '2px', background: 'var(--gold)' }} />)}
                  </div>
                </div>
                <form onSubmit={handleRegisterStep3}>
                  <div className="form-group">
                    <label htmlFor="reg-pass">Set Password * (min 6 characters)</label>
                    <div style={{ position: 'relative' }}>
                      <input id="reg-pass" type={showRegPassword ? 'text' : 'password'} value={regPassword} onChange={e => setRegPassword(e.target.value)} required style={{ paddingRight: '44px', width: '100%', boxSizing: 'border-box' }} placeholder="Minimum 6 characters" />
                      <button type="button" onClick={() => setShowRegPassword(p => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0', display: 'flex' }}>
                        {showRegPassword ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="reg-cpass">Confirm Password *</label>
                    <div style={{ position: 'relative' }}>
                      <input id="reg-cpass" type={showRegConfirmPassword ? 'text' : 'password'} value={regConfirmPassword} onChange={e => setRegConfirmPassword(e.target.value)} required style={{ paddingRight: '44px', width: '100%', boxSizing: 'border-box' }} placeholder="Re-enter your password" />
                      <button type="button" onClick={() => setShowRegConfirmPassword(p => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0', display: 'flex' }}>
                        {showRegConfirmPassword ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="reg-address">Home Address</label>
                    <textarea id="reg-address" value={regAddress} onChange={e => setRegAddress(e.target.value)} placeholder="Enter your delivery address (Street, City, State, PIN)" rows={3} style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.92rem', fontFamily: 'inherit', resize: 'vertical', transition: 'border-color var(--transition)' }} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="reg-extra">Additional Details <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>(optional)</span></label>
                    <textarea id="reg-extra" value={regExtraDetails} onChange={e => setRegExtraDetails(e.target.value)} placeholder="Special delivery instructions, alternate contact, etc." rows={2} style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.92rem', fontFamily: 'inherit', resize: 'vertical', transition: 'border-color var(--transition)' }} />
                  </div>
                  {regError && <p style={{ color: '#FF6F61', fontSize: '0.85rem', marginBottom: '12px', padding: '10px 12px', background: 'rgba(255, 111, 97,0.08)', borderRadius: '8px', border: '1px solid rgba(255, 111, 97,0.2)' }}>{regError}</p>}
                  <button type="submit" className="login-btn" disabled={regLoading}>
                    {regLoading ? 'Creating Account...' : '& Create My Account'}
                  </button>
                </form>
              </>
            )}

            {/* ——— DASHBOARD MODE ——— */}
            {/* Dashboard is rendered full screen outside this modal now */}

            {/* ——— PROFILE MODE ——— */}
            {accountMode === 'profile' && currentUser && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--gold-gradient-btn)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', boxShadow: '0 4px 16px rgba(201,168,76,0.3)' }}>
                    {currentUser.name?.charAt(0)?.toUpperCase() || <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                  </div>
                  <h2 style={{ margin: '0 0 4px' }}>{currentUser.name}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>{currentUser.email}</p>
                </div>

                {!profileEditMode ? (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                      {[
                        { icon: '📤', label: 'Mobile', value: currentUser.mobile || '—' },
                        { icon: '🏡', label: 'Address', value: currentUser.address || 'No address added yet' },
                        { icon: '📤', label: 'Extra Details', value: currentUser.extraDetails || '—' },
                      ].map(item => (
                        <div key={item.label} style={{ padding: '12px 16px', background: 'var(--bg-input)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '4px' }}>{item.icon} {item.label}</div>
                          <div style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        className="login-btn"
                        style={{ flex: 1 }}
                        onClick={() => {
                          setProfileMobile(currentUser.mobile || '');
                          setProfileAddress(currentUser.address || '');
                          setProfileExtraDetails(currentUser.extraDetails || '');
                          setProfileError('');
                          setProfileEditMode(true);
                        }}
                      >
                        Edit Profile
                      </button>
                      <button
                        onClick={handleUserLogout}
                        style={{ flex: 1, padding: '13px', background: 'rgba(255, 111, 97,0.08)', border: '1.5px solid rgba(255, 111, 97,0.3)', borderRadius: '10px', color: '#FF6F61', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', letterSpacing: '0.05em' }}
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <form onSubmit={handleProfileUpdate}>
                    <div className="form-group">
                      <label htmlFor="profile-mobile">Mobile Number (10 digits)</label>
                      <input id="profile-mobile" type="tel" value={profileMobile} onChange={e => setProfileMobile(e.target.value.replace(/\D/g, '').slice(0,10))} placeholder="9876543210" maxLength={10} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="profile-address">Home Address</label>
                      <textarea id="profile-address" value={profileAddress} onChange={e => setProfileAddress(e.target.value)} placeholder="Enter your delivery address" rows={3} style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.92rem', fontFamily: 'inherit', resize: 'vertical' }} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="profile-extra">Additional Details</label>
                      <textarea id="profile-extra" value={profileExtraDetails} onChange={e => setProfileExtraDetails(e.target.value)} placeholder="Special instructions, notes..." rows={2} style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.92rem', fontFamily: 'inherit', resize: 'vertical' }} />
                    </div>
                    {profileError && <p style={{ color: '#FF6F61', fontSize: '0.85rem', marginBottom: '12px', padding: '10px 12px', background: 'rgba(255, 111, 97,0.08)', borderRadius: '8px' }}>{profileError}</p>}
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="button" onClick={() => { setProfileEditMode(false); setProfileError(''); }} style={{ flex: 1, padding: '13px', background: 'var(--bg-input)', border: '1.5px solid var(--border)', borderRadius: '10px', color: 'var(--text-primary)', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>
                        Cancel
                      </button>
                      <button type="submit" className="login-btn" style={{ flex: 1 }} disabled={profileLoading}>
                        {profileLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

          </div>
        </div>
      )}

      {/* —— FULL PAGE CUSTOMER DASHBOARD —— */}
      {accountOpen && accountMode === 'dashboard' && currentUser && (
        <CustomerDashboard
          user={currentUser}
          token={userToken}
          onClose={closeAccountModal}
          onLogout={handleUserLogout}
          initialTab={dashboardInitialTab}
          cartItems={cartItems}
          wishlist={wishlist}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
          removeFromWishlist={removeFromWishlist}
        />
      )}

      {/* Global Invoice View — works for admin viewing and post-payment customer invoices */}
      {selectedInvoiceOrder && (
        <InvoiceView order={selectedInvoiceOrder} onClose={() => setSelectedInvoiceOrder(null)} />
      )}

      <ToastContainer />

      {/* Flying balloon animation — triggers on add-to-cart / add-to-wishlist */}
      {flyAnim && (
        <FlyAnimation
          startX={flyAnim.startX}
          startY={flyAnim.startY}
          targetSelector={flyAnim.target}
          onComplete={() => setFlyAnim(null)}
        />
      )}
    </div>
  );
}

/* ═══════════ ROOT APP ═══════════ */
function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <ToastProvider>
          <InnerApp />
        </ToastProvider>
      </WishlistProvider>
    </CartProvider>
  );
}

export default App;
