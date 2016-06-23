(function() {
    'use strict';

  angular
    .module('rateApp.rate-people.detail',[
    ]);
})();

(function() {
    'use strict';

    angular.module('rateApp.rate-people.detail')
        .controller('RateDetailController', RateDetailController);

    RateDetailController.$inject = ['$stateParams', '$scope', '$q', 'ReviewService', 'PeopleService', 'DataService', 'RateAssets'];

    function RateDetailController($stateParams, $scope, $q, ReviewService, PeopleService, DataService, RateAssetsProvider) {
        var vm = this;

        vm.validation = {};
        vm.person = {};
        vm.reviews = [];
        vm.openReview = openReview;
        vm.addReview = addReview;
        vm.cancelReview = cancelReview;
        vm.deleteReview = deleteReview;
        vm.hasReviews = hasReviews;

        active();

        function active() {
            $scope.$emit('startLoading', 'RateDetailController');
            var promises = [peoplePromise(), reviewPromise()];

            return $q.all(promises).then(function(){
                init();
                $scope.$emit('endLoading', 'RateDetailController');
            });

            function peoplePromise() {
                return PeopleService.getPerson($stateParams.userid).then(function(dataPerson){
                    vm.person = dataPerson;
                    if(!vm.person || vm.person === {}){
                        return DataService.getData(RateAssetsProvider.assets.ASSETS_DATA + '/personajes.json').then(function(dataPeople){
                            var person;
                            for(var i=0; i<dataPeople.length; i++){
                                person = dataPeople[i];
                                if(person._id === $stateParams.userid) {
                                    vm.person = person;
                                    return vm.person;
                                }
                            }
                        });
                    }
                    return vm.person;
                });
            }

            function reviewPromise() {
                return ReviewService.getReviews($stateParams.userid).then(function(dataReviews){
                    vm.reviews = dataReviews;
                    if(!vm.reviews || vm.reviews.length === 0){
                        return DataService.getData(RateAssetsProvider.assets.ASSETS_DATA + '/valoraciones.json').then(function(data){
                            var result = [];
                            var review;
                            for(var i=0; i<data.length; i++){
                                review = data[i];
                                if(review.personId === $stateParams.userid) {
                                    result.push(review);
                                }
                            }
                            vm.reviews = result;
                            return vm.reviews;
                        });
                    }
                    return vm.reviews;
                });
            }
        }

        function init() {
            initReview();

            //Configuracion de la libraria al cargar.
            (function() {
                $('#input-star-readonly').rating({ size: 'xs' });
                $('#input-star-edit').rating({ size: 'xs' });
                $('#input-star-edit').on('rating.change', function(event, value) {
                    vm.review.stars = value;
                    $('#input-star-readonly').rating('update', value);
                });
            })();
        }

        function openReview() {
            $('#myModal').modal('toggle');
        }

        function addReview() {
            vm.review.personId = $stateParams.userid;
            vm.review.createDate = Date.now();
            ReviewService.addReview(vm.review).then(function(review) {
                if(review){
                    vm.reviews.push(review);
                    _validationOk('OK!', 'Review added successfully');
                } else {
                    _validationError('Error!', 'Review not added. ');
                }
            }).catch(function(error) {
                _validationError('Error!', 'Review not added. ' + error);
            });

            initReview();
            $('#myModal').modal('toggle');
        }

        function initReview() {
            vm.review = {
                stars: 0,
                description: '',
                personId: ''
            };
            $('#input-star-edit').rating('reset');
            $('#input-star-readonly').rating('reset');
        }

        function cancelReview() {
            initReview();
        }

        function deleteReview() {
            var revId = event.target.id;
            ReviewService.deleteReview(revId).then(function() {
                for (var i = 0; i < vm.reviews.length; i++) {
                    if (vm.reviews[i]._id === revId) {
                        vm.reviews.splice(i, 1);
                        _validationOk('OK!', 'Review removed successfully');
                        break;
                    }
                }
            }).catch(function(error) {
                _validationError('Error!', 'Review not removed. ' + error);
            });
        }

        function hasReviews() {
            return vm.reviews && vm.reviews.length > 0;
        }

        function _validationOk(state, message) {
            var data = {
                status: 'OK',
                state: state,
                message: message
            };
            $scope.$emit('validation', data);
        }

        function _validationError(state, message) {
            var data = {
                status: 'ERROR',
                state: state,
                message: message
            };
            $scope.$emit('validation', data);
        }
    }
})();


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
