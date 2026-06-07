import type { HandbookTopic } from "../model";

export const geometry: HandbookTopic = {
  slug: "geometry",
  title: "Geometry",
  tagline:
    "Points, vectors, orientation, segment intersection, polygon area, convex hulls, and rotating calipers.",
  icon: "Crosshair",
  group: "Strings & Math",
  sections: [
    {
      id: "overview",
      title: "Overview & when to use it",
      body: `Geometry problems are implementation-heavy. Most solutions are combinations of vector operations, orientation tests, intersection checks, and polygon or hull routines.

Core rule: use integer arithmetic for orientation whenever coordinates are integers. Use floating point only for distances, angles, projections, and circles.

\`\`\`cpp
// Geometry decision checklist.
void chooseGeometryTool(bool integerCoords, bool needHull, bool needDistances) {
  if (integerCoords) {
    // Prefer long long cross products for exact orientation.
  }
  if (needHull) {
    // Sort points, then monotonic chain convex hull.
  }
  if (needDistances) {
    // Use double / long double and EPS comparisons.
  }
}
\`\`\``,
    },
    {
      id: "prerequisites",
      title: "Prerequisites",
      body: `- Vectors, dot and cross products, and basic trigonometry.
- [Math](/handbook/math) for precision, gcd, and modular reasoning; [Binary Search](/handbook/binary-search) for parametric and ternary search on a geometric answer.
- Sorting and [Range Queries & Offline Algorithms](/handbook/range-queries-offline) (sweep line) for plane-sweep problems.`,
    },
    {
      id: "point-vector",
      title: "Point and vector operations",
      body: `Represent a point as a pair of coordinates. Cross product gives orientation and area; dot product gives projection and angle information.

\`\`\`cpp
struct Point {
  long long x, y;

  bool operator<(const Point& other) const {
    if (x != other.x) {
      return x < other.x;
    }
    return y < other.y;
  }

  bool operator==(const Point& other) const {
    return x == other.x && y == other.y;
  }
};

Point operator-(Point a, Point b) { return {a.x - b.x, a.y - b.y}; }

long long dot(Point a, Point b) { return a.x * b.x + a.y * b.y; }

long long cross(Point a, Point b) { return a.x * b.y - a.y * b.x; }

long long cross(Point a, Point b, Point c) {
  return cross(b - a, c - a);  // signed twice-area of triangle abc
}

long double dist(Point a, Point b) {
  long double dx = a.x - b.x;
  long double dy = a.y - b.y;
  return sqrt(dx * dx + dy * dy);
}
\`\`\``,
    },
    {
      id: "precision",
      title: "Floating-point precision policy",
      body: `Use an EPS-based sign function for doubles. Never compare floating values with \`==\` unless they came from the same integer expression.

\`\`\`cpp
// Floating-point geometry primitives with epsilon-based comparisons.
const long double EPS = 1e-12L;

// Returns +1, -1, or 0 depending on whether x is positive, negative, or near
// zero.
int sgn(long double x) {
  if (x > EPS) {
    return 1;
  }
  if (x < -EPS) {
    return -1;
  }
  return 0;
}

bool eq(long double a, long double b) {
  return sgn(a - b) ==
         0;  // consider two values equal when they differ by at most EPS
}

struct DPoint {
  long double x, y;
};

// 2D cross product of position vectors a and b (z-component of a x b).
long double cross(DPoint a, DPoint b) { return a.x * b.y - a.y * b.x; }
\`\`\``,
    },
    {
      id: "orientation-segment",
      title: "Orientation and segment intersection",
      body: `The sign of \`cross(a, b, c)\` tells whether \`c\` is left of, right of, or on directed line \`a -> b\`. Segment intersection is orientation plus bounding-box checks.

\`\`\`cpp
int orientation(Point a, Point b, Point c) {
  long long v = cross(a, b, c);
  if (v > 0) {
    return 1;  // counterclockwise
  }
  if (v < 0) {
    return -1;  // clockwise
  }
  return 0;  // collinear
}

bool onSegment(Point a, Point b, Point p) {
  return cross(a, b, p) == 0 && min(a.x, b.x) <= p.x && p.x <= max(a.x, b.x) &&
         min(a.y, b.y) <= p.y && p.y <= max(a.y, b.y);
}

bool segmentsIntersect(Point a, Point b, Point c, Point d) {
  long long c1 = cross(a, b, c);
  long long c2 = cross(a, b, d);
  long long c3 = cross(c, d, a);
  long long c4 = cross(c, d, b);

  if ((c1 > 0 && c2 < 0 || c1 < 0 && c2 > 0) &&
      (c3 > 0 && c4 < 0 || c3 < 0 && c4 > 0)) {
    return true;
  }

  return onSegment(a, b, c) || onSegment(a, b, d) || onSegment(c, d, a) ||
         onSegment(c, d, b);
}
\`\`\``,
    },
    {
      id: "line-distance",
      title: "Distance to a line or segment",
      body: `Projection uses the dot product. Clamp the projection parameter to \`[0, 1]\` for distance to a segment.

\`\`\`cpp
// Vector type for displacement arithmetic separate from point positions.
struct Vec {
  long double x, y;
};

Vec operator-(DPoint a, DPoint b) { return {a.x - b.x, a.y - b.y}; }

long double dot(Vec a, Vec b) { return a.x * b.x + a.y * b.y; }

long double norm2(Vec a) {
  return dot(
      a, a);  // squared length, avoids a sqrt when only comparison is needed
}

// Point-to-segment distance: project p onto line AB, clamp t to [0,1], measure
// gap.
long double distancePointSegment(DPoint p, DPoint a, DPoint b) {
  Vec ab = b - a;
  Vec ap = p - a;
  long double t = dot(ap, ab) / norm2(ab);  // unclamped parameter along AB
  t = max((long double)0,
          min((long double)1, t));              // clamp to segment endpoints
  DPoint proj{a.x + ab.x * t, a.y + ab.y * t};  // closest point on segment to p
  long double dx = p.x - proj.x;
  long double dy = p.y - proj.y;
  return sqrt(dx * dx + dy * dy);
}
\`\`\``,
    },
    {
      id: "polygon",
      title: "Polygon area and point inclusion",
      body: `The shoelace formula gives signed twice-area. Ray casting decides whether a point is inside a polygon.

\`\`\`cpp
long long twicePolygonArea(const vector<Point>& p) {
  long long area2 = 0;
  int n = p.size();
  for (int i = 0; i < n; ++i) {
    area2 += cross(p[i], p[(i + 1) % n]);
  }
  return llabs(area2);
}

// Returns 0 outside, 1 inside, 2 on boundary.
int pointInPolygon(const vector<Point>& poly, Point q) {
  bool inside = false;
  int n = poly.size();
  for (int i = 0, j = n - 1; i < n; j = i++) {
    Point a = poly[j], b = poly[i];
    if (onSegment(a, b, q)) {
      return 2;
    }
    bool crosses = (a.y > q.y) != (b.y > q.y);
    if (crosses) {
      long double xAtY =
          (long double)(b.x - a.x) * (q.y - a.y) / (b.y - a.y) + a.x;
      if (xAtY > q.x) {
        inside = !inside;
      }
    }
  }
  return inside ? 1 : 0;
}
\`\`\``,
    },
    {
      id: "convex-hull",
      title: "Convex hull with monotonic chain",
      body: `The monotonic chain algorithm builds the convex hull in \`O(n log n)\` by sorting points, then maintaining lower and upper hulls.

\`\`\`cpp
vector<Point> convexHull(vector<Point> p) {
  sort(p.begin(), p.end());
  p.erase(unique(p.begin(), p.end()), p.end());
  if (p.size() <= 1) {
    return p;
  }

  vector<Point> hull;
  for (Point pt : p) {
    while (hull.size() >= 2 &&
           cross(hull[hull.size() - 2], hull.back(), pt) <= 0) {
      hull.pop_back();  // remove <= 0 to exclude collinear boundary points
    }
    hull.push_back(pt);
  }

  int lowerSize = hull.size();
  for (int i = (int)p.size() - 2; i >= 0; i--) {
    Point pt = p[i];
    while ((int)hull.size() > lowerSize &&
           cross(hull[hull.size() - 2], hull.back(), pt) <= 0) {
      hull.pop_back();
    }
    hull.push_back(pt);
  }

  hull.pop_back();
  return hull;
}
\`\`\`

To keep collinear boundary points, change the \`<= 0\` tests to \`< 0\`.`,
    },
    {
      id: "rotating-calipers",
      title: "Rotating calipers for hull diameter",
      body: `After building a convex hull, rotating calipers finds the farthest pair in linear time over the hull size.

\`\`\`cpp
// Squared Euclidean distance (avoids floating point).
long long dist2(Point a, Point b) {
  long long dx = a.x - b.x;
  long long dy = a.y - b.y;
  return dx * dx + dy * dy;
}

// Rotating Calipers: diameter of a convex hull (squared distance).
// Iterates each edge and advances the antipodal vertex j while the
// cross-product area (proportional to height) keeps increasing.
long long convexDiameter2(vector<Point> hull) {
  int n = hull.size();
  if (n <= 1) {
    return 0;
  }
  if (n == 2) {
    return dist2(hull[0], hull[1]);
  }

  long long best = 0;
  int j = 1;  // antipodal vertex, shared across edge iterations
  for (int i = 0; i < n; ++i) {
    int ni = (i + 1) % n;
    // Advance j while rotating the caliper increases the perpendicular height.
    while (abs(cross(hull[ni] - hull[i], hull[(j + 1) % n] - hull[i])) >
           abs(cross(hull[ni] - hull[i], hull[j] - hull[i]))) {
      j = (j + 1) % n;
    }
    // Check both endpoints of the current edge against the antipodal point.
    best = max(best, dist2(hull[i], hull[j]));
    best = max(best, dist2(hull[ni], hull[j]));
  }
  return best;
}
\`\`\``,
    },
    {
      id: "circle",
      title: "Circle basics",
      body: `Circle tasks often reduce to squared distance comparisons. Avoid square roots when only comparing distances.

\`\`\`cpp
bool insideCircle(Point p, Point center, long long radius) {
  return dist2(p, center) <= radius * radius;
}

// Intersection count between two circles using double distances.
int circleIntersectionCount(DPoint a, long double ra, DPoint b,
                            long double rb) {
  long double dx = a.x - b.x;
  long double dy = a.y - b.y;
  long double d = sqrt(dx * dx + dy * dy);
  if (sgn(d) == 0 && eq(ra, rb)) {
    return -1;  // infinitely many
  }
  if (sgn(d - (ra + rb)) > 0) {
    return 0;
  }
  if (sgn(d - fabsl(ra - rb)) < 0) {
    return 0;
  }
  if (eq(d, ra + rb) || eq(d, fabsl(ra - rb))) {
    return 1;
  }
  return 2;
}
\`\`\``,
    },
    {
      id: "advanced-techniques",
      title: "Advanced techniques",
      body: `Advanced geometry is won by choosing stable primitives. Prefer integer cross products and squared distances when possible; isolate floating-point tolerance in one comparator; and convert Manhattan distance, angular sweep, and area-union tasks into sorted one-dimensional events.`,
    },
    {
      id: "complexity",
      title: "Complexity cheatsheet",
      body: `| Routine | Complexity | Notes |
| --- | --- | --- |
| Orientation / cross product | \`O(1)\` | exact with integers |
| Segment intersection | \`O(1)\` | orientation + bounding box |
| Point in polygon | \`O(n)\` | ray casting |
| Polygon area (shoelace) | \`O(n)\` | signed twice-area |
| Convex hull (monotonic chain) | \`O(n log n)\` | sorting dominates |
| Rotating calipers | \`O(n)\` | on the hull, after building it |
| Closest pair of points | \`O(n log n)\` | divide and conquer or sweep |`,
    },
    {
      id: "interview-patterns",
      title: "Common interview patterns",
      body: `Most geometry interview questions reduce to a few orientation- and hull-based patterns.

| Pattern | Signal | Go-to move | Representative |
| --- | --- | --- | --- |
| Orientation / collinearity | "are points on a line / which side" | Sign of \`cross(a, b, c)\`; exact with integer coordinates | [Check If It Is a Straight Line](https://leetcode.cn/problems/check-if-it-is-a-straight-line) |
| Slope grouping | "max points on a line / count by direction" | Hash reduced slopes (gcd-normalized) per anchor point | [Max Points on a Line](https://leetcode.cn/problems/max-points-on-a-line) |
| Shoelace area | "polygon / triangle area" | Signed twice-area via cross-product sum, then halve | [Largest Triangle Area](https://leetcode.cn/problems/largest-triangle-area) |
| Convex hull | "smallest enclosing fence / extreme points" | Sort points, monotonic chain in \`O(n log n)\` | [Erect the Fence](https://leetcode.cn/problems/erect-the-fence) |
| Squared-distance test | "points inside a circle / closest" | Compare \`dist2\` to \`r*r\`; avoid \`sqrt\` | [Queries on Number of Points Inside a Circle](https://leetcode.cn/problems/queries-on-number-of-points-inside-a-circle) |
| Rotating calipers | "farthest pair / hull diameter" | Walk antipodal vertex around the hull in \`O(n)\` after building it | [Best Position for a Service Centre](https://leetcode.cn/problems/best-position-for-a-service-centre) |

- Use integer \`long long\` cross products for orientation; switch to \`double\`/\`long double\` with EPS only for distances, angles, and circles.
- Cross products can overflow near \`1e9\` coordinates — escalate to \`__int128\` for extreme constraints.`,
    },
    {
      id: "problems",
      title: "LeetCode problems",
      body: `| ID | Problem | Rating | Labels |
| --- | --- | --- | --- |
| 2250 | [Count Number of Rectangles Containing Each Point](https://leetcode.cn/problems/count-number-of-rectangles-containing-each-point) | 1998 | rectangle containment |
| 3027 | [Find the Number of Ways to Place People II](https://leetcode.cn/problems/find-the-number-of-ways-to-place-people-ii) | 2020 | dominance geometry |
| 3235 | [Check if the Rectangle Corner Is Reachable](https://leetcode.cn/problems/check-if-the-rectangle-corner-is-reachable) | 3774 | circle barriers / DSU |
| 149 | [Max Points on a Line](https://leetcode.cn/problems/max-points-on-a-line) | - | slopes / collinearity |
| 223 | [Rectangle Area](https://leetcode.cn/problems/rectangle-area) | - | rectangle overlap area |
| 587 | [Erect the Fence](https://leetcode.cn/problems/erect-the-fence) | - | convex hull |
| 812 | [Largest Triangle Area](https://leetcode.cn/problems/largest-triangle-area) | - | cross product area |
| 836 | [Rectangle Overlap](https://leetcode.cn/problems/rectangle-overlap) | - | interval overlap in 2D |
| 939 | [Minimum Area Rectangle](https://leetcode.cn/problems/minimum-area-rectangle) | - | axis-aligned rectangles |
| 963 | [Minimum Area Rectangle II](https://leetcode.cn/problems/minimum-area-rectangle-ii) | - | rotated rectangles |
| 3464 | [Maximize the Distance Between Points on a Square](https://leetcode.cn/problems/maximize-the-distance-between-points-on-a-square) | 2806 | distance on square |
| 3454 | [Separate Squares II](https://leetcode.cn/problems/separate-squares-ii) | 2671 | area sweep |
| 3531 | [Count Covered Buildings](https://leetcode.cn/problems/count-covered-buildings) | 1519 | covered buildings |
| 3102 | [Minimize Manhattan Distances](https://leetcode.cn/problems/minimize-manhattan-distances) | 2216 | Manhattan transform |
| 3047 | [Find the Largest Area of Square Inside Two Rectangles](https://leetcode.cn/problems/find-the-largest-area-of-square-inside-two-rectangles) | 1602 | rectangle intersection |
| 1453 | [Maximum Number of Darts Inside of a Circular Dartboard](https://leetcode.cn/problems/maximum-number-of-darts-inside-of-a-circular-dartboard) | 2202 | circle coverage |
| 1610 | [Maximum Number of Visible Points](https://leetcode.cn/problems/maximum-number-of-visible-points) | 2147 | angle sweep |`,
    },
    {
      id: "pitfalls",
      title: "Pitfalls & tips",
      body: `- Cross products can overflow if coordinates are near \`1e9\`; use \`__int128\` for extreme constraints.
- Decide whether collinear hull boundary points should be kept.
- Segment intersection must handle collinear overlap.
- Use squared distance when comparing distances.
- For ray casting, count boundary separately before toggling inside/outside.

\`\`\`cpp
// 128-bit cross product to avoid overflow with large integer coordinates.
__int128 cross128(Point a, Point b) {
  return (__int128)a.x * b.y - (__int128)a.y * b.x;
}

// Returns -1, 0, or 1 for the sign of a 128-bit integer.
int sign128(__int128 x) { return (x > 0) - (x < 0); }
\`\`\``,
    },
  ],
};
