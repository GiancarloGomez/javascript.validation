module.exports = function(grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        banner: [
            ' // ----------------------------------------------------------------------------',
            ' // <%= pkg.description %>',
            ' // v<%= pkg.version %> - released <%= grunt.template.today("yyyy-mm-dd HH:MM") %>',
            ' // <%= pkg.versionDetails %>',
            ' // Licensed under the MIT license.',
            ' // <%= pkg.homepage %>',
            ' // ----------------------------------------------------------------------------',
            ' // Copyright (C) 2013-<%= grunt.template.today("yyyy") %> <%= pkg.author %>',
            ' // <%= pkg.authorsite %>',
            ' // ----------------------------------------------------------------------------',
            '\n'
        ].join('\n'),

        jshint: {
            files: ['gruntfile.js', 'src/**/*.js']
        },

        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            js: {
                options: {
                    mangle: false,
                    compress: false,
                    beautify: true
                },
                src: 'src/validation.js',
                dest: 'dist/validation.full.js'
            },
            jsmin: {
                options: {
                    mangle: true,
                    compress: {}
                },
                src: 'dist/validation.full.js',
                dest: 'dist/validation.min.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('build',   ['jshint', 'uglify']);
    grunt.registerTask('default', ['build']);

};