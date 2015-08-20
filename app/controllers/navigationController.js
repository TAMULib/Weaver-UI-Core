core.controller('NavigationController', function ($controller, $scope, $location, $window) {

    angular.extend(this, $controller('AbstractController', {$scope: $scope}));

    $scope.$on('$routeChangeStart', function(next, current) {
	    $scope.view = $location.$$path;
	});

	$scope.windowWidth = 0;
	$scope.windowHeight = 0;

	$scope.updateWidth = function() {
        $scope.windowWidth = $window.innerWidth;
    }
    $scope.updateHeight = function() {
       $scope.windowHeight = $window.innerHeight;
    }

	$window.onresize = function () {
		$scope.updateWidth();
        $scope.updateHeight();
        $scope.$apply();
	}

	$scope.updateWidth();
    $scope.updateHeight();
	
});
