(function() {
    'use strict';

  angular.module('rateApp.rate-people.detail')
      .directive('rateDetail', RateDetail);

  function RateDetail() {
      return {
          restrict: 'E',
          controller: 'RateDetailController',
          controllerAs: 'rateDetailCtrl',
          templateUrl: 'src/rate-people-detail/rate-detail.template.html',
          link: RateDetailLink
      };
  }

  RateDetailLink.$inject = ['$scope', '$element', '$attributes'];

  function RateDetailLink(scope, element, attributes) {
    var a = scope, b = element, c = attributes;
    if(a){
      if(b){
        if(!c){
          a = b;
        }
      }
    }
  }
})();
