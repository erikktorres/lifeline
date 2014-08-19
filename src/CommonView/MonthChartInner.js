require('../Chart.less');

var d3 = window.d3;
var moment = require('moment');

d3.chart('MonthInner', {
  initialize: function() {
    var chart = this;
    var boxWidth, boxHeight, margins;

    this.layer('MonthInner-base', this.base.insert('g', '.Chart-rect--invisible').attr('class', 'MonthInner-base'), {
      dataBind: function() {
        return this.selectAll('rect').data(chart.days());
      },
      insert: function() {
        return this.append('rect');
      },
      events: {
        enter: function() {
          margins = chart.ms;
          boxWidth = (chart.w - margins.horizontal*2 - margins.inner*6)/7;
          boxHeight = (chart.h - margins.vertical*4 - margins.inner*5)/6;

          var xPosition = function(d) {
            var dayOfWeek = d.day();
            var i = dayOfWeek - 1;
            if (dayOfWeek <= 6 && dayOfWeek !== 0) {
              return margins.horizontal + i * margins.inner + i * boxWidth;
            }
            else {
              var constant = 6;
              return margins.horizontal + constant * margins.inner + constant * boxWidth;
            }
          };
          var yPosition = function() {
            var days = chart.days();
            var firstDayOfWeek = days[0].day();
            var offset = (firstDayOfWeek !== 0) ? firstDayOfWeek - 2 : 5;
            // SHAME: vertical margin doesn't include space for month label
            // so must bump it down equivalently
            // probably should refactor this later...
            return function(d) {
              var row = Math.floor((d.date() + offset) / 7);
              return margins.vertical*3 + boxHeight * row + row * margins.inner;
            };
          };
          this.attr({
            width: boxWidth,
            height: boxHeight,
            x: xPosition,
            y: yPosition(),
            'class': 'Chart-rect--day'
          });
        }
      }
    });
  },
  location: function(location) {
    var _days = [];
    for (var i = 1; i <= 31; ++i) {
      var date = (i < 10) ? '0' + i : i + '';
      var day = moment(location + '-' + date, 'YYYY-MM-DD');
      if (day.isValid()) {
        _days.push(day);
      }
    }
    this.l = location;
    this.days = function() { return _days; };
    return this;
  },
  width: function(w) {
    this.w = w;
    return this;
  },
  height: function(h) {
    this.h = h;
    return this;
  },
  margins: function(margins) {
    this.ms = margins;
    return this;
  }
});

var chart;

module.exports = {
  create: function(el, options) {
    chart = d3.select(el)
      .chart('MonthInner')
      .location(options.location)
      .width(options.width)
      .height(options.height)
      .margins(options.margins);
    return chart;
  }
};