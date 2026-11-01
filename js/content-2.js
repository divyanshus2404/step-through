/* Curriculum part 2: sorting, searching, linked lists, stacks, queues, hashing */
const LL_SETUP = `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def build(values):
    head = None
    for v in reversed(values):
        head = ListNode(v, head)
    return head

def to_list(node):
    out = []
    while node:
        out.append(node.val)
        node = node.next
    return out
`;

T({
  id: 'basic-sorts', stage: 's4', title: 'Bubble, selection and insertion sort', tagline: 'Three simple sorts, and what they teach you.', mins: 30,
  analogy: "Sorting playing cards in your hand. Insertion sort is how most people naturally do it: take one card and slide it left to where it belongs.",
  learn: [
    "**Bubble sort** compares neighbours and swaps them when out of order. The largest item reaches the end on each pass. With an early stop, a sorted list takes just one pass.",
    "**Selection sort** finds the smallest remaining value and moves it to the front. It makes few swaps, but always does O(n²) comparisons.",
    "**Insertion sort** grows a sorted part on the left, sliding each new item into position. On nearly sorted data it's almost O(n), so real libraries, including Python's Timsort, use it for small pieces.",
    "A sort is **stable** if equal items keep their original order. Bubble and insertion are stable, while selection usually isn't. It matters when sorting records by several fields.",
    "In real code, use `sorted()` or `list.sort()`, which are O(n log n). Learn these three because they teach you how to reason about invariants: what stays true after each pass.",
  ],
  keys: ["All three are O(n²) at worst", "Insertion sort is great on nearly sorted data", "Stable sorts preserve the order of ties", "Use `sorted()` in real code"],
  cost: [['Bubble sort', 'O(n²), O(n) best'], ['Selection sort', 'O(n²) always'], ['Insertion sort', 'O(n²), O(n) best'], ['Extra space (all three)', 'O(1)']],
  anims: ['sort-bubble', 'sort-selection', 'sort-insertion'],
  code: [{ title: "Python's built-in sorting", src: `nums = [5, 2, 9]
print(sorted(nums))            # new list
nums.sort(reverse=True)        # in place
print(nums)

people = [("asha", 30), ("ben", 25), ("cal", 30)]
people.sort(key=lambda p: p[1])    # sort by age
print(people)  # stable: asha stays before cal` }],
  quiz: [
    { q: "After one full pass of bubble sort, what's certain?", o: ["The smallest is first", "The largest is last", "It's fully sorted", "Nothing"], a: 1, why: "The largest value gets carried along until it reaches the end." },
    { q: "Which sort is fastest on an almost sorted list?", o: ["Selection", "Insertion", "They're equal", "None"], a: 1, why: "Each item only slides a little, giving nearly O(n)." },
    { q: "What does stable mean?", o: ["Never crashes", "Equal items keep their original order", "Uses no memory", "Always O(n log n)"], a: 1, why: "Stability is about how ties are ordered." },
    { q: "Which always performs O(n²) comparisons, even on sorted input?", o: ["Bubble with early stop", "Insertion", "Selection", "Merge"], a: 2, why: "It still scans the rest for the minimum every time." },
  ],
  coding: [
    { id: 'insertion', title: 'Write insertion sort', prompt: "Write `insertion_sort(a)` that sorts the list in place and returns it. Don't use `sort` or `sorted`.", starter: `def insertion_sort(a):\n    # your code here\n    return a\n`, tests: [['insertion_sort([5, 2, 4, 6, 1, 3])', '[1, 2, 3, 4, 5, 6]'], ['insertion_sort([])', '[]'], ['insertion_sort([2, 1])', '[1, 2]'], ['insertion_sort([3, 3, 1])', '[1, 3, 3]']], hint: "Save `key = a[i]`. Shift larger items right, then drop `key` into the gap.", solution: `def insertion_sort(a):\n    for i in range(1, len(a)):\n        key = a[i]\n        j = i - 1\n        while j >= 0 and a[j] > key:\n            a[j + 1] = a[j]\n            j -= 1\n        a[j + 1] = key\n    return a\n` },
    { id: 'colors', title: 'Sort 0s, 1s and 2s', prompt: "A list contains only 0, 1 and 2. Write `sort_colors(nums)` that sorts it in O(n) by counting, without calling a sort function, and returns it.", starter: `def sort_colors(nums):\n    # your code here\n    return nums\n`, tests: [['sort_colors([2, 0, 2, 1, 1, 0])', '[0, 0, 1, 1, 2, 2]'], ['sort_colors([1])', '[1]'], ['sort_colors([])', '[]']], hint: "Count each value, then write them back in order.", solution: `def sort_colors(nums):\n    counts = [0, 0, 0]\n    for x in nums:\n        counts[x] += 1\n    i = 0\n    for value in range(3):\n        for _ in range(counts[value]):\n            nums[i] = value\n            i += 1\n    return nums\n` },
  ],
  homework: ["Write bubble sort and selection sort from memory, testing each on a reversed list.", "Count comparisons in all three sorts on a sorted list, a reversed list, and a random list.", "Sort a list of words by length, then alphabetically for ties, using `key=`."],
  reallife: [
    { q: "A teacher sorts exam papers as students hand them in, one by one. Which sort is that?", a: "Insertion sort. Each new paper goes into its place in the already sorted pile." },
    { q: "An online shop sorts by price and wants same-priced items to stay in rating order. Which property matters?", a: "Stability. Sort by rating first and then, with a stable sort, by price." },
  ],
  leetcode: [[912, 'Sort an Array', 'sort-an-array', 'Medium'], [75, 'Sort Colors', 'sort-colors', 'Medium'], [88, 'Merge Sorted Array', 'merge-sorted-array', 'Easy'], [1051, 'Height Checker', 'height-checker', 'Easy']],
});

T({
  id: 'merge-sort', stage: 's4', title: 'Merge sort', tagline: 'Divide in half, sort each half, merge them.', mins: 25,
  analogy: "Two friends each sort half a deck of cards. To combine them, look at the top card of each pile and always take the smaller one.",
  learn: [
    "Merge sort is the classic **divide and conquer** algorithm. Divide the list in half, sort each half recursively, then merge the two sorted halves.",
    "The clever bit is the merge. Because each half is sorted, the smallest remaining item must be at the front of one of them. Compare the two fronts, take the smaller, and repeat. This takes O(n).",
    "Halving gives about log n levels, and every level does n work in merging. So the total is O(n log n), guaranteed, whatever the input looks like.",
    "The downside is O(n) extra memory for merging. The upside is that it's stable and reliable. The same merge step solves problems like merging sorted lists and counting inversions.",
  ],
  keys: ["Divide, conquer, combine", "Merge takes O(n) using two pointers", "Always O(n log n)", "Stable, but uses O(n) extra space"],
  cost: [['Time (all cases)', 'O(n log n)'], ['Extra space', 'O(n)'], ['Stable', 'Yes']],
  anims: ['sort-merge'],
  code: [{ title: 'Using merge for another job', src: `def merge(x, y):
    out, i, j = [], 0, 0
    while i < len(x) and j < len(y):
        if x[i] <= y[j]:
            out.append(x[i]); i += 1
        else:
            out.append(y[j]); j += 1
    return out + x[i:] + y[j:]

print(merge([1, 4, 7], [2, 3, 9]))  # [1, 2, 3, 4, 7, 9]` }],
  quiz: [
    { q: "What's merge sort's worst-case time?", o: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], a: 1, why: "log n levels × n work per level, on every input." },
    { q: "How long does merging two sorted lists with n total items take?", o: ["O(1)", "O(log n)", "O(n)", "O(n²)"], a: 2, why: "Each comparison places one item, so n steps." },
    { q: "Why use `<=` rather than `<` in the merge?", o: ["It's faster", "It keeps the sort stable", "It avoids a crash", "No reason"], a: 1, why: "On a tie, taking from the left half keeps equal items in their original order." },
    { q: "What's the main drawback of merge sort?", o: ["O(n²) time", "It isn't stable", "It needs O(n) extra space", "It needs sorted input"], a: 2, why: "Merging writes into a new list." },
  ],
  coding: [
    { id: 'merge-two', title: 'Merge two sorted lists', prompt: "Write `merge(x, y)` that returns one sorted list from two sorted lists, without using `sorted`.", starter: `def merge(x, y):\n    # your code here\n    pass\n`, tests: [['merge([1, 4], [2, 3])', '[1, 2, 3, 4]'], ['merge([], [1])', '[1]'], ['merge([1, 1], [1])', '[1, 1, 1]'], ['merge([], [])', '[]']], hint: "Two pointers. When one list runs out, add the rest of the other.", solution: `def merge(x, y):\n    out, i, j = [], 0, 0\n    while i < len(x) and j < len(y):\n        if x[i] <= y[j]:\n            out.append(x[i])\n            i += 1\n        else:\n            out.append(y[j])\n            j += 1\n    return out + x[i:] + y[j:]\n` },
    { id: 'msort', title: 'Write merge sort', prompt: "Write `merge_sort(a)` that returns a new sorted list. You'll need a merge helper, which you can write inside your answer.", starter: `def merge_sort(a):\n    # your code here\n    pass\n`, tests: [['merge_sort([6, 3, 8, 1])', '[1, 3, 6, 8]'], ['merge_sort([])', '[]'], ['merge_sort([1])', '[1]'], ['merge_sort([2, 2, 1])', '[1, 2, 2]']], hint: "Base case: length ≤ 1. Otherwise split at `len(a) // 2`.", solution: `def merge_sort(a):\n    if len(a) <= 1:\n        return a\n    mid = len(a) // 2\n    x, y = merge_sort(a[:mid]), merge_sort(a[mid:])\n    out, i, j = [], 0, 0\n    while i < len(x) and j < len(y):\n        if x[i] <= y[j]:\n            out.append(x[i])\n            i += 1\n        else:\n            out.append(y[j])\n            j += 1\n    return out + x[i:] + y[j:]\n` },
  ],
  homework: ["Draw the full split and merge tree for `[8, 3, 5, 1, 9, 2]`.", "Count how many item moves merge sort makes for n = 8 and n = 16. Does it fit n log n?", "Extend the merge to count how many times an item from the right half jumps ahead of the left half. This counts inversions."],
  reallife: [
    { q: "Two branches of a bank each send a date-sorted list of transactions. How do you combine them quickly?", a: "Use the merge step: compare the next item from each and take the earlier one. Each item is handled once, so it's O(n)." },
    { q: "Your data is too large for memory and lives on disk. Why is merge sort a good fit?", a: "Sort chunks that fit in memory, then merge the sorted chunks by reading each one in order. This is called external sorting." },
  ],
  leetcode: [[21, 'Merge Two Sorted Lists', 'merge-two-sorted-lists', 'Easy'], [88, 'Merge Sorted Array', 'merge-sorted-array', 'Easy'], [912, 'Sort an Array', 'sort-an-array', 'Medium'], [148, 'Sort List', 'sort-list', 'Medium']],
});

T({
  id: 'quick-sort', stage: 's4', title: 'Quick sort', tagline: 'Put one value in its final place, then repeat on each side.', mins: 25,
  analogy: "A PE teacher picks one student and says: shorter than this student to the left, taller to the right. That student is now correctly placed. Repeat with each group.",
  learn: [
    "Quick sort picks a **pivot** and rearranges so that smaller items are on its left and larger on its right. This step is called partitioning. Now the pivot is in its final position, and each side can be sorted on its own.",
    "On average each partition splits the list fairly well, giving log n levels and O(n log n). It sorts in place, using only O(log n) stack space on average, and is very fast in practice.",
    "The danger: if the pivot is always the smallest or largest, one side stays almost full and the time becomes O(n²). Picking a **random** pivot makes that very unlikely.",
    "Partitioning alone is useful. To find the k-th largest value, you only need to recurse into the side containing position k. This is called **quickselect**, and it averages O(n).",
  ],
  keys: ["Partitioning finalises the pivot", "Average O(n log n), worst O(n²)", "Random pivots avoid the worst case", "Quickselect finds the k-th item in O(n) on average"],
  cost: [['Average time', 'O(n log n)'], ['Worst time', 'O(n²)'], ['Extra space', 'O(log n) stack'], ['Stable', 'No']],
  anims: ['sort-quick'],
  code: [{ title: 'Quickselect: k-th smallest', src: `import random

def kth_smallest(a, k):
    pivot = random.choice(a)
    small = [x for x in a if x < pivot]
    equal = [x for x in a if x == pivot]
    large = [x for x in a if x > pivot]
    if k <= len(small):
        return kth_smallest(small, k)
    if k <= len(small) + len(equal):
        return pivot
    return kth_smallest(large, k - len(small) - len(equal))

print(kth_smallest([7, 2, 9, 4], 2))  # 4` }],
  quiz: [
    { q: "After one partition, what's guaranteed?", o: ["The list is sorted", "The pivot is in its final place", "The left half is sorted", "The largest is first"], a: 1, why: "All smaller items are left and all larger items are right, so the pivot's position is final." },
    { q: "When does quick sort hit O(n²)?", o: ["Random data", "Pivots that always split badly", "Short lists", "Duplicate-free lists"], a: 1, why: "Very uneven splits lead to n levels." },
    { q: "What's the main advantage over merge sort?", o: ["Guaranteed O(n log n)", "Stable", "Sorts in place with little memory", "Simpler merge"], a: 2, why: "It needs no second list, just stack space." },
    { q: "How can you protect against bad pivots?", o: ["Pick a random pivot", "Sort first", "Use bigger lists", "Pick index 0"], a: 0, why: "Randomness makes consistently bad splits extremely unlikely." },
  ],
  coding: [
    { id: 'partition', title: 'Partition around a pivot', prompt: "Write `partition(a)` that uses the last element as the pivot, rearranges the list in place, and returns the pivot's final index. Smaller values go left of it.", starter: `def partition(a):\n    # your code here\n    pass\n`, tests: [['partition([3, 1, 2])', '1'], ['partition([1, 2, 3])', '2'], ['partition([3, 2, 1])', '0'], ['partition([5])', '0'], ['(lambda x: (partition(x), x[2]))([7, 2, 9, 4, 5])', '(2, 5)']], hint: "Keep a `store` index. Swap every smaller item to `store`. Finally swap the pivot to `store`.", solution: `def partition(a):\n    hi = len(a) - 1\n    pivot = a[hi]\n    store = 0\n    for j in range(hi):\n        if a[j] < pivot:\n            a[j], a[store] = a[store], a[j]\n            store += 1\n    a[store], a[hi] = a[hi], a[store]\n    return store\n` },
    { id: 'kth', title: 'K-th largest', prompt: "Write `kth_largest(nums, k)` using quickselect or any method you like. `k = 1` means the largest.", starter: `def kth_largest(nums, k):\n    # your code here\n    pass\n`, tests: [['kth_largest([3, 2, 1, 5, 6, 4], 2)', '5'], ['kth_largest([1], 1)', '1'], ['kth_largest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4)', '4']], hint: "The k-th largest is the (n − k + 1)-th smallest. Sorting first works too, at O(n log n).", solution: `import random\n\ndef kth_largest(nums, k):\n    pivot = random.choice(nums)\n    large = [x for x in nums if x > pivot]\n    equal = [x for x in nums if x == pivot]\n    small = [x for x in nums if x < pivot]\n    if k <= len(large):\n        return kth_largest(large, k)\n    if k <= len(large) + len(equal):\n        return pivot\n    return kth_largest(small, k - len(large) - len(equal))\n` },
  ],
  homework: ["Run the animation on a sorted list and count comparisons. Then shuffle and compare.", "Rewrite quick sort so it chooses a random pivot.", "Compare merge sort and quick sort: when would you pick each?"],
  reallife: [
    { q: "A leaderboard needs only the top 10 of a million scores. Why not sort everything?", a: "Sorting does extra work. Quickselect finds the top group in about O(n), or a heap can do it in O(n log 10)." },
    { q: "Why do many languages avoid plain quick sort when attackers can choose the input?", a: "An attacker could craft input that triggers O(n²). Libraries use random pivots or hybrid sorts to prevent this." },
  ],
  leetcode: [[215, 'Kth Largest Element in an Array', 'kth-largest-element-in-an-array', 'Medium'], [912, 'Sort an Array', 'sort-an-array', 'Medium'], [75, 'Sort Colors', 'sort-colors', 'Medium'], [347, 'Top K Frequent Elements', 'top-k-frequent-elements', 'Medium']],
});

T({
  id: 'binary-search', stage: 's4', title: 'Binary search', tagline: 'Rule out half the list with every check.', mins: 25,
  analogy: "Guess a number between 1 and 100 while being told higher or lower. Guess 50, then 75, then 62. You'll win in at most 7 guesses.",
  learn: [
    "Binary search works on **sorted** data. Look at the middle. If it isn't the target, the sorted order tells you which half can't contain it, so half the list is gone in one comparison.",
    "A million items take about 20 checks, and a billion take about 30. That's O(log n).",
    "Most bugs come from the boundaries. A clean approach is to decide what `lo` and `hi` mean and keep that promise. In the basic version, the answer is always inside `lo..hi` inclusive, so the loop is `while lo <= hi`.",
    "To find the **first** position with a value, keep going left even after a match. This is called the lower bound, and it's what Python's `bisect_left` does.",
  ],
  keys: ["The data has to be sorted", "O(log n): a million items take 20 checks", "Decide exactly what lo and hi mean", "Python has `bisect` built in"],
  anims: ['bs-basic', 'bs-first'],
  code: [{ title: 'bisect saves you writing it', src: `from bisect import bisect_left, bisect_right, insort

a = [1, 3, 3, 3, 5]
print(bisect_left(a, 3))   # 1, the first 3
print(bisect_right(a, 3))  # 4, just past the last 3
print(bisect_right(a, 3) - bisect_left(a, 3))  # 3 copies

insort(a, 4)               # insert and keep sorted
print(a)` }],
  quiz: [
    { q: "How many checks at most for 1,000 sorted items?", o: ["10", "100", "500", "1000"], a: 0, why: "2¹⁰ = 1024, so about 10 halvings." },
    { q: "What does binary search need?", o: ["Unique values", "Sorted data", "Even length", "Positive values"], a: 1, why: "It relies on order to discard half." },
    { q: "`a[mid] < target`. What's next, in the basic version?", o: ["hi = mid - 1", "lo = mid + 1", "lo = mid", "Return mid"], a: 1, why: "`mid` and everything to its left are too small." },
    { q: "What does `bisect_left(a, x)` return?", o: ["The last index of x", "The first index where x could go", "True or False", "The count of x"], a: 1, why: "It gives the leftmost position at which x could be inserted while keeping order." },
  ],
  coding: [
    { id: 'bsearch', title: 'Binary search', prompt: "Write `search(a, target)` that returns the target's index in sorted list `a`, or -1. Don't use `bisect` or `index`.", starter: `def search(a, target):\n    # your code here\n    pass\n`, tests: [['search([-1, 0, 3, 5, 9, 12], 9)', '4'], ['search([-1, 0, 3, 5, 9, 12], 2)', '-1'], ['search([], 1)', '-1'], ['search([5], 5)', '0']], hint: "`while lo <= hi` with `mid = (lo + hi) // 2`.", solution: `def search(a, target):\n    lo, hi = 0, len(a) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if a[mid] == target:\n            return mid\n        if a[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1\n` },
    { id: 'insert-pos', title: 'Search insert position', prompt: "Write `insert_pos(a, target)` returning the index of target if present, otherwise where it would be inserted. It must be O(log n).", starter: `def insert_pos(a, target):\n    # your code here\n    pass\n`, tests: [['insert_pos([1, 3, 5, 6], 5)', '2'], ['insert_pos([1, 3, 5, 6], 2)', '1'], ['insert_pos([1, 3, 5, 6], 7)', '4'], ['insert_pos([], 3)', '0']], hint: "This is exactly the lower bound. `hi` starts at `len(a)`.", solution: `def insert_pos(a, target):\n    lo, hi = 0, len(a)\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if a[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid\n    return lo\n` },
  ],
  homework: ["Find the first and last position of a value in a sorted list, using two searches.", "Write the `while lo <= hi` and `while lo < hi` versions, and explain when each stops.", "Search a rotated sorted list like `[4, 5, 6, 1, 2, 3]`. Hint: one half is always sorted."],
  reallife: [
    { q: "A bug appeared in one of the last 1,000 code versions. How many versions must you test?", a: "About 10. Test the middle version and halve the range each time. `git bisect` does exactly this." },
    { q: "How do you find the word 'ocean' in a printed dictionary quickly?", a: "Open near the middle, see if the page comes before or after, and repeat on the correct half." },
  ],
  leetcode: [[704, 'Binary Search', 'binary-search', 'Easy'], [35, 'Search Insert Position', 'search-insert-position', 'Easy'], [278, 'First Bad Version', 'first-bad-version', 'Easy'], [34, 'Find First and Last Position of Element in Sorted Array', 'find-first-and-last-position-of-element-in-sorted-array', 'Medium'], [33, 'Search in Rotated Sorted Array', 'search-in-rotated-sorted-array', 'Medium']],
});

T({
  id: 'bs-answer', stage: 's4', title: 'Binary search on the answer', tagline: 'Search possible answers when there is no list to search.', mins: 25,
  analogy: "Finding the right oven temperature: too cold and the cake doesn't cook, hot enough and it does. You can test the middle temperature and rule out a whole range each time.",
  learn: [
    "Sometimes there's no sorted list, but the **answers** themselves have an order. If answer x works, then every larger answer also works (or vice versa). Plotting that gives No, No, No, Yes, Yes, Yes, and you need the first Yes.",
    "The recipe has three steps. First, set the range of possible answers. Second, write a check function: can it be done with this value? Third, binary search for the first value where the check passes.",
    "Key phrases that hint at this technique: **minimum possible maximum**, **smallest speed**, **least capacity**, **as small as possible such that**.",
    "Total time is O(check cost × log range). The range may be huge, and yet log keeps it small: a range of a billion takes only 30 checks.",
  ],
  keys: ["Answers form No… then Yes…", "Write a check function first", "Search for the boundary", "Works even over huge ranges"],
  anims: ['bs-answer'],
  code: [{ title: 'Template', src: `def first_true(lo, hi, check):
    while lo < hi:
        mid = (lo + hi) // 2
        if check(mid):
            hi = mid        # mid works, maybe smaller also works
        else:
            lo = mid + 1    # mid fails, so go larger
    return lo

# Smallest number whose square is at least 50
print(first_true(0, 50, lambda x: x * x >= 50))  # 8` }],
  quiz: [
    { q: "What must be true to use binary search on the answer?", o: ["The input is sorted", "If x works, all larger x also work (or the reverse)", "All values are distinct", "The answer is even"], a: 1, why: "This one-way pattern is what allows halving." },
    { q: "A range of 1 to 1,000,000,000 needs about how many checks?", o: ["10", "30", "1,000", "1,000,000"], a: 1, why: "log₂ of a billion is about 30." },
    { q: "If `check(mid)` is True and we want the smallest working value, what's next?", o: ["hi = mid", "lo = mid", "lo = mid + 1", "Return mid"], a: 0, why: "`mid` might be the answer, so keep it while looking left." },
    { q: "Which question suits this method?", o: ["Reverse a list", "The smallest ship capacity to deliver all packages in D days", "Count the vowels", "Is this a palindrome?"], a: 1, why: "It asks for the smallest value that passes a yes-or-no test." },
  ],
  coding: [
    { id: 'isqrt', title: 'Integer square root', prompt: "Write `isqrt(x)` returning the largest whole number `r` where `r * r <= x`. Don't use `math.sqrt`.", starter: `def isqrt(x):\n    # your code here\n    pass\n`, tests: [['isqrt(8)', '2'], ['isqrt(16)', '4'], ['isqrt(0)', '0'], ['isqrt(1)', '1'], ['isqrt(2147395600)', '46340']], hint: "Search for the first r where `r * r > x`, then subtract 1.", solution: `def isqrt(x):\n    lo, hi = 0, x + 1\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if mid * mid > x:\n            hi = mid\n        else:\n            lo = mid + 1\n    return lo - 1\n` },
    { id: 'koko', title: 'Koko eating bananas', prompt: "Write `min_speed(piles, h)`: the smallest eating speed `k` such that all piles are finished within `h` hours. Each hour she eats from one pile, up to `k` bananas.", starter: `def min_speed(piles, h):\n    # your code here\n    pass\n`, tests: [['min_speed([3, 6, 7, 11], 8)', '4'], ['min_speed([30, 11, 23, 4, 20], 5)', '30'], ['min_speed([30, 11, 23, 4, 20], 6)', '23']], hint: "Range is 1 to `max(piles)`. A pile takes `(p + k - 1) // k` hours.", solution: `def min_speed(piles, h):\n    lo, hi = 1, max(piles)\n    while lo < hi:\n        mid = (lo + hi) // 2\n        hours = sum((p + mid - 1) // mid for p in piles)\n        if hours <= h:\n            hi = mid\n        else:\n            lo = mid + 1\n    return lo\n` },
  ],
  homework: ["Solve Capacity To Ship Packages using the same three-step recipe.", "Write down the No/Yes pattern for three values of Koko's speed by hand.", "Change the template to find the last True instead of the first True."],
  reallife: [
    { q: "A delivery company wants the smallest truck that completes all orders within 5 days. How does binary search help?", a: "Try a middle truck size and simulate. If it can finish, try smaller. If not, try larger. Only about 30 simulations are needed, even for a huge range." },
    { q: "A cloud engineer needs the fewest servers that keep response times under 200 ms. What's the check function?", a: "Run a load test with x servers and see if response time is under 200 ms. More servers will never make that worse, which is the one-way pattern required." },
  ],
  leetcode: [[69, 'Sqrt(x)', 'sqrtx', 'Easy'], [875, 'Koko Eating Bananas', 'koko-eating-bananas', 'Medium'], [1011, 'Capacity To Ship Packages Within D Days', 'capacity-to-ship-packages-within-d-days', 'Medium'], [162, 'Find Peak Element', 'find-peak-element', 'Medium']],
});

T({
  id: 'linked-list', stage: 's5', title: 'Linked lists', tagline: 'Nodes joined by pointers rather than side-by-side slots.', mins: 30,
  analogy: "A treasure hunt. Each clue tells you only where the next clue is. To reach clue 5, you must follow clues 1 to 4. But adding a new clue only means changing where one clue points.",
  learn: [
    "A linked list is a chain of **nodes**. Each node holds a value and a reference to the next node. The list is known by its first node, called the `head`. The last node points to `None`.",
    "Since nodes don't touch in memory, there's no instant `arr[i]`. Reaching position i means walking from the head, which is O(n).",
    "The reward: if you already hold a node, you can insert or delete right after it in O(1), just by changing arrows. Nothing has to shift.",
    "Order matters when re-pointing. Connect the new node to the rest **before** cutting the old link, or the rest of the list is lost.",
    "A **dummy node** placed before the head removes special cases when the head itself might change. You'll see this everywhere.",
  ],
  keys: ["Access is O(n), no indexing", "Insert or delete after a known node is O(1)", "Connect new before cutting old", "A dummy head avoids special cases"],
  cost: [['Access by position', 'O(n)'], ['Insert or delete at head', 'O(1)'], ['Insert after known node', 'O(1)'], ['Search', 'O(n)']],
  anims: ['ll-ops'],
  code: [{ title: 'A dummy node simplifies deletion', src: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def remove_all(head, target):
    dummy = ListNode(0, head)
    cur = dummy
    while cur.next:
        if cur.next.val == target:
            cur.next = cur.next.next
        else:
            cur = cur.next
    return dummy.next` }],
  quiz: [
    { q: "What's the cost of reading the 500th node in a linked list?", o: ["O(1)", "O(log n)", "O(n)", "O(n²)"], a: 2, why: "You have to follow 500 arrows from the head." },
    { q: "You insert after a node. Which line comes first?", o: ["node.next = new", "new.next = node.next", "del node", "Either"], a: 1, why: "Connect the new node to the rest first. Otherwise the reference to the rest is lost." },
    { q: "What does a dummy node help with?", o: ["Speed", "Cases where the head might change", "Memory", "Sorting"], a: 1, why: "Every real node then has a node before it, so one rule handles everything." },
    { q: "How do you know you've reached the end?", o: ["The value is 0", "next is None", "Length runs out", "It loops"], a: 1, why: "The last node's `next` is `None`." },
  ],
  coding: [
    { id: 'll-length', title: 'List length', prompt: "A `ListNode` class exists with `.val` and `.next`, and `build([...])` makes a list. Write `length(head)` returning how many nodes there are.", setup: LL_SETUP, starter: `def length(head):\n    # your code here\n    pass\n`, tests: [['length(build([1, 2, 3]))', '3'], ['length(build([]))', '0'], ['length(build([9]))', '1']], hint: "Walk with `while head:` and count.", solution: `def length(head):\n    count = 0\n    while head:\n        count += 1\n        head = head.next\n    return count\n` },
    { id: 'll-remove', title: 'Remove all matching values', prompt: "Write `remove_all(head, target)` that removes every node with value `target` and returns the new head. `ListNode`, `build` and `to_list` already exist.", setup: LL_SETUP, starter: `def remove_all(head, target):\n    # your code here\n    pass\n`, tests: [['to_list(remove_all(build([1, 2, 6, 3, 6]), 6))', '[1, 2, 3]'], ['to_list(remove_all(build([7, 7]), 7))', '[]'], ['to_list(remove_all(build([]), 1))', '[]']], hint: "`dummy = ListNode(0, head)`, then look ahead at `cur.next.val`.", solution: `def remove_all(head, target):\n    dummy = ListNode(0, head)\n    cur = dummy\n    while cur.next:\n        if cur.next.val == target:\n            cur.next = cur.next.next\n        else:\n            cur = cur.next\n    return dummy.next\n` },
  ],
  homework: ["Write a small `ListNode` class and print a list of 5 values by walking it.", "Write `insert_at_head` and `insert_at_tail`. Compare their time complexity.", "Draw three boxes and arrows on paper, then re-draw them after deleting the middle node."],
  reallife: [
    { q: "A music player's playlist has next and previous buttons. Why is a linked list a natural fit?", a: "Each song knows the next one, and you can insert or remove a track without moving the rest." },
    { q: "How does browser history moving back and forward relate?", a: "Each page keeps references to its neighbours, like a doubly linked list where every node has `next` and `prev`." },
  ],
  leetcode: [[203, 'Remove Linked List Elements', 'remove-linked-list-elements', 'Easy'], [83, 'Remove Duplicates from Sorted List', 'remove-duplicates-from-sorted-list', 'Easy'], [707, 'Design Linked List', 'design-linked-list', 'Medium'], [19, 'Remove Nth Node From End of List', 'remove-nth-node-from-end-of-list', 'Medium']],
});

T({
  id: 'list-techniques', stage: 's5', title: 'Linked list techniques', tagline: 'Reversal, plus fast and slow pointers.', mins: 30,
  analogy: "Two runners on a track, one running twice as fast as the other. If the track is a straight line, the fast one finishes. If it loops, the fast one will laugh and lap the slow one.",
  learn: [
    "**Reversal** uses three pointers: `prev`, `cur` and `nxt`. Save the next node, flip the arrow, and step forward. It's so common that it's worth writing from memory.",
    "**Fast and slow** pointers move at different speeds. When fast reaches the end, slow is at the middle. No need to know the length first.",
    "**Cycle detection**: if there's a loop, fast must eventually land on slow, because the gap between them shrinks by one each round. If fast reaches `None`, there's no loop. This is Floyd's tortoise and hare, using O(1) memory.",
    "**Gap pointers**: to find the n-th node from the end, move one pointer n steps ahead, then move both together until the first reaches the end.",
  ],
  keys: ["Save next, flip, step", "Fast and slow finds the middle", "Fast meets slow only if there's a cycle", "A fixed gap finds n-th from the end"],
  anims: ['ll-reverse', 'll-floyd'],
  code: [{ title: 'Find the middle', src: `def middle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow

# Fast moves twice as far, so when fast
# reaches the end, slow is halfway.` }],
  quiz: [
    { q: "What must you save before flipping an arrow?", o: ["prev", "cur.next", "head", "The length"], a: 1, why: "Flipping overwrites `cur.next`, so save it or lose the rest of the list." },
    { q: "Which pointer is the new head after reversal?", o: ["cur", "nxt", "prev", "head"], a: 2, why: "`cur` ends at `None`, and `prev` is the last real node." },
    { q: "In Floyd's algorithm, why do the pointers meet in a cycle?", o: ["Luck", "The gap closes by 1 each round", "Fast waits for slow", "They start apart"], a: 1, why: "Fast gains exactly one node per round, so it cannot jump over slow forever." },
    { q: "What's the extra space for cycle detection with fast and slow?", o: ["O(1)", "O(n)", "O(log n)", "O(n²)"], a: 0, why: "It uses just two pointers, compared with O(n) for a set of seen nodes." },
  ],
  coding: [
    { id: 'll-rev', title: 'Reverse a list', prompt: "Write `reverse(head)` that returns the new head. `ListNode`, `build` and `to_list` already exist.", setup: LL_SETUP, starter: `def reverse(head):\n    # your code here\n    pass\n`, tests: [['to_list(reverse(build([1, 2, 3])))', '[3, 2, 1]'], ['to_list(reverse(build([])))', '[]'], ['to_list(reverse(build([5])))', '[5]']], hint: "`prev = None`, then `nxt = cur.next; cur.next = prev; prev = cur; cur = nxt`.", solution: `def reverse(head):\n    prev = None\n    cur = head\n    while cur:\n        nxt = cur.next\n        cur.next = prev\n        prev = cur\n        cur = nxt\n    return prev\n` },
    { id: 'll-mid', title: 'Middle node value', prompt: "Write `middle_value(head)` returning the middle node's value. With two middles, return the second.", setup: LL_SETUP, starter: `def middle_value(head):\n    # your code here\n    pass\n`, tests: [['middle_value(build([1, 2, 3, 4, 5]))', '3'], ['middle_value(build([1, 2, 3, 4]))', '3'], ['middle_value(build([7]))', '7']], hint: "Fast moves two nodes per round, slow moves one.", solution: `def middle_value(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n    return slow.val\n` },
    { id: 'll-cycle', title: 'Has a cycle?', prompt: "Write `has_cycle(head)`. The tests use a helper `build_cycle(values, pos)`, which connects the tail to index `pos`.", setup: LL_SETUP + `
def build_cycle(values, pos):
    nodes = [ListNode(v) for v in values]
    for a, b in zip(nodes, nodes[1:]):
        a.next = b
    if pos >= 0:
        nodes[-1].next = nodes[pos]
    return nodes[0]
`, starter: `def has_cycle(head):\n    # your code here\n    pass\n`, tests: [['has_cycle(build_cycle([3, 2, 0, 4], 1))', 'True'], ['has_cycle(build_cycle([1, 2], -1))', 'False'], ['has_cycle(None)', 'False']], hint: "Loop while `fast and fast.next`. Use `is` to compare nodes.", solution: `def has_cycle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow is fast:\n            return True\n    return False\n` },
  ],
  homework: ["Write reversal recursively as well as with a loop.", "Check whether a linked list is a palindrome: find the middle, reverse the second half, compare.", "Find the node where a cycle begins. Look up why resetting slow to the head works."],
  reallife: [
    { q: "A photo slideshow should loop back to the start. How could you detect a broken link that creates a loop by mistake in its chain?", a: "Use fast and slow pointers to walk the chain. If they meet, there's a loop. This uses almost no extra memory." },
    { q: "How does an undo feature relate to reversing links?", a: "Both follow references back to earlier states. A reversal rewrites `next` into `prev`, the same direction undo travels." },
  ],
  leetcode: [[206, 'Reverse Linked List', 'reverse-linked-list', 'Easy'], [876, 'Middle of the Linked List', 'middle-of-the-linked-list', 'Easy'], [141, 'Linked List Cycle', 'linked-list-cycle', 'Easy'], [234, 'Palindrome Linked List', 'palindrome-linked-list', 'Easy'], [142, 'Linked List Cycle II', 'linked-list-cycle-ii', 'Medium'], [143, 'Reorder List', 'reorder-list', 'Medium']],
});

T({
  id: 'stacks', stage: 's5', title: 'Stacks', tagline: 'Last in, first out.', mins: 25,
  analogy: "A pile of plates. You add to the top and take from the top. The plate you put down last is the first one you pick up.",
  learn: [
    "A stack has two main actions: **push** adds to the top, and **pop** removes from the top. Peek looks at the top without removing it. All are O(1).",
    "In Python a plain list is a great stack: `append` to push, `pop()` to pop, and `stack[-1]` to peek. Always check that it isn't empty before popping.",
    "Reach for a stack when the **most recent unfinished thing** has to be handled first: matching brackets, undo, evaluating expressions, and walking back in DFS. The call stack itself is a stack.",
    "Anything you can do with recursion, you can do with a loop and your own stack. This is handy when recursion would be too deep.",
  ],
  keys: ["Push and pop are O(1) at the top", "A list works as a stack", "Use it for nesting and most-recent-first", "Check for empty before popping"],
  anims: ['stack-ops', 'stack-parens'],
  code: [{ title: 'Evaluate reverse Polish notation', src: `def calc(tokens):
    st = []
    for t in tokens:
        if t in "+-*":
            b, a = st.pop(), st.pop()   # order matters
            if t == "+": st.append(a + b)
            elif t == "-": st.append(a - b)
            else: st.append(a * b)
        else:
            st.append(int(t))
    return st[0]

print(calc(["2", "1", "+", "3", "*"]))  # 9` }],
  quiz: [
    { q: "Push 1, push 2, pop, push 3, pop. What's left?", o: ["[1]", "[2]", "[3]", "[1, 3]"], a: 0, why: "After 1, 2: pop removes 2. Push 3, then pop removes 3. Just 1 remains." },
    { q: "What does `[]`.pop() do?", o: ["Returns None", "IndexError", "Returns 0", "Nothing"], a: 1, why: "Popping from an empty list raises `IndexError`, so check first." },
    { q: "In the bracket checker, when is `()[` invalid?", o: ["At the first (", "At the )", "At the end, as [ is still waiting", "It's valid"], a: 2, why: "The stack isn't empty at the end." },
    { q: "Which real feature is a stack?", o: ["A shop queue", "Undo in an editor", "A phone book", "Printing queue"], a: 1, why: "Undo reverses the most recent action first." },
  ],
  coding: [
    { id: 'valid-parens', title: 'Valid parentheses', prompt: "Write `is_valid(s)` for a string of `()[]{}`. Every opener must close in the correct order.", starter: `def is_valid(s):\n    # your code here\n    pass\n`, tests: [['is_valid("()[]{}")', 'True'], ['is_valid("(]")', 'False'], ['is_valid("([)]")', 'False'], ['is_valid("{[]}")', 'True'], ['is_valid("(")', 'False'], ['is_valid(")")', 'False']], hint: "Map each closer to its opener. Check the stack top on each closer.", solution: `def is_valid(s):\n    pairs = {")": "(", "]": "[", "}": "{"}\n    stack = []\n    for ch in s:\n        if ch in pairs:\n            if not stack or stack.pop() != pairs[ch]:\n                return False\n        else:\n            stack.append(ch)\n    return not stack\n` },
    { id: 'backspace', title: 'Backspace strings', prompt: "`#` means backspace. Write `typed(s)` that returns the final text. `typed(\"ab#c\")` gives `\"ac\"`.", starter: `def typed(s):\n    # your code here\n    pass\n`, tests: [['typed("ab#c")', '"ac"'], ['typed("a##b")', '"b"'], ['typed("")', '""'], ['typed("###")', '""']], hint: "Push letters. On `#`, pop if the stack isn't empty.", solution: `def typed(s):\n    st = []\n    for ch in s:\n        if ch == "#":\n            if st:\n                st.pop()\n        else:\n            st.append(ch)\n    return "".join(st)\n` },
  ],
  homework: ["Reverse a string using a stack and explain why it works.", "Design a Min Stack with O(1) `get_min`. Hint: keep a second stack of minimums.", "Convert the recursive factorial from earlier into a loop with an explicit stack."],
  reallife: [
    { q: "How does your browser's back button use a stack?", a: "Each page you visit is pushed. Back pops the current page and returns to the previous one." },
    { q: "How does a code editor spot an unmatched `{`?", a: "It pushes each opener and pops on each closer. A mismatch or a non-empty stack at the end marks the error." },
  ],
  leetcode: [[20, 'Valid Parentheses', 'valid-parentheses', 'Easy'], [844, 'Backspace String Compare', 'backspace-string-compare', 'Easy'], [155, 'Min Stack', 'min-stack', 'Medium'], [150, 'Evaluate Reverse Polish Notation', 'evaluate-reverse-polish-notation', 'Medium'], [394, 'Decode String', 'decode-string', 'Medium']],
});

T({
  id: 'monotonic-stack', stage: 's5', title: 'Monotonic stack', tagline: 'Find the next bigger or smaller value in one pass.', mins: 25,
  analogy: "People standing in a line looking right. You can only see past someone shorter. When a tall person arrives, everyone shorter finally knows who is blocking their view.",
  learn: [
    "A **monotonic stack** keeps its items in increasing or decreasing order. New items pop anything that breaks the order, before going on the stack.",
    "It answers questions like: for each item, what's the next greater item to the right? Each stacked item is waiting for its answer, and the arrival of a bigger value resolves it.",
    "It looks like a nested loop, yet it's O(n) because each index is pushed once and popped once. That's at most 2n stack operations in total.",
    "Usually store **indexes** rather than values, since you often need both the position and the value. Decreasing stacks find next greater, and increasing stacks find next smaller.",
  ],
  keys: ["Keep the stack in sorted order", "A pop means an answer was found", "Each index pushes and pops once, so it's O(n)", "Store indexes on the stack"],
  anims: ['mono-nge'],
  code: [{ title: 'Daily temperatures', src: `def warmer_in(temps):
    ans = [0] * len(temps)
    stack = []                      # indexes of colder days
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            j = stack.pop()
            ans[j] = i - j          # days waited
        stack.append(i)
    return ans

print(warmer_in([73, 74, 75, 71, 69, 72, 76, 73]))
# [1, 1, 4, 2, 1, 1, 0, 0]` }],
  quiz: [
    { q: "Why is a monotonic stack O(n) despite the inner `while`?", o: ["The while runs once", "Each index is popped at most once overall", "Python optimises it", "It isn't"], a: 1, why: "Total pops can't exceed total pushes, which is n." },
    { q: "For next greater, the stack holds values that:", o: ["Increase upward", "Decrease upward", "Are random", "Are all equal"], a: 1, why: "An item stays only while nothing larger has arrived, so the stack decreases." },
    { q: "What does it mean when an item is popped?", o: ["It's deleted from the input", "Its answer was just found", "There's an error", "It's the largest"], a: 1, why: "The current value is the first one to beat it." },
    { q: "What usually gets stored?", o: ["Indexes", "Booleans", "Strings", "Sums"], a: 0, why: "Indexes give you both the position and, through the list, the value." },
  ],
  coding: [
    { id: 'nge', title: 'Next greater element', prompt: "Write `next_greater(nums)` returning a list where each position holds the next larger value to its right, or -1.", starter: `def next_greater(nums):\n    # your code here\n    pass\n`, tests: [['next_greater([2, 7, 3, 5, 4, 8])', '[7, 8, 5, 8, 8, -1]'], ['next_greater([5, 4, 3])', '[-1, -1, -1]'], ['next_greater([])', '[]']], hint: "Start with `ans = [-1] * n`. Pop while the top's value is smaller than the current one.", solution: `def next_greater(nums):\n    ans = [-1] * len(nums)\n    stack = []\n    for i, x in enumerate(nums):\n        while stack and nums[stack[-1]] < x:\n            ans[stack.pop()] = x\n        stack.append(i)\n    return ans\n` },
    { id: 'temps', title: 'Daily temperatures', prompt: "Write `wait_days(temps)`: for each day, how many days until a warmer day? Use 0 if none.", starter: `def wait_days(temps):\n    # your code here\n    pass\n`, tests: [['wait_days([73, 74, 75, 71, 69, 72, 76, 73])', '[1, 1, 4, 2, 1, 1, 0, 0]'], ['wait_days([30, 40, 50])', '[1, 1, 0]'], ['wait_days([50])', '[0]']], hint: "The same pattern as next greater, but store `i - j`.", solution: `def wait_days(temps):\n    ans = [0] * len(temps)\n    stack = []\n    for i, t in enumerate(temps):\n        while stack and temps[stack[-1]] < t:\n            j = stack.pop()\n            ans[j] = i - j\n        stack.append(i)\n    return ans\n` },
  ],
  homework: ["Change the code to find the previous smaller element.", "Trace the stack for `[6, 2, 5, 4, 5, 1]` on paper.", "Read about Largest Rectangle in Histogram and explain the role of the stack."],
  reallife: [
    { q: "A stock app shows, for each day, how many days until the price rises above today's. What's the fastest method?", a: "A monotonic stack of waiting days. When a higher price appears, it resolves all lower days still waiting, in O(n) total." },
    { q: "From a row of skyscrapers, how many can see the ocean on the right?", a: "Keep a decreasing stack. Each new taller building pops all those it blocks. What remains at the end has an ocean view." },
  ],
  leetcode: [[496, 'Next Greater Element I', 'next-greater-element-i', 'Easy'], [739, 'Daily Temperatures', 'daily-temperatures', 'Medium'], [503, 'Next Greater Element II', 'next-greater-element-ii', 'Medium'], [901, 'Online Stock Span', 'online-stock-span', 'Medium']],
});

T({
  id: 'queues', stage: 's5', title: 'Queues and deques', tagline: 'First in, first out, plus a double-ended version.', mins: 25,
  analogy: "A ticket line. New people join the back, and the person at the front gets served. A deque is a line where people can also join or leave at either end.",
  learn: [
    "A **queue** adds at the back and removes from the front, so the oldest item goes first. It's used for fair ordering, printing, task scheduling and BFS.",
    "Don't use `list.pop(0)` for a queue. It shifts every item, so it's O(n). Use `collections.deque`, which has O(1) `append` and `popleft`.",
    "A **deque** (double-ended queue, said 'deck') allows O(1) add and remove at both ends. It can act as both a stack and a queue.",
    "A **monotonic deque** solves sliding window maximum in O(n). It keeps candidates in decreasing order, so the front is always the current maximum. Items leave from the back when a bigger value comes, and from the front when they exit the window.",
  ],
  keys: ["Queue: first in, first out", "Use `deque`, never `list.pop(0)`", "A deque works at both ends in O(1)", "A monotonic deque finds window max in O(n)"],
  cost: [['deque.append / appendleft', 'O(1)'], ['deque.pop / popleft', 'O(1)'], ['list.pop(0)', 'O(n)'], ['deque[i] in the middle', 'O(n)']],
  anims: ['queue-ops', 'deque-window'],
  code: [{ title: 'Recent calls counter', src: `from collections import deque

class RecentCounter:
    def __init__(self):
        self.q = deque()

    def ping(self, t):
        self.q.append(t)
        while self.q[0] < t - 3000:
            self.q.popleft()     # too old
        return len(self.q)

c = RecentCounter()
print(c.ping(1), c.ping(100), c.ping(3001), c.ping(3002))
# 1 2 3 3` }],
  quiz: [
    { q: "Why is `list.pop(0)` a bad queue?", o: ["It crashes", "It's O(n), since everything shifts", "It removes from the back", "It sorts"], a: 1, why: "All the remaining items have to move left." },
    { q: "Enqueue 1, 2, 3, then dequeue. What comes out?", o: ["1", "2", "3", "None"], a: 0, why: "First in, first out." },
    { q: "In the window maximum deque, where's the maximum?", o: ["At the back", "At the front", "In the middle", "Anywhere"], a: 1, why: "Values decrease from front to back." },
    { q: "Which search uses a queue?", o: ["DFS", "BFS", "Binary search", "Merge sort"], a: 1, why: "BFS explores in arrival order, so it visits nearer nodes first." },
  ],
  coding: [
    { id: 'recent', title: 'Recent counter', prompt: "Write `count_recent(times)`. `times` is an increasing list. For each `t`, return how many times fall within `[t - 3000, t]`, as a list.", starter: `from collections import deque\n\ndef count_recent(times):\n    # your code here\n    pass\n`, tests: [['count_recent([1, 100, 3001, 3002])', '[1, 2, 3, 3]'], ['count_recent([])', '[]'], ['count_recent([5, 5000])', '[1, 1]']], hint: "Append t, then `popleft` while the front is older than `t - 3000`.", solution: `from collections import deque\n\ndef count_recent(times):\n    q = deque()\n    out = []\n    for t in times:\n        q.append(t)\n        while q[0] < t - 3000:\n            q.popleft()\n        out.append(len(q))\n    return out\n` },
    { id: 'win-max', title: 'Sliding window maximum', prompt: "Write `window_max(nums, k)` returning the maximum of each window of size k, in O(n).", starter: `from collections import deque\n\ndef window_max(nums, k):\n    # your code here\n    pass\n`, tests: [['window_max([1, 3, -1, -3, 5, 3, 6, 7], 3)', '[3, 3, 5, 5, 6, 7]'], ['window_max([1], 1)', '[1]'], ['window_max([9, 8, 7], 2)', '[9, 8]']], hint: "Store indexes. Pop from the back while smaller. Pop from the front if it's out of the window.", solution: `from collections import deque\n\ndef window_max(nums, k):\n    dq, out = deque(), []\n    for i, x in enumerate(nums):\n        while dq and nums[dq[-1]] <= x:\n            dq.pop()\n        dq.append(i)\n        if dq[0] <= i - k:\n            dq.popleft()\n        if i >= k - 1:\n            out.append(nums[dq[0]])\n    return out\n` },
  ],
  homework: ["Implement a queue using two stacks. Why is it amortised O(1)?", "Simulate a printer queue where each job has a number of pages. Print the order of completion.", "Compare `deque.popleft` and `list.pop(0)` speed on 200,000 items."],
  reallife: [
    { q: "A customer support system should serve callers fairly. Which structure?", a: "A queue: whoever has waited longest is served next." },
    { q: "A dashboard shows the highest temperature in the last hour, updating each minute. Which technique avoids scanning 60 readings each time?", a: "A monotonic deque over the sliding window, which gives each update amortised O(1)." },
  ],
  leetcode: [[933, 'Number of Recent Calls', 'number-of-recent-calls', 'Easy'], [232, 'Implement Queue using Stacks', 'implement-queue-using-stacks', 'Easy'], [622, 'Design Circular Queue', 'design-circular-queue', 'Medium'], [1438, 'Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit', 'longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit', 'Medium']],
});

T({
  id: 'hash-tables', stage: 's6', title: 'Hash tables', tagline: 'Turning a key into a location.', mins: 25,
  analogy: "A cloakroom. You don't search all the coats. Your ticket number sends the attendant straight to one hook. A hash function creates the ticket number from your key.",
  learn: [
    "A hash table stores data in an array of buckets. A **hash function** turns a key into a number, and `number % buckets` picks the bucket. The same key always gives the same bucket.",
    "Two keys can land in the same bucket. That's a **collision**. A simple fix is **chaining**, where each bucket keeps a small list. A good hash spreads keys evenly, so these lists stay short.",
    "Lookup, insert and delete are O(1) on average. When too many items build up, the table doubles in size and re-hashes everything, which is rare enough to count as amortised O(1). The worst case is O(n), if everything collides.",
    "Python's `dict` and `set` are hash tables. Keys must be **hashable**, which means unchangeable: numbers, strings and tuples are fine, but lists aren't.",
  ],
  keys: ["Hash + modulo chooses a bucket", "Collisions are normal", "O(1) on average, O(n) in the worst case", "Keys have to be immutable"],
  anims: ['hash-buckets'],
  code: [{ title: 'A tiny hash map', src: `class HashMap:
    def __init__(self, size=8):
        self.buckets = [[] for _ in range(size)]

    def _bucket(self, key):
        return self.buckets[hash(key) % len(self.buckets)]

    def put(self, key, value):
        b = self._bucket(key)
        for pair in b:
            if pair[0] == key:
                pair[1] = value
                return
        b.append([key, value])

    def get(self, key, default=None):
        for k, v in self._bucket(key):
            if k == key:
                return v
        return default

m = HashMap()
m.put("a", 1)
print(m.get("a"), m.get("b", 0))  # 1 0` }],
  quiz: [
    { q: "What's a collision?", o: ["Two keys in the same bucket", "A crash", "A full table", "Two equal values"], a: 0, why: "Different keys can map to one bucket, which the table has to handle." },
    { q: "What's the average lookup time in a dict?", o: ["O(1)", "O(log n)", "O(n)", "O(n²)"], a: 0, why: "Hashing goes straight to a bucket of small size." },
    { q: "Which can't be a dict key?", o: ["5", "'a'", "(1, 2)", "[1, 2]"], a: 3, why: "Lists can change, so their hash wouldn't be stable." },
    { q: "When does a hash table get slow?", o: ["With many collisions", "With short keys", "With integers", "Never"], a: 0, why: "If many keys end up in one bucket, lookups have to scan them." },
  ],
  coding: [
    { id: 'my-map', title: 'Build a hash map', prompt: "Finish `MyMap` with `put(key, value)` and `get(key)` using buckets. `get` returns -1 when missing. `put` overwrites existing keys.", starter: `class MyMap:\n    def __init__(self):\n        self.buckets = [[] for _ in range(16)]\n\n    def put(self, key, value):\n        # your code here\n        pass\n\n    def get(self, key):\n        # your code here\n        pass\n`, tests: [['(lambda m: (m.put(1, 5), m.get(1)))(MyMap())[1]', '5'], ['MyMap().get(7)', '-1'], ['(lambda m: (m.put(1, 5), m.put(1, 9), m.get(1)))(MyMap())[2]', '9'], ['(lambda m: (m.put(1, 5), m.put(17, 6), m.get(1), m.get(17)))(MyMap())[2:]', '(5, 6)']], hint: "Bucket index is `hash(key) % 16`. Walk the bucket, looking for the key.", solution: `class MyMap:\n    def __init__(self):\n        self.buckets = [[] for _ in range(16)]\n\n    def put(self, key, value):\n        b = self.buckets[hash(key) % 16]\n        for pair in b:\n            if pair[0] == key:\n                pair[1] = value\n                return\n        b.append([key, value])\n\n    def get(self, key):\n        for k, v in self.buckets[hash(key) % 16]:\n            if k == key:\n                return v\n        return -1\n` },
    { id: 'first-uniq', title: 'First unique character', prompt: "Write `first_unique(s)` returning the index of the first non-repeating character, or -1.", starter: `def first_unique(s):\n    # your code here\n    pass\n`, tests: [['first_unique("leetcode")', '0'], ['first_unique("loveleetcode")', '2'], ['first_unique("aabb")', '-1']], hint: "Count all letters first, then look for the first with a count of 1.", solution: `def first_unique(s):\n    count = {}\n    for ch in s:\n        count[ch] = count.get(ch, 0) + 1\n    for i, ch in enumerate(s):\n        if count[ch] == 1:\n            return i\n    return -1\n` },
  ],
  homework: ["Run the hash-table animation with 2 buckets, then 7. What changes?", "Add `remove(key)` to the tiny hash map.", "Add automatic resizing: when items exceed 2 × buckets, double the buckets and re-insert everything."],
  reallife: [
    { q: "How can a website check a username is taken in under a millisecond among 100 million users?", a: "Keep usernames in a hash set or hash-indexed table, so each check goes straight to one bucket." },
    { q: "Why can a Python list not be used as a key for caching?", a: "If the list changed after being stored, its hash would change and you'd look in the wrong bucket. Use a tuple instead." },
  ],
  leetcode: [[706, 'Design HashMap', 'design-hashmap', 'Easy'], [705, 'Design HashSet', 'design-hashset', 'Easy'], [387, 'First Unique Character in a String', 'first-unique-character-in-a-string', 'Easy'], [146, 'LRU Cache', 'lru-cache', 'Medium']],
});

T({
  id: 'hash-patterns', stage: 's6', title: 'Hashing patterns', tagline: 'Complements, counting and grouping.', mins: 25,
  analogy: "At a party, as each guest arrives they ask the host: has my dance partner already come in? The host checks the list instantly, so no one has to walk around asking everybody.",
  learn: [
    "**Complement lookup**: for each item, compute what you need to complete the answer and check if it's been seen. Two Sum drops from O(n²) to O(n) this way.",
    "**Counting**: use a dict or `collections.Counter`. This solves anagrams, majority element and top-k problems. `Counter(nums).most_common(k)` does a lot of the work for you.",
    "**Grouping**: choose a key shared by items that belong together, and use `defaultdict(list)`. Sorted letters make a great key for anagrams.",
    "**Seen set**: to remember things. Longest Consecutive Sequence uses a set to find numbers that begin a run, for O(n) total.",
  ],
  keys: ["Ask: what partner do I need?", "`Counter` counts in one line", "`defaultdict(list)` groups", "Trade O(n) space for O(n) time"],
  anims: ['hash-twosum', 'hash-group'],
  code: [{ title: 'Longest consecutive run', src: `def longest_run(nums):
    s = set(nums)
    best = 0
    for x in s:
        if x - 1 not in s:       # x starts a run
            y = x
            while y + 1 in s:
                y += 1
            best = max(best, y - x + 1)
    return best

print(longest_run([100, 4, 200, 1, 3, 2]))  # 4` }],
  quiz: [
    { q: "In Two Sum, why check before storing the current number?", o: ["It's faster", "So a number doesn't pair with itself", "Dicts require it", "No reason"], a: 1, why: "Checking first means only earlier items can be partners." },
    { q: "What's the time for Two Sum with a dict?", o: ["O(n²)", "O(n log n)", "O(n)", "O(1)"], a: 2, why: "One pass with O(1) lookups." },
    { q: "What's a good grouping key for anagrams?", o: ["The first letter", "The word's length", "The sorted letters", "The last letter"], a: 2, why: "All anagrams give the same sorted letters." },
    { q: "`Counter('aab')['z']` returns:", o: ["KeyError", "None", "0", "-1"], a: 2, why: "`Counter` gives 0 for missing keys." },
  ],
  coding: [
    { id: 'two-sum', title: 'Two Sum', prompt: "Write `two_sum(nums, target)` returning the indexes of two numbers adding to target, in increasing order. Exactly one answer exists.", starter: `def two_sum(nums, target):\n    # your code here\n    pass\n`, tests: [['two_sum([2, 7, 11, 15], 9)', '[0, 1]'], ['two_sum([3, 2, 4], 6)', '[1, 2]'], ['two_sum([3, 3], 6)', '[0, 1]']], hint: "`need = target - x`. Is `need` in your dict?", solution: `def two_sum(nums, target):\n    seen = {}\n    for i, x in enumerate(nums):\n        need = target - x\n        if need in seen:\n            return [seen[need], i]\n        seen[x] = i\n` },
    { id: 'group', title: 'Group anagrams', prompt: "Write `group_anagrams(words)` returning groups of anagrams. The tests sort your answer, so any order is fine.", starter: `from collections import defaultdict\n\ndef group_anagrams(words):\n    # your code here\n    pass\n`, tests: [['sorted(sorted(g) for g in group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"]))', '[["ate", "eat", "tea"], ["bat"], ["nat", "tan"]]'], ['group_anagrams([""])', '[[""]]'], ['group_anagrams([])', '[]']], hint: "The key is `\"\".join(sorted(w))`. Return `list(groups.values())`.", solution: `from collections import defaultdict\n\ndef group_anagrams(words):\n    groups = defaultdict(list)\n    for w in words:\n        groups["".join(sorted(w))].append(w)\n    return list(groups.values())\n` },
  ],
  homework: ["Write Top K Frequent Elements using `Counter`, and then without it.", "Solve Two Sum again by sorting and two pointers. Compare the two approaches.", "Use the grouping animation on your own words."],
  reallife: [
    { q: "A bank flags two transactions that together total exactly ₹10,000. How do you find them among a million in one pass?", a: "For each amount, check if `10000 - amount` has been seen in a set. If yes, flag the pair. Otherwise add the amount to the set." },
    { q: "How would you group customer emails by domain?", a: "Use `defaultdict(list)`, with the text after `@` as the key." },
  ],
  leetcode: [[1, 'Two Sum', 'two-sum', 'Easy'], [169, 'Majority Element', 'majority-element', 'Easy'], [49, 'Group Anagrams', 'group-anagrams', 'Medium'], [347, 'Top K Frequent Elements', 'top-k-frequent-elements', 'Medium'], [128, 'Longest Consecutive Sequence', 'longest-consecutive-sequence', 'Medium']],
});
