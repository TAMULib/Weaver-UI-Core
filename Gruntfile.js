module.exports = function(grunt) {

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		// Project settings
		ngdocs: {
			all: ['app/**/*.js', '!app/bower_components/**/*.js']
		},

		watch: {
			scripts: {
				files: ['app/**/*.js'],
				tasks: ['ngdocs']
			}
		}

	});	

	//npm tasks
	grunt.loadNpmTasks('grunt-ngdocs');

	//tasks
	grunt.registerTask('default', 'Default Task Alias', ['build']);
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('build', 'Build the application', [
		'ngdocs'
	]);

}