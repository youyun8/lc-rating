import type { HandbookTopic } from "../model";

export const strings: HandbookTopic = {
  slug: "strings",
  title: "Strings",
  tagline:
    "Two pointers, frequency counts, KMP / Z / rolling hash, tries, and palindrome techniques.",
  icon: "Type",
  group: "Strings & Math",
  sections: [
    {
      id: "overview",
      title: "Overview & when to use it",
      body: `String problems split into a few families: counting/frequency (anagrams), two-pointer scanning (palindromes, reversals), **pattern matching** (KMP, Z-function, rolling hash), prefix structures (**Trie**), and palindromic structure (expand-around-center, Manacher).

Signals:

- "is it a palindrome / longest palindromic …" → two pointers / expand-around-center / DP.
- "find a pattern in text" / "repeated substring" → KMP / Z / rolling hash.
- "words sharing prefixes", "autocomplete", "search words" → Trie.
- "anagram / permutation / character frequency" → counting (often with a [Sliding Window](/handbook/sliding-window)).`,
    },
    {
      id: "prerequisites",
      title: "Prerequisites",
      body: `- ASCII/char arithmetic (\`c - 'a'\`), \`std::string\` operations.
- [Sliding Window](/handbook/sliding-window) for substring constraints; [Data Structures](/handbook/data-structures) for hashing.
- Modular arithmetic for rolling hashes (see [Math](/handbook/math)).`,
    },
    {
      id: "twopointer",
      title: "Two pointers & frequency counting",
      body: `Symmetric scanning solves palindromes, reversals, and comparisons; a 26-element array handles letter frequency in \`O(1)\` per step.

\`\`\`cpp
// Valid palindrome ignoring non-alphanumerics (LC 125)
bool isPalindrome(string s) {
    int i = 0, j = s.size() - 1;
    while (i < j) {
        while (i < j && !isalnum(s[i])) i++;
        while (i < j && !isalnum(s[j])) j--;
        if (tolower(s[i]) != tolower(s[j])) return false;
        i++; j--;
    }
    return true;
}
\`\`\`

\`\`\`cpp
// Group anagrams (LC 49): signature = sorted letters (or a 26-count key)
vector<vector<string>> groupAnagrams(vector<string>& strs) {
    unordered_map<string, vector<string>> m;
    for (auto& s : strs) { string k = s; sort(k.begin(), k.end()); m[k].push_back(s); }
    vector<vector<string>> res;
    for (auto& [k, v] : m) res.push_back(v);
    return res;
}
\`\`\``,
    },
    {
      id: "palindrome",
      title: "Palindrome techniques",
      body: `**Expand around center**: every palindrome has a center (a char or a gap); expand outward. \`O(n^2)\` but simple and usually enough.

\`\`\`cpp
// Longest palindromic substring (LC 5) via center expansion
string longestPalindrome(string s) {
    int start = 0, len = 0;
    auto expand = [&](int l, int r) {
        while (l >= 0 && r < (int)s.size() && s[l] == s[r]) { l--; r++; }
        if (r - l - 1 > len) { len = r - l - 1; start = l + 1; }
    };
    for (int i = 0; i < (int)s.size(); i++) { expand(i, i); expand(i, i + 1); }
    return s.substr(start, len);
}
\`\`\`

For \`O(n)\` longest palindrome use **Manacher's algorithm** (advanced). Palindromic DP \`dp[i][j]\` (is \`s[i..j]\` a palindrome) powers Palindromic Substrings (LC 647) and Partitioning (LC 131/132).`,
    },
    {
      id: "kmp",
      title: "Pattern matching: KMP",
      body: `KMP matches a pattern in \`O(n + m)\` using the **prefix function** (longest proper prefix that is also a suffix), which lets matching never re-scan text characters.

\`\`\`cpp
// Prefix function (failure function) of a pattern
vector<int> prefixFunc(const string& p) {
    int m = p.size();
    vector<int> pi(m, 0);
    for (int i = 1; i < m; i++) {
        int j = pi[i - 1];
        while (j > 0 && p[i] != p[j]) j = pi[j - 1];
        if (p[i] == p[j]) j++;
        pi[i] = j;
    }
    return pi;
}
\`\`\`

\`\`\`cpp
// KMP search: return first index of pattern p in text t, else -1 (LC 28)
int kmp(const string& t, const string& p) {
    if (p.empty()) return 0;
    vector<int> pi = prefixFunc(p);
    int j = 0;
    for (int i = 0; i < (int)t.size(); i++) {
        while (j > 0 && t[i] != p[j]) j = pi[j - 1];
        if (t[i] == p[j]) j++;
        if (j == (int)p.size()) return i - j + 1;   // full match
    }
    return -1;
}
\`\`\`

The prefix function alone solves Shortest Palindrome (LC 214) and Repeated Substring Pattern (LC 459).`,
    },
    {
      id: "zfunc",
      title: "Z-function & rolling hash",
      body: `The **Z-function** gives, for each position, the length of the longest substring starting there that matches a prefix of the string — useful for matching and period detection.

\`\`\`cpp
// Z-function: z[i] = length of longest common prefix of s and s[i..]
vector<int> zFunction(const string& s) {
    int n = s.size();
    vector<int> z(n, 0); z[0] = n;
    for (int i = 1, l = 0, r = 0; i < n; i++) {
        if (i < r) z[i] = min(r - i, z[i - l]);
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
        if (i + z[i] > r) { l = i; r = i + z[i]; }
    }
    return z;
}
\`\`\`

**Rabin-Karp / polynomial rolling hash** compares substrings in \`O(1)\` after \`O(n)\` preprocessing — great for "longest duplicate substring" (LC 1044, with binary search on length).

\`\`\`cpp
// Polynomial prefix hash with a single 64-bit modulus
const unsigned long long B = 131;
vector<unsigned long long> h, pw;            // h[i] = hash of s[0..i-1]
void buildHash(const string& s) {
    int n = s.size(); h.assign(n + 1, 0); pw.assign(n + 1, 1);
    for (int i = 0; i < n; i++) { h[i+1] = h[i]*B + s[i]; pw[i+1] = pw[i]*B; }
}
unsigned long long sub(int l, int r) {       // hash of s[l..r]
    return h[r+1] - h[l] * pw[r - l + 1];
}
\`\`\``,
    },
    {
      id: "trie",
      title: "Trie (prefix tree)",
      body: `A Trie stores strings by shared prefixes, giving \`O(L)\` insert/search and powering autocomplete, word search, and XOR-maximization (a bitwise Trie).

\`\`\`cpp
// Trie supporting insert / search / startsWith (LC 208)
struct Trie {
    struct Node { Node* nxt[26] = {}; bool end = false; };
    Node* root = new Node();
    void insert(const string& w) {
        Node* cur = root;
        for (char c : w) { int k = c - 'a'; if (!cur->nxt[k]) cur->nxt[k] = new Node(); cur = cur->nxt[k]; }
        cur->end = true;
    }
    Node* walk(const string& w) {
        Node* cur = root;
        for (char c : w) { int k = c - 'a'; if (!cur->nxt[k]) return nullptr; cur = cur->nxt[k]; }
        return cur;
    }
    bool search(const string& w){ Node* n = walk(w); return n && n->end; }
    bool startsWith(const string& p){ return walk(p) != nullptr; }
};
\`\`\`

Add Word with wildcard '.' (LC 211) recurses across all children on a dot; Word Search II (LC 212) walks a Trie over the grid; Maximum XOR (LC 421) uses a binary Trie of bits.`,
    },
    {
      id: "manacher",
      title: "Manacher: all palindromes in O(n)",
      body: `Manacher's algorithm finds the longest palindromic substring (and the radius of every palindrome) in linear time by reusing previously computed radii inside the current rightmost palindrome. Inserting \`#\` between characters handles even and odd lengths uniformly.

\`\`\`cpp
// Manacher's algorithm: longest palindromic substring in O(n) (LC 5)
string longestPalindromeManacher(const string& s) {
    string t = "^";
    for (char c : s) { t += '#'; t += c; }
    t += "#$";                                  // sentinels remove bounds checks
    int n = t.size(), center = 0, right = 0;
    vector<int> p(n, 0);                         // p[i] = palindrome radius at i
    for (int i = 1; i < n - 1; i++) {
        if (i < right) p[i] = min(right - i, p[2 * center - i]); // mirror
        while (t[i + p[i] + 1] == t[i - p[i] - 1]) p[i]++;       // expand
        if (i + p[i] > right) { center = i; right = i + p[i]; }
    }
    int len = 0, c = 0;
    for (int i = 1; i < n - 1; i++) if (p[i] > len) { len = p[i]; c = i; }
    return s.substr((c - len) / 2, len);        // map back to the original string
}
\`\`\`

The radius array also answers Palindromic Substrings (LC 647) counts and feeds palindrome-partition DPs.`,
    },
    {
      id: "aho-corasick",
      title: "Aho–Corasick: multi-pattern matching",
      body: `To match **many** patterns against a text at once, build a trie of the patterns and add KMP-style *failure links* so a mismatch jumps to the longest proper suffix that is still a trie prefix. Total cost is \`O(sum of pattern lengths + text + matches)\`.

\`\`\`cpp
// Aho–Corasick automaton (lowercase). add() patterns, build(), then run over text.
struct AhoCorasick {
    struct Node { int nxt[26]; int fail = 0; vector<int> out; Node(){ memset(nxt, 0, sizeof nxt); } };
    vector<Node> t;
    AhoCorasick() { t.emplace_back(); }
    void add(const string& s, int id) {
        int u = 0;
        for (char c : s) {
            int k = c - 'a';
            if (!t[u].nxt[k]) { t[u].nxt[k] = t.size(); t.emplace_back(); }
            u = t[u].nxt[k];
        }
        t[u].out.push_back(id);
    }
    void build() {                              // BFS to set fail links / goto automaton
        queue<int> q;
        for (int k = 0; k < 26; k++) if (t[0].nxt[k]) q.push(t[0].nxt[k]);
        while (!q.empty()) {
            int u = q.front(); q.pop();
            for (int k = 0; k < 26; k++) {
                int v = t[u].nxt[k];
                if (!v) t[u].nxt[k] = t[t[u].fail].nxt[k];   // follow fail on miss
                else { t[v].fail = t[t[u].fail].nxt[k]; q.push(v); }
            }
        }
    }
};
\`\`\`

Aho–Corasick powers Stream of Characters (LC 1032) and dictionary-replacement problems.`,
    },
    {
      id: "suffix-structures",
      title: "Suffix arrays, automata & double hashing",
      body: `- **Suffix array + LCP.** Sorting all suffixes (\`O(n log n)\` or \`O(n log^2 n)\`) plus Kasai's LCP array answers "longest repeated substring", "number of distinct substrings" (\`n(n+1)/2 − sum(LCP)\`), and cross-string longest common substring.
- **Suffix automaton / suffix tree.** A linear-size DFA of all substrings; counts distinct substrings and finds occurrences in \`O(n)\` — the heavyweight tool for the hardest string problems.
- **Palindromic tree (eertree).** Stores all distinct palindromic substrings in \`O(n)\`.
- **Double hashing.** To make rolling-hash comparisons collision-safe under adversarial tests, compare two independent hashes (different bases/moduli), or use a single random 64-bit modulus. This is the pragmatic path for Longest Duplicate Substring (LC 1044) and Distinct Echo Substrings (LC 1316).

For most LeetCode "hard" string tasks, KMP / Z / rolling hash / Manacher suffice; reach for suffix automata only when substring *counting* over all suffixes is required.`,
    },
    {
      id: "complexity",
      title: "Complexity cheatsheet",
      body: `| Technique | Time | Space |
| --- | --- | --- |
| Two pointers / frequency | \`O(n)\` | \`O(1)\`–\`O(alphabet)\` |
| Expand-around-center | \`O(n^2)\` | \`O(1)\` |
| KMP / Z-function | \`O(n + m)\` | \`O(m)\` |
| Rolling hash (prefix) | \`O(n)\` build, \`O(1)\` query | \`O(n)\` |
| Trie | \`O(L)\` per op | \`O(total chars · alphabet)\` |`,
    },
    {
      id: "problems",
      title: "Representative LeetCode problems",
      body: `| Problem | Technique |
| --- | --- |
| 125 / 5 / 647 Palindrome family | two pointers / expand |
| 49 / 242 Anagrams | frequency counting |
| 28 Find the Index (strStr) | KMP |
| 459 Repeated Substring Pattern | prefix function |
| 214 Shortest Palindrome | KMP / hash |
| 1044 Longest Duplicate Substring | rolling hash + binary search |
| 208 / 211 / 212 Trie / Add&Search / Word Search II | Trie |
| 421 Maximum XOR of Two Numbers | bitwise Trie |
| 76 Minimum Window Substring | sliding window |
| 131 / 132 Palindrome Partitioning | DP |

**Harder & newer problems**

| Problem | Technique |
| --- | --- |
| 3008 Find Beautiful Indices in the Given Array II | KMP / Z-function |
| 3031 Minimum Time to Revert Word to Initial State II | Z-function |
| 1392 Longest Happy Prefix | prefix function |
| 1316 Distinct Echo Substrings | rolling hash |
| 5 Longest Palindromic Substring | Manacher |
| 1032 Stream of Characters | Aho–Corasick |`,
    },
    {
      id: "pitfalls",
      title: "Pitfalls & tips",
      body: `- **Hash collisions**: a single modulus can be attacked; use a 64-bit unsigned mod or double hashing for safety.
- **Off-by-one in KMP**: the prefix function is over the *pattern*; reset \`j\` via \`pi[j-1]\`, never by 1.
- **Even/odd palindromes**: expand from both single and double centers.
- **Trie memory**: 26-pointer nodes can be heavy; use a hash map per node for large alphabets.
- **Char ranges**: confirm lowercase-only vs. full ASCII before sizing arrays.`,
    },
  ],
};
