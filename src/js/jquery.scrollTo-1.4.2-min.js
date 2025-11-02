/**
 * jQuery.ScrollTo - Easy element scrolling using jQuery.
 * Copyright (c) 2007-2009 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * Date: 5/25/2009
 * @author Ariel Flesler
 * @version 1.4.2
 *
 * http://flesler.blogspot.com/2007/10/jqueryscrollto.html
 */
((d) => {
  var k = (d.scrollTo = (a, i, e) => {
    d(window).scrollTo(a, i, e);
  });
  k.defaults = { axis: 'xy', duration: Number.parseFloat(d.fn.jquery) >= 1.3 ? 0 : 1 };
  k.window = (a) => d(window)._scrollable();
  d.fn._scrollable = function () {
    return this.map(function () {
      var i =
        !this.nodeName ||
        d.inArray(this.nodeName.toLowerCase(), ['iframe', '#document', 'html', 'body']) != -1;
      if (!i) return this;
      var e = (this.contentWindow || this).document || this.ownerDocument || this;
      return d.browser.safari || e.compatMode == 'BackCompat' ? e.body : e.documentElement;
    });
  };
  d.fn.scrollTo = function (n, j, b) {
    if (typeof j == 'object') {
      b = j;
      j = 0;
    }
    if (typeof b == 'function') b = { onAfter: b };
    if (n == 'max') n = 9e9;
    b = d.extend({}, k.defaults, b);
    j = j || b.speed || b.duration;
    b.queue = b.queue && b.axis.length > 1;
    if (b.queue) j /= 2;
    b.offset = p(b.offset);
    b.over = p(b.over);
    return this._scrollable()
      .each(function () {
        var r = d(this),
          f = n,
          s,
          g = {},
          u = r.is('html,body');
        switch (typeof f) {
          case 'number':
          case 'string':
            if (/^([+-]=)?\d+(\.\d+)?(px|%)?$/.test(f)) {
              f = p(f);
              break;
            }
            f = d(f, this);
          case 'object':
            if (f.is || f.style) s = (f = d(f)).offset();
        }
        d.each(b.axis.split(''), (a, i) => {
          var e = i == 'x' ? 'Left' : 'Top',
            h = e.toLowerCase(),
            c = 'scroll' + e,
            l = this[c],
            m = k.max(this, i);
          if (s) {
            g[c] = s[h] + (u ? 0 : l - r.offset()[h]);
            if (b.margin) {
              g[c] -= Number.parseInt(f.css('margin' + e)) || 0;
              g[c] -= Number.parseInt(f.css('border' + e + 'Width')) || 0;
            }
            g[c] += b.offset[h] || 0;
            if (b.over[h]) g[c] += f[i == 'x' ? 'width' : 'height']() * b.over[h];
          } else {
            var o = f[h];
            g[c] = o.slice && o.slice(-1) == '%' ? (Number.parseFloat(o) / 100) * m : o;
          }
          if (/^\d+$/.test(g[c])) g[c] = g[c] <= 0 ? 0 : Math.min(g[c], m);
          if (!a && b.queue) {
            if (l != g[c]) t(b.onAfterFirst);
            delete g[c];
          }
        });
        t(b.onAfter);
        function t(a) {
          r.animate(
            g,
            j,
            b.easing,
            a &&
              function () {
                a.call(this, n, b);
              },
          );
        }
      })
      .end();
  };
  k.max = (a, i) => {
    var e = i == 'x' ? 'Width' : 'Height',
      h = 'scroll' + e;
    if (!d(a).is('html,body')) return a[h] - d(a)[e.toLowerCase()]();
    var c = 'client' + e,
      l = a.ownerDocument.documentElement,
      m = a.ownerDocument.body;
    return Math.max(l[h], m[h]) - Math.min(l[c], m[c]);
  };
  function p(a) {
    return typeof a == 'object' ? a : { top: a, left: a };
  }
})(jQuery);
