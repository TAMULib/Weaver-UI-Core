/**
 * @ngdoc directive
 * @name core.directive:accordion
 * @requires AccordionService
 * @example
 * The following must be added to your application to use the accordion directive followed by the panes within it
 *	<pre>
 *		<accordion single-expand="true"> 			
 *      </accordion>
 *	</pre>
 *
 * @description
 *	This accordion directive sets the tag "single-expand"=true which ensures that only one pane( one view) can be clicked open 
 *  at a time.
 *
**/
core.directive("accordion", function(AccordionService) {
	return {
		template: '<div class="accordion" ng-transclude></div>',
		restrict: 'E',
		replace: true,
		transclude: true,
		scope: {
			singleExpand: "@singleExpand"
		},
		controller: function($scope)  {

			this.closeAll = function(id) {
				if($scope.singleExpand == "true") AccordionService.closeAll(id);
			}

		},
		link: function($scope, element, attr) {
			
			$scope.singleExpand = typeof attr.singleExpand != "undefined" ? attr.singleExpand.toLowerCase() == "true" : false;	
			
		}
	};
});

/**
 * @ngdoc directive
 * @name core.directive:accordion
 * @restrict 'E'
 * @requires $location
 * @requires $timeout
 * @requires $anchorScroll
 * @requires AccordionService
 * @example
 * The following must be added to your application to use the accordion directive followed by the panes within it
 *	<pre>
 *		<pane query="query_string_for_myview" html="views/myview.html">
 *			PANE TITLE
 *		</pane>
 *	</pre>
 *
 * @description
 *	This pane directive uses the 'AccordionService' to open and close the pane based on 
 *
**/
core.directive("pane", function($location, $timeout, $anchorScroll, AccordionService) {
	var count = 0;
	return {
		templateUrl: 'views/directives/accordionPane.html',
		restrict: 'E',
		replace: false,
		transclude: true,
		require: "^accordion",
		scope: true,
		link: function ($scope, element, attr, parent) {

			var paneID = count++;

			$anchorScroll.yOffset = 55;
			
			angular.extend($scope, parent);
			
			/**
			 * @ngdoc property
			 * @name core.directives:pane#$scope.query
			 * @propertyOf core.directives:pane
			 *
			 * @description
			 * 	A $scope variable to store the 'query string' tag of pane directive. 
			 **/	
			$scope.query = typeof attr.query != "undefined" ? attr.query : "pane"+paneID;

			
			$timeout(function() {
				var panelSearch = $location.search()["panel"];
				if(panelSearch == $scope.query) $scope.open();
				$location.hash(panelSearch).replace()
				$anchorScroll();
			});

			/**
			 * @ngdoc method
			 * @name core.directives:pane#$scope.toggleExpanded
			 * @methodOf core.directives:pane
			 * @returns {void} returns void
			 * 
			 * @description
			 * 	A method uses the AccordionService to toggle the state of the pane clicked. 
			 */
			$scope.toggleExpanded = function() {
				$scope.closeAll(paneID);
				$scope.expanded ? $scope.close() : $scope.open();
			}

			/**
			 * @ngdoc method
			 * @name core.directives:pane#$scope.open
			 * @methodOf core.directives:pane
			 * @returns {void} returns void
			 * 
			 * @description
			 * 	This method stores the view path from 'attr' object on to the $scope.html variable. The AccordionService 
			 *  closes the previous opened pane based on the 'paneID' and the $location services replaces the existing 
			 *  URL with the new URL based on the query string '$scope.query'.
			 */
			$scope.open = function(pageLoad) {
				if(typeof $scope.html == "undefined") {
					$scope.loading = true;
					$scope.html = attr.html;
				}
				$scope.expanded = true;
				AccordionService.add(paneID, $scope.close);
				$location.search("panel", $scope.query, false).replace();	
				
			}

			/**
			 * @ngdoc method
			 * @name core.directives:pane#$scope.close
			 * @methodOf core.directives:pane
			 * @returns {void} returns void
			 * 
			 * @description
			 * 	This method assigns 'false' to the boolean variable '$scope.expanded'.
			 */
			$scope.close = function() {
				$scope.expanded = false;
				console.log(paneID + " is closed");
			}

			/**
			 * @ngdoc method
			 * @name core.directives:pane#$scope.close
			 * @methodOf core.directives:pane
			 * @returns {Promise} returns promise
			 * 
			 * @description
			 * 	This method uses the $timeout services to execute the function which is to set the boolean value of '$scope.loading' to false
			 *  after the given duration of 500ms.
			 */
			$scope.loaded = function() {
				$timeout(function(){
					$scope.loading = false;	
				}, 500);
			}

	    }
	};
});

/**
 * @ngdoc service
 * @name  core.directives:AccordionService
 * @returns {AccordionService} returns AccordionService object
 *
 * @description
 * 	The AccordionService can add remove panes from the 'openPanes' list using the 'paneID' passed as an argument.
 *  The 'closeAll' method closes all the panes in the 'openPanes' list.
 * 
 */
core.service("AccordionService", function() {

	var AccordionService = this;

	var openPanes = {};
	
	AccordionService.add = function(id, close) {
		openPanes[id] = close;
		console.log(openPanes);
	};

	AccordionService.remove = function(id) {
		if(openPanes[id]) delete openPanes[id];
	}

	AccordionService.closeAll = function(id) {
		for(var i in openPanes) {
			if(id != i)  {
				console.log("closing " + id);
				openPanes[i]();
			}
		}
	};

	return AccordionService;

});
