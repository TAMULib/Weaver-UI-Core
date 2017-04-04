/**
 * @ngdoc object
 * @name  coreConfig
 *
 * @description
 *	A configuration object that is included in {@link core 'core'} as a constant
 *
 */
var coreConfig = {

    'version': 0.1,

    'alerts': {
        'types': [
            'SUCCESS',
            'INFO',
            'WARNING',
            'ERROR',
            'INVALID',
            'UNKNOWN'
        ],
        'classes': {
            'SUCCESS': 'success',
            'WARNING': 'warning',
            'ERROR': 'danger',
            'INVALID': 'danger',
            'UNKNOWN': 'danger',
            'DEFAULT': 'info'
        },
        'duration': 15000,
        'flush': 900000,
        'email': 'tamulib@mailinator.com'
    }

};
