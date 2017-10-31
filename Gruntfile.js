module.exports = function (grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        ngdocs: {
            all: ['app/**/*.js', '!app/node_modules/**/*.js']
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '**/*.js',
                '!node_modules/**/*'
            ]
        },

    });

    grunt.loadNpmTasks('grunt-ngdocs');

    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['jshint']);

    grunt.registerTask('docs', ['ngdocs']);

}
