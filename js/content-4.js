/* Curriculum part 4: topics that slot in next to related material */
(function () {
  const after = (id, t) => TOPICS.splice(TOPICS.findIndex((x) => x.id === id) + 1, 0, t);

  after('strings', {
    id: 'kmp', stage: 's2', title: 'String matching with KMP', tagline: 'Find a word inside text without ever re-reading it.', mins: 30,
    analogy: "You're reading along with someone and lose your place. If the last few words you heard also begin the sentence you were following, you don't start again. You carry on from there.",
    learn: [
      "The simple way to find a pattern in text tries every start position and compares letters. On text like `aaaa...ab` that costs O(n × m), because the same letters get compared over and over.",
      "**KMP** (Knuth-Morris-Pratt) never moves the text pointer backwards. When a match fails partway, it already knows which part of the pattern still lines up, so it slides the pattern ahead.",
      "It gets that knowledge from the **LPS table**. `lps[i]` is the length of the longest proper prefix of `p[0..i]` that is also a suffix of it. For `abcab` the table is `0 0 0 1 2`.",
      "Total time is O(n + m): the text pointer only moves forward, and the pattern pointer can't move back more often than it moved forward. In everyday Python, use `s.find(p)` or `p in s`. Learn KMP for interviews and for what the LPS table teaches you about repeated structure.",
    ],
    keys: ["Naive matching can be O(n × m)", "The text pointer never goes back", "LPS: longest prefix that is also a suffix", "KMP is O(n + m)"],
    cost: [['Build LPS table', 'O(m)'], ['Search', 'O(n)'], ['Extra space', 'O(m)']],
    anims: ['kmp-search'],
    code: [{ title: 'A neat trick using the LPS table', src: `def build_lps(p):
    lps = [0] * len(p)
    k = 0
    for i in range(1, len(p)):
        while k and p[i] != p[k]:
            k = lps[k - 1]
        if p[i] == p[k]:
            k += 1
        lps[i] = k
    return lps

def repeats(s):       # is s some shorter piece repeated?
    k = build_lps(s)[-1]
    n = len(s)
    return k > 0 and n % (n - k) == 0

print(build_lps("abcab"))  # [0, 0, 0, 1, 2]
print(repeats("abab"), repeats("abcab"))  # True False` }],
    quiz: [
      { q: "What is the LPS table for `aaa`?", o: ["0 0 0", "0 1 2", "1 2 3", "0 1 1"], a: 1, why: "`a` has no proper prefix, `aa` has `a` at both ends, and `aaa` has `aa` at both ends." },
      { q: "What's the time complexity of KMP for text n and pattern m?", o: ["O(n × m)", "O(n + m)", "O(n log m)", "O(m²)"], a: 1, why: "Building the table is O(m), and the scan is O(n) because the text pointer never moves back." },
      { q: "After a mismatch at pattern position `j`, where does the pattern continue?", o: ["Position 0", "`lps[j - 1]`", "`j + 1`", "`lps[j]`"], a: 1, why: "The first `j` characters matched, and `lps[j - 1]` says how much of that still lines up." },
      { q: "When is the naive method at its worst?", o: ["Short text", "All different letters", "Lots of repeated letters", "Sorted text"], a: 2, why: "Long partial matches get thrown away and re-checked, as with `aaaa...ab`." },
    ],
    coding: [
      { id: 'lps', title: 'Build the LPS table', prompt: "Write `build_lps(p)` that returns the LPS list for a non-empty pattern.", starter: `def build_lps(p):\n    # your code here\n    pass\n`, tests: [['build_lps("abcab")', '[0, 0, 0, 1, 2]'], ['build_lps("aaaa")', '[0, 1, 2, 3]'], ['build_lps("abab")', '[0, 0, 1, 2]'], ['build_lps("a")', '[0]']], hint: "Keep `k`, the current matched length. On a mismatch, fall back with `k = lps[k - 1]`.", solution: `def build_lps(p):\n    lps = [0] * len(p)\n    k = 0\n    for i in range(1, len(p)):\n        while k and p[i] != p[k]:\n            k = lps[k - 1]\n        if p[i] == p[k]:\n            k += 1\n        lps[i] = k\n    return lps\n` },
      { id: 'kmp-find', title: 'Find the first occurrence', prompt: "Write `find(t, p)` returning the first index of `p` in `t`, or -1. Don't use `in`, `find` or `index`. `p` isn't empty.", starter: `def find(t, p):\n    # your code here\n    pass\n`, tests: [['find("sadbutsad", "sad")', '0'], ['find("leetcode", "leeto")', '-1'], ['find("abxabcabcaby", "abcaby")', '6'], ['find("aaaaab", "aab")', '3'], ['find("a", "ab")', '-1']], hint: "Build the LPS table first, then walk the text once.", solution: `def find(t, p):\n    lps = [0] * len(p)\n    k = 0\n    for i in range(1, len(p)):\n        while k and p[i] != p[k]:\n            k = lps[k - 1]\n        if p[i] == p[k]:\n            k += 1\n        lps[i] = k\n    j = 0\n    for i, ch in enumerate(t):\n        while j and ch != p[j]:\n            j = lps[j - 1]\n        if ch == p[j]:\n            j += 1\n        if j == len(p):\n            return i - j + 1\n    return -1\n` },
    ],
    homework: ["Work out the LPS table for `ababaca` by hand, then check it with code.", "Count comparisons for the naive method and KMP on `aaaaaaaaab` with pattern `aab`.", "In the animation, try a pattern with no repeats, such as `abcd`. Why does it behave like the naive method?"],
    reallife: [
      { q: "How can a text editor's Find box stay fast on a huge log file?", a: "With a linear-time search such as KMP, or a similar algorithm, it moves through the file once instead of re-reading text after each partial match." },
      { q: "Biologists search for a short DNA sequence in millions of letters using only four characters. Why is the naive method risky here?", a: "With so few letters, partial matches are common and there's a lot of repeated work. KMP guarantees O(n + m) whatever the data looks like." },
    ],
    leetcode: [[28, 'Find the Index of the First Occurrence in a String', 'find-the-index-of-the-first-occurrence-in-a-string', 'Easy'], [459, 'Repeated Substring Pattern', 'repeated-substring-pattern', 'Easy'], [796, 'Rotate String', 'rotate-string', 'Easy'], [686, 'Repeated String Match', 'repeated-string-match', 'Medium']],
  });

  after('shortest-paths', {
    id: 'bellman-ford', stage: 's8', title: 'Bellman-Ford and negative edges', tagline: 'Shortest paths when some edges have negative costs.', mins: 25,
    analogy: "Passing news through a chain of friends. In round 1 your direct friends know. In round 2 their friends know. After enough rounds, the best version of the news has reached everyone.",
    learn: [
      "Dijkstra treats a node as final once it's popped. A later negative edge could break that promise. **Bellman-Ford** makes no such promise: it just keeps improving.",
      "It loops over **every edge** V − 1 times. Why that many? A shortest path visits each node at most once, so it has at most V − 1 edges, and round k makes all paths of up to k edges correct.",
      "Run one extra round. If anything still improves, a **negative cycle** exists: a loop whose total is below zero, so you could circle it forever and no shortest path exists.",
      "Time is O(V × E), far slower than Dijkstra. Use Dijkstra when weights are non-negative, and Bellman-Ford when they might not be. It also fits problems limiting the number of edges, such as Cheapest Flights Within K Stops.",
    ],
    keys: ["Relax every edge V − 1 times", "Handles negative edges", "An extra improving round means a negative cycle", "O(V × E)"],
    anims: ['bellman-ford'],
    code: [{ title: 'Cheapest route with at most k stops', src: `def cheapest(n, flights, src, dst, k):
    dist = [float("inf")] * n
    dist[src] = 0
    for _ in range(k + 1):
        prev = dist[:]     # only use last round's values
        for u, v, w in flights:
            if prev[u] + w < dist[v]:
                dist[v] = prev[u] + w
    return dist[dst] if dist[dst] != float("inf") else -1

flights = [[0, 1, 100], [1, 2, 100], [0, 2, 500]]
print(cheapest(3, flights, 0, 2, 1))  # 200
print(cheapest(3, flights, 0, 2, 0))  # 500` }],
    quiz: [
      { q: "Why V − 1 rounds?", o: ["It's a guess", "A shortest path has at most V − 1 edges", "To sort the edges", "Because of the heap"], a: 1, why: "Without negative cycles, a shortest path never repeats a node." },
      { q: "How do you detect a negative cycle?", o: ["A distance becomes negative", "An edge still improves in an extra round", "The graph has a loop", "You can't"], a: 1, why: "After V − 1 rounds nothing should improve unless a negative cycle exists." },
      { q: "When is Dijkstra the better choice?", o: ["With negative edges", "When all weights are non-negative", "Never", "Only on trees"], a: 1, why: "It's correct there and much faster: O((V + E) log V) against O(V × E)." },
      { q: "Is a negative distance on its own a problem?", o: ["Yes, always", "No, only a negative cycle breaks things", "Only with big graphs", "Only in directed graphs"], a: 1, why: "A negative total is fine. The issue is a loop you could repeat to keep lowering the cost." },
    ],
    coding: [
      { id: 'bf', title: 'Bellman-Ford', prompt: "Nodes are `0` to `n - 1`, and `edges` holds `[u, v, w]`. Write `bellman_ford(n, edges, start)` returning the distance list, with `float(\"inf\")` for unreachable nodes, or `None` if a reachable negative cycle exists.", starter: `def bellman_ford(n, edges, start):\n    # your code here\n    pass\n`, tests: [['bellman_ford(3, [[0, 1, 4], [0, 2, 5], [2, 1, -3]], 0)', '[0, 2, 5]'], ['bellman_ford(3, [[0, 1, 1], [1, 2, -2], [2, 1, 1]], 0)', 'None'], ['bellman_ford(2, [], 0)', '[0, float("inf")]']], hint: "Skip edges whose start is still unreachable: `inf + (-5)` is still `inf`, and comparing is safe, so this mostly works by itself.", solution: `def bellman_ford(n, edges, start):\n    dist = [float("inf")] * n\n    dist[start] = 0\n    for _ in range(n - 1):\n        for u, v, w in edges:\n            if dist[u] + w < dist[v]:\n                dist[v] = dist[u] + w\n    for u, v, w in edges:\n        if dist[u] + w < dist[v]:\n            return None\n    return dist\n` },
      { id: 'k-stops', title: 'Cheapest flights within k stops', prompt: "Write `cheapest(n, flights, src, dst, k)` where each flight is `[u, v, price]`. Use at most `k` stops, meaning `k + 1` flights. Return the price, or -1.", starter: `def cheapest(n, flights, src, dst, k):\n    # your code here\n    pass\n`, tests: [['cheapest(3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 1)', '200'], ['cheapest(3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 0)', '500'], ['cheapest(2, [], 0, 1, 3)', '-1']], hint: "Do `k + 1` rounds. Read from a copy of the last round, so one round can't chain several flights.", solution: `def cheapest(n, flights, src, dst, k):\n    dist = [float("inf")] * n\n    dist[src] = 0\n    for _ in range(k + 1):\n        prev = dist[:]\n        for u, v, w in flights:\n            if prev[u] + w < dist[v]:\n                dist[v] = prev[u] + w\n    return dist[dst] if dist[dst] != float("inf") else -1\n` },
    ],
    homework: ["Compare the two graphs in the animation, and find the exact loop with a negative total.", "Find a small graph where Dijkstra gives the wrong answer and Bellman-Ford gets it right.", "Explain why `prev = dist[:]` matters in the k-stops code."],
    reallife: [
      { q: "How can a currency trader spot a profit from a chain of exchanges?", a: "Treat currencies as nodes and use negative logarithms of the rates as weights. A negative cycle means a loop of trades that makes money." },
      { q: "Why might a network routing protocol use this idea rather than Dijkstra?", a: "Routers only know their neighbours. Sharing distances in rounds, as Bellman-Ford does, lets each router learn routes with no full map of the network." },
    ],
    leetcode: [[787, 'Cheapest Flights Within K Stops', 'cheapest-flights-within-k-stops', 'Medium'], [743, 'Network Delay Time', 'network-delay-time', 'Medium'], [1334, 'Find the City With the Smallest Number of Neighbors at a Threshold Distance', 'find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance', 'Medium']],
  });

  after('bellman-ford', {
    id: 'mst', stage: 's8', title: 'Minimum spanning trees', tagline: 'Connect everything for the lowest total cost.', mins: 25,
    analogy: "A village needs every house on the water network and each pipe costs money. You want everyone connected using the cheapest possible set of pipes, with no wasteful loops.",
    learn: [
      "A **spanning tree** connects all V nodes using exactly V − 1 edges and no cycles. A **minimum spanning tree** (MST) is the one with the lowest total weight. It's a different goal from shortest paths: it minimises the whole network, not the route from one node.",
      "**Kruskal's algorithm** sorts edges by cost and keeps each edge that joins two separate groups. Union-Find checks that quickly. Time is O(E log E).",
      "**Prim's algorithm** grows one tree from a starting node. A min-heap always offers the cheapest edge leaving the tree. Time is O(E log V). It suits dense graphs.",
      "Both are greedy, and both are correct because of the **cut property**: for any split of the nodes into two sides, the cheapest edge crossing the split is safe to include.",
    ],
    keys: ["V − 1 edges and no cycles", "Kruskal: sort edges and use Union-Find", "Prim: grow from a node with a heap", "MST is not the same as shortest paths"],
    anims: ['mst-kruskal'],
    code: [{ title: "Prim's algorithm with a heap", src: `import heapq

def prim(graph, start):
    seen = set()
    heap = [(0, start)]
    total = 0
    while heap:
        w, u = heapq.heappop(heap)
        if u in seen:
            continue
        seen.add(u)
        total += w
        for v, cost in graph[u]:
            if v not in seen:
                heapq.heappush(heap, (cost, v))
    return total

g = {"a": [("b", 1), ("c", 4)],
     "b": [("a", 1), ("c", 2)],
     "c": [("a", 4), ("b", 2)]}
print(prim(g, "a"))  # 3` }],
    quiz: [
      { q: "How many edges does a spanning tree of 10 nodes have?", o: ["10", "9", "11", "45"], a: 1, why: "A tree with V nodes always has V − 1 edges." },
      { q: "When does Kruskal reject an edge?", o: ["It's expensive", "Both ends are already in one group", "It's the last edge", "It's negative"], a: 1, why: "That edge would create a cycle." },
      { q: "Which structure does Prim's use to pick the next edge?", o: ["Min-heap", "Stack", "Plain queue", "Trie"], a: 0, why: "It repeatedly needs the cheapest edge leaving the tree." },
      { q: "Does an MST give the shortest path between any two nodes?", o: ["Yes, always", "No, it minimises total weight only", "Only in small graphs", "Only with Prim's"], a: 1, why: "A route through the tree can be longer than a direct edge that wasn't chosen." },
    ],
    coding: [
      { id: 'kruskal', title: "Kruskal's algorithm", prompt: "Nodes are `0` to `n - 1`, and `edges` holds `(w, a, b)`. Write `mst_cost(n, edges)` returning the total MST cost, or -1 if the graph can't be fully connected.", starter: `def mst_cost(n, edges):\n    # your code here\n    pass\n`, tests: [['mst_cost(4, [(1, 0, 1), (2, 1, 2), (3, 0, 2), (4, 2, 3)])', '7'], ['mst_cost(3, [(1, 0, 1)])', '-1'], ['mst_cost(1, [])', '0']], hint: "Count the edges you keep. A complete answer has `n - 1`.", solution: `def mst_cost(n, edges):\n    parent = list(range(n))\n    def find(x):\n        while parent[x] != x:\n            parent[x] = parent[parent[x]]\n            x = parent[x]\n        return x\n    total = used = 0\n    for w, a, b in sorted(edges):\n        ra, rb = find(a), find(b)\n        if ra != rb:\n            parent[ra] = rb\n            total += w\n            used += 1\n    return total if used == n - 1 else -1\n` },
      { id: 'connect-points', title: 'Connect all points', prompt: "`points` holds `[x, y]`. The cost between two points is `abs(x1 - x2) + abs(y1 - y2)`. Write `connect(points)` returning the minimum cost to connect them all.", starter: `import heapq\n\ndef connect(points):\n    # your code here\n    pass\n`, tests: [['connect([[0, 0], [2, 2], [3, 10], [5, 2], [7, 0]])', '20'], ['connect([[3, 12], [-2, 5], [-4, 1]])', '18'], ['connect([[0, 0]])', '0']], hint: "Use Prim's, working out each distance as you need it.", solution: `import heapq\n\ndef connect(points):\n    n = len(points)\n    seen = set()\n    heap = [(0, 0)]\n    total = 0\n    while len(seen) < n:\n        w, u = heapq.heappop(heap)\n        if u in seen:\n            continue\n        seen.add(u)\n        total += w\n        for v in range(n):\n            if v not in seen:\n                d = abs(points[u][0] - points[v][0]) + abs(points[u][1] - points[v][1])\n                heapq.heappush(heap, (d, v))\n    return total\n` },
    ],
    homework: ["Find an MST by hand for a graph of 5 nodes, using Kruskal's and then Prim's. Compare the totals.", "Draw a graph where the MST path between two nodes is longer than the shortest path.", "Change the Kruskal code so it also returns the chosen edges."],
    reallife: [
      { q: "A telecom firm wants to link cities with the least fibre cable. Which algorithm applies?", a: "A minimum spanning tree, with cities as nodes and cable costs as weights. Kruskal's and Prim's both work." },
      { q: "Why might a company add extra cables beyond the MST anyway?", a: "A tree has no spare routes, so any one failure splits the network. Extra edges cost more but add resilience." },
    ],
    leetcode: [[1584, 'Min Cost to Connect All Points', 'min-cost-to-connect-all-points', 'Medium'], [684, 'Redundant Connection', 'redundant-connection', 'Medium'], [1631, 'Path With Minimum Effort', 'path-with-minimum-effort', 'Medium']],
  });

  after('knapsack', {
    id: 'bitmask-dp', stage: 's9', title: 'Bitmask DP', tagline: 'Use one number to remember a whole set.', mins: 35,
    analogy: "A row of light switches, one for each city. The pattern of on and off tells you exactly where you've been, and it fits in one small number.",
    learn: [
      "Some DP states must remember **which items were used**, not just how many. For small n, a number can store that: bit i is 1 if item i is used. There are only 2ⁿ such sets.",
      "Three moves cover nearly everything. `mask >> i & 1` checks item i. `mask | 1 << i` adds item i. `(1 << n) - 1` is the full set.",
      "The classic example is the **travelling salesman problem**. `dp[mask][last]` is the cheapest way to visit the cities in `mask`, ending at `last`. Trying all orders takes n! steps, while this takes O(2ⁿ × n²).",
      "Look for this when n is small, usually n ≤ 20, and the question involves assigning or visiting each item exactly once.",
    ],
    keys: ["A number can store a set", "`mask >> i & 1` checks, `mask | 1 << i` adds", "Use it when n ≤ 20", "O(2ⁿ × n²) beats n!"],
    anims: ['bitmask-dp'],
    code: [{ title: 'Assign tasks at minimum cost', src: `def assign(cost):
    n = len(cost)
    dp = [float("inf")] * (1 << n)
    dp[0] = 0
    for mask in range(1 << n):
        person = bin(mask).count("1")   # next person to assign
        if person == n:
            continue
        for task in range(n):
            if not mask >> task & 1:
                new = mask | 1 << task
                dp[new] = min(dp[new], dp[mask] + cost[person][task])
    return dp[-1]

print(assign([[9, 2, 7], [6, 4, 3], [5, 8, 1]]))  # 9` }],
    quiz: [
      { q: "Which cities does the mask `0101` represent?", o: ["0 and 2", "1 and 3", "2 only", "0, 1 and 2"], a: 0, why: "Read from the right: bits 0 and 2 are on." },
      { q: "How do you add item 3 to `mask`?", o: ["`mask + 3`", "`mask | 1 << 3`", "`mask & 3`", "`mask >> 3`"], a: 1, why: "`1 << 3` has only bit 3 on, and OR turns it on in the mask." },
      { q: "About how many masks exist when n = 20?", o: ["20", "400", "A million", "A trillion"], a: 2, why: "2²⁰ is roughly 1,000,000, which is manageable. Far above 20 it isn't." },
      { q: "Why is this better than trying every order?", o: ["Orders with the same visited set and last city share one state", "It uses no memory", "It's greedy", "It sorts first"], a: 0, why: "The future only depends on what's visited and where you stand, not on the order you got there." },
    ],
    coding: [
      { id: 'tsp', title: 'Shortest tour', prompt: "`d[i][j]` is the distance between cities. Write `shortest_tour(d)` returning the cheapest route starting at city 0, visiting every city once, and returning to 0. At least 2 cities exist.", starter: `def shortest_tour(d):\n    # your code here\n    pass\n`, tests: [['shortest_tour([[0, 10, 15, 20], [10, 0, 35, 25], [15, 35, 0, 30], [20, 25, 30, 0]])', '80'], ['shortest_tour([[0, 2], [3, 0]])', '5'], ['shortest_tour([[0, 2, 9, 10], [1, 0, 6, 4], [15, 7, 0, 8], [6, 3, 12, 0]])', '21']], hint: "`dp[1][0] = 0`. Finish with `min(dp[full][i] + d[i][0])`.", solution: `def shortest_tour(d):\n    n = len(d)\n    INF = float("inf")\n    dp = [[INF] * n for _ in range(1 << n)]\n    dp[1][0] = 0\n    for mask in range(1 << n):\n        for last in range(n):\n            if dp[mask][last] == INF:\n                continue\n            for nxt in range(n):\n                if mask >> nxt & 1:\n                    continue\n                new = mask | 1 << nxt\n                dp[new][nxt] = min(dp[new][nxt], dp[mask][last] + d[last][nxt])\n    full = (1 << n) - 1\n    return min(dp[full][i] + d[i][0] for i in range(1, n))\n` },
      { id: 'k-part', title: 'Split into equal groups', prompt: "Write `can_split(nums, k)`: can the positive numbers be divided into `k` groups with equal sums?", starter: `def can_split(nums, k):\n    # your code here\n    pass\n`, tests: [['can_split([4, 3, 2, 3, 5, 2, 1], 4)', 'True'], ['can_split([1, 2, 3, 4], 3)', 'False'], ['can_split([2, 2, 2, 2], 2)', 'True'], ['can_split([5], 1)', 'True']], hint: "`dp[mask]` is the amount in the current group after using `mask`, or -1 if unreachable. Add an item only if it fits.", solution: `def can_split(nums, k):\n    total = sum(nums)\n    if total % k:\n        return False\n    goal = total // k\n    if max(nums) > goal:\n        return False\n    n = len(nums)\n    dp = [-1] * (1 << n)\n    dp[0] = 0\n    for mask in range(1 << n):\n        if dp[mask] < 0:\n            continue\n        for i in range(n):\n            if not mask >> i & 1 and dp[mask] + nums[i] <= goal:\n                dp[mask | 1 << i] = (dp[mask] + nums[i]) % goal\n    return dp[-1] == 0\n` },
    ],
    homework: ["Write out all masks for 3 items, and list the items in each.", "Change the tour code to return the route as well as its cost.", "Work out the biggest n you could run in one second, using 10⁸ steps as your budget."],
    reallife: [
      { q: "A delivery driver has 12 stops. Why is bitmask DP realistic here, but not for 200 stops?", a: "2¹² is small enough. 2²⁰⁰ is impossible, so real routing systems with many stops use approximate methods." },
      { q: "A manager assigns 10 tasks to 10 people, each with a different cost. What does the mask stand for?", a: "The tasks already taken. The count of on bits tells you which person goes next." },
    ],
    leetcode: [[526, 'Beautiful Arrangement', 'beautiful-arrangement', 'Medium'], [698, 'Partition to K Equal Sum Subsets', 'partition-to-k-equal-sum-subsets', 'Medium'], [464, 'Can I Win', 'can-i-win', 'Medium']],
  });

  after('segment-trees', {
    id: 'fenwick', stage: 's10', title: 'Fenwick trees', tagline: 'A very short structure for sums with updates.', mins: 25,
    analogy: "A shop's till keeps a few clever subtotals rather than one total for every day. Any total can be built by adding a few of them, and a new sale only changes a few.",
    learn: [
      "A **Fenwick tree**, or binary indexed tree, gives prefix sums and point updates, both in O(log n). It does the job of a sum segment tree in under 15 lines.",
      "The trick is `i & -i`, which isolates the lowest 1 bit of `i`. Slot `i` stores the sum of the `i & -i` numbers ending at position `i`.",
      "To **update**, add to slot `i`, then move up with `i += i & -i`. To get a **prefix sum**, add slot `i`, then move down with `i -= i & -i`. Positions count from 1, which keeps the bit trick working.",
      "A range sum is `prefix(r) - prefix(l - 1)`. Choose a Fenwick tree for sums and counts. Choose a segment tree when you need min, max, or updates to whole ranges.",
    ],
    keys: ["`i & -i` is the lowest set bit", "Update goes up, prefix goes down", "Positions start at 1", "Shorter than a segment tree, but less flexible"],
    cost: [['Point update', 'O(log n)'], ['Prefix sum', 'O(log n)'], ['Range sum', 'O(log n)'], ['Space', 'O(n)']],
    anims: ['fenwick-ops'],
    code: [{ title: 'Counting smaller numbers to the right', src: `class Fenwick:
    def __init__(self, n):
        self.t = [0] * (n + 1)

    def add(self, i, delta):
        while i < len(self.t):
            self.t[i] += delta
            i += i & -i

    def prefix(self, i):
        s = 0
        while i > 0:
            s += self.t[i]
            i -= i & -i
        return s

def smaller_right(nums):       # values from 1 to 100
    f = Fenwick(100)
    out = []
    for x in reversed(nums):
        out.append(f.prefix(x - 1))
        f.add(x, 1)
    return out[::-1]

print(smaller_right([5, 2, 6, 1]))  # [2, 1, 1, 0]` }],
    quiz: [
      { q: "What is `12 & -12`?", o: ["12", "8", "4", "2"], a: 2, why: "12 is `1100`, and its lowest set bit is worth 4." },
      { q: "How does an update move through the slots?", o: ["`i -= i & -i`", "`i += i & -i`", "`i *= 2`", "`i += 1`"], a: 1, why: "It climbs to each larger range that includes this position." },
      { q: "Why do positions start at 1?", o: ["Tradition", "At 0, `i & -i` is 0, so the loop would never move", "To save memory", "Python requires it"], a: 1, why: "Adding 0 to `i` would loop forever." },
      { q: "Which job needs a segment tree instead?", o: ["Point update and range sum", "Prefix sums", "Range minimum with updates", "Counting"], a: 2, why: "A plain Fenwick tree relies on subtraction, which min and max don't have." },
    ],
    coding: [
      { id: 'fw-class', title: 'Build a Fenwick tree', prompt: "Finish `Fenwick` with `add(i, delta)` and `prefix(i)`, where `i` counts from 1 and `prefix(i)` sums positions 1 to i.", starter: `class Fenwick:\n    def __init__(self, n):\n        self.t = [0] * (n + 1)\n\n    def add(self, i, delta):\n        # your code here\n        pass\n\n    def prefix(self, i):\n        # your code here\n        pass\n`, tests: [['(lambda f: (f.add(1, 3), f.add(3, 5), f.prefix(1), f.prefix(2), f.prefix(3)))(Fenwick(4))[2:]', '(3, 3, 8)'], ['Fenwick(5).prefix(5)', '0'], ['(lambda f: (f.add(8, 2), f.add(1, 1), f.prefix(8)))(Fenwick(8))[2]', '3']], hint: "Update moves with `i += i & -i`. Prefix moves with `i -= i & -i`.", solution: `class Fenwick:\n    def __init__(self, n):\n        self.t = [0] * (n + 1)\n\n    def add(self, i, delta):\n        while i < len(self.t):\n            self.t[i] += delta\n            i += i & -i\n\n    def prefix(self, i):\n        s = 0\n        while i > 0:\n            s += self.t[i]\n            i -= i & -i\n        return s\n` },
      { id: 'fw-inv', title: 'Count inversions', prompt: "An inversion is a pair `i < j` with `nums[i] > nums[j]`. Write `inversions(nums)` for values between 1 and 1000. Aim for O(n log n).", starter: `def inversions(nums):\n    # your code here\n    pass\n`, tests: [['inversions([2, 4, 1, 3, 5])', '3'], ['inversions([5, 4, 3, 2, 1])', '10'], ['inversions([1, 2, 3])', '0'], ['inversions([])', '0'], ['inversions([3, 3])', '0']], hint: "Walk from the right. For each value, count the smaller values already seen, then add this one.", solution: `def inversions(nums):\n    t = [0] * 1001\n    total = 0\n    for x in reversed(nums):\n        i = x - 1\n        while i > 0:\n            total += t[i]\n            i -= i & -i\n        i = x\n        while i < len(t):\n            t[i] += 1\n            i += i & -i\n    return total\n` },
    ],
    homework: ["Write out `i & -i` in binary for i from 1 to 8.", "Trace `add(3, 5)` and `prefix(7)` by hand for n = 8, and check using the animation.", "Implement range sum queries with `prefix(r) - prefix(l - 1)`."],
    reallife: [
      { q: "A game keeps a live leaderboard of scores from 0 to 1000. How do you find a player's rank quickly?", a: "Keep a Fenwick tree of how many players have each score. A prefix sum counts those below a score, and updates are O(log n)." },
      { q: "When is a Fenwick tree a poor choice for live sales totals?", a: "When you need the lowest sale in a range, or an update to a whole range. Those fit a segment tree better." },
    ],
    leetcode: [[307, 'Range Sum Query - Mutable', 'range-sum-query-mutable', 'Medium'], [1395, 'Count Number of Teams', 'count-number-of-teams', 'Medium'], [1409, 'Queries on a Permutation With Key', 'queries-on-a-permutation-with-key', 'Medium']],
  });
})();
