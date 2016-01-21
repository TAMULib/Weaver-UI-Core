/**
 * @ngdoc directive
 * @name  core.directive:username
 * @restrict 'E'
 * @scope:true
 *
 * @example
 * <pre>
 * 	<username></username>
 * </pre>
 * 
 * @description 
 *	The username element directive provides the current user's first and last name combined as username in the application.
 * 
 */
core.directive('username', function () {
	return {
		template: '<span>{{user.firstName || "Obtaining User..."}} {{user.lastName}}</span>',
		restrict: 'E',
		scope:true,
		controller: 'UserController'
	};
});

/**
 * @ngdoc directive
 * @name  core.directive:useremail
 * @restrict 'E'
 * @scope:true
 *
 * @example
 * <pre>
 * 	<useremail></useremail>
 * </pre>
 * 
 * @description 
 *	The useremail element directive provides current user's email obtained from the user credential in the application.
 * 
 */
core.directive('useremail', function () {
	return {
		template: '<span>{{user.email}}</span>',
		restrict: 'E',
		scope:true,
		controller: 'UserController'
	};
});

/**
 * @ngdoc directive
 * @name  core.directive:useruin
 * @restrict 'E'
 * @scope:true
 *
 * @example
 * <pre>
 * 	<useruin></useruin>
 * </pre>
 * 
 * @description 
 *	The useruin element directive provides the current user's UIN in the application.
 * 
 */
core.directive('useruin', function () {
	return {
		template: '<span>{{user.uin}}</span>',
		restrict: 'E',
		scope:true,
		controller: 'UserController'
	};
});

/**
 * @ngdoc directive
 * @name  core.directive:useraffiliation
 * @restrict 'E'
 * @scope:true
 *
 * @example
 * <pre>
 * 	<div useraffiliation></div>
 * </pre>
 * 
 * @description 
 *	The useraffiliation element directive provides the current user's affiliation in the application.
 * 
 */
core.directive('useraffiliation', function (WsApi) {
	return {
		template: '<span>{{ affiliation }}</span>',
		restrict: 'E',
		scope:true,
		controller: 'UserController',
		link: function ($scope, element, attr) {	
			$scope.ready.then(function() {
				if($scope.user.affiliation) {
					$scope.affiliation = $scope.user.affiliation.toUpperCase().split(';')[0];
				}
				else {
					$scope.affiliation = "UNKNOWN";
				}
			});
	    }
	};
});