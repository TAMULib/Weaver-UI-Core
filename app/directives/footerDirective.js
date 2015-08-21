core.directive('tamufooter', function ($controller) {
	return {
		templateUrl: 'bower_components/core/app/views/footer.html',
		restrict: 'E',
		replace: false,
		transclude: true,
		link: function ($scope, element, attr) {	    	
			$scope.attr = attr;			
	    }
	};
});