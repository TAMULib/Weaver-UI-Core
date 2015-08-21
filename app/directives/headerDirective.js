core.directive('tamuheader', function ($controller) {
	return {
		templateUrl: 'bower_components/core/app/views/header.html',
		restrict: 'E',
		replace: false,
		transclude: true,
		link: function ($scope, element, attr) {	    	
			$scope.attr = attr;			
	    }
	};
});