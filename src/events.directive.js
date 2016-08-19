'use strict';

angular
  .module('adf.widget.github')
  .directive('eventDirective', function() {
    return {
      templateUrl: 'src/events.html'
    };
  });
