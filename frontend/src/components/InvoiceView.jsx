import React from 'react';

const InvoiceView = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=800,width=800');
    if (!printWindow) {
      alert("Please allow popups to print the invoice.");
      return;
    }
    const invoiceHTML = document.querySelector('.invoice-container').outerHTML;
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.orderId}</title>
          <style>
            body { font-family: 'Inter', sans-serif; margin: 0; padding: 20px; color: #333; }
            .invoice-container { max-width: 800px; margin: 0 auto; }
            .invoice-header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
            .invoice-logo { max-height: 60px; margin-bottom: 10px; }
            .invoice-title { font-size: 2.5rem; font-weight: bold; margin: 0; text-transform: uppercase; }
            .invoice-meta { display: flex; justify-content: space-between; margin-bottom: 30px; gap: 20px; }
            .invoice-box { background: #f9f9f9; padding: 15px; border-radius: 6px; flex: 1; }
            .invoice-box h4 { margin: 0 0 10px 0; color: #666; font-size: 0.9rem; text-transform: uppercase; }
            .invoice-box p { margin: 4px 0; font-size: 0.95rem; }
            .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .invoice-table th, .invoice-table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; }
            .invoice-table th { background: #f9f9f9; font-weight: 600; }
            .invoice-summary { width: 300px; margin-left: auto; }
            .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .summary-row.total { font-weight: bold; font-size: 1.2rem; border-bottom: none; border-top: 2px solid #333; padding-top: 12px; margin-top: 4px; }
            .invoice-actions { display: none !important; }
            @media print {
              body, html { margin: 0; padding: 0; }
            }
          </style>
        </head>
        <body>
          ${invoiceHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownloadPDF = () => {
    const overlay = document.querySelector('.invoice-overlay');
    const originalScrollTop = overlay ? overlay.scrollTop : 0;
    if (overlay) overlay.scrollTop = 0;

    const element = document.querySelector('.invoice-container');
    if (!element) {
      alert('Invoice content not found. Please try again.');
      return;
    }

    // Hide buttons during PDF generation
    const actions = element.querySelector('.invoice-actions');
    if (actions) actions.style.display = 'none';

    const opt = {
      margin:       10,
      filename:     `Invoice_${order.orderId}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, scrollY: 0, scrollX: 0 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (window.html2pdf) {
      window.html2pdf().set(opt).from(element).save().then(() => {
        if (actions) actions.style.display = 'flex';
        if (overlay) overlay.scrollTop = originalScrollTop;
      }).catch(() => {
        if (actions) actions.style.display = 'flex';
        if (overlay) overlay.scrollTop = originalScrollTop;
      });
    } else {
      alert("PDF library is loading. Please try again in a moment.");
      if (actions) actions.style.display = 'flex';
      if (overlay) overlay.scrollTop = originalScrollTop;
    }
  };

  return (
    <div className="invoice-overlay">
      <style>{`
        .invoice-overlay {
          position: fixed;
          top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.8);
          z-index: 9999;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          overflow-y: auto;
          padding: 40px 20px;
          backdrop-filter: blur(5px);
        }
        .invoice-container {
          background: #fff;
          color: #000;
          width: 100%;
          max-width: 800px;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          position: relative;
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .invoice-logo {
          max-height: 60px;
          margin-bottom: 10px;
        }
        .invoice-title {
          font-size: 2.5rem;
          font-weight: bold;
          color: #333;
          text-transform: uppercase;
          margin: 0;
        }
        .invoice-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          gap: 20px;
        }
        .invoice-box {
          background: #f9f9f9;
          padding: 15px;
          border-radius: 6px;
          flex: 1;
        }
        .invoice-box h4 {
          margin: 0 0 10px 0;
          color: #666;
          font-size: 0.9rem;
          text-transform: uppercase;
        }
        .invoice-box p {
          margin: 4px 0;
          font-size: 0.95rem;
        }
        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .invoice-table th, .invoice-table td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        .invoice-table th {
          background: #f9f9f9;
          font-weight: 600;
          color: #333;
        }
        .invoice-table td {
          color: #555;
        }
        .invoice-summary {
          width: 300px;
          margin-left: auto;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .summary-row.total {
          font-weight: bold;
          font-size: 1.2rem;
          border-bottom: none;
          border-top: 2px solid #333;
          padding-top: 12px;
          margin-top: 4px;
        }
        .invoice-actions {
          display: flex;
          justify-content: flex-end;
          gap: 15px;
          margin-top: 40px;
        }
        .btn-print {
          background: #2563eb;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }
        .btn-close {
          background: #e5e7eb;
          color: #374151;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }
        @media (max-width: 600px) {
          .invoice-overlay {
            padding: 10px 5px;
          }
          .invoice-container {
            padding: 15px;
            border-radius: 6px;
          }
          .invoice-header {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start !important;
            text-align: left !important;
          }
          .invoice-header div:last-child {
            text-align: left !important;
          }
          .invoice-title {
            font-size: 1.8rem;
          }
          .invoice-meta {
            flex-direction: column;
            gap: 12px;
          }
          .invoice-table th, .invoice-table td {
            padding: 8px 10px;
            font-size: 0.85rem;
          }
          .invoice-summary {
            width: 100%;
          }
          .invoice-actions {
            flex-direction: column;
            gap: 10px;
          }
          .invoice-actions button {
            width: 100%;
            text-align: center;
            justify-content: center;
          }
        }
      `}</style>
      <div className="invoice-container">
        <div className="invoice-header">
          <div>
            <img src="/royal_logo.png" alt="Parisu Ulagam" className="invoice-logo" />
            <div style={{ color: '#555', fontSize: '0.9rem' }}>
              <strong>Parisu Ulagam</strong><br />
              123 Royal Street, Crafts District<br />
              Chennai, Tamil Nadu, India<br />
              thesmgroups@gmail.com | +91 94883 16728
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 className="invoice-title">Invoice</h1>
            <p style={{ margin: '10px 0 0 0', color: '#666' }}>Order ID: <strong>{order.orderId}</strong></p>
            <p style={{ margin: '4px 0 0 0', color: '#666' }}>Date: {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
          </div>
        </div>

        <div className="invoice-meta">
          <div className="invoice-box">
            <h4>Billed To</h4>
            <p><strong>{order.customerName}</strong></p>
            <p>{order.userEmail}</p>
            <p>{order.customerPhone}</p>
          </div>
          <div className="invoice-box">
            <h4>Shipping Address</h4>
            <p style={{ whiteSpace: 'pre-wrap' }}>{order.shippingAddress || 'N/A'}</p>
          </div>
          <div className="invoice-box">
            <h4>Payment Info</h4>
            <p>Status: <strong style={{ color: order.paymentStatus === 'Paid' ? '#16a34a' : '#ea580c' }}>{order.paymentStatus}</strong></p>
            {order.razorpayPaymentId && <p>Txn ID: {order.razorpayPaymentId}</p>}
            <p>Method: {order.shippingMethod || 'Standard'}</p>
          </div>
        </div>

        <table className="invoice-table">
          <thead>
            <tr>
              <th>Item Description</th>
              <th style={{ textAlign: 'center' }}>Qty</th>
              <th style={{ textAlign: 'right' }}>Price</th>
              <th style={{ textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => {
              const displayImg = item.selectedImage || item.image;
              return (
                <tr key={idx}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {displayImg && <img src={displayImg} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #eee' }} />}
                    <div>
                      <div style={{ fontWeight: '600' }}>{item.name}</div>
                      {item.selectedImage && (
                        <div style={{ fontSize: '0.75rem', color: '#b5882e', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.35857 19.5 5.5 20 5.5 20.5C5.5 21.3284 6.17157 22 7 22H12Z"/><circle cx="7.5" cy="10.5" r="1.5"/><circle cx="11.5" cy="7.5" r="1.5"/><circle cx="16.5" cy="9.5" r="1.5"/><circle cx="15.5" cy="14.5" r="1.5"/></svg> Selected Color Variant
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>₹{item.price.toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="invoice-summary">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>₹{(order.subtotal || order.totalAmount - (order.shippingCharge || 0)).toLocaleString('en-IN')}</span>
          </div>
          <div className="summary-row">
            <span>Shipping:</span>
            <span>₹{(order.shippingCharge || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="summary-row total">
            <span>Grand Total:</span>
            <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="invoice-actions">
          <button className="btn-close" onClick={onClose}>Close</button>
          <button className="btn-print" onClick={handlePrint}>
            <svg style={{ verticalAlign: 'middle', marginRight: '6px' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Print
          </button>
          <button className="btn-print" onClick={handleDownloadPDF} style={{ background: '#10b981' }}>
            <svg style={{ verticalAlign: 'middle', marginRight: '6px' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
