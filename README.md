# Houssk Site

Site vitrine Astro pour `houssk.fr`, centré sur l'application `hous.sk`.

## Stack

- Astro
- CSS maison
- Site statique exporté dans `dist/`

## Développement local

```bash
npm install
npm run dev
```

Le site sera disponible sur `http://localhost:4321`.

## Build

```bash
npm run build
```

Le build statique est généré dans `dist/`.

## Prévisualisation locale du build

```bash
npm run preview
```

## Déploiement VPS

Le dossier [`deployment/`](./deployment) contient une configuration Nginx simple pour servir directement le dossier `dist` après un `git pull` puis `npm run build`.
