import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  {
    q: 'How does FreshMart guarantee products are truly fresh?',
    a: 'Unlike centralized supermarket apps that store products for 4-6 days in industrial refrigerators, FreshMart works directly with morning cart harvests. Products arrive at 5:00 AM at the APMC Palghar yard, are inspected, digitally weighed, and dispatched to your address by 7:30 AM.'
  },
  {
    q: 'What are the delivery charges and minimum order values?',
    a: 'We offer FREE Doorstep Delivery on all orders of ₹499 and above. For orders under ₹499, a nominal local delivery fee of ₹40 is added to cover direct neighborhood riders.'
  },
  {
    q: 'Can I inspect my fruits and vegetables before paying?',
    a: 'Yes, absolutely! We encourage all customers to choose Cash on Delivery (COD) or UPI on Delivery. You can check the firmness of tomatoes, crunch of carrots, and leaves of spinach at your door. If anything does not meet your quality expectations, you can return that item on the spot.'
  },
  {
    q: 'How fast will my order arrive?',
    a: 'Orders placed between 7:00 AM and 8:00 PM are delivered within 90 minutes across Palghar city and surrounding areas. Orders placed late at night are dispatched first thing the following morning.'
  },
  {
    q: 'Can I cancel an order after placing it?',
    a: 'Yes. As long as your order is in "Placed" or "Confirmed" status, you can cancel it with 1 click directly from your Order Details page. The allocated inventory is immediately restored to our stock.'
  },
  {
    q: 'Are your digital scales certified?',
    a: 'Yes. All weighing scales used in our APMC market stall are government-certified electronic digital scales, ensuring 100% accurate net weight for every 250g, 500g, or kilogram ordered.'
  }
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
          Help & Answers
        </span>
        <h1 className="text-3xl font-extrabold text-neutral-900 font-display">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
          Everything you need to know about our fresh harvesting, delivery timings, and quality guarantees.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-neutral-50"
              >
                <span className="font-semibold text-neutral-900 text-sm">{faq.q}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 bg-neutral-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
