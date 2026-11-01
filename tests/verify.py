# Runs every reference solution against its tests, checks starters fail, runs snippets, and checks LeetCode data.
import json, sys, io, contextlib, urllib.request, time
data = json.load(open(sys.argv[1]))
fails = 0
def run(code, setup, tests):
    ns = {"__name__": "__main__"}
    if setup: exec(setup, ns)
    with contextlib.redirect_stdout(io.StringIO()):
        exec(code, ns)
    res = []
    for call, exp in tests:
        try:
            with contextlib.redirect_stdout(io.StringIO()):
                got = eval(call, ns)
            want = eval(exp, ns)
            res.append((call, exp, got, got == want and type(got) == type(want)))
        except Exception as e:
            res.append((call, exp, repr(e), False))
    return res
ncode = 0
for t in data:
    for c in t["coding"]:
        ncode += 1
        try:
            r = run(c["solution"], c.get("setup"), c["tests"])
        except Exception as e:
            print("SOLUTION CRASH", t["id"], c["id"], e); fails += 1; continue
        for call, exp, got, ok in r:
            if not ok:
                print("SOLUTION FAIL", t["id"], c["id"], call, "want", exp, "got", got); fails += 1
        try:
            r = run(c["starter"], c.get("setup"), c["tests"])
            if all(x[3] for x in r):
                print("STARTER PASSES", t["id"], c["id"]); fails += 1
        except Exception as e:
            pass
    for s in t["code"]:
        try:
            with contextlib.redirect_stdout(io.StringIO()):
                exec(s["src"], {"__name__": "__main__"})
        except Exception as e:
            print("SNIPPET CRASH", t["id"], s["title"], repr(e)); fails += 1
npy = skipped = 0
for t in data:
    for q in t.get("pyq", []):
        if "code" not in q:
            continue
        need = q.get("needs")
        if need:
            try:
                __import__(need)
            except ImportError:
                skipped += 1
                continue
        npy += 1
        buf = io.StringIO()
        try:
            with contextlib.redirect_stdout(buf):
                exec(q["code"], {"__name__": "__main__"})
        except Exception as e:
            print("PY QUESTION CRASH", q["id"], repr(e)); fails += 1; continue
        if buf.getvalue().rstrip("\n") != q["out"].rstrip("\n"):
            print("PY QUESTION OUTPUT", q["id"], repr(buf.getvalue()), "want", repr(q["out"])); fails += 1
print("python question samples", npy, "skipped", skipped)
print("coding questions", ncode, "failures", fails)

if len(sys.argv) > 2:
    seen = {}
    for t in data:
        for n, title, slug, diff in t["leetcode"]:
            seen.setdefault(slug, []).append((t["id"], n, title, diff, t.get("stretch", False)))
    bad = 0
    q = 'query q($s:String!){question(titleSlug:$s){questionFrontendId title difficulty isPaidOnly}}'
    for slug, uses in seen.items():
        body = json.dumps({"query": q, "variables": {"s": slug}}).encode()
        req = urllib.request.Request("https://leetcode.com/graphql", body, {"Content-Type": "application/json", "Referer": "https://leetcode.com", "User-Agent": "Mozilla/5.0"})
        try:
            d = json.load(urllib.request.urlopen(req, timeout=20))["data"]["question"]
        except Exception as e:
            print("LC ERROR", slug, e); bad += 1; continue
        if not d:
            print("LC MISSING", slug); bad += 1; continue
        for tid, n, title, diff, stretch in uses:
            issues = []
            if str(n) != d["questionFrontendId"]: issues.append(f'id {n} vs {d["questionFrontendId"]}')
            if title != d["title"]: issues.append(f'title {title!r} vs {d["title"]!r}')
            if diff != d["difficulty"]: issues.append(f'diff {diff} vs {d["difficulty"]}')
            if d["isPaidOnly"]: issues.append('premium')
            if d["difficulty"] == "Hard" and not stretch: issues.append('hard')
            if issues:
                print("LC", tid, slug, "; ".join(issues)); bad += 1
        time.sleep(0.12)
    print("leetcode slugs", len(seen), "problems", bad)
sys.exit(1 if fails or (len(sys.argv) > 2 and bad) else 0)
