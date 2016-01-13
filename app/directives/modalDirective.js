/**
 * @ngdoc directive
 * @name  core.directive:modal
 * @restrict 'E'
 * @requires $controller
 * @scope
 *
 * @example
 * <pre>
 * 	<modal  
 * 		modal-id="example" 
 * 		modal-view="iews/my.html" 
 * 		modal-header-class="modal-header-primary">
 * 	</modal>
 * </pre>
 * 
 * @description 
 *	The modal element directive is used to include a bootstrap style modal in your application.
 * 
 */
core.directive('modal', function ($controller) {
	return {
		templateUrl: 'bower_components/core/app/views/modalWrapper.html',
		restrict: 'E',
		replace: false,
		transclude: true,
		scope: true,
		link: function ($scope, element, attr) {	    	
			$scope.attr = attr;
			if($scope.attr.modalController) {
				angular.extend(this, $controller($scope.attr.modalController, {$scope: $scope}));
			}			
	    	$scope.click = function() {
	    		if($scope.attr.modalNgClickFunction && $scope.attr.modalNgClickParam) {
	    			$scope[$scope.attr.modalNgClickFunction](JSON.parse($scope.attr.modalNgClickParam));
	    		}
	    	}
	    }
	};
});