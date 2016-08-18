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

'use strict';

angular
  .module('adf.widget.github', ['adf.provider', 'chart.js'])
  .value('githubApiUrl', 'https://api.github.com/')
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
      commits: function (github, config) {
        if (config.path) {
          return github.getCommits(config);
        }
      }
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
    }, widget))
    .widget('githubUserEvents', {
      title: 'Github User Events',
      description: 'Display events of a certain user.',
      category: 'GitHub',
      controller: 'GithubEventsController',
      controllerAs: 'vm',
      templateUrl: '{widgetsPath}/github/src/events.user.html',
      reload: true,
      edit: {
        templateUrl: '{widgetsPath}/github/src/events.user.edit.html'
      },
      resolve: {
        events: function(github, config){
          if (config.user){
            return github.getUserEvents(config);
          }
        }
      }
    })
    .widget('githubOrganisationEvents', {
      title: 'Github Organisation Events',
      description: 'Display events of a public organisation.',
      category: 'GitHub',
      controller: 'GithubEventsController',
      controllerAs: 'vm',
      templateUrl: '{widgetsPath}/github/src/events.org.html',
      reload: true,
      edit: {
        templateUrl: '{widgetsPath}/github/src/events.org.edit.html'
      },
      resolve: {
        events: function(github, config){
          if (config.org){
            return github.getOrgaEvents(config);
          }
        }
      }
    })
    .widget('githubRepoEvents', {
      title: 'Github Repository Events',
      description: 'Display events of a certain repository.',
      category: 'GitHub',
      controller: 'GithubEventsController',
      controllerAs: 'vm',
      templateUrl: '{widgetsPath}/github/src/events.repo.html',
      reload: true,
      edit: {
        templateUrl: '{widgetsPath}/github/src/events.repo.edit.html'
      },
      resolve: {
        events: function(github, config){
          if (config.path){
            return github.getRepoEvents(config);
          }
        }
      }
    });
}
