angular.module('starter.controllers', ['ionic', 'ionic.contrib.ui.tinderCards'])

.controller('LoginCtrl', function($scope, auth, $state, store) {
  auth.signin({
    closable: false,
    // This asks for the refresh token
    // So that the user never has to log in again
    authParams: {
      scope: 'openid offline_access'
    }
  }, function(profile, idToken, accessToken, state, refreshToken) {
    store.set('profile', profile);
    store.set('token', idToken);
    store.set('refreshToken', refreshToken);
    auth.getToken({
      api: 'firebase'
    }).then(function(delegation) {
      store.set('firebaseToken', delegation.id_token);
      $state.go('tab.bets');
    }, function(error) {
      console.log("There was an error logging in", error);
    })
  }, function(error) {
    console.log("There was an error logging in", error);
  });
})


.controller('FriendsCtrl', function($scope, Friends, $ionicModal) {
 $ionicModal.fromTemplateUrl('templates/friend-add-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.newFriend = {
    name: '',
    description: ''
  };

  $scope.friends = Friends.all();

  $scope.showAddFriend = function() {
    $scope.modal.show();
  };

  $scope.addFriend = function() {
    if(!$scope.newFriend.$id) {
      Friends.add($scope.newFriend);
    } else {
      Friends.save($scope.newFriend);
    }
    $scope.newFriend = {};
    $scope.modal.hide();
  };

  $scope.deleteFriend = function(friend) {
    Friends.delete(friend);
  };

  $scope.editFriend = function(friend) {
    $scope.newFriend = friend;
    $scope.modal.show();
  };

  $scope.close = function() {
    $scope.modal.hide();
  };

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
})

.controller('FriendDetailCtrl', function($scope, $stateParams, Friends) {
  $scope.friend = Friends.get($stateParams.friendId);
})

.controller('AccountCtrl', function($scope, auth, $state, store) {

  $scope.logout = function() {
    auth.signout();
    store.remove('token');
    store.remove('profile');
    store.remove('refreshToken');
    $state.go('login');
  }
})

// Tinder Cards

.directive('noScroll', function() {

  return {
    restrict: 'A',
    link: function($scope, $element, $attr) {

      $element.on('touchmove', function(e) {
        e.preventDefault();
      });
    }
  }
})
.controller('StockController', function($scope, StockService) {

    $scope.stocks = StockService.all();

})

.controller('StockDetailController', function($scope, $stateParams, StockService) {
    $scope.stock = StockService.get($stateParams.stockId);

    var graph = c3.generate({
      bindto: '#graph',
      data: {
        x: 'date',
        xFormat: '%Y-%m-%d %H:%M:%S',
        json: $scope.stock.quotes,
        keys: {
          value: ['date','price']
        }
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            format: '%H:%M:%S'
          }
        },
        y: {
          tick: {
            format: function (d) { return "$" + d.toFixed(2); }
          }
        }
      }
    });

    setInterval(function(){
      $scope.stock = StockService.get($stateParams.stockId);
      
      graph.load({
        x: 'date',
        xFormat: '%Y-%m-%d %H:%M:%S',
        json: $scope.stock.quotes,
        keys: {
          value: ['date','price']
        }
      });

      console.log('new data', $scope.stock.quotes.length);
    }, 2000);
})

.controller('StockCardsCtrl', function($scope, TDCardDelegate, StockService) {


    $scope.cards = StockService.all();

    $scope.cardDestroyed = function(index) {
        $scope.cards.splice(index, 1);
    };

})

.controller('StockCardCtrl', function($scope, TDCardDelegate) {
    $scope.cardSwipedLeft = function(index) {
        console.log('LEFT SWIPE');
        $scope.addCard();
    };

    $scope.cardSwipedRight = function(index) {
        console.log('RIGHT SWIPE');
        $scope.addCard();
    };
})
;
