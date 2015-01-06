(function () {
  'use strict';

  angular.module('webcam.services', []);

  angular
    .module('webcam.services')
    .factory('CameraService', function($window, $http) {
      var hasUserMedia = function() {
        return !!getUserMedia();
      };

      var getUserMedia = function() {
        navigator.getUserMedia =
          ($window.navigator.getUserMedia ||
          $window.navigator.webkitGetUserMedia ||
          $window.navigator.mozGetUserMedia ||
          $window.navigator.msGetUserMedia);
        return navigator.getUserMedia;
      };

      var Save = function(image, tagID) {
        return $http({
          method: 'POST',
          url: '/upload',
          data: { tagID: tagID, image: image },
        }).then(function (response) {
          return {
             title: response.data.title,
             cost:  response.data.price
          };
        },
        function (httpError) {
           throw httpError.status + ' : ' +
                 httpError.data;
        });
      };

      var CheckTakePhoto = function() {
        return $http({
            method: 'GET',
            url: '/checkPhoto',
          }).then(function (response) {
            return response.data;
          },
          function (httpError) {
             throw httpError.status + ' : ' +
                   httpError.data;
          });
      };

      return {
        hasUserMedia: hasUserMedia(),
        getUserMedia: getUserMedia,
        Save: Save,
        CheckTakePhoto: CheckTakePhoto
      };
    });
})();
