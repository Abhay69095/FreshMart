import React from 'react';
import { CheckCircle2, Clock, Package, Truck, Check, AlertCircle } from 'lucide-react';
import { OrderStatus, StatusHistoryItem } from '../types';

interface OrderTimelineProps {
  currentStatus: OrderStatus;
  history?: StatusHistoryItem[];
}

const STEPS: { status: OrderStatus; label: string; icon: React.FC<{ className?: string }> }[] = [
  { status: 'Placed', label: 'Order Placed', icon: Clock },
  { status: 'Confirmed', label: 'Confirmed by Vendor', icon: CheckCircle2 },
  { status: 'Preparing', label: 'Harvesting & Packing', icon: Package },
  { status: 'Out for Delivery', label: 'Out for Delivery', icon: Truck },
  { status: 'Delivered', label: 'Delivered Fresh', icon: Check }
];

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ currentStatus, history = [] }) => {
  if (currentStatus === 'Cancelled') {
    const cancelItem = history.find((h) => h.status === 'Cancelled');
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 sm:p-5 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-rose-900">Order Cancelled</h4>
          <p className="text-xs text-rose-700 mt-1">
            {cancelItem?.note || 'This order was cancelled. Reserved inventory was returned to farm stock.'}
          </p>
          {cancelItem?.timestamp && (
            <span className="text-[11px] text-rose-600 block mt-1">
              Cancelled on: {new Date(cancelItem.timestamp).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.status === currentStatus);

  return (
    <div className="w-full py-4">
      <div className="relative">
        {/* Horizontal Connector Line for Desktop */}
        <div className="hidden sm:block absolute top-5 left-8 right-8 h-0.5 bg-neutral-200 -z-0">
          <div
            className="h-full bg-emerald-600 transition-all duration-500"
            style={{
              width: currentIndex >= 0 ? `${(currentIndex / (STEPS.length - 1)) * 100}%` : '0%'
            }}
          />
        </div>

        {/* Steps container */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 sm:gap-2">
          {STEPS.map((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            const historyEntry = history.find((h) => h.status === step.status);
            const Icon = step.icon;

            return (
              <div key={step.status} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 z-10">
                {/* Circle badge */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors shadow-xs ${
                    isCompleted
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                      : 'bg-white border-2 border-neutral-300 text-neutral-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Text and status info */}
                <div className="flex-1 sm:flex-none">
                  <p className={`text-xs font-semibold ${isCompleted ? 'text-neutral-900' : 'text-neutral-400'}`}>
                    {step.label}
                  </p>
                  {isCurrent && (
                    <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded mt-0.5">
                      Current Status
                    </span>
                  )}
                  {historyEntry?.timestamp && (
                    <p className="text-[10px] text-neutral-500 mt-0.5">
                      {new Date(historyEntry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                  {historyEntry?.note && (
                    <p className="hidden sm:block text-[10px] text-neutral-500 mt-1 max-w-28 mx-auto truncate" title={historyEntry.note}>
                      {historyEntry.note}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
