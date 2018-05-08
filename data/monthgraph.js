'use strict';

/* global d3 */

(function () {
  var parseDate = d3.timeParse('%Y%m%d');

  var svg = d3.select('#j-month-graph');
  var viewbox = svg.attr('viewBox').split(' ').map(function (x) {
    return +x;
  });
  var margins = { top: 10, right: 40, bottom: 40, left: 40 };
  var width = viewbox[2] - margins.left - margins.right;
  var height = viewbox[3] - margins.top - margins.bottom;

  var g = svg.append('g').attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

  var x = d3.scaleBand().rangeRound([0, width]).padding(0.2);

  var y = d3.scaleLinear().range([height, 0]);

  var xAxis = d3.axisBottom(x);
  var yAxis = d3.axisLeft(y);

  d3.csv('RenewalComms.csv').then(function (data) {
    data.forEach(function (d) {
      d.sent = parseDate(d.sent);
      d.open = parseDate(d.open);
      d.sendDayName = d3.timeFormat('%A')(d.sent);
      d.sendMonth = d3.timeFormat('%B')(d.sent);
      d.sendDayNumber = d3.timeFormat('%d')(d.sent);
      if (d.open !== null) {
        d.openDayName = d3.timeFormat('%A')(d.open);
        d.openMonth = d3.timeFormat('%B')(d.open);
        d.openDayNumber = d3.timeFormat('%d')(d.open);
      }
    });

    data = data.filter(function (d) {
      return d.sent >= parseDate(20130901);
    });

    var opened = data.filter(function (d) {
      return d.open;
    });
    var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    var dayCounts = days.map(function (day) {
      return {
        day: day,
        sent: data.reduce(function (c, d) {
          if (d.sendDayName === day) return c + 1;else return c;
        }, 0),
        opened: opened.reduce(function (c, d) {
          if (d.sendDayName === day) return c + 1;else return c;
        }, 0)
      };
    });
    dayCounts.forEach(function (day) {
      day.percent = day.opened / day.sent;
    });
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var monthCounts = months.map(function (month) {
      return {
        month: month,
        sent: data.reduce(function (c, d) {
          if (d.sendMonth === month) return c + 1;else return c;
        }, 0),
        opened: opened.reduce(function (c, d) {
          if (d.sendMonth === month) return c + 1;else return c;
        }, 0)
      };
    });
    monthCounts.forEach(function (month) {
      month.percent = month.opened / month.sent;
    });

    x.domain(months);
    y.domain([0, d3.max(monthCounts, function (d) {
      return d.sent;
    })]);
    // y.domain([0, 0.5])

    g.append('g').attr('class', 'x-axis').attr('transform', 'translate(0,' + height + ')').call(xAxis);

    g.append('g').attr('class', 'y-axis').call(yAxis);

    var sentBars = g.append('g');

    sentBars.selectAll('rect').data(monthCounts).enter().append('rect').attr('x', function (d) {
      return x(d.month);
    }).attr('y', function (d) {
      return y(d.sent);
    }).attr('width', x.bandwidth()).attr('height', function (d) {
      return height - y(d.sent);
    }).attr('fill', 'crimson').attr('opacity', 0.75);

    var openBars = g.append('g');

    openBars.selectAll('rect').data(monthCounts).enter().append('rect').attr('x', function (d) {
      return x(d.month);
    }).attr('y', function (d) {
      return y(d.opened);
    }).attr('width', x.bandwidth()).attr('height', function (d) {
      return height - y(d.opened);
    }).attr('fill', 'steelblue');

    d3.select('#j-mg1').on('click', function () {
      d3.select('#j-mg1').attr('class', 'control active');
      d3.select('#j-mg2').attr('class', 'control');

      y.domain([0, d3.max(monthCounts, function (d) {
        return d.sent;
      })]);

      yAxis.tickFormat(d3.format(',.0f'));

      g.select('.y-axis').transition().call(yAxis);

      sentBars.selectAll('rect').transition().attr('opacity', 0.75);

      openBars.selectAll('rect').transition().attr('y', function (d) {
        return y(d.opened);
      }).attr('height', function (d) {
        return height - y(d.opened);
      });
    });

    d3.select('#j-mg2').on('click', function () {
      d3.select('#j-mg1').attr('class', 'control');
      d3.select('#j-mg2').attr('class', 'control active');

      y.domain([0, d3.max(monthCounts, function (d) {
        return d.percent;
      })]);

      yAxis.tickFormat(d3.format('.0%'));

      g.select('.y-axis').transition().call(yAxis);

      sentBars.selectAll('rect').transition().attr('opacity', 0);

      openBars.selectAll('rect').transition().attr('y', function (d) {
        return y(d.percent);
      }).attr('height', function (d) {
        return height - y(d.percent);
      });
    });
  });
})();