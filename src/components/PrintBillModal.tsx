import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  X,
  CheckCircle2,
  ExternalLink,
  Receipt,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Order, StoreInfo } from '../types';
import {
  BillFormat,
  generateOrderPdf,
  generateStatementPdf,
  openPdfDirectly,
  downloadPdf
} from '../utils/billPdfGenerator';

interface PrintBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order | null;
  statementCustomer?: {
    name: string;
    phone?: string;
    email?: string;
    address?: any;
    orderCount: number;
    totalSpent: number;
  } | null;
  customerOrders?: Order[];
  storeInfo: StoreInfo | null;
}

export const PrintBillModal: React.FC<PrintBillModalProps> = ({
  isOpen,
  onClose,
  order,
  statementCustomer,
  customerOrders = [],
  storeInfo
}) => {
  const [format, setFormat] = useState<BillFormat>('a4');
  const [openedUrl, setOpenedUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [actionDone, setActionDone] = useState(false);

  if (!isOpen) return null;

  const isStatement = Boolean(statementCustomer && !order);
  const filename = isStatement
    ? `FreshMart-Statement-${statementCustomer?.name.replace(/\s+/g, '_')}-${format}.pdf`
    : `FreshMart-Invoice-${order?._id || 'bill'}-${format}.pdf`;

  const handleOpenPdf = () => {
    setIsGenerating(true);
    setActionDone(false);

    try {
      let doc;
      if (isStatement && statementCustomer) {
        doc = generateStatementPdf(statementCustomer, customerOrders, storeInfo, format);
      } else if (order) {
        doc = generateOrderPdf(order, storeInfo, format);
      } else {
        return;
      }

      const url = openPdfDirectly(doc, filename);
      setOpenedUrl(url);
      setActionDone(true);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    setIsGenerating(true);
    try {
      let doc;
      if (isStatement && statementCustomer) {
        doc = generateStatementPdf(statementCustomer, customerOrders, storeInfo, format);
      } else if (order) {
        doc = generateOrderPdf(order, storeInfo, format);
      } else {
        return;
      }

      downloadPdf(doc, filename);
    } catch (err) {
      console.error('Failed to download PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-neutral-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-neutral-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-white">
                {isStatement ? 'Print Customer Account Statement' : 'Print Customer Billing Invoice'}
              </h2>
              <p className="text-xs text-neutral-400">
                Choose document format to open directly in your browser
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Order / Bill Summary Card */}
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200/80 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-neutral-900">
                  {isStatement ? `STATEMENT: ${statementCustomer?.name}` : `INV-${order?._id.toUpperCase()}`}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {isStatement ? `${customerOrders.length} Invoices` : `${order?.items.length} Items`}
                </span>
              </div>
              <p className="text-xs text-neutral-600 mt-1">
                Customer:{' '}
                <strong className="text-neutral-900">
                  {isStatement ? statementCustomer?.name : order?.customerName}
                </strong>
                {' · '}
                <span className="font-mono text-neutral-500">
                  {isStatement ? statementCustomer?.phone : order?.customerPhone || 'N/A'}
                </span>
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Total Amount</span>
              <span className="font-mono font-bold text-lg text-emerald-700">
                ₹{isStatement ? statementCustomer?.totalSpent.toLocaleString() : order?.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Format Options Choice */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Select Bill Format:</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              {/* Option 1: Standard A4 */}
              <button
                type="button"
                onClick={() => setFormat('a4')}
                className={`relative p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  format === 'a4'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                {format === 'a4' && (
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                )}
                <div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-xs text-neutral-900">Standard A4</h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                    Full official tax invoice (210×297mm) with Mandi & FSSAI licenses, signatory & tax details.
                  </p>
                </div>
                <span className="inline-block mt-3 text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded self-start">
                  Office & Archival
                </span>
              </button>

              {/* Option 2: Thermal (80mm) */}
              <button
                type="button"
                onClick={() => setFormat('thermal')}
                className={`relative p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  format === 'thermal'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                {format === 'thermal' && (
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                )}
                <div>
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-xs text-neutral-900">Thermal (80mm)</h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                    Compact POS roll receipt (80mm width) tailored for thermal printers and quick delivery handover.
                  </p>
                </div>
                <span className="inline-block mt-3 text-[10px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded self-start">
                  POS & Delivery Slip
                </span>
              </button>
            </div>
          </div>

          {/* Action Success / Direct Preview Notice */}
          {actionDone && openedUrl && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Bill PDF Generated ({format.toUpperCase()})
                </span>
                <a
                  href={openedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-bold underline inline-flex items-center gap-1"
                >
                  <span>Re-open in Tab</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] text-neutral-600">
                Your browser opened the PDF directly. You can also view it inside the iframe below or download a local copy.
              </p>
              {/* In-modal PDF viewer iframe so it is guaranteed visible even inside sandboxes */}
              <div className="h-44 w-full border border-neutral-300 rounded-lg overflow-hidden bg-neutral-200 mt-2">
                <iframe
                  src={openedUrl}
                  title="PDF Direct Viewer"
                  className="w-full h-full"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
              title="Download PDF directly to device"
            >
              <Download className="w-3.5 h-3.5 text-neutral-600" />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={handleOpenPdf}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isGenerating ? 'Generating...' : 'Open Bill PDF in Browser'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
