import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Mail, Phone, MapPin, User, ShoppingBag, Receipt, Printer } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    api.getAdminCustomers()
      .then((res) => {
        if (res.success && res.customers) setCustomers(res.customers);
      })
      .catch((err) => {
        showToast('Failed to load customers', 'error');
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 font-display">
          Registered Customer Directory
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          View customer purchase history, total spending, and delivery addresses.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search customer by name, email, or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Primary Delivery Location</th>
                <th className="py-3 px-4">Total Orders</th>
                <th className="py-3 px-4">Total Spending</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4 text-right">Customer Invoices</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-400">Loading customers...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-400">No customers found.</td>
                </tr>
              ) : (
                filtered.map((cust) => (
                  <tr key={cust._id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                          {cust.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900">{cust.name}</p>
                          <span className="text-[10px] text-neutral-400 font-mono">ID: {cust._id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <p className="text-neutral-800">{cust.email}</p>
                      <p className="text-neutral-500 font-mono text-[11px]">{cust.phone}</p>
                    </td>

                    <td className="py-3 px-4 text-neutral-600">
                      {cust.address?.house ? (
                        <p className="truncate max-w-44" title={`${cust.address.house}, ${cust.address.street}, ${cust.address.city}`}>
                          {cust.address.house}, {cust.address.street}, {cust.address.city}
                        </p>
                      ) : (
                        <span className="text-neutral-400">Palghar, MH</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-neutral-900 tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                        {cust.orderCount}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-emerald-800 tabular-nums text-sm">
                      ₹{cust.totalSpent.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-neutral-500 font-mono text-[11px]">
                      {new Date(cust.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/admin/billing?customer=${cust._id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded font-semibold text-xs transition-colors"
                        title="View and print bills for this customer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Bills</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
