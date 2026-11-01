/* Curriculum part 3: trees, heaps, graphs, strategies, advanced structures */
const TREE_SETUP = `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(values):
    if not values:
        return None
    nodes = [TreeNode(v) if v is not None else None for v in values]
    kids = nodes[::-1]
    root = kids.pop()
    for node in nodes:
        if node:
            if kids:
                node.left = kids.pop()
            if kids:
                node.right = kids.pop()
    return root
`;

T({
  id: 'binary-trees', stage: 's7', title: 'Binary trees', tagline: 'Nodes with up to two children, and four ways to visit them.', mins: 30,
  analogy: "A family tree drawn upside down. The root is at the top. Every person has at most two children, and the people with no children are called leaves.",
  learn: [
    "A binary tree node has a value, a `left` child and a `right` child. Terms to know: **root** (top), **leaf** (no children), **depth** (distance from the root), and **height** (longest path down).",
    "Trees are recursive by nature: each child is itself the root of a smaller tree. Most solutions are short: handle `None`, ask both children, and combine their answers.",
    "**Depth-first** traversals go deep first. **Pre-order** visits the node, then left, then right. **In-order** visits left, then the node, then right. **Post-order** visits both children first. Use post-order when a parent needs the children's answers.",
    "**Level-order** (breadth-first) uses a queue to visit row by row. Use it when a question talks about levels or the shortest distance from the root.",
  ],
  keys: ["Trees are recursive", "`if not node: return` is the usual base case", "Post-order when parents need children", "Queue for level-order"],
  anims: ['tree-traversals'],
  code: [{ title: 'Height in three lines', src: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def height(node):
    if not node:
        return 0
    return 1 + max(height(node.left), height(node.right))

root = TreeNode(1, TreeNode(2, TreeNode(4)), TreeNode(3))
print(height(root))  # 3` }],
  quiz: [
    { q: "Which traversal visits left, node, right?", o: ["Pre-order", "In-order", "Post-order", "Level-order"], a: 1, why: "In-order means the node goes in between its children." },
    { q: "Which data structure does level-order use?", o: ["Stack", "Queue", "Heap", "Set"], a: 1, why: "A queue keeps nodes in the order they were discovered, row by row." },
    { q: "What's the time to visit every node?", o: ["O(log n)", "O(n)", "O(n log n)", "O(n²)"], a: 1, why: "Each node is visited once." },
    { q: "To compute a subtree's size from its children's sizes, use:", o: ["Pre-order", "Post-order", "Level-order", "Any random order"], a: 1, why: "Post-order finishes children first, so their results are ready." },
  ],
  coding: [
    { id: 'tree-depth', title: 'Maximum depth', prompt: "Write `max_depth(root)`. `TreeNode` and `build_tree([...])` already exist. Lists are level-order with `None` for gaps.", setup: TREE_SETUP, starter: `def max_depth(root):\n    # your code here\n    pass\n`, tests: [['max_depth(build_tree([3, 9, 20, None, None, 15, 7]))', '3'], ['max_depth(build_tree([]))', '0'], ['max_depth(build_tree([1, None, 2]))', '2']], hint: "An empty tree has depth 0. Otherwise 1 + the larger child's depth.", solution: `def max_depth(root):\n    if not root:\n        return 0\n    return 1 + max(max_depth(root.left), max_depth(root.right))\n` },
    { id: 'tree-inorder', title: 'In-order traversal', prompt: "Write `inorder(root)` returning the values as a list.", setup: TREE_SETUP, starter: `def inorder(root):\n    # your code here\n    pass\n`, tests: [['inorder(build_tree([1, None, 2, 3]))', '[1, 3, 2]'], ['inorder(build_tree([]))', '[]'], ['inorder(build_tree([2, 1, 3]))', '[1, 2, 3]']], hint: "Left list + [val] + right list.", solution: `def inorder(root):\n    if not root:\n        return []\n    return inorder(root.left) + [root.val] + inorder(root.right)\n` },
    { id: 'tree-levels', title: 'Level order', prompt: "Write `levels(root)` returning a list of rows, each row a list of values.", setup: TREE_SETUP, starter: `from collections import deque\n\ndef levels(root):\n    # your code here\n    pass\n`, tests: [['levels(build_tree([3, 9, 20, None, None, 15, 7]))', '[[3], [9, 20], [15, 7]]'], ['levels(None)', '[]'], ['levels(build_tree([1]))', '[[1]]']], hint: "Use `len(q)` at the start of each round: that's how many nodes the row has.", solution: `from collections import deque\n\ndef levels(root):\n    if not root:\n        return []\n    out, q = [], deque([root])\n    while q:\n        row = []\n        for _ in range(len(q)):\n            n = q.popleft()\n            row.append(n.val)\n            if n.left:\n                q.append(n.left)\n            if n.right:\n                q.append(n.right)\n        out.append(row)\n    return out\n` },
  ],
  homework: ["Write all three depth-first traversals from memory.", "Check whether two trees are identical.", "Write a function that inverts a tree, swapping left and right at every node."],
  reallife: [
    { q: "Computing the total size of folders: which traversal fits, and why?", a: "Post-order. A folder's total needs its children's totals first." },
    { q: "A company org chart is printed one management level per row. Which traversal?", a: "Level-order, using a queue." },
  ],
  leetcode: [[104, 'Maximum Depth of Binary Tree', 'maximum-depth-of-binary-tree', 'Easy'], [226, 'Invert Binary Tree', 'invert-binary-tree', 'Easy'], [94, 'Binary Tree Inorder Traversal', 'binary-tree-inorder-traversal', 'Easy'], [102, 'Binary Tree Level Order Traversal', 'binary-tree-level-order-traversal', 'Medium'], [236, 'Lowest Common Ancestor of a Binary Tree', 'lowest-common-ancestor-of-a-binary-tree', 'Medium']],
});

T({
  id: 'bst', stage: 's7', title: 'Binary search trees', tagline: 'A tree that stays sorted.', mins: 30,
  analogy: "A guessing game built into a structure. At each person in the tree, you ask: is my number smaller or larger? Go left or right, and half your options disappear.",
  learn: [
    "A **binary search tree** has one rule: everything in a node's left subtree is smaller, and everything in its right subtree is larger. That applies to whole subtrees, not just the direct children.",
    "Search, insert and delete walk down one path. If the tree is balanced, that's O(log n). If you insert sorted values, the tree becomes a long chain and those operations become O(n).",
    "Self-balancing trees like AVL and red-black keep the height near log n. Python has no built-in one, but you should know why they exist.",
    "In-order traversal of a BST gives sorted values. That single fact solves many problems: validating a BST, or finding the k-th smallest.",
    "To delete a node with two children, copy in its **in-order successor**, the smallest value in the right subtree, and delete that successor instead.",
  ],
  keys: ["Left smaller, right larger", "O(h): log n if balanced, n if not", "In-order is sorted", "Delete with two children uses the successor"],
  cost: [['Search, insert, delete (balanced)', 'O(log n)'], ['Search, insert, delete (worst)', 'O(n)'], ['In-order traversal', 'O(n)']],
  anims: ['bst-ops', 'bst-delete'],
  code: [{ title: 'Validate a BST by passing limits', src: `def is_bst(node, low=float("-inf"), high=float("inf")):
    if not node:
        return True
    if not (low < node.val < high):
        return False
    return (is_bst(node.left, low, node.val)
            and is_bst(node.right, node.val, high))` }],
  quiz: [
    { q: "Inserting 1, 2, 3, 4, 5 in order makes what shape?", o: ["Balanced", "A long chain to the right", "A long chain to the left", "A full tree"], a: 1, why: "Each value is larger, so it always goes right. Operations are then O(n)." },
    { q: "Which traversal gives sorted output?", o: ["Pre-order", "In-order", "Post-order", "Level-order"], a: 1, why: "All smaller values are visited, then the node, then larger values." },
    { q: "Where's the smallest value in a BST?", o: ["The root", "Go left until you can't", "Go right until you can't", "Any leaf"], a: 1, why: "Smaller values are always to the left." },
    { q: "Is checking only direct children enough to validate a BST?", o: ["Yes", "No, the rule applies to whole subtrees", "Only for small trees", "Only for even values"], a: 1, why: "A deep node might satisfy its parent yet break an ancestor's limit." },
  ],
  coding: [
    { id: 'bst-search', title: 'Search a BST', prompt: "Write `bst_has(root, val)` returning True or False. Use the BST property so you only walk one path.", setup: TREE_SETUP, starter: `def bst_has(root, val):\n    # your code here\n    pass\n`, tests: [['bst_has(build_tree([4, 2, 7, 1, 3]), 2)', 'True'], ['bst_has(build_tree([4, 2, 7, 1, 3]), 5)', 'False'], ['bst_has(None, 1)', 'False']], hint: "`node = node.left if val < node.val else node.right`", solution: `def bst_has(root, val):\n    node = root\n    while node:\n        if node.val == val:\n            return True\n        node = node.left if val < node.val else node.right\n    return False\n` },
    { id: 'bst-valid', title: 'Validate a BST', prompt: "Write `is_bst(root)`. Remember, the rule applies to whole subtrees.", setup: TREE_SETUP, starter: `def is_bst(root):\n    # your code here\n    pass\n`, tests: [['is_bst(build_tree([2, 1, 3]))', 'True'], ['is_bst(build_tree([5, 1, 4, None, None, 3, 6]))', 'False'], ['is_bst(None)', 'True'], ['is_bst(build_tree([5, 4, 6, None, None, 3, 7]))', 'False']], hint: "Pass allowed `low` and `high` limits down, or check that the in-order traversal is strictly increasing.", solution: `def is_bst(root, low=float("-inf"), high=float("inf")):\n    if not root:\n        return True\n    if not (low < root.val < high):\n        return False\n    return is_bst(root.left, low, root.val) and is_bst(root.right, root.val, high)\n` },
  ],
  homework: ["Insert the same values in two different orders in the animation, and compare the shapes.", "Find the k-th smallest value in a BST using an in-order walk.", "Try deleting a leaf, a one-child node, and a two-child node in the delete animation."],
  reallife: [
    { q: "Why do databases prefer tree indexes rather than hash tables for date-range queries?", a: "Trees keep values in order, so you can find a start point and walk along. A hash table scatters keys and can't do ranges." },
    { q: "An autocomplete for sorted names needs the next name after 'Meera'. Why does a BST help?", a: "Walking the tree finds the in-order successor in O(h), without scanning all names." },
  ],
  leetcode: [[700, 'Search in a Binary Search Tree', 'search-in-a-binary-search-tree', 'Easy'], [235, 'Lowest Common Ancestor of a Binary Search Tree', 'lowest-common-ancestor-of-a-binary-search-tree', 'Medium'], [98, 'Validate Binary Search Tree', 'validate-binary-search-tree', 'Medium'], [230, 'Kth Smallest Element in a BST', 'kth-smallest-element-in-a-bst', 'Medium'], [450, 'Delete Node in a BST', 'delete-node-in-a-bst', 'Medium']],
});

T({
  id: 'heaps', stage: 's7', title: 'Heaps and priority queues', tagline: 'Always know the smallest item.', mins: 30,
  analogy: "A hospital emergency room. Patients aren't treated in the order they arrive. Whoever is most urgent goes next, and new arrivals are placed by urgency.",
  learn: [
    "A **min-heap** gives you the smallest item in O(1), and lets you add or remove in O(log n). It's perfect when you repeatedly need the current smallest or largest.",
    "The only rule: each parent is less than or equal to its children. It's not fully sorted. It's stored in a plain list, where the children of `i` are at `2i + 1` and `2i + 2`.",
    "**Push** adds to the end and bubbles up. **Pop** moves the last item to the top and lets it sink. Building a heap from a list using `heapify` is O(n).",
    "Python's `heapq` provides a min-heap. For a max-heap, push negative numbers. You can push tuples, as they compare by their first item.",
    "**Top k pattern**: keep a min-heap of size k. Anything smaller than the top can't be in the top k, so this takes O(n log k).",
  ],
  keys: ["Parent ≤ children, not fully sorted", "Peek O(1), push and pop O(log n)", "Negate values for a max-heap", "Top k with a heap of size k"],
  cost: [['Peek smallest', 'O(1)'], ['Push, pop', 'O(log n)'], ['heapify a list', 'O(n)'], ['Search for any value', 'O(n)']],
  anims: ['heap-ops'],
  code: [{ title: 'Top k largest with a small heap', src: `import heapq

def top_k(nums, k):
    h = []
    for x in nums:
        heapq.heappush(h, x)
        if len(h) > k:
            heapq.heappop(h)   # drop the smallest
    return sorted(h, reverse=True)

print(top_k([5, 1, 9, 3, 7], 2))        # [9, 7]
print(heapq.nlargest(2, [5, 1, 9]))     # [9, 5]

tasks = []
heapq.heappush(tasks, (2, "write"))
heapq.heappush(tasks, (1, "plan"))
print(heapq.heappop(tasks))             # (1, 'plan')` }],
  quiz: [
    { q: "Where is the smallest value in a min-heap?", o: ["Index 0", "The last index", "Anywhere", "The middle"], a: 0, why: "The root is the first list item." },
    { q: "What's the left child of index 3?", o: ["4", "6", "7", "8"], a: 2, why: "2 × 3 + 1 = 7." },
    { q: "How do you make a max-heap with `heapq`?", o: ["`heapq.max=True`", "Push negated values", "Sort it first", "It isn't possible"], a: 1, why: "The smallest negated value is the largest original." },
    { q: "Is a heap fully sorted?", o: ["Yes", "No, only parents vs children are ordered", "Only after pop", "Only with integers"], a: 1, why: "Siblings can be in any order, which is what makes it cheap to maintain." },
  ],
  coding: [
    { id: 'kth-heap', title: 'K-th largest with a heap', prompt: "Write `kth_largest(nums, k)` using a min-heap kept at size k.", starter: `import heapq\n\ndef kth_largest(nums, k):\n    # your code here\n    pass\n`, tests: [['kth_largest([3, 2, 1, 5, 6, 4], 2)', '5'], ['kth_largest([1], 1)', '1'], ['kth_largest([7, 7, 7], 2)', '7']], hint: "After handling all numbers, the heap's top `h[0]` is the answer.", solution: `import heapq\n\ndef kth_largest(nums, k):\n    h = []\n    for x in nums:\n        heapq.heappush(h, x)\n        if len(h) > k:\n            heapq.heappop(h)\n    return h[0]\n` },
    { id: 'stones', title: 'Last stone weight', prompt: "Each round, smash the two heaviest stones. If equal both vanish, otherwise the difference remains. Write `last_stone(stones)` returning what's left, or 0.", starter: `import heapq\n\ndef last_stone(stones):\n    # your code here\n    pass\n`, tests: [['last_stone([2, 7, 4, 1, 8, 1])', '1'], ['last_stone([1])', '1'], ['last_stone([3, 3])', '0']], hint: "Use a max-heap by negating.", solution: `import heapq\n\ndef last_stone(stones):\n    h = [-s for s in stones]\n    heapq.heapify(h)\n    while len(h) > 1:\n        a = -heapq.heappop(h)\n        b = -heapq.heappop(h)\n        if a != b:\n            heapq.heappush(h, -(a - b))\n    return -h[0] if h else 0\n` },
  ],
  homework: ["Write a min-heap yourself with `push` and `pop`, without `heapq`.", "Merge k sorted lists using a heap of (value, list index).", "Find the median of a growing list with two heaps. Why does it work?"],
  reallife: [
    { q: "A ride-sharing app keeps assigning the nearest driver as drivers move around. Why a heap rather than sorting all drivers each time?", a: "A heap gets the nearest in O(1), with updates in O(log n). Re-sorting every time costs O(n log n)." },
    { q: "How does an operating system decide which process runs next?", a: "It often uses a priority queue, so the most important ready task is always available right away." },
  ],
  leetcode: [[1046, 'Last Stone Weight', 'last-stone-weight', 'Easy'], [703, 'Kth Largest Element in a Stream', 'kth-largest-element-in-a-stream', 'Easy'], [215, 'Kth Largest Element in an Array', 'kth-largest-element-in-an-array', 'Medium'], [973, 'K Closest Points to Origin', 'k-closest-points-to-origin', 'Medium'], [621, 'Task Scheduler', 'task-scheduler', 'Medium']],
});

T({
  id: 'graphs-bfs', stage: 's8', title: 'Graphs and BFS', tagline: 'Nodes, connections, and exploring in rings.', mins: 35,
  analogy: "Drop a stone in a pond and ripples spread out evenly: first everything 1 step away, then 2 steps, then 3. That's breadth-first search.",
  learn: [
    "A **graph** is a set of nodes (vertices) joined by edges. Edges can be directed or undirected, and weighted or unweighted. Maps, social networks and the web are all graphs.",
    "The usual way to store one is an **adjacency list**, a dict from each node to its neighbours. It takes O(V + E) space, where V is nodes and E is edges.",
    "**BFS** uses a queue and a `seen` set. Start with one node. Repeatedly take from the front and add its unseen neighbours to the back. Mark nodes as seen **when you add them**, or they might be added twice.",
    "In an unweighted graph, BFS finds the **fewest hops** from the start to every node. The time is O(V + E).",
    "Multi-source BFS starts with several nodes in the queue, as in Rotting Oranges, where every rotten orange spreads at once.",
  ],
  keys: ["Adjacency list: dict of neighbours", "Queue + seen set", "Mark seen when adding", "Fewest hops in unweighted graphs"],
  anims: ['graph-repr', 'graph-bfs'],
  code: [{ title: 'Shortest hops on a grid', src: `from collections import deque

def shortest(grid, start, goal):
    rows, cols = len(grid), len(grid[0])
    q = deque([(start[0], start[1], 0)])
    seen = {start}
    while q:
        r, c, d = q.popleft()
        if (r, c) == goal:
            return d
        for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
            nr, nc = r + dr, c + dc
            if (0 <= nr < rows and 0 <= nc < cols
                    and grid[nr][nc] == 0 and (nr, nc) not in seen):
                seen.add((nr, nc))
                q.append((nr, nc, d + 1))
    return -1

print(shortest([[0, 0], [1, 0]], (0, 0), (1, 1)))  # 2` }],
  quiz: [
    { q: "Which structure drives BFS?", o: ["Stack", "Queue", "Heap", "Tree"], a: 1, why: "A queue processes nodes in the order they were discovered." },
    { q: "BFS finds the shortest path when:", o: ["Edges are unweighted", "Edges have weights", "There are no cycles", "Always"], a: 0, why: "With weights, fewest hops isn't necessarily cheapest. Use Dijkstra then." },
    { q: "What's the time for BFS with an adjacency list?", o: ["O(V)", "O(E)", "O(V + E)", "O(V × E)"], a: 2, why: "Each node is taken once, and each edge is looked at a constant number of times." },
    { q: "Why mark nodes as seen when adding, not when removing?", o: ["Style only", "To prevent duplicates in the queue", "It's slower otherwise, nothing more", "Python requires it"], a: 1, why: "Otherwise a node could be queued many times, wasting time and memory." },
  ],
  coding: [
    { id: 'build-adj', title: 'Build an adjacency list', prompt: "Write `build_graph(edges)` returning a dict from each node to a sorted list of neighbours, for undirected edges.", starter: `def build_graph(edges):\n    # your code here\n    pass\n`, tests: [['build_graph([[1, 2], [2, 3]])', '{1: [2], 2: [1, 3], 3: [2]}'], ['build_graph([])', '{}']], hint: "`graph.setdefault(a, []).append(b)` both ways, then sort each list.", solution: `def build_graph(edges):\n    graph = {}\n    for a, b in edges:\n        graph.setdefault(a, []).append(b)\n        graph.setdefault(b, []).append(a)\n    for k in graph:\n        graph[k].sort()\n    return graph\n` },
    { id: 'bfs-dist', title: 'Fewest hops', prompt: "Write `hops(graph, start, goal)` returning the fewest edges from start to goal, or -1. `graph` is an adjacency dict.", starter: `from collections import deque\n\ndef hops(graph, start, goal):\n    # your code here\n    pass\n`, tests: [['hops({"a": ["b", "c"], "b": ["a", "d"], "c": ["a"], "d": ["b"]}, "a", "d")', '2'], ['hops({"a": ["b"], "b": ["a"], "c": []}, "a", "c")', '-1'], ['hops({"a": []}, "a", "a")', '0']], hint: "Store distance in a dict. It doubles as the seen set.", solution: `from collections import deque\n\ndef hops(graph, start, goal):\n    dist = {start: 0}\n    q = deque([start])\n    while q:\n        u = q.popleft()\n        if u == goal:\n            return dist[u]\n        for v in graph[u]:\n            if v not in dist:\n                dist[v] = dist[u] + 1\n                q.append(v)\n    return -1\n` },
  ],
  homework: ["Draw a small graph of your friends and write its adjacency list.", "Print the BFS order by hand from two different starts, then check with the animation.", "Solve Rotting Oranges with multi-source BFS."],
  reallife: [
    { q: "LinkedIn shows 2nd-degree connections. How?", a: "BFS from your profile: distance 1 is your connections, distance 2 is theirs." },
    { q: "How does a phone game find the fewest moves through a maze?", a: "Treat cells as nodes and moves as edges, then run BFS from the start." },
  ],
  leetcode: [[1971, 'Find if Path Exists in Graph', 'find-if-path-exists-in-graph', 'Easy'], [733, 'Flood Fill', 'flood-fill', 'Easy'], [994, 'Rotting Oranges', 'rotting-oranges', 'Medium'], [542, '01 Matrix', '01-matrix', 'Medium'], [1091, 'Shortest Path in Binary Matrix', 'shortest-path-in-binary-matrix', 'Medium']],
});

T({
  id: 'dfs', stage: 's8', title: 'DFS and grid problems', tagline: 'Go as deep as you can, then back up.', mins: 30,
  analogy: "Exploring a maze with one rule: keep walking until you hit a dead end, then return to the last junction and try another path.",
  learn: [
    "**DFS** follows one path as far as it can, then backtracks. Recursion makes it very short. A `seen` set stops you going in circles. Time is O(V + E).",
    "It's used to explore everything reachable, count connected components, and detect cycles.",
    "A grid is a graph in disguise. Each cell is a node with up to four neighbours. Counting islands means: scan all cells, and when you find unseen land, count one and flood it with DFS.",
    "**Cycle detection** in a directed graph uses three colours. White means untouched, grey means on the current path, black means finished. Reaching a grey node means a cycle.",
    "Very deep recursion can overflow in Python, so large grids may need an explicit stack or `sys.setrecursionlimit`.",
  ],
  keys: ["Recursion + seen set", "Grids are graphs", "Flood fill counts components", "Grey node reached = cycle"],
  anims: ['graph-dfs', 'grid-islands'],
  code: [{ title: 'Connected components', src: `def components(n, edges):
    graph = [[] for _ in range(n)]
    for a, b in edges:
        graph[a].append(b)
        graph[b].append(a)

    seen = set()
    def dfs(u):
        seen.add(u)
        for v in graph[u]:
            if v not in seen:
                dfs(v)

    count = 0
    for u in range(n):
        if u not in seen:
            count += 1
            dfs(u)
    return count

print(components(5, [[0, 1], [1, 2], [3, 4]]))  # 2` }],
  quiz: [
    { q: "What does DFS naturally use?", o: ["A queue", "A stack, often via recursion", "A heap", "A hash only"], a: 1, why: "Recursion uses the call stack, so the most recent node continues first." },
    { q: "Which finds the fewest hops in an unweighted graph?", o: ["DFS", "BFS", "Both always", "Neither"], a: 1, why: "DFS may find a long path first. BFS visits in order of distance." },
    { q: "In a grid with r rows and c columns, flood-filling everything takes:", o: ["O(r + c)", "O(r × c)", "O(r² c²)", "O(log r)"], a: 1, why: "Each cell is visited a limited number of times." },
    { q: "In colour-based cycle detection, a cycle exists when you reach:", o: ["A white node", "A grey node", "A black node", "A leaf"], a: 1, why: "Grey means it's on your current path, so you've looped back." },
  ],
  coding: [
    { id: 'islands', title: 'Number of islands', prompt: "`grid` is a list of lists of `\"1\"` and `\"0\"`. Write `islands(grid)` to count connected groups of 1s (up, down, left, right).", starter: `def islands(grid):\n    # your code here\n    pass\n`, tests: [['islands([["1","1","0"],["1","0","0"],["0","0","1"]])', '2'], ['islands([["0"]])', '0'], ['islands([["1","0","1","0","1"]])', '3'], ['islands([])', '0']], hint: "When you find a `\"1\"`, count it and flood, overwriting cells with `\"0\"`.", solution: `def islands(grid):\n    if not grid:\n        return 0\n    rows, cols = len(grid), len(grid[0])\n    def flood(r, c):\n        if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] != "1":\n            return\n        grid[r][c] = "0"\n        flood(r + 1, c)\n        flood(r - 1, c)\n        flood(r, c + 1)\n        flood(r, c - 1)\n    count = 0\n    for r in range(rows):\n        for c in range(cols):\n            if grid[r][c] == "1":\n                count += 1\n                flood(r, c)\n    return count\n` },
    { id: 'reach', title: 'Can you reach it?', prompt: "Write `reachable(graph, start, goal)` with DFS. Return True if goal can be reached. `graph` is an adjacency dict.", starter: `def reachable(graph, start, goal):\n    # your code here\n    pass\n`, tests: [['reachable({"a": ["b"], "b": ["c"], "c": []}, "a", "c")', 'True'], ['reachable({"a": ["b"], "b": [], "c": ["a"]}, "a", "c")', 'False'], ['reachable({"a": ["a"]}, "a", "a")', 'True']], hint: "Without a `seen` set a cycle would make this run forever.", solution: `def reachable(graph, start, goal):\n    seen = set()\n    def dfs(u):\n        if u == goal:\n            return True\n        seen.add(u)\n        return any(dfs(v) for v in graph[u] if v not in seen)\n    return dfs(start)\n` },
  ],
  homework: ["Rewrite the recursive DFS using an explicit stack.", "Add island area: find the largest island's size.", "Write directed cycle detection with the three colours."],
  reallife: [
    { q: "A paint program's bucket tool fills a region. What algorithm is that?", a: "Flood fill, which is DFS or BFS across connected pixels of the same colour." },
    { q: "How can a build tool detect a circular dependency between packages?", a: "DFS with colours. Reaching a package still in progress means there's a cycle." },
  ],
  leetcode: [[733, 'Flood Fill', 'flood-fill', 'Easy'], [200, 'Number of Islands', 'number-of-islands', 'Medium'], [695, 'Max Area of Island', 'max-area-of-island', 'Medium'], [133, 'Clone Graph', 'clone-graph', 'Medium'], [130, 'Surrounded Regions', 'surrounded-regions', 'Medium']],
});

T({
  id: 'topo-sort', stage: 's8', title: 'Topological sort', tagline: 'Ordering tasks that depend on each other.', mins: 25,
  analogy: "Getting dressed. Socks come before shoes, and shirt before tie. Many orders may be valid, but shoes can't come before socks.",
  learn: [
    "A **directed acyclic graph** (DAG) has one-way edges and no loops. An edge from A to B means A must come before B. A **topological order** lists all nodes so every edge points forward.",
    "**Kahn's algorithm**: count each node's incoming edges, called its in-degree. Nodes with zero are ready. Take one, add it to the result, and reduce its neighbours' counts. Any neighbour reaching zero becomes ready.",
    "If some nodes never reach zero, they're stuck in a cycle, so no valid order exists. That means the same algorithm also detects cycles.",
    "Time is O(V + E). There can be several valid orders, and tests usually accept any of them.",
  ],
  keys: ["Works only on DAGs", "In-degree 0 means ready", "Output shorter than V means a cycle", "O(V + E)"],
  anims: ['topo-kahn'],
  code: [{ title: 'Can you finish all courses?', src: `from collections import deque

def can_finish(n, prereqs):
    graph = [[] for _ in range(n)]
    need = [0] * n
    for course, pre in prereqs:
        graph[pre].append(course)
        need[course] += 1
    q = deque(i for i in range(n) if need[i] == 0)
    done = 0
    while q:
        u = q.popleft()
        done += 1
        for v in graph[u]:
            need[v] -= 1
            if need[v] == 0:
                q.append(v)
    return done == n

print(can_finish(2, [[1, 0]]))           # True
print(can_finish(2, [[1, 0], [0, 1]]))   # False` }],
  quiz: [
    { q: "A topological order exists only when the graph:", o: ["Is undirected", "Has no directed cycles", "Is a tree", "Is connected"], a: 1, why: "A cycle means each item must come before itself." },
    { q: "What does in-degree mean?", o: ["Outgoing edges", "Incoming edges", "Distance", "Weight"], a: 1, why: "It's how many things a node still depends on." },
    { q: "How do you detect a cycle with Kahn's algorithm?", o: ["Output is shorter than the node count", "The queue never empties", "In-degrees go negative", "You can't"], a: 0, why: "Nodes in a cycle never reach zero, so they're missing from the output." },
    { q: "Is the topological order unique?", o: ["Always", "Not necessarily", "Only in trees", "Never"], a: 1, why: "If several tasks are ready at once, any of them can go next." },
  ],
  coding: [
    { id: 'course-ok', title: 'Course schedule', prompt: "Write `can_finish(n, prereqs)`. Each pair `[a, b]` means take `b` before `a`. Return True if all `n` courses can be completed.", starter: `from collections import deque\n\ndef can_finish(n, prereqs):\n    # your code here\n    pass\n`, tests: [['can_finish(2, [[1, 0]])', 'True'], ['can_finish(2, [[1, 0], [0, 1]])', 'False'], ['can_finish(3, [])', 'True'], ['can_finish(4, [[1, 0], [2, 1], [3, 2], [1, 3]])', 'False']], hint: "Count how many nodes you process, and compare to n.", solution: `from collections import deque\n\ndef can_finish(n, prereqs):\n    graph = [[] for _ in range(n)]\n    need = [0] * n\n    for a, b in prereqs:\n        graph[b].append(a)\n        need[a] += 1\n    q = deque(i for i in range(n) if need[i] == 0)\n    done = 0\n    while q:\n        u = q.popleft()\n        done += 1\n        for v in graph[u]:\n            need[v] -= 1\n            if need[v] == 0:\n                q.append(v)\n    return done == n\n` },
    { id: 'course-order', title: 'Course order', prompt: "Write `order(n, prereqs)` returning a valid order as a list, or `[]` if impossible. The tests check validity using a helper, so any valid order passes.", setup: `def _ok(n, prereqs, out):
    if sorted(out) != list(range(n)):
        return False
    pos = {c: i for i, c in enumerate(out)}
    return all(pos[b] < pos[a] for a, b in prereqs)
`, starter: `from collections import deque\n\ndef order(n, prereqs):\n    # your code here\n    pass\n`, tests: [['_ok(2, [[1, 0]], order(2, [[1, 0]]))', 'True'], ['_ok(4, [[1, 0], [2, 0], [3, 1], [3, 2]], order(4, [[1, 0], [2, 0], [3, 1], [3, 2]]))', 'True'], ['order(2, [[0, 1], [1, 0]])', '[]']], hint: "Same as before, but append each processed node to a list.", solution: `from collections import deque\n\ndef order(n, prereqs):\n    graph = [[] for _ in range(n)]\n    need = [0] * n\n    for a, b in prereqs:\n        graph[b].append(a)\n        need[a] += 1\n    q = deque(i for i in range(n) if need[i] == 0)\n    out = []\n    while q:\n        u = q.popleft()\n        out.append(u)\n        for v in graph[u]:\n            need[v] -= 1\n            if need[v] == 0:\n                q.append(v)\n    return out if len(out) == n else []\n` },
  ],
  homework: ["Write down your morning routine as a dependency graph, then topologically sort it by hand.", "Write the DFS version: add each node after finishing its neighbours, then reverse the list.", "Find all valid orders for a graph of 4 nodes and 3 edges."],
  reallife: [
    { q: "How does `pip` or `npm` decide install order?", a: "It builds a dependency graph and does a topological sort, so each package is installed after what it needs." },
    { q: "A spreadsheet recalculates cells. How does it find the order, and what about circular references?", a: "Cells form a graph of dependencies. It uses a topological order to calculate, and a cycle produces a circular-reference error." },
  ],
  leetcode: [[207, 'Course Schedule', 'course-schedule', 'Medium'], [210, 'Course Schedule II', 'course-schedule-ii', 'Medium'], [1462, 'Course Schedule IV', 'course-schedule-iv', 'Medium'], [802, 'Find Eventual Safe States', 'find-eventual-safe-states', 'Medium']],
});

T({
  id: 'shortest-paths', stage: 's8', title: "Dijkstra's shortest paths", tagline: 'The cheapest route when edges have different costs.', mins: 30,
  analogy: "Water flowing through pipes of different lengths from a source. It reaches the nearest junction first. Once there, that time is final, as no other route can arrive sooner.",
  learn: [
    "When edges have weights, the fewest hops may not be the cheapest. **Dijkstra's algorithm** finds the cheapest distance from one start to all nodes.",
    "Keep a min-heap of `(distance, node)`. Pop the closest node. Its distance is now final, because every other route already costs at least that much. For each neighbour, if going through this node is cheaper, update it and push.",
    "A popped entry can be out of date, since a node might be pushed more than once. Skip it if `d > dist[u]`. This is called lazy deletion.",
    "Time is O((V + E) log V). All weights must be **non-negative**, because a negative edge would break the idea that a popped distance is final. For negative edges use Bellman-Ford, which is O(V × E).",
  ],
  keys: ["Min-heap of (distance, node)", "Popped once = final", "Skip stale entries", "No negative weights"],
  anims: ['dijkstra'],
  code: [{ title: 'Network delay time', src: `import heapq

def delay(times, n, k):
    graph = {i: [] for i in range(1, n + 1)}
    for u, v, w in times:
        graph[u].append((v, w))
    dist = {k: 0}
    heap = [(0, k)]
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue
        for v, w in graph[u]:
            if d + w < dist.get(v, float("inf")):
                dist[v] = d + w
                heapq.heappush(heap, (d + w, v))
    return max(dist.values()) if len(dist) == n else -1

print(delay([[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2))  # 2` }],
  quiz: [
    { q: "Dijkstra's breaks with:", o: ["Cycles", "Negative edge weights", "Directed edges", "Large graphs"], a: 1, why: "A later negative edge could improve a distance already marked final." },
    { q: "Which structure picks the next node?", o: ["Queue", "Stack", "Min-heap", "Set"], a: 2, why: "A min-heap gives the smallest known distance quickly." },
    { q: "Why skip when `d > dist[u]`?", o: ["It's stale, as a better route was already found", "Negative weight", "It's the start", "It saves memory"], a: 0, why: "Old heap entries remain after updates, so ignore them." },
    { q: "If all edges cost 1, which simpler algorithm also works?", o: ["BFS", "DFS", "Merge sort", "Union-Find"], a: 0, why: "With equal weights, fewest hops is also cheapest." },
  ],
  coding: [
    { id: 'dijk', title: 'Shortest distances', prompt: "Write `shortest(graph, start)` returning a dict of cheapest distances to all reachable nodes. `graph` maps a node to a list of `(neighbour, weight)`.", starter: `import heapq\n\ndef shortest(graph, start):\n    # your code here\n    pass\n`, tests: [['shortest({"a": [("b", 4), ("c", 1)], "b": [], "c": [("b", 2)]}, "a")', '{"a": 0, "c": 1, "b": 3}'], ['shortest({"a": []}, "a")', '{"a": 0}'], ['shortest({"a": [], "b": [("a", 1)]}, "a")', '{"a": 0}']], hint: "`dist = {start: 0}`, `heap = [(0, start)]`. Skip stale entries.", solution: `import heapq\n\ndef shortest(graph, start):\n    dist = {start: 0}\n    heap = [(0, start)]\n    while heap:\n        d, u = heapq.heappop(heap)\n        if d > dist[u]:\n            continue\n        for v, w in graph[u]:\n            if d + w < dist.get(v, float("inf")):\n                dist[v] = d + w\n                heapq.heappush(heap, (d + w, v))\n    return dist\n` },
    { id: 'delay', title: 'Network delay time', prompt: "`times` holds `[u, v, w]` meaning a signal takes w from u to v. Nodes are 1 to n. Write `delay(times, n, k)` returning how long until all nodes have it from k, or -1.", starter: `import heapq\n\ndef delay(times, n, k):\n    # your code here\n    pass\n`, tests: [['delay([[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2)', '2'], ['delay([[1, 2, 1]], 2, 1)', '1'], ['delay([[1, 2, 1]], 2, 2)', '-1']], hint: "Run Dijkstra's. The answer is the biggest distance, if all n were reached.", solution: `import heapq\n\ndef delay(times, n, k):\n    graph = {i: [] for i in range(1, n + 1)}\n    for u, v, w in times:\n        graph[u].append((v, w))\n    dist = {k: 0}\n    heap = [(0, k)]\n    while heap:\n        d, u = heapq.heappop(heap)\n        if d > dist[u]:\n            continue\n        for v, w in graph[u]:\n            if d + w < dist.get(v, float("inf")):\n                dist[v] = d + w\n                heapq.heappush(heap, (d + w, v))\n    return max(dist.values()) if len(dist) == n else -1\n` },
  ],
  homework: ["Trace the animation from two different starting nodes, predicting each distance.", "Store the previous node for each update, and print the actual shortest route.", "Find a small graph with a negative edge where Dijkstra's gives the wrong answer."],
  reallife: [
    { q: "How does a maps app use Dijkstra's idea?", a: "Junctions are nodes and roads are weighted edges. Weights can be travel time. Real systems add speed-ups, but the core idea is the same." },
    { q: "Why would a metro app's fewest-stops answer differ from its fastest-route answer?", a: "Fewest stops uses BFS on hops. Fastest route uses Dijkstra's on travel times. A route with more stops can still be faster." },
  ],
  leetcode: [[743, 'Network Delay Time', 'network-delay-time', 'Medium'], [1631, 'Path With Minimum Effort', 'path-with-minimum-effort', 'Medium'], [787, 'Cheapest Flights Within K Stops', 'cheapest-flights-within-k-stops', 'Medium'], [1514, 'Path with Maximum Probability', 'path-with-maximum-probability', 'Medium']],
});

T({
  id: 'greedy', stage: 's9', title: 'Greedy algorithms', tagline: 'Take the best choice now and never look back.', mins: 30,
  analogy: "Filling a backpack by always taking the most valuable-per-kilo item. Sometimes that's perfect. Sometimes the best local choice blocks a better overall plan.",
  learn: [
    "A **greedy** algorithm makes the locally best choice at each step and never reconsiders it. It's usually simple and fast, often just a sort and a single pass.",
    "The hard part is knowing that it's correct. The typical argument is called an **exchange argument**: take any optimal answer and show that swapping in the greedy choice doesn't make it worse.",
    "**Interval scheduling** is the classic example. To fit the most meetings, sort by **finish time**. Finishing early leaves the most room for everything else.",
    "Greedy can fail. Paying 6 with coins 1, 3, 4 greedily gives 4 + 1 + 1, which is three coins, when 3 + 3 uses only two. So test small examples. If you find a counterexample, switch to DP.",
  ],
  keys: ["Local best, no going back", "Often a sort plus a scan", "Sort intervals by finish time", "Try to break it with small examples"],
  anims: ['greedy-intervals', 'greedy-coins'],
  code: [{ title: 'Jump Game', src: `def can_jump(nums):
    furthest = 0
    for i, jump in enumerate(nums):
        if i > furthest:
            return False       # can't even reach here
        furthest = max(furthest, i + jump)
    return True

print(can_jump([2, 3, 1, 1, 4]))  # True
print(can_jump([3, 2, 1, 0, 4]))  # False` }],
  quiz: [
    { q: "To fit the most meetings, sort by:", o: ["Start time", "Length", "Finish time", "Name"], a: 2, why: "The earliest finish leaves the most time for the others." },
    { q: "Does greedy always give the best answer?", o: ["Yes", "No, it has to be proven per problem", "Only for sorted input", "Only for coins"], a: 1, why: "A locally best move can lose overall." },
    { q: "With coins 1, 3, 4 and amount 6, greedy uses:", o: ["2 coins", "3 coins", "4 coins", "6 coins"], a: 1, why: "4 + 1 + 1 is three coins, while the best is 3 + 3." },
    { q: "What's the typical time for a sort-then-scan greedy?", o: ["O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"], a: 1, why: "Sorting dominates." },
  ],
  coding: [
    { id: 'max-meet', title: 'Most meetings', prompt: "Write `max_meetings(meetings)` where each meeting is `[start, end]`. Return the most that fit without overlapping. One may start exactly when another ends.", starter: `def max_meetings(meetings):\n    # your code here\n    pass\n`, tests: [['max_meetings([[1, 2], [2, 3], [3, 4], [1, 3]])', '3'], ['max_meetings([[0, 10], [1, 2], [3, 4]])', '2'], ['max_meetings([])', '0']], hint: "Sort by end time, tracking the last end.", solution: `def max_meetings(meetings):\n    meetings = sorted(meetings, key=lambda m: m[1])\n    count = 0\n    last = float("-inf")\n    for s, e in meetings:\n        if s >= last:\n            count += 1\n            last = e\n    return count\n` },
    { id: 'merge-int', title: 'Merge intervals', prompt: "Write `merge_intervals(items)` that merges overlapping `[start, end]` intervals and returns them sorted.", starter: `def merge_intervals(items):\n    # your code here\n    pass\n`, tests: [['merge_intervals([[1, 3], [2, 6], [8, 10], [15, 18]])', '[[1, 6], [8, 10], [15, 18]]'], ['merge_intervals([[1, 4], [4, 5]])', '[[1, 5]]'], ['merge_intervals([])', '[]'], ['merge_intervals([[1, 10], [2, 3]])', '[[1, 10]]']], hint: "Sort by start. If the next begins before the last one ends, extend it.", solution: `def merge_intervals(items):\n    out = []\n    for s, e in sorted(items):\n        if out and s <= out[-1][1]:\n            out[-1][1] = max(out[-1][1], e)\n        else:\n            out.append([s, e])\n    return out\n` },
  ],
  homework: ["Find a meeting set where sorting by start time gives the wrong answer.", "Solve Jump Game and explain why `furthest` is sufficient.", "In the coin animation, find other amounts where greedy loses with coins 1, 3, 4."],
  reallife: [
    { q: "A conference hall manager wants the highest number of talks in one room. What strategy?", a: "Sort by finish time and keep each talk that starts after the last chosen one ends." },
    { q: "When you plan road-trip fuel stops, stopping as late as possible is a greedy approach. Why does it work?", a: "Going as far as you can on each tank can only reduce the number of stops. Any plan with an earlier stop can be swapped for the later one without being worse." },
  ],
  leetcode: [[455, 'Assign Cookies', 'assign-cookies', 'Easy'], [55, 'Jump Game', 'jump-game', 'Medium'], [56, 'Merge Intervals', 'merge-intervals', 'Medium'], [435, 'Non-overlapping Intervals', 'non-overlapping-intervals', 'Medium'], [134, 'Gas Station', 'gas-station', 'Medium']],
});

T({
  id: 'backtracking', stage: 's9', title: 'Backtracking', tagline: 'Try a choice, explore, undo, try the next.', mins: 35,
  analogy: "Trying a key combination in a maze of doors. Open a door and go on. At a dead end, go back through the door, close it, and try the next one.",
  learn: [
    "Backtracking explores all possibilities by building a solution one choice at a time. It's a depth-first walk over a tree of decisions.",
    "It has one shape every time: **choose**, **explore**, **undo**. The undo step means one shared `path` list works for the whole search. Append, recurse, then pop.",
    "When recording an answer, save a **copy** with `path[:]`. Otherwise every saved answer points to the same list, which ends up empty.",
    "**Pruning** skips branches that can't work, such as stopping when the sum is already over target. It can make impossible-looking searches practical.",
    "Complexity tends to be large: 2ⁿ subsets, or n! permutations. That's expected when you have to list everything, so it's typically used when n is small (≤ 20).",
  ],
  keys: ["Choose, explore, undo", "Save `path[:]`, not `path`", "Prune early", "Expect 2ⁿ or n!"],
  anims: ['bt-subsets', 'bt-nqueens'],
  code: [{ title: 'Permutations', src: `def permutations(nums):
    out, path = [], []
    used = [False] * len(nums)
    def go():
        if len(path) == len(nums):
            out.append(path[:])
            return
        for i, x in enumerate(nums):
            if used[i]:
                continue
            used[i] = True          # choose
            path.append(x)
            go()                    # explore
            path.pop()              # undo
            used[i] = False
    go()
    return out

print(permutations([1, 2, 3]))` }],
  quiz: [
    { q: "What are the three steps?", o: ["Sort, scan, return", "Choose, explore, undo", "Split, merge, sort", "Push, pop, peek"], a: 1, why: "That shape solves subsets, permutations, N-Queens and more." },
    { q: "Why save `path[:]`?", o: ["It's faster", "`path` keeps changing, so you need a copy", "To sort it", "To prune"], a: 1, why: "Without copying, every answer refers to the same final list." },
    { q: "How many subsets does a set of 4 have?", o: ["4", "8", "16", "24"], a: 2, why: "2⁴ = 16, as each item is either in or out." },
    { q: "What's pruning?", o: ["Deleting input", "Skipping branches that can't succeed", "Sorting results", "Memoising"], a: 1, why: "It cuts whole subtrees of the search." },
  ],
  coding: [
    { id: 'subsets', title: 'Subsets', prompt: "Write `subsets(nums)` returning all subsets. The tests sort the output, so any order works.", starter: `def subsets(nums):\n    # your code here\n    pass\n`, tests: [['sorted(sorted(x) for x in subsets([1, 2, 3]))', '[[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]'], ['subsets([])', '[[]]']], hint: "For each index choose to take or skip.", solution: `def subsets(nums):\n    out, path = [], []\n    def go(i):\n        if i == len(nums):\n            out.append(path[:])\n            return\n        path.append(nums[i])\n        go(i + 1)\n        path.pop()\n        go(i + 1)\n    go(0)\n    return out\n` },
    { id: 'combo', title: 'Combination sum', prompt: "Write `combos(nums, target)` returning all combinations (numbers can be reused) that add up to target. `nums` has unique positive values. The tests sort your output.", starter: `def combos(nums, target):\n    # your code here\n    pass\n`, tests: [['sorted(sorted(x) for x in combos([2, 3, 6, 7], 7))', '[[2, 2, 3], [7]]'], ['sorted(sorted(x) for x in combos([2, 3, 5], 8))', '[[2, 2, 2, 2], [2, 3, 3], [3, 5]]'], ['combos([2], 1)', '[]']], hint: "Pass a start index so you don't produce the same combination in another order. Stop when the remainder goes below zero.", solution: `def combos(nums, target):\n    out, path = [], []\n    def go(start, left):\n        if left == 0:\n            out.append(path[:])\n            return\n        for i in range(start, len(nums)):\n            if nums[i] <= left:\n                path.append(nums[i])\n                go(i, left - nums[i])\n                path.pop()\n    go(0, target)\n    return out\n` },
  ],
  homework: ["Write Permutations without the code panel open.", "In the N-Queens animation, count how many times it undoes a queen on a 4 × 4 board.", "Solve Generate Parentheses using the open and close counts as pruning rules."],
  reallife: [
    { q: "How does a Sudoku solver work?", a: "Pick an empty cell and try each valid digit. If you get stuck, erase the digit and try the next. That's backtracking with pruning." },
    { q: "A travel planner lists all ways to visit 5 cities. How many are there, and why use backtracking?", a: "5! = 120. Backtracking lists them and can prune any route that already exceeds the budget." },
  ],
  leetcode: [[78, 'Subsets', 'subsets', 'Medium'], [46, 'Permutations', 'permutations', 'Medium'], [39, 'Combination Sum', 'combination-sum', 'Medium'], [22, 'Generate Parentheses', 'generate-parentheses', 'Medium'], [79, 'Word Search', 'word-search', 'Medium']],
});

T({
  id: 'dp-intro', stage: 's9', title: 'Dynamic programming basics', tagline: 'Recursion that remembers.', mins: 35,
  analogy: "What's 1+1+1+1+1? You count: 5. Add another +1. You say 6 straight away, because you remembered the earlier answer. That's dynamic programming.",
  learn: [
    "DP applies when a problem breaks into **overlapping subproblems**: the same smaller question appears many times. Solve each only once and store the answer.",
    "**Top-down (memoisation)**: write the plain recursion and add a dict of answers. `functools.lru_cache` does it in one line. **Bottom-up (tabulation)**: fill a table from the smallest case upward with a loop.",
    "A five-step recipe works for most problems. 1) Define the state: what does `dp[i]` mean, in words? 2) Write the recurrence. 3) Set the base cases. 4) Choose the fill order. 5) Point to where the answer lives.",
    "Time is usually the number of states × work per state. Often a row or value depends on just the previous one or two, so space can be trimmed to O(1).",
    "DP vs greedy: greedy commits to one choice, whereas DP considers all choices for each state and keeps the best.",
  ],
  keys: ["Overlapping subproblems", "Define `dp[i]` in plain words", "Top-down or bottom-up", "States × work per state"],
  anims: ['dp-memo', 'dp-table'],
  code: [{ title: 'Memoise in one line', src: `from functools import lru_cache

@lru_cache(maxsize=None)
def climb(n):
    if n <= 1:
        return 1
    return climb(n - 1) + climb(n - 2)

print(climb(40))  # 165580141, instantly

def climb_table(n):        # bottom-up, O(1) space
    a, b = 1, 1
    for _ in range(n - 1):
        a, b = b, a + b
    return b

print(climb_table(40))` }],
  quiz: [
    { q: "What makes a problem suitable for DP?", o: ["Sorted input", "Overlapping subproblems", "Short input", "Only integers"], a: 1, why: "If the same subproblems recur, saving answers pays off." },
    { q: "What's memoisation?", o: ["Saving results of function calls", "Sorting", "Deleting duplicates", "Writing notes"], a: 0, why: "A repeat call returns the stored answer." },
    { q: "With memo, `fib(n)` takes:", o: ["O(2ⁿ)", "O(n)", "O(n²)", "O(log n)"], a: 1, why: "There are n distinct states and each does O(1) work." },
    { q: "What should you write first when solving a DP?", o: ["The loops", "What dp[i] means", "The answer", "A sort"], a: 1, why: "Everything else follows from a clear state definition." },
  ],
  coding: [
    { id: 'climb', title: 'Climbing stairs', prompt: "You can climb 1 or 2 steps at a time. Write `climb(n)` returning the number of different ways to reach step n.", starter: `def climb(n):\n    # your code here\n    pass\n`, tests: [['climb(2)', '2'], ['climb(3)', '3'], ['climb(5)', '8'], ['climb(45)', '1836311903']], hint: "To arrive at step n you came from n−1 or n−2.", solution: `def climb(n):\n    a, b = 1, 1\n    for _ in range(n - 1):\n        a, b = b, a + b\n    return b\n` },
    { id: 'rob', title: 'House robber', prompt: "You can't rob two adjacent houses. Write `rob(money)` returning the most you can take.", starter: `def rob(money):\n    # your code here\n    pass\n`, tests: [['rob([1, 2, 3, 1])', '4'], ['rob([2, 7, 9, 3, 1])', '12'], ['rob([])', '0'], ['rob([5])', '5']], hint: "At each house: `max(skip, previous-previous + money)`.", solution: `def rob(money):\n    prev, cur = 0, 0\n    for m in money:\n        prev, cur = cur, max(cur, prev + m)\n    return cur\n` },
    { id: 'coin', title: 'Coin change', prompt: "Write `min_coins(coins, amount)` returning the fewest coins to make amount, or -1. Coins can be reused.", starter: `def min_coins(coins, amount):\n    # your code here\n    pass\n`, tests: [['min_coins([1, 2, 5], 11)', '3'], ['min_coins([2], 3)', '-1'], ['min_coins([1], 0)', '0'], ['min_coins([1, 3, 4], 6)', '2']], hint: "`dp[a] = min(dp[a - c] + 1)` over all coins. Start from `dp[0] = 0`.", solution: `def min_coins(coins, amount):\n    dp = [0] + [float("inf")] * amount\n    for a in range(1, amount + 1):\n        for c in coins:\n            if c <= a:\n                dp[a] = min(dp[a], dp[a - c] + 1)\n    return dp[amount] if dp[amount] != float("inf") else -1\n` },
  ],
  homework: ["Time `fib(35)` with and without `lru_cache`.", "Write the 5-step recipe for Min Cost Climbing Stairs, in words, before coding.", "Rewrite House Robber's table version, then reduce it to two variables."],
  reallife: [
    { q: "A vending machine wants to return change using the fewest coins from an unusual coin set. Why isn't greedy safe?", a: "As you saw with coins 1, 3, 4, largest-first can be wrong. DP tries every coin for every amount, so it's always correct." },
    { q: "A map app caches the best route from each junction to a destination. Which DP idea is that?", a: "Memoisation. Each junction's best route is computed once and reused." },
  ],
  leetcode: [[70, 'Climbing Stairs', 'climbing-stairs', 'Easy'], [746, 'Min Cost Climbing Stairs', 'min-cost-climbing-stairs', 'Easy'], [198, 'House Robber', 'house-robber', 'Medium'], [322, 'Coin Change', 'coin-change', 'Medium'], [300, 'Longest Increasing Subsequence', 'longest-increasing-subsequence', 'Medium']],
});

T({
  id: 'dp-2d', stage: 's9', title: '2-D dynamic programming', tagline: 'Tables with rows and columns.', mins: 35,
  analogy: "A city grid where you can only walk east or south. The number of routes to any corner is just the routes to the corner above plus the routes to the corner on the left.",
  learn: [
    "When a problem has two changing things, such as a row and column or positions in two strings, the state needs two indexes: `dp[i][j]`.",
    "**Grid paths**: `dp[r][c]` is built from above and left. Fill in row order, and each needed cell is ready when you reach it.",
    "**Two strings**: `dp[i][j]` means the answer for the first `i` letters of `a` and first `j` letters of `b`. If the letters match, build on the diagonal. Otherwise, take the best of dropping a letter from either side.",
    "Add an extra row and column of zeros for empty strings. This removes special cases at the edges.",
    "A cell usually depends only on the previous row, so space can drop from O(n × m) to O(m).",
  ],
  keys: ["Two changing values = 2-D state", "Fill so that dependencies come first", "Extra row and column for empty", "Keep only one row to save memory"],
  anims: ['dp-grid', 'dp-lcs'],
  code: [{ title: 'Edit distance', src: `def edit_distance(a, b):
    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(len(a) + 1):
        dp[i][0] = i
    for j in range(len(b) + 1):
        dp[0][j] = j
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j],     # delete
                                   dp[i][j - 1],     # insert
                                   dp[i - 1][j - 1]) # replace
    return dp[-1][-1]

print(edit_distance("horse", "ros"))  # 3` }],
  quiz: [
    { q: "In LCS, when the letters match, the cell takes:", o: ["Above + 1", "Left + 1", "Diagonal + 1", "0"], a: 2, why: "Both letters are used up, so go to the state before both." },
    { q: "In unique paths, a cell equals:", o: ["Above × left", "Above + left", "max(above, left)", "Diagonal"], a: 1, why: "Every path arrives from above or left, so add the counts." },
    { q: "What's the time for LCS on lengths n and m?", o: ["O(n + m)", "O(n × m)", "O(2ⁿ)", "O(n log m)"], a: 1, why: "There's one constant-time cell per pair." },
    { q: "Why is the extra row of zeros useful?", o: ["Speed", "It handles empty strings with no special cases", "It's required by Python", "To sort"], a: 1, why: "`dp[i-1][j-1]` is always valid." },
  ],
  coding: [
    { id: 'paths', title: 'Unique paths', prompt: "Write `paths(rows, cols)`: how many routes from the top left to the bottom right, moving only right or down?", starter: `def paths(rows, cols):\n    # your code here\n    pass\n`, tests: [['paths(3, 7)', '28'], ['paths(3, 2)', '3'], ['paths(1, 1)', '1']], hint: "The first row and column are all 1.", solution: `def paths(rows, cols):\n    dp = [[1] * cols for _ in range(rows)]\n    for r in range(1, rows):\n        for c in range(1, cols):\n            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]\n    return dp[-1][-1]\n` },
    { id: 'lcs', title: 'Longest common subsequence', prompt: "Write `lcs(a, b)` returning the length of the longest common subsequence.", starter: `def lcs(a, b):\n    # your code here\n    pass\n`, tests: [['lcs("abcde", "ace")', '3'], ['lcs("abc", "abc")', '3'], ['lcs("abc", "def")', '0'], ['lcs("", "a")', '0']], hint: "Table of size `(len(a)+1) × (len(b)+1)`.", solution: `def lcs(a, b):\n    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]\n    for i in range(1, len(a) + 1):\n        for j in range(1, len(b) + 1):\n            if a[i - 1] == b[j - 1]:\n                dp[i][j] = dp[i - 1][j - 1] + 1\n            else:\n                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])\n    return dp[-1][-1]\n` },
  ],
  homework: ["Solve Minimum Path Sum on paper for a 3 × 3 grid.", "Modify LCS to return the actual letters.", "Reduce Unique Paths to a single row of memory."],
  reallife: [
    { q: "How does a spell checker suggest 'hello' for 'helo'?", a: "Edit distance. It measures the fewest changes from your word to dictionary words and suggests the closest." },
    { q: "How does a tool like `git diff` find what changed between two files?", a: "It's based on the longest common subsequence of lines. Lines not in it were added or removed." },
  ],
  leetcode: [[118, "Pascal's Triangle", 'pascals-triangle', 'Easy'], [62, 'Unique Paths', 'unique-paths', 'Medium'], [64, 'Minimum Path Sum', 'minimum-path-sum', 'Medium'], [1143, 'Longest Common Subsequence', 'longest-common-subsequence', 'Medium'], [72, 'Edit Distance', 'edit-distance', 'Medium']],
});

T({
  id: 'knapsack', stage: 's9', title: 'Knapsack problems', tagline: 'Take it or leave it, with limited room.', mins: 30,
  analogy: "Packing a suitcase with a weight limit. For each item you decide: leave it and keep the room, or take it and accept less room for everything else.",
  learn: [
    "In **0/1 knapsack**, each item has a weight and value, and you pick each item at most once. Maximise the value without exceeding capacity.",
    "State: `dp[i][c]` is the best value using the first `i` items with room `c`. Choice: leave it, `dp[i-1][c]`, or take it, `dp[i-1][c-w] + v`. Time and space are O(n × capacity).",
    "With one row, go through capacities **from high to low**, so each item is used at most once. Going low to high would let you reuse an item, which is the **unbounded knapsack** used in Coin Change.",
    "Lots of problems are knapsacks in disguise. Partition Equal Subset Sum asks: can some items sum to half the total? That's a knapsack where weights and values are the same.",
  ],
  keys: ["Take it or leave it", "`dp[i][c]`: items used and room left", "One row: go from high to low capacity", "Many subset problems are knapsacks"],
  anims: ['dp-knapsack'],
  code: [{ title: 'One-row knapsack', src: `def knapsack(weights, values, cap):
    dp = [0] * (cap + 1)
    for w, v in zip(weights, values):
        for c in range(cap, w - 1, -1):   # high to low
            dp[c] = max(dp[c], dp[c - w] + v)
    return dp[cap]

print(knapsack([1, 3, 4], [15, 20, 30], 4))  # 35

def can_partition(nums):
    total = sum(nums)
    if total % 2:
        return False
    reach = {0}
    for x in nums:
        reach |= {r + x for r in reach}
    return total // 2 in reach` }],
  quiz: [
    { q: "Why not take the best value-to-weight first?", o: ["It's too slow", "It can miss the best total in 0/1 knapsack", "It's illegal", "It's always optimal"], a: 1, why: "Greedy can leave unused room. Try weights 1, 3, 4 with a few values." },
    { q: "Why go from high to low capacity with one row?", o: ["It's faster", "So each item is used only once", "To sort", "No reason"], a: 1, why: "`dp[c - w]` still holds the value before this item was considered." },
    { q: "What's the time complexity?", o: ["O(n)", "O(n × capacity)", "O(2ⁿ) always", "O(n log n)"], a: 1, why: "One cell for each pair of item and capacity." },
    { q: "Partition Equal Subset Sum is a knapsack where:", o: ["Weights are all 1", "The capacity is half the total", "Values are negative", "Items can repeat"], a: 1, why: "You ask whether a subset reaches exactly half." },
  ],
  coding: [
    { id: 'ks', title: '0/1 knapsack', prompt: "Write `knapsack(weights, values, cap)` returning the maximum total value.", starter: `def knapsack(weights, values, cap):\n    # your code here\n    pass\n`, tests: [['knapsack([1, 3, 4], [15, 20, 30], 4)', '35'], ['knapsack([2], [10], 1)', '0'], ['knapsack([], [], 5)', '0'], ['knapsack([1, 1, 1], [1, 2, 3], 2)', '5']], hint: "One row. For each item, loop capacity from `cap` down to `w`.", solution: `def knapsack(weights, values, cap):\n    dp = [0] * (cap + 1)\n    for w, v in zip(weights, values):\n        for c in range(cap, w - 1, -1):\n            dp[c] = max(dp[c], dp[c - w] + v)\n    return dp[cap]\n` },
    { id: 'partition-eq', title: 'Partition equal subset sum', prompt: "Write `can_partition(nums)`: can the list be split into two groups with equal sums?", starter: `def can_partition(nums):\n    # your code here\n    pass\n`, tests: [['can_partition([1, 5, 11, 5])', 'True'], ['can_partition([1, 2, 3, 5])', 'False'], ['can_partition([2])', 'False']], hint: "If the sum is odd, the answer is False. Otherwise, track which sums are reachable.", solution: `def can_partition(nums):\n    total = sum(nums)\n    if total % 2:\n        return False\n    reach = {0}\n    for x in nums:\n        reach |= {r + x for r in reach}\n    return total // 2 in reach\n` },
  ],
  homework: ["Fill the knapsack table by hand for 3 items, then check with the animation.", "Change the code to also return which items were chosen.", "Solve Target Sum and explain how it becomes a subset problem."],
  reallife: [
    { q: "An investor has a fixed budget and many indivisible projects with costs and expected returns. Which model fits?", a: "0/1 knapsack. Budget is the capacity, cost is the weight, and return is the value." },
    { q: "A delivery drone has a weight limit and packages with priorities. How should it pick them?", a: "Treat it as a knapsack. A simple value-per-kg rule can miss the best total, so DP is safer for small numbers of packages." },
  ],
  leetcode: [[416, 'Partition Equal Subset Sum', 'partition-equal-subset-sum', 'Medium'], [494, 'Target Sum', 'target-sum', 'Medium'], [518, 'Coin Change II', 'coin-change-ii', 'Medium'], [1049, 'Last Stone Weight II', 'last-stone-weight-ii', 'Medium']],
});

T({
  id: 'tries', stage: 's10', title: 'Tries', tagline: 'Trees that store words by shared beginnings.', mins: 25,
  analogy: "A book index organised letter by letter. All words beginning with 'ca' live under the same branch, so finding them never touches words starting with 'do'.",
  learn: [
    "A **trie** (say 'try') is a tree where each edge is a character. A path from the root spells out a prefix. A special marker on a node means a complete word ends there.",
    "Insert and search take O(L), where L is the word's length. It doesn't matter how many words are stored. Prefix queries are the real strength, since a hash table can't easily answer 'any word starting with ca?'.",
    "In Python, nested dicts make a tidy trie. Each node is a dict of children, with a key like `\"$\"` marking the end of a word.",
    "Tries use more memory than a set of strings, though shared prefixes reduce that. Use them for autocomplete, spell checking, and word search on grids.",
  ],
  keys: ["Each edge is one letter", "Operations are O(word length)", "Prefix queries are the strength", "Mark where words end"],
  cost: [['Insert a word', 'O(L)'], ['Search a word', 'O(L)'], ['Check a prefix', 'O(L)'], ['Space', 'O(total letters)']],
  anims: ['trie-ops'],
  code: [{ title: 'Autocomplete', src: `class Trie:
    def __init__(self):
        self.root = {}

    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {})
        node["$"] = True

    def suggest(self, prefix):
        node = self.root
        for ch in prefix:
            if ch not in node:
                return []
            node = node[ch]
        out = []
        def walk(n, text):
            if "$" in n:
                out.append(text)
            for ch in sorted(n):
                if ch != "$":
                    walk(n[ch], text + ch)
        walk(node, prefix)
        return out

t = Trie()
for w in ["car", "cat", "cart", "dog"]:
    t.insert(w)
print(t.suggest("ca"))  # ['car', 'cart', 'cat']` }],
  quiz: [
    { q: "What's the time to search for a word of length L?", o: ["O(1)", "O(L)", "O(n)", "O(n × L)"], a: 1, why: "One step per letter, however many words are stored." },
    { q: "Why mark the end of a word?", o: ["To save space", "To tell 'car' apart from a prefix of 'cart'", "To sort", "It isn't needed"], a: 1, why: "Otherwise you can't tell whether the path is a stored word or just a prefix." },
    { q: "What's a trie's main advantage over a set?", o: ["Less memory", "Fast prefix queries", "No hashing", "Simplicity"], a: 1, why: "It can answer questions about prefixes directly." },
    { q: "Inserting 'cat' and 'car' creates how many non-root nodes?", o: ["3", "4", "5", "6"], a: 1, why: "c, a, t and r. The first two are shared." },
  ],
  coding: [
    { id: 'trie', title: 'Build a trie', prompt: "Finish class `Trie` with `insert(word)`, `search(word)` (exact match) and `starts_with(prefix)`.", starter: `class Trie:\n    def __init__(self):\n        self.root = {}\n\n    def insert(self, word):\n        # your code here\n        pass\n\n    def search(self, word):\n        # your code here\n        pass\n\n    def starts_with(self, prefix):\n        # your code here\n        pass\n`, tests: [['(lambda t: (t.insert("apple"), t.search("apple"), t.search("app"), t.starts_with("app")))(Trie())[1:]', '(True, False, True)'], ['Trie().search("a")', 'False'], ['Trie().starts_with("")', 'True']], hint: "A helper that walks a string and returns the final node, or `None`, will serve both lookups.", solution: `class Trie:\n    def __init__(self):\n        self.root = {}\n\n    def insert(self, word):\n        node = self.root\n        for ch in word:\n            node = node.setdefault(ch, {})\n        node["$"] = True\n\n    def _walk(self, text):\n        node = self.root\n        for ch in text:\n            if ch not in node:\n                return None\n            node = node[ch]\n        return node\n\n    def search(self, word):\n        node = self._walk(word)\n        return node is not None and "$" in node\n\n    def starts_with(self, prefix):\n        return self._walk(prefix) is not None\n` },
    { id: 'lcp', title: 'Longest common prefix', prompt: "Write `common_prefix(words)` returning the longest prefix shared by all words. You may use a trie or a simpler method.", starter: `def common_prefix(words):\n    # your code here\n    pass\n`, tests: [['common_prefix(["flower", "flow", "flight"])', '"fl"'], ['common_prefix(["dog", "car"])', '""'], ['common_prefix(["solo"])', '"solo"'], ['common_prefix([])', '""']], hint: "Compare just the smallest and largest word after sorting, since they differ the most.", solution: `def common_prefix(words):\n    if not words:\n        return ""\n    a, b = min(words), max(words)\n    i = 0\n    while i < len(a) and i < len(b) and a[i] == b[i]:\n        i += 1\n    return a[:i]\n` },
  ],
  homework: ["Add `count_prefix(p)`, which returns how many words begin with p.", "Add deletion, removing nodes no longer needed.", "Run the trie animation on your own words, and predict the node count first."],
  reallife: [
    { q: "How does a phone keyboard suggest words as you type?", a: "It walks a trie (often with word frequencies) to the node for what you've typed and lists common completions below it." },
    { q: "Network routers find the longest matching IP prefix. Why are tries a good fit?", a: "Addresses are compared bit by bit along shared paths, so lookups depend on the address length, not on the number of routes." },
  ],
  leetcode: [[14, 'Longest Common Prefix', 'longest-common-prefix', 'Easy'], [208, 'Implement Trie (Prefix Tree)', 'implement-trie-prefix-tree', 'Medium'], [211, 'Design Add and Search Words Data Structure', 'design-add-and-search-words-data-structure', 'Medium'], [648, 'Replace Words', 'replace-words', 'Medium']],
});

T({
  id: 'union-find', stage: 's10', title: 'Union-Find', tagline: 'Track which items are in the same group.', mins: 30,
  analogy: "Every person in a club points to someone senior, and the chain ends with the group's president. Two people are in the same group if they share a president. To merge groups, one president reports to the other.",
  learn: [
    "**Union-Find**, also called a Disjoint Set Union, tracks groups that only ever merge. It supports two operations: `find(x)`, which group is x in, and `union(a, b)`, which merges two groups.",
    "Each item stores a parent, and the top item, called the root, names the group. Two tricks keep it nearly O(1): **path compression** points nodes directly at the root as you walk, and **union by size** attaches the smaller tree beneath the larger.",
    "`union` returning False means both were already in one group. For graph edges, that means this edge forms a cycle.",
    "Use it for: counting components while edges arrive one at a time, cycle detection in undirected graphs, and **Kruskal's minimum spanning tree**, which sorts edges by cost and keeps those that join two different groups.",
  ],
  keys: ["find + union", "Roots name the groups", "Path compression + union by size", "Almost O(1) per operation"],
  anims: ['uf-ops'],
  code: [{ title: "Kruskal's minimum spanning tree", src: `def kruskal(n, edges):
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]   # path halving
            x = parent[x]
        return x
    total = 0
    for w, a, b in sorted(edges):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb
            total += w
    return total

print(kruskal(4, [(1, 0, 1), (2, 1, 2), (3, 0, 2), (4, 2, 3)]))  # 7` }],
  quiz: [
    { q: "How do you tell whether a and b are in the same group?", o: ["a == b", "find(a) == find(b)", "parent[a] == parent[b]", "size[a] == size[b]"], a: 1, why: "Only the roots are guaranteed to be the same." },
    { q: "What does path compression do?", o: ["Deletes nodes", "Points walked nodes straight at the root", "Sorts the list", "Shrinks values"], a: 1, why: "Future finds on those nodes take one step." },
    { q: "If `union(a, b)` finds the same root for both, the edge a–b:", o: ["Merges groups", "Forms a cycle", "Is invalid", "Deletes a"], a: 1, why: "They were already connected by another route." },
    { q: "Why attach the smaller tree under the larger?", o: ["Looks neater", "Keeps trees shallow", "Saves memory", "Required by Python"], a: 1, why: "Fewer nodes get deeper, so finds remain fast." },
  ],
  coding: [
    { id: 'count-comp', title: 'Count groups', prompt: "Write `count_groups(n, pairs)`: there are n items, and each pair joins two. Return the number of groups. Use union-find.", starter: `def count_groups(n, pairs):\n    # your code here\n    pass\n`, tests: [['count_groups(5, [[0, 1], [1, 2], [3, 4]])', '2'], ['count_groups(3, [])', '3'], ['count_groups(4, [[0, 1], [1, 0], [2, 3], [1, 3]])', '1']], hint: "Start with count = n. Each successful union lowers it by 1.", solution: `def count_groups(n, pairs):\n    parent = list(range(n))\n    def find(x):\n        if parent[x] != x:\n            parent[x] = find(parent[x])\n        return parent[x]\n    count = n\n    for a, b in pairs:\n        ra, rb = find(a), find(b)\n        if ra != rb:\n            parent[ra] = rb\n            count -= 1\n    return count\n` },
    { id: 'redundant', title: 'Redundant connection', prompt: "Edges are added one by one. Write `redundant(edges)` returning the first edge that forms a cycle, or `None`. Nodes are numbered from 1.", starter: `def redundant(edges):\n    # your code here\n    pass\n`, tests: [['redundant([[1, 2], [1, 3], [2, 3]])', '[2, 3]'], ['redundant([[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]])', '[1, 4]'], ['redundant([[1, 2]])', 'None']], hint: "Use a dict for `parent`, or size it with `len(edges) + 2`.", solution: `def redundant(edges):\n    parent = list(range(len(edges) + 2))\n    def find(x):\n        if parent[x] != x:\n            parent[x] = find(parent[x])\n        return parent[x]\n    for a, b in edges:\n        ra, rb = find(a), find(b)\n        if ra == rb:\n            return [a, b]\n        parent[ra] = rb\n    return None\n` },
  ],
  homework: ["Write a `UnionFind` class with `find`, `union` and a `size` list.", "Trace `0-1, 1-2, 2-3, 3-4, 4-5` in the animation and watch the path compression.", "Solve Accounts Merge. Think about what the items are, and what merges them."],
  reallife: [
    { q: "A social app shows friend groups as new friendships appear. Why not re-run DFS each time?", a: "Union-find handles each new friendship almost instantly, without re-scanning the graph." },
    { q: "A telecom company wants to connect all towers using the cheapest set of cables. Which algorithm?", a: "Kruskal's minimum spanning tree: sort cables by price and add each that joins two separate groups, using union-find to check." },
  ],
  leetcode: [[990, 'Satisfiability of Equality Equations', 'satisfiability-of-equality-equations', 'Medium'], [547, 'Number of Provinces', 'number-of-provinces', 'Medium'], [684, 'Redundant Connection', 'redundant-connection', 'Medium'], [721, 'Accounts Merge', 'accounts-merge', 'Medium'], [1584, 'Min Cost to Connect All Points', 'min-cost-to-connect-all-points', 'Medium']],
});

T({
  id: 'segment-trees', stage: 's10', title: 'Segment trees', tagline: 'Range questions and updates, both in O(log n).', mins: 35,
  analogy: "A company's sales report. Each team stores its total, each department stores the sum of its teams, and the head office stores the sum of departments. A sale only updates one chain of managers. A question about several teams uses a few ready-made totals.",
  learn: [
    "Prefix sums answer range sums instantly but can't handle updates well, since one change can touch n entries. A **segment tree** does both in O(log n).",
    "It's a binary tree in which each node stores a result for a range. Leaves are single items, and every parent combines its two children. It works for sum, min, max, gcd, or any operation that can be combined.",
    "A **query** splits into three cases. Node's range outside the query: ignore it. Fully inside: use its stored value. Partly overlapping: ask both children.",
    "An **update** changes one leaf, then recalculates its ancestors. Store the tree in a list of size 2n, or 4n for the recursive version.",
    "A **Fenwick tree** (binary indexed tree) is a shorter alternative for sums. When you need to update whole ranges, segment trees add **lazy propagation**.",
  ],
  keys: ["Each node stores a range result", "Query and update are O(log n)", "Three query cases", "Use it when both queries and updates exist"],
  cost: [['Build', 'O(n)'], ['Range query', 'O(log n)'], ['Point update', 'O(log n)'], ['Space', 'O(n)']],
  anims: ['segtree'],
  code: [{ title: 'Compact iterative version', src: `class SegTree:
    def __init__(self, nums):
        self.n = len(nums)
        self.t = [0] * self.n + nums
        for i in range(self.n - 1, 0, -1):
            self.t[i] = self.t[2 * i] + self.t[2 * i + 1]

    def update(self, i, val):
        i += self.n
        self.t[i] = val
        while i > 1:
            i //= 2
            self.t[i] = self.t[2 * i] + self.t[2 * i + 1]

    def query(self, l, r):     # sum of l..r inclusive
        res = 0
        l += self.n
        r += self.n + 1
        while l < r:
            if l & 1:
                res += self.t[l]; l += 1
            if r & 1:
                r -= 1; res += self.t[r]
            l //= 2; r //= 2
        return res

st = SegTree([1, 3, 5])
print(st.query(0, 2))   # 9
st.update(1, 2)
print(st.query(0, 2))   # 8` }],
  quiz: [
    { q: "When is a segment tree better than prefix sums?", o: ["When data never changes", "When updates and queries are mixed", "For a single query", "For sorting"], a: 1, why: "Prefix sums are simpler if data never changes. Updates are where segment trees win." },
    { q: "What's the query time?", o: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], a: 1, why: "At most a few nodes per level are visited." },
    { q: "A node's range is fully inside the query. What do you do?", o: ["Ask both children", "Return its stored value", "Return 0", "Update it"], a: 1, why: "Its value is exactly what you need, so stop going deeper." },
    { q: "How many nodes change when one item is updated?", o: ["1", "About log n", "About n", "All of them"], a: 1, why: "One leaf and its ancestors." },
  ],
  coding: [
    { id: 'seg-sum', title: 'Range sum with updates', prompt: "Finish `SegTree` with `update(i, val)` and `query(l, r)`, which returns the inclusive sum. `__init__` is written for you.", starter: `class SegTree:\n    def __init__(self, nums):\n        self.n = len(nums)\n        self.t = [0] * self.n + nums\n        for i in range(self.n - 1, 0, -1):\n            self.t[i] = self.t[2 * i] + self.t[2 * i + 1]\n\n    def update(self, i, val):\n        # your code here\n        pass\n\n    def query(self, l, r):\n        # your code here\n        pass\n`, tests: [['SegTree([1, 3, 5]).query(0, 2)', '9'], ['(lambda s: (s.update(1, 2), s.query(0, 2)))(SegTree([1, 3, 5]))[1]', '8'], ['SegTree([4, 2, 7, 1]).query(1, 2)', '9'], ['SegTree([9]).query(0, 0)', '9']], hint: "Update: change the leaf at `i + n` and walk up. Query: see the code panel if you get stuck.", solution: `class SegTree:\n    def __init__(self, nums):\n        self.n = len(nums)\n        self.t = [0] * self.n + nums\n        for i in range(self.n - 1, 0, -1):\n            self.t[i] = self.t[2 * i] + self.t[2 * i + 1]\n\n    def update(self, i, val):\n        i += self.n\n        self.t[i] = val\n        while i > 1:\n            i //= 2\n            self.t[i] = self.t[2 * i] + self.t[2 * i + 1]\n\n    def query(self, l, r):\n        res = 0\n        l += self.n\n        r += self.n + 1\n        while l < r:\n            if l & 1:\n                res += self.t[l]\n                l += 1\n            if r & 1:\n                r -= 1\n                res += self.t[r]\n            l //= 2\n            r //= 2\n        return res\n` },
    { id: 'seg-min', title: 'Range minimum', prompt: "Write `range_min(nums, queries)`, where each query is `(l, r)` inclusive. Return the minimums. Any correct method passes, though try building a min segment tree.", starter: `def range_min(nums, queries):\n    # your code here\n    pass\n`, tests: [['range_min([5, 2, 8, 1, 9], [(0, 2), (2, 4), (3, 3)])', '[2, 1, 1]'], ['range_min([7], [(0, 0)])', '[7]'], ['range_min([1, 2], [])', '[]']], hint: "Same structure as the sum tree, but combine using `min`.", solution: `def range_min(nums, queries):\n    n = len(nums)\n    t = [float("inf")] * n + nums\n    for i in range(n - 1, 0, -1):\n        t[i] = min(t[2 * i], t[2 * i + 1])\n    out = []\n    for l, r in queries:\n        res = float("inf")\n        l += n\n        r += n + 1\n        while l < r:\n            if l & 1:\n                res = min(res, t[l])\n                l += 1\n            if r & 1:\n                r -= 1\n                res = min(res, t[r])\n            l //= 2\n            r //= 2\n        out.append(res)\n    return out\n` },
  ],
  homework: ["Draw the tree for `[2, 4, 1, 3]` and work out the query for index 1 to 3 by hand.", "Change the sum tree to a max tree.", "Read about Fenwick trees and write one for prefix sums."],
  reallife: [
    { q: "A live sales dashboard shows totals for any date range as sales keep coming. Why a segment tree?", a: "Each new sale is a point update, and each dashboard request is a range query. Both are O(log n), whereas prefix sums would slow down on updates." },
    { q: "A game tracks the lowest health among any stretch of players. Which variant works?", a: "A min segment tree, where each node stores the minimum of its range." },
  ],
  leetcode: [[303, 'Range Sum Query - Immutable', 'range-sum-query-immutable', 'Easy'], [307, 'Range Sum Query - Mutable', 'range-sum-query-mutable', 'Medium'], [729, 'My Calendar I', 'my-calendar-i', 'Medium'], [1094, 'Car Pooling', 'car-pooling', 'Medium']],
});

T({
  id: 'bit-manipulation', stage: 's10', title: 'Bit manipulation', tagline: 'Tricks with the 0s and 1s inside numbers.', mins: 25,
  analogy: "A row of light switches. Each switch is one bit. AND, OR and XOR are rules for combining two rows of switches at once, in a single instant.",
  learn: [
    "Integers are stored in binary, and each position is a power of 2. So 13 is `1101`, which is 8 + 4 + 1. Python's `bin(13)` shows it.",
    "`&` (AND) keeps bits on in both. `|` (OR) keeps bits on in either. `^` (XOR) keeps bits that differ. `<<` shifts left, doubling, and `>>` shifts right, halving.",
    "XOR is the star. `x ^ x = 0` and `x ^ 0 = x`, so XOR-ing a whole list cancels every pair and leaves only the single unpaired number. That finds it in O(n) time and O(1) space.",
    "Useful tricks: `x & 1` tests odd. `x & (x - 1)` clears the lowest set bit, so it's 0 exactly when x is a power of 2. `1 << i` makes a mask for bit i, and masks can represent subsets of a small set.",
  ],
  keys: ["XOR cancels pairs", "`x & 1` tests odd or even", "`x & (x - 1)` clears the lowest 1", "A number can represent a subset"],
  anims: ['bits-ops'],
  code: [{ title: 'Everyday tricks', src: `print(bin(13))              # 0b1101
print(13 & 1)               # 1, so it's odd
print(5 ^ 3 ^ 5)            # 3, as the fives cancel

def count_ones(x):
    n = 0
    while x:
        x &= x - 1          # remove the lowest 1
        n += 1
    return n

print(count_ones(13))       # 3

items = ["a", "b", "c"]
for mask in range(1 << len(items)):   # all subsets
    print([items[i] for i in range(3) if mask >> i & 1])` }],
  quiz: [
    { q: "What's `6 & 3`?", o: ["2", "1", "7", "5"], a: 0, why: "110 & 011 = 010, which is 2." },
    { q: "What's `5 ^ 5`?", o: ["5", "10", "0", "1"], a: 2, why: "A number XOR itself is always 0." },
    { q: "What's `1 << 3`?", o: ["3", "4", "6", "8"], a: 3, why: "Shifting left 3 places multiplies by 2³." },
    { q: "`x & (x - 1) == 0` for positive x means:", o: ["x is even", "x is a power of 2", "x is odd", "x is 0"], a: 1, why: "Powers of 2 have exactly one set bit, and it gets cleared." },
  ],
  coding: [
    { id: 'single', title: 'Single number', prompt: "Every number appears twice except one. Write `single(nums)` in O(n) time and O(1) space.", starter: `def single(nums):\n    # your code here\n    pass\n`, tests: [['single([2, 2, 1])', '1'], ['single([4, 1, 2, 1, 2])', '4'], ['single([1])', '1']], hint: "XOR everything together.", solution: `def single(nums):\n    res = 0\n    for x in nums:\n        res ^= x\n    return res\n` },
    { id: 'pow2', title: 'Power of two and counting bits', prompt: "Write `bits_info(x)` for positive x, returning a tuple `(count_of_ones, is_power_of_two)`.", starter: `def bits_info(x):\n    # your code here\n    pass\n`, tests: [['bits_info(13)', '(3, False)'], ['bits_info(16)', '(1, True)'], ['bits_info(1)', '(1, True)']], hint: "`x & (x - 1)` removes the lowest 1 bit. Use it in a loop to count.", solution: `def bits_info(x):\n    power = x & (x - 1) == 0\n    count = 0\n    while x:\n        x &= x - 1\n        count += 1\n    return (count, power)\n` },
  ],
  homework: ["Convert 25 to binary by hand, and check with `bin(25)`.", "Swap two variables using only XOR, and work out why it works.", "Generate all subsets of a 4-item list with bitmasks."],
  reallife: [
    { q: "Linux file permissions like `rwx` are stored in 3 bits. How do you check if the write bit is on?", a: "Use `perm & 0b010`. A non-zero result means it's on. Bits store many yes-or-no flags in a single number." },
    { q: "A game stores which of 32 achievements a player has. Why might one integer be enough?", a: "Each bit is one achievement. Set a bit with `| (1 << i)`, and check it with `& (1 << i)`." },
  ],
  leetcode: [[136, 'Single Number', 'single-number', 'Easy'], [191, 'Number of 1 Bits', 'number-of-1-bits', 'Easy'], [338, 'Counting Bits', 'counting-bits', 'Easy'], [190, 'Reverse Bits', 'reverse-bits', 'Easy'], [137, 'Single Number II', 'single-number-ii', 'Medium'], [371, 'Sum of Two Integers', 'sum-of-two-integers', 'Medium']],
});
