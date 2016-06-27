(function(window, undefined) {'use strict';
/*
 * The MIT License
 *
 * Copyright (c) 2015, Sebastian Sdorra
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */



angular
  .module('adf.widget.github', ['adf.provider', 'chart.js'])
  .value('githubApiUrl', 'https://api.github.com/repos/')
  .config(RegisterWidgets);

function RegisterWidgets(dashboardProvider) {
  // template object for github widgets
  var widget = {
    reload: true,
    category: 'GitHub',
    controllerAs: 'vm',
    edit: {
      templateUrl: '{widgetsPath}/github/src/edit.html'
    }
  };

  var commitWidgets = angular.extend({
    resolve: {
      /* @ngInject */
      commits: ["github", "config", function (github, config) {
        if (config.path) {
          return github.getCommits(config);
        }
      }]
    }
  }, widget);

  // register github template by extending the template object
  dashboardProvider
    .widget('githubHistory', angular.extend({
      title: 'Github History',
      description: 'Display the commit history of a GitHub project as chart',
      controller: 'GithubHistoryController',
      templateUrl: '{widgetsPath}/github/src/line-chart.html'
    }, commitWidgets))
    .widget('githubAuthor', angular.extend({
      title: 'Github Author',
      description: 'Displays the commits per author as pie chart',
      controller: 'GithubAuthorController',
      templateUrl: '{widgetsPath}/github/src/pie-chart.html'
    }, commitWidgets))
    .widget('githubCommits', angular.extend({
      title: 'Github Commits',
      description: 'Displays the commits as list',
      controller: 'GithubCommitsController',
      templateUrl: '{widgetsPath}/github/src/commits.html'
    }, commitWidgets))
    .widget('githubIssues', angular.extend({
      title: 'Github Issues',
      description: 'Displays issues as list of a GitHub project',
      controller: 'GithubIssuesController',
      templateUrl: '{widgetsPath}/github/src/issues.html',
      resolve: {
        issues: function(github, config){
          if (config.path){
            return github.getIssues(config);
          }
        }
      }
    }, widget));
}
RegisterWidgets.$inject = ["dashboardProvider"];

angular.module("adf.widget.github").run(["$templateCache", function($templateCache) {$templateCache.put("{widgetsPath}/github/src/commits.html","<div><div ng-if=!vm.commits class=\"alert alert-info\">Please configure the widget</div><div ng-if=config.path><ul class=media-list><li class=media ng-repeat=\"commit in vm.commits\"><div class=media-left><a href={{commit.author.html_url}} target=_blank><img class=\"media-object img-thumbnail\" ng-src={{commit.author.avatar_url}} style=\"width: 64px; height: 64px;\"></a></div><div class=media-body><h4 class=media-heading><a href={{commit.html_url}} target=_blank>{{commit.sha | limitTo: 12}}</a></h4><p>{{commit.commit.message | limitTo: 128}}</p><small><a href={{commit.author.html_url}} target=_blank>{{commit.commit.author.name}}</a>, {{commit.commit.author.date | date: \'yyyy-MM-dd HH:mm\'}}</small></div></li></ul></div></div>");
$templateCache.put("{widgetsPath}/github/src/edit.html","<form role=form><div class=form-group><label for=path>Github Repository Path</label> <input type=text class=form-control id=path ng-model=config.path placeholder=\"Enter Path (username/reponame)\"></div><div class=form-group><label for=path>Access Token</label> <input type=text class=form-control id=path ng-model=config.accessToken></div></form>");
$templateCache.put("{widgetsPath}/github/src/issues.html","<div><div ng-if=!config.path class=\"alert alert-info\">Please configure the widget</div><div ng-if=config.path><ul class=media-list><li class=media ng-repeat=\"issue in vm.issues\"><div class=media-left><a href={{issue.user.html_url}} target=_blank><img class=\"media-object img-thumbnail\" ng-src={{issue.user.avatar_url}} style=\"width: 64px; height: 64px;\"></a></div><div class=media-body><h4 class=media-heading><a href={{issue.html_url}} target=_blank>#{{issue.number}} {{issue.title}}</a></h4><p>{{issue.body | limitTo: 128}}</p><small><a href={{issue.user.html_url}} target=_blank>{{issue.user.login}}</a>, {{issue.created_at | date: \'yyyy-MM-dd HH:mm\'}}</small></div></li></ul></div></div>");
$templateCache.put("{widgetsPath}/github/src/line-chart.html","<div><div class=\"alert alert-info\" ng-if=!vm.chart>Please insert a repository path in the widget configuration</div><div ng-if=vm.chart><canvas id=line class=\"chart chart-line\" chart-data=vm.chart.data chart-labels=vm.chart.labels chart-series=vm.chart.series></canvas></div></div>");
$templateCache.put("{widgetsPath}/github/src/pie-chart.html","<div><div class=\"alert alert-info\" ng-if=!vm.chart>Please insert a repository path in the widget configuration</div><div ng-if=vm.chart><canvas id=pie class=\"chart chart-pie\" chart-legend=true chart-data=vm.chart.data chart-labels=vm.chart.labels></canvas></div></div>");}]);
/*
 * The MIT License
 *
 * Copyright (c) 2015, Sebastian Sdorra
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */



angular
  .module('adf.widget.github')
  .factory('github', GithubService);

function GithubService($q, $http, githubApiUrl) {
  var service = {
    getCommits: getCommits,
    getIssues: getIssues
  };

  return service;

  // implementation

  function getIssues(config) {
    return fetch(createUrl('issues', config));
  }

  function getCommits(config) {
    return fetch(createUrl('commits', config));
  }

  function createUrl(type, config){
    var url = githubApiUrl + config.path + '/' + type + '?callback=JSON_CALLBACK';
    if (config.accessToken){
      url += '&access_token=' + config.accessToken;
    }
    return url;
  }

  function fetch(url){
    var deferred = $q.defer();
    $http.jsonp(url)
      .success(function(data) {
        if (data && data.meta) {
          var status = data.meta.status;
          if (status < 300) {
            deferred.resolve(data.data);
          } else {
            deferred.reject(data.data.message);
          }
        }
      })
      .error(function() {
        deferred.reject();
      });
    return deferred.promise;
  }
}
GithubService.$inject = ["$q", "$http", "githubApiUrl"];

/*
 * The MIT License
 *
 * Copyright (c) 2015, Sebastian Sdorra
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */



angular
  .module('adf.widget.github')
  .controller('GithubIssuesController', GithubIssuesController);

function GithubIssuesController(config, issues) {
  var vm = this;

  vm.issues = issues;
}
GithubIssuesController.$inject = ["config", "issues"];

/*
 * The MIT License
 *
 * Copyright (c) 2015, Sebastian Sdorra
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */



angular
  .module('adf.widget.github')
  .controller('GithubHistoryController', GithubHistoryController);

function GithubHistoryController($filter, config, commits) {
  var vm = this;
  if (commits) {
    vm.chart = createChart();
  }

  function createChart() {
    var data = {};

    var orderedCommits = $filter('orderBy')(commits, function(commit){
      return commit.commit.author.date;
    });

    angular.forEach(orderedCommits, function(commit) {
      var day = commit.commit.author.date;
      day = day.substring(0, day.indexOf('T'));

      if (data[day]) {
        data[day]++;
      } else {
        data[day] = 1;
      }
    });

    var chartData = [];
    var chart = {
      labels: [],
      data: [chartData],
      series: ["Commits"],
      class: "chart-line"
    };

    angular.forEach(data, function(count, day) {
      chart.labels.push(day);
      chartData.push(count);
    });

    return chart;
  }
}
GithubHistoryController.$inject = ["$filter", "config", "commits"];

/*
 * The MIT License
 *
 * Copyright (c) 2015, Sebastian Sdorra
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */



angular
  .module('adf.widget.github')
  .controller('GithubCommitsController', GithubCommitsController);

function GithubCommitsController(config, commits) {
  var vm = this;

  vm.commits = commits;
}
GithubCommitsController.$inject = ["config", "commits"];

/*
 * The MIT License
 *
 * Copyright (c) 2015, Sebastian Sdorra
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */



angular
  .module('adf.widget.github')
  .controller('GithubAuthorController', GithubAuthorController);

function GithubAuthorController(config, commits) {
  var vm = this;

  if (commits) {
    vm.chart = createChart();
  }

  function createChart() {
    var data = {};
    angular.forEach(commits, function (commit) {
      var author = commit.commit.author.name;
      if (data[author]) {
        data[author]++;
      } else {
        data[author] = 1;
      }
    });

    var chart = {
      labels: [],
      data: [],
      series: ["Commits"],
      class: "chart-pie"
    };

    angular.forEach(data, function (count, author) {
      chart.labels.push(author);
      chart.data.push(count);
    });

    return chart;
  }
}
GithubAuthorController.$inject = ["config", "commits"];
})(window);