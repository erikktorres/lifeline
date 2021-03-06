require('../Chart.less');
var EventEmitter = require('events').EventEmitter;

var d3 = window.d3;

var MonthData = require('./MonthData');
var MonthChartInner = require('../CommonView/MonthChartInner');
var MonthBarTIR = require('./MonthBarTIR');

d3.chart('Month', {
  initialize: function() {
    this.w = this.base.attr('width');
    this.h = this.base.attr('height');
    this.emitter = new EventEmitter();

    var chart = this;
    var margin = 10;

    this.layer('Month-base', this.base.append('g').attr('class', 'Month-base'), {
      dataBind: function() {
        return this.selectAll('g').data([chart.month()]);
      },
      insert: function() {
        return this.append('g');
      },
      events: {
        enter: function() {
          this.attr({
            'class': 'Chart-month--base',
            'transform': 'translate(' + margin + ',' + margin + ')'
          });
          var month = MonthChartInner.create(this.node(), {
            location: chart.month(),
            width: chart.w,
            height: chart.h,
            margins: {
              horizontal: 30,
              vertical: 20,
              inner: 10
            }
          });
          month.draw();
        }
      }
    });

    this.layer('Month-data', this.base.append('g').attr('class', 'Month-data'), {
      dataBind: function() {
        return this.selectAll('g').data(chart.actualMonth());
      },
      insert: function() {
        return this.append('g');
      },
      events: {
        enter: function() {
          this.attr({
            'class': 'Chart-month--data',
            'transform': 'translate(' + margin + ',' + margin + ')'
          });
          var month = MonthBarTIR.create(this.node(), {
            location: chart.month(),
            width: chart.w,
            height: chart.h,
            margins: {
              horizontal: 30,
              vertical: 20,
              inner: 10
            }
          });
          month.draw(chart.dData);
        }
      }
    });
  },
  location: function(location) {
    this.month = function() { return location; };
    return this;
  },
  transform: function(cube) {
    var loc = [];
    if (!cube) {
      this.dData = [];
    }
    else {
      loc.push(location);
      this.dData = MonthData(cube);
    }
    this.actualMonth = function() { return loc; };
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
      .chart('Month')
      .location(options.location);
    return chart;
  }
};
