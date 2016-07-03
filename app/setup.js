function setUpApp(bootstrapApp) {

	var sockJSConnection;

	var jwt = getJWT();

	if(jwt) {
		if(!sessionStorage.token) {
			sessionStorage.token = jwt;
		}
		if(sessionStorage.role == appConfig.anonymousRole) {
			delete sessionStorage.role;
		}
		connect({"jwt": sessionStorage.token});

	} else {
		if(appConfig.allowAnonymous) {
			sessionStorage.role = appConfig.anonymousRole;
			connect({});
		}
		else {
			if(appConfig.mockRole) {
				window.open(appConfig.authService + "/token?referer="+location.href + "&mock=" + appConfig.mockRole, "_self");
			}
			else {
				window.open(appConfig.authService + "/token?referer="+location.href, "_self");
			}
		}
	}

	function attemptConnect(headers, attempt) {

		sockJSConnection = new SockJS(appConfig.webService+"/connect", null, {transports: appConfig.sockJsConnectionType});

		window.stompClient = Stomp.over(sockJSConnection);

		if(!appConfig.stompDebug) {
			window.stompClient.debug = null; 
		}

		var wait = angular.isUndefined(angular.element(document).scope()) ? 500 : 5000;
	    
		window.stompClient.connect(headers, function() {
			bootstrapApp();
		}, function() {
			if(attempt < 3) {
				setTimeout(function() {
					attempt++;
					attemptConnect(headers, attempt);
				}, wait);
			}
			else {
				bootstrapApp();
			}
		});

	};

	function connect(headers) {
		angular.element(document).ready(function() {
			attemptConnect(headers, 0);
		});
	};

	function getJWT() {

		if(sessionStorage.token) {
			return sessionStorage.token;
		}

		var queriesString = location.search;

		if(typeof(queriesString) == "undefined") {
			return null;
		}

		var queries = queriesString.substring(1).split("&");

		var jwt = null;
		
		for(var key in queries) {			
			var queryString = queries[key];
			var query = queryString.split("=");
			if(query[0] == "jwt") jwt = query[1];

		}

		if(jwt) {
			var uri = location.toString();
			if (uri.indexOf("?") > 0) {
			    var clean_uri = uri.substring(0, uri.indexOf("?"));
			    history.replaceState({}, document.title, clean_uri);
			}
		}

		return jwt;
	};

}
