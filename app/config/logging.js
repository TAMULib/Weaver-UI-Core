var logger = {
	'log': function(message) {
		if(appConfig.logging.log) {
			console.log("");
			console.log("***** OUT *****");
	        console.log(new Date());
	        console.log(message);
		}
	},
	'info': function(message) { 
		if(appConfig.logging.info) {
			console.log("");
			console.info("***** INFO *****");
	        console.log(new Date());
	        console.log(message);
		}
	},
	'warn': function(message) { 
		if(appConfig.logging.warn) {
			console.log("");
			console.warn("***** WARN *****");
	        console.log(new Date());
	        console.log(message);
		}
	},
	'error': function(message) { 
		if(appConfig.logging.error) {
			console.log("");
			console.error("***** ERROR *****");
	        console.log(new Date());
	        console.log(message);
		}
	},
	'debug': function(message) { 
		if(appConfig.logging.debug) {
			console.log("");
			console.debug("***** DEBUG *****");
	        console.log(new Date());
	        console.log(message);
		}
	}
};