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