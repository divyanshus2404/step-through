/* Runs Python in a Web Worker with Pyodide, so a stuck loop can be stopped. */
(function (g) {
  'use strict';
  const CDN = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';
  const LIMIT_MS = 10000;

  const HARNESS = `
import io, json, traceback, contextlib

def _clean_error(exc):
    lines = []
    tb = traceback.extract_tb(exc.__traceback__)
    for f in tb:
        if f.filename == "<your code>":
            lines.append(f"line {f.lineno}, in {f.name}")
    text = traceback.format_exception_only(type(exc), exc)[-1].strip()
    return text + ("\\n" + "\\n".join(lines[-3:]) if lines else "")

def _perf(code, setup, pre, call):
    import time, hashlib
    res = {"secs": 0, "digest": "", "error": None}
    ns = {"__name__": "__main__"}
    try:
        if setup:
            exec(setup, ns)
        with contextlib.redirect_stdout(io.StringIO()):
            exec(compile(code, "<your code>", "exec"), ns)
            exec(pre, ns)
            t = time.perf_counter()
            got = eval(call, ns)
            res["secs"] = time.perf_counter() - t
        res["digest"] = hashlib.sha1(repr(got).encode()).hexdigest()
    except BaseException as e:
        res["error"] = _clean_error(e)
    return json.dumps(res)

def _run(code, tests, setup):
    out = io.StringIO()
    res = {"stdout": "", "error": None, "tests": []}
    ns = {"__name__": "__main__"}
    try:
        if setup:
            exec(setup, ns)
        with contextlib.redirect_stdout(out):
            exec(compile(code, "<your code>", "exec"), ns)
    except BaseException as e:
        res["error"] = _clean_error(e)
        res["stdout"] = out.getvalue()
        return json.dumps(res)
    for call, expected in tests:
        item = {"call": call, "expected": expected}
        try:
            with contextlib.redirect_stdout(out):
                got = eval(call, ns)
            want = eval(expected, ns)
            item["got"] = repr(got)
            item["pass"] = bool(got == want and type(got) == type(want))
        except BaseException as e:
            item["got"] = _clean_error(e)
            item["pass"] = False
        res["tests"].append(item)
    res["stdout"] = out.getvalue()
    return json.dumps(res)
`;

  const WORKER = `
let py = null;
async function boot(base, harness) {
  importScripts(base + 'pyodide.js');
  py = await loadPyodide({ indexURL: base });
  await py.runPythonAsync(harness);
}
onmessage = async (e) => {
  const m = e.data;
  try {
    if (m.type === 'boot') { await boot(m.base, m.harness); postMessage({ type: 'ready' }); return; }
    if (m.type === 'perf') {
      py.globals.set('_code', m.code);
      py.globals.set('_setup', m.setup || '');
      py.globals.set('_pre', m.pre);
      py.globals.set('_call', m.call);
      postMessage({ type: 'result', id: m.id, result: JSON.parse(py.runPython('_perf(_code, _setup, _pre, _call)')) });
      return;
    }
    py.globals.set('_code', m.code);
    py.globals.set('_tests', JSON.stringify(m.tests || []));
    py.globals.set('_setup', m.setup || '');
    const r = py.runPython('_run(_code, json.loads(_tests), _setup)');
    postMessage({ type: 'result', id: m.id, result: JSON.parse(r) });
  } catch (err) {
    postMessage({ type: m.type === 'boot' ? 'boot-error' : 'result', id: m.id, fatal: true, error: String(err && err.message || err) });
  }
};`;

  let worker = null, ready = null, seq = 0;
  const waiting = new Map();

  function start(onStatus) {
    if (ready) return ready;
    ready = new Promise((resolve, reject) => {
      if (onStatus) onStatus('Loading Python. This takes a few seconds the first time.');
      try {
        const url = URL.createObjectURL(new Blob([WORKER], { type: 'text/javascript' }));
        worker = new Worker(url);
      } catch (e) { ready = null; reject(new Error('This browser blocked background workers, so Python cannot start.')); return; }
      const fail = (msg) => {
        ready = null;
        if (worker) worker.terminate();
        worker = null;
        reject(new Error(msg));
      };
      const bootTimer = setTimeout(() => fail('Python took too long to load. Check your internet connection and try again.'), 90000);
      worker.onmessage = (e) => {
        const m = e.data;
        if (m.type === 'ready') { clearTimeout(bootTimer); resolve(); }
        else if (m.type === 'boot-error') { clearTimeout(bootTimer); fail('Python could not load here. It needs an internet connection, and some hosted views block it.'); }
        else if (m.type === 'result') {
          const w = waiting.get(m.id);
          /* A crash such as a stack overflow leaves Python unusable, so start a fresh one next time. */
          if (m.fatal) { worker.terminate(); worker = null; ready = null; }
          const friendly = /call stack|too much recursion/i.test(m.error || '') ? 'Your code recursed too deeply and ran out of stack. Check your base case, or use a loop.' : m.error;
          if (w) { waiting.delete(m.id); w(m.error ? { error: friendly, stdout: '', tests: [] } : m.result); }
        }
      };
      worker.onerror = () => { clearTimeout(bootTimer); fail('Python could not load here. It needs an internet connection, and some hosted views block it.'); };
      worker.postMessage({ type: 'boot', base: g.PYODIDE_BASE || CDN, harness: HARNESS });
    });
    return ready;
  }

  /* Runs one timed job, stopping it if it passes the limit. Resolves null when stopped. */
  async function timedRun(code, setup, spec, limitMs) {
    await start();
    const id = ++seq;
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        waiting.delete(id);
        worker.terminate();
        worker = null;
        ready = null;
        resolve(null);
      }, limitMs);
      waiting.set(id, (r) => { clearTimeout(timer); resolve(r); });
      worker.postMessage({ type: 'perf', id, code, setup, pre: spec.pre, call: spec.call });
    });
  }

  g.Py = {
    get isReady() { return !!worker; },
    /* Times an answer on a large input against the reference on this same device.
       Fails only if it's over 30 times slower and over 1.5 seconds, so slow phones and
       reasonable alternatives such as sorting still pass. */
    async speedCheck(question, spec, code) {
      const t0 = performance.now();
      const ref = await timedRun(question.solution, question.setup || '', spec, 60000);
      const refWall = performance.now() - t0;
      if (!ref || ref.error) return { state: 'unknown' };
      const budget = Math.max(1500, ref.secs * 30000);
      /* The wall limit also covers loading the code and building the input. */
      const mine = await timedRun(code, question.setup || '', spec, budget + (refWall - ref.secs * 1000) * 3 + 500);
      if (!mine) return { state: 'slow' };
      if (mine.error) return { state: 'error', error: mine.error };
      if (mine.secs * 1000 > budget) return { state: 'slow' };
      if (mine.digest !== ref.digest) return { state: 'wrong' };
      return { state: 'ok' };
    },
    async run(code, tests, setup, onStatus) {
      await start(onStatus);
      const id = ++seq;
      return new Promise((resolve) => {
        const timer = setTimeout(() => {
          waiting.delete(id);
          worker.terminate();
          worker = null;
          ready = null;
          resolve({ error: `Stopped after ${LIMIT_MS / 1000} seconds. There may be an infinite loop, such as a while loop whose condition never changes.`, stdout: '', tests: [], timedOut: true });
        }, LIMIT_MS);
        waiting.set(id, (r) => { clearTimeout(timer); resolve(r); });
        worker.postMessage({ type: 'run', id, code, tests, setup });
      });
    },
  };
})(window);
