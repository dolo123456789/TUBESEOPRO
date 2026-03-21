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
    gemini_api_key: '',
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
    // Paydunya keys removed
    setIsLoading(false);
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: 'success', text: 'Paramètres enregistrés (simulé).' });
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
        <p className="text-sm text-slate-500 dark:text-slate-400">Configurez vos clés PayTech pour activer les paiements réels.</p>
      </div>

      <div className="max-w-2xl">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1b20] p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Paramètres Généraux</h3>
          </div>

          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Les paramètres de paiement PayTech ont été retirés de cette vue pour des raisons de sécurité. Contactez l'administrateur pour toute modification manuelle via les variables d'environnement.
          </p>

          <form onSubmit={handleSave} className="space-y-4">
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
                Enregistrer les modifications
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
