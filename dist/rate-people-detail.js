(function() {
    'use strict';

  angular
    .module('rateApp.rate-people-detail',[
      'rateApp.rate-people-common'
    ]);
})();

(function() {
    'use strict';

    angular.module('rateApp.rate-people-detail')
        .controller('RateDetailController', RateDetailController);

    RateDetailController.$inject = ['$stateParams', '$scope', '$q', 'ReviewService', 'PeopleService', 'DataService', 'RateAssets'];

    function RateDetailController($stateParams, $scope, $q, ReviewService, PeopleService, DataService, RateAssetsProvider) {
        var vm = this;

        vm.validation = {};
        vm.person = {};
        vm.reviews = [];
        vm.review = {};
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
            /*(function() {
                $('#input-star-readonly').rating({ size: 'xs' });
                $('#input-star-edit').rating({ size: 'xs' });
                $('#input-star-edit').on('rating.change', function(event, value) {
                    vm.review.stars = value;
                    $('#input-star-readonly').rating('update', value);
                });
            })();*/
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
                stars: -1,
                description: '',
                personId: ''
            };
            $scope.$emit('resetRatingStar');
            /*$('#input-star-edit').rating('reset');
            $('#input-star-readonly').rating('reset');*/
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

(function() {'use strict';angular.module('rateApp.rate-people-detail').run(['$templateCache', function($templateCache) {$templateCache.put('src/rate-people-detail/rate-detail.template.html','<style type="text/css">.modal-backdrop {\r\n        z-index: -1;\r\n    }</style><rate-alert></rate-alert><div class="container"><div class="page-header"><h2>Valora a {{rateDetailCtrl.person.nick}}</h2></div><div class="panel panel-primary"><div class="panel-body"><div class="row"><div class="col-lg-6"><div style="text-align: center"><h2>{{rateDetailCtrl.person.nick}}</h2><img class="img-circle" ng-src="{{rateDetailCtrl.person.profileImg}}" alt="Generic placeholder image" width="140" height="140"><p>{{rateDetailCtrl.person.job}}</p><a href="#/people" class="btn btn-primary">Volver a personajes</a> <button type="button" class="btn btn-primary" ng-click="rateDetailCtrl.openReview()">A\xF1adir valoraci\xF3n</button></div><div id="myModal" class="modal fade" role="dialog" data-backdrop="false"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" ng-click="rateDetailCtrl.cancelReview()">&times;</button><h4 class="modal-title">A\xF1adir valoraci\xF3n</h4></div><div class="modal-body"><form name="reviewForm" ng-submit="rateDetailCtrl.addReview()"><h3>Vista Previa</h3><blockqoute><b>Valoraci\xF3n: <input input-star stars="{{rateDetailCtrl.review.stars}}" id="input-star-readonly" class="rating" data-min="0" data-max="5" data-step="1" data-show-caption="false" data-readonly="true" data-show-clear="false"></b><b>Comentario:</b><br>{{rateDetailCtrl.review.description}}<br></blockqoute><h3>Edit</h3><blockqoute><b>Valoraci\xF3n: <input input-star stars="{{rateDetailCtrl.review.stars}}" id="input-star-edit" class="rating" data-min="0" data-max="5" data-step="1" data-show-caption="false"></b><b>Comentario:</b><br><textarea ng-model="rateDetailCtrl.review.description" class="form-control"></textarea><div class="modal-footer"><input type="submit" class="btn btn-primary" value="Save Review"> <input type="button" class="btn btn-default" value="Cancel" ng-click="rateDetailCtrl.cancelReview()" data-dismiss="modal"></div></blockqoute></form></div></div></div></div></div><!-- /.col-lg-6 --><div class="col-lg-6"><b ng-hide="rateDetailCtrl.hasReviews()">No hay ninguna valoraci\xF3n</b><blockquote ng-repeat="revw in rateDetailCtrl.reviews"><b>Valoraci\xF3n: <input input-star stars="{{revw.stars}}" id="input-star-readonly-{{revw._id}}" class="rating rating-list" data-min="0" data-max="5" data-step="1" data-show-caption="false" data-readonly="true" data-show-clear="false" data-size="xs"></b><b>Comentario:</b><br>{{revw.description}}<br><b>Creado en:</b><br>{{revw.createDate | date:\'yyyy-MM-dd HH:mm:ss Z\'}}<br><button type="button" id="{{revw._id}}" class="btn btn-default" ng-click="rateDetailCtrl.deleteReview()">Borrar valoraci\xF3n</button></blockquote></div><!-- /.col-lg-6 --></div></div></div></div>');}]);})();