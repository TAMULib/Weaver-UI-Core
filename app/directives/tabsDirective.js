/**
* @ngdoc directive
* @name  core.directive:tabs
* @restrict 'E'
*
* @example
* <pre>
*	<tabs target="settingsView">
		<tab path="myview" html="views/myview.html">My View Tab</tab>
	</tabs>
* </pre>
* 
* @description 
* The tabs element directive uses the 'TabService' to set the 'activeTab' and the $location services to provide the 
* url path as per the tab provided. The $routeParams retrieves the route information of clicked tab.
* 
*/
core.directive("tabs", function() {
	return {
		template: '<div class="tabs"><span ng-transclude></span><hr></div>',
		restrict: 'E',
		replace: false,
		transclude: true,
		scope: {
			target: "@target"
		},
		controller: function($scope, $location, $routeParams, TabService) {
			this.activeTab = function(tab) {				
				return $routeParams.tab == tab;
			}

			this.setActive = function(tab, html) {
				$location.url("/admin/settings/"+tab);
				TabService.setTab($scope.target, html);
			}

			this.target = $scope.target;
		},
		link: function ($scope, element, attr) {	    	
			$scope.target = attr.target;
	    }
	};
});

/**
* @ngdoc directive
* @name  core.directive:tab
* @restrict 'E'
* @scope:true
* @requires TabService
*
* @example
* <pre>
*	<tabs target="settingsView">
		<tab path="myview" html="views/myview.html">My View Tab</tab>
	</tabs>
* </pre>
* 
* @description 
*  The tab element directive uses the 'TabService' which in turn uses the ' settingsView' and the html file location to render
*  the html view of the clicked tab  and is set as activeTab. The tab value is stored as '$scope.tab' variable.  
* 
*/
core.directive("tab", function(TabService) {
	 return {
		template: '<span ng-class="{\'active\': activeTab(tab)}" ng-click="setActive(tab, html)" class="tab"><span ng-transclude></span></span>',
		restrict: 'E',
		replace: false,
		transclude: true,
		require: '^tabs',
		scope: true,
		link: function ($scope, element, attr, parent) {
	
			angular.extend($scope, parent);
			angular.extend($scope, attr);

			$scope.tab = $scope.path;

			if($scope.activeTab($scope.tab)) {
				TabService.setTab($scope.target, $scope.html);
			}

	    }
	};
});

/**
* @ngdoc directive
* @name  core.directive:tabview
* @restrict 'E'
* @scope:true
* @requires TabService
*
* @example
* <pre>
*	<tabs target="settingsView">
		<tab path="myview" html="views/myview.html">My View Tab</tab>
	</tabs>
	<tabview class="settings-view" for="settingsView">
	</tabview>
* </pre>
* 
* @description 
*  The tabview span element directive uses the 'TabService' which in turn uses the 'attr' object to get the html view
*  and store it on the '$scope.path' variable 
* 
*/
core.directive("tabview", function(TabService) {

	 return {
		template: '<span ng-include="path"></span>',
		restrict: 'E',
		replace: false,
		scope: false,
		link: function ($scope, element, attr) {

			/**
		     * @ngdoc property
		     * @name $scope.path
		     * @propertyOf core.directive:tabview#$scope.path
		     *
		     * @description
		     * The $scope.path variable stores the html view of the active tab using the 'TabService'.
		     */ 	
			$scope.path = TabService.getTab(attr.for);
	    }
	};

});

/**
 * @ngdoc service
 * @name  core.directive:TabService
 * @requires $q
 *
 * @description
 * 	The TabService assists the tabs directive, tab directive and the tabview directive to set and retrieve the active tab and to render the specific html view based on the settingsView target.  
 *  This uses the $q service to asynchronously execute the setTab and getTab methods and return the specific values
 *  once the processing is completed.
 */
core.service("TabService", function($q) {

	var TabService = this;
	var tabs = {};

	TabService.getTab = function(target){
		return tabs[target];
	};

	TabService.setTab = function(target, html){
		tabs[target] = html;
	};	

	return TabService;
	
});

