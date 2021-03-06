require('../Chart.less');
var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;

var d3 = window.d3;
var moment = require('moment');

var YearData = require('./YearData');
var MonthChartInner = require('../CommonView/MonthChartInner');
var YearMedianHeat = require('./YearMedianHeat');

d3.chart('Year', {
  initialize: function() {
    this.w = this.base.attr('width');
    this.h = this.base.attr('height');
    this.emitter = new EventEmitter();

    var chart = this;
    var margin = 10;
    var boxWidth = (this.w - margin * 7)/6, boxHeight = (this.h - margin * 3)/2;
    
    var xPosition = function(d, i) {
      var month = d.month();
      if (month >= 6) {
        i = i - 6;
      }
      return i * boxWidth + (i + 1) * margin;
    };
    var yPosition = function(d) {
      var month = d.month();
      if (month >= 6) {
        return chart.h/2 + margin/2;
      }
      else {
        return margin;
      }
    };

    var monthData = function(el) {
      return function() { return this.selectAll(el).data(chart.months()); };
    };

    this.layer('Month-base', this.base.append('g').attr('class', 'Month-base'), {
      dataBind: function() {
        return this.selectAll('g').data(chart.months());
      },
      insert: function() {
        return this.append('g').attr('class', 'MonthInner--base');
      },
      events: {
        enter: function() {
          this.attr({
            'transform': function(d, i) {
                return 'translate(' + xPosition(d, i) + ',' + yPosition(d) + ')';
              }
          })
          .each(function(d) {
            var month = MonthChartInner.create(this, {
              location: d.format('YYYY-MM'),
              width: boxWidth,
              height: boxHeight,
              margins: {
                horizontal: margin,
                vertical: margin,
                inner: 2
              }
            });
            month.draw();
          });
        }
      }
    });

    this.layer('Month-data', this.base.append('g').attr('class', 'Month-data'), {
      dataBind: function() {
        return this.selectAll('g').data(chart.actualMonths());
      },
      insert: function() {
        return this.append('g').attr('class', 'MonthInner--data');
      },
      events: {
        enter: function() {
          this.attr({
            'transform': function(d, i) {
                return 'translate(' + xPosition(d, i) + ',' + yPosition(d) + ')';
              }
          })
          .each(function(d) {
            var loc = d.format('YYYY-MM');
            var month = YearMedianHeat.create(this, {
              location: d.format('YYYY-MM'),
              width: boxWidth,
              height: boxHeight,
              margins: {
                horizontal: margin,
                vertical: margin,
                inner: 2
              }
            });
            month.draw(chart.dData[loc]);
          });
        }
      }
    });

    this.layer('Month-text', this.base.append('g').attr('class', 'Month-text'), {
      dataBind: monthData('text'),
      insert: function() {
        return this.append('text');
      },
      events: {
        enter: function() {
          var xPosition = function(d, i) {
            var month = d.month();
            if (month >= 6) {
              i = i - 6;
            }
            return i * boxWidth + (i + 1) * margin + boxWidth/2;
          };
          var yPosition = function(d) {
            var month = d.month();
            if (month >= 6) {
              return chart.h/2 + margin/2 + margin*2;
            }
            else {
              return margin * 3;
            }
          };
          var monthText = function(d) {
            return d.format('MMMM');
          };
          this.attr({
            x: xPosition,
            y: yPosition,
            'class': 'Chart-text Chart-text--centered'
          })
          .text(monthText);
        }
      }
    });

    this.layer('Month-rect', this.base.append('g').attr('class', 'Month-rect'), {
      dataBind: monthData('rect'),
      insert: function() {
        return this.append('rect');
      },
      events: {
        enter: function() {
          this.attr({
              x: xPosition,
              y: yPosition,
              width: boxWidth,
              height: boxHeight,
              'class': 'Chart-rect--invisible'
            })
            .on('click', function(d) {
              chart.emitter.emit('zoom', {
                level: 'month',
                location: d.format('YYYY-MM')
              });
            });
        }
      }
    });
  },
  location: function(year) {
    var _months = [];
    for (var i = 0; i < 12; ++i) {
      _months.push(moment(year + ' ' + (i + 1), 'YYYY M'));
    }
    this.months = function() { return _months; };
    return this;
  },
  transform: function(cube) {
    var _actualMonths = [];
    if (!cube) {
      this.dData = [];
    }
    else {
      this.dData = YearData(cube);
      _actualMonths = _.map(Object.keys(this.dData), function(d) { return moment(d, 'YYYY-MM'); });
    }
    this.actualMonths = function() { return _actualMonths; };
    return this.dData;
  },
  remove: function() {
    this.base.remove();
    return this;
  }
});

var chart;

module.exports = {
  create: function(el, options) {
    chart = d3.select(el)
      .append('svg')
      .attr({
        width: options.width,
        height: options.height,
        preserveAspectRatio: 'none',
        viewBox: '0 0 ' + el.offsetWidth + ' ' + el.offsetHeight
      })
      .chart('Year')
      .location(options.location);
    return chart;
  }
};
