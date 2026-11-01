# Step Through

Learn data structures and algorithms in Python from zero, with animations you can step through.

**Live site:** https://stepthrough-gamma.vercel.app

## What's inside

40 topics in order, from Python basics to segment trees. Each topic has:

- a plain-English explanation
- step-by-step animations with play, pause, step and speed controls, most with input you can edit
- Python examples you can run in the browser
- a quiz with feedback
- coding questions checked in the browser using [Pyodide](https://pyodide.org)
- homework and real-life questions
- LeetCode problems, Easy to Medium

Progress saves in your browser, so it stays on that device and browser only.

## Run it locally

There is nothing to install or build. Open `index.html` in a browser. Running Python needs an internet connection, because Pyodide loads from a CDN.

## Project layout

| Path | What it holds |
|---|---|
| `js/engine.js` | Animation engine and player |
| `js/viz-*.js` | The animations |
| `js/content-*.js` | The curriculum |
| `js/runner.js` | Runs Python in a Web Worker |
| `js/app.js` | Pages, routing and progress |
| `tests/` | Content and animation checks |

## Tests

```bash
node tests/verify.js . /tmp/data.json
```

```bash
python3 tests/verify.py /tmp/data.json
```

The first command checks the structure of every topic and runs every animation with default and random inputs. The second runs every reference solution against its tests, confirms the starter code doesn't already pass, and runs the code examples. Add any extra argument to the second command, such as `lc`, to also check LeetCode numbers, titles and difficulty against leetcode.com.

These checks run on every push and pull request.

## Deployment

Vercel deploys the `main` branch automatically.
