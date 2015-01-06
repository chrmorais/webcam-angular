(function () {
  'use strict';

  angular.module('webcam', ['ngRoute', 'webcam.controllers', 'webcam.templates']);

  function config ($locationProvider, $routeProvider) {
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });
    $routeProvider.
      when('/', {
        templateUrl: 'views/camera-show.tpl.html',
        controller: 'WebcamShowCtrl',
        controllerAs: 'webcamshow'
      });
  }

  angular
   .module('webcam')
   .config(config);
})();
