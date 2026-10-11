import React, { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { X, UserRound, Phone, Camera, Upload, Check, RefreshCw } from 'lucide-react';

interface ProfileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  { label: 'Gourmet Foodie', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { label: 'Chef Special', url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150&auto=format&fit=crop&q=80' },
  { label: 'Urban Diner', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80' },
  { label: 'Culinary Artist', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80' },
  { label: 'Epicurean', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { label: 'Gourmand', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
];

export const ProfileEditorModal: React.FC<ProfileEditorModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUserProfile } = useAppStore();
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(currentUser.name);
    setPhone(currentUser.phone || '');
    setAvatar(currentUser.avatar || '');
    setAvatarUrlInput('');
    setShowUrlInput(false);
    setError('');
  }, [currentUser.name, currentUser.phone, currentUser.avatar, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, WEBP, etc.).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 320;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatar(compressedDataUrl);
          setError('');
        }
      };
      img.onerror = () => setError('Failed to process image file.');
      img.src = e.target?.result as string;
    };
    reader.onerror = () => setError('Failed to read image file.');
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!avatarUrlInput.trim()) return;
    setAvatar(avatarUrlInput.trim());
    setAvatarUrlInput('');
    setShowUrlInput(false);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateUserProfile({
        name: name.trim(),
        phone: phone.trim(),
        avatar: avatar.trim(),
      });
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg space-y-5 rounded-3xl border border-stone-200 bg-white p-6 sm:p-7 shadow-2xl dark:border-stone-800 dark:bg-stone-900 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black text-stone-900 dark:text-stone-100">Edit Your Profile</h2>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
              Customize your display name, phone, and profile avatar.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-600 transition-colors"
            aria-label="Close profile editor"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Avatar Section */}
        <div className="space-y-3 pt-1">
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
            Profile Avatar
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80">
            <div className="relative group shrink-0">
              <img
                src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={name || 'User avatar'}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-orange-500/50 shadow-md"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/45 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white cursor-pointer"
                title="Upload Photo"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left w-full">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="px-3 py-1.5 rounded-xl bg-stone-200/80 hover:bg-stone-300 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Image URL
                </button>

                {avatar && (
                  <button
                    type="button"
                    onClick={() => setAvatar('')}
                    className="px-2.5 py-1.5 rounded-xl text-stone-400 hover:text-rose-500 text-xs font-medium transition-colors cursor-pointer"
                    title="Reset to default"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-stone-400">
                Supports JPG, PNG, WEBP from your device (auto-optimized).
              </p>
            </div>
          </div>

          {showUrlInput && (
            <div className="flex gap-2 animate-in fade-in">
              <input
                type="url"
                placeholder="https://example.com/your-photo.jpg"
                value={avatarUrlInput}
                onChange={(e) => setAvatarUrlInput(e.target.value)}
                className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs dark:border-stone-700 dark:bg-stone-800"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-3 py-2 rounded-xl bg-stone-800 dark:bg-stone-700 text-white text-xs font-bold hover:bg-stone-700 cursor-pointer"
              >
                Apply
              </button>
            </div>
          )}

          {/* Quick Preset Selector */}
          <div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
              Or Choose A Preset
            </span>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_AVATARS.map((p, index) => {
                const isSelected = avatar === p.url;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setAvatar(p.url)}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all group cursor-pointer ${
                      isSelected
                        ? 'border-orange-500 scale-105 shadow-md ring-2 ring-orange-500/30'
                        : 'border-transparent hover:border-orange-400/60'
                    }`}
                    title={p.label}
                  >
                    <img
                      src={p.url}
                      alt={p.label}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-orange-500/30 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <label className="block text-xs font-bold text-stone-600 dark:text-stone-300">
          Full Name
          <span className="relative mt-1 block">
            <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-3 text-sm dark:border-stone-700 dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
            />
          </span>
        </label>

        <label className="block text-xs font-bold text-stone-600 dark:text-stone-300">
          Phone Number
          <span className="relative mt-1 block">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-3 text-sm dark:border-stone-700 dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
            />
          </span>
        </label>

        {error && (
          <p role="alert" className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </p>
        )}

        <button
          disabled={saving}
          type="submit"
          className="w-full rounded-xl bg-orange-500 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60 transition-all shadow-lg shadow-orange-500/25 active:scale-[0.98] cursor-pointer"
        >
          {saving ? 'Saving Profile…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};
