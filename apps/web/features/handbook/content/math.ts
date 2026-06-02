import type { HandbookTopic } from "../model";

export const math: HandbookTopic = {
  slug: "math",
  title: "Math",
  tagline:
    "GCD, primes & sieves, modular arithmetic, fast exponentiation, and combinatorics under a modulus.",
  icon: "Sigma",
  group: "Strings & Math",
  sections: [
    {
      id: "overview",
      title: "Overview & when to use it",
      body: `Math problems reward recognizing a formula or a number-theoretic property instead of brute force. The recurring tools are: GCD/LCM, prime sieves and factorization, modular arithmetic (because answers are taken \`mod 1e9+7\`), fast exponentiation, and combinatorics (\`nCr\`).

Signals:

- "return the answer **modulo 1e9+7**" → modular arithmetic + fast power for inverses.
- "count the number of ways …" → combinatorics.
- "primes / divisors / factors" → sieve or factorization.
- "x raised to a huge power" → binary exponentiation.
- "fractions / ratios / repeating decimals" → GCD.`,
    },
    {
      id: "prerequisites",
      title: "Prerequisites",
      body: `- Integer arithmetic, overflow awareness (use \`long long\`).
- Modular arithmetic identities: \`(a+b) % m\`, \`(a*b) % m\`, and modular inverse via Fermat's little theorem.

Related: [Bit Manipulation](/handbook/bit-manipulation), [Dynamic Programming](/handbook/dynamic-programming) (counting DP often needs \`nCr\`).`,
    },
    {
      id: "gcd",
      title: "GCD, LCM & the Euclidean algorithm",
      body: `\`gcd\` runs in \`O(log min(a,b))\`. \`lcm(a,b) = a / gcd(a,b) * b\` (divide first to avoid overflow).

\`\`\`cpp
// GCD and LCM (C++17 has std::gcd / std::lcm in <numeric>)
long long gcd(long long a, long long b) { return b ? gcd(b, a % b) : a; }
long long lcm(long long a, long long b) { return a / gcd(a, b) * b; }
\`\`\`

The **extended Euclidean algorithm** also finds \`x, y\` with \`ax + by = gcd(a,b)\` — the basis for modular inverses when the modulus isn't prime.

\`\`\`cpp
// Extended GCD: returns g = gcd(a,b) and sets x,y so that a*x + b*y = g
long long extgcd(long long a, long long b, long long& x, long long& y) {
  if (!b) {
    x = 1;
    y = 0;
    return a;
  }
  long long x1, y1, g = extgcd(b, a % b, x1, y1);
  x = y1;
  y = x1 - (a / b) * y1;
  return g;
}
\`\`\``,
    },
    {
      id: "primes",
      title: "Primes: sieve & factorization",
      body: `The **Sieve of Eratosthenes** lists primes up to \`n\` in \`O(n log log n)\`.

\`\`\`cpp
// Sieve of Eratosthenes: isPrime[0..n]
vector<bool> sieve(int n) {
  vector<bool> isPrime(n + 1, true);
  isPrime[0] = isPrime[1] = false;
  for (int i = 2; (long long)i * i <= n; i++) {
    if (isPrime[i]) {
      for (int j = i * i; j <= n; j += i) {
        isPrime[j] = false;
      }
    }
  }
  return isPrime;
}
\`\`\`

Trial-division factorization up to \`sqrt(n)\` is enough for single numbers:

\`\`\`cpp
// Prime factorization of n: list of (prime, exponent)
vector<pair<long long, int>> factorize(long long n) {
  vector<pair<long long, int>> f;
  for (long long p = 2; p * p <= n; p++) {
    if (n % p == 0) {
      int e = 0;
      while (n % p == 0) {
        n /= p;
        e++;
      }
      f.push_back({p, e});
    }
  }
  if (n > 1) {
    f.push_back({n, 1});
  }
  return f;
}
\`\`\`

The **smallest prime factor (SPF)** sieve factorizes many numbers in \`O(log n)\` each — handy for Count Primes (LC 204) and divisor problems.`,
    },
    {
      id: "modpow",
      title: "Modular arithmetic & fast exponentiation",
      body: `Compute \`a^b mod m\` in \`O(log b)\` by squaring.

\`\`\`cpp
// Binary exponentiation: a^b mod m
long long power(long long a, long long b, long long m) {
  long long res = 1 % m;
  a %= m;
  while (b > 0) {
    if (b & 1) {
      res = res * a % m;
    }
    a = a * a % m;
    b >>= 1;
  }
  return res;
}
\`\`\`

When \`m\` is **prime**, the modular inverse of \`a\` is \`a^(m-2) mod m\` (Fermat's little theorem):

\`\`\`cpp
// Modular inverse for prime modulus m
long long inv(long long a, long long m) { return power(a, m - 2, m); }
\`\`\`

Pow(x, n) (LC 50) is the floating version of binary exponentiation.`,
    },
    {
      id: "combinatorics",
      title: "Combinatorics under a modulus",
      body: `Precompute factorials and inverse factorials to answer \`nCr mod p\` in \`O(1)\`.

\`\`\`cpp
// nCr mod p (prime). Precompute fact[] and invfact[] once up to MX.
const long long MOD = 1e9 + 7;
const int MX = 200000;
long long fact[MX + 1], invfact[MX + 1];
void initComb() {
  fact[0] = 1;
  for (int i = 1; i <= MX; i++) {
    fact[i] = fact[i - 1] * i % MOD;
  }
  invfact[MX] = power(fact[MX], MOD - 2, MOD);  // see binary exponentiation
  for (int i = MX; i > 0; i--) {
    invfact[i - 1] = invfact[i] * i % MOD;
  }
}
long long nCr(int n, int r) {
  if (r < 0 || r > n) {
    return 0;
  }
  return fact[n] * invfact[r] % MOD * invfact[n - r] % MOD;
}
\`\`\`

Used for Unique Paths (closed form \`C(m+n-2, m-1)\`), counting-DP answers, and "number of ways" problems with large \`n\`.`,
    },
    {
      id: "misc",
      title: "Useful number-theory facts & tricks",
      body: `- **Sum 1..n** = \`n(n+1)/2\`; sum of an arithmetic series = \`(first+last)*count/2\`.
- **Count of multiples** of \`k\` in \`[1, n]\` = \`n / k\` (integer division).
- **Digit sum / digit reverse**: peel digits with \`% 10\` and \`/ 10\`; watch for overflow on reverse (LC 7).
- **Powers of two**: \`x\` is a power of two iff \`x > 0 && (x & (x-1)) == 0\` (see [Bit Manipulation](/handbook/bit-manipulation)).
- **GCD over an array** is associative — fold it; the whole array's GCD is the gcd of all elements.
- **Geometry basics**: orientation via cross product sign \`(\`(b-a)×(c-a)\`)\`; area of a polygon via the shoelace formula.
- **Expected value / probability**: linearity of expectation often turns a hard count into a sum of simple terms.`,
    },
    {
      id: "advanced-numbertheory",
      title: "Advanced number theory (sieve, Miller–Rabin, Pollard rho, CRT)",
      body: `**Linear sieve** computes the smallest prime factor (and the prime list) in \`O(n)\`, factorizing any \`m ≤ n\` by repeatedly dividing out \`spf[m]\`.

\`\`\`cpp
// Linear sieve: smallest prime factor + primes, O(n)
vector<int> linearSieve(int n) {
  vector<int> spf(n + 1, 0), primes;
  for (int i = 2; i <= n; i++) {
    if (!spf[i]) {
      spf[i] = i;
      primes.push_back(i);
    }
    for (int p : primes) {
      if (p > spf[i] || (long long)i * p > n) {
        break;
      }
      spf[i * p] = p;
    }
  }
  return spf;
}
\`\`\`

**Miller–Rabin + Pollard's rho** factorize 64-bit numbers far beyond \`sqrt(n)\` trial division.

\`\`\`cpp
// Deterministic Miller–Rabin (64-bit) and Pollard's rho
using u128 = __uint128_t;
long long mulmod(long long a, long long b, long long m) {
  return (u128)a * b % m;
}
long long powmod(long long a, long long b, long long m) {
  long long r = 1 % m;
  a %= m;
  while (b) {
    if (b & 1) {
      r = mulmod(r, a, m);
    }
    a = mulmod(a, a, m);
    b >>= 1;
  }
  return r;
}
bool isPrime(long long n) {
  if (n < 2) {
    return false;
  }
  for (long long p : {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37}) {
    if (n % p == 0) {
      return n == p;
    }
  }
  long long d = n - 1;
  int s = 0;
  while (!(d & 1)) {
    d >>= 1;
    s++;
  }
  for (long long a : {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37}) {
    long long x = powmod(a, d, n);
    if (x == 1 || x == n - 1) {
      continue;
    }
    bool composite = true;
    for (int i = 0; i < s - 1; i++) {
      x = mulmod(x, x, n);
      if (x == n - 1) {
        composite = false;
        break;
      }
    }
    if (composite) {
      return false;
    }
  }
  return true;
}
long long pollard(long long n) {
  if (n % 2 == 0) {
    return 2;
  }
  for (long long c = 1;; c++) {
    long long x = 2, y = 2, d = 1;
    auto f = [&](long long v) { return (mulmod(v, v, n) + c) % n; };
    while (d == 1) {
      x = f(x);
      y = f(f(y));
      d = __gcd(x > y ? x - y : y - x, n);
    }
    if (d != n) {
      return d;
    }
  }
}
\`\`\`

**Chinese Remainder Theorem** merges two congruences \`x ≡ r1 (mod m1)\`, \`x ≡ r2 (mod m2)\`.

\`\`\`cpp
// CRT for two moduli (uses extended GCD from the GCD section)
long long crt(long long r1, long long m1, long long r2, long long m2) {
  long long p, q, g = extgcd(m1, m2, p, q);  // m1*p + m2*q = g
  if ((r2 - r1) % g != 0) {
    return -1;  // no solution
  }
  long long lcm = m1 / g * m2, diff = (r2 - r1) / g;
  long long x = (r1 + (__int128)m1 * ((diff * p) % (m2 / g))) % lcm;
  return (x % lcm + lcm) % lcm;
}
\`\`\``,
    },
    {
      id: "advanced-combinatorics",
      title: "Advanced combinatorics & transforms",
      body: `- **Lucas' theorem** computes \`C(n, r) mod p\` for huge \`n, r\` and small prime \`p\` by multiplying \`C\` of the base-\`p\` digits.
- **Catalan numbers** \`C_n = C(2n, n)/(n+1)\` count balanced parentheses, BST shapes (LC 96 Unique Binary Search Trees), and triangulations.
- **Inclusion–exclusion & Möbius** count "coprime to n", "divisible by some set", and surjections — the backbone of counting problems like LC 1until divisor sums.
- **Matrix exponentiation** (see the DP chapter) solves linear-recurrence counting in \`O(d^3 log k)\`.
- **FFT / NTT** multiply polynomials (and thus do fast convolution / subset-sum counting) in \`O(n log n)\` — rare on LeetCode but the tool for "count pairs with sum s" at scale.
- **XOR / linear basis** (see Bit Manipulation) handles "maximum XOR subset" and rank over GF(2).

For modular counting, precompute factorials once and lean on Fermat inverses; escalate to Lucas / CRT only when the modulus is small or composite.`,
    },
    {
      id: "complexity",
      title: "Complexity cheatsheet",
      body: `| Operation | Time |
| --- | --- |
| GCD / extended GCD | \`O(log min(a,b))\` |
| Sieve up to n | \`O(n log log n)\` |
| Factorize one number | \`O(sqrt n)\` |
| Fast power / modular inverse | \`O(log b)\` |
| nCr with precompute | \`O(n)\` setup, \`O(1)\` query |`,
    },
    {
      id: "problems",
      title: "Representative LeetCode problems",
      body: `| ID | Problem | Technique |
| --- | --- | --- |
| 7 | [Reverse Integer](https://leetcode.cn/problems/reverse-integer) | digit peeling + overflow |
| 9 | [Palindrome Number](https://leetcode.cn/problems/palindrome-number) | digit math |
| 50 | [Pow(x, n)](https://leetcode.cn/problems/powx-n) | binary exponentiation |
| 62 | [Unique Paths](https://leetcode.cn/problems/unique-paths) | combinatorics (\`nCr\`) |
| 204 | [Count Primes](https://leetcode.cn/problems/count-primes) | sieve |
| 233 | [Number of Digit One](https://leetcode.cn/problems/number-of-digit-one) | digit counting |
| 365 | [Water and Jug Problem](https://leetcode.cn/problems/water-and-jug-problem) | GCD (Bézout) |
| 372 | [Super Pow](https://leetcode.cn/problems/super-pow) | modular exponentiation |
| 535 | [Encode/Decode TinyURL](https://leetcode.cn/problems/encode-and-decode-tinyurl) | base conversion |
| 1735 | [Count Ways to Make Array Product](https://leetcode.cn/problems/count-ways-to-make-array-with-product) | factorization + combinatorics |

**Advanced practice problems**

| ID | Problem | Technique |
| --- | --- | --- |
| 372 | [Super Pow](https://leetcode.cn/problems/super-pow) | modular exponentiation |
| 2400 | [Number of Ways to Reach a Position After Exactly k Steps](https://leetcode.cn/problems/number-of-ways-to-reach-a-position-after-exactly-k-steps) | combinatorics (nCr) |
| 2521 | [Distinct Prime Factors of Product of Array](https://leetcode.cn/problems/distinct-prime-factors-of-product-of-array) | sieve / factorization |
| 2543 | [Check if Point Is Reachable](https://leetcode.cn/problems/check-if-point-is-reachable) | gcd |
| 2761 | [Prime Pairs With Target Sum](https://leetcode.cn/problems/prime-pairs-with-target-sum) | sieve |
| 2954 | [Count the Number of Infection Sequences](https://leetcode.cn/problems/count-the-number-of-infection-sequences) | combinatorics |

**Recent medium problems (rating ≥ 1800)**

| ID | Problem | Rating | Technique |
| --- | --- | --- | --- |
| 3524 | [Find X Value of Array I](https://leetcode.cn/problems/find-x-value-of-array-i) | 2008 | modular arithmetic |
| 3756 | [Concatenate Non-Zero Digits and Multiply by Sum II](https://leetcode.cn/problems/concatenate-non-zero-digits-and-multiply-by-sum-ii) | 1968 | digit math |
| 3669 | [Balanced K-Factor Decomposition](https://leetcode.cn/problems/balanced-k-factor-decomposition) | 1917 | factorization + search |
| 3747 | [Count Distinct Integers After Removing Zeros](https://leetcode.cn/problems/count-distinct-integers-after-removing-zeros) | 1848 | digit math |
| 3558 | [Number of Ways to Assign Edge Weights I](https://leetcode.cn/problems/number-of-ways-to-assign-edge-weights-i) | 1845 | combinatorics |`,
    },
    {
      id: "pitfalls",
      title: "Pitfalls & tips",
      body: `- **Overflow is the #1 bug**: cast to \`long long\` *before* multiplying; take \`% MOD\` after every multiply.
- **Modular inverse needs a prime modulus** for Fermat; otherwise use extended GCD.
- **\`lcm\` overflow**: divide by \`gcd\` before multiplying.
- **Negative mod**: in C++ \`-5 % 3 == -2\`; normalize with \`((x % m) + m) % m\`.
- **Sieve bound**: use \`(long long)i*i <= n\` to avoid \`int\` overflow in the inner bound.
- **Don't precompute more than you need**: factorial tables sized to the max \`n\` in the constraints.`,
    },
  ],
};
