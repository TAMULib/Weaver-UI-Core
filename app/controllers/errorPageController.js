core.controller("ErrorPageController", function ($scope, AccessControlService) {

    $scope.getPath = function (path) {

      if (!!path && path.length > 0) {
        var paths = path.split('/');

        for (var i in paths) {
          // Return to top-level when previous path contains route variables.
          if (paths[i][0] === ':') {
            paths = [];
            break;
          }
        }

        return paths.join('/');
      }

      return path;
    };

    // This is actually a URL path and not a route.
    $scope.lastRoute = $scope.getPath(AccessControlService.getLastRoutePath());

});
