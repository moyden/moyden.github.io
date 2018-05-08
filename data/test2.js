/* global d3 */

const parseDate = d3.timeParse('%Y%m%d');

const svg = d3.select('#j-svg');
const viewbox = svg.attr('viewBox').split(' ').map(x => +x);
const margins = { top: 50, right: 50, bottom: 50, left: 50 };
const width = viewbox[2] - margins.left - margins.right;
const height = viewbox[3] - margins.top - margins.bottom;

const g = svg.append('g').attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

const x = d3.scaleBand().rangeRound([0, width]).padding(0.2);

const y = d3.scaleLinear().range([height, 0]);

const xAxis = d3.axisBottom(x);
const yAxis = d3.axisLeft(y);

d3.csv('RenewalComms.csv').then(function (data) {
  data.forEach(d => {
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

  const opened = data.filter(d => d.open);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayCounts = days.map(day => {
    return {
      day: day,
      sent: data.reduce((c, d) => {
        if (d.sendDayName === day) return c + 1;else return c;
      }, 0),
      opened: opened.reduce((c, d) => {
        if (d.sendDayName === day) return c + 1;else return c;
      }, 0)
    };
  });
  dayCounts.forEach(day => {
    day.percent = day.opened / day.sent;
  });
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthCounts = months.map(month => {
    return {
      month: month,
      sent: data.reduce((c, d) => {
        if (d.sendMonth === month) return c + 1;else return c;
      }, 0),
      opened: opened.reduce((c, d) => {
        if (d.sendMonth === month) return c + 1;else return c;
      }, 0)
    };
  });
  monthCounts.forEach(month => {
    month.percent = month.opened / month.sent;
  });

  x.domain(days);
  y.domain([0, d3.max(dayCounts, d => d.sent)]);
  // y.domain([0, 0.5])

  g.append('g').attr('class', 'x-axis').attr('transform', 'translate(0,' + height + ')').call(xAxis);

  g.append('g').attr('class', 'y-axis').call(yAxis);

  const sentBars = g.append('g');

  sentBars.selectAll('rect').data(dayCounts).enter().append('rect').attr('x', d => x(d.day)).attr('y', d => y(d.sent)).attr('width', x.bandwidth()).attr('height', d => height - y(d.sent)).attr('fill', 'crimson').attr('opacity', 0.75);

  const openBars = g.append('g');

  openBars.selectAll('rect').data(dayCounts).enter().append('rect').attr('x', d => x(d.day)).attr('y', d => y(d.opened)).attr('width', x.bandwidth()).attr('height', d => height - y(d.opened)).attr('fill', 'steelblue');

  let normalled = false;

  svg.on('click', function () {
    if (normalled) {
      y.domain([0, d3.max(dayCounts, d => d.sent)]);

      yAxis.tickFormat(d3.format('.3r'));

      g.select('.y-axis').transition().call(yAxis);

      sentBars.selectAll('rect').transition().attr('opacity', 0.75);

      openBars.selectAll('rect').transition().attr('y', d => y(d.opened)).attr('height', d => height - y(d.opened));

      normalled = false;
    } else {
      y.domain([0, 0.3]);

      yAxis.tickFormat(d3.format('.0%'));

      g.select('.y-axis').transition().call(yAxis);

      sentBars.selectAll('rect').transition().attr('opacity', 0);

      openBars.selectAll('rect').transition().attr('y', d => y(d.percent)).attr('height', d => height - y(d.percent));

      normalled = true;
    }
  });
});