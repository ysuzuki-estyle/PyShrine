window.PROBLEMS = [
  {
    id: 1,
    title: "FizzBuzz",
    difficulty: "easy",
    description: "整数 `n` が与えられます。1 から n までの各整数について、以下のルールで文字列のリストを返してください。\n\n- 3 の倍数のとき: \"Fizz\"\n- 5 の倍数のとき: \"Buzz\"\n- 3 と 5 両方の倍数のとき: \"FizzBuzz\"\n- それ以外: 数字をそのまま文字列に変換",
    examples: [
      { input: "n = 5",  output: '["1", "2", "Fizz", "4", "Buzz"]' },
      { input: "n = 15", output: '["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"]' }
    ],
    constraints: ["1 ≤ n ≤ 10000"],
    starterCode: "def fizzbuzz(n: int) -> list:\n    # ここにコードを書いてください\n    pass",
    testCases: [
      { id: 1, inputDisplay: "n = 3",  callExpr: "fizzbuzz(3)",  expected: ["1","2","Fizz"] },
      { id: 2, inputDisplay: "n = 5",  callExpr: "fizzbuzz(5)",  expected: ["1","2","Fizz","4","Buzz"] },
      { id: 3, inputDisplay: "n = 15", callExpr: "fizzbuzz(15)", expected: ["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"] }
    ],
    hiddenTestCases: [
      { id: 4, inputDisplay: "n = 1",  callExpr: "fizzbuzz(1)",  expected: ["1"] },
      { id: 5, inputDisplay: "n = 30", callExpr: "fizzbuzz(30)", expected: ["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz","16","17","Fizz","19","Buzz","Fizz","22","23","Fizz","Buzz","26","Fizz","28","29","FizzBuzz"] }
    ]
  },
  {
    id: 2,
    title: "二数の和",
    difficulty: "easy",
    description: "整数のリスト `nums` と整数 `target` が与えられます。\n\n合計が `target` になる 2 つの要素のインデックスを返してください。\n\n- 各入力に対して解は必ず 1 つ存在します\n- 同じ要素を 2 度使うことはできません\n- 答えの順序はどちらでも構いません",
    examples: [
      { input: "nums = [2, 7, 11, 15], target = 9", output: "[0, 1]  // nums[0] + nums[1] = 9" },
      { input: "nums = [3, 2, 4], target = 6",       output: "[1, 2]" }
    ],
    constraints: ["2 ≤ nums.length ≤ 10000", "-10^9 ≤ nums[i] ≤ 10^9", "解は必ず 1 つ存在する"],
    starterCode: "def two_sum(nums: list, target: int) -> list:\n    # ここにコードを書いてください\n    pass",
    testCases: [
      { id: 1, inputDisplay: "nums=[2,7,11,15], target=9", callExpr: "sorted(two_sum([2,7,11,15], 9))", expected: [0,1] },
      { id: 2, inputDisplay: "nums=[3,2,4], target=6",     callExpr: "sorted(two_sum([3,2,4], 6))",     expected: [1,2] },
      { id: 3, inputDisplay: "nums=[3,3], target=6",       callExpr: "sorted(two_sum([3,3], 6))",       expected: [0,1] }
    ],
    hiddenTestCases: [
      { id: 4, inputDisplay: "nums=[1,2,3,4,5], target=9",         callExpr: "sorted(two_sum([1,2,3,4,5], 9))",         expected: [3,4] },
      { id: 5, inputDisplay: "nums=[-1,-2,-3,-4,-5], target=-8",   callExpr: "sorted(two_sum([-1,-2,-3,-4,-5], -8))",   expected: [2,4] }
    ]
  },
  {
    id: 3,
    title: "回文判定",
    difficulty: "easy",
    description: "文字列 `s` が与えられます。\n\n`s` が回文（前から読んでも後ろから読んでも同じ）かどうかを判定し、`True` または `False` を返してください。\n\n- 英字は大文字・小文字を区別しません\n- 英数字以外の文字（スペース、記号など）は無視してください",
    examples: [
      { input: 's = "A man a plan a canal Panama"', output: "True" },
      { input: 's = "race a car"',                 output: "False" },
      { input: 's = " "',                           output: "True" }
    ],
    constraints: ["1 ≤ s.length ≤ 200000", "s は ASCII 文字のみ"],
    starterCode: "def is_palindrome(s: str) -> bool:\n    # ここにコードを書いてください\n    pass",
    testCases: [
      { id: 1, inputDisplay: 's = "racecar"',                      callExpr: 'is_palindrome("racecar")',                      expected: true },
      { id: 2, inputDisplay: 's = "A man a plan a canal Panama"',  callExpr: 'is_palindrome("A man a plan a canal Panama")',  expected: true },
      { id: 3, inputDisplay: 's = "race a car"',                   callExpr: 'is_palindrome("race a car")',                   expected: false }
    ],
    hiddenTestCases: [
      { id: 4, inputDisplay: 's = " "',                             callExpr: 'is_palindrome(" ")',                             expected: true },
      { id: 5, inputDisplay: 's = "Was it a car or a cat I saw"',  callExpr: 'is_palindrome("Was it a car or a cat I saw")',  expected: true }
    ]
  },
  {
    id: 4,
    title: "最大部分配列和",
    difficulty: "medium",
    description: "整数のリスト `nums` が与えられます。\n\n連続する部分配列の合計が最大になる値を返してください。\n\n部分配列は少なくとも 1 つの要素を含む必要があります。\n\n例: nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4] の場合、部分配列 [4, -1, 2, 1] の合計 6 が最大です。",
    examples: [
      { input: "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]", output: "6  // [4, -1, 2, 1] の合計" },
      { input: "nums = [1]",                               output: "1" },
      { input: "nums = [5, 4, -1, 7, 8]",                 output: "23" }
    ],
    constraints: ["1 ≤ nums.length ≤ 100000", "-10000 ≤ nums[i] ≤ 10000"],
    starterCode: "def max_subarray(nums: list) -> int:\n    # ここにコードを書いてください\n    pass",
    testCases: [
      { id: 1, inputDisplay: "nums = [-2,1,-3,4,-1,2,1,-5,4]", callExpr: "max_subarray([-2,1,-3,4,-1,2,1,-5,4])", expected: 6  },
      { id: 2, inputDisplay: "nums = [1]",                      callExpr: "max_subarray([1])",                      expected: 1  },
      { id: 3, inputDisplay: "nums = [5,4,-1,7,8]",            callExpr: "max_subarray([5,4,-1,7,8])",             expected: 23 }
    ],
    hiddenTestCases: [
      { id: 4, inputDisplay: "nums = [-1]",    callExpr: "max_subarray([-1])",    expected: -1 },
      { id: 5, inputDisplay: "nums = [-2,-1]", callExpr: "max_subarray([-2,-1])", expected: -1 }
    ]
  },
  {
    id: 5,
    title: "有効な括弧",
    difficulty: "medium",
    description: "'('、')'、'{'、'}'、'['、']' のみを含む文字列 `s` が与えられます。\n\n文字列が有効かどうかを判定してください。\n\n有効な条件:\n- 開き括弧は同じ種類の閉じ括弧で閉じられている\n- 開き括弧は正しい順序で閉じられている\n- 各閉じ括弧に対応する開き括弧が存在する",
    examples: [
      { input: 's = "()"',      output: "True" },
      { input: 's = "()[]{}"',  output: "True" },
      { input: 's = "(]"',      output: "False" },
      { input: 's = "([)]"',    output: "False" }
    ],
    constraints: ["1 ≤ s.length ≤ 10000", "s は括弧文字のみ含む"],
    starterCode: "def is_valid(s: str) -> bool:\n    # ここにコードを書いてください\n    pass",
    testCases: [
      { id: 1, inputDisplay: 's = "()"',     callExpr: 'is_valid("()")',     expected: true  },
      { id: 2, inputDisplay: 's = "()[]{}"', callExpr: 'is_valid("()[]{}")', expected: true  },
      { id: 3, inputDisplay: 's = "(]"',     callExpr: 'is_valid("(]")',     expected: false }
    ],
    hiddenTestCases: [
      { id: 4, inputDisplay: 's = "([)]"', callExpr: 'is_valid("([)]")', expected: false },
      { id: 5, inputDisplay: 's = "{[]}"', callExpr: 'is_valid("{[]}")', expected: true  }
    ]
  }
];
