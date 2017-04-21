core.controller('LoginController', function ($controller, $location, $scope, $timeout, AlertService, StorageService, User) {
	
    angular.extend(this, $controller('AbstractController', {$scope: $scope}));
    
    var reset = function() {
    	$scope.account = {
	    	email: '',
	    	password: ''
	    };
	    angular.element('#loginModal').hide();
    };
    
    reset();

	$scope.login = function() {
		User.authenticate($scope.account).then(function(data) {
			reset();
		});
	};

});