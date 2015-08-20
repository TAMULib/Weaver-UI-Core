angular.module('mock.wsApi', []).
    service('WsApi', function($q) {

        var WsApi = this;

        WsApi.fetch = function(apiReq) {
        	
        	var defer = $q.defer();
        	
        	switch(apiReq.controller) {
        		case 'admin': {
        			switch(apiReq.method) {
        				default: {

        				}; break;
        			}
        		}
        		case 'user': {
        			switch(apiReq.method) {
        				case 'credentials': defer.resolve({'content':mockUser1}); break;
        				case 'get': defer.resolve({'content':mockUser1}); break;        				
        				default: {
        					
        				}; break;
        			}
        		}; break;
        		default: {
        			switch(apiReq.method) {
        				default: {
        					
        				}; break;
        			}
        		}; break;
        	}
        	            
            return defer.promise;
        }
        
        WsApi.listen = function(apiReq) {        	
        	var defer = $q.defer();
            return defer.promise;
        }
            
});