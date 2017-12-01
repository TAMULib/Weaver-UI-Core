/**
 * @ngdoc directive
 * @name core.directive:accordion
 * @restrict 'E'
 * @requires core.service:AccordionService
 *
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
core.directive("wvrAccordion", function (AccordionService) {
    return {
        template: '<div class="accordion" ng-transclude></div>',
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            singleExpand: "@singleExpand"
        },
        controller: function ($scope) {

            /**
             * @ngdoc method
             * @name core.directive:accordion#$scope.closeAll
             * @methodOf core.directive:accordion
             * @param {integer=} id An open Accordion pane's id which you which should be left open.
             * @returns {void} returns void
             *
             * @description
             * 	A method uses the AccordionService to close all open panes.
             */
            this.closeAll = function (id) {
                if ($scope.singleExpand == "true") AccordionService.closeAll(id);
            }

        },
        link: function ($scope, element, attr) {

            /**
             * @ngdoc property
             * @name core.directive:accordion#$scope.singleExpand
             * @propertyOf core.directive:accordion
             *
             * @description
             * 	A $scope set from the accordion's element atrribute of the same name. This indicated that the
             * 	accordion will only allow one pane open at a time.
             *
             **/
            $scope.singleExpand = typeof attr.singleExpand != "undefined" ? attr.singleExpand.toLowerCase() == "true" : false;

        }
    };
});

/**
 * @ngdoc directive
 * @name core.directive:pane
 * @restrict 'E'
 * @requires ng.$location
 * @requires ng.$timeout
 * @requires ng.$anchorScroll
 * @requires core.service:AccordionService
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
core.directive("wvrPane", function ($location, $timeout, $anchorScroll, AccordionService) {
    var count = 0;
    return {
        templateUrl: 'node_modules/weaver-ui-core/app/views/directives/accordionPane.html',
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
             * @name core.directive:pane#$scope.query
             * @propertyOf core.directive:pane
             *
             * @description
             * 	A $scope variable to store the 'query string' tag of pane directive.
             **/
            $scope.query = typeof attr.query != "undefined" ? attr.query : "pane" + paneID;


            $timeout(function () {
                var panelSearch = $location.search()["panel"];
                if (panelSearch == $scope.query) $scope.open();
                $location.hash(panelSearch).replace()
                $anchorScroll();
            });

            /**
             * @ngdoc method
             * @name core.directive:pane#$scope.toggleExpanded
             * @methodOf core.directive:pane
             * @returns {void} returns void
             *
             * @description
             * 	A method uses the AccordionService to toggle the state of the pane clicked.
             */
            $scope.toggleExpanded = function () {
                $scope.closeAll(paneID);
                $scope.expanded ? $scope.close() : $scope.open();
            }

            /**
             * @ngdoc method
             * @name core.directive:pane#$scope.open
             * @methodOf core.directive:pane
             * @returns {void} returns void
             *
             * @description
             * 	This method stores the view path from 'attr' object on to the $scope.html variable. The AccordionService
             *  closes the previous opened pane based on the 'paneID' and the $location services replaces the existing
             *  URL with the new URL based on the query string '$scope.query'.
             */
            $scope.open = function (pageLoad) {
                if (typeof $scope.html == "undefined") {
                    $scope.loading = true;
                    $scope.html = attr.html;
                }
                $scope.expanded = true;
                AccordionService.add(paneID, $scope.close);
                $location.search("panel", $scope.query, false).replace();

            }

            /**
             * @ngdoc method
             * @name core.directive:pane#$scope.close
             * @methodOf core.directive:pane
             * @returns {void} returns void
             *
             * @description
             * 	This method assigns 'false' to the boolean variable '$scope.expanded'.
             */
            $scope.close = function () {
                $scope.expanded = false;
            }

            /**
             * @ngdoc method
             * @name core.directive:pane#$scope.close
             * @methodOf core.directive:pane
             * @returns {Promise} returns promise
             *
             * @description
             * 	This method uses the $timeout services to execute the function which is to set the boolean value of '$scope.loading' to false
             *  after the given duration of 500ms.
             */
            $scope.loaded = function () {
                $timeout(function () {
                    $scope.loading = false;
                }, 500);
            }

        }
    };
});

/**
 * @ngdoc service
 * @name  core.service:AccordionService
 * @returns {core.service:AccordionService} returns AccordionService object
 *
 * @description
 * 	The AccordionService can add remove panes from the 'openPanes' list using the 'paneID' passed as an argument.
 *  The 'closeAll' method closes all the panes in the 'openPanes' list.
 *
 */
core.service("AccordionService", function () {

    var AccordionService = this;

    /**
     * @ngdoc property
     * @name core.service:AccordionService#openPanes
     * @propertyOf core.service:AccordionService
     *
     * @description
     * 	A private object to store open panes. The key should be the id of the open pane, and the value its close method.
     */
    var openPanes = {};

    /**
     * @ngdoc method
     * @name core.service:AccordionService#AccordionService.add
     * @methodOf core.service:AccordionService
     * @param {integer} id The id of the open accrodion pane.
     * @param {function} close The close method of the open pane.
     * @returns {void} returns void
     *
     * @description
     * This method adds an Accordion's close method to the openPanes store, using the id as a key.
     *
     */
    AccordionService.add = function (id, close) {
        openPanes[id] = close;
    };

    /**
     * @ngdoc method
     * @name core.service:AccordionService#AccordionService.remove
     * @methodOf core.service:AccordionService
     * @param {integer} id An open Accordion pane's id.
     * @returns {void} returns void
     *
     * @description
     * This method removes an Accordion's close method to the openPanes store, using the id as a key.
     *
     */
    AccordionService.remove = function (id) {
        if (openPanes[id]) delete openPanes[id];
    }

    /**
     * @ngdoc method
     * @name core.service:AccordionService#AccordionService.closeAll
     * @methodOf core.service:AccordionService
     * @param {integer=} id An open Accordion pane's id.
     * @returns {void} returns void
     *
     * @description
     * 	This loops over the openPanes store and calls the close method on each member. If an id is passed into it
     * 	then that pane will remain open.
     *
     */
    AccordionService.closeAll = function (id) {
        for (var i in openPanes) {
            if (id != i) {
                openPanes[i]();
            }
        }
    };

    return AccordionService;

});
