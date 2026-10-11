import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Address } from '../../types';
import {
  X,
  MapPin,
  Home,
  Briefcase,
  Plus,
  Trash2,
  Check,
  Edit2,
  Navigation,
} from 'lucide-react';

interface AddressBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddress?: (addr: Address) => void;
  selectedAddressId?: string;
}

export const AddressBookModal: React.FC<AddressBookModalProps> = ({
  isOpen,
  onClose,
  onSelectAddress,
  selectedAddressId,
}) => {
  const { currentUser, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAppStore();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [label, setLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [street, setStreet] = useState('');
  const [apartment, setApartment] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Islampur');
  const [state, setState] = useState('Maharashtra');
  const [zip, setZip] = useState('415409');
  const [isDefault, setIsDefault] = useState(false);
  const [lat, setLat] = useState(17.0585);
  const [lng, setLng] = useState(74.3108);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resetForm = () => {
    setLabel('Home');
    setStreet('');
    setApartment('');
    setLandmark('');
    setCity('Islampur');
    setState('Maharashtra');
    setZip('415409');
    setIsDefault(false);
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (addr: Address) => {
    setEditingId(addr.id);
    setLabel(addr.label);
    setStreet(addr.street);
    setApartment(addr.apartment || '');
    setLandmark(addr.landmark || '');
    setCity(addr.city);
    setState(addr.state);
    setZip(addr.zip);
    setIsDefault(addr.isDefault || false);
    setLat(addr.lat);
    setLng(addr.lng);
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!street.trim()) return;

    if (editingId) {
      updateAddress(editingId, {
        label,
        street,
        apartment,
        landmark,
        city,
        state,
        zip,
        isDefault,
        lat,
        lng,
      });
    } else {
      addAddress({
        label,
        street,
        apartment,
        landmark,
        city,
        state,
        zip,
        isDefault,
        lat,
        lng,
      });
    }

    resetForm();
  };

  const getLabelIcon = (l: string) => {
    if (l === 'Home') return <Home className="w-4 h-4 text-orange-500" />;
    if (l === 'Work') return <Briefcase className="w-4 h-4 text-blue-500" />;
    return <MapPin className="w-4 h-4 text-emerald-500" />;
  };

  // Quick preset Islampur locations
  const presets = [
    { name: 'Near ST Bus Stand', city: 'Islampur', lat: 17.0585, lng: 74.3108, zip: '415409' },
    { name: 'Shivaji Chowk', city: 'Islampur', lat: 17.0572, lng: 74.3095, zip: '415409' },
    { name: 'Market Yard', city: 'Islampur', lat: 17.0563, lng: 74.3080, zip: '415409' },
    { name: 'College Road, Walwa', city: 'Islampur', lat: 17.0618, lng: 74.3135, zip: '415409' },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-stone-900 dark:text-stone-100">
                Saved Delivery Addresses
              </h2>
              <p className="text-xs text-stone-400">
                Choose where you want your gourmet meal delivered
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-stone-500 transition-all active:scale-90 cursor-pointer pointer-events-auto"
            aria-label="Close address book"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {!isAdding ? (
            <>
              {/* Add New Button */}
              <button
                onClick={() => {
                  resetForm();
                  setIsAdding(true);
                }}
                className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-orange-400 dark:border-orange-500/40 text-orange-600 dark:text-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 text-xs font-extrabold flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Delivery Address</span>
              </button>

              {/* Address list */}
              {currentUser.addresses.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-xs">
                  No saved addresses found. Add an address to proceed.
                </div>
              ) : (
                <div className="space-y-3">
                  {currentUser.addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id || (addr.isDefault && !selectedAddressId);
                    return (
                      <div
                        key={addr.id}
                        className={`p-3.5 rounded-2xl border transition-all relative ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50/20 dark:bg-orange-950/20 shadow-sm'
                            : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div
                            onClick={() => {
                              if (onSelectAddress) {
                                onSelectAddress(addr);
                                onClose();
                              }
                            }}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              {getLabelIcon(addr.label)}
                              <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                                {addr.label}
                              </span>
                              {addr.isDefault && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-stone-700 dark:text-stone-300 mt-1 font-medium">
                              {addr.apartment ? `${addr.apartment}, ` : ''}
                              {addr.street}
                            </p>
                            {addr.landmark && (
                              <p className="text-[11px] text-stone-400">
                                Landmark: {addr.landmark}
                              </p>
                            )}
                            <p className="text-[11px] text-stone-400">
                              {addr.city}, {addr.state} - {addr.zip}
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => startEdit(addr)}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                              title="Edit address"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteAddress(addr.id)}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                              title="Delete address"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {!addr.isDefault && (
                          <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-stone-800/60 flex items-center justify-between">
                            <button
                              onClick={() => setDefaultAddress(addr.id)}
                              className="text-[11px] font-bold text-stone-400 hover:text-orange-600 dark:hover:text-orange-400"
                            >
                              Set as default
                            </button>
                            {onSelectAddress && (
                              <button
                                onClick={() => {
                                  onSelectAddress(addr);
                                  onClose();
                                }}
                                className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
                              >
                                Deliver to this address →
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            /* ADD / EDIT FORM */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                  {editingId ? 'Edit Address' : 'Enter Address Details'}
                </span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs font-bold text-stone-400 hover:text-stone-600"
                >
                  Cancel
                </button>
              </div>

              {/* Label Selector */}
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Address Label
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Home', 'Work', 'Other'] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLabel(l)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        label === l
                          ? 'border-orange-500 bg-orange-500 text-white shadow-sm'
                          : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {l === 'Home' && <Home className="w-3.5 h-3.5" />}
                      {l === 'Work' && <Briefcase className="w-3.5 h-3.5" />}
                      {l === 'Other' && <MapPin className="w-3.5 h-3.5" />}
                      <span>{l}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Pin Presets */}
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  1-Click Location Pin
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {presets.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => {
                        setStreet(p.name);
                        setCity(p.city);
                        setZip(p.zip);
                        setLat(p.lat);
                        setLng(p.lng);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-[11px] font-bold text-stone-700 dark:text-stone-300 hover:border-orange-400"
                    >
                      📍 {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Flat / House / Floor / Building
                </label>
                <input
                  type="text"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  placeholder="e.g. Apt 402, Tower B, Lotus Heights"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Complete Street Address *
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. Near ST Bus Stand, Main Road, Islampur"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                    Landmark
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Near Metro Station"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="560038"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded text-orange-500 focus:ring-orange-500"
                />
                <span className="text-xs text-stone-700 dark:text-stone-300 font-semibold">
                  Make this my default delivery address
                </span>
              </label>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/25 transition-all"
              >
                {editingId ? 'Update Address' : 'Save Address'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
