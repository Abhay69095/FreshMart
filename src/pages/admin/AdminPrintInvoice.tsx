import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  Receipt,
  CheckCircle2,
  User,
  Phone,
  Mail,
  MapPin,
  Store,
  Download,
  Copy,
  Check,
  FileText,
  Info
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { Order, StoreInfo } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { FreshMartLogo } from '../../components/FreshMartLogo';

// Helper to format currency numbers to Indian English words
function numberToWords(num: number): string {
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero Rupees';

  const n = Math.floor(num);
  let str = '';

  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const hundred = Math.floor((n % 1000) / 100);
  const remainder = Math.floor(n % 100);

  if (crore > 0) str += (a[crore] || `${crore} `) + 'Crore ';
  if (lakh > 0) str += (lakh < 20 ? a[lakh] : b[Math.floor(lakh / 10)] + ' ' + a[lakh % 10]) + 'Lakh ';
  if (thousand > 0) str += (thousand < 20 ? a[thousand] : b[Math.floor(thousand / 10)] + ' ' + a[thousand % 10]) + 'Thousand ';
  if (hundred > 0) str += a[hundred] + 'Hundred ';
  if (remainder > 0) {
    if (str !== '') str += 'and ';
    str += remainder < 20 ? a[remainder] : b[Math.floor(remainder / 10)] + (remainder % 10 ? ' ' + a[remainder % 10] : ' ');
  }

  return `${str.trim()} Rupees Only`;
}

interface AdminPrintInvoiceProps {
  isStatementMode?: boolean;
}

export const AdminPrintInvoice: React.FC<AdminPrintInvoiceProps> = ({ isStatementMode = false }) => {
  const { id, customerId } = useParams<{ id?: string; customerId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [printFormat, setPrintFormat] = useState<'a4' | 'thermal'>('a4');
  const [copiedSlip, setCopiedSlip] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const isStatement = isStatementMode || location.pathname.includes('/statement/');
  const activeCustomerId = customerId || (isStatement ? id : undefined);

  useEffect(() => {
    let isMounted = true;

    // Wait until auth state is determined
    if (authLoading) return;

    setLoading(true);

    const loadData = async () => {
      try {
        const storeRes = await api.getStore().catch(() => ({ success: false, store: null }));
        if (isMounted && storeRes && storeRes.success && storeRes.store) {
          setStoreInfo(storeRes.store);
        }

        if (isStatement && activeCustomerId) {
          // Only fetch admin orders if logged in with admin privileges
          if (user?.role === 'admin') {
            const decodedCustId = decodeURIComponent(activeCustomerId);
            const ordersRes = await api.getAdminOrders().catch(() => ({ success: false, orders: [] }));
            if (isMounted && ordersRes.success && ordersRes.orders) {
              const matches = ordersRes.orders.filter(
                (o) =>
                  o.customerId === decodedCustId ||
                  o.customerEmail === decodedCustId ||
                  o.customerName === decodedCustId
              );
              setCustomerOrders(matches);
            }
          }
        } else if (id) {
          // Load specific order safely
          const orderRes = await api.getOrderById(id).catch(() => ({ success: false, order: null }));
          if (isMounted && orderRes.success && orderRes.order) {
            setOrder(orderRes.order);
          }
        }
      } catch (err) {
        console.error('Failed to load bill data for print:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id, activeCustomerId, isStatement, authLoading, user]);

  // Generate and Download Invoice Bill in PDF format
  const handleDownloadPdfInvoice = async () => {
    if (!printRef.current) return;
    setIsDownloadingPdf(true);

    try {
      const element = printRef.current;
      const docTitle = isStatement
        ? `FreshMart-Statement-${(targetCustomer?.name || 'Customer').replace(/[^a-zA-Z0-9_-]/g, '_')}`
        : `FreshMart-Invoice-${(order?._id || 'Bill').replace(/[^a-zA-Z0-9_-]/g, '_')}`;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      if (printFormat === 'thermal' && !isStatement) {
        // Thermal roll 80mm
        const pdfWidth = 80;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: [pdfWidth, pdfHeight + 8]
        });
        pdf.addImage(imgData, 'JPEG', 0, 4, pdfWidth, pdfHeight);
        pdf.save(`${docTitle}.pdf`);
      } else {
        // Standard A4: 210 x 297 mm
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const printableWidth = pageWidth - margin * 2;
        const printableHeight = (canvas.height * printableWidth) / canvas.width;

        if (printableHeight <= pageHeight - margin * 2) {
          pdf.addImage(imgData, 'JPEG', margin, margin, printableWidth, printableHeight);
        } else {
          let heightLeft = printableHeight;
          let position = margin;

          pdf.addImage(imgData, 'JPEG', margin, position, printableWidth, printableHeight);
          heightLeft -= pageHeight - margin * 2;

          while (heightLeft > 0) {
            position = position - (pageHeight - margin * 2);
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', margin, position, printableWidth, printableHeight);
            heightLeft -= pageHeight - margin * 2;
          }
        }

        pdf.save(`${docTitle}.pdf`);
      }

      setDownloadSuccess(true);
      showToast('PDF bill downloaded successfully!', 'success');
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error generating PDF invoice:', err);
      showToast(err?.message ? `PDF error: ${err.message}` : 'Failed to generate PDF invoice.', 'error');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Copy text slip to clipboard for thermal/WhatsApp receipt
  const handleCopyTextSlip = () => {
    let slip = `==============================\n`;
    slip += `   FRESHMART PALGHAR MANDI   \n`;
    slip += `   APMC Market Yard Shop #4   \n`;
    slip += `==============================\n`;
    slip += `Date: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}\n`;

    if (order) {
      slip += `Invoice: #${order._id}\n`;
      slip += `Customer: ${order.customerName}\n`;
      slip += `Phone: ${order.customerPhone || 'N/A'}\n`;
      slip += `------------------------------\n`;
      order.items.forEach((item) => {
        slip += `${item.name} (${item.quantity} ${item.unit}) : ₹${item.itemTotal}\n`;
      });
      slip += `------------------------------\n`;
      slip += `Subtotal: ₹${order.subtotal}\n`;
      slip += `Delivery Fee: ₹${order.deliveryFee}\n`;
      if (order.discount > 0) slip += `Discount: -₹${order.discount}\n`;
      slip += `TOTAL AMOUNT: ₹${order.totalAmount}\n`;
      slip += `Payment: ${order.paymentMethod} [${order.paymentStatus}]\n`;
    } else if (customerOrders.length > 0) {
      slip += `Account Statement: ${targetCustomer?.name}\n`;
      slip += `Total Orders: ${customerOrders.length}\n`;
      slip += `Total Spend: ₹${totalStatementSpend}\n`;
      slip += `Total Paid: ₹${totalStatementPaid}\n`;
    }

    slip += `==============================\n`;
    slip += `  100% Quality Fresh Guarantee\n`;
    slip += `  Thank you for shopping local!\n`;
    slip += `==============================\n`;

    navigator.clipboard.writeText(slip);
    setCopiedSlip(true);
    setTimeout(() => setCopiedSlip(false), 2500);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="text-center space-y-3">
          <Loader2 className="w-9 h-9 animate-spin text-emerald-700 mx-auto" />
          <p className="text-sm text-neutral-600 font-semibold font-display">
            Opening full-page customer billing...
          </p>
        </div>
      </div>
    );
  }

  // Auth protection for vendor admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-100 p-4 space-y-3">
        <p className="text-sm font-bold text-neutral-800">Admin authorization required to access billing.</p>
        <Link to="/login?redirect=/admin/billing" className="text-xs text-emerald-700 underline font-semibold">
          Sign In to Vendor Account
        </Link>
      </div>
    );
  }

  if (!isStatement && !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-100 p-4 space-y-3">
        <Receipt className="w-10 h-10 text-neutral-400" />
        <p className="text-base font-bold text-neutral-800">Bill or Order Record Not Found</p>
        <p className="text-xs text-neutral-500">Order #{id} could not be located in the billing system.</p>
        <Link
          to="/admin/billing"
          className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Return to Customer Billing
        </Link>
      </div>
    );
  }

  if (isStatement && customerOrders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-100 p-4 space-y-3">
        <User className="w-10 h-10 text-neutral-400" />
        <p className="text-base font-bold text-neutral-800">No Orders Found for Customer Statement</p>
        <Link
          to="/admin/billing"
          className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Return to Customer Billing
        </Link>
      </div>
    );
  }

  // Vendor Details
  const vendorName = storeInfo?.vendorName || 'Sonone & Sons';
  const storeName = storeInfo?.storeName || 'FreshMart Local Products Mandi';
  const address =
    storeInfo?.fullAddress || 'Shop No. 4, APMC Market Yard, Station Road, Palghar (W), Maharashtra - 401404';
  const phone = storeInfo?.phone || '+91 98201 12345';
  const email = storeInfo?.supportEmail || 'support@freshmart.com';
  const mandiLic = 'APMC/PLG/2024/7829';
  const fssai = '21524098000123';
  const gstin = '27AABCS1429B1Z2';

  // Customer Details
  const targetCustomer = order
    ? {
        name: order.customerName,
        phone: order.customerPhone || 'N/A',
        email: order.customerEmail,
        address: order.deliveryAddress
      }
    : {
        name: customerOrders[0].customerName,
        phone: customerOrders[0].customerPhone || 'N/A',
        email: customerOrders[0].customerEmail,
        address: customerOrders[0].deliveryAddress
      };

  // Statement calculations
  const totalStatementSpend = customerOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const paidStatementOrders = customerOrders.filter((o) => o.paymentStatus === 'Paid');
  const totalStatementPaid = paidStatementOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const statementPending = totalStatementSpend - totalStatementPaid;

  return (
    <div className="min-h-screen bg-neutral-100 print:bg-white text-neutral-900 pb-16 print:pb-0">
      {/* Top Floating Full-Page Control Bar (Hidden on Print) */}
      <header className="sticky top-0 z-30 bg-neutral-900 text-white shadow-md print:hidden border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Back button & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              title="Return to previous screen"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <div className="border-l border-neutral-800 pl-3">
              <h1 className="font-bold text-sm sm:text-base font-display flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>
                  {isStatement
                    ? `Account Statement: ${targetCustomer.name}`
                    : `Official Tax Invoice #${order?._id}`}
                </span>
              </h1>
              <p className="text-[11px] text-neutral-400">
                Customer: <strong className="text-neutral-200">{targetCustomer.name}</strong> ({targetCustomer.phone})
              </p>
            </div>
          </div>

          {/* Controls: Format Toggle, Copy, and Download PDF Invoice Button */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Format toggle (A4 vs Thermal) */}
            {!isStatement && (
              <div className="flex bg-neutral-800 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPrintFormat('a4')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    printFormat === 'a4'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Standard A4
                </button>
                <button
                  type="button"
                  onClick={() => setPrintFormat('thermal')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    printFormat === 'thermal'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Thermal (80mm)
                </button>
              </div>
            )}

            {/* Quick Copy Text Slip */}
            <button
              type="button"
              onClick={handleCopyTextSlip}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs rounded-lg transition-all cursor-pointer"
              title="Copy receipt text to clipboard"
            >
              {copiedSlip ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSlip ? 'Copied Slip!' : 'Copy Text'}</span>
            </button>

            {/* Download PDF Invoice Button */}
            <button
              type="button"
              onClick={handleDownloadPdfInvoice}
              disabled={isDownloadingPdf}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-75 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition-all cursor-pointer hover:shadow-md"
              title="Download bill in PDF format"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>PDF Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Invoice</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Full-Page Invoice Document */}
      <main className="max-w-4xl mx-auto mt-6 px-4 print:m-0 print:p-0 print:max-w-none">
        <div
          id="printable-hardcopy-bill"
          ref={printRef}
          className={`bg-white border border-neutral-300 shadow-sm print:border-none print:shadow-none mx-auto ${
            printFormat === 'thermal' && !isStatement
              ? 'max-w-[400px] p-4 font-mono text-[11px] leading-tight'
              : 'max-w-[760px] p-8 text-neutral-800 text-xs sm:text-sm'
          }`}
        >
          {/* STORE & VENDOR HEADER */}
          <div className="border-b-2 border-emerald-800 pb-4 mb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <FreshMartLogo size="sm" />
                <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight mt-1">
                  {storeName}
                </h2>
                <p className="text-xs font-bold text-emerald-800">Vendor: {vendorName}</p>
                <p className="text-[11px] text-neutral-600 max-w-sm">{address}</p>
                <p className="text-[10px] text-neutral-500">
                  Helpline: {phone} | Email: {email}
                </p>
              </div>

              <div className="text-right space-y-1 shrink-0">
                <div className="inline-block bg-emerald-800 text-white px-3 py-1 rounded font-bold text-xs uppercase tracking-wider">
                  {isStatement ? 'Customer Account Statement' : 'Retail Products Tax Invoice'}
                </div>
                <div className="text-[10px] text-neutral-500 space-y-0.5 pt-1">
                  <p>
                    <span className="font-semibold text-neutral-700">Mandi Lic:</span> {mandiLic}
                  </p>
                  <p>
                    <span className="font-semibold text-neutral-700">FSSAI Lic:</span> {fssai}
                  </p>
                  <p>
                    <span className="font-semibold text-neutral-700">GSTIN:</span> {gstin}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* BILL REFERENCE & CUSTOMER DETAILS */}
          <div className="grid grid-cols-2 gap-4 pb-4 mb-4 border-b border-neutral-200">
            {/* Left Box: Bill Details */}
            <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200/80 space-y-1">
              <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                {isStatement ? 'Statement Overview' : 'Bill Reference'}
              </p>
              {order ? (
                <>
                  <p className="font-mono font-bold text-xs text-neutral-900">
                    INV-{order._id.toUpperCase()}
                  </p>
                  <p className="text-[11px] text-neutral-600">
                    <span className="font-semibold">Order ID:</span> #{order._id}
                  </p>
                  <p className="text-[11px] text-neutral-600">
                    <span className="font-semibold">Date & Time:</span>{' '}
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}{' '}
                    at{' '}
                    {new Date(order.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-[11px] text-neutral-600">
                    <span className="font-semibold">Delivery Type:</span> Express Farm-to-Doorstep
                  </p>
                </>
              ) : (
                <>
                  <p className="font-mono font-bold text-xs text-neutral-900">
                    STM-{Date.now().toString().slice(-6)}
                  </p>
                  <p className="text-[11px] text-neutral-600">
                    <span className="font-semibold">Total Orders:</span> {customerOrders.length}
                  </p>
                  <p className="text-[11px] text-neutral-600">
                    <span className="font-semibold">Generated Date:</span>{' '}
                    {new Date().toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-[11px] text-neutral-600">
                    <span className="font-semibold">Account Status:</span> Active Customer
                  </p>
                </>
              )}
            </div>

            {/* Right Box: Customer Details */}
            <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                  Billed & Delivered To
                </p>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Particular Customer
                </span>
              </div>
              <p className="font-bold text-xs sm:text-sm text-neutral-900">{targetCustomer.name}</p>
              <p className="text-[11px] text-neutral-700">
                <span className="font-semibold">Phone:</span> {targetCustomer.phone}
              </p>
              <p className="text-[11px] text-neutral-700 truncate">
                <span className="font-semibold">Email:</span> {targetCustomer.email}
              </p>
              <p className="text-[10px] text-neutral-600 leading-tight">
                <span className="font-semibold">Address:</span> {targetCustomer.address.house},{' '}
                {targetCustomer.address.street}, {targetCustomer.address.area},{' '}
                {targetCustomer.address.city} - {targetCustomer.address.pincode}
              </p>
            </div>
          </div>

          {/* ITEM BREAKDOWN TABLE */}
          {order ? (
            /* Single Order Product Items */
            <div className="mb-4">
              <table className="w-full text-left border-collapse border border-neutral-200">
                <thead className="bg-neutral-100 text-neutral-700 font-bold text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2 px-2.5 border-b border-neutral-200 w-8 text-center">#</th>
                    <th className="py-2 px-2.5 border-b border-neutral-200">Fresh Products Description</th>
                    <th className="py-2 px-2.5 border-b border-neutral-200 text-center w-20">Unit</th>
                    <th className="py-2 px-2.5 border-b border-neutral-200 text-center w-14">Qty</th>
                    <th className="py-2 px-2.5 border-b border-neutral-200 text-right w-20">Rate (₹)</th>
                    <th className="py-2 px-2.5 border-b border-neutral-200 text-right w-24">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-[11px]">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50/50">
                      <td className="py-2 px-2.5 text-center text-neutral-400 font-mono">{idx + 1}</td>
                      <td className="py-2 px-2.5 font-medium text-neutral-900">
                        {item.name}
                      </td>
                      <td className="py-2 px-2.5 text-center text-neutral-600 font-mono">{item.unit}</td>
                      <td className="py-2 px-2.5 text-center font-bold font-mono">{item.quantity}</td>
                      <td className="py-2 px-2.5 text-right font-mono">₹{item.price}</td>
                      <td className="py-2 px-2.5 text-right font-mono font-bold text-neutral-900">
                        ₹{item.itemTotal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Multi-Order Customer Statement Table */
            <div className="mb-4">
              <table className="w-full text-left border-collapse border border-neutral-200">
                <thead className="bg-neutral-100 text-neutral-700 font-bold text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2 px-2.5 border-b border-neutral-200 w-8 text-center">#</th>
                    <th className="py-2 px-2.5 border-b border-neutral-200">Bill No. & Date</th>
                    <th className="py-2 px-2.5 border-b border-neutral-200">Items Purchased</th>
                    <th className="py-2 px-2.5 border-b border-neutral-200 text-center">Payment</th>
                    <th className="py-2 px-2.5 border-b border-neutral-200 text-center">Status</th>
                    <th className="py-2 px-2.5 border-b border-neutral-200 text-right w-24">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-[11px]">
                  {customerOrders.map((o, idx) => (
                    <tr key={o._id} className="hover:bg-neutral-50/50">
                      <td className="py-2 px-2.5 text-center text-neutral-400 font-mono">{idx + 1}</td>
                      <td className="py-2 px-2.5">
                        <span className="font-mono font-bold block text-neutral-900">
                          INV-{o._id.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          {new Date(o.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="py-2 px-2.5 text-neutral-700">
                        <span className="font-semibold block">{o.items.length} items</span>
                        <span className="text-[10px] text-neutral-500 block truncate max-w-xs">
                          {o.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}
                        </span>
                      </td>
                      <td className="py-2 px-2.5 text-center font-mono text-[10px] text-neutral-600">
                        {o.paymentMethod}
                      </td>
                      <td className="py-2 px-2.5 text-center">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            o.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {o.paymentStatus === 'Paid' ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-2 px-2.5 text-right font-mono font-bold text-neutral-900">
                        ₹{o.totalAmount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* FINANCIAL TOTALS & PAYMENT STATUS */}
          <div className="grid grid-cols-2 gap-4 pb-4 mb-4 border-b border-neutral-200">
            {/* Left: Payment status / Words */}
            <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 space-y-1.5">
              <p className="text-[10px] uppercase font-bold text-neutral-500">Payment Breakdown</p>
              {order ? (
                <>
                  <p className="text-xs font-semibold text-neutral-800">
                    Payment Mode: <span className="font-bold text-neutral-900">{order.paymentMethod}</span>
                  </p>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded ${
                        order.paymentStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {order.paymentStatus === 'Paid' ? '✓ PAID IN FULL' : '⚠ CASH ON DELIVERY (PENDING)'}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-600 pt-1 leading-snug">
                    <span className="font-semibold text-neutral-700">Amount in Words:</span>{' '}
                    <em>{numberToWords(order.totalAmount)}</em>
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs font-semibold text-neutral-800">
                    Total Statement Billed: <span className="font-bold">₹{totalStatementSpend}</span>
                  </p>
                  <p className="text-xs text-emerald-800 font-semibold">
                    Amount Received: ₹{totalStatementPaid} ({paidStatementOrders.length} Paid Orders)
                  </p>
                  <p className="text-xs text-amber-800 font-bold">
                    Pending / Balance: ₹{statementPending}
                  </p>
                </>
              )}
            </div>

            {/* Right: Numbers breakdown */}
            {order ? (
              <div className="space-y-1.5 text-right text-xs">
                <div className="flex justify-between py-1 border-b border-neutral-100 text-neutral-600">
                  <span>Items Subtotal:</span>
                  <span className="font-mono font-medium text-neutral-800">₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-100 text-neutral-600">
                  <span>Express Farm Delivery:</span>
                  <span className="font-mono font-medium text-neutral-800">
                    {order.deliveryFee === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE</span>
                    ) : (
                      `₹${order.deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-t-2 border-neutral-900 font-bold text-sm bg-neutral-50 px-2 rounded">
                  <span className="uppercase">Net Amount Payable:</span>
                  <span className="font-mono text-base font-extrabold text-emerald-800">
                    ₹{order.totalAmount}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 text-right text-xs">
                <div className="flex justify-between py-1 border-b border-neutral-100 text-neutral-600">
                  <span>Lifetime Billed:</span>
                  <span className="font-mono font-medium text-neutral-800">₹{totalStatementSpend}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-100 text-neutral-600">
                  <span>Cleared Payments:</span>
                  <span className="font-mono font-medium text-emerald-700">₹{totalStatementPaid}</span>
                </div>
                <div className="flex justify-between py-2 border-t-2 border-neutral-900 font-bold text-sm bg-neutral-50 px-2 rounded">
                  <span className="uppercase">Statement Balance:</span>
                  <span className="font-mono text-base font-extrabold text-emerald-800">
                    ₹{statementPending}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* MANDATORY LEGAL & PRODUCT DECLARATION */}
          <div className="bg-neutral-50 p-2.5 rounded border border-neutral-200 mb-4 text-[10px] text-neutral-600 leading-relaxed">
            <p className="font-bold text-neutral-700">Vendor Declaration & Quality Guarantee:</p>
            <p>
              1. All products supplied under this bill have been harvested directly from APMC registered farms and
              satisfies food safety norms under FSSAI.
            </p>
            <p>
              2. Goods once sold are backed by FreshMart's 100% freshness guarantee. Any quality discrepancy must
              be reported upon delivery.
            </p>
          </div>

          {/* FOOTER & AUTHORIZED SIGNATORY */}
          <div className="flex items-end justify-between pt-2 text-xs">
            <div className="text-[10px] text-neutral-500 space-y-0.5">
              <p className="font-bold text-neutral-700">
                Thank you for patronizing {vendorName}!
              </p>
              <p>Fresh Products Mandi · APMC Market Yard, Palghar</p>
              <p className="text-[9px] text-neutral-400 font-mono">
                System generated hard copy bill. Authorized for delivery dispatch.
              </p>
            </div>
            <div className="text-right">
              <div className="border border-emerald-800 text-emerald-800 rounded px-2.5 py-0.5 text-[10px] font-bold inline-block mb-1">
                ✓ VERIFIED STORE DISPATCH
              </div>
              <p className="text-[11px] font-bold text-neutral-900">For {vendorName}</p>
              <p className="text-[10px] text-neutral-500">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
