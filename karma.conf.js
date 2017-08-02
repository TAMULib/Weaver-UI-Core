module.exports = function (config) {
    config.set({

        basePath: './',

        files: [
            'app/config/coreConfig.js',

            'node_modules/jquery/dist/jquery.js',
            'node_modules/angular/angular.js',
            'node_modules/angular-mocks/angular-mocks.js',
            'node_modules/angular-route/angular-route.js',

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

        autoWatch: true,

        frameworks: ['jasmine'],

        browsers: ['Chrome'],

        plugins: [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-junit-reporter'
        ],

        junitReporter: {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }

    });
};
