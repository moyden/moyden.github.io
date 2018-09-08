'use strict';

/* global Vue */

// eslint-disable-next-line no-unused-vars
var vm = new Vue({
  el: '.j-vm',

  data: {
    n: 1,
    m: 9,
    l: 0,
    display: true
  },

  methods: {
    inc: function inc() {
      this.l = 0;
      this.display = false;
      this.n = this.n === this.m ? 1 : this.n += 1;
    },

    dec: function dec() {
      this.l = 0;
      this.display = false;
      this.n = this.n === 1 ? this.m : this.n -= 1;
    },

    imageLoaded: function imageLoaded() {
      this.l += 1;
      if (this.l === 4) {
        this.display = true;
      }
    }
  },

  mounted: function mounted() {
    var self = this;
    window.addEventListener('keydown', function (event) {
      if (event.keyCode === 37) self.dec();
      if (event.keyCode === 39) self.inc();
    });

    var stills = ['.j-still__1', '.j-still__2', '.j-still__3', '.j-still__4'];
    stills = stills.map(function (d) {
      return document.querySelector(d);
    });
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = stills[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var still = _step.value;

        still.addEventListener('load', self.imageLoaded);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }
});