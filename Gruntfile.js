module.exports = function (grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        ngdocs: {
            all: ['app/**/*.js', '!app/node_modules/**/*.js', '!app/coverage/**/*.js']
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '**/*.js',
                '!node_modules/**/*',
                '!coverage/**/*'
            ]
        },

        coveralls: {
            options: {
                debug: true,
                coverageDir: 'coverage/',
                dryRun: true
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-karma-coveralls');
    grunt.loadNpmTasks('grunt-ngdocs');

    grunt.registerTask('default', ['jshint']);

    grunt.registerTask('coverage', ['jshint', 'coveralls']);

    grunt.registerTask('docs', ['ngdocs']);

};