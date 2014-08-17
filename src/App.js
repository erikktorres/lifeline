/** @jsx React.DOM */

var React = require('react');

var zooming = require('./zooming');
var dataService = window.dataService = require('./dataService');

require('./App.less');

var App = React.createClass({
  getInitialState: function() {
    return {
      zoom: {
        level: 'year',
        location: '2014'
      }
    };
  },

  componentDidMount: function() {
    this.createChart();
  },

  componentDidUpdate: function() {
    this.removeChart();
    this.createChart();
  },

  createChart: function(cb) {
    var el = this.refs.chart.getDOMNode();
    var Chart = zooming.getChart(this.state.zoom);
    this.chart = Chart.create(el, {
      width: el.offsetWidth,
      height: el.offsetHeight,
      location: this.state.zoom.location
    });
    this.chart.emitter.on('zoom', this.handleZoom);

    var self = this;
    dataService.fetchForZoom(this.state.zoom, function(err, dataCube) {
      if (err) {
        throw err;
      }
      self.chart.draw(dataCube);
      return cb && cb();
    });
  },

  removeChart: function() {
    var el = this.refs.chart.getDOMNode();
    this.chart.remove(el);
  },

  render: function() {
    var self = this;
    var Title = zooming.getTitle(this.state.zoom);
    var previousPageZoom = zooming.previousPage(this.state.zoom);
    var handleClickPreviousPage = function(e) {
      e.preventDefault();
      return self.handleZoom(previousPageZoom);
    };
    var nextPageZoom = zooming.nextPage(this.state.zoom);
    var handleClickNextPage = function(e) {
      e.preventDefault();
      return self.handleZoom(nextPageZoom);
    };

    return (
      <div className="App">
        <div className="App-verticalAlign">
          {this.renderZoomOut()}
          <div className="App-middleHorizontalAlign">
            <a href="#" className="App-zoom App-zoom--vertical"
              onClick={handleClickPreviousPage}>
              <div className="App-zoomIcon">&#9664;</div>
            </a>
            <div className="App-middleVerticalAlign">
              <div className="App-title">
                <Title zoom={this.state.zoom} />
              </div>
              <div className="App-chart" ref="chart"></div>
            </div>
            <a href="#" className="App-zoom App-zoom--vertical"
              onClick={handleClickNextPage}>
              <div className="App-zoomIcon">&#9654;</div>
            </a>
          </div>
          {this.renderZoomIn()}
        </div>
      </div>
    );
  },

  renderZoomOut: function() {
    if (!zooming.canZoomOut(this.state.zoom)) {
      return (
        <div className="App-zoom App-zoom--horizontal is-disabled">
          <div className="App-zoomIcon">&#8854;</div>
        </div>
      );
    }

    var newZoom = zooming.zoomOut(this.state.zoom);
    var self = this;
    var handleClick = function(e) {
      e.preventDefault();
      self.handleZoom(newZoom);
    };
    return (
      <a href="#" className="App-zoom App-zoom--horizontal"
        onClick={handleClick}>
        <div className="App-zoomIcon">&#8854;</div>
      </a>
    );
  },

  renderZoomIn: function() {
    if (!zooming.canZoomIn(this.state.zoom)) {
      return (
        <div className="App-zoom App-zoom--horizontal is-disabled">
          <div className="App-zoomIcon">&oplus;</div>
        </div>
      );
    }

    var newZoom = zooming.zoomIn(this.state.zoom);
    var self = this;
    var handleClick = function(e) {
      e.preventDefault();
      self.handleZoom(newZoom);
    };

    return (
      <a href="#" className="App-zoom App-zoom--horizontal"
        onClick={handleClick}>
        <div className="App-zoomIcon">&oplus;</div>
      </a>
    );
  },

  handleZoom: function(zoom) {
    this.setState({zoom: zoom});
  }
});

module.exports = App;
