/* Curriculum part 1: Python, complexity, arrays and strings */
window.STAGES = [
  { id: 's0', title: 'Python you need', blurb: 'Variables, loops, functions and collections, explained for someone who has never coded.', level: 'Beginner' },
  { id: 's1', title: 'Measuring code', blurb: 'How to tell fast code from slow code before you run it.', level: 'Beginner' },
  { id: 's2', title: 'Arrays and strings', blurb: 'The most common data, and the patterns that solve most problems about it.', level: 'Beginner' },
  { id: 's3', title: 'Recursion', blurb: 'Functions that call themselves, and how to think about them.', level: 'Beginner' },
  { id: 's4', title: 'Sorting and searching', blurb: 'Classic algorithms that teach you to divide a problem.', level: 'Intermediate' },
  { id: 's5', title: 'Linked lists, stacks and queues', blurb: 'Structures built from pointers and strict rules about order.', level: 'Intermediate' },
  { id: 's6', title: 'Hashing', blurb: 'Turning slow searches into instant lookups.', level: 'Intermediate' },
  { id: 's7', title: 'Trees and heaps', blurb: 'Data with a hierarchy, and always knowing the smallest item.', level: 'Intermediate' },
  { id: 's8', title: 'Graphs', blurb: 'Maps, networks and dependencies.', level: 'Advanced' },
  { id: 's9', title: 'Problem-solving strategies', blurb: 'Greedy, backtracking and dynamic programming.', level: 'Advanced' },
  { id: 's10', title: 'Advanced structures', blurb: 'Tries, union-find, segment trees and bit tricks.', level: 'Advanced' },
];
window.TOPICS = [];
window.T = (t) => window.TOPICS.push(t);

T({
  id: 'variables', stage: 's0', title: 'Variables and types', tagline: 'Names, numbers, text, and what happens when you assign.', mins: 15,
  analogy: "A variable is a sticky name tag. The value is the object in the room, and the tag only says which object you mean.",
  learn: [
    "A program stores values and gives them names. `age = 20` creates the number 20 and ties the name `age` to it. Read the `=` as **gets**, not as equals.",
    "Four basic types cover almost everything at first: `int` for whole numbers, `float` for decimals, `str` for text, and `bool` for `True` or `False`. Use `type(x)` to check what you have.",
    "The operators you will use constantly are `+ - * /`, plus `//` (divide and round down), `%` (the remainder) and `**` (power). `7 // 2` is 3 and `7 % 2` is 1.",
    "Here is the part that surprises beginners. `b = a` does not copy anything. It adds a second name tag to the same value. With numbers that is harmless, because numbers can't change. With lists it matters a lot, because a change through one name is visible through the other.",
  ],
  keys: ["`=` ties a name to a value", "`//` rounds down and `%` gives the remainder", "Two names can point to the same list", "Use `.copy()` when you need a separate list"],
  anims: ['vars-names'],
  code: [{ title: 'Values and operators', src: `age = 20
price = 9.99
name = "Asha"
is_ready = True

print(type(age))     # <class 'int'>
print(7 // 2, 7 % 2) # 3 1
print(2 ** 10)       # 1024
print(f"{name} is {age}")  # f-string fills in values

a = [1, 2]
b = a          # same list, two names
c = a.copy()   # a separate list
b.append(3)
print(a, c)    # [1, 2, 3] [1, 2]` }],
  quiz: [
    { q: "What does `7 % 3` give?", o: ["2", "1", "2.33", "0"], a: 1, why: "`%` gives the remainder. 7 divided by 3 is 2 with 1 left over." },
    { q: "What is `7 // 2`?", o: ["3.5", "4", "3", "1"], a: 2, why: "`//` divides and rounds down, so the answer is 3." },
    { q: "After `a = [1]`, `b = a`, `b.append(2)`, what is `a`?", o: ["[1]", "[1, 2]", "[2]", "An error"], a: 1, why: "`a` and `b` name the same list, so the change shows through both names." },
    { q: "Which type does `3.0` have?", o: ["int", "str", "bool", "float"], a: 3, why: "Any number written with a decimal point is a `float`." },
  ],
  coding: [
    { id: 'last-digit', title: 'Last digit', prompt: "Write `last_digit(n)` that returns the last digit of a non-negative whole number `n`. Hint: think about the remainder when dividing by 10.", starter: `def last_digit(n):\n    # your code here\n    pass\n`, tests: [['last_digit(1234)', '4'], ['last_digit(7)', '7'], ['last_digit(90)', '0']], hint: "`n % 10` gives what is left after removing all the tens.", solution: `def last_digit(n):\n    return n % 10\n` },
    { id: 'swap', title: 'Swap two values', prompt: "Write `swap(a, b)` that returns the two values in reverse order, as a tuple. `swap(1, 2)` should return `(2, 1)`.", starter: `def swap(a, b):\n    # your code here\n    pass\n`, tests: [['swap(1, 2)', '(2, 1)'], ['swap("x", 9)', '(9, "x")']], hint: "Python lets you write `return b, a`.", solution: `def swap(a, b):\n    return b, a\n` },
  ],
  homework: ["Install Python or open any online Python page. Create variables for your name and age, then print one sentence using an f-string.", "Without running it, work out `17 // 5`, `17 % 5` and `2 ** 5`. Then run them to check.", "Make a list, give it a second name, and change it. Then repeat with `.copy()` and explain the difference in one sentence."],
  reallife: [
    { q: "A shop has 47 eggs and each box holds 12. How would you work out full boxes and leftover eggs in code?", a: "Full boxes are `47 // 12`, which is 3. Leftover eggs are `47 % 12`, which is 11. Division with remainder appears all the time in real programs." },
    { q: "You and a friend edit one shared online document. How does that resemble `b = a` for lists?", a: "There is one document with two people holding links to it. Changes by either person show up for both, just like two names pointing to the same list. A downloaded copy behaves like `.copy()`." },
  ],
  leetcode: [[2235, 'Add Two Integers', 'add-two-integers', 'Easy'], [1108, 'Defanging an IP Address', 'defanging-an-ip-address', 'Easy'], [1281, 'Subtract the Product and Sum of Digits of an Integer', 'subtract-the-product-and-sum-of-digits-of-an-integer', 'Easy']],
});

T({
  id: 'control-flow', stage: 's0', title: 'Conditions and loops', tagline: 'Making decisions and repeating work.', mins: 20,
  analogy: "A loop is a teacher going down the attendance list, one student at a time. An `if` is the teacher checking whether each student handed in their homework.",
  learn: [
    "`if`, `elif` and `else` let a program pick a path. Python uses indentation, the spaces at the start of a line, to know which lines belong to the `if`. Four spaces is the standard.",
    "A `for` loop goes through items one by one. `range(5)` gives 0, 1, 2, 3, 4. It stops **before** the end number, which trips up nearly everyone at first.",
    "A `while` loop keeps going as long as its condition is true. Use it when you don't know in advance how many steps you need. Make sure something changes inside it, or it will run forever.",
    "`break` leaves the loop right away. `continue` skips to the next round. And `enumerate(items)` gives both the position and the value, which you will use all the time in DSA.",
  ],
  keys: ["Indentation decides what is inside a block", "`range(n)` runs from 0 to n - 1", "`enumerate` gives index and value together", "A `while` loop must change something it checks"],
  anims: ['loop-trace'],
  code: [{ title: 'The loops you will use daily', src: `nums = [4, 7, 1]

for x in nums:
    print(x)

for i in range(len(nums)):
    print(i, nums[i])

for i, x in enumerate(nums):
    print(i, x)

n = 37
steps = 0
while n > 1:      # how many halvings to reach 1?
    n = n // 2
    steps += 1
print(steps)      # 5` }],
  quiz: [
    { q: "What numbers does `range(1, 4)` produce?", o: ["1, 2, 3, 4", "1, 2, 3", "0, 1, 2, 3", "2, 3, 4"], a: 1, why: "It starts at 1 and stops before 4." },
    { q: "What does `break` do?", o: ["Skips one round", "Stops the program", "Exits the current loop", "Restarts the loop"], a: 2, why: "`break` leaves the innermost loop. `continue` is the one that skips a single round." },
    { q: "What decides which lines are inside an `if`?", o: ["Curly brackets", "Indentation", "Semicolons", "The word `end`"], a: 1, why: "Python uses indentation to mark blocks." },
    { q: "What's wrong with `while x > 0: print(x)` if `x` starts at 5?", o: ["Nothing", "It prints once", "It never ends because x never changes", "It's a syntax error"], a: 2, why: "The condition stays true forever because nothing in the loop changes `x`." },
  ],
  coding: [
    { id: 'count-evens', title: 'Count the even numbers', prompt: "Write `count_evens(nums)` that returns how many numbers in the list are even.", starter: `def count_evens(nums):\n    count = 0\n    # your code here\n    return count\n`, tests: [['count_evens([1, 2, 3, 4])', '2'], ['count_evens([])', '0'], ['count_evens([2, 4, 6])', '3'], ['count_evens([1, 3])', '0']], hint: "Loop over the list and check `x % 2 == 0`.", solution: `def count_evens(nums):\n    count = 0\n    for x in nums:\n        if x % 2 == 0:\n            count += 1\n    return count\n` },
    { id: 'fizzbuzz', title: 'FizzBuzz', prompt: "Write `fizz(n)` that returns a string: `\"FizzBuzz\"` if `n` divides by both 3 and 5, `\"Fizz\"` for 3 only, `\"Buzz\"` for 5 only, otherwise `n` as a string.", starter: `def fizz(n):\n    # your code here\n    pass\n`, tests: [['fizz(15)', '"FizzBuzz"'], ['fizz(9)', '"Fizz"'], ['fizz(10)', '"Buzz"'], ['fizz(7)', '"7"']], hint: "Check the both-case first, or it will never be reached.", solution: `def fizz(n):\n    if n % 15 == 0:\n        return "FizzBuzz"\n    if n % 3 == 0:\n        return "Fizz"\n    if n % 5 == 0:\n        return "Buzz"\n    return str(n)\n` },
  ],
  homework: ["Print the 7 times table up to 7 × 10 with a `for` loop.", "Use a `while` loop to count how many times you can halve 1000 before reaching 1.", "On paper, trace the loop in the animation for the list `[6, 1, 2]`, writing `x` and `total` after each round."],
  reallife: [
    { q: "A cashier adds up prices but gives 10% off any item over ₹500. Describe it as a loop and a condition.", a: "Loop over the prices. If a price is more than 500, add `price * 0.9` to the total. Otherwise add `price`." },
    { q: "A washing machine keeps spinning until the drum is dry. Is that a `for` or a `while`?", a: "A `while`, because the number of spins isn't known in advance. It repeats until a condition changes." },
  ],
  leetcode: [[412, 'Fizz Buzz', 'fizz-buzz', 'Easy'], [1480, 'Running Sum of 1d Array', 'running-sum-of-1d-array', 'Easy'], [1672, 'Richest Customer Wealth', 'richest-customer-wealth', 'Easy'], [1295, 'Find Numbers with Even Number of Digits', 'find-numbers-with-even-number-of-digits', 'Easy']],
});

T({
  id: 'functions', stage: 's0', title: 'Functions and the call stack', tagline: 'Naming a piece of work so you can reuse it.', mins: 20,
  analogy: "A function is a recipe. The inputs are ingredients, the steps are fixed, and `return` hands you the finished dish. When one recipe needs another, you pause, make that first, and then come back.",
  learn: [
    "`def` creates a function. Values in the brackets are **parameters**. `return` sends an answer back and ends the function right there.",
    "If a function has no `return`, it gives back `None`. A common beginner bug is using `print` when you mean `return`. Print shows text to a person, while return gives a value to the rest of the program.",
    "Every call gets a private workspace called a frame, holding its own variables. Frames pile up on the **call stack**. The newest one runs, and the ones below wait.",
    "Variables made inside a function vanish when it returns. Lists passed in are not copied, so a function can change your list. This is important later, because many DSA functions edit their input in place.",
  ],
  keys: ["`return` ends the function and hands back a value", "`print` is not the same as `return`", "Each call gets its own frame", "A list passed in is shared, not copied"],
  anims: ['fn-call'],
  code: [{ title: 'Writing and calling functions', src: `def area(width, height=1):
    return width * height

print(area(3, 4))  # 12
print(area(3))     # 3, because height defaults to 1

def add_item(items, x):
    items.append(x)  # changes the caller's list

shop = ["milk"]
add_item(shop, "tea")
print(shop)  # ['milk', 'tea']

# A short one-line function
double = lambda x: x * 2
print(double(5))  # 10` }],
  quiz: [
    { q: "What does a function return if it has no `return` line?", o: ["0", "An error", "None", "An empty string"], a: 2, why: "Python automatically returns `None`." },
    { q: "When `f` calls `g`, which frame runs first until it finishes?", o: ["f", "g", "Both together", "Whichever is shorter"], a: 1, why: "`g` is on top of the stack. `f` waits until `g` returns." },
    { q: "What happens to variables made inside a function after it returns?", o: ["They become global", "They disappear", "They stay until the program ends", "They move to the next call"], a: 1, why: "They live in the frame, and the frame is removed on return." },
    { q: "Which line ends a function immediately?", o: ["print", "break", "return", "end"], a: 2, why: "`return` exits the function at once, even inside a loop." },
  ],
  coding: [
    { id: 'biggest', title: 'Biggest of three', prompt: "Write `biggest(a, b, c)` that returns the largest of three numbers. Try it without using `max`.", starter: `def biggest(a, b, c):\n    # your code here\n    pass\n`, tests: [['biggest(1, 5, 3)', '5'], ['biggest(9, 2, 2)', '9'], ['biggest(-1, -5, -3)', '-1'], ['biggest(4, 4, 4)', '4']], hint: "Start with `best = a` and replace it when you see something larger.", solution: `def biggest(a, b, c):\n    best = a\n    if b > best:\n        best = b\n    if c > best:\n        best = c\n    return best\n` },
    { id: 'first-neg', title: 'First negative', prompt: "Write `first_negative(nums)` that returns the first negative number, or `None` if there isn't one. Use `return` inside the loop to stop early.", starter: `def first_negative(nums):\n    # your code here\n    pass\n`, tests: [['first_negative([3, -1, -5])', '-1'], ['first_negative([1, 2])', 'None'], ['first_negative([])', 'None']], hint: "A `return` inside a `for` ends the whole function.", solution: `def first_negative(nums):\n    for x in nums:\n        if x < 0:\n            return x\n    return None\n` },
  ],
  homework: ["Write `is_even(n)` that returns True or False, then use it inside a loop to print the even numbers from 1 to 20.", "Add `print` lines inside the animation's functions and predict the order they appear before you run them.", "Draw the call stack on paper for `sum_squares(2, 5)` at the moment `square(5)` is running."],
  reallife: [
    { q: "Your boss asks you to stop, sign a form, and then continue what you were doing. Which programming idea is this?", a: "A function call. You pause your current frame, do the new task, and return to exactly where you left off. That is how the call stack works." },
    { q: "Why would a company write one `calculate_tax()` function rather than repeat the formula in ten places?", a: "If the tax rule changes, you fix it in one place. Repeated code means ten places to change and ten chances to make a mistake." },
  ],
  leetcode: [[1920, 'Build Array from Permutation', 'build-array-from-permutation', 'Easy'], [2769, 'Find the Maximum Achievable Number', 'find-the-maximum-achievable-number', 'Easy'], [1342, 'Number of Steps to Reduce a Number to Zero', 'number-of-steps-to-reduce-a-number-to-zero', 'Easy']],
});

T({
  id: 'collections', stage: 's0', title: 'Lists, dicts, sets and tuples', tagline: 'The four built-in containers behind nearly every solution.', mins: 25,
  analogy: "A list is a numbered row of lockers. A dict is a phone book: look up a name, get a number. A set is a guest list: you're either on it or you're not. A tuple is a locker row welded shut.",
  learn: [
    "**List**: ordered and changeable. Reach items by position with `nums[0]`, or count from the end with `nums[-1]`. Slices like `nums[1:3]` give you a new list.",
    "**Dict**: connects keys to values. `freq['a'] = 2` stores and `freq.get('a', 0)` reads safely with a default. Lookups are very fast no matter how large it grows.",
    "**Set**: unique items with no position. `x in my_set` is very fast, whereas `x in my_list` has to walk the list. Use sets for answering: have I seen this before?",
    "**Tuple**: like a list that can't change, written `(3, 4)`. Because it can't change, it may be used as a dict key, for example to store a grid position.",
  ],
  keys: ["Use a list for order, a dict for lookups, a set for membership", "`x in set` is fast, `x in list` is slow", "`nums.insert(0, x)` and `nums.pop(0)` are slow", "Tuples can be dict keys, lists cannot"],
  anims: ['list-methods', 'dict-set'],
  cost: [['list[i]', 'O(1)'], ['list.append / list.pop()', 'O(1)'], ['list.insert(0, x) / pop(0)', 'O(n)'], ['x in list', 'O(n)'], ['dict and set lookup, add, remove', 'O(1) average']],
  code: [{ title: 'Everyday use', src: `nums = [5, 2, 9]
nums.append(1)
print(nums[-1], nums[0:2])  # 1 [5, 2]
print(sorted(nums), sum(nums), max(nums))

squares = [x * x for x in range(4)]  # list comprehension
print(squares)  # [0, 1, 4, 9]

ages = {"asha": 24}
ages["ben"] = 30
for name, age in ages.items():
    print(name, age)

seen = set()
seen.add(3)
print(3 in seen)  # True

point = (2, 5)
visited = {point: True}  # tuple as a key` }],
  quiz: [
    { q: "What does `nums[-1]` give?", o: ["The first item", "The last item", "An error", "Nothing"], a: 1, why: "Negative positions count from the end, so -1 is the last item." },
    { q: "Which is fastest for checking whether a value exists in a large collection?", o: ["list", "tuple", "set", "They are the same"], a: 2, why: "A set uses hashing, so the check is O(1) on average. A list has to scan." },
    { q: "`nums = [1, 2, 3, 4]`. What is `nums[1:3]`?", o: ["[1, 2, 3]", "[2, 3]", "[2, 3, 4]", "[1, 2]"], a: 1, why: "A slice includes the start position and stops before the end position." },
    { q: "Which of these can be used as a dict key?", o: ["[1, 2]", "(1, 2)", "{1, 2}", "None of them"], a: 1, why: "Keys must be unchangeable. A tuple qualifies, while lists and sets don't." },
  ],
  coding: [
    { id: 'char-count', title: 'Count each letter', prompt: "Write `char_count(s)` that returns a dict mapping each character to how many times it appears.", starter: `def char_count(s):\n    freq = {}\n    # your code here\n    return freq\n`, tests: [['char_count("aab")', '{"a": 2, "b": 1}'], ['char_count("")', '{}'], ['char_count("xyz")', '{"x": 1, "y": 1, "z": 1}']], hint: "`freq[ch] = freq.get(ch, 0) + 1`", solution: `def char_count(s):\n    freq = {}\n    for ch in s:\n        freq[ch] = freq.get(ch, 0) + 1\n    return freq\n` },
    { id: 'has-dup', title: 'Any duplicates?', prompt: "Write `has_duplicate(nums)` that returns True if any value appears at least twice.", starter: `def has_duplicate(nums):\n    # your code here\n    pass\n`, tests: [['has_duplicate([1, 2, 3, 1])', 'True'], ['has_duplicate([1, 2, 3])', 'False'], ['has_duplicate([])', 'False']], hint: "Keep a set of what you've seen so far. Or compare `len(set(nums))` with `len(nums)`.", solution: `def has_duplicate(nums):\n    seen = set()\n    for x in nums:\n        if x in seen:\n            return True\n        seen.add(x)\n    return False\n` },
  ],
  homework: ["Create a dict of five friends and their cities, then loop over it and print each pair.", "Use a list comprehension to make a list of the even numbers from 0 to 20.", "Time it: build a list and a set of 1,000,000 numbers, then compare how long `999999 in x` takes for each using `time.time()`."],
  reallife: [
    { q: "A library checks if a member ID is valid thousands of times a day. Should valid IDs be stored in a list or a set?", a: "A set. Each check is O(1) on average, while a list would have to scan every ID." },
    { q: "Which container fits a contact app that finds a phone number from a person's name?", a: "A dict, with the name as the key and the number as the value." },
  ],
  leetcode: [[217, 'Contains Duplicate', 'contains-duplicate', 'Easy'], [1512, 'Number of Good Pairs', 'number-of-good-pairs', 'Easy'], [771, 'Jewels and Stones', 'jewels-and-stones', 'Easy'], [349, 'Intersection of Two Arrays', 'intersection-of-two-arrays', 'Easy']],
});

T({
  id: 'big-o', stage: 's1', title: 'Big-O: time complexity', tagline: 'How work grows as the input grows.', mins: 25,
  analogy: "Finding a word in a dictionary by opening the middle each time takes a few flips, even for a huge book. Reading every page from the start grows with the size of the book. Big-O describes that growth, not the seconds on a clock.",
  learn: [
    "Timing code with a stopwatch depends on your computer. So we count steps instead and ask: **if the input doubles, what happens to the steps?**",
    "**O(1)**: the same number of steps regardless of size. **O(log n)**: each step halves the problem. **O(n)**: one pass over the data. **O(n log n)**: good sorting. **O(n²)**: a loop inside a loop.",
    "Two simplifying rules. Drop constants, so 3n becomes O(n). Keep only the fastest-growing part, so n² + n becomes O(n²). When n is huge, the rest hardly matters.",
    "To find it, look at loops. One loop over n is O(n). Nested loops multiply. Loops one after another add, and so only the larger one counts. A loop that halves its range each time is O(log n).",
    "A practical guide: computers do roughly 10⁸ simple steps per second. So if n can reach 100,000, an O(n²) solution will time out on LeetCode, while O(n log n) is fine.",
  ],
  keys: ["Big-O counts how steps grow, not seconds", "Drop constants and smaller terms", "Nested loops multiply and sequential loops add", "Halving gives O(log n)"],
  anims: ['bigo-race', 'bigo-loops'],
  code: [{ title: 'Spot the complexity', src: `def first(nums):           # O(1)
    return nums[0]

def total(nums):           # O(n)
    s = 0
    for x in nums:
        s += x
    return s

def all_pairs(nums):       # O(n^2)
    pairs = 0
    for a in nums:
        for b in nums:
            pairs += 1
    return pairs

def halvings(n):           # O(log n)
    steps = 0
    while n > 1:
        n //= 2
        steps += 1
    return steps` }],
  quiz: [
    { q: "What is the complexity of one loop followed by another separate loop, each over n items?", o: ["O(n²)", "O(n)", "O(2ⁿ)", "O(log n)"], a: 1, why: "They add: n + n = 2n, and dropping the constant gives O(n)." },
    { q: "Simplify `5n² + 100n + 7`.", o: ["O(5n²)", "O(n²)", "O(100n)", "O(n² + n)"], a: 1, why: "Keep the fastest-growing term and drop the constant." },
    { q: "What grows slowest as n gets large?", o: ["O(n)", "O(n log n)", "O(log n)", "O(n²)"], a: 2, why: "O(log n) barely moves: a million items is only about 20 steps." },
    { q: "If n = 100,000, which is likely to be too slow?", o: ["O(n)", "O(n log n)", "O(log n)", "O(n²)"], a: 3, why: "n² is 10 billion steps, far more than the rough 10⁸ per second." },
  ],
  coding: [
    { id: 'count-ops', title: 'Count the pairs', prompt: "Write `count_pairs(n)` that returns how many times the inner line runs in `for i in range(n): for j in range(n):`. Do it in O(1), without any loop.", starter: `def count_pairs(n):\n    # your code here\n    pass\n`, tests: [['count_pairs(3)', '9'], ['count_pairs(0)', '0'], ['count_pairs(100000)', '10000000000']], hint: "n rows with n columns each.", solution: `def count_pairs(n):\n    return n * n\n` },
    { id: 'halvings', title: 'How many halvings?', prompt: "Write `halvings(n)` that returns how many times you can do `n = n // 2` before `n` reaches 1. For `n = 8` the answer is 3. This number is log₂(n).", starter: `def halvings(n):\n    steps = 0\n    # your code here\n    return steps\n`, tests: [['halvings(8)', '3'], ['halvings(1)', '0'], ['halvings(1000000)', '19'], ['halvings(9)', '3']], hint: "Use a `while n > 1` loop.", solution: `def halvings(n):\n    steps = 0\n    while n > 1:\n        n //= 2\n        steps += 1\n    return steps\n` },
  ],
  homework: ["Find the Big-O of each function in the code panel without looking at the comments.", "Write a function with two nested loops where the inner one starts from `i`. Count its steps for n = 4. Is it still O(n²)?", "Work out the maximum n an O(n²) algorithm can handle in about one second."],
  reallife: [
    { q: "A class of n students: everyone shakes hands with everyone. What's the growth rate?", a: "O(n²). There are n(n−1)/2 handshakes. Double the class and handshakes become about 4 times as many." },
    { q: "You are looking for a name in a sorted phone book of 1,000,000 entries. Roughly how many pages do you check by opening the middle each time?", a: "About 20, because log₂(1,000,000) ≈ 20. That's the power of O(log n)." },
  ],
  leetcode: [[1, 'Two Sum', 'two-sum', 'Easy'], [9, 'Palindrome Number', 'palindrome-number', 'Easy'], [268, 'Missing Number', 'missing-number', 'Easy']],
});

T({
  id: 'space', stage: 's1', title: 'Space and amortised cost', tagline: 'Counting memory, and why list.append is cheap.', mins: 20,
  analogy: "Solving a puzzle on your desk uses one desk. Photocopying every piece onto a second desk first uses twice the space, even if the answer is the same.",
  learn: [
    "**Space complexity** counts the extra memory an algorithm needs as the input grows. Don't count the input itself. A couple of loop variables is O(1). A new list of n items is O(n).",
    "Recursion uses space too. Each waiting call takes a frame, so a depth of n means O(n) stack space, even with no lists in sight.",
    "Often you can trade space for time. Storing seen values in a set uses O(n) memory but turns an O(n²) search into O(n). This trade powers most hashing and DP solutions.",
    "**Amortised** means averaged over many operations. A Python list keeps spare slots. Most appends are one step. When it's full, it copies everything to a larger block. Because the size roughly grows by a multiple, copies are rare enough that the average stays O(1).",
  ],
  keys: ["Space counts extra memory, not the input", "Recursion depth uses stack space", "Extra memory often buys speed", "Amortised O(1) means cheap on average, with rare expensive steps"],
  anims: ['space-inplace', 'dynamic-array'],
  code: [{ title: 'Same result, different memory', src: `def reversed_copy(nums):     # O(n) extra space
    return nums[::-1]

def reverse_in_place(nums):  # O(1) extra space
    i, j = 0, len(nums) - 1
    while i < j:
        nums[i], nums[j] = nums[j], nums[i]
        i += 1
        j -= 1

def depth(n):                # O(n) stack space
    if n == 0:
        return 0
    return 1 + depth(n - 1)` }],
  quiz: [
    { q: "What's the extra space of `squares = [x*x for x in nums]`?", o: ["O(1)", "O(log n)", "O(n)", "O(n²)"], a: 2, why: "It builds a new list with one item per input item." },
    { q: "A recursive function goes n calls deep. What's the stack space?", o: ["O(1)", "O(n)", "O(n²)", "None"], a: 1, why: "All n frames wait on the stack at the deepest point." },
    { q: "Why is `append` called amortised O(1)?", o: ["It's always one step", "Rare copies average out over many appends", "It uses a set inside", "It sorts as it goes"], a: 1, why: "An occasional append costs O(n), but averaged across all appends the cost per append stays constant." },
    { q: "Storing seen values in a set to avoid a nested loop is an example of what?", o: ["Trading memory for speed", "Trading speed for memory", "Recursion", "Sorting"], a: 0, why: "You spend O(n) memory to reduce time from O(n²) to O(n)." },
  ],
  coding: [
    { id: 'rev-in-place', title: 'Reverse in place', prompt: "Write `reverse_list(nums)` that reverses the list in place using O(1) extra space, then returns it. Don't use slicing or `.reverse()`.", starter: `def reverse_list(nums):\n    # your code here\n    return nums\n`, tests: [['reverse_list([1, 2, 3])', '[3, 2, 1]'], ['reverse_list([])', '[]'], ['reverse_list([4, 5])', '[5, 4]'], ['reverse_list([7])', '[7]']], hint: "Swap the two ends and walk inward.", solution: `def reverse_list(nums):\n    i, j = 0, len(nums) - 1\n    while i < j:\n        nums[i], nums[j] = nums[j], nums[i]\n        i += 1\n        j -= 1\n    return nums\n` },
    { id: 'missing-sum', title: 'The missing number', prompt: "A list holds all numbers from 0 to n except one. Write `missing(nums)` in O(1) extra space.", starter: `def missing(nums):\n    # your code here\n    pass\n`, tests: [['missing([3, 0, 1])', '2'], ['missing([0, 1])', '2'], ['missing([1])', '0']], hint: "The numbers 0 to n add up to n(n+1)/2. What does the actual sum differ by?", solution: `def missing(nums):\n    n = len(nums)\n    return n * (n + 1) // 2 - sum(nums)\n` },
  ],
  homework: ["For each function in the code panel, write the time and the extra space.", "Run `sys.getsizeof([])` while appending items in a loop and note when the size jumps. Those are the moments the list grows.", "Write two versions of a duplicate check: nested loops with O(1) space, and a set with O(n) space. Compare them on 10,000 numbers."],
  reallife: [
    { q: "A phone app stores all thumbnails so scrolling is instant. Which trade is that?", a: "Spending memory to save time. It's the same idea as caching in code." },
    { q: "A restaurant buys a bigger table only when it runs out of room, moving everyone once. How does that resemble a Python list?", a: "Moves are expensive but rare. Most guests just sit down in one step, which is amortised O(1) per guest." },
  ],
  leetcode: [[344, 'Reverse String', 'reverse-string', 'Easy'], [268, 'Missing Number', 'missing-number', 'Easy'], [448, 'Find All Numbers Disappeared in an Array', 'find-all-numbers-disappeared-in-an-array', 'Easy']],
});

T({
  id: 'arrays', stage: 's2', title: 'Arrays', tagline: 'Slots side by side, and what that makes easy or hard.', mins: 25,
  analogy: "Houses numbered in order on one street. You can drive straight to house 40. But to add a new house in the middle, everyone beyond it has to move one plot down.",
  learn: [
    "An array stores items in touching memory slots. A Python list is an array under the hood. Because the slots touch, the computer calculates the address of slot `i` with one sum, so reading `arr[i]` is O(1).",
    "The same layout makes inserting or deleting in the middle slow. To open a gap, everything after it has to shift. That's O(n) at worst. Changes at the end are O(1).",
    "Most array problems ask you to scan once while remembering something useful: the largest so far, a running total, or the best price so far. If your first idea is a nested loop, ask whether a single pass with one remembered value could work.",
    "A classic example is Best Time to Buy and Sell Stock: keep the lowest price seen so far, and at each day check the profit from selling today.",
  ],
  keys: ["Read and write by index are O(1)", "Insert and delete in the middle are O(n)", "Scan once and remember something useful", "2-D arrays are lists of lists: `grid[r][c]`"],
  cost: [['Read or write arr[i]', 'O(1)'], ['Append at end', 'O(1) amortised'], ['Insert or delete in middle', 'O(n)'], ['Search unsorted', 'O(n)']],
  anims: ['array-access', 'array-insert'],
  code: [{ title: 'One pass while remembering', src: `def max_profit(prices):
    lowest = float("inf")
    best = 0
    for p in prices:
        lowest = min(lowest, p)
        best = max(best, p - lowest)
    return best

grid = [[0] * 3 for _ in range(2)]  # 2 rows, 3 columns
grid[1][2] = 7
print(grid)  # [[0, 0, 0], [0, 0, 7]]

print(max_profit([7, 1, 5, 3, 6, 4]))  # 5` }],
  quiz: [
    { q: "Why is `arr[i]` O(1)?", o: ["Python caches it", "The address is calculated from the index", "Arrays are sorted", "It uses a hash"], a: 1, why: "Address = start + i × slot size. It's a single calculation." },
    { q: "What's the worst-case cost of inserting at the front of an array of n items?", o: ["O(1)", "O(log n)", "O(n)", "O(n²)"], a: 2, why: "All n items have to shift by one." },
    { q: "Why is `[[0]*3]*2` a trap for a grid?", o: ["It's a syntax error", "Both rows are the same list", "It makes 6 rows", "Zeros can't go in lists"], a: 1, why: "`*2` repeats the reference, so changing one row changes both. Use a comprehension instead." },
    { q: "To find the largest value in an unsorted array, the best possible time is:", o: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], a: 2, why: "Any item could be the largest, so you have to look at all of them." },
  ],
  coding: [
    { id: 'max-profit', title: 'Best time to buy and sell', prompt: "`prices[i]` is the price on day i. Buy once, then sell on a later day. Write `max_profit(prices)` returning the best profit, or 0 if you can't profit.", starter: `def max_profit(prices):\n    # your code here\n    pass\n`, tests: [['max_profit([7, 1, 5, 3, 6, 4])', '5'], ['max_profit([7, 6, 4, 3, 1])', '0'], ['max_profit([2, 4, 1])', '2'], ['max_profit([5])', '0']], hint: "Keep the lowest price so far. Each day, try selling.", solution: `def max_profit(prices):\n    lowest = float("inf")\n    best = 0\n    for p in prices:\n        lowest = min(lowest, p)\n        best = max(best, p - lowest)\n    return best\n` },
    { id: 'move-zeros', title: 'Move zeros to the end', prompt: "Write `move_zeros(nums)` that moves all 0s to the end while keeping the order of the others, in place, and returns the list.", starter: `def move_zeros(nums):\n    # your code here\n    return nums\n`, tests: [['move_zeros([0, 1, 0, 3, 12])', '[1, 3, 12, 0, 0]'], ['move_zeros([0])', '[0]'], ['move_zeros([1, 2])', '[1, 2]']], hint: "Keep a `write` position. Copy each non-zero to it, then fill the rest with zeros.", solution: `def move_zeros(nums):\n    write = 0\n    for x in nums:\n        if x != 0:\n            nums[write] = x\n            write += 1\n    for i in range(write, len(nums)):\n        nums[i] = 0\n    return nums\n` },
  ],
  homework: ["Write `second_largest(nums)` in one pass, without sorting.", "Rotate a list to the right by k places using slices, then try it in place using three reversals.", "Use the insert animation with several indexes and write the number of shifts for each. What formula do you see?"],
  reallife: [
    { q: "A cinema row has seats numbered 1 to 200. Why is finding seat 150 fast, but squeezing in an extra seat at position 3 painful?", a: "The number tells you exactly where to go, like an index. Adding a seat in the middle means everyone after it must move, like shifting an array." },
    { q: "You track your daily step counts and want your best 1-day gain compared with any earlier day. Which pattern applies?", a: "One pass while remembering the lowest count so far, the same as the stock problem." },
  ],
  leetcode: [[121, 'Best Time to Buy and Sell Stock', 'best-time-to-buy-and-sell-stock', 'Easy'], [283, 'Move Zeroes', 'move-zeroes', 'Easy'], [53, 'Maximum Subarray', 'maximum-subarray', 'Medium'], [238, 'Product of Array Except Self', 'product-of-array-except-self', 'Medium'], [189, 'Rotate Array', 'rotate-array', 'Medium']],
});

T({
  id: 'two-pointers', stage: 's2', title: 'Two pointers', tagline: 'Two index variables that replace a nested loop.', mins: 25,
  analogy: "Two people search a sorted bookshelf from opposite ends, and each moves based on what they find. Together they cover the whole shelf in a single walk.",
  learn: [
    "A pointer here is simply a variable holding an index. Two of them can often replace a nested loop, turning O(n²) into O(n).",
    "**Opposite ends**: start `left` at 0 and `right` at the end. On sorted data, the current result tells you which side to move. This works for pair sums, palindromes and reversing.",
    "**Same direction**: a `slow` pointer marks where to write, and a `fast` pointer reads. This edits a list in place with no extra memory, for jobs like removing duplicates.",
    "Why is moving a pointer safe? In a sorted list, if the sum is too small, then pairing the left number with anything smaller on the right is also too small. So the left number can be thrown away for good, and one comparison rules out many pairs.",
  ],
  keys: ["Pointers are just indexes", "Sorted data + pair question = opposite ends", "In-place edit = slow and fast", "Each pointer only moves forward, so it's O(n)"],
  anims: ['tp-pairsum', 'tp-dedup'],
  code: [{ title: 'Container with most water', src: `def max_area(h):
    l, r = 0, len(h) - 1
    best = 0
    while l < r:
        best = max(best, min(h[l], h[r]) * (r - l))
        if h[l] < h[r]:   # the shorter wall limits us
            l += 1
        else:
            r -= 1
    return best

print(max_area([1, 8, 6, 2, 5, 4, 8, 3, 7]))  # 49` }],
  quiz: [
    { q: "In sorted pair sum, the sum is too big. What do you do?", o: ["Move left up", "Move right down", "Move both", "Restart"], a: 1, why: "You need a smaller sum, and only moving `right` down can give that." },
    { q: "What's the time complexity of two pointers moving toward each other?", o: ["O(n)", "O(n²)", "O(log n)", "O(1)"], a: 0, why: "Each step moves one pointer, and there are at most n moves." },
    { q: "When dedupe uses slow and fast pointers, which one reads each item?", o: ["Slow", "Fast", "Both", "Neither"], a: 1, why: "`fast` reads everything. `slow` only moves when there's something new to write." },
    { q: "Which does opposite-ends pair sum require?", o: ["Sorted input", "Unique values", "Even length", "Positive numbers"], a: 0, why: "The decision of which pointer to move only makes sense if the list is sorted." },
  ],
  coding: [
    { id: 'pair-sum', title: 'Pair sum in a sorted list', prompt: "`nums` is sorted. Write `pair_sum(nums, target)` that returns the indexes `[left, right]` of a pair adding to target, or `None`.", starter: `def pair_sum(nums, target):\n    # your code here\n    pass\n`, tests: [['pair_sum([1, 3, 4, 6, 8, 11], 10)', '[2, 3]'], ['pair_sum([2, 7, 11, 15], 9)', '[0, 1]'], ['pair_sum([1, 2], 9)', 'None'], ['pair_sum([], 1)', 'None']], hint: "Start at both ends. Compare the sum to the target to decide which to move.", solution: `def pair_sum(nums, target):\n    l, r = 0, len(nums) - 1\n    while l < r:\n        s = nums[l] + nums[r]\n        if s == target:\n            return [l, r]\n        if s < target:\n            l += 1\n        else:\n            r -= 1\n    return None\n` },
    { id: 'dedupe', title: 'Remove duplicates in place', prompt: "`nums` is sorted. Write `dedupe(nums)` that moves the unique values to the front and returns how many there are.", starter: `def dedupe(nums):\n    # your code here\n    pass\n`, tests: [['dedupe([1, 1, 2])', '2'], ['dedupe([0, 0, 1, 1, 1, 2, 2, 3, 3, 4])', '5'], ['dedupe([])', '0'], ['dedupe([5])', '1']], hint: "`slow` marks the last unique value. Handle the empty list first.", solution: `def dedupe(nums):\n    if not nums:\n        return 0\n    slow = 0\n    for fast in range(1, len(nums)):\n        if nums[fast] != nums[slow]:\n            slow += 1\n            nums[slow] = nums[fast]\n    return slow + 1\n` },
  ],
  homework: ["Solve Valid Palindrome on paper first, then in code, ignoring non-letters.", "Try the pair-sum animation with a target that doesn't exist and count the checks.", "Explain to a friend, in your own words, why moving the shorter wall in Container With Most Water is safe."],
  reallife: [
    { q: "You have two sorted price lists and a gift card with an exact value. How do you find two items that use it fully, one cheap and one expensive?", a: "Combine them into one sorted list, then run two pointers from the ends. If the sum is too much, try a cheaper expensive item. If too little, try a pricier cheap one." },
    { q: "Two runners start at opposite ends of a track and walk towards each other, checking lockers. Why is this faster than each person checking every pair?", a: "Each check eliminates a locker for good, so the total is at most n steps rather than n²." },
  ],
  leetcode: [[125, 'Valid Palindrome', 'valid-palindrome', 'Easy'], [26, 'Remove Duplicates from Sorted Array', 'remove-duplicates-from-sorted-array', 'Easy'], [167, 'Two Sum II - Input Array Is Sorted', 'two-sum-ii-input-array-is-sorted', 'Medium'], [11, 'Container With Most Water', 'container-with-most-water', 'Medium'], [15, '3Sum', '3sum', 'Medium']],
});

T({
  id: 'sliding-window', stage: 's2', title: 'Sliding window', tagline: 'Reuse work when looking at consecutive items.', mins: 25,
  analogy: "Looking at a long street through a train window. As the train moves, one house disappears on one side and one appears on the other. You don't need to re-count everything you see.",
  learn: [
    "A window is a stretch of consecutive items between two positions. The trick is to update what you know when the window moves, rather than recomputing from scratch.",
    "**Fixed size**: add the new right item and subtract the item that fell off the left. Every slide is O(1).",
    "**Variable size**: grow the window by moving `right`. While the window breaks the rule, shrink it by moving `left`. After each step, record the best.",
    "Why is a nested `while` still O(n)? `left` only ever moves forward and can move at most n times in total across the whole run. Each item enters and leaves once.",
    "Clue words in a question: **subarray**, **substring**, **consecutive**, **longest** or **shortest with a condition**.",
  ],
  keys: ["Windows are consecutive items", "Update instead of recomputing", "Grow right, shrink left", "Left never moves back, so it's O(n)"],
  anims: ['sw-maxsum', 'sw-longest'],
  code: [{ title: 'The variable window template', src: `def shortest_at_least(nums, target):
    left = total = 0
    best = float("inf")
    for right, x in enumerate(nums):
        total += x                       # grow
        while total >= target:           # rule holds: shrink
            best = min(best, right - left + 1)
            total -= nums[left]
            left += 1
    return 0 if best == float("inf") else best

print(shortest_at_least([2, 3, 1, 2, 4, 3], 7))  # 2` }],
  quiz: [
    { q: "After sliding a fixed window one step, how do you update its sum?", o: ["Re-add everything", "Add the new item and subtract the old one", "Multiply by 2", "Sort it"], a: 1, why: "Only two items changed, so this takes O(1)." },
    { q: "Why isn't a `while` inside a `for` O(n²) in a sliding window?", o: ["It's faster hardware", "`left` only moves forward, n times at most in total", "Windows are small", "It is O(n²)"], a: 1, why: "All the inner loop rounds combined can't exceed n." },
    { q: "Which question suits a sliding window?", o: ["Sort these numbers", "Longest substring with at most 2 different letters", "Is the graph connected?", "Find the median of two lists"], a: 1, why: "It asks about a consecutive stretch with a condition." },
    { q: "When do you shrink a variable window for 'longest without repeats'?", o: ["Every step", "When a letter repeats", "When the window is empty", "Only at the end"], a: 1, why: "A repeat breaks the rule, so shrink until the rule holds again." },
  ],
  coding: [
    { id: 'best-window', title: 'Maximum sum of k items', prompt: "Write `best_window(nums, k)` that returns the largest sum of any `k` consecutive items. You can assume `len(nums) >= k`.", starter: `def best_window(nums, k):\n    # your code here\n    pass\n`, tests: [['best_window([2, 1, 5, 1, 3, 2], 3)', '9'], ['best_window([1, 2, 3], 1)', '3'], ['best_window([-1, -2, -3], 2)', '-3']], hint: "Compute the first window with `sum`, then slide.", solution: `def best_window(nums, k):\n    w = sum(nums[:k])\n    best = w\n    for r in range(k, len(nums)):\n        w += nums[r] - nums[r - k]\n        best = max(best, w)\n    return best\n` },
    { id: 'longest-unique', title: 'Longest substring without repeats', prompt: "Write `longest(s)` returning the length of the longest substring with no repeated characters.", starter: `def longest(s):\n    # your code here\n    pass\n`, tests: [['longest("abcabcbb")', '3'], ['longest("bbbbb")', '1'], ['longest("pwwkew")', '3'], ['longest("")', '0']], hint: "Keep a set of letters in the window. While the new letter is in the set, remove from the left.", solution: `def longest(s):\n    seen = set()\n    left = best = 0\n    for right, ch in enumerate(s):\n        while ch in seen:\n            seen.remove(s[left])\n            left += 1\n        seen.add(ch)\n        best = max(best, right - left + 1)\n    return best\n` },
  ],
  homework: ["Modify the window to return the start index of the best window rather than the sum.", "Solve 'Longest Substring with at most 2 distinct letters' with a dict of counts.", "Try the longest-substring animation with `abba`. Explain why the left pointer jumps as it does."],
  reallife: [
    { q: "A website wants the highest number of visitors in any 7-day stretch from a year of daily data. How do you do it fast?", a: "A fixed window of size 7. Add the new day and subtract the day that leaves. That's 365 quick updates rather than 365 × 7 additions." },
    { q: "A streaming app finds the longest period with no repeated song in your history. Which technique fits?", a: "A variable sliding window with a set of songs currently in the window." },
  ],
  leetcode: [[643, 'Maximum Average Subarray I', 'maximum-average-subarray-i', 'Easy'], [3, 'Longest Substring Without Repeating Characters', 'longest-substring-without-repeating-characters', 'Medium'], [209, 'Minimum Size Subarray Sum', 'minimum-size-subarray-sum', 'Medium'], [424, 'Longest Repeating Character Replacement', 'longest-repeating-character-replacement', 'Medium'], [567, 'Permutation in String', 'permutation-in-string', 'Medium']],
});

T({
  id: 'prefix-sum', stage: 's2', title: 'Prefix sums', tagline: 'Spend one pass now to answer range questions instantly.', mins: 20,
  analogy: "A car's odometer. To know how far you drove between Monday and Friday, you don't add every trip. You subtract the Monday reading from the Friday reading.",
  learn: [
    "A prefix sum list stores running totals: `prefix[i]` is the sum of the first `i` numbers. Building it takes one O(n) pass.",
    "Then the sum from index `l` to `r` is `prefix[r + 1] - prefix[l]`. Everything before `l` is counted in both, so it cancels out. Each question costs O(1).",
    "A strong extension combines this with a dict. To count subarrays summing to k, walk along keeping the running sum, and ask how many earlier running sums equal `sum - k`. That finds them all in O(n), even with negative numbers, where a sliding window fails.",
    "The extra `0` at the start of the list stands for the empty prefix. It removes a special case and saves many off-by-one mistakes.",
  ],
  keys: ["Build once in O(n)", "Each range sum is one subtraction", "Start the list with 0", "Running sum + dict finds subarrays with a target sum"],
  anims: ['prefix-build'],
  code: [{ title: 'Count subarrays that sum to k', src: `def count_k(nums, k):
    seen = {0: 1}   # the empty prefix
    total = count = 0
    for x in nums:
        total += x
        count += seen.get(total - k, 0)
        seen[total] = seen.get(total, 0) + 1
    return count

print(count_k([1, 2, 3], 3))    # 2
print(count_k([1, -1, 1], 1))   # 3` }],
  quiz: [
    { q: "With `prefix = [0, 3, 4, 8]`, what's the sum of indexes 1 to 2 of the original list?", o: ["4", "5", "8", "1"], a: 1, why: "`prefix[3] - prefix[1]` = 8 − 3 = 5." },
    { q: "What's the cost of answering one range sum after building?", o: ["O(1)", "O(log n)", "O(n)", "O(n²)"], a: 0, why: "It's a single subtraction." },
    { q: "Why start prefix with 0?", o: ["Python requires it", "To handle ranges starting at index 0 cleanly", "To save memory", "To sort it"], a: 1, why: "`prefix[r+1] - prefix[0]` then works with no special case." },
    { q: "Why not use a sliding window for 'subarray sum equals k' with negative numbers?", o: ["Windows don't work on arrays", "Growing the window might lower the sum, so you can't know when to shrink", "It's too much memory", "Negatives crash Python"], a: 1, why: "The window trick depends on growth always increasing the sum." },
  ],
  coding: [
    { id: 'range-sum', title: 'Range sum queries', prompt: "Write `range_sums(nums, queries)` where each query is `(l, r)`. Return a list with the sum from `l` to `r` inclusive for each query. Build a prefix list first.", starter: `def range_sums(nums, queries):\n    # your code here\n    pass\n`, tests: [['range_sums([3, 1, 4, 2], [(0, 1), (1, 3), (2, 2)])', '[4, 7, 4]'], ['range_sums([5], [(0, 0)])', '[5]'], ['range_sums([1, 2], [])', '[]']], hint: "`prefix[r + 1] - prefix[l]`", solution: `def range_sums(nums, queries):\n    prefix = [0]\n    for x in nums:\n        prefix.append(prefix[-1] + x)\n    return [prefix[r + 1] - prefix[l] for l, r in queries]\n` },
    { id: 'pivot', title: 'Find the balance point', prompt: "Write `pivot(nums)` returning the first index where the sum of items to its left equals the sum of items to its right, or -1.", starter: `def pivot(nums):\n    # your code here\n    pass\n`, tests: [['pivot([1, 7, 3, 6, 5, 6])', '3'], ['pivot([1, 2, 3])', '-1'], ['pivot([2, 1, -1])', '0']], hint: "Left sum grows as you walk. Right sum = total − left − current.", solution: `def pivot(nums):\n    total = sum(nums)\n    left = 0\n    for i, x in enumerate(nums):\n        if left == total - left - x:\n            return i\n        left += x\n    return -1\n` },
  ],
  homework: ["Trace `count_k([1, 2, 3], 3)` on paper, writing the `seen` dict at each step.", "Build a 2-D prefix sum for a grid and answer one rectangle query.", "Use the animation and predict each answer before you press Next."],
  reallife: [
    { q: "A bank has 10 years of daily balances changes and gets thousands of 'how much changed between date A and date B?' questions. What should it store?", a: "A running total per day. Each question becomes a single subtraction rather than adding up thousands of days." },
    { q: "How does a fitness app show steps for any date range almost instantly?", a: "It can keep cumulative totals by day and subtract two readings, exactly like a prefix sum." },
  ],
  leetcode: [[303, 'Range Sum Query - Immutable', 'range-sum-query-immutable', 'Easy'], [724, 'Find Pivot Index', 'find-pivot-index', 'Easy'], [560, 'Subarray Sum Equals K', 'subarray-sum-equals-k', 'Medium'], [525, 'Contiguous Array', 'contiguous-array', 'Medium']],
});

T({
  id: 'strings', stage: 's2', title: 'Strings', tagline: 'Text as a read-only list of characters.', mins: 25,
  analogy: "A printed sentence. You can read any letter or photocopy a part, but you can't change a letter on the page. To change it, you print a new page.",
  learn: [
    "A string behaves like a list of characters: `s[0]`, `s[-1]`, slices and `for ch in s` all work. But strings are **immutable**: `s[0] = 'x'` is an error, and every change creates a new string.",
    "This makes one common pattern accidentally slow. `s += ch` inside a loop can copy the whole string each time, which adds up to O(n²). Instead, collect pieces in a list and call `''.join(parts)` at the end.",
    "Useful tools are `s.lower()`, `s.split()`, `' '.join(words)`, `ch.isalpha()`, `ch.isdigit()`, and `ord(ch)` and `chr(n)` for converting between letters and codes.",
    "Most string problems reuse patterns you've seen: two pointers for palindromes, sliding windows for substrings, and counting dicts for anagrams.",
  ],
  keys: ["Strings can't be changed in place", "Build with a list and `''.join`", "Counting solves anagrams", "`ord('a')` turns a letter into a number"],
  anims: ['str-palindrome', 'str-anagram'],
  code: [{ title: 'Common moves', src: `s = "Hello World"
print(s.lower(), s[::-1])
print(s.split())            # ['Hello', 'World']

parts = []
for ch in s:
    if ch.isalpha():
        parts.append(ch.upper())
print("".join(parts))       # HELLOWORLD

print(ord("a"), chr(98))    # 97 b

from collections import Counter
print(Counter("hello"))     # letter counts in one line` }],
  quiz: [
    { q: "What does `'abc'[::-1]` give?", o: ["abc", "cba", "An error", "c"], a: 1, why: "A slice with step −1 reads the string backwards." },
    { q: "What happens with `s = 'cat'; s[0] = 'b'`?", o: ["s becomes bat", "TypeError", "s becomes bcat", "Nothing"], a: 1, why: "Strings are immutable, so assigning to a position raises an error." },
    { q: "What's the best way to build a long string from pieces?", o: ["`+=` in a loop", "Append to a list and `''.join`", "Use recursion", "Sort it"], a: 1, why: "Join copies everything once, giving O(n) overall." },
    { q: "Two words are anagrams when:", o: ["They have the same first letter", "They have the same letter counts", "One is reversed", "They're the same length"], a: 1, why: "Anagrams are rearrangements, so every letter's count must match." },
  ],
  coding: [
    { id: 'is-pal', title: 'Valid palindrome', prompt: "Write `is_palindrome(s)` that ignores case and any non-alphanumeric characters. `\"A man, a plan, a canal: Panama\"` is True.", starter: `def is_palindrome(s):\n    # your code here\n    pass\n`, tests: [['is_palindrome("A man, a plan, a canal: Panama")', 'True'], ['is_palindrome("race a car")', 'False'], ['is_palindrome(" ")', 'True']], hint: "Keep only characters where `ch.isalnum()`, lowercase them, then compare with the reverse.", solution: `def is_palindrome(s):\n    clean = [c.lower() for c in s if c.isalnum()]\n    i, j = 0, len(clean) - 1\n    while i < j:\n        if clean[i] != clean[j]:\n            return False\n        i += 1\n        j -= 1\n    return True\n` },
    { id: 'anagram', title: 'Valid anagram', prompt: "Write `is_anagram(a, b)` that returns True if `b` is a rearrangement of `a`.", starter: `def is_anagram(a, b):\n    # your code here\n    pass\n`, tests: [['is_anagram("listen", "silent")', 'True'], ['is_anagram("rat", "car")', 'False'], ['is_anagram("a", "ab")', 'False'], ['is_anagram("", "")', 'True']], hint: "Count letters up for `a` and down for `b`. Or compare `sorted(a)` and `sorted(b)`, which costs a little more.", solution: `def is_anagram(a, b):\n    if len(a) != len(b):\n        return False\n    count = {}\n    for ch in a:\n        count[ch] = count.get(ch, 0) + 1\n    for ch in b:\n        count[ch] = count.get(ch, 0) - 1\n    return all(v == 0 for v in count.values())\n` },
  ],
  homework: ["Write a function that reverses the order of words in a sentence.", "Find the first character that appears only once in a string.", "Use `time.time()` to compare building a 200,000-character string with `+=` and with `join`."],
  reallife: [
    { q: "A search bar ignores spaces and capitals when matching names. Which string steps would you use?", a: "`s.lower()` and removing spaces with `replace` or `split`/`join`, then compare the cleaned strings." },
    { q: "A word game checks if your letters can make a word. How?", a: "Count the letters you own and those the word needs. The word works if your count is at least as big for every letter." },
  ],
  leetcode: [[242, 'Valid Anagram', 'valid-anagram', 'Easy'], [125, 'Valid Palindrome', 'valid-palindrome', 'Easy'], [14, 'Longest Common Prefix', 'longest-common-prefix', 'Easy'], [151, 'Reverse Words in a String', 'reverse-words-in-a-string', 'Medium'], [5, 'Longest Palindromic Substring', 'longest-palindromic-substring', 'Medium']],
});

T({
  id: 'recursion', stage: 's3', title: 'Recursion', tagline: 'Solve a big problem by trusting a smaller copy of itself.', mins: 30,
  analogy: "You're in a long queue and want your position. You ask the person in front, who asks the person in front of them. The first person says 1. The answers come back along the queue, each adding 1.",
  learn: [
    "A recursive function calls itself on a smaller input. Every recursive function needs two parts: a **base case** that stops, and a **recursive case** that moves toward the base case.",
    "Trust is the secret to writing these. Assume the call on the smaller input already works. Then ask only: how do I use that answer to build mine? Don't try to trace every level in your head.",
    "Each call waits on the call stack. Without a working base case you'll hit `RecursionError`. Python's default depth limit is around 1000 calls.",
    "If a function makes two calls, the work can explode, as you'll see in the Fibonacci tree. Later on, dynamic programming fixes this by saving results. Time for a recursive function is roughly calls × work per call.",
  ],
  keys: ["Base case stops, recursive case shrinks", "Trust the smaller call", "Depth uses stack space", "Two calls per level can mean O(2ⁿ)"],
  anims: ['rec-factorial', 'rec-fib'],
  code: [{ title: 'Three recursive shapes', src: `def fact(n):             # one call: a line
    if n <= 1:
        return 1
    return n * fact(n - 1)

def fib(n):              # two calls: a tree
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

def power(x, n):         # halving: very shallow
    if n == 0:
        return 1
    half = power(x, n // 2)
    return half * half if n % 2 == 0 else half * half * x

print(fact(5), fib(10), power(2, 10))  # 120 55 1024` }],
  quiz: [
    { q: "What happens without a base case?", o: ["It returns 0", "It runs until RecursionError", "It runs once", "Python adds one"], a: 1, why: "Calls keep stacking until Python stops it." },
    { q: "How many frames are on the stack at the deepest point of `fact(5)`?", o: ["1", "2", "5", "120"], a: 2, why: "fact(5), fact(4), fact(3), fact(2), fact(1)." },
    { q: "Why is plain `fib(40)` so slow?", o: ["Numbers get big", "It repeats the same work exponentially", "Python's slow at addition", "The stack is too deep"], a: 1, why: "Each call makes two more, re-solving the same values many times." },
    { q: "What's the stack depth of `power(x, n)` with halving?", o: ["O(1)", "O(log n)", "O(n)", "O(2ⁿ)"], a: 1, why: "n halves with each call." },
  ],
  coding: [
    { id: 'sum-digits', title: 'Sum of digits', prompt: "Write recursive `sum_digits(n)` for a non-negative integer. `sum_digits(123)` is 6.", starter: `def sum_digits(n):\n    # your code here\n    pass\n`, tests: [['sum_digits(123)', '6'], ['sum_digits(0)', '0'], ['sum_digits(9999)', '36']], hint: "Last digit is `n % 10`, the rest is `n // 10`.", solution: `def sum_digits(n):\n    if n == 0:\n        return 0\n    return n % 10 + sum_digits(n // 10)\n` },
    { id: 'rev-str', title: 'Reverse a string', prompt: "Write recursive `rev(s)` without slicing the whole string backwards with `[::-1]`.", starter: `def rev(s):\n    # your code here\n    pass\n`, tests: [['rev("abc")', '"cba"'], ['rev("")', '""'], ['rev("a")', '"a"']], hint: "The reverse of `s` is the reverse of `s[1:]` followed by `s[0]`.", solution: `def rev(s):\n    if len(s) <= 1:\n        return s\n    return rev(s[1:]) + s[0]\n` },
  ],
  homework: ["Write recursive `count_down(n)` that prints n to 1, then swap the print and the call. What changes?", "Solve Towers of Hanoi for 3 disks by hand, then write the code.", "Add a counter to `fib` and record the calls for n = 10, 20, 30."],
  reallife: [
    { q: "How does a computer work out the total size of a folder containing more folders?", a: "Recursively: a folder's size is the sum of its files plus the size of each subfolder. An empty folder is the base case." },
    { q: "Russian dolls: to find the smallest, what's the base case and recursive step?", a: "Base case: this doll doesn't open. Step: open the doll and repeat on the next one inside." },
  ],
  leetcode: [[509, 'Fibonacci Number', 'fibonacci-number', 'Easy'], [206, 'Reverse Linked List', 'reverse-linked-list', 'Easy'], [231, 'Power of Two', 'power-of-two', 'Easy'], [50, 'Pow(x, n)', 'powx-n', 'Medium']],
});
