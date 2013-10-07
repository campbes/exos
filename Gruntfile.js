module.exports = function(grunt) {

    var pkg = grunt.file.readJSON('package.json');

    grunt.initConfig({
        pkg : pkg,
        props : {
            out : 'target',
            src : 'src/main',
            name : '<%=pkg.name%>-<%=pkg.version%>'
        },
        clean : ['target'],
        concat: {
            dist: {
                src: [
                    '<%= props.src%>/resources/mootools-slick-1.4.5.js',
                    '<%= props.src%>/js/exos.js',
                    '<%= props.src%>/js/interpreter.js'
                ],
                dest: '<%= props.out%>/<%=props.name%>/<%=props.name%>.js'
            }
        },
        jslint: { // configure the task
            src: {
                src: [
                    '<%= props.src%>/js/*.js'
                ],
                directives: {
                    browser: true,
                    predef : ['window'],
                    white : true,
                    vars : true,
                    plusplus : true,
                    continue : true
                },
                options: {
                    junit: '<%= props.out%>/jslint/jslint-src.xml'
                }
            }
        },
        gcc: {
            dist: {
                src: ['<%=props.out%>/<%=props.name%>/<%=props.name%>.js'],
                dest: '<%= props.out%>/<%=props.name%>/<%=props.name%>.min.js'
            }
        },
        curl: {
            '<%=props.out%>/dependency/coverage-1.3.5.jar': 'https://js-test-driver.googlecode.com/files/coverage-1.3.5.jar'
        },
        copy : {
            testSources: {
                files: [
                    {
                        src: ['<%= props.out%>/<%=props.name%>/<%=props.name%>.min.js'],
                        filter : 'isFile',
                        dest: '<%= props.out%>/test-sources/',
                        flatten : true,
                        expand : true
                    }
                ]
            }
        },
        jstestdriver: {
            files: [
                "jsTestDriver.conf",
                "exos.min.conf"
            ],
            options : {
                testOutput : '<%= props.out%>/jstestdriver'
            }
        },
        compress : {
            main: {
                options: {
                    archive: '<%= props.out%>/<%=props.name%>.zip'
                },
                files: [
                    {
                        src: ['<%= props.out%>/<%=props.name%>/**','LICENSE-MIT'],
                        flatten : true,
                        expand : true
                    }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-install-dependencies');

    for(var i in pkg.devDependencies) {
        if(pkg.devDependencies.hasOwnProperty(i)) {
            grunt.loadNpmTasks(i);
        }
    }

    grunt.registerTask('compile', ['jslint','concat','gcc']);
    grunt.registerTask('test', ['copy:testSources','curl','jstestdriver']);
    grunt.registerTask('package', ['compress']);
    grunt.registerTask('default', ['clean','compile','test','package']);

};