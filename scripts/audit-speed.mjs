import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';

const pagesToTest = [
  { name: 'Homepage (/)', path: '/' },
  { name: 'Services Index (/services)', path: '/services' },
  { name: 'Service Detail (/services/websites)', path: '/services/websites' },
  { name: 'Cases Index (/cases)', path: '/cases' },
  { name: 'Case Detail (/case/onmacabim)', path: '/case/onmacabim' },
  { name: 'Solutions Index (/solutions)', path: '/solutions' },
];

async function runAudit() {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'] });
  const port = chrome.port;
  const baseUrl = 'http://127.0.0.1:4399';

  const results = [];

  for (const page of pagesToTest) {
    const url = `${baseUrl}${page.path}`;
    console.log(`\n========================================`);
    console.log(`Auditing: ${page.name} -> ${url}`);
    console.log(`========================================`);

    // Mobile run
    const mobileFlags = {
      port,
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      formFactor: 'mobile',
      screenEmulation: {
        mobile: true,
        width: 390,
        height: 844,
        deviceScaleFactor: 3,
        disabled: false,
      },
      throttling: {
        rttMs: 150,
        throughputKbps: 1638.4,
        requestLatencyMs: 562.5,
        downloadThroughputKbps: 1474.56,
        uploadThroughputKbps: 675,
        cpuSlowdownMultiplier: 4,
      },
    };

    // Desktop run
    const desktopFlags = {
      port,
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      formFactor: 'desktop',
      screenEmulation: {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
        disabled: false,
      },
      throttling: {
        rttMs: 40,
        throughputKbps: 10240,
        cpuSlowdownMultiplier: 1,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0,
      },
    };

    console.log(`Running Mobile Audit...`);
    const mobileResult = await lighthouse(url, mobileFlags);
    const mReport = JSON.parse(mobileResult.report);

    console.log(`Running Desktop Audit...`);
    const desktopResult = await lighthouse(url, desktopFlags);
    const dReport = JSON.parse(desktopResult.report);

    function extractMetrics(report) {
      const audits = report.audits;
      const categories = report.categories;

      const opportunities = [];
      for (const key of Object.keys(audits)) {
        const audit = audits[key];
        if (audit.details && audit.details.type === 'opportunity' && (audit.numericValue > 50 || (audit.score !== null && audit.score < 0.9))) {
          opportunities.push({
            id: key,
            title: audit.title,
            displayValue: audit.displayValue,
            numericValue: audit.numericValue,
            description: audit.description,
            details: audit.details?.items ? audit.details.items.slice(0, 5) : undefined,
          });
        }
      }

      const diagnostics = [];
      const diagKeys = [
        'render-blocking-resources',
        'unused-javascript',
        'unused-css-rules',
        'unminified-javascript',
        'unminified-css',
        'modern-image-formats',
        'uses-optimized-images',
        'uses-responsive-images',
        'efficient-animated-content',
        'duplicated-javascript',
        'legacy-javascript',
        'dom-size',
        'critical-request-chains',
        'font-display',
        'largest-contentful-paint-element',
        'lcp-breakdown',
        'layout-shift-elements',
        'long-tasks',
        'mainthread-work-breakdown',
        'bootup-time',
        'network-rtt',
        'network-server-latency',
        'total-byte-weight',
      ];

      for (const key of diagKeys) {
        if (audits[key]) {
          const a = audits[key];
          if (a.score !== null && a.score < 1) {
            diagnostics.push({
              id: key,
              title: a.title,
              displayValue: a.displayValue || '',
              score: a.score,
              details: a.details ? JSON.stringify(a.details).slice(0, 400) : '',
            });
          }
        }
      }

      // Extract network total size breakdown
      const totalByteWeight = audits['total-byte-weight']?.displayValue || '';
      const lcpElement = audits['largest-contentful-paint-element']?.displayValue || audits['largest-contentful-paint-element']?.details?.items?.[0]?.node?.snippet || '';

      return {
        scores: {
          performance: Math.round((categories.performance?.score || 0) * 100),
          accessibility: Math.round((categories.accessibility?.score || 0) * 100),
          bestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
          seo: Math.round((categories.seo?.score || 0) * 100),
        },
        cwv: {
          FCP: audits['first-contentful-paint']?.displayValue,
          LCP: audits['largest-contentful-paint']?.displayValue,
          TBT: audits['total-blocking-time']?.displayValue,
          CLS: audits['cumulative-layout-shift']?.displayValue,
          SI: audits['speed-index']?.displayValue,
          TTFB: audits['server-response-time']?.displayValue,
          INP: audits['interaction-to-next-paint']?.displayValue,
        },
        lcpElement,
        totalByteWeight,
        opportunities,
        diagnostics,
      };
    }

    const pageSummary = {
      page: page.name,
      path: page.path,
      mobile: extractMetrics(mReport),
      desktop: extractMetrics(dReport),
    };

    results.push(pageSummary);
  }

  await chrome.kill();

  fs.writeFileSync('scripts/speed-audit-results.json', JSON.stringify(results, null, 2));
  console.log('\n=== AUDIT COMPLETE. Results written to scripts/speed-audit-results.json ===\n');

  // Print Summary Table
  console.log('SUMMARY TABLE:');
  for (const res of results) {
    console.log(`\n======================================================`);
    console.log(`PAGE: ${res.page}`);
    console.log(`======================================================`);
    console.log(`  MOBILE:  Perf: ${res.mobile.scores.performance}/100 | FCP: ${res.mobile.cwv.FCP} | LCP: ${res.mobile.cwv.LCP} | TBT: ${res.mobile.cwv.TBT} | CLS: ${res.mobile.cwv.CLS} | Weight: ${res.mobile.totalByteWeight}`);
    console.log(`  DESKTOP: Perf: ${res.desktop.scores.performance}/100 | FCP: ${res.desktop.cwv.FCP} | LCP: ${res.desktop.cwv.LCP} | TBT: ${res.desktop.cwv.TBT} | CLS: ${res.desktop.cwv.CLS} | Weight: ${res.desktop.totalByteWeight}`);
    if (res.mobile.opportunities.length > 0) {
      console.log(`  Mobile Opportunities:`);
      for (const op of res.mobile.opportunities) {
        console.log(`    - ${op.title}: ${op.displayValue || ''}`);
      }
    }
    if (res.mobile.diagnostics.length > 0) {
      console.log(`  Mobile Diagnostics:`);
      for (const d of res.mobile.diagnostics) {
        console.log(`    - ${d.title} (score: ${d.score}): ${d.displayValue}`);
      }
    }
  }
}

runAudit().catch(console.error);
