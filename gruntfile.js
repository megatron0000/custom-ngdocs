/*global module:false*/
module.exports = function(grunt) {


    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-conventional-changelog');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-jasmine-node');

    grunt.loadTasks('tasks');

    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.initConfig({
        typedoc: {
            build: {
                options: {
                    module: 'commonjs',
                    out: './docs',
                    name: 'my-project',
                    target: 'es6',
                    includeDeclarations: true
                },
                src: ['./src/**/*']
            }
        },
        changelog: {
            options: {
                dest: 'CHANGELOG.md'
            }
        },
        jasmine_node: {
            forceexit: true,
            captureExceptions: true
        },
        watch: {
            forNgDocs: {
                files: ['src/**'],
                tasks: ['clean', 'ngdocs']
            },
            forTests: {
                parser: {
                    files: ['src/*.js', 'spec/*Spec.js'],
                    tasks: ['jasmine_node']
                }
            },
            options: {
                livereload: true
            }
        },
        connect: {
            options: {
                keepalive: false
            },
            server: {
                options: {
                    livereload: true,
                    hostname: "localhost",
                    base: './docs/angular',
                    port: 8000,
                    open: false
                }
            }
        },
        clean: ['docs/angular'],
        ngdocs: {
            options: {
                //scripts: ['angular.js', '../src.js'],
                html5Mode: false,
                dest: './docs/angular',
                styles: ['src/custom-resources/css/custom-font.css', 'node_modules/custom-fonts/open-sans/OpenSans-Regular.ttf'],
                startPage: "/",
                title: 'Metadocs',
                inlinePartials: false, //default
                bestMatch: false
                    // scripts: ['modules/**/*.js'] No wildcards -_- just moves to docs/grunt-scripts
                    // image: './img/logo.png'   just moves to docs/grunt-styles
                    // navContent = './some/path/to/template'
            },
            // Instead of "all", I could specify sections here
            all: ['src/templates/js/**/*.js']
                // externalApi: {
                //     src: ['modules/main/*.js'],
                //     title: "you can see this",
                //     isApi: true
                // },
                // privateSource: {
                //     src: ['modules/assessmentAnalysis/*.js'],
                //     title: "This is private"
                //     isApi: false
                // }
        }
    });

    grunt.registerTask('gendocs', ['clean', 'ngdocs', 'connect', 'watch:forNgDocs']);
    grunt.registerTask('test', 'Run tests for parser code', ['jasmine_node']);

};