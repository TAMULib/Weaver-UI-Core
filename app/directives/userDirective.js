core.directive('username', function () {
	return {
		template: '<span>{{user.firstName || "Obtaining User..."}} {{user.lastName}}</span>',
		restrict: 'E',
		scope:true,
		controller: 'UserController'
	};
});

core.directive('useremail', function () {
	return {
		template: '<span>{{user.email}}</span>',
		restrict: 'E',
		scope:true,
		controller: 'UserController'
	};
});

core.directive('useruin', function () {
	return {
		template: '<span>{{user.uin}}</span>',
		restrict: 'E',
		scope:true,
		controller: 'UserController'
	};
});

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
					console.log($scope.user);
				}
			});
	    }
	};
});