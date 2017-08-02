module.exports = function (grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        ngdocs: {
            all: ['app/**/*.js', '!app/node_modules/**/*.js']
        },

        watch: {
            scripts: {
                files: ['app/**/*.js'],
                tasks: ['ngdocs']
            }
        }

    });

    grunt.loadNpmTasks('grunt-ngdocs');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', 'Default Task Alias', ['docs']);
    grunt.registerTask('docs', 'Build the application', ['ngdocs']);
    grunt.registerTask('watch', 'Watch the application', ['watch']);

}
