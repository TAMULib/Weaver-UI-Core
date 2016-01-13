/**
 * @ngdoc controller
 * @name core.controller:UserController
 * @requires $controller
 * @requires $scope
 * @requires core.service:StorageService
 * @requires core.service:User
 *
 * @example
 *	<pre>
 *		<element ng-controller="UserController"></element>
 *	</pre> 
 *
 * @description 
 *	This controller sets the user's role in session storage. Extends {@link core.controller:AbstractController 'AbstractController'}
 *
**/
core.controller('UserController', function ($controller, $scope, StorageService, User) {

	angular.extend(this, $controller('AbstractController', {$scope: $scope}));

	$scope.user = User.get();

	$scope.ready = User.ready();

	if(!$scope.isAnonymous() && User.ready() != null) {
		User.ready().then(function() {
			StorageService.set('role', $scope.user.role);
		});
	}

});

