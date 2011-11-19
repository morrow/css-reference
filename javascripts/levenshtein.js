/*

Copyright (c) 2006. All Rights reserved.

If you use this script, please email me and let me know, thanks!

Andrew Hedges
andrew (at) hedges (dot) name

If you want to hire me to write JavaScript for you, see my resume.

http://andrew.hedges.name/resume/

*/
var levenshtein, minimize;
levenshtein = function(a, b) {
  var c, cost, i, j, m, n, o, r;
  cost = void 0;
  m = a.length;
  n = b.length;
  if (m < n) {
    c = a;
    a = b;
    b = c;
    o = m;
    m = n;
    n = o;
  }
  r = new Array();
  r[0] = new Array();
  c = 0;
  while (c < n + 1) {
    r[0][c] = c;
    c++;
  }
  i = 1;
  while (i < m + 1) {
    r[i] = new Array();
    r[i][0] = i;
    j = 1;
    while (j < n + 1) {
      cost = (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1);
      r[i][j] = minimize(r[i - 1][j] + 1, r[i][j - 1] + 1, r[i - 1][j - 1] + cost);
      j++;
    }
    i++;
  }
  return r[m][n];
};
minimize = function(x, y, z) {
  if (x < y && x < z) {
    return x;
  }
  if (y < x && y < z) {
    return y;
  }
  return z;
};