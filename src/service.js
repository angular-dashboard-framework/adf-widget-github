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
  .module('adf.widget.github')
  .factory('github', GithubService);

function GithubService($q, $http, githubApiUrl) {
  var service = {
    getCommits: getCommits,
    getIssues: getIssues,
    getUserEvents: getUserEvents,
    getOrgaEvents: getOrgaEvents,
    getRepoEvents: getRepoEvents
  };

  return service;

  // implementation

  function getIssues(config) {
    return fetch(createUrl('issues', config));
  }

  function getCommits(config) {
    return fetch(createUrl('commits', config));
  }

  function getUserEvents(config) {
    return fetch(createUrlUserEvents('events', config))
    .then(transformData);
  }

  function getOrgaEvents(config) {
    return fetch(createUrlOrgaEvents('events', config))
    .then(transformData);
  }

  function getRepoEvents(config) {
    return fetch(createUrl('events', config))
    .then(transformData);
  }

  function transformData(data){
    for(var i = 0; i<data.length; i++){

      data[i].eventImage = data[i].actor.avatar_url;
      data[i].eventUserUrl = 'https://github.com/' + data[i].actor.login;
      data[i].eventTitle = data[i].type;

      if(data[i].payload.pull_request){
        data[i].eventMessage = data[i].payload.pull_request.title;
        data[i].eventEventUrl = data[i].payload.pull_request.html_url;
      }
      else {
        data[i].eventMessage = "todo";
        data[i].eventEventUrl = "todo";
      }
    }
    return data;
  }

  function createUrl(type, config){
    var url = githubApiUrl + 'repos/' + config.path + '/' + type + '?callback=JSON_CALLBACK';
    if (config.accessToken){
      url += '&access_token=' + config.accessToken;
    }
    return url;
  }

  function createUrlUserEvents(type, config){
    var url = githubApiUrl + 'users/' + config.user + '/' + type;
    if(config.org){
      url += '/orgs/' + config.org;
    }
    url += '?callback=JSON_CALLBACK';
    if (config.accessToken){
      url += '&access_token=' + config.accessToken;
    }
    return url;
  }

  function createUrlOrgaEvents(type, config){
    var url = githubApiUrl + 'orgs/' + config.org + '/' + type + '?callback=JSON_CALLBACK';
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
