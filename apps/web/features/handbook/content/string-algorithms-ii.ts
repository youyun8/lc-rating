import type { HandbookTopic } from "../model";

export const stringAlgorithmsII: HandbookTopic = {
  slug: "string-algorithms-ii",
  title: "String Algorithms II",
  tagline:
    "Contest-grade templates for Manacher, Aho-Corasick, suffix arrays, suffix automata, and palindromic trees.",
  icon: "Type",
  group: "Strings & Math",
  sections: [
    {
      id: "overview",
      title: "Overview & when to use it",
      body: `Use these templates when simple KMP, Z-function, rolling hash, or Trie code is not enough.

| Signal | Template |
| --- | --- |
| all palindrome radii | Manacher |
| many patterns in one text | Aho-Corasick |
| lexicographic suffix order / LCP queries | suffix array |
| count distinct substrings online | suffix automaton |
| all distinct palindromic substrings | palindromic tree |
| lexicographically minimum rotation | Booth's algorithm |

\`\`\`cpp
// Template picker.
void chooseStringTool(bool manyPatterns, bool palindromes, bool suffixOrder) {
  if (manyPatterns) {
    // Aho-Corasick
  } else if (palindromes) {
    // Manacher or palindromic tree
  } else if (suffixOrder) {
    // Suffix array + LCP
  } else {
    // Start with KMP, Z-function, Trie, or rolling hash.
  }
}
\`\`\``,
    },
    {
      id: "prerequisites",
      title: "Prerequisites",
      body: `- Everything in [Strings](/handbook/strings): KMP, the Z-function, rolling hashes, and tries.
- Automata thinking (states and transitions) and amortized analysis.

Related: [Data Structures](/handbook/data-structures) (tries and suffix structures) and [Math](/handbook/math) (modular arithmetic for double hashing).`,
    },
    {
      id: "manacher",
      title: "Manacher for palindrome radii",
      body: `Manacher computes odd and even palindrome radii in linear time. It replaces \`O(n^2)\` center expansion when the input can be large.

\`\`\`cpp
struct Manacher {
  vector<int> odd, even;

  Manacher(const string& s) {
    int n = s.size();
    odd.assign(n, 0);
    even.assign(n, 0);

    for (int i = 0, l = 0, r = -1; i < n; i++) {
      int k = (i > r) ? 1 : min(odd[l + r - i], r - i + 1);
      while (0 <= i - k && i + k < n && s[i - k] == s[i + k]) {
        k++;
      }
      odd[i] = k--;
      if (i + k > r) {
        l = i - k;
        r = i + k;
      }
    }

    for (int i = 0, l = 0, r = -1; i < n; i++) {
      int k = (i > r) ? 0 : min(even[l + r - i + 1], r - i + 1);
      while (0 <= i - k - 1 && i + k < n && s[i - k - 1] == s[i + k]) {
        k++;
      }
      even[i] = k--;
      if (i + k > r) {
        l = i - k - 1;
        r = i + k;
      }
    }
  }

  long long countPalindromes() const {
    long long ans = 0;
    for (int x : odd) {
      ans += x;
    }
    for (int x : even) {
      ans += x;
    }
    return ans;
  }
};
\`\`\``,
    },
    {
      id: "aho-corasick",
      title: "Aho-Corasick for many pattern matches",
      body: `Aho-Corasick is a Trie plus failure links. It finds all occurrences of many patterns in one text in linear time in the text length plus matches.

\`\`\`cpp
struct AhoCorasick {
  struct Node {
    int next[26];
    int link = 0;
    vector<int> out;
    Node() {
      fill(begin(next), end(next), -1);
    }
  };

  vector<Node> trie{Node()};

  void addWord(const string& word, int id) {
    int u = 0;
    for (char c : word) {
      int x = c - 'a';
      if (trie[u].next[x] == -1) {
        trie[u].next[x] = trie.size();
        trie.push_back(Node());
      }
      u = trie[u].next[x];
    }
    trie[u].out.push_back(id);
  }

  void build() {
    queue<int> q;
    for (int c = 0; c < 26; c++) {
      int v = trie[0].next[c];
      if (v == -1) {
        trie[0].next[c] = 0;
      } else {
        trie[v].link = 0;
        q.push(v);
      }
    }

    while (!q.empty()) {
      int u = q.front();
      q.pop();
      for (int c = 0; c < 26; c++) {
        int v = trie[u].next[c];
        if (v == -1) {
          trie[u].next[c] = trie[trie[u].link].next[c];
        } else {
          trie[v].link = trie[trie[u].link].next[c];
          for (int id : trie[trie[v].link].out) {
            trie[v].out.push_back(id);
          }
          q.push(v);
        }
      }
    }
  }

  vector<pair<int, int>> search(const string& text) {
    vector<pair<int, int>> matches;  // {ending index, pattern id}
    int u = 0;
    for (int i = 0; i < (int)text.size(); i++) {
      u = trie[u].next[text[i] - 'a'];
      for (int id : trie[u].out) {
        matches.push_back({i, id});
      }
    }
    return matches;
  }
};
\`\`\``,
    },
    {
      id: "suffix-array",
      title: "Suffix array and LCP",
      body: `A suffix array stores suffixes in lexicographic order. The LCP array stores common-prefix lengths of adjacent suffixes in that order.

\`\`\`cpp
vector<int> suffixArray(const string& s) {
  int n = s.size();
  vector<int> sa(n), rnk(n), tmp(n);
  iota(sa.begin(), sa.end(), 0);
  for (int i = 0; i < n; i++) {
    rnk[i] = s[i];
  }

  for (int k = 1;; k <<= 1) {
    auto cmp = [&](int i, int j) {
      if (rnk[i] != rnk[j]) {
        return rnk[i] < rnk[j];
      }
      int ri = i + k < n ? rnk[i + k] : -1;
      int rj = j + k < n ? rnk[j + k] : -1;
      return ri < rj;
    };
    sort(sa.begin(), sa.end(), cmp);
    tmp[sa[0]] = 0;
    for (int i = 1; i < n; i++) {
      tmp[sa[i]] = tmp[sa[i - 1]] + cmp(sa[i - 1], sa[i]);
    }
    rnk = tmp;
    if (rnk[sa[n - 1]] == n - 1) {
      break;
    }
  }
  return sa;
}

vector<int> lcpArray(const string& s, const vector<int>& sa) {
  int n = s.size();
  vector<int> rank(n), lcp(max(0, n - 1));
  for (int i = 0; i < n; i++) {
    rank[sa[i]] = i;
  }
  int h = 0;
  for (int i = 0; i < n; i++) {
    if (rank[i] == n - 1) {
      h = 0;
      continue;
    }
    int j = sa[rank[i] + 1];
    while (i + h < n && j + h < n && s[i + h] == s[j + h]) {
      h++;
    }
    lcp[rank[i]] = h;
    if (h) {
      h--;
    }
  }
  return lcp;
}
\`\`\`

Distinct substrings count = \`n * (n + 1) / 2 - sum(lcp)\`.`,
    },
    {
      id: "suffix-automaton",
      title: "Suffix automaton",
      body: `A suffix automaton compactly represents all substrings of a string. It is useful for counting distinct substrings, longest common substring, and online substring queries.

\`\`\`cpp
struct SuffixAutomaton {
  struct State {
    int link = -1;
    int len = 0;
    map<char, int> next;
  };

  vector<State> st;
  int last = 0;

  SuffixAutomaton() {
    st.push_back(State());
  }

  void extend(char c) {
    int cur = st.size();
    st.push_back(State());
    st[cur].len = st[last].len + 1;

    int p = last;
    while (p != -1 && !st[p].next.count(c)) {
      st[p].next[c] = cur;
      p = st[p].link;
    }

    if (p == -1) {
      st[cur].link = 0;
    } else {
      int q = st[p].next[c];
      if (st[p].len + 1 == st[q].len) {
        st[cur].link = q;
      } else {
        int clone = st.size();
        st.push_back(st[q]);
        st[clone].len = st[p].len + 1;
        while (p != -1 && st[p].next[c] == q) {
          st[p].next[c] = clone;
          p = st[p].link;
        }
        st[q].link = st[cur].link = clone;
      }
    }
    last = cur;
  }

  long long countDistinctSubstrings() const {
    long long ans = 0;
    for (int v = 1; v < (int)st.size(); v++) {
      ans += st[v].len - st[st[v].link].len;
    }
    return ans;
  }
};

SuffixAutomaton buildSAM(const string& s) {
  SuffixAutomaton sam;
  for (char c : s) {
    sam.extend(c);
  }
  return sam;
}
\`\`\``,
    },
    {
      id: "eertree",
      title: "Palindromic tree (Eertree)",
      body: `A palindromic tree stores every distinct palindromic substring as a node. It is the palindrome analogue of a suffix automaton.

\`\`\`cpp
struct PalindromicTree {
  struct Node {
    int next[26];
    int link = 0;
    int len = 0;
    int occ = 0;
    Node(int len = 0) : len(len) {
      fill(begin(next), end(next), 0);
    }
  };

  vector<Node> tree;
  string s;
  int suff = 1;

  PalindromicTree() {
    tree.push_back(Node(-1));  // root with odd sentinel length
    tree.push_back(Node(0));   // root with empty palindrome
    tree[0].link = 0;
    tree[1].link = 0;
  }

  int getLink(int v, int pos) {
    while (true) {
      int mirror = pos - 1 - tree[v].len;
      if (mirror >= 0 && s[mirror] == s[pos]) {
        return v;
      }
      v = tree[v].link;
    }
  }

  void addChar(char ch) {
    s.push_back(ch);
    int pos = s.size() - 1;
    int c = ch - 'a';
    int cur = getLink(suff, pos);

    if (!tree[cur].next[c]) {
      int now = tree.size();
      tree.push_back(Node(tree[cur].len + 2));
      if (tree[now].len == 1) {
        tree[now].link = 1;
      } else {
        int linkCand = getLink(tree[cur].link, pos);
        tree[now].link = tree[linkCand].next[c];
      }
      tree[cur].next[c] = now;
    }

    suff = tree[cur].next[c];
    tree[suff].occ++;
  }

  int distinctPalindromes() const {
    return (int)tree.size() - 2;
  }
};
\`\`\``,
    },
    {
      id: "booth",
      title: "Booth's algorithm for minimum rotation",
      body: `Booth's algorithm finds the lexicographically minimum rotation of a string in linear time.

\`\`\`cpp
int minRotationIndex(const string& s) {
  string t = s + s;
  int n = s.size();
  int i = 0, j = 1, k = 0;
  while (i < n && j < n && k < n) {
    if (t[i + k] == t[j + k]) {
      k++;
    } else if (t[i + k] > t[j + k]) {
      i = i + k + 1;
      if (i <= j) {
        i = j + 1;
      }
      k = 0;
    } else {
      j = j + k + 1;
      if (j <= i) {
        j = i + 1;
      }
      k = 0;
    }
  }
  return min(i, j);
}

string minRotation(string s) {
  int idx = minRotationIndex(s);
  return s.substr(idx) + s.substr(0, idx);
}
\`\`\``,
    },
    {
      id: "complexity",
      title: "Complexity cheatsheet",
      body: `| Algorithm | Build | Query | Notes |
| --- | --- | --- | --- |
| Manacher | \`O(n)\` | \`O(1)\` per center | all palindrome radii |
| Aho-Corasick | \`O(total pattern length)\` | \`O(text length + matches)\` | multi-pattern search |
| Suffix array + LCP | \`O(n log n)\` | \`O(log n)\` per LCP | \`O(n)\` with SA-IS |
| Suffix automaton | \`O(n)\` | \`O(query length)\` | distinct substrings, LCS |
| Palindromic tree | \`O(n)\` | — | all distinct palindromes |
| Booth's algorithm | \`O(n)\` | — | least rotation |`,
    },
    {
      id: "problems",
      title: "Representative LeetCode problems",
      body: `| ID | Problem | Technique |
| --- | --- | --- |
| 5 | [Longest Palindromic Substring](https://leetcode.cn/problems/longest-palindromic-substring) | Manacher |
| 647 | [Palindromic Substrings](https://leetcode.cn/problems/palindromic-substrings) | Manacher radii |
| 214 | [Shortest Palindrome](https://leetcode.cn/problems/shortest-palindrome) | prefix function or Manacher |
| 1032 | [Stream of Characters](https://leetcode.cn/problems/stream-of-characters) | Aho-Corasick |
| 718 | [Maximum Length of Repeated Subarray](https://leetcode.cn/problems/maximum-length-of-repeated-subarray) | longest common substring |
| 1923 | [Longest Common Subpath](https://leetcode.cn/problems/longest-common-subpath) | suffix automaton or hashing |
| 899 | [Orderly Queue](https://leetcode.cn/problems/orderly-queue) | minimum rotation |

**Recent medium problems**

| ID | Problem | Rating | Technique |
| --- | --- | --- | --- |
| 3474 | [Lexicographically Smallest Generated String](https://leetcode.cn/problems/lexicographically-smallest-generated-string) | 2605 | string matching + greedy |
| 3455 | [Shortest Matching Substring](https://leetcode.cn/problems/shortest-matching-substring) | 2303 | KMP / Z-function |
| 3303 | [Find the Occurrence of First Almost Equal Substring](https://leetcode.cn/problems/find-the-occurrence-of-first-almost-equal-substring) | 2509 | Z-function |
| 3292 | [Minimum Number of Valid Strings to Form Target II](https://leetcode.cn/problems/minimum-number-of-valid-strings-to-form-target-ii) | 2662 | Aho-Corasick + DP |
| 3213 | [Construct String with Minimum Cost](https://leetcode.cn/problems/construct-string-with-minimum-cost) | 2171 | Aho-Corasick |
| 3045 | [Count Prefix and Suffix Pairs II](https://leetcode.cn/problems/count-prefix-and-suffix-pairs-ii) | 2328 | Z-function + Trie |`,
    },
    {
      id: "pitfalls",
      title: "Pitfalls & tips",
      body: `- Manacher's odd radius includes the center; even radius is centered between \`i-1\` and \`i\`.
- Aho-Corasick memory grows with total pattern length times alphabet size; use maps for large alphabets.
- Suffix array code must handle \`n == 1\`.
- Suffix automaton transitions can use \`array<int, 26>\` for lowercase only, or \`map\` for general characters.
- Palindromic tree roots have lengths \`-1\` and \`0\`; both are necessary.

\`\`\`cpp
// Alphabet adapter for lowercase strings. Replace with a map for Unicode or
// large alphabets.
int charId(char c) {
  return c - 'a';
}

bool validLowercase(char c) {
  return 'a' <= c && c <= 'z';
}
\`\`\``,
    },
  ],
};
