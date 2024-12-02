---
title: "Automatiser des tests pour maîtriser son impact carbone : guide pratique"
description: "Découvrez comment automatiser des tests pour réduire l’impact carbone de vos projets numériques, grâce à un guide accessible et innovant."
pubDate: "Dec 01 2024"
category: 'Web-performance'
tags: ["Tests automatisés", "Eco-conception", "Développement web"]
cover: "20241201-lighthouse-ci-github-action"
---

## Comprendre l’impact carbone du numérique

Quand on parle d’impact carbone, on pense souvent à des problématiques industrielles ou aux transports. Pourtant, le numérique représente aujourd’hui près de **4% des émissions mondiales de gaz à effet de serre**, un chiffre en constante augmentation. Chaque requête web, chaque octet transféré ou calcul exécuté contribue à ce bilan.

Mais bonne nouvelle : en tant que développeurs, managers ou architectes, nous avons le pouvoir d’agir. Automatiser des tests pour évaluer et réduire l’impact carbone d’un projet est une démarche à la fois technique et porteuse de sens. Et cela commence par une prise de conscience : tout ce que nous créons consomme des ressources. Pourquoi ne pas s'assurer que chaque ligne de code ait le moins d'impact possible ?

## Automatiser pour mesurer : pourquoi est-ce essentiel ?

Il est tentant de penser qu’un site statique ou une application bien optimisée n’a qu’un faible impact. Mais savez-vous que la **taille moyenne d’une page web** a été multipliée par 10 en 20 ans ? Ce poids, combiné aux centaines de requêtes quotidiennes par utilisateur, finit par peser lourd, littéralement.

L'automatisation permet :

1. **De mesurer l’impact en continu** : chaque déploiement est une opportunité d’améliorer vos pratiques.
2. **De détecter les dérives** : un nouveau script ou une image non optimisée peut soudainement doubler la consommation énergétique.
3. **De responsabiliser les équipes** : la transparence des résultats crée une dynamique d’amélioration continue.

Cet article a été spécialement conçu pour des **sites statiques** générés avec des outils modernes tels qu'**Astro**. Si vous utilisez Astro ou un framework similaire, ce guide est un excellent point de départ pour mettre en place des pratiques d'éco-conception efficaces.

## Étape 1 : Préparer son environnement

Pour commencer, vous aurez besoin d’outils capables de **quantifier l’impact carbone**. Parmi eux :

- **Lighthouse CI** : une solution open source qui audite les performances, l’accessibilité et les meilleures pratiques d’un site web.
- **GreenFrame** : un outil qui simule l’impact énergétique d’un utilisateur parcourant votre site.
- **WebsiteCarbon API** : pour estimer les émissions carbone basées sur le poids des pages et la source d’énergie utilisée.

Dans mon cas, j'ai choisis **Lighthouse CI** pour mes tests.

## Étape 2 : Intégrer l’automatisation dans vos workflows

### **Configurer Lighthouse CI**

Commencez par intégrer **Lighthouse CI** dans votre pipeline CI/CD (GitHub Actions, GitLab, etc.). Voici un guide rapide :

1. **Installer Lighthouse CI** :

   ```bash
   npm install -g @lhci/cli
   ```

2. **Créer un fichier de configuration** (`.lighthouserc.json`) à la racine de votre projet :

   ```json
   {
     "ci": {
       "collect": {
         "staticDistDir": "./dist",
         "numberOfRuns": 2
       },
       "assert": {
         "assertions": {
            "resource-summary.totalBytes": [ "warning", { "maxNumericValue": 500000 }],
            "resource-summary.requestCount": [ "warning", { "maxNumericValue": 50 } ],
            "script-treemap-data.unusedBytes": [ "warning", { "maxNumericValue": 100000 } ],
            "uses-optimized-images": ["error"],
            "interactive": [ "error", { "maxNumericValue": 3000 } ],
            "first-contentful-paint": [ "error", { "maxNumericValue": 1000 } ],
            "categories.accessibility": [ "error", { "minScore": 0.8 } ],
            "categories.seo": [ "warning", { "minScore": 0.9 } ],
            "font-display": ["error"],
            "uses-long-cache-ttl": ["error"]
         }
       },
       "upload": {
         "target": "temporary-public-storage"
       }
     }
   }
   ```

3. **Exécuter automatiquement les tests** :
   Intégrez un script comme celui-ci dans une **GitHub Action** :

   ```yaml
   jobs:
     lighthouse-ci:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout code
           uses: actions/checkout@v3

         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: "20"

        - name: Install, build, and upload your site
            uses: withastro/action@v3.0.0

        - name: Audit URLs using Lighthouse
            uses: treosh/lighthouse-ci-action@v12
            with:
                uploadArtifacts: true
                temporaryPublicStorage: true
   ```
## Étape 3 : Lancer manuellement les tests

Si vous souhaitez exécuter les tests manuellement pour une analyse ponctuelle ou pour tester rapidement un changement, voici comment faire :

1. **Construisez votre site Astro** :

   ```bash
   npm run build
   ```

2. **Lancez Lighthouse** :
   Exécutez la commande suivante pour analyser une ou plusieurs URLs :

   ```bash
   lhci autorun
   ```

4. **Afficher le rapport** :
   Les résultats seront disponibles dans les fichiers générés par Lighthouse, ou dans la console.

## Étape 4 : Créer une dynamique d’amélioration continue

Les tests automatisés ne sont pas une finalité. Ils doivent s’inscrire dans une démarche collaborative :

- **Partagez les résultats** : Affichez les rapports dans un tableau de bord (ex. Grafana).
- **Fixez des objectifs communs** : Réduire l’impact de 10% à chaque sprint.
- **Formez les équipes** : Sensibilisez-les aux bonnes pratiques d’éco-conception.

## En bref

Automatiser des tests pour maîtriser son impact carbone n’est pas seulement une question technique : c’est un engagement envers une **innovation responsable**. Cela peut sembler complexe au début, mais chaque étape franchie contribue à un web plus durable.

Et vous, avez-vous déjà pris des mesures pour réduire l’impact carbone de vos projets ?
