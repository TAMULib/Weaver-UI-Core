/**
* @ngdoc directive
* @name  core.directive:tooltip
* @restrict 'A'
* @requires $timeout
* @requires $compile
*
* @example
* <pre>
*	<tooltip title="The tooltip message">
*	</tooltip>
* </pre>
* 
* @description 
*  The tooltip element directive uses $timeout and $compile services. It has showTip hideTip 
*  This directive uses $compile services that compiles 'tipTemplate' variable into a template and produces a template function,
*  which can then be linked to '$scope' and the template. This is then appended to the html body
*/
core.directive('tooltip', function ($timeout, $compile) {
	return {
		template: '<span class="tooltip-handle" ng-mousemove="positionTip($event)" ng-mouseover="showTip()" ng-mouseout="hideTip()" ng-click="toggleVisible()" ng-transclude></span>',
		replace: true,
		transclude: true,
		restrict: 'A',
		scope:true,
		link: function($scope, elem, attr) {
			
			var tipTemplate = 	'<div class="tooltip-wrapper">'+
									'<div ng-style="tipStyles" class="tip" ng-class="{\'tip-visible\': tipVisible, \'hidden\': hidden}">'+
										'<div class="tip-point"></div>' +
										'<div class="tip-message">{{::tip}}</div>' +
									'</div>' +
								'</div>';
			
			angular.element("body").append($compile(tipTemplate)($scope));

			/**
		     * @ngdoc property
		     * @name core.directive:tooltip#$scope.tip
		     * @propertyOf core.directive:tooltip
		     *
		     * @description
		     * The $scope.tip variable stores the text message of the tooltip from the 'attr' objects tooltip property.
		     */ 
			$scope.tip = attr.tooltip;

			/**
		     * @ngdoc property
		     * @name core.directive:tooltip#$scope.tipVisible
		     * @propertyOf core.directive:tooltip
		     *
		     * @description
		     * The $scope.tipVisible variable stores the boolean value depending on whether the $scope.tip variable is displayed or not.
		     */
			$scope.tipVisible = false;

			/**
		     * @ngdoc property
		     * @name core.directive:tooltip#$scope.hidden
		     * @propertyOf core.directive:tooltip
		     *
		     * @description
		     * The $scope.hidden variable stores the boolean value 'true' if the tooltip message is displayed and 'false' otherwise.
		     */ 			
			$scope.hidden = true;

			/**
		     * @ngdoc property
		     * @name core.directive:tooltip#$scope.showTimer
		     * @propertyOf core.directive:tooltip
		     *
		     * @description
		     * The $scope.showTimer object uses the $timeout service to execute a function to toggle the boolean values 
		     * of $scope.tipVisible and $scope.hidden variables depending on the duration provided in the function.
		     */ 
			$scope.showTimer = {};

			/**
		     * @ngdoc property
		     * @name core.directive:tooltip#$scope.tipStyles
		     * @propertyOf core.directive:tooltip
		     *
		     * @description
		     * The $scope.tipStyles object stores the x and y cordinate values for the 'mousemove' event inorder to display the 
		     * tooltip text message.
		     */ 
			$scope.tipStyles = {};

			/**
			 * @ngdoc method
			 * @name core.directive:tooltip#$scope.showTip
			 * @methodOf core.directive:tooltip
			 * @returns {void} returns void
			 * 
			 * @description
			 *	This method will set the $scope.hidden boolean value to false and will use the $timeout service to display
			 *  the tooltip message for the duration of 500msec.
			 */
			$scope.showTip = function() {
				$scope.hidden = false;
				$scope.showTimer = $timeout(function() {
					$scope.tipVisible = true;
				}, 500);
			}

			/**
			 * @ngdoc method
			 * @name core.directive:tooltip#$scope.hideTip
			 * @methodOf core.directive:tooltip
			 * @returns {void} returns void
			 * 
			 * @description
			 *	This method will use the $timeout service to cancel the tooltip message display,will set the boolean
			 *  value of $scope.tipVisible to false and executes a function to set the boolean value of $scope.hidden boolean 
			 *  variable to true.
			 */
			$scope.hideTip = function() {
				$timeout.cancel($scope.showTimer);
				$scope.tipVisible = false;

				$timeout(function() {
					$scope.hidden = true;
				}, 500);

			}

			/**
			 * @ngdoc method
			 * @name core.directive:tooltip#$scope.toggleVisible
			 * @methodOf core.directive:tooltip
			 * @returns {void} returns void
			 * 
			 * @description
			 *	This method will use $timeout to cancel the tooltip message display and toggle the boolean values for 
			 *  *scope.tipVisible and $scope.hidden variables.
			 */ 
			$scope.toggleVisible = function() {
				$timeout.cancel($scope.showTimer);
				$scope.tipVisible = $scope.tipVisible ? false : true;

				if(!$scope.tipVisible) {
					$timeout(function() {
						$scope.hidden = $scope.hidden ? false : true;
					}, 500);
				} 

			}

			/**
			 * @ngdoc method
			 * @name core.directive:tooltip#$scope.positionTip
			 * @methodOf core.directive:tooltip
			 * @param {object} $event an object
			 * @returns {void} returns void
			 * 
			 * @description
			 *	This method stores X and Y cordinates of the mouse move event and is stored on to $scope.tipStyles["top"] 
			 *  and $scope.tipStyles["left"] variables respectively to aid display of the tooltip  message in that position.
			 */
			$scope.positionTip = function($event) {
				$scope.tipStyles["top"] = $event.clientY + 20;
				$scope.tipStyles["left"] = $event.clientX -	25;
			}
		}
	};
});