import React, { useState, useContext } from 'react';
import { ToastContext } from '../context/ToastContext';

const OrderDetailsView = ({ order, token, onClose, onViewInvoice, onContactSupport, onOrderUpdate }) => {
  const { addToast } = useContext(ToastContext);
  const [loadingAction, setLoadingAction] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'cancel', 'return', 'review'
  const [returnReason, setReturnReason] = useState('');
  const [reviewData, setReviewData] = useState({ productId: '', rating: 5, comment: '' });

  if (!order) return null;

  const isCancelled = order.status === 'Cancelled';
  const isPaid = order.paymentStatus === 'Paid';
  const statusLabel = order.status === 'Payment Verification' ? 'Ordered' : order.status;

  const statusDesc = {
    'Payment Verification': 'Your order has been placed. We are verifying your payment.',
    'Packing': 'Your items are being packed carefully by our team.',
    'On the way': 'Your package is on its way to you!',
    'Delivered': 'Your order has been delivered successfully.',
    'Cancelled': 'This order has been cancelled.',
  };

  const handleCancelOrder = async () => {
    setLoadingAction('cancel');
    try {
      const res = await fetch('/api/users/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-token': token },
        body: JSON.stringify({ orderId: order.orderId })
      });
      const data = await res.json();
      if (res.status === 401 && onLogout) {
        onLogout();
        return;
      }
      if (data.success) {
        addToast('Order cancelled successfully.', 'success');
        onOrderUpdate && onOrderUpdate();
      } else {
        addToast(data.message || 'Failed to cancel order.', 'error');
      }
    } catch (err) {
      addToast('An error occurred.', 'error');
    }
    setLoadingAction(null);
    setActiveModal(null);
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setLoadingAction('return');
    try {
      const res = await fetch('/api/users/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-token': token },
        body: JSON.stringify({ orderId: order.orderId, reason: returnReason })
      });
      const data = await res.json();
      if (res.status === 401 && onLogout) {
        onLogout();
        return;
      }
      if (data.success) {
        addToast('Return request submitted successfully.', 'success');
      } else {
        addToast(data.message || 'Failed to submit return request.', 'error');
      }
    } catch (err) {
      addToast('An error occurred.', 'error');
    }
    setLoadingAction(null);
    setActiveModal(null);
    setReturnReason('');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setLoadingAction('review');
    try {
      const res = await fetch('/api/users/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-token': token },
        body: JSON.stringify(reviewData)
      });
      const data = await res.json();
      if (res.status === 401 && onLogout) {
        onLogout();
        return;
      }
      if (data.success) {
        addToast('Review submitted successfully.', 'success');
      } else {
        addToast(data.message || 'Failed to submit review.', 'error');
      }
    } catch (err) {
      addToast('An error occurred.', 'error');
    }
    setLoadingAction(null);
    setActiveModal(null);
    setReviewData({ productId: '', rating: 5, comment: '' });
  };

  const handleShare = async () => {
    const shareText = `Order ${order.orderId} from Parisu Ulagam\nTotal: ₹${order.totalAmount}\nStatus: ${order.status}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Order Details',
          text: shareText,
        });
      } catch (err) {
        console.log('Share cancelled', err);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      addToast('Order details copied to clipboard.', 'success');
    }
  };

  const canCancel = !isCancelled && !['On the way', 'Delivered'].includes(order.status);
  const canReturn = order.status === 'Delivered';

  const secondaryBtns = [
    { label: 'Contact support', action: onContactSupport },
    ...(canCancel ? [{ label: 'Request cancellation', action: () => setActiveModal('cancel') }] : []),
    { 
      label: 'Return or replace items', 
      action: () => {
        if (canReturn) {
          setActiveModal('return');
        } else {
          addToast('You can only request a replacement or return after the item has been delivered.', 'error');
        }
      } 
    },
    { label: 'Share order details', action: handleShare },
    { 
      label: 'Write a product review', 
      action: () => {
        if (order.status === 'Delivered') {
          setReviewData({ productId: order.items[0]?.productId || '', rating: 5, comment: '' });
          setActiveModal('review');
        } else {
          addToast('You can only write a review after the item has been delivered.', 'error');
        }
      }
    },
  ];

  return (
    <>
      <div id="order-details-overlay" onClick={(e) => { if (e.target.id === 'order-details-overlay') onClose(); }}
        style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.62)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '24px 12px', backdropFilter: 'blur(4px)' }}>
        <div style={{ width: '100%', maxWidth: '880px', background: 'var(--bg-card)', borderRadius: '16px', boxShadow: '0 24px 70px rgba(0,0,0,0.45)', overflow: 'hidden' }}>
          
          {/* TOP BAR */}
          <div style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)', padding: '13px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span style={{ cursor: 'pointer', color: '#2563eb' }} onClick={onClose}>Your Account</span>
              <span>&rsaquo;</span>
              <span style={{ cursor: 'pointer', color: '#2563eb' }} onClick={onClose}>Your Orders</span>
              <span>&rsaquo;</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Order Details</span>
            </nav>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', display: 'flex' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div style={{ padding: '28px 28px 36px' }}>
            {/* HEADING + INVOICE BUTTON */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '6px' }}>
              <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)' }}>Order Details</h1>
              {isPaid && (
                <button onClick={() => { onClose(); if (onViewInvoice) onViewInvoice(order); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: '#2563eb', fontSize: '0.87rem', fontWeight: '700', cursor: 'pointer' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  Invoice
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              )}
            </div>

            {/* ORDER META */}
            <p style={{ margin: '4px 0 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Order placed{' '}<strong style={{ color: 'var(--text-primary)' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
              {' '}&nbsp;&middot;&nbsp;{' '}Order number{' '}<strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{order.orderId}</strong>
            </p>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0 0 24px' }} />

            {/* THREE-COLUMN INFO GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '24px', marginBottom: '26px' }}>
              <div>
                <h4 style={{ margin: '0 0 8px', fontSize: '0.88rem', fontWeight: '700' }}>Ship to</h4>
                {order.customerName && <p style={{ margin: '0 0 3px', fontWeight: '700', fontSize: '0.86rem', textTransform: 'uppercase' }}>{order.customerName}</p>}
                <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{order.shippingAddress || 'N/A'}</p>
                {order.customerPhone && <p style={{ margin: '5px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ph: {order.customerPhone}</p>}
              </div>
              <div>
                <h4 style={{ margin: '0 0 8px', fontSize: '0.88rem', fontWeight: '700' }}>Payment method</h4>
                <p style={{ margin: '0 0 3px', fontSize: '0.83rem', color: 'var(--text-muted)' }}>{order.razorpayPaymentId ? 'Online Payment (Razorpay)' : 'Cash on Delivery'}</p>
                {order.razorpayPaymentId && <p style={{ margin: '0 0 6px', fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>Txn: {order.razorpayPaymentId}</p>}
                <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700', background: isPaid ? 'rgba(34,197,94,0.12)' : 'rgba(217,119,6,0.12)', color: isPaid ? '#16a34a' : '#d97706', border: `1px solid ${isPaid ? 'rgba(34,197,94,0.3)' : 'rgba(217,119,6,0.3)'}` }}>{isPaid ? '✓ Paid' : 'Payment Pending'}</span>
              </div>
              <div>
                <h4 style={{ margin: '0 0 8px', fontSize: '0.88rem', fontWeight: '700' }}>Order Summary</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.83rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}><span style={{ color: 'var(--text-muted)' }}>Item(s) Subtotal:</span><span>₹{(order.subtotal || order.totalAmount || 0).toLocaleString('en-IN')}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}><span style={{ color: 'var(--text-muted)' }}>Shipping:</span><span>₹{(order.shippingCharge || 0).toLocaleString('en-IN')}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}><span style={{ color: 'var(--text-muted)' }}>Total:</span><span>₹{(order.totalAmount || 0).toLocaleString('en-IN')}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', borderTop: '1px solid var(--border)', paddingTop: '6px', marginTop: '4px' }}>
                    <span style={{ fontWeight: '700' }}>Grand Total:</span><span style={{ fontWeight: '800', color: 'var(--gold)' }}>₹{(order.totalAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0 0 22px' }} />

            {/* STATUS BANNER */}
            <div style={{ padding: '13px 18px', borderRadius: '10px', marginBottom: '22px', background: isCancelled ? 'rgba(255, 111, 97,0.08)' : 'rgba(37,99,235,0.06)', border: `1px solid ${isCancelled ? 'rgba(255, 111, 97,0.2)' : 'rgba(37,99,235,0.18)'}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, background: isCancelled ? '#FF6F61' : '#2563eb', boxShadow: `0 0 0 4px ${isCancelled ? 'rgba(255, 111, 97,0.18)' : 'rgba(37,99,235,0.18)'}` }} />
              <div>
                <p style={{ margin: 0, fontWeight: '700', fontSize: '0.92rem', color: isCancelled ? '#FF6F61' : '#2563eb' }}>{statusLabel}</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{statusDesc[order.status] || ''}</p>
              </div>
            </div>

            {/* COURIER TRACKING */}
            {(order.courierName || order.courierTrackingId) && !isCancelled && (
              <div style={{ marginBottom: '22px', padding: '14px 18px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <p style={{ margin: '0 0 8px', fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Courier Tracking</p>
                <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', fontSize: '0.84rem' }}>
                  {order.courierName && <div><span style={{ color: 'var(--text-muted)' }}>Courier: </span><strong>{order.courierName}</strong></div>}
                  {order.courierTrackingId && <div><span style={{ color: 'var(--text-muted)' }}>Tracking ID: </span><strong style={{ fontFamily: 'monospace', color: 'var(--gold)' }}>{order.courierTrackingId}</strong></div>}
                </div>
              </div>
            )}

            {/* ITEMS + ACTIONS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '28px', alignItems: 'start' }}>
              <div>
                <p style={{ margin: '0 0 14px', fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  {order.status === 'Delivered' ? 'Delivered items' : isCancelled ? 'Items in this order' : 'Arriving items'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {order.items.map((item, idx) => {
                    const itemImg = item.selectedImage || item.image;
                    return (
                      <div key={idx} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                        {itemImg && <img src={itemImg} alt={item.name} style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)', flexShrink: 0 }} />}
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: '0 0 4px', fontWeight: '600', fontSize: '0.91rem', lineHeight: '1.4' }}>{item.name}</p>
                          {item.selectedImage && item.selectedImage !== item.image && (
                            <p style={{ margin: '0 0 4px', fontSize: '0.74rem', color: 'var(--gold)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.35857 19.5 5.5 20 5.5 20.5C5.5 21.3284 6.17157 22 7 22H12Z"/><circle cx="7.5" cy="10.5" r="1.5"/><circle cx="11.5" cy="7.5" r="1.5"/><circle cx="16.5" cy="9.5" r="1.5"/><circle cx="15.5" cy="14.5" r="1.5"/></svg>
                              Color variant selected
                            </p>
                          )}
                          <p style={{ margin: '0 0 2px', fontSize: '0.79rem', color: 'var(--text-muted)' }}>Sold by: <strong>Parisu Ulagam</strong></p>
                          <p style={{ margin: '0 0 2px', fontSize: '0.79rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</p>
                          <p style={{ margin: '4px 0 0', fontSize: '0.87rem', fontWeight: '700', color: 'var(--gold)' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '190px' }}>
                {isPaid && (
                  <button onClick={() => { onClose(); if (onViewInvoice) onViewInvoice(order); }}
                    style={{ padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', background: 'var(--gold)', color: '#1a1a1a', border: 'none', fontWeight: '700', fontSize: '0.83rem', width: '100%' }}>
                    View Invoice
                  </button>
                )}
                {order.courierTrackingId && !isCancelled && (
                  <button style={{ padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', background: 'var(--gold)', color: '#1a1a1a', border: 'none', fontWeight: '700', fontSize: '0.83rem', width: '100%' }}>Track package</button>
                )}
                {secondaryBtns.map(({ label, action }) => (
                  <button key={label} onClick={action || undefined}
                    style={{ padding: '9px 14px', borderRadius: '8px', cursor: 'pointer', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border)', fontWeight: '500', fontSize: '0.82rem', width: '100%' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {activeModal === 'cancel' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2010, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.2rem' }}>Cancel Order</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px' }}>Are you sure you want to cancel this order? This action cannot be undone.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>Keep Order</button>
              <button onClick={handleCancelOrder} disabled={loadingAction === 'cancel'} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#FF6F61', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
                {loadingAction === 'cancel' ? 'Cancelling...' : 'Yes, Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'return' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2010, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '450px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.2rem' }}>Return / Replace Items</h3>
            <form onSubmit={handleReturnSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: '600' }}>Reason for Return</label>
                <textarea 
                  required rows={4} 
                  value={returnReason} 
                  onChange={e => setReturnReason(e.target.value)}
                  placeholder="Please describe why you are returning this item..."
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                ></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={loadingAction === 'return'} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: 'var(--gold)', color: '#1a1a1a', cursor: 'pointer', fontWeight: 'bold' }}>
                  {loadingAction === 'return' ? 'Submitting...' : 'Submit Return Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'review' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2010, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '450px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.2rem' }}>Write a Product Review</h3>
            <form onSubmit={handleReviewSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: '600' }}>Select Product</label>
                <select 
                  required
                  value={reviewData.productId}
                  onChange={e => setReviewData({...reviewData, productId: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                >
                  <option value="">-- Choose a product --</option>
                  {order.items.map((it, i) => (
                    <option key={i} value={it.productId}>{it.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: '600' }}>Rating</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1,2,3,4,5].map(star => (
                    <button type="button" key={star} onClick={() => setReviewData({...reviewData, rating: star})} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: star <= reviewData.rating ? '#eab308' : 'var(--border)' }}>
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: '600' }}>Comment (Optional)</label>
                <textarea 
                  rows={3} 
                  value={reviewData.comment} 
                  onChange={e => setReviewData({...reviewData, comment: e.target.value})}
                  placeholder="What did you like or dislike?"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                ></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={loadingAction === 'review'} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: 'var(--gold)', color: '#1a1a1a', cursor: 'pointer', fontWeight: 'bold' }}>
                  {loadingAction === 'review' ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderDetailsView;
