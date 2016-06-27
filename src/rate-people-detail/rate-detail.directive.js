(function() {
    'use strict';

  angular.module('rateApp.rate-people-detail')
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

  RateDetailLink.$inject = ['$scope', '$element'];

  function RateDetailLink(scope, element) {
    var editForm = document.querySelector('#input-star-edit', element);
    $(editForm).on('rating.change', function(event, value) {
      scope.rateDetailCtrl.review.stars = value;
      var info = {
        id: 'input-star-readonly',
        stars: value
      };
      scope.$broadcast('updateRatingStar', info);
      //$('#input-star-readonly', element).rating('update', value);
    });
  }
})();
