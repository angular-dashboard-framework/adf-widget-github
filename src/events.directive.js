'use strict';

angular
  .module('adf.widget.github')
  .controller('GithubEventsController')
  .directive('eventDirective', function() {
    return {
      templateUrl: 'src/events.html'
    };
  });
