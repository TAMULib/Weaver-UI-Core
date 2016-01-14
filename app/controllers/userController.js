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
 * @example
 * The following must be added to authentication controller for it to extend AbstractController.Extends {@link core.controller:AbstractController 'AbstractController'}
 *  <pre>
 *      angular.extend(this, $controller('AbstractController', {$scope: $scope}));
 *  </pre>
 *
 * @description 
 *	This controller sets the user's role in session storage. Extends {@link core.controller:AbstractController 'AbstractController'}
 *
**/
core.controller('UserController', function ($controller, $scope, StorageService, User) {

	angular.extend(this, $controller('AbstractController', {$scope: $scope}));

	/**
	 * @ngdoc property
	 * @name core.controller:UserController#$scope.user
	 * @propertyOf core.controller:UserController
	 *
	 * @description
	 * 	The User service for the scope of the User Controller
	 */
	$scope.user = User.get();

	/**
	 * @ngdoc property
	 * @name core.controller:UserController#$scope.ready
	 * @propertyOf core.controller:UserController
	 *
	 * @description
	 * 	The User promise for the scope of the User Controller
	 */
	$scope.ready = User.ready();

	if(!$scope.isAnonymous() && User.ready() != null) {

	/**
	 * @ngdoc method
	 * @name core.controller:AbstractController#$scope.isAssuming
	 * @methodOf core.controller:AbstractController
	 * @returns {void} returns void
	 * 
	 * @description
	 * 	This method will set the StorageService role to the User credential role once the User Promise object is recieved.
	 */
		User.ready().then(function() {
			StorageService.set('role', $scope.user.role);
		});
	}

});

