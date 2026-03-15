import React, { useState, useEffect } from 'react';
import { Key, Save, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export function SettingsView() {
  const [keys, setKeys] = useState({
    master_key: '',
    public_key: '',
    private_key: '',
    token: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    async function fetchKeys() {
      try {
        const docRef = doc(db, 'app_config', 'paydunya');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setKeys(docSnap.data() as any);
        }
      } catch (error) {
        console.error('Error fetching keys:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchKeys();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await setDoc(doc(db, 'app_config', 'paydunya'), keys);
      setMessage({ type: 'success', text: 'Clés Paydunya enregistrées avec succès !' });
    } catch (error) {
      console.error('Error saving keys:', error);
      setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement des clés.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Configuration API</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Configurez vos clés Paydunya pour activer les paiements réels.</p>
      </div>

      <div className="max-w-2xl">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1b20] p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Clés Paydunya</h3>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Master Key</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="password" 
                  value={keys.master_key}
                  onChange={(e) => setKeys({...keys, master_key: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="MASTER_KEY"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Public Key</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="password" 
                  value={keys.public_key}
                  onChange={(e) => setKeys({...keys, public_key: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="PUBLIC_KEY"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Private Key</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="password" 
                  value={keys.private_key}
                  onChange={(e) => setKeys({...keys, private_key: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="PRIVATE_KEY"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Token</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="password" 
                  value={keys.token}
                  onChange={(e) => setKeys({...keys, token: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="TOKEN"
                />
              </div>
            </div>

            {message.text && (
              <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
                message.type === 'success' ? 'bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' : 'bg-red-50/50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800'
              }`}>
                {message.type === 'success' ? <ShieldCheck className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                {message.text}
              </div>
            )}

            <div className="pt-4">
              <button 
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Enregistrer la configuration
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
