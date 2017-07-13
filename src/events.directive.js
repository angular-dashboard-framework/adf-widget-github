'use strict';

angular
  .module('adf.widget.github')
  .directive('events', function() {
    return {
      templateUrl: 'src/events.html'
    };
  });
