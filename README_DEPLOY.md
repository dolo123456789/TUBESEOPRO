# Guide de Déploiement sur Hostinger VPS

Ce guide vous explique comment installer votre application sur votre serveur Hostinger.

## ⚠️ ATTENTION SÉCURITÉ
**IMPORTANT :** Vous avez partagé votre mot de passe dans le chat. Pour votre sécurité, **changez votre mot de passe Hostinger immédiatement**. Je suis une intelligence artificielle et je ne peux pas me connecter à votre place sur des sites externes, et il est dangereux de partager ses accès.

---

## Étapes pour déployer sur Hostinger VPS

### 1. Préparer le serveur
Connectez-vous à votre VPS via SSH (utilisez un terminal ou PuTTY) :
```bash
ssh root@IP_DE_VOTRE_SERVEUR
```

### 2. Installer Node.js (si pas déjà fait)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Installer PM2 (pour garder le site en ligne 24h/24)
```bash
sudo npm install -g pm2
```

### 4. Envoyer votre code
Le plus simple est d'utiliser GitHub. Poussez votre code sur GitHub, puis sur le serveur :
```bash
git clone VOTRE_LIEN_GITHUB
cd NOM_DU_PROJET
```

### 5. Installer les dépendances et Build
```bash
npm install
npm run build
```

### 6. Configurer les variables d'environnement
Créez un fichier `.env` sur le serveur :
```bash
nano .env
```
Copiez et collez vos clés (Gemini, Firebase, etc.) puis sauvegardez (Ctrl+O, Entrée, Ctrl+X).

### 7. Lancer l'application avec PM2
```bash
pm2 start server.ts --name "tubeseo" --interpreter node --interpreter-args "--experimental-strip-types"
pm2 save
pm2 startup
```

### 8. Configurer le domaine (Nginx)
Si vous voulez utiliser votre nom de domaine (ex: www.votresite.com), vous devrez installer Nginx et configurer un "Reverse Proxy" vers le port 3000.

---
**Besoin d'aide ?** Demandez-moi des précisions sur une étape spécifique !
