core.service("UserService", function ($q, StorageService, User, WsApi) {

    var UserService = this;

    var userEvents = $q.defer();

    var userReady = $q.defer();

    var currentUser = new User();

    UserService.fetchUser = function () {
        userEvents.notify('FETCH');
        return WsApi.fetch(currentUser.getMapping().instantiate).then(function (res) {
            delete sessionStorage.role;
            var credentials = angular.fromJson(res.body).payload.Credentials;
            currentUser.anonymous = credentials.role === appConfig.anonymousRole ? true : false;
            angular.extend(currentUser, credentials);
            StorageService.set("role", currentUser.role);
            userEvents.notify('RECEIVED');
            userReady.resolve(currentUser);
        });
    };

    UserService.userReady = function () {
        return userReady.promise;
    };

    UserService.userEvents = function () {
        return userEvents.promise;
    };

    UserService.setCurrentUser = function (user) {
        angular.extend(currentUser, user);
    };

    UserService.getCurrentUser = function () {
        return currentUser;
    };

    if (sessionStorage.token) {
        UserService.fetchUser();
    }

});
