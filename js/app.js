(function() {
  var steps = 50;
  var interpolate = function(p1, p2, time) {
    return parseInt((time - p1.time)*(p2.rate - p1.rate)/(p2.time - p1.time) + p1.rate);
  };

  var app = angular.module('app', ['firebase']);

  app.controller('DevicesController', ['$scope', '$firebase', function($scope, $firebase) {
    var ref = new Firebase('https://sweltering-torch-1638.firebaseio.com/');
    var sync = $firebase(ref);
    var self = this;

    this.ds = [];
    this.data = sync.$asObject();
    ref.on('value', function(snap) {
      _.each(snap.val()._devices, function(d, ind) {
        var unsortedSignals = _.map(d.signals, function(rate, time) {
          return {time: parseInt(time), rate: rate};
        });
        self.ds[ind] = [];
        var signals = _.sortBy(unsortedSignals, function(n) {
          return n.time;
        });
        var min = signals[0].time;
        var max = signals[signals.length - 1].time;
        var step = (max - min)/steps;
        var c = 0;
        for (var i = 0; i < steps; i++) {
          while (signals[0].time + i*step > signals[c + 1].time) {
            c++;
          }
          var value = interpolate(signals[c], signals[c + 1], i*step + signals[0].time);
          self.ds[ind].push({time: i, rate: value});
        }
        console.log(JSON.stringify(self.ds[ind]));
        /*
        var canvas = $('#canvas' + ind);
        var context = canvas.getContext('2d');
        */
      });
    });
  }]);

  app.directive('devices', function($templateCache) {
    return {
      restrict: 'E',
      templateUrl: 'devices.html'
    };
  });
})();
