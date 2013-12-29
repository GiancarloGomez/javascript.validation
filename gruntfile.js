var semver = require('semver'),
    format = require('util').format;

module.exports = function(grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        banner: [
            ' // ----------------------------------------------------------------------------',
            ' // <%= pkg.description %>',
            ' // v<%= pkg.version %> - released <%= grunt.template.today("yyyy-mm-dd HH:MM") %>',
            ' // Licensed under the MIT license.',
            ' // https://github.com/GiancarloGomez/javascript.validation',
            ' // ----------------------------------------------------------------------------',
            ' // Copyright (C) 2010-<%= grunt.template.today("yyyy") %> Giancarlo Gomez',
            ' // http://giancarlogomez.com/',
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
                    compress: true
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

    grunt.registerTask('release', 'Release lib.', function(version) {
        var pkg = grunt.file.readJSON('package.json');

        version = semver.inc(pkg.version, version) || version;

        if (!semver.valid(version) || semver.lte(version, pkg.version)) {
            grunt.fatal('Invalid version.');
        }

        pkg.version = version;
        grunt.config.data.pkg = pkg;

        grunt.task.run([
            'exec:gitFailIfDirty',
            'build',
            'metadata:' + version,
            'manifests:' + version,
            'exec:gitAdd',
            'exec:gitCommit:' + version,
            'exec:gitTag:' + version,
            'exec:gitPush',
            'exec:publish'
        ]);
    });

    grunt.registerTask('manifests', 'Update manifests.', function(version) {
        var _   = grunt.util._,
            pkg = grunt.file.readJSON('package.json'),
            cpt = grunt.file.readJSON('component.json');

        if (!semver.valid(version)) {
            grunt.fatal('Invalid version');
        }

        pkg.version = version;

        cpt = JSON.stringify(_.extend(cpt,
            _.omit(pkg, 'dependencies', 'devDependencies')
        ), null, 2);

        pkg = JSON.stringify(pkg, null, 2);

        grunt.file.write('package.json', pkg);
        grunt.file.write('component.json', cpt);
    });

    grunt.registerTask('metadata', 'Create metadata file.', function(version) {
        var metadata = {
            'date': grunt.template.today("yyyy-mm-dd HH:MM:ss"),
            'version': version
        };

        grunt.file.write('dist/metadata.json', JSON.stringify(metadata, null, 2));
    });
};