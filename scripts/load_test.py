#!/usr/bin/env python3
"""ANERIUM Load Test — 1000 concurrent requests against all major endpoints."""

import concurrent.futures
import time
import json
import statistics
import urllib.request
import urllib.error
import ssl
import os
from collections import defaultdict

BASE_URL = "https://anerium.com"
APP_ID = "6a7d630d865dd7ed11a16a3c"
TOTAL_REQUESTS = 1000
CONCURRENCY = 100

# Skip SSL verification for self-signed or internal certs
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

ENDPOINTS = [
    ("GET", "/health", None),
    ("GET", "/", None),
    ("GET", "/directory", None),
    ("GET", "/download", None),
    ("GET", "/api/apps/public/prod/public-settings/by-id/{}".format(APP_ID), None),
    ("GET", "/api/apps/{}/auth/google/start".format(APP_ID), None),
    ("GET", "/api/auth/google/start", None),
    ("POST", "/api/apps/{}/auth/login".format(APP_ID), {"email": "loadtest@test.com", "password": "wrong"}),
    ("POST", "/api/apps/{}/auth/register".format(APP_ID), {"email": "loadtest@test.com", "password": "test123456", "full_name": "Load Test"}),
    ("GET", "/api/apps/{}/entities/businesses".format(APP_ID), None),
]

def make_request(args):
    method, path, body = args
    url = BASE_URL + path
    data = None
    if body:
        data = json.dumps(body).encode("utf-8")
    
    req = urllib.request.Request(url, data=data, method=method)
    if body:
        req.add_header("Content-Type", "application/json")
    
    start = time.monotonic()
    try:
        resp = urllib.request.urlopen(req, timeout=30, context=ctx)
        elapsed = time.monotonic() - start
        return (path, method, resp.getcode(), elapsed, None)
    except urllib.error.HTTPError as e:
        elapsed = time.monotonic() - start
        return (path, method, e.code, elapsed, str(e))
    except Exception as e:
        elapsed = time.monotonic() - start
        return (path, method, 0, elapsed, str(e))

def run_test():
    print("=" * 80)
    print("  ANERIUM OnePass — LOAD TEST")
    print("  Total requests: {} per endpoint | Concurrency: {}".format(TOTAL_REQUESTS, CONCURRENCY))
    print("  Date: {}".format(time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())))
    print("=" * 80)
    print()
    
    all_results = {}
    
    for method, path, body in ENDPOINTS:
        label = "{} {}".format(method, path)
        print("Testing: {} ...".format(label), end=" ", flush=True)
        
        tasks = [(method, path, body)] * TOTAL_REQUESTS
        results = []
        start_time = time.time()
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=CONCURRENCY) as executor:
            futures = [executor.submit(make_request, task) for task in tasks]
            for f in concurrent.futures.as_completed(futures):
                results.append(f.result())
        
        total_time = time.time() - start_time
        all_results[label] = results
        
        # Calculate metrics
        times = sorted([r[3] for r in results])
        codes = [r[2] for r in results]
        errors = [r for r in results if r[2] == 0 or r[2] >= 500]
        
        max_time = max(times) * 1000
        min_time = min(times) * 1000
        avg_time = statistics.mean(times) * 1000
        median_time = statistics.median(times) * 1000
        
        # Percentiles
        p95_idx = int(len(times) * 0.95)
        p99_idx = int(len(times) * 0.99)
        p95 = times[p95_idx - 1] * 1000 if p95_idx > 0 else max_time
        p99 = times[p99_idx - 1] * 1000 if p99_idx > 0 else max_time
        
        # Status code distribution
        code_dist = defaultdict(int)
        for c in codes:
            code_dist[c] += 1
        
        error_rate = (len(errors) / len(results)) * 100
        throughput = len(results) / total_time
        
        print("Done ({:.1f}s)".format(total_time))
        print("  Requests: {} | Throughput: {:.1f} req/s".format(len(results), throughput))
        print("  Latency: min={:.0f}ms | avg={:.0f}ms | median={:.0f}ms | p95={:.0f}ms | p99={:.0f}ms | max={:.0f}ms".format(
            min_time, avg_time, median_time, p95, p99, max_time))
        print("  Error rate: {:.2f}% | Errors: {}".format(error_rate, len(errors)))
        print("  Status codes: {}".format(dict(sorted(code_dist.items()))))
        if errors:
            error_msgs = set([r[4] for r in errors if r[4]])
            print("  Error samples: {}".format(list(error_msgs)[:3]))
        print()
    
    # Overall summary
    print("=" * 80)
    print("  OVERALL SUMMARY")
    print("=" * 80)
    
    all_times = []
    all_errors = 0
    all_count = 0
    for label, results in all_results.items():
        for r in results:
            all_times.append(r[3])
            all_count += 1
            if r[2] == 0 or r[2] >= 500:
                all_errors += 1
    
    all_times.sort()
    overall_max = max(all_times) * 1000
    overall_avg = statistics.mean(all_times) * 1000
    overall_p95 = all_times[int(len(all_times) * 0.95) - 1] * 1000
    overall_p99 = all_times[int(len(all_times) * 0.99) - 1] * 1000
    overall_error_rate = (all_errors / all_count) * 100
    
    print("  Total requests: {}".format(all_count))
    print("  Overall avg: {:.0f}ms | p95: {:.0f}ms | p99: {:.0f}ms | max: {:.0f}ms".format(
        overall_avg, overall_p95, overall_p99, overall_max))
    print("  Overall error rate: {:.2f}%".format(overall_error_rate))
    print()
    
    # Per-endpoint table
    print("-" * 80)
    print("  {:<40} {:>7} {:>7} {:>7} {:>7} {:>7} {:>6}".format(
        "Endpoint", "Avg ms", "p95 ms", "p99 ms", "Max ms", "Errors", "Rate%"))
    print("-" * 80)
    for method, path, body in ENDPOINTS:
        label = "{} {}".format(method, path)
        if label in all_results:
            results = all_results[label]
            times = sorted([r[3] for r in results])
            errs = len([r for r in results if r[2] == 0 or r[2] >= 500])
            avg = statistics.mean(times) * 1000
            p95 = times[int(len(times) * 0.95) - 1] * 1000
            p99 = times[int(len(times) * 0.99) - 1] * 1000
            mx = max(times) * 1000
            rate = (errs / len(results)) * 100
            print("  {:<40} {:>7.0f} {:>7.0f} {:>7.0f} {:>7.0f} {:>7d} {:>5.1f}%".format(
                label[:40], avg, p95, p99, mx, errs, rate))
    print("-" * 80)
    print()
    
    # Breaking points
    print("  ENDPOINTS THAT BROKE UNDER LOAD:")
    broke = False
    for method, path, body in ENDPOINTS:
        label = "{} {}".format(method, path)
        if label in all_results:
            results = all_results[label]
            errs = len([r for r in results if r[2] == 0 or r[2] >= 500])
            max_time = max([r[3] for r in results]) * 1000
            if errs > 0:
                print("    ⚠️  {} — {} errors, max {}ms".format(label, errs, max_time))
                broke = True
            elif max_time > 500:
                print("    ⚠️  {} — slow (max {}ms, threshold 500ms)".format(label, max_time))
                broke = True
    if not broke:
        print("    ✅ No endpoints broke under load. All < 500ms, 0 errors.")
    print()
    
    print("=" * 80)
    print("  LOAD TEST COMPLETE")
    print("=" * 80)

if __name__ == "__main__":
    run_test()
