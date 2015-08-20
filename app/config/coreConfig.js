var coreConfig = { 

	'version': 0.1,
		
	'anonymousToken': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsYXN0TmFtZSI6IkFub255bW91cyIsImZpcnN0TmFtZSI6IlJvbGUiLCJyb2xlIjoiUk9MRV9BTk9OWU1PVVMiLCJuZXRpZCI6ImFub255bW91cyIsInVpbiI6IjAwMDAwMDAwMCIsImV4cCI6IjQ1ODkwNTA1NzY0MzUiLCJlbWFpbCI6IiJ9.3y67Gp6QpiA0iDiB_pRcrT5OJXwUtrz8ayj1rRL-QL0',

	'storageType': 'session',
	
	'logging': {
		'log': true,
		'info': true,
		'warn': true,
		'error': true,
		'debug': true
	},
	
	'stompDebug': false,

	/*
		Determines the type of connection stomp will attempt to make with the service.
		TYPES:  websocket, xhr-streaming, xdr-streaming, eventsource, iframe-eventsource, 
				htmlfile, iframe-htmlfile, xhr-polling, xdr-polling, iframe-xhr-polling,
				jsonp-polling
	*/
	'sockJsConnectionType': ['websocket', 'iframe-eventsource',  'iframe-htmlfile', 'jsonp-polling'],

};

