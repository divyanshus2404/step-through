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
    py.globals.set('_code', m.code);
    py.globals.set('_tests', JSON.stringify(m.tests || []));
    py.globals.set('_setup', m.setup || '');
    const r = py.runPython('_run(_code, json.loads(_tests), _setup)');
    postMessage({ type: 'result', id: m.id, result: JSON.parse(r) });
  } catch (err) {
    postMessage({ type: m.type === 'boot' ? 'boot-error' : 'result', id: m.id, error: String(err && err.message || err) });
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
          if (w) { waiting.delete(m.id); w(m.error ? { error: m.error, stdout: '', tests: [] } : m.result); }
        }
      };
      worker.onerror = () => { clearTimeout(bootTimer); fail('Python could not load here. It needs an internet connection, and some hosted views block it.'); };
      worker.postMessage({ type: 'boot', base: g.PYODIDE_BASE || CDN, harness: HARNESS });
    });
    return ready;
  }

  g.Py = {
    get isReady() { return !!worker; },
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
