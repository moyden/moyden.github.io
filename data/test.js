'use strict';

/* global $, d3 */

var parseDate = d3.timeParse('%Y%m%d');

var svg = d3.select('#j-svg');
var viewbox = svg.attr('viewBox').split(' ').map(function (x) {
  return +x;
});
var margins = { top: 50, right: 50, bottom: 50, left: 50 };
var width = viewbox[2] - margins.left - margins.right;
var height = viewbox[3] - margins.top - margins.bottom;

var g = svg.append('g').attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

var x = d3.scaleTime().range([0, width]);

var y = d3.scaleTime().range([height, 0]);

var xAxis = d3.axisBottom(x);
var yAxis = d3.axisLeft(y);

$.getJSON('CombinedData.json', function (data) {
  data.forEach(function (d) {
    d.planEnd = parseDate(d.planEnd);
    d.planStart = parseDate(d.planStart);
    d.cancelDate = parseDate(d.cancelDate);
    d.sentDate = d.sentDate.map(function (date) {
      return parseDate(date);
    });
    d.openDate = d.openDate.map(function (date) {
      return parseDate(date);
    });
  });

  var clean = data.filter(function (d) {
    return d.planEnd < new Date('2050');
  });

  x.domain(d3.extent(clean, function (d) {
    return d.planStart;
  }));
  y.domain(d3.extent(clean, function (d) {
    return d.planEnd;
  }));

  g.append('g').attr('class', 'x-axis').attr('transform', 'translate(0,' + height + ')').call(xAxis);

  g.append('g').attr('class', 'y-axis').call(yAxis);

  g.selectAll('circle').data(clean).enter().append('circle').attr('class', 'dots').attr('cx', function (d) {
    return x(d.planStart);
  }).attr('cy', function (d) {
    return y(d.planEnd);
  }).attr('r', 1);
});