(function () {
  'use strict';
  angular.module('webcam').
    directive('camera', ['CameraService', function(CameraService) {
      return {
        restrict: 'EA',
        replace: true,
        transclude: true,
        scope: {},
        controller: function($scope, $q, $timeout, $interval) {
          var cameraCtrl = this,
              element = angular.element( document.querySelector( '.camera' ) );

          this.takeSnapshot = function() {
            var canvas = document.querySelector('canvas'),
                ctx = canvas.getContext('2d'),
                videoElement = document.querySelector('video'),
                d = $q.defer();

            canvas.width = 640;
            canvas.height = 480;

            $timeout(function() {
              ctx.fillRect(0, 0, 640, 480);
              ctx.drawImage(videoElement, 0, 0, 640, 480);
              d.resolve(canvas.toDataURL());
            }, 0);
            return d.promise;
          };

          this.SaveSnapshot = function(image, tagID) {
            CameraService.Save(image, tagID).
              then(function() {
                console.log('Imagen capturada');
              });
          };

          $interval(function() {
            if ($scope.activeWebcam && !$scope.showCountDown) {
              CameraService.CheckTakePhoto().then(function(response){
                if (response.photo) {
                  $scope.showCountDown = true;
                  $scope.countDown = $scope.initCountDown;
                  $scope.responseCheck = response;
                }
              });
            }
          }, 800);

          $scope.$watch('countDown', function(value) {
            if (value == 0) {
              element.addClass('blink_me');
              cameraCtrl.takeSnapshot()
                .then(function(image) {
                  cameraCtrl.SaveSnapshot(image, $scope.responseCheck.tagID);

                  $timeout(function(){
                    element.removeClass('blink_me');
                  }, 1000);
                });
            }
          });

          $scope.showCountDown = false;
          $scope.initCountDown = 5;
        },
        template: '<div class="camera"><div id="timer" ng-show="showCountDown" camera-count-down>{{countDown}}</div><video class="camera" autoplay="" /><div ng-transclude></div></div>',
        link: function(scope, ele, attrs) {

          if (!CameraService.hasUserMedia) {
            return;
          } else {
            CameraService.getUserMedia();
          }

          var w = attrs.width || window.innerWidth || 640,
              h = attrs.height || window.innerHeight || 480,
              videoElement = document.querySelector('video'),
              onSuccess = function(stream) {
                if (navigator.mozGetUserMedia) {
                  videoElement.mozSrcObject = stream;
                } else {
                  videoElement.src = window.URL.createObjectURL(stream);
                }

                videoElement.play();
                scope.activeWebcam = 'true';
              },
              onFailure = function(err) {
                console.error(err);
              };

          navigator.getUserMedia({
            video: {
              mandatory: {
                maxHeight: h,
                maxWidth: w
              }
            },
            audio: false
          }, onSuccess, onFailure);

          scope.w = w;
          scope.h = h;
        }
    };}]).
    directive('cameraControlSnapshot', function() {
      return {
        restrict: 'EA',
        require: '^camera',
        scope: true,
        template: '<a class="btn btn-info" ng-click="takeSnapshot()">Capturar</a>',
        link: function(scope, ele, attrs, cameraCtrl) {
          scope.takeSnapshot = function() {
            cameraCtrl.takeSnapshot()
            .then(function(image) {
              cameraCtrl.SaveSnapshot(image);
            });
          };
        }
      };
    }).
    directive('cameraCountDown', ['$timeout', function($timeout){
      return function(scope, element) {
        var stopTime;

        function updateCountDown() {
          scope.countDown--;

          if (scope.countDown > 0) {
            $timeout(updateCountDown, 1000);
          } else {
            scope.showCountDown = false;
          }
        }

        scope.$watch('showCountDown', function(value) {
          if (value && scope.countDown == scope.initCountDown) {
            $timeout(updateCountDown, 1000);
          }
        });
      };
    }]);
 })();
