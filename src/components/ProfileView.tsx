import React, { useState, useRef } from 'react';
import { User, Mail, Shield, Save, Loader2, Camera, Trash2 } from 'lucide-react';

export function ProfileView() {
  const [displayName, setDisplayName] = useState('Demo User');
  const [email] = useState('demo@example.com');
  const [photoURL, setPhotoURL] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    setTimeout(() => {
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès (Mode Démo) !' });
      setIsLoading(false);
    }, 800);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner une image valide.' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setMessage({ type: 'error', text: 'L\'image est trop volumineuse (max 2Mo).' });
      return;
    }

    setIsUploading(true);
    setMessage({ type: '', text: '' });

    setTimeout(() => {
      const objectUrl = URL.createObjectURL(file);
      setPhotoURL(objectUrl);
      setMessage({ type: 'success', text: 'Photo de profil mise à jour (Mode Démo) !' });
      setIsUploading(false);
    }, 1000);
  };

  const removePhoto = async () => {
    setIsUploading(true);
    setTimeout(() => {
      setPhotoURL('');
      setMessage({ type: 'success', text: 'Photo de profil supprimée.' });
      setIsUploading(false);
    }, 500);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Mon Profil</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Gérez vos informations personnelles et vos paramètres de compte.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1b20] p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Informations Personnelles</h3>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nom d'affichage</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="Votre nom"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email (Non modifiable)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      type="email" 
                      value={email} 
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0f1115]/50 text-slate-500 cursor-not-allowed outline-none"
                    />
                  </div>
                </div>
              </div>

              {message.text && (
                <div className={`p-4 rounded-xl text-sm font-medium ${
                  message.type === 'success' ? 'bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' : 'bg-red-50/50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800'
                }`}>
                  {message.text}
                </div>
              )}

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isLoading || isUploading}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1b20] p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Sécurité</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#0f1115] border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Mot de passe</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Dernière modification il y a 3 mois</p>
                  </div>
                </div>
                <button className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors">Modifier</button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1b20] p-6 shadow-sm text-center">
            <div className="relative inline-block mb-4">
              <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-3xl text-white font-bold shadow-xl shadow-indigo-500/20 mx-auto overflow-hidden">
                {isUploading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : photoURL ? (
                  <img src={photoURL} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  displayName?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-white dark:bg-[#1a1b20] border border-slate-200 dark:border-slate-800 shadow-lg text-slate-500 hover:text-indigo-600 transition-colors disabled:opacity-50"
              >
                <Camera className="h-4 w-4" />
              </button>
              {photoURL && (
                <button 
                  onClick={removePhoto}
                  className="absolute -top-2 -right-2 p-2 rounded-xl bg-white dark:bg-[#1a1b20] border border-slate-200 dark:border-slate-800 shadow-lg text-red-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{displayName || 'Utilisateur'}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{email}</p>
            
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">12</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Audits</p>
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">Pro</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Plan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
