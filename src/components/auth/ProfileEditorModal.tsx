import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { X, UserRound, Phone } from 'lucide-react';

interface ProfileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileEditorModal: React.FC<ProfileEditorModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUserProfile } = useAppStore();
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(currentUser.name);
    setPhone(currentUser.phone || '');
  }, [currentUser.name, currentUser.phone, isOpen]);

  if (!isOpen) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateUserProfile({ name: name.trim(), phone: phone.trim() });
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <form onSubmit={submit} onClick={(event) => event.stopPropagation()} className="w-full max-w-md space-y-5 rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black text-stone-900 dark:text-stone-100">Edit your profile</h2>
            <p className="mt-1 text-xs text-stone-500">Changes are saved to your account.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800" aria-label="Close profile editor"><X className="h-4 w-4" /></button>
        </div>
        <label className="block text-xs font-bold text-stone-600 dark:text-stone-300">
          Full name
          <span className="relative mt-1 block"><UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" /><input required value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-3 text-sm dark:border-stone-700 dark:bg-stone-800" /></span>
        </label>
        <label className="block text-xs font-bold text-stone-600 dark:text-stone-300">
          Phone number
          <span className="relative mt-1 block"><Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" /><input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-3 text-sm dark:border-stone-700 dark:bg-stone-800" /></span>
        </label>
        {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>}
        <button disabled={saving} type="submit" className="w-full rounded-xl bg-orange-500 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60">{saving ? 'Saving…' : 'Save profile'}</button>
      </form>
    </div>
  );
};
