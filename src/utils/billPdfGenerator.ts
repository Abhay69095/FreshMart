import { jsPDF } from 'jspdf';
import { Order, StoreInfo } from '../types';

export type BillFormat = 'a4' | 'thermal';

// Helper to convert number to Indian English words
export function numberToWords(num: number): string {
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (!num || num === 0) return 'Zero Rupees Only';

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

interface CustomerInfo {
  name: string;
  phone?: string;
  email?: string;
  address?: {
    house?: string;
    street?: string;
    area?: string;
    city?: string;
    state?: string;
    pincode?: string;
    landmark?: string;
  };
}

/**
 * Generates an official Tax Invoice PDF for an individual order.
 * Supports:
 * - 'a4': Standard A4 (210 x 297 mm) official retail tax invoice with licenses, breakdown & signatory.
 * - 'thermal': POS roll receipt (80 mm width) with compact itemization for rapid handover.
 */
export function generateOrderPdf(order: Order, storeInfo: StoreInfo | null, format: BillFormat): jsPDF {
  const storeName = storeInfo?.storeName || 'FreshMart Local Products Mandi';
  const vendorName = storeInfo?.vendorName || 'Sonone & Sons';
  const address = storeInfo?.fullAddress || 'Shop No. 4, APMC Market Yard, Station Road, Palghar (W), Maharashtra - 401404';
  const phone = storeInfo?.phone || '+91 98201 12345';
  const email = storeInfo?.supportEmail || 'support@freshmart.com';
  const mandiLic = 'APMC/PLG/2024/7829';
  const fssai = '21524098000123';
  const gstin = '27AABCS1429B1Z2';

  if (format === 'thermal') {
    return generateThermalOrderPdf(order, { storeName, vendorName, address, phone, email, mandiLic, fssai, gstin });
  }

  return generateA4OrderPdf(order, { storeName, vendorName, address, phone, email, mandiLic, fssai, gstin });
}

function generateA4OrderPdf(
  order: Order,
  vendor: { storeName: string; vendorName: string; address: string; phone: string; email: string; mandiLic: string; fssai: string; gstin: string }
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  // Top header banner background
  doc.setFillColor(6, 95, 70); // Emerald 800
  doc.rect(margin, 12, contentWidth, 3, 'F');

  // Header Title & Store Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(6, 95, 70);
  doc.text(vendor.storeName.toUpperCase(), margin, 22);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.text(`Vendor: ${vendor.vendorName} | APMC Registered Merchant`, margin, 27);

  // Address wrapped
  const addrLines = doc.splitTextToSize(vendor.address, 110);
  doc.text(addrLines, margin, 32);

  const contactY = 32 + addrLines.length * 4;
  doc.text(`Helpline: ${vendor.phone} | Email: ${vendor.email}`, margin, contactY);

  // Right side of Header: Official Badges & Licenses
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(pageWidth - margin - 65, 17, 65, 26, 2, 2, 'F');
  doc.setDrawColor(209, 213, 219);
  doc.roundedRect(pageWidth - margin - 65, 17, 65, 26, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(6, 95, 70);
  doc.text('RETAIL TAX INVOICE', pageWidth - margin - 32.5, 23, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(75, 85, 99);
  doc.text(`Mandi Lic: ${vendor.mandiLic}`, pageWidth - margin - 62, 29);
  doc.text(`FSSAI Reg: ${vendor.fssai}`, pageWidth - margin - 62, 34);
  doc.text(`GSTIN / PAN: ${vendor.gstin}`, pageWidth - margin - 62, 39);

  // Divider line
  const headerBottomY = Math.max(contactY + 6, 48);
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, headerBottomY, pageWidth - margin, headerBottomY);

  // Two columns: Bill Reference (Left) & Customer Details (Right)
  const infoBoxY = headerBottomY + 4;
  const colWidth = (contentWidth - 6) / 2;

  // Left Box: Invoice Meta
  doc.setFillColor(249, 250, 251);
  doc.rect(margin, infoBoxY, colWidth, 32, 'F');
  doc.setDrawColor(229, 231, 235);
  doc.rect(margin, infoBoxY, colWidth, 32, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(6, 95, 70);
  doc.text('INVOICE / BILL DETAILS', margin + 4, infoBoxY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(55, 65, 81);

  doc.setFont('helvetica', 'bold');
  doc.text('Invoice No:', margin + 4, infoBoxY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(`INV-${order._id.toUpperCase()}`, margin + 26, infoBoxY + 12);

  doc.setFont('helvetica', 'bold');
  doc.text('Order ID:', margin + 4, infoBoxY + 17);
  doc.setFont('helvetica', 'normal');
  doc.text(`#${order._id}`, margin + 26, infoBoxY + 17);

  doc.setFont('helvetica', 'bold');
  doc.text('Date & Time:', margin + 4, infoBoxY + 22);
  doc.setFont('helvetica', 'normal');
  const dateStr = `${new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} at ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  doc.text(dateStr, margin + 26, infoBoxY + 22);

  doc.setFont('helvetica', 'bold');
  doc.text('Payment:', margin + 4, infoBoxY + 27);
  doc.setFont('helvetica', 'normal');
  doc.text(`${order.paymentMethod} [${order.paymentStatus.toUpperCase()}]`, margin + 26, infoBoxY + 27);

  // Right Box: Customer Details
  const rightBoxX = margin + colWidth + 6;
  doc.setFillColor(249, 250, 251);
  doc.rect(rightBoxX, infoBoxY, colWidth, 32, 'F');
  doc.setDrawColor(229, 231, 235);
  doc.rect(rightBoxX, infoBoxY, colWidth, 32, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(6, 95, 70);
  doc.text('BILLED TO / CUSTOMER', rightBoxX + 4, infoBoxY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(55, 65, 81);

  doc.setFont('helvetica', 'bold');
  doc.text('Name:', rightBoxX + 4, infoBoxY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(order.customerName, rightBoxX + 20, infoBoxY + 12);

  doc.setFont('helvetica', 'bold');
  doc.text('Phone:', rightBoxX + 4, infoBoxY + 17);
  doc.setFont('helvetica', 'normal');
  doc.text(order.customerPhone || 'N/A', rightBoxX + 20, infoBoxY + 17);

  doc.setFont('helvetica', 'bold');
  doc.text('Address:', rightBoxX + 4, infoBoxY + 22);
  const addrText = `${order.deliveryAddress.house}, ${order.deliveryAddress.street}, ${order.deliveryAddress.city} - ${order.deliveryAddress.pincode}`;
  const custAddrLines = doc.splitTextToSize(addrText, colWidth - 24);
  doc.setFont('helvetica', 'normal');
  doc.text(custAddrLines, rightBoxX + 20, infoBoxY + 22);

  // Items Table Header
  const tableStartY = infoBoxY + 38;
  doc.setFillColor(6, 95, 70);
  doc.rect(margin, tableStartY, contentWidth, 7.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);

  const colSno = margin + 4;
  const colItem = margin + 14;
  const colQty = margin + 110;
  const colRate = margin + 142;
  const colTotal = margin + contentWidth - 4;

  doc.text('#', colSno, tableStartY + 5);
  doc.text('ITEM DESCRIPTION', colItem, tableStartY + 5);
  doc.text('QUANTITY', colQty, tableStartY + 5, { align: 'right' });
  doc.text('RATE (INR)', colRate, tableStartY + 5, { align: 'right' });
  doc.text('AMOUNT (INR)', colTotal, tableStartY + 5, { align: 'right' });

  // Items Table Rows
  let currentY = tableStartY + 7.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  order.items.forEach((item, index) => {
    // Alternating background
    if (index % 2 === 1) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, currentY, contentWidth, 7, 'F');
    }

    doc.setDrawColor(240, 240, 240);
    doc.line(margin, currentY + 7, margin + contentWidth, currentY + 7);

    doc.setTextColor(75, 85, 99);
    doc.text(String(index + 1), colSno, currentY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    const itemName = doc.splitTextToSize(item.name, 90)[0] || item.name;
    doc.text(itemName, colItem, currentY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 65, 81);
    doc.text(`${item.quantity} ${item.unit}`, colQty, currentY + 5, { align: 'right' });
    doc.text(`Rs. ${item.price}`, colRate, currentY + 5, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(`Rs. ${item.itemTotal.toLocaleString('en-IN')}`, colTotal, currentY + 5, { align: 'right' });

    currentY += 7;
  });

  // Bottom Calculation Summary
  const summaryBoxY = currentY + 4;
  const summaryBoxWidth = 80;
  const summaryBoxX = margin + contentWidth - summaryBoxWidth;

  // Left side of bottom: Amount in Words & Delivery Notes
  doc.setFillColor(249, 250, 251);
  doc.rect(margin, summaryBoxY, contentWidth - summaryBoxWidth - 6, 36, 'F');
  doc.setDrawColor(229, 231, 235);
  doc.rect(margin, summaryBoxY, contentWidth - summaryBoxWidth - 6, 36, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(6, 95, 70);
  doc.text('AMOUNT IN WORDS:', margin + 4, summaryBoxY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(31, 41, 55);
  const words = doc.splitTextToSize(numberToWords(order.totalAmount), contentWidth - summaryBoxWidth - 14);
  doc.text(words, margin + 4, summaryBoxY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(75, 85, 99);
  doc.text('TERMS & FRESHNESS POLICY:', margin + 4, summaryBoxY + 24);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('100% farm picked produce. Report quality issues within 24 hours for replacement.', margin + 4, summaryBoxY + 29);

  // Right side: Totals Calculation Box
  doc.setFillColor(249, 250, 251);
  doc.rect(summaryBoxX, summaryBoxY, summaryBoxWidth, 36, 'F');
  doc.setDrawColor(229, 231, 235);
  doc.rect(summaryBoxX, summaryBoxY, summaryBoxWidth, 36, 'S');

  doc.setFontSize(8);
  doc.setTextColor(75, 85, 99);

  doc.text('Items Subtotal:', summaryBoxX + 4, summaryBoxY + 7);
  doc.text(`Rs. ${order.subtotal.toLocaleString('en-IN')}`, margin + contentWidth - 4, summaryBoxY + 7, { align: 'right' });

  doc.text('Standard Delivery:', summaryBoxX + 4, summaryBoxY + 13);
  doc.text(order.deliveryFee === 0 ? 'FREE' : `Rs. ${order.deliveryFee.toLocaleString('en-IN')}`, margin + contentWidth - 4, summaryBoxY + 13, { align: 'right' });

  if (order.discount > 0) {
    doc.setTextColor(5, 150, 105);
    doc.text('Special Discount:', summaryBoxX + 4, summaryBoxY + 19);
    doc.text(`- Rs. ${order.discount.toLocaleString('en-IN')}`, margin + contentWidth - 4, summaryBoxY + 19, { align: 'right' });
  }

  // Grand Total Highlight
  doc.setFillColor(6, 95, 70);
  doc.rect(summaryBoxX, summaryBoxY + 24, summaryBoxWidth, 12, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text('GRAND TOTAL:', summaryBoxX + 4, summaryBoxY + 31.5);
  doc.text(`Rs. ${order.totalAmount.toLocaleString('en-IN')}`, margin + contentWidth - 4, summaryBoxY + 31.5, { align: 'right' });

  // Signature and Footer area
  const footerY = summaryBoxY + 45;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin + contentWidth - 55, footerY + 14, margin + contentWidth - 5, footerY + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text('Authorized Signatory', margin + contentWidth - 30, footerY + 18, { align: 'center' });
  doc.text(`For ${vendor.storeName}`, margin + contentWidth - 30, footerY + 22, { align: 'center' });

  // Environmental / Local note
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(6, 95, 70);
  doc.text('🌿 Thank you for supporting local APMC Palghar farmers and fresh vendors!', margin, footerY + 20);

  return doc;
}

function generateThermalOrderPdf(
  order: Order,
  vendor: { storeName: string; vendorName: string; address: string; phone: string; email: string; mandiLic: string; fssai: string; gstin: string }
): jsPDF {
  // Thermal 80mm roll: 80 mm width, dynamic height
  const baseHeight = 140;
  const itemHeight = order.items.length * 9;
  const calculatedHeight = Math.max(160, baseHeight + itemHeight);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, calculatedHeight]
  });

  const pageWidth = 80;
  const margin = 4;
  const contentWidth = pageWidth - margin * 2; // 72mm

  let currentY = 7;

  // Centered Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(vendor.storeName.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });

  currentY += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`Vendor: ${vendor.vendorName}`, pageWidth / 2, currentY, { align: 'center' });

  currentY += 3.5;
  doc.text('APMC Market Yard, Palghar (W)', pageWidth / 2, currentY, { align: 'center' });

  currentY += 3.5;
  doc.text(`Ph: ${vendor.phone} | Lic: ${vendor.mandiLic}`, pageWidth / 2, currentY, { align: 'center' });

  currentY += 3;
  // Dashed separator
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.text('------------------------------------------', pageWidth / 2, currentY, { align: 'center' });

  // Bill Reference & Customer
  currentY += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(`INVOICE: INV-${order._id.toUpperCase()}`, margin, currentY);

  currentY += 3.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const dateStr = `${new Date(order.createdAt).toLocaleDateString('en-IN')} ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  doc.text(`Date: ${dateStr}`, margin, currentY);

  currentY += 3.5;
  doc.text(`Customer: ${order.customerName}`, margin, currentY);

  currentY += 3.5;
  doc.text(`Phone: ${order.customerPhone || 'N/A'}`, margin, currentY);

  if (order.deliveryAddress?.house) {
    currentY += 3.5;
    const shortAddr = `${order.deliveryAddress.house}, ${order.deliveryAddress.street}`;
    const truncatedAddr = doc.splitTextToSize(shortAddr, contentWidth)[0] || shortAddr;
    doc.text(`Deliv: ${truncatedAddr}`, margin, currentY);
  }

  currentY += 3;
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.text('------------------------------------------', pageWidth / 2, currentY, { align: 'center' });

  // Item List Header
  currentY += 3.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('ITEM', margin, currentY);
  doc.text('QTY', margin + 38, currentY);
  doc.text('TOTAL', margin + contentWidth, currentY, { align: 'right' });

  currentY += 2;
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.text('------------------------------------------', pageWidth / 2, currentY, { align: 'center' });

  // Items
  currentY += 3.5;
  order.items.forEach((item) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    const itemName = doc.splitTextToSize(item.name, 36)[0] || item.name;
    doc.text(itemName, margin, currentY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(`${item.quantity} ${item.unit}`, margin + 38, currentY);
    doc.text(`Rs.${item.itemTotal}`, margin + contentWidth, currentY, { align: 'right' });

    currentY += 3;
    doc.setTextColor(100, 100, 100);
    doc.text(`@ Rs.${item.price}/${item.unit}`, margin + 2, currentY);
    doc.setTextColor(0, 0, 0);

    currentY += 4;
  });

  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.text('------------------------------------------', pageWidth / 2, currentY, { align: 'center' });

  // Totals
  currentY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Subtotal:', margin, currentY);
  doc.text(`Rs. ${order.subtotal}`, margin + contentWidth, currentY, { align: 'right' });

  currentY += 3.5;
  doc.text('Delivery Fee:', margin, currentY);
  doc.text(order.deliveryFee === 0 ? 'FREE' : `Rs. ${order.deliveryFee}`, margin + contentWidth, currentY, { align: 'right' });

  if (order.discount > 0) {
    currentY += 3.5;
    doc.text('Discount:', margin, currentY);
    doc.text(`-Rs. ${order.discount}`, margin + contentWidth, currentY, { align: 'right' });
  }

  currentY += 2;
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.text('==========================================', pageWidth / 2, currentY, { align: 'center' });

  currentY += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('TOTAL AMOUNT:', margin, currentY);
  doc.text(`Rs. ${order.totalAmount}`, margin + contentWidth, currentY, { align: 'right' });

  currentY += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(`Payment: ${order.paymentMethod} [${order.paymentStatus}]`, margin, currentY);

  currentY += 3;
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.text('------------------------------------------', pageWidth / 2, currentY, { align: 'center' });

  // Thermal Footer
  currentY += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('100% Quality & Freshness Guarantee', pageWidth / 2, currentY, { align: 'center' });

  currentY += 3.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('Thank you for shopping local Palghar produce!', pageWidth / 2, currentY, { align: 'center' });

  currentY += 3.5;
  doc.text('For queries: WhatsApp ' + vendor.phone, pageWidth / 2, currentY, { align: 'center' });

  return doc;
}

/**
 * Generates an account statement PDF for all orders belonging to a particular customer.
 */
export function generateStatementPdf(
  customer: CustomerInfo,
  orders: Order[],
  storeInfo: StoreInfo | null,
  format: BillFormat
): jsPDF {
  const storeName = storeInfo?.storeName || 'FreshMart Local Products Mandi';
  const vendorName = storeInfo?.vendorName || 'Sonone & Sons';
  const address = storeInfo?.fullAddress || 'Shop No. 4, APMC Market Yard, Station Road, Palghar (W), Maharashtra - 401404';
  const phone = storeInfo?.phone || '+91 98201 12345';
  const email = storeInfo?.supportEmail || 'support@freshmart.com';
  const mandiLic = 'APMC/PLG/2024/7829';
  const fssai = '21524098000123';
  const gstin = '27AABCS1429B1Z2';

  const totalSpend = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const paidOrders = orders.filter((o) => o.paymentStatus === 'Paid');
  const totalPaid = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalPending = totalSpend - totalPaid;

  if (format === 'thermal') {
    // Thermal Statement Roll
    const calculatedHeight = Math.max(160, 110 + orders.length * 10);
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, calculatedHeight]
    });

    const pageWidth = 80;
    const margin = 4;
    const contentWidth = pageWidth - margin * 2;

    let currentY = 7;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(storeName.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });

    currentY += 4;
    doc.setFontSize(7);
    doc.text('CUSTOMER ACCOUNT STATEMENT', pageWidth / 2, currentY, { align: 'center' });

    currentY += 3;
    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.text('------------------------------------------', pageWidth / 2, currentY, { align: 'center' });

    currentY += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(`Customer: ${customer.name}`, margin, currentY);

    currentY += 3.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`Phone: ${customer.phone || 'N/A'}`, margin, currentY);
    currentY += 3.5;
    doc.text(`Total Orders: ${orders.length}`, margin, currentY);

    currentY += 3;
    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.text('------------------------------------------', pageWidth / 2, currentY, { align: 'center' });

    currentY += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('INVOICE / DATE', margin, currentY);
    doc.text('STATUS', margin + 35, currentY);
    doc.text('AMOUNT', margin + contentWidth, currentY, { align: 'right' });

    currentY += 2;
    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.text('------------------------------------------', pageWidth / 2, currentY, { align: 'center' });

    orders.forEach((o) => {
      currentY += 4;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.text(`INV-${o._id.toUpperCase()}`, margin, currentY);

      doc.setFont('helvetica', 'normal');
      doc.text(o.paymentStatus, margin + 35, currentY);
      doc.text(`Rs.${o.totalAmount}`, margin + contentWidth, currentY, { align: 'right' });

      currentY += 3;
      doc.setTextColor(100, 100, 100);
      doc.text(new Date(o.createdAt).toLocaleDateString('en-IN'), margin + 2, currentY);
      doc.setTextColor(0, 0, 0);
    });

    currentY += 3;
    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.text('==========================================', pageWidth / 2, currentY, { align: 'center' });

    currentY += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('Total Volume Billed:', margin, currentY);
    doc.text(`Rs. ${totalSpend}`, margin + contentWidth, currentY, { align: 'right' });

    currentY += 3.5;
    doc.text('Total Settled / Paid:', margin, currentY);
    doc.text(`Rs. ${totalPaid}`, margin + contentWidth, currentY, { align: 'right' });

    currentY += 3.5;
    doc.setFont('helvetica', 'bold');
    doc.text('Pending COD Balance:', margin, currentY);
    doc.text(`Rs. ${totalPending}`, margin + contentWidth, currentY, { align: 'right' });

    currentY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text('Thank you for your trusted patronage!', pageWidth / 2, currentY, { align: 'center' });

    return doc;
  }

  // Standard A4 Statement
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Header Banner
  doc.setFillColor(6, 95, 70);
  doc.rect(margin, 12, contentWidth, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(6, 95, 70);
  doc.text(storeName.toUpperCase(), margin, 22);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.text(`Vendor: ${vendorName} | ${address}`, margin, 27);
  doc.text(`Helpline: ${phone} | Lic: ${mandiLic} | GSTIN: ${gstin}`, margin, 32);

  // Statement Badge
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(pageWidth - margin - 70, 17, 70, 20, 2, 2, 'F');
  doc.setDrawColor(209, 213, 219);
  doc.roundedRect(pageWidth - margin - 70, 17, 70, 20, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(6, 95, 70);
  doc.text('CUSTOMER ACCOUNT STATEMENT', pageWidth - margin - 35, 24, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(75, 85, 99);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - margin - 35, 31, { align: 'center' });

  // Divider
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, 42, pageWidth - margin, 42);

  // Customer Overview & Account KPI Summary Box
  const summaryY = 46;
  doc.setFillColor(249, 250, 251);
  doc.rect(margin, summaryY, contentWidth, 24, 'F');
  doc.setDrawColor(229, 231, 235);
  doc.rect(margin, summaryY, contentWidth, 24, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(17, 24, 39);
  doc.text(`Account Holder: ${customer.name}`, margin + 4, summaryY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(75, 85, 99);
  doc.text(`Phone: ${customer.phone || 'N/A'} | Email: ${customer.email || 'N/A'}`, margin + 4, summaryY + 12);
  doc.text(`Total Lifetime Orders: ${orders.length}`, margin + 4, summaryY + 18);

  // Account balances on right of box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`Total Billed: Rs. ${totalSpend.toLocaleString('en-IN')}`, pageWidth - margin - 60, summaryY + 6);
  doc.setTextColor(5, 150, 105);
  doc.text(`Total Settled: Rs. ${totalPaid.toLocaleString('en-IN')}`, pageWidth - margin - 60, summaryY + 12);
  doc.setTextColor(180, 83, 9);
  doc.text(`Pending COD: Rs. ${totalPending.toLocaleString('en-IN')}`, pageWidth - margin - 60, summaryY + 18);

  // Table of Invoices
  const tableStartY = summaryY + 28;
  doc.setFillColor(6, 95, 70);
  doc.rect(margin, tableStartY, contentWidth, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);

  doc.text('#', margin + 4, tableStartY + 5);
  doc.text('INVOICE / BILL ID', margin + 14, tableStartY + 5);
  doc.text('DATE', margin + 65, tableStartY + 5);
  doc.text('ITEMS SUMMARY', margin + 95, tableStartY + 5);
  doc.text('PAYMENT', margin + 145, tableStartY + 5);
  doc.text('AMOUNT (INR)', margin + contentWidth - 4, tableStartY + 5, { align: 'right' });

  let currentY = tableStartY + 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  orders.forEach((o, index) => {
    if (index % 2 === 1) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, currentY, contentWidth, 7, 'F');
    }

    doc.setDrawColor(240, 240, 240);
    doc.line(margin, currentY + 7, margin + contentWidth, currentY + 7);

    doc.setTextColor(75, 85, 99);
    doc.text(String(index + 1), margin + 4, currentY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(`INV-${o._id.toUpperCase()}`, margin + 14, currentY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text(new Date(o.createdAt).toLocaleDateString('en-IN'), margin + 65, currentY + 5);

    const itemsSummary = `${o.items.length} items (${o.items.map((i) => i.name).slice(0, 2).join(', ')}${o.items.length > 2 ? '...' : ''})`;
    const truncatedItems = doc.splitTextToSize(itemsSummary, 45)[0] || itemsSummary;
    doc.text(truncatedItems, margin + 95, currentY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(o.paymentStatus === 'Paid' ? 5 : 180, o.paymentStatus === 'Paid' ? 150 : 83, o.paymentStatus === 'Paid' ? 105 : 9);
    doc.text(`${o.paymentMethod} (${o.paymentStatus})`, margin + 145, currentY + 5);

    doc.setTextColor(17, 24, 39);
    doc.text(`Rs. ${o.totalAmount.toLocaleString('en-IN')}`, margin + contentWidth - 4, currentY + 5, { align: 'right' });

    currentY += 7;
  });

  // Totals Row
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, currentY, contentWidth, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(17, 24, 39);
  doc.text('TOTAL STATEMENT BALANCE:', margin + 4, currentY + 5.5);
  doc.text(`Rs. ${totalSpend.toLocaleString('en-IN')}`, margin + contentWidth - 4, currentY + 5.5, { align: 'right' });

  return doc;
}

/**
 * Directly opens the generated bill PDF in a new browser tab / window.
 * Returns the object URL for display or reference.
 */
export function openPdfDirectly(doc: jsPDF, filename = 'bill.pdf'): string {
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);

  // Method 1: Try window.open
  let popupBlocked = false;
  try {
    const win = window.open(url, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      popupBlocked = true;
    }
  } catch (err) {
    popupBlocked = true;
  }

  // Method 2: If popup was blocked or inside iframe, try direct synthetic click
  if (popupBlocked) {
    try {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
      }, 150);
    } catch (e) {
      console.warn('Anchor popup fallback failed:', e);
    }
  }

  return url;
}

/**
 * Directly downloads the PDF file to disk.
 */
export function downloadPdf(doc: jsPDF, filename = 'bill.pdf'): void {
  doc.save(filename);
}
