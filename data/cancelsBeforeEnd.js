'use strict';

/* global d3 */

(function () {
  var parseDate = d3.timeParse('%Y%m%d');

  var svg = d3.select('#j-cancels-before-end');
  var viewbox = svg.attr('viewBox').split(' ').map(function (x) {
    return +x;
  });
  var margins = { top: 10, right: 40, bottom: 40, left: 40 };
  var width = viewbox[2] - margins.left - margins.right;
  var height = viewbox[3] - margins.top - margins.bottom;

  var g = svg.append('g').attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

  var x = d3.scaleLinear().rangeRound([0, width]);

  var y = d3.scaleLinear().range([height, 0]);

  var xAxis = d3.axisBottom(x);
  var yAxis = d3.axisLeft(y); // .tickFormat(d3.format('.0%'))

  d3.csv('Cancels.csv').then(function (raw) {
    var intervals = raw.map(function (d) {
      return +d.interval;
    });
    var range = d3.range(0, 180, 1);
    var data = range.map(function (d) {
      return {
        interval: d,
        count: intervals.reduce(function (a, c) {
          return c === d ? a + 1 : a;
        }, 0)
      };
    });

    x.domain(d3.extent(data, function (d) {
      return d.interval;
    }));
    y.domain([0, d3.max(data, function (d) {
      return d.count;
    })]);

    var line = d3.line().x(function (d) {
      return x(d.interval);
    }).y(function (d) {
      return y(d.count);
    });

    // console.log(data)

    // major horizontal gridlines
    g.append('g').attr('opacity', 0.1).selectAll('line').data(y.ticks(5)).enter().append('line').attr('y1', function (d) {
      return y(d) + 0.5;
    }).attr('y2', function (d) {
      return y(d) + 0.5;
    }).attr('x1', 0).attr('x2', width).attr('stroke', 'black');

    var path = g.append('path').datum(data).attr('d', line).attr('fill', 'none').attr('stroke', 'steelblue').attr('stroke-width', 1.5).attr('stroke-linejoin', 'round').attr('stroke-linecap', 'round');

    var xG = g.append('g').attr('class', 'x-axis').attr('transform', 'translate(0,' + height + ')').call(xAxis);

    var yG = g.append('g').attr('class', 'y-axis').call(yAxis);

    g.append('rect').attr('x', width).attr('y', 1).attr('width', width).attr('height', height).attr('fill', 'white');

    function zoom(days) {
      x.domain([0, days]);
      xG.transition().call(xAxis);
      path.transition().attr('d', line);
    }

    d3.select('#j-cbe1').on('click', function () {
      d3.select('#j-cbe1').attr('class', 'control active');
      d3.select('#j-cbe2').attr('class', 'control');
      d3.select('#j-cbe3').attr('class', 'control');
      zoom(180);
    });
    d3.select('#j-cbe2').on('click', function () {
      d3.select('#j-cbe1').attr('class', 'control');
      d3.select('#j-cbe2').attr('class', 'control active');
      d3.select('#j-cbe3').attr('class', 'control');
      zoom(90);
    });
    d3.select('#j-cbe3').on('click', function () {
      d3.select('#j-cbe1').attr('class', 'control');
      d3.select('#j-cbe2').attr('class', 'control');
      d3.select('#j-cbe3').attr('class', 'control active');
      zoom(31);
    });
  });
})();