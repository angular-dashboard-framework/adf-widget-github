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

      data[i].userImage = data[i].actor.avatar_url;
      data[i].userUrl = 'https://github.com/' + data[i].actor.login;
      data[i].repoName = data[i].repo.name;
      data[i].repoUrl = 'https://github.com/' + data[i].repo.name;

      if(data[i].type === "PullRequestEvent"){
        if (data[i].payload.action === "closed") {
          data[i].message = "closed pull request " + data[i].repoName + "#" + data[i].payload.number;
        }
        else if (data[i].payload.action === "opened"){
          data[i].message = "opened pull request " + data[i].repoName + "#" + data[i].payload.number;
        }
        if(data[i].payload.pull_request){
          data[i].commentMessage = data[i].payload.pull_request.title;
        }
      }
      else if (data[i].type === "PushEvent") {
        data[i].message = "pushed to "+ (data[i].payload.ref).substring(11) +" at "+ data[i].repo.name;
        if (data[i].payload.commits){
          data[i].comments = data[i].payload.commits;
          for (var j = 0; j < data[i].payload.commits.length; j++){
            data[i].comments[j].id = data[i].payload.commits[j].sha;
            data[i].comments[j].link = data[i].repoUrl +"/commit/"+data[i].payload.commits[j].sha;
            data[i].comments[j].message = data[i].payload.commits[j].message;
          }
        }
      }
      else if (data[i].type === "IssueCommentEvent") {
        data[i].message = "commented on issue " + data[i].repoName + "#" + data[i].payload.issue.number;
        if (data[i].payload.issue.pull_request) {
          data[i].message = "commented on pull request " + data[i].repoName + "#" + data[i].payload.issue.number;
        }
        if(data[i].payload.comment){
          data[i].commentMessage = data[i].payload.comment.body;
        }
      }
      else if (data[i].type === "IssuesEvent") {
        if (data[i].payload.action === "closed") {
          data[i].message = "closed issue " + data[i].repoName + "#" + data[i].payload.issue.number;
          data[i].commentMessage = data[i].payload.issue.body;
        }
      }
      else if (data[i].type === "DeleteEvent") {
        data[i].message = "deleted " + data[i].payload.ref_type + " " + data[i].payload.ref + " at " + data[i].repoName;
      }
      else if (data[i].type === "ReleaseEvent") {
        data[i].message = "released " + data[i].payload.release.name + " at " + data[i].repoName;
        if (data[i].payload.release.assets){
          data[i].comments = data[i].payload.release.assets;
          for (var j = 0; j < data[i].payload.release.assets.length; j++){
            data[i].comments[j].message = data[i].payload.release.assets[j].name;
          }
        }
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
