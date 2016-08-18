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

      var repoName = data[i].repo.name;
      var repoUrl = data[i].repoUrl;

      var eventType = data[i].type;

      if(eventType === "PullRequestEvent"){

        var issueNumer = data[i].payload.number;
        var actionStatus = data[i].payload.action;

        if (actionStatus === "closed") {
          data[i].messageAction = "closed pull request ";
          data[i].messageElementOne = repoName + "#" + issueNumer;
          data[i].linkElementOne = repoUrl + "/issues/" + issueNumer;
        }
        else if (actionStatus === "opened"){
          data[i].messageAction = "opened pull request ";
          data[i].messageElementOne = repoName + "#" + issueNumer;
          data[i].linkElementOne = repoUrl + "/issues/" + issueNumer;
        }
        if(data[i].payload.pull_request){
          data[i].comments = bindSingleComment(data[i].payload.pull_request.title);
        }
      }
      else if (eventType === "PushEvent") {
        data[i].messageAction = "pushed to ";
        data[i].messageElementOne = (data[i].payload.ref).substring(11);
        data[i].linkElementOne = repoUrl + "/tree/" + data[i].messageElementOne;
        data[i].messageElementTwo = repoName;
        data[i].linkElementTwo = repoUrl;

        if (data[i].payload.commits){

          var itLength = data[i].payload.commits.length;
          var comments = [];

          for (var j = 0; j < itLength; j++){

            var sha = data[i].payload.commits[j].sha;
            var object = {
              "id": sha,
              "link": repoUrl + "/commit/" + sha,
              "message": data[i].payload.commits[j].message
            };
            comments.push(object);
          }
          data[i].comments = comments;
        }
      }
      else if (eventType === "IssueCommentEvent") {

        var issueNumber = data[i].payload.issue.number;

        data[i].messageAction = "commented on issue ";
        data[i].messageElementOne = repoName + "#" + issueNumber;
        data[i].linkElementOne = repoUrl + "/issues/" + issueNumber;

        if (data[i].payload.issue.pull_request) {
          data[i].messageAction = "commented on pull request ";
        }
        if(data[i].payload.comment){
          data[i].comments = bindSingleComment(data[i].payload.comment.body);
        }
      }
      else if (eventType === "IssuesEvent") {
        var actionStatus = data[i].payload.action;

        if (actionStatus === "closed") {
          data[i].messageAction = "closed issue ";
        }
        else if (actionStatus === "opened"){
          data[i].messageAction = "opened issue ";
        }
        var issueNumber = data[i].payload.issue.number;

        data[i].messageElementOne = repoName + "#" + issueNumber;
        data[i].linkElementOne = repoUrl + "/issues/" + issueNumber;
        if (data[i].payload.issue.title) {
          data[i].comments = bindSingleComment(data[i].payload.issue.title);
        }
      }
      else if (eventType === "DeleteEvent") {
        data[i].messageAction = "deleted " + data[i].payload.ref_type + " " + data[i].payload.ref + " at ";
        data[i].messageElementOne = repoName;
        data[i].linkElementOne = repoUrl;
      }
      else if (eventType === "ReleaseEvent") {
        var releaseName = data[i].payload.release.name;

        data[i].messageAction = "released "
        data[i].messageElementOne = releaseName;
        data[i].linkElementOne = repoUrl + "/releases/tag/" + releaseName;
        data[i].messageElementTwo = repoName;
        data[i].linkElementTwo = repoUrl;

        if (data[i].payload.release.assets){
          var itLength = data[i].payload.release.assets.length;
          var comments = [];
          for (var j = 0; j < itLength; j++){
            var object = {
              "message": data[i].payload.release.assets[j].name
            };
            comments.push(object);
          }
          data[i].comments = comments;
        }
      }
    }
    return data;
  }
  // returns array containing str to be bound to data-file
  function bindSingleComment(str){
    var comments = [];
    var object = {
      "message": str
    };
    comments.push(object);
    return comments;
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
