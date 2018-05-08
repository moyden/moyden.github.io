'use strict';

/* global d3 */

var parseDate = d3.timeParse('%Y%m%d');

var svg = d3.select('#j-svg');
var viewbox = svg.attr('viewBox').split(' ').map(function (x) {
  return +x;
});
var margins = { top: 50, right: 50, bottom: 50, left: 50 };
var width = viewbox[2] - margins.left - margins.right;
var height = viewbox[3] - margins.top - margins.bottom;

var g = svg.append('g').attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

var x = d3.scaleLinear().rangeRound([0, width]);

var y = d3.scaleLinear().range([height, 0]);

var xAxis = d3.axisBottom(x);
var yAxis = d3.axisLeft(y); // .tickFormat(d3.format('.0%'))

d3.csv('Lengths.csv').then(function (raw) {
  var data = raw.map(function (d) {
    return +d.length;
  });

  data = data.filter(function (d) {
    return d > 0 && d < 10000;
  });

  x.domain([0, 365]);

  var histogram = d3.histogram().domain(x.domain()).thresholds(d3.range(0, 365, 5));
  var bins = histogram(data);
  console.log(data);

  // y.domain([0, d3.max(bins, d => d.length)])
  y.domain([0, 2000]);

  g.append('g').attr('fill', 'steelblue').selectAll('rect').data(bins).enter().append('rect').attr('x', function (d) {
    return x(d.x0) + 2;
  }).attr('width', function (d) {
    return x(d.x1) - x(d.x0) - 2;
  }).attr('y', function (d) {
    return y(d.length);
  }).attr('height', function (d) {
    return y(0) - y(d.length);
  });

  g.append('g').attr('class', 'x-axis').attr('transform', 'translate(0,' + height + ')').call(xAxis);

  g.append('g').attr('class', 'y-axis').call(yAxis);

  // x.domain(d3.extent(data, d => d.interval))
  // y.domain([0, d3.max(data, d => d.count)])
});