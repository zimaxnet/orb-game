#!/usr/bin/env node

/**
 * OrbGame Backend Endpoint Tester
 * --------------------------------
 * This script calls all known backend endpoints sequentially, captures
 * the HTTP status, response time, and parses JSON if possible. It prints
 * a progressive list of results with PASS/FAIL markers and a final summary.
 *
 * Usage:
 *   node scripts/test-endpoints.js [backend-base-url]
 *
 * Example:
 *   node scripts/test-endpoints.js https://api.orbgame.us
 */

import { performance } from 'node:perf_hooks';
import https from 'https';
import http from 'http';
import { URL } from 'url';
import fs from 'fs';

// Terminal colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function colorText(text, color) {
  return `${color}${text}${colors.reset}`;
}

// Base URL from CLI arg or default
const BASE_URL = process.argv[2] || 'https://api.orbgame.us';

// Global request timeout (ms). Override by providing a third CLI arg or ENDPOINT_TEST_TIMEOUT env.
const TIMEOUT_MS = Number.isFinite(Number(process.argv[3])) && Number(process.argv[3]) > 0
  ? Number(process.argv[3])
  : (process.env.ENDPOINT_TEST_TIMEOUT ? Number(process.env.ENDPOINT_TEST_TIMEOUT) : 4000);

// Define endpoints to test
const endpoints = [
  { name: 'Health', method: 'GET', path: '/health' },
  { name: 'Root', method: 'GET', path: '/' },
  { name: 'API Info', method: 'GET', path: '/api' },
  { name: 'Analytics Summary', method: 'GET', path: '/api/analytics/summary' },
  { name: 'Analytics Detailed', method: 'GET', path: '/api/analytics/detailed' },
  { name: 'Search Decisions', method: 'GET', path: '/api/analytics/search-decisions' },
  { name: 'Memory Profile', method: 'GET', path: '/api/memory/profile' },
  { name: 'Memory Stats', method: 'GET', path: '/api/memory/stats' },
  { name: 'Memory Export', method: 'GET', path: '/api/memory/export' },
  {
    name: 'Memory Search',
    method: 'POST',
    path: '/api/memory/search',
    data: { query: 'capital', userId: 'endpoint-test-user', limit: 1 }
  },
  {
    name: 'Chat',
    method: 'POST',
    path: '/api/chat',
    data: { message: 'Hello! What can you do?', userId: 'endpoint-test-user' }
  },
  { name: 'Positive News (Technology)', method: 'GET', path: '/api/orb/positive-news/Technology' }
];

let passed = 0;
let failed = 0;

function makeRequest({ method, path, data }) {
  return new Promise((resolve) => {
    const url = new URL(path, BASE_URL);
    const isHttps = url.protocol === 'https:';
    const options = {
      method,
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'OrbGame-Endpoint-Tester/1.0'
      }
    };

    const reqModule = isHttps ? https : http;
    const startTime = performance.now();

    const req = reqModule.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        const duration = Math.round(performance.now() - startTime);
        let parsedBody;
        try {
          parsedBody = JSON.parse(body);
        } catch (e) {
          parsedBody = body;
        }
        resolve({ status: res.statusCode, duration, body: parsedBody });
      });
    });

    // Abort if the request exceeds the timeout
    req.setTimeout(TIMEOUT_MS, () => {
      req.destroy(new Error(`Timeout after ${TIMEOUT_MS}ms`));
    });

    req.on('error', (err) => {
      resolve({ error: err.message });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

(async function runTests() {
  console.log(colorText(`\n🧪 Testing OrbGame Backend Endpoints on ${BASE_URL}\n`, colors.blue));

  const results = [];

  for (const ep of endpoints) {
    process.stdout.write(colorText(`Testing ${ep.name} ... `, colors.yellow));
    const result = await makeRequest(ep);

    if (result.error) {
      console.log(colorText(`ERROR: ${result.error}`, colors.red));
      failed++;
      results.push({ ...ep, success: false, error: result.error });
      continue;
    }

    const { status, duration } = result;
    const success = status >= 200 && status < 300;
    const statusColor = success ? colors.green : colors.red;

    console.log(colorText(`${status} (${duration}ms)`, statusColor));

    if (success) {
      passed++;
    } else {
      failed++;
    }

    results.push({ ...ep, success, status, duration, body: result.body });
  }

  // Pretty summary
  console.log(colorText('\n📊 Test Summary', colors.blue));
  console.log(`Passed: ${colorText(passed, colors.green)} / Failed: ${colorText(failed, colors.red)} / Total: ${endpoints.length}`);

  // Detailed results table (name, status, ms, pass/fail)
  const tableData = results.map((r) => ({
    Endpoint: r.name,
    Method: r.method,
    Path: r.path,
    Status: r.status || 'ERR',
    Time_ms: r.duration || '-',
    Result: r.success ? 'PASS' : 'FAIL'
  }));

  console.table(tableData);

  // Write full JSON results to file for troubleshooting
  const reportPath = `endpoint-test-report-${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify({ baseUrl: BASE_URL, results }, null, 2));
  console.log(colorText(`\n📄 Full JSON report saved to ${reportPath}\n`, colors.blue));
})(); 