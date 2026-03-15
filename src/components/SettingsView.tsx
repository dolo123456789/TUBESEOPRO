import React, { useState, useEffect } from 'react';
import { Key, Save, Loader2, ShieldCheck, AlertCircle, LogIn } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

import { cn } from './Layout';

export function SettingsView() {
  console.log("SettingsView rendering...");
  const [keys, setKeys] = useState({
    master_key: '',
    public_key: '',
    private_key: '',
    token: '',
    mode: 'test' as 'test' | 'live'
  });
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchKeys();
      } else {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: auth.currentUser?.tenantId,
        providerInfo: auth.currentUser?.providerData.map(provider => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL
        })) || []
      },
      operationType,
      path
    };
    console.error('Firestore Error Details:', JSON.stringify(errInfo, null, 2));
    
    if (errInfo.error.includes('insufficient permissions')) {
      setMessage({ 
        type: 'error', 
        text: 'Accès refusé. Seul l\'administrateur (adjisanoudolo1@gmail.com) peut modifier ces paramètres.' 
      });
    } else {
      setMessage({ type: 'error', text: 'Erreur Firestore : ' + errInfo.error });
    }
  };

  async function fetchKeys() {
    setIsLoading(true);
    const path = 'app_config/paydunya';
    console.log("Fetching keys from Firestore...");
    try {
      const docRef = doc(db, 'app_config', 'paydunya');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Keys found in Firestore:", Object.keys(data));
        setKeys(prev => ({
          master_key: data.master_key || prev.master_key,
          public_key: data.public_key || prev.public_key,
          private_key: data.private_key || prev.private_key,
          token: data.token || prev.token,
          mode: data.mode || prev.mode
        }));
      } else {
        console.log("No keys found in Firestore at", path);
      }
    } catch (error) {
      console.error("Error in fetchKeys:", error);
      handleFirestoreError(error, OperationType.GET, path);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Attempting to save keys...");
    if (!user) {
      setMessage({ type: 'error', text: 'Veuillez vous connecter pour enregistrer les clés.' });
      return;
    }

    setIsSaving(true);
    setMessage({ type: '', text: '' });
    const path = 'app_config/paydunya';

    try {
      console.log("Saving to Firestore path:", path);
      await setDoc(doc(db, 'app_config', 'paydunya'), keys);
      console.log("Save successful!");
      setMessage({ type: 'success', text: 'Clés Paydunya enregistrées avec succès !' });
    } catch (error) {
      console.error("Error in handleSave:", error);
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="p-4 rounded-full bg-amber-500/10 text-amber-600">
          <AlertCircle className="h-12 w-12" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Connexion requise</h2>
        <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm">
          Vous devez être connecté avec votre compte administrateur pour configurer les clés API.
        </p>
      </div>
    );
  }

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

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mode de paiement</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setKeys({...keys, mode: 'test'})}
                  className={cn(
                    "flex-1 py-2 rounded-xl border font-bold transition-all",
                    keys.mode === 'test' 
                      ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400"
                      : "bg-white border-slate-200 text-slate-500 dark:bg-[#0f1115] dark:border-slate-800"
                  )}
                >
                  Mode Test
                </button>
                <button
                  type="button"
                  onClick={() => setKeys({...keys, mode: 'live'})}
                  className={cn(
                    "flex-1 py-2 rounded-xl border font-bold transition-all",
                    keys.mode === 'live' 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400"
                      : "bg-white border-slate-200 text-slate-500 dark:bg-[#0f1115] dark:border-slate-800"
                  )}
                >
                  Mode Live
                </button>
              </div>
              <p className="text-[10px] text-slate-500 italic">
                {keys.mode === 'test' 
                  ? "Utilisez vos clés de test Paydunya pour simuler des paiements." 
                  : "Attention : les paiements seront réels. Utilisez vos clés de production."}
              </p>
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
