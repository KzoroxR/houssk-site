# Déploiement VPS

Cette version du site est un **site Astro statique**.  
En production, Nginx sert directement le dossier `dist/`.

## 1. Pré-requis

- Nginx installé sur le VPS
- Node.js 22+ installé
- Le repo cloné dans `/var/www/houssk-site/current`

## 2. Mise à jour après un pull

```bash
cd /var/www/houssk-site/current
git pull --ff-only
bash deployment/deploy.sh
```

Le site généré se trouve dans :

```bash
/var/www/houssk-site/current/dist
```

Le script exécute `npm ci` puis `npm run build`. Nginx lit immédiatement le nouveau dossier `dist/` : aucun redémarrage de Node et aucun rechargement de Nginx ne sont nécessaires.

## 3. Configuration Nginx initiale

Si le virtual host existe déjà avec Certbot, conserve ses blocs SSL et remplace seulement sa directive `root` et son bloc `location /` d'après [`nginx.houssk-site.conf`](./nginx.houssk-site.conf).

Pour une installation neuve, copie le fichier puis crée le lien symbolique :

```bash
sudo ln -s /etc/nginx/sites-available/houssk.fr /etc/nginx/sites-enabled/houssk.fr
sudo nginx -t
sudo systemctl reload nginx
```

Une fois le domaine accessible en HTTP, active HTTPS si nécessaire :

```bash
sudo certbot --nginx -d houssk.fr -d www.houssk.fr
```

## 4. Ancien service Next.js

- Plus besoin de service `systemd` Node.js pour le site vitrine.
- Si un ancien service `houssk-site` existe encore pour Next.js, tu peux le désactiver une fois Nginx branché sur `dist/` :

```bash
sudo systemctl disable --now houssk-site
```

Le site Astro est statique : ni PM2, ni `systemd`, ni port 3000 ne sont nécessaires.
