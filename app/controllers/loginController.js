core.controller('LoginController', function ($controller, $location, $scope, $timeout, AlertService, StorageService, User) {
	
    angular.extend(this, $controller('AbstractController', {$scope: $scope}));
    
    var user = new User();
    
    var reset = function() {
    	$scope.account = {
	    	email: '',
	    	password: ''
	    };
    };
    
    reset();

	$scope.login = function() {
		user.authenticate($scope.account).then(function(data) {
			reset();
		});
	};

});