/**
 * @ngdoc directive
 * @name  core.directive:tamufooter
 * @restrict 'E'
 * @requires $controller
 * @scope
 *
 * @example
 * <pre>
 * 	<tamufooter></tamufooter>
 * </pre>
 * 
 * @description 
 *	The tamufooter element directive is used to includes a TAMU specific footer information provided in footer.html file.
 * 
 */
core.directive('tamufooter', function ($controller) {
	return {
		templateUrl: 'bower_components/core/app/views/footer.html',
		restrict: 'E',
		replace: false,
		transclude: true,
		link: function ($scope, element, attr) {
			
			/**
			 * @ngdoc property
			 * @name core.directive:tamufooter#$scope.attr
			 * @propertyOf core.directive:tamufooter
			 *
			 * @description
			 * 	A $scope variable to store the 'attr' object properties
			 */		    	
			$scope.attr = attr;			
	    }
	};
});