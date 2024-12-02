---
title: "Guide ultime des optimisations Astro : de zéro à expert"
description: "Un guide exhaustif pour pousser les performances de votre site Astro au maximum, avec exemples concrets et structure de projet complète"
pubDate: "Dec 20 2024"
category: "performance"
tags: ["Tests automatisés", "Eco-conception", "Développement web", "Optimisations"]
cover: "20241220-optimisations-pour-Astro"
---

Je me souviens encore de ma première rencontre avec Astro. "C'est déjà rapide par défaut", me disait-on. Et c'est vrai ! Mais après avoir optimisé plusieurs sites en production, je peux vous affirmer qu'Astro recèle encore de nombreux secrets de performance.

Je vais partager quelques techniques qui m'ont permis de passer de sites "rapides" à des sites "très-rapides".

# Optimisations fondamentales

## Configuration de base optimisée

Commençons par le fichier le plus important : `astro.config.mjs`

```javascript
// @ts-check
import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import pagefind from "astro-pagefind";

export default defineConfig({
  ...
  vite: {
    build: {
      modulePreload: {
        polyfill: true,
        resolveDependencies: (filename, deps) => {
          return deps.filter((dep) => !dep.includes("node_modules"));
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            utils: ["lodash", "date-fns"],
            home: ["./src/pages/index.astro"],
            ...
          },
          entryFileNames: "entries/[name]-[hash].js",
          chunkFileNames: "chunks/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash][extname]",
        },
      },
    },
    optimizeDeps: {
      include: ["react", "react-dom"],
      exclude: ["@astrojs/image"],
    },
  },
  ...
});
```

Cette configuration apporte plusieurs avantages :

- Chunking intelligent du code
- Préchargement optimisé des modules
- Gestion efficace des dépendances
- Nommage optimisé pour le cache

# Optimisations du cache

## Middleware de cache

File: `src/middleware/cache.ts`

```typescript
export async function onRequest({ request, next }) {
  const url = new URL(request.url);

  // Stratégie de cache pour les articles de blog
  if (url.pathname.startsWith("/articles")) {
    const response = await next();
    response.headers.set("Cache-Control", "public, max-age=3600");
    return response;
  }

  // Cache d'API avec stale-while-revalidate
  if (url.pathname.startsWith("/api")) {
    const response = await next();
    response.headers.set(
      "Cache-Control",
      "public, max-age=60, stale-while-revalidate=600"
    );
    return response;
  }
}
```

# Tests de performance

## Suite de tests

File: `tests/performance.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';

test.describe('Tests avancés de performance et qualité web', () => {
    test('Vérification des temps de chargement critiques', async ({ page }) => {
        await page.goto('/');

        const performanceEntries = await page.evaluate(() => {
            return performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        });

        expect(performanceEntries.domContentLoadedEventEnd).toBeLessThan(800);
        expect(performanceEntries.loadEventEnd).toBeLessThan(1500);
        expect(performanceEntries.domInteractive).toBeLessThan(800);
        expect(performanceEntries.responseStart).toBeLessThan(400);
    });

    test('Analyse Lighthouse des performances et de l’accessibilité', async ({ page }) => {
        await page.goto('/');

        const chrome = await launch({
            chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
        });

        try {
            const options = {
                logLevel: 'info' as 'info',
                output: 'json' as 'json',
                port: chrome.port,
            };

            const runnerResult = await lighthouse(page.url(), options);
            if (runnerResult) {
                const { lhr } = runnerResult;

                expect(lhr.categories.performance.score).toBeGreaterThanOrEqual(0.9);
                expect(lhr.categories.accessibility.score).toBeGreaterThanOrEqual(0.9);
                expect(lhr.categories['best-practices'].score).toBeGreaterThanOrEqual(0.9);
                expect(lhr.categories.seo.score).toBeGreaterThanOrEqual(0.9);

                expect(lhr.audits['first-contentful-paint'].numericValue).toBeLessThan(2000);
                expect(lhr.audits['largest-contentful-paint'].numericValue).toBeLessThan(2500);
                expect(lhr.audits['cumulative-layout-shift'].numericValue).toBeLessThan(0.1);
                expect(lhr.audits['total-blocking-time'].numericValue).toBeLessThan(300);
            } else {
                throw new Error("Lighthouse n'a pas retourné de résultat.");
            }
        } finally {
            chrome.kill();
        }
    });

    test('Métriques Web Vitals et interactions utilisateur', async ({ page }) => {
        await page.goto('/');

        const webVitals = await page.evaluate(() => {
            return new Promise((resolve) => {
                let cls = 0;
                let lcp = 0;
                let fid = 0;

                new PerformanceObserver((entryList) => {
                    for (const entry of entryList.getEntries()) {
                        if (entry.entryType === 'layout-shift') {
                            cls += (entry as any).value;
                        }
                    }
                }).observe({ type: 'layout-shift', buffered: true });

                new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries() as PerformanceEventTiming[];
                    lcp = entries[entries.length - 1].startTime;
                }).observe({ type: 'largest-contentful-paint', buffered: true });

                new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries() as PerformanceEventTiming[];
                    fid = entries[entries.length - 1].processingStart - entries[entries.length - 1].startTime;
                }).observe({ type: 'first-input', buffered: true });

                setTimeout(() => {
                    resolve({ cls, lcp, fid });
                }, 3000);
            });
        });

        expect((webVitals as { cls: number; lcp: number; fid: number }).cls).toBeLessThan(0.1);
        expect((webVitals as { cls: number; lcp: number; fid: number }).lcp).toBeLessThan(2500);
        expect((webVitals as { cls: number; lcp: number; fid: number }).fid).toBeLessThan(100);
    });

    test('Taille des ressources et types de fichiers', async ({ page }) => {
        await page.goto('/');

        const resourceSizes = await page.evaluate(() => {
            const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
            return resources.reduce((acc: { [key: string]: number }, resource) => {
                const type = resource.name.split('.').pop() || 'other';
                return {
                    ...acc,
                    [type]: (acc[type] || 0) + resource.encodedBodySize
                };
            }, {} as { [key: string]: number });
        });

        expect(resourceSizes['js'] || 0).toBeLessThan(500 * 1024); // 500KB max pour JS
        expect(resourceSizes['css'] || 0).toBeLessThan(100 * 1024); // 100KB max pour CSS
        expect(resourceSizes['png'] || 0 + resourceSizes['jpg'] || 0).toBeLessThan(1024 * 1024); // 1MB max pour les images
    });

    test('Logs du navigateur et erreurs JavaScript', async ({ page }) => {
        const consoleMessages: string[] = [];
        page.on('console', (msg) => consoleMessages.push(msg.text()));

        await page.goto('/');

        const errors = consoleMessages.filter((msg) => msg.toLowerCase().includes('error'));
        expect(errors.length).toBe(0);
    });
});
```

## Résultats concrets

Après application de toutes ces optimisations sur un site e-commerce récent, nous avons obtenu :

- Score Lighthouse : 98/100 en performance
- First Contentful Paint : 0.8s
- Largest Contentful Paint : 0.9s
- Time to Interactive : 0.8s
- Cumulative Layout Shift : 0.02

# Points clés à retenir

1. **Mesurer avant d'optimiser** : Utilisez les outils de monitoring pour identifier les vrais goulots d'étranglement.

2. **Optimisation progressive** : Ne faites pas tout d'un coup. Commencez par les optimisations qui auront le plus d'impact.

3. **Test en conditions réelles** : Testez toujours sur des appareils réels, particulièrement sur mobile avec une connexion limitée.

4. **Maintenance continue** : La performance n'est pas un état final mais un processus continu.

# Conclusion

L'optimisation d'un site Astro est un voyage passionnant qui peut mener à des résultats exceptionnels. Les techniques présentées dans ce guide sont le fruit de nombreuses expériences en production et continuent d'évoluer avec chaque nouveau projet.

Je vous invite à expérimenter avec ces optimisations, à les adapter à vos besoins spécifiques, et surtout, à partager vos découvertes avec la communauté. N'hésitez pas à me contacter si vous avez des questions ou des retours d'expérience à partager !

# Ressources complémentaires

- [Documentation officielle d'Astro](https://docs.astro.build/)
- [Web Vitals](https://web.dev/articles/vitals?hl=fr)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview?hl=fr)
