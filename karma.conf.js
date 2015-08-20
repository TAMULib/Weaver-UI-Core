module.exports = function(config){
    config.set({

        basePath : './',

        files : [
            'app/config/coreConfig.js',

            'app/bower_components/jquery/dist/jquery.js',
            'app/bower_components/angular/angular.js',
            'app/bower_components/angular-mocks/angular-mocks.js',
            'app/bower_components/angular-route/angular-route.js',

            'app/components/**/*.js',

            'tests/testSetup.js',
            
            'app/core.js',
            
            'app/controllers/**/*.js',
            'app/directives/**/*.js',
            
            'app/services/**/*.js',            
            
            'app/model/**/*.js',            
            
            'tests/mocks/**/*.js',
            'tests/unit/**/*.js'
            
        ],

        autoWatch : true,

        frameworks: ['jasmine'],

        browsers : ['Chrome'],

        plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-junit-reporter'
            ],

        junitReporter : {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }

    });
};