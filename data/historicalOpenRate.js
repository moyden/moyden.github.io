'use strict';

/* global d3 */

(function () {
  var parseDate = d3.timeParse('%Y%m%d');

  var svg = d3.select('#j-historical-open-rate');
  var viewbox = svg.attr('viewBox').split(' ').map(function (x) {
    return +x;
  });
  var margins = { top: 10, right: 40, bottom: 40, left: 40 };
  var width = viewbox[2] - margins.left - margins.right;
  var height = viewbox[3] - margins.top - margins.bottom;

  var g = svg.append('g').attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

  var x = d3.scaleTime().rangeRound([0, width]);

  var y = d3.scaleLinear().range([height, 0]);

  var xAxis = d3.axisBottom(x);
  var yAxis = d3.axisLeft(y).tickFormat(d3.format('.0%'));

  d3.csv('RenewalComms.csv').then(function (raw) {
    var data = raw.map(function (d) {
      return {
        id: d.id,
        sent: parseDate(d.sent),
        open: parseDate(d.open)
      };
    });

    var intervals = d3.timeMonth.range(d3.min(data, function (d) {
      return d.sent;
    }), d3.max(data, function (d) {
      return d.sent;
    }), 1);
    var rates = intervals.map(function (d, i, a) {
      var sentThisMonth = [];
      if (i < a.length - 1) sentThisMonth = data.filter(function (c) {
        return c.sent > d && c.sent < a[i + 1];
      });else sentThisMonth = data.filter(function (c) {
        return c.sent > d;
      });
      var openThisMonth = sentThisMonth.reduce(function (a, c) {
        return c.open ? a + 1 : a;
      }, 0);
      return {
        start: d,
        end: a[i + 1],
        sent: sentThisMonth.length,
        open: openThisMonth,
        rate: sentThisMonth.length === 0 ? null : openThisMonth / sentThisMonth.length
      };
    });
    rates.pop();

    x.domain(d3.extent(rates, function (d) {
      return d.start;
    }));
    y.domain([0, d3.max(rates, function (d) {
      return d.rate;
    })]);

    var line = d3.line().defined(function (d) {
      return d.rate;
    }).x(function (d) {
      return x(d.start);
    }).y(function (d) {
      return y(d.rate);
    });

    g.append('g').attr('class', 'x-axis').attr('transform', 'translate(0,' + height + ')').call(xAxis);

    g.append('g').attr('class', 'y-axis').call(yAxis);

    // major horizontal gridlines
    g.append('g').attr('opacity', 0.3).selectAll('line').data(y.ticks(4)).enter().append('line').attr('y1', function (d) {
      return y(d) + 0.5;
    }).attr('y2', function (d) {
      return y(d) + 0.5;
    }).attr('x1', 0).attr('x2', width).attr('stroke', 'black');

    // major vertical gridlines
    g.append('g').attr('opacity', 0.3).selectAll('line').data(x.ticks(d3.timeYear.every(1))).enter().append('line').attr('x1', function (d) {
      return x(d) + 0.5;
    }).attr('x2', function (d) {
      return x(d) + 0.5;
    }).attr('y1', 0).attr('y2', height).attr('stroke', 'black');

    // minor vertical gridlines
    g.append('g').attr('opacity', 0.1).selectAll('line').data(x.ticks()).enter().append('line').attr('x1', function (d) {
      return x(d) + 0.5;
    }).attr('x2', function (d) {
      return x(d) + 0.5;
    }).attr('y1', 0).attr('y2', height).attr('stroke', 'black');

    g.append('path').datum(rates).attr('d', line).attr('fill', 'none').attr('stroke', 'steelblue').attr('stroke-width', 1.5);

    g.selectAll('circle').data(rates).enter().append('circle').attr('cx', function (d) {
      return x(d.start);
    }).attr('cy', function (d) {
      return d.rate === null ? 2 * height : y(d.rate);
    }).attr('r', 2).attr('fill', 'white').attr('stroke', 'steelblue').attr('stroke-width', 1.5);
  });
})();