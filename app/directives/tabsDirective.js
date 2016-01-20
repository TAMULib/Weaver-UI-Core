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

			/**
			 * @ngdoc method
			 * @name core.directive:tabs#activeTab
			 * @methodOf core.directive:tabs
			 * @param {string=} tab A string variable to be assigned to $routeParams.tab.
			 * @returns {void} returns void
			 * 
			 * @description
			 *  This method uses $routeParams service to return the route parameters for string 'tab' provided.
			 */
			this.activeTab = function(tab) {				
				return $routeParams.tab == tab;
			}

            /**
			 * @ngdoc method
			 * @name core.directive:tabs#setActive
			 * @methodOf core.directive:tabs
			 * @param {string=} tab A string variable to be assigned to $routeParams.tab.
			 * @param {string=} html A string variable used by 'TabService' to setTab
			 * @returns {void} returns void
			 * 
			 * @description
			 *  This method uses $location service to update the url based on the string 'tab' paased and TabService to set
			 *  tab based on seetingView and html passed on to it.
			 */
			this.setActive = function(tab, html) {
				$location.url("/admin/settings/"+tab);
				TabService.setTab($scope.target, html);
			}

			/**
			 * @ngdoc property
			 * @name core.directive:tabs#target
			 * @propertyOf core.directive:tabs
			 *
			 * @description
			 * 	A variable to store the settingsView target from the $scope.target variable.
			 **/
			this.target = $scope.target;
		},
		link: function ($scope, element, attr) {

			/**
			 * @ngdoc property
			 * @name core.directive:tabs#$scope.target
			 * @propertyOf core.directive:tabs
			 *
			 * @description
			 * 	This variable stores the tabs element directive 'attr.target' value on to the scope of link function.
			 **/	    	
			$scope.target = attr.target;
	    }
	};
});

/**
* @ngdoc directive
* @name  core.directive:tab
* @restrict 'E'
* @scope:true
* @requires core.service:TabService
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

			/**
			 * @ngdoc property
			 * @name core.directive:tab#$scope.tab
			 * @propertyOf core.directive:tab
			 *
			 * @description
			 * 	This variable stores the string value of tab on the scope of link function.
			 **/
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
* @requires core.service:TabService
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
		     * @name core.directive:tabview#$scope.path
		     * @propertyOf core.directive:tabview
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
 * @name  core.service:TabService
 * @requires $q
 *
 * @description
 * 	The TabService assists the tabs directive, tab directive and the tabview directive to set and retrieve the active tab and to render the specific html view based on the settingsView target.  
 *  This uses the $q service to asynchronously execute the setTab and getTab methods and return the specific values
 *  once the processing is completed.
 */
core.service("TabService", function($q) {

	var TabService = this;
	/**
	 * @ngdoc property
	 * @name core.service:TabService#tabs
	 * @propertyOf core.service:TabService
	 *
	 * @description
	 * 	A private object to store the target view and the html location to be rendered.
	 */
	var tabs = {};

	/**
	 * @ngdoc method
	 * @name core.service:TabService#TabService.getTab
	 * @methodOf core.service:TabService
	 * @param {string} target an html view.
	 * @returns {string} returns string
	 * 
	 * @description
	 * This method returns the html view based on the target value passed.
	 * 
	 */
	TabService.getTab = function(target){
		return tabs[target];
	};

	/**
	 * @ngdoc method
	 * @name core.service:TabService#TabService.setTab
	 * @methodOf core.service:TabService
	 * @param {string} target an html view.
	 * @param {string} html html file .
	 * @returns {void} returns void
	 * 
	 * @description
	 * This method sets html view for tabs[target] based on the target value passed.
	 * 
	 */
	TabService.setTab = function(target, html){
		tabs[target] = html;
	};	

	return TabService;
	
});

