module.exports = function (grunt) {

	require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

	grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            build: ['.tmp', 'static/build'],
            tmp: '.tmp'
        },
        copy: {
            html: {
                src: 'static/app.html',
                dest: 'static/build/app.html'
            },
            graphics: {
                expand: true,
                cwd: 'static/graphics',
                src: '**',
                dest: 'static/build/'
            }
        },
        useminPrepare: {
            html: 'static/app.html',
            options: {
                dest: 'static/build'
            }
        },
        ngtemplates: {
            dist: {
                cwd: 'static/',
                src: 'app/**/*.html',
                dest: '.tmp/templates.js',
                options: {
                    module: 'ws_room',
                    htmlmin: {
                        keepClosingSlash: true,
                        collapseWhitespace: true,
                        conservativeCollapse: true,
                        removeScriptTypeAttributes: true,
                        removeStyleLinkTypeAttributes: true
                    },
                    usemin: 'app.min.js'
                }
            }
        },
        ngAnnotate: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/concat',
                    src: '**/*.js',
                    dest: '.tmp/concat'
                }]
            }
        },
        usemin: {
            html: 'static/build/app.html'
        }
	});

	grunt.registerTask('build', [
	    'clean:build',
	    'copy',
		'useminPrepare',
        'ngtemplates',
        'concat',
        'ngAnnotate',
        'uglify',
        'cssmin',
		'usemin',
        'clean:tmp'
	]);
};
