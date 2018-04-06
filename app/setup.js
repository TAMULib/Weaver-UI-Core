Function.prototype.getName = function () {
    return this.name || this.toString().split("(")[0].replace(/function\s*/, "");
};

if (!Object.prototype.watch) {
    Object.defineProperty(Object.prototype, "watch", {
        enumerable: false,
        configurable: true,
        writable: false,
        value: function (prop, handler) {
            var old = this[prop];
            var cur = old;
            var getter = function () {
                return cur;
            };
            var setter = function (val) {
                old = cur;
                cur = handler.call(this, prop, old, val);
                return cur;
            };
            if (delete this[prop]) {
                Object.defineProperty(this, prop, {
                    get: getter,
                    set: setter,
                    enumerable: true,
                    configurable: true
                });
            }
        }
    });
}

function setUpApp(bootstrapApp) {

    var sockJSConnection;

    var jwt = getJwt();

    if (jwt) {
        cleanUrl();
        if (!sessionStorage.token) {
            sessionStorage.token = jwt;
        }
        if (sessionStorage.role === appConfig.anonymousRole) {
            delete sessionStorage.role;
        }
        connect({
            jwt: sessionStorage.token
        });
    } else {
        if (appConfig.allowAnonymous) {
            sessionStorage.role = appConfig.anonymousRole;
            connect({});
        } else {
            var referer = location.href;
            if(location.href.indexOf('?') >= 0) {
                var parts = location.href.split('?');
                referer = parts[0] + encodeURIComponent(parts[1]);
            }
            if (appConfig.mockRole) {
                referer +=  "&mock=" + appConfig.mockRole;
            }
            window.open(appConfig.authService + "/token?referer=" + referer, "_self");
        }
    }

    function attemptConnect(headers, attempt) {

        sockJSConnection = new SockJS(appConfig.webService + "/connect", null, {
            transports: appConfig.sockJsConnectionType
        });

        window.stompClient = Stomp.over(sockJSConnection);

        if (!appConfig.stompDebug) {
            window.stompClient.debug = null;
        }

        var wait = angular.isUndefined(angular.element(document).scope()) ? 500 : 5000;

        window.stompClient.connect(headers, function () {
            bootstrapApp();
        }, function () {
            if (attempt < 3) {
                setTimeout(function () {
                    attempt++;
                    attemptConnect(headers, attempt);
                }, wait);
            } else {
                bootstrapApp();
            }
        });

    };

    function connect(headers) {
        angular.element(document).ready(function () {
            attemptConnect(headers, 0);
        });
    };

    function getQueryVariable(variable) {
      var value;
      var query = window.location.search.substring(1);
      var vars = query.split("&");
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if(pair[0] === variable){
          value = pair[1];
        }
      }
      return value;
    }

    function getJwt() {
        if (sessionStorage.token) {
            return sessionStorage.token;
        }
        return getQueryVariable('jwt');
    }

    function cleanUrl() {
      var uri = location.toString();
      var jwtQuery = "jwt=" + getQueryVariable('jwt');
      history.replaceState({}, document.title, uri.replace(jwtQuery, ""));
    }

}
