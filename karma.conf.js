module.exports = function (config) {
    config.set({

        preprocessors: {
            "app/**/*.js": "coverage",
            '**/*.html': ['ng-html2js']
        },

        reporters: ['coverage'],

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

        failOnEmptyTestSuite: false,

        browsers: ['Chrome', 'Firefox'],

        plugins: [
            'karma-chrome-launcher',
            'karma-coverage',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-junit-reporter',
            'karma-ng-html2js-preprocessor'
        ],

        coverageReporter: {
            type: "lcov",
            dir: "coverage/"
        }

    });
};