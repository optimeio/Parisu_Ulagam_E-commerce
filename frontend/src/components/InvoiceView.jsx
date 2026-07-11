import React from 'react';

/**
 * Convert a number to Indian words (for amount in words on invoice).
 */
function numberToWords(num) {
  if (num === 0) return 'Zero';
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
    'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];

  function convertLessThanThousand(n) {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLessThanThousand(n % 100) : '');
  }

  let result = '';
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const remainder = num;

  if (crore) result += convertLessThanThousand(crore) + ' Crore ';
  if (lakh) result += convertLessThanThousand(lakh) + ' Lakh ';
  if (thousand) result += convertLessThanThousand(thousand) + ' Thousand ';
  if (remainder) result += convertLessThanThousand(remainder);

  return result.trim();
}

const GST_RATE = 18; // 18% GST included in price
const CGST_RATE = GST_RATE / 2; // 9%
const SGST_RATE = GST_RATE / 2; // 9%

const InvoiceView = ({ order, onClose }) => {
  if (!order) return null;

  // Compute GST breakdown for each item (GST is INCLUDED in price)
  const itemsWithGST = order.items.map((item, idx) => {
    const totalPrice = item.price * item.quantity;
    const taxableValue = +(totalPrice / (1 + GST_RATE / 100)).toFixed(2);
    const cgstAmount = +((taxableValue * CGST_RATE) / 100).toFixed(2);
    const sgstAmount = +((taxableValue * SGST_RATE) / 100).toFixed(2);
    return {
      ...item,
      sno: idx + 1,
      hsn: '9988',  // Generic HSN for gift items / handicrafts
      rate: item.price,
      taxableValue,
      cgstAmount,
      sgstAmount,
      totalWithGST: totalPrice,
    };
  });

  // Totals
  const subtotal = order.subtotal || (order.totalAmount - (order.shippingCharge || 0));
  const totalTaxable = itemsWithGST.reduce((s, i) => s + i.taxableValue, 0);
  const totalCGST = itemsWithGST.reduce((s, i) => s + i.cgstAmount, 0);
  const totalSGST = itemsWithGST.reduce((s, i) => s + i.sgstAmount, 0);
  const totalTax = totalCGST + totalSGST;
  const shippingCharge = order.shippingCharge || 0;
  const grandTotal = order.totalAmount;

  const invoiceDate = new Date(order.createdAt);
  const formattedDate = invoiceDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // Challan / Invoice number derived from orderId
  const invoiceNo = order.orderId;

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=900,width=900');
    if (!printWindow) { alert("Please allow popups."); return; }
    const invoiceHTML = document.querySelector('.tax-invoice-container').outerHTML;
    printWindow.document.write(`
      <html>
        <head>
          <title>Tax Invoice - ${order.orderId}</title>
          <style>
            *, *::before, *::after { box-sizing: border-box; }
            body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 15px; color: #333; font-size: 12px; }
            .tax-invoice-container { max-width: 800px; margin: 0 auto; }
            .ti-actions { display: none !important; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ccc; padding: 6px 8px; font-size: 11px; }
            @media print { body { padding: 0; } .ti-actions { display: none !important; } }
          </style>
        </head>
        <body>${invoiceHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
  };

  const handleDownloadPDF = () => {
    const overlay = document.querySelector('.invoice-overlay');
    const originalScrollTop = overlay ? overlay.scrollTop : 0;
    if (overlay) overlay.scrollTop = 0;
    const element = document.querySelector('.tax-invoice-container');
    if (!element) { alert('Invoice content not found.'); return; }
    const actions = element.querySelector('.ti-actions');
    if (actions) actions.style.display = 'none';
    const opt = {
      margin: 6,
      filename: `TaxInvoice_${order.orderId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0, scrollX: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
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
      alert("PDF library is loading. Please try again.");
      if (actions) actions.style.display = 'flex';
      if (overlay) overlay.scrollTop = originalScrollTop;
    }
  };

  /* ── Inline styles ── */
  const s = {
    overlay: {
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex',
      justifyContent: 'center', alignItems: 'flex-start',
      overflowY: 'auto', padding: '30px 12px', backdropFilter: 'blur(5px)',
    },
    container: {
      background: '#fff', color: '#000', width: '100%', maxWidth: '820px',
      borderRadius: '6px', padding: '0', boxShadow: '0 10px 40px rgba(0,0,0,0.35)',
      fontFamily: "'Inter', Arial, sans-serif", fontSize: '12px', lineHeight: 1.5,
      overflow: 'hidden',
    },
    // Red header bar
    topBar: {
      background: '#012a32', color: '#fff', textAlign: 'center',
      padding: '10px 20px', fontWeight: '800', fontSize: '13px',
      letterSpacing: '0.12em', textTransform: 'uppercase',
    },
    // Company header
    companyRow: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '16px 28px', borderBottom: '1px solid #eee',
    },
    companyName: { fontSize: '22px', fontWeight: '900', color: '#012a32', letterSpacing: '-0.01em' },
    companyNameAccent: { color: '#C08D46' },
    companyAddr: { fontSize: '10px', color: '#666', marginTop: '4px', lineHeight: 1.4 },
    logoBox: { width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #eee' },
    // Body
    body: { padding: '0 28px 28px' },
    // Info grid
    infoGrid: { display: 'flex', gap: '0', marginBottom: '16px', border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' },
    infoCol: { flex: 1, padding: '10px 14px', borderRight: '1px solid #ccc' },
    infoColLast: { flex: 1, padding: '10px 14px' },
    infoLabel: { fontSize: '10px', color: '#888', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' },
    infoVal: { fontSize: '12px', fontWeight: '600', color: '#222' },
    // Table
    th: { background: '#012a32', color: '#fff', fontWeight: '700', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '8px 6px', border: '1px solid #012a32', textAlign: 'center', whiteSpace: 'nowrap' },
    td: { padding: '7px 6px', border: '1px solid #ddd', textAlign: 'center', fontSize: '11px', color: '#333' },
    tdLeft: { padding: '7px 6px', border: '1px solid #ddd', textAlign: 'left', fontSize: '11px', color: '#333' },
    tdRight: { padding: '7px 6px', border: '1px solid #ddd', textAlign: 'right', fontSize: '11px', color: '#333', fontWeight: '600' },
    // Amount in words
    wordsRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee', marginBottom: '12px' },
    wordsLabel: { fontSize: '10px', color: '#888', fontWeight: '700', textTransform: 'uppercase' },
    wordsVal: { fontSize: '11px', fontWeight: '600', color: '#222', fontStyle: 'italic' },
    // Summary (right-aligned)
    summaryBox: { marginLeft: 'auto', width: '280px' },
    sumRow: { display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '11px', borderBottom: '1px solid #f0f0f0' },
    sumTotal: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px', fontWeight: '800', borderTop: '2px solid #012a32', marginTop: '4px', color: '#012a32' },
    // Bank details
    bankBox: { border: '1px solid #ddd', borderRadius: '4px', padding: '12px 14px', marginTop: '16px', background: '#fafafa' },
    bankTitle: { fontSize: '11px', fontWeight: '800', color: '#1a1a2e', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' },
    bankRow: { display: 'flex', gap: '8px', fontSize: '11px', marginBottom: '3px' },
    bankLabel: { fontWeight: '700', color: '#666', minWidth: '110px' },
    bankVal: { fontWeight: '600', color: '#222' },
    // Actions
    actions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 28px', borderTop: '1px solid #eee', background: '#fafafa' },
    btnClose: { background: '#e5e7eb', color: '#374151', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' },
    btnPrint: { background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' },
    btnPdf: { background: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' },
  };

  return (
    <div style={s.overlay} className="invoice-overlay">
      <style>{`
        @media (max-width: 600px) {
          .tax-invoice-container {
            margin: 10px auto !important;
            border-radius: 4px !important;
            font-size: 11px !important;
          }
          .ti-company-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
            padding: 16px 14px !important;
          }
          .ti-info-grid {
            flex-direction: column !important;
            border: none !important;
            gap: 8px !important;
            margin-bottom: 12px !important;
            background: transparent !important;
          }
          .ti-info-col, .ti-info-col-last {
            border: 1px solid #ccc !important;
            border-radius: 4px !important;
            margin-bottom: 0 !important;
            padding: 8px 10px !important;
            background: #fafafa !important;
            width: 100% !important;
            flex: none !important;
          }
          .ti-table-wrapper {
            width: 100% !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            margin-bottom: 16px !important;
            border: 1px solid #ddd !important;
            border-radius: 4px !important;
          }
          .ti-table-wrapper table {
            min-width: 600px !important;
          }
          .ti-summary-box {
            width: 100% !important;
            margin-left: 0 !important;
          }
          .ti-body {
            padding: 0 14px 14px !important;
          }
          .ti-actions {
            padding: 12px 14px !important;
            flex-wrap: wrap !important;
            justify-content: center !important;
            gap: 8px !important;
          }
          .ti-actions button {
            flex: 1 1 auto !important;
            font-size: 11px !important;
            padding: 8px 14px !important;
          }
        }
      `}</style>
      <div style={s.container} className="tax-invoice-container">

        {/* ── Red "TAX INVOICE" Banner ── */}
        <div style={s.topBar}>Tax Invoice</div>

        {/* ── Company Header ── */}
        <div style={s.companyRow} className="ti-company-row">
          <div>
            <div style={s.companyName}>
              PARISU <span style={s.companyNameAccent}>ULAGAM</span>
            </div>
            <div style={s.companyAddr}>
              IInd Floor, OM Shiva Towers, 259-B, Advaitha Ashram Rd,<br />
              Fairlands, Salem, Tamil Nadu – 636004
            </div>
          </div>
          <div style={s.logoBox}>
            <img src="/royal_logo.png" alt="Parisu Ulagam" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        </div>

        <div style={s.body} className="ti-body">

          {/* ── Invoice Details Grid ── */}
          <div style={s.infoGrid} className="ti-info-grid">
            <div style={s.infoCol} className="ti-info-col">
              <div style={s.infoLabel}>Invoice (Or) Bill No</div>
              <div style={s.infoVal}>{invoiceNo}</div>
            </div>
            <div style={s.infoCol} className="ti-info-col">
              <div style={s.infoLabel}>Invoice Date</div>
              <div style={s.infoVal}>{formattedDate}</div>
            </div>
            <div style={s.infoCol} className="ti-info-col">
              <div style={s.infoLabel}>Challan No</div>
              <div style={s.infoVal}>{invoiceNo}</div>
            </div>
            <div style={s.infoColLast} className="ti-info-col-last">
              <div style={s.infoLabel}>Challan Date</div>
              <div style={s.infoVal}>{formattedDate}</div>
            </div>
          </div>

          <div style={s.infoGrid} className="ti-info-grid">
            <div style={s.infoCol} className="ti-info-col">
              <div style={s.infoLabel}>Buyer</div>
              <div style={s.infoVal}>{order.customerName}</div>
            </div>
            <div style={s.infoCol} className="ti-info-col">
              <div style={s.infoLabel}>Invoice No</div>
              <div style={s.infoVal}>{invoiceNo}</div>
            </div>
            <div style={s.infoColLast} className="ti-info-col-last">
              <div style={s.infoLabel}>Delivery Mode</div>
              <div style={s.infoVal}>{order.shippingMethod || 'Standard'}</div>
            </div>
          </div>

          <div style={s.infoGrid} className="ti-info-grid">
            <div style={s.infoCol} className="ti-info-col">
              <div style={s.infoLabel}>Address</div>
              <div style={{ ...s.infoVal, whiteSpace: 'pre-wrap', fontSize: '11px', fontWeight: '500' }}>
                {order.shippingAddress || 'N/A'}
              </div>
            </div>
            <div style={s.infoCol} className="ti-info-col">
              <div style={s.infoLabel}>Phone</div>
              <div style={s.infoVal}>{order.customerPhone || 'N/A'}</div>
            </div>
            <div style={s.infoColLast} className="ti-info-col-last">
              <div style={s.infoLabel}>Payment Status</div>
              <div style={{ ...s.infoVal, color: order.paymentStatus === 'Paid' ? '#16a34a' : '#ea580c' }}>
                {order.paymentStatus}
              </div>
            </div>
          </div>

          {/* ── Items Table with GST (Scrollable Wrapper) ── */}
          <div className="ti-table-wrapper" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '8px', marginBottom: '16px' }}>
              <thead>
                <tr>
                  <th style={s.th}>S.No</th>
                  <th style={{ ...s.th, textAlign: 'left' }}>Product Name</th>
                  <th style={s.th}>HSN/SAC</th>
                  <th style={s.th}>Qty</th>
                  <th style={s.th}>Rate (₹)</th>
                  <th style={s.th}>Taxable Value</th>
                  <th style={s.th}>CGST<br/>{CGST_RATE}%</th>
                  <th style={s.th}>SGST<br/>{SGST_RATE}%</th>
                  <th style={s.th}>Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {itemsWithGST.map((item) => (
                  <tr key={item.sno}>
                    <td style={s.td}>{item.sno}</td>
                    <td style={s.tdLeft}>
                      <div style={{ fontWeight: '600' }}>{item.name}</div>
                    </td>
                    <td style={s.td}>{item.hsn}</td>
                    <td style={s.td}>{item.quantity}</td>
                    <td style={s.tdRight}>{item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td style={s.tdRight}>{item.taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td style={s.tdRight}>{item.cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td style={s.tdRight}>{item.sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td style={{ ...s.tdRight, fontWeight: '700', color: '#1a1a2e' }}>
                      {item.totalWithGST.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr style={{ background: '#f9f9f9' }}>
                  <td colSpan={5} style={{ ...s.tdRight, fontWeight: '800', textAlign: 'right' }}>Total</td>
                  <td style={{ ...s.tdRight, fontWeight: '800' }}>{totalTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td style={{ ...s.tdRight, fontWeight: '800' }}>{totalCGST.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td style={{ ...s.tdRight, fontWeight: '800' }}>{totalSGST.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td style={{ ...s.tdRight, fontWeight: '800', color: '#012a32' }}>{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── Amount In Words ── */}
          <div style={s.wordsRow}>
            <div>
              <div style={s.wordsLabel}>Amount in Words</div>
              <div style={s.wordsVal}>Indian Rupees {numberToWords(Math.round(grandTotal))} Only</div>
            </div>
          </div>

          {/* ── Summary ── */}
          <div style={s.summaryBox} className="ti-summary-box">
            <div style={s.sumRow}>
              <span>Taxable Amount:</span>
              <span style={{ fontWeight: '600' }}>₹{totalTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={s.sumRow}>
              <span>Total Tax (GST {GST_RATE}%):</span>
              <span style={{ fontWeight: '600' }}>₹{totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            {shippingCharge > 0 && (
              <div style={s.sumRow}>
                <span>Shipping Charge:</span>
                <span style={{ fontWeight: '600' }}>₹{shippingCharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div style={s.sumTotal}>
              <span>Grand Total:</span>
              <span>₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* ── Footer note ── */}
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '10px', color: '#999', borderTop: '1px solid #eee', paddingTop: '12px' }}>
            This is a computer-generated invoice. No signature required.<br />
            Thank you for shopping with Parisu Ulagam.
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div style={s.actions} className="ti-actions">
          <button style={s.btnClose} onClick={onClose}>Close</button>
          <button style={s.btnPrint} onClick={handlePrint}>
            <svg style={{ verticalAlign: 'middle', marginRight: '6px' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print
          </button>
          <button style={s.btnPdf} onClick={handleDownloadPDF}>
            <svg style={{ verticalAlign: 'middle', marginRight: '6px' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
