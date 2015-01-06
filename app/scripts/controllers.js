(function () {
  'use strict';

  angular.module('webcam.controllers', ['webcam.services']);

  function WebcamShowCtrl ($scope, CameraService) {
    $scope.hasUserMedia = CameraService.hasUserMedia;
  }

  angular
    .module('webcam.controllers', ['webcam.services'])
    .controller('WebcamShowCtrl', WebcamShowCtrl);
})();
