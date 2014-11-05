#!/usr/bin/env python


import os
import sys
import shutil
import json
import SimpleHTTPServer
import SocketServer
import urllib
from collections import OrderedDict
import time

from pake import main
from pake import target
from pake import variables
from pake import virtual
from pake import ifind
from pake import which
from pake import targets


if sys.platform == 'win32':
    variables.NPM = 'npm.cmd'
    variables.GULP = 'gulp.cmd'
    variables.GRUNT = 'grunt.cmd'
    variables.JSDOC = 'jsdoc.cmd'
    variables.BOWER = 'bower.cmd'
    variables.PYTHON = 'python.exe'
    variables.JAVA = 'java.exe'
    variables.GIT = 'git.exe'
    variables.GJSLINT = 'gjslint.exe'
    variables.CASPERJS = 'casperjs.exe'
else:
    variables.NPM = 'npm'
    variables.GULP = 'gulp'
    variables.GRUNT = 'grunt'
    variables.JSDOC = 'jsdoc'
    variables.BOWER = 'bower'
    variables.PYTHON = 'python'
    variables.JAVA = 'java'
    variables.GIT = 'git'
    variables.GJSLINT = 'gjslint'
    variables.CASPERJS = 'casperjs'

variables.BUILDER = os.path.join('bower_components', 'closure-library',
                                 'closure', 'bin', 'build',
                                 'closurebuilder.py')
variables.DEPSWRITER = os.path.join('bower_components',
                                    'closure-library',
                                    'closure', 'bin',
                                    'build', 'depswriter.py')
variables.CLOSURE_JAR = os.path.join('bower_components',
                                     'closure-compiler',
                                     'compiler.jar')

EXECUTABLES = [variables.JSDOC, variables.PYTHON, variables.JAVA,
               variables.GIT, variables.GJSLINT,variables.GULP,variables.GRUNT]

SRC = [path for path in ifind('src/mapito')
           if (path.endswith('.js'))]

TEMPLATES_SRC = [path for path in ifind(os.path.join('src', 'templates'))
           if path.endswith('.js')]
TEMPLATES_PATH = os.path.join('src', 'templates')
TEMPLATES_BUILD_PATH = os.path.join('build', 'templates')


EXAMPLES_SRC = [path for path in ifind(os.path.join('examples', 'stable'))
                if path.endswith('.html')]
EXAMPLES_SRC_JS = [path.replace('.html', '.js') for path in EXAMPLES_SRC]

REACT_EXTERNS = os.path.join(
    'bower_components', 'react-externs', 'externs.js')

COMPILED = 'build/lib/mapito.js'
COMPILED_WHITESPACE = 'build/lib/mapito-space.js'
COMPILED_DEPS = 'build/lib/deps'
COMPILED_SIMPLE = 'build/lib/mapito-simple.js'
# BUILDS = [COMPILED, COMPILED_SIMPLE, COMPILED_WHITESPACE]
BUILDS = [COMPILED]

OL_EXTERNS = [
              "bower_components/openlayers3/externs/bingmaps.js",
              "bower_components/openlayers3/externs/bootstrap.js",
              "bower_components/openlayers3/externs/closure-compiler.js",
              "bower_components/openlayers3/externs/example.js",
              "bower_components/openlayers3/externs/geojson.js",
              "bower_components/openlayers3/externs/jquery-1.9.js",
              "bower_components/openlayers3/externs/oli.js",
              "bower_components/openlayers3/externs/olx.js",
              "bower_components/openlayers3/externs/proj4js.js",
              "bower_components/openlayers3/externs/tilejson.js",
              "bower_components/openlayers3/externs/topojson.js",
              "bower_components/openlayers3/externs/vbarray.js"
]



##web server component
class Timer(object):
    """Timer measuring"""
    def __init__(self):
        """@constructor"""
        self.things = OrderedDict()
        self.things['start'] = time.time()
        self.things['stop'] = None
        self.things['elapsed'] = None

    def round(self, foobar):
        return round(foobar, 2)

    def start(self, thing):
        self.things[thing] = OrderedDict()
        self.things[thing]['start'] = time.time()
        print 'started: {0}'.format(thing)

    def stop(self, thing=None):
        stop = time.time()
        if thing is not None:
            elapsed = self.round(stop - self.things[thing]['start'])
            self.things[thing]['stop'] = stop
            self.things[thing]['elapsed'] = elapsed
            print 'stopped: {0} {1}'.format(thing, elapsed)
        else:
            elapsed = self.round(stop - self.things['start'])
            print 'stopped: {0}'.format(elapsed)
            self.things['stop'] = stop
            self.things['elapsed'] = elapsed
            print json.dumps(self.things, indent=4)

timer = Timer()

##web server component
class MyHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    """Handler of incommint HTTP request
    """
    jsfiles = []

    def make_headers(self):
        """Make application/javascript content-type header
        """
        self.send_response(200)
        self.send_header('Content-type', 'application/javascript')
        self.end_headers()

    def compile_example_ondemand(self, mode, js, js_out):
        """Compile particular example from scratch
        """

        tar = targets.get(js_out)

        if not hasattr(tar, 'mode'):
            tar.mode = mode

        if tar.mode != mode:
            if os.path.isfile(js_out):
                os.remove(js_out)
            tar.mode = mode

        tar.timestamp = None
        tar.action(tar)

    def filter_example_param(self, attr):
        """Filter attribute with keyword 'example'
        """
        return attr.split("=")[0].lower() == "example",

    def do_GET(self):
        """Handle HTTP GET request
        """

        js_loading_script = """
        (function() {
            var files = %s;
            for (var i = 0, ilen = files.length; i < ilen; i++) {
                document.write('<script type="text/javascript" '+
                'src="http://localhost:8000/' + files[i] + '"><\/script>');
            }
        })();
        """

        if len(MyHandler.jsfiles) == 0:
            timer.start('loading jsfiles')
            for js_dep in open(COMPILED_DEPS).readlines():
                MyHandler.jsfiles.append(
                    js_dep.strip().replace(os.path.sep, '/'))
            timer.stop('loading jsfiles')

        path = urllib.splitattr(self.path)[0]

        js_out = ''
        js_in = ''
        if len(urllib.splitattr(self.path)[1]) > 0:
            example = filter(self.filter_example_param,
                             urllib.splitattr(
                             self.path)[1])[0].split("=")[1]
            js_out = example.replace('examples/stable/',
                                     'build/examples/')
            js_in = example.replace('/gp2-lib/', '')

        if path.endswith('/raw'):
            timer.start('raw mode')
            self.log_message("RAW mode")
            self.make_headers()
            self.wfile.write(js_loading_script %
                             (MyHandler.jsfiles + [js_in]))
            timer.stop('raw mode')

        elif (path.endswith('advanced') or
              path.endswith('simple') or
              path.endswith('space')) and (js_out and js_in):

            if path.endswith('/simple'):
                timer.start('simple mode')
                self.log_message("SIMPLE mode")
                self.compile_example_ondemand('SIMPLE', js_in, js_out)
                timer.stop('simple mode')

            elif path.endswith('/advanced'):
                timer.start('advanced mode')
                self.log_message("ADVANCED mode")
                self.compile_example_ondemand('ADVANCED', js_in, js_out)
                timer.stop('advanced mode')

            elif path.endswith('/space'):
                timer.start('whitespace mode')
                self.log_message("WHITESPACE_ONLY mode")
                self.compile_example_ondemand('WHITESPACE_ONLY',
                                              js_in, js_out)
                timer.stop('whitespace mode')

            self.make_headers()
            self.wfile.write(js_loading_script % [js_out])

        else:
            SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)
        return

@target('templates',TEMPLATES_SRC)
def compile_templates(trgt):
    """Clean templates
    """
    trgt.rm_rf('build/templates')

    """COMPILE TEMPLATES
    """
    trgt.run('jsx',
             TEMPLATES_PATH,
             TEMPLATES_BUILD_PATH)

@target(COMPILED, SRC, 'templates', COMPILED_DEPS)
def compile_lib_advanced(trgt):
    """Compile lib in advanced mode
    """
    compile_lib(trgt, 'ADVANCED')


@target(COMPILED_SIMPLE, SRC, 'templates', COMPILED_DEPS)
def compile_lib_simple(trgt):
    """Compile lib in simple mode
    """
    compile_lib(trgt, 'SIMPLE')


@target(COMPILED_WHITESPACE, SRC, 'templates', COMPILED_DEPS)
def compile_lib_whitespace(trgt):
    """Compile lib in whitespace mode
    """
    compile_lib(trgt, 'WHITESPACE_ONLY')


@target(COMPILED_DEPS, SRC, 'templates')
def compile_lib_deps(trgt):
    """Compile dependencies
    """

    trgt.makedirs('build/cfg')

    trgt.output('%(PYTHON)s',
                '%(BUILDER)s',
                '--compiler_jar=%(CLOSURE_JAR)s',
                '--root=bower_components/closure-library/closure/goog',
                '--root=bower_components/closure-library/' +
                'third_party/closure/goog',
                '--root=bower_components/openlayers3/src/ol',
                '--root=bower_components/openlayers3/build/ol.ext/',
                '--root=bower_components/openlayers3/externs',
                '--root=src/mapito',
                '--root=build/templates',
                '--namespace=mapito.App',
                '--output_mode=%s' % 'list')

    # big deps fix
    deps = [dep.strip() for dep in open(COMPILED_DEPS).readlines()]

    # write back
    out_deps = open(COMPILED_DEPS, "w")
    out_deps.writelines([dep + "\n" for dep in deps])
    out_deps.close()


def compile_lib(trgt, level, inputs=[]):

    deps = [dep.strip() for dep in open(COMPILED_DEPS).readlines()]
    command = [variables.JAVA,
               '-client',
               '-XX:+TieredCompilation',
               '-jar',
               variables.CLOSURE_JAR,
               '--language_in', 'ECMASCRIPT5_STRICT',
               '--compilation_level=%s' % level,
               '--externs',REACT_EXTERNS]

    for dep in deps:
        command.append('--js')
        command.append(dep)

    for extern in OL_EXTERNS:
        command.append('--externs')
        command.append(extern)

    for inpt in inputs:
        command.append(inpt)

    trgt.output(command)


@target('cleanBuild')
def clean_build(trgt):
    """Clean build directory
    """
    trgt.rm_rf('build/')


@target('cleanBower')
def clean_bower(trgt):
    """Clean bower_components directory
    """
    trgt.rm_rf('bower_components')


@target('installBower', 'cleanBuild')
def bower(trgt):
    """Run bower install
    """
    trgt.run('%(BOWER)s', 'install')

@target('cleanNode')
def remove(trgt):
    """Remove node_modules
    """
    trgt.rm_rf('node_modules')


@target('installNode')
def installNode(trgt):
    """Run npm install
    """
    trgt.run('%(NPM)s', 'install')


@target('build/fix-stamp', SRC, EXAMPLES_SRC_JS)
def build_fix_src_timestamp(trgt):
    """Run fix js style
    """

    trgt.run('fixjsstyle',
             '--jslint_error=all',
             '--strict',
             trgt.newer(trgt.dependencies))

    trgt.touch()


@target('build/lint-stamp', SRC, EXAMPLES_SRC_JS)
def build_lint_src_timestamp(trgt):
    """Lint source
    """
    trgt.run('%(GJSLINT)s',
             '--jslint_error=all',
             '--strict',
             trgt.newer(trgt.dependencies))
    trgt.touch()


@target('serve', COMPILED_DEPS)
def run_example_server(trgt):

    PORT = 8000

    class ThreadedTCPServer(SocketServer.ThreadingMixIn,
                            SocketServer.TCPServer):
        """Threaded socket server"""
        pass

    httpd = ThreadedTCPServer(("", PORT), MyHandler)

    try:
        print "Starting at port 8000"
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass


@target('checkdeps')
def check_dependencies(trgt):
    """Check for missing binary executables
    """
    for exe in EXECUTABLES:
        status = 'present' if which(exe) else 'MISSING'
        print 'Program "%s" seems to be %s.' % (exe, status)
    print 'For certain targets all above programs need to be present.'


@target('examples/stable/js/timestamp')

def prepareExamples(trgt):
    """Prepare examples enviroment
    """
    ## FIXME: Copy test data should be there

    # copy react lib to examples/stable/js
    shutil.copy(os.path.join('bower_components', 'react', 'build','react.min.js'),
              os.path.join('examples', 'stable','js'))

    # copy proj4js lib to examples/stable/js
    shutil.copy(os.path.join('bower_components', 'proj4js', 'dist','proj4.js'),
              os.path.join('examples', 'stable','js'))

@target('build/examples/loader.js',
        EXAMPLES_SRC,
        EXAMPLES_SRC_JS)
def compile_example_javascripts(trgt):
    """compile examples into single files
    """
    trgt.rm_rf('build/examples')
    trgt.makedirs('build/examples')
    trgt.makedirs('build/examples/js')
    trgt.makedirs('build/examples/fonts')

    # copy fontawesome fonts
    for root, dirs, files in os.walk(os.path.join('bower_components',
                                                  'font-awesome', 'fonts')):
        for filen in files:
            shutil.copy(os.path.join(root, filen),
                        os.path.join('build', 'examples', 'fonts'))

    # copy react lib
    shutil.copy(os.path.join('bower_components', 'react', 'build','react.min.js'),
              os.path.join('build', 'examples','js'))

    # copy proj4js lib
    shutil.copy(os.path.join('bower_components', 'proj4js', 'dist','proj4.js'),
              os.path.join('build', 'examples','js'))

    # copy input static data
    trgt.cp_r(os.path.join('examples', 'stable', 'data'),
               os.path.join('build', 'examples', 'data'))

    # minify css by gulp
    trgt.run('%(GULP)s', 'minify-css')

    # copy project css
    trgt.cp(os.path.join('css', 'mapito.css'),
            os.path.join('build', 'examples', 'css', 'mapito.css'))

    trgt.cp(os.path.join('examples', 'stable', 'loader-static.js'),
            os.path.join('build', 'examples', 'loader.js'))

    for html in EXAMPLES_SRC:
        (html_path, html_name) = os.path.split(html)
        jsf = html_name.replace('.html', '.js')
        trgt.cp(os.path.join('examples', 'stable', html_name),
                os.path.join('build', 'examples', html_name))
        js_out = 'build/examples/' + jsf

        tar = targets.get(js_out)
        tar.mode = 'ADVANCED'
        tar.build()


def example_factory(js_out, js_in):
    """Create build target for given js_in and js_out file names
    """

    @target(js_out, js_in, SRC)
    def compile_example(trgt):
        """Compile example
        """
        mode = 'SIMPLE'
        if hasattr(trgt, 'mode'):
            mode = trgt.mode
        compile_lib(trgt, mode, inputs=[trgt.dependencies[0]])

# create examples targets
EXAMPLES_OUT = []
for js_in in EXAMPLES_SRC_JS:
    js_out = js_in.replace('examples/stable', 'build/examples')
    EXAMPLES_OUT.append(js_out)
    example_factory(js_out, js_in)

virtual('lint', 'build/lint-stamp')
virtual('fix', 'build/fix-stamp')
virtual('lib', 'fix', 'lint', COMPILED,
        COMPILED_WHITESPACE, COMPILED_SIMPLE)
virtual('build', 'lib', 'buildexamples')
virtual('buildexamples', 'build/examples/loader.js')
virtual('server', 'serve')
virtual('examples', 'build', 'serve')
virtual('clean', 'cleanBuild')
virtual('dev', 'cleanBower', 'cleanNode', 'installNode', 'installBower', 'examples/stable/js/timestamp')
virtual('relib', 'cleanBuild', 'build')


@target('help')
def print_help(trgt):
    """Print help short help message and exit
    """

    print """
    Pmake build system for GeoSense mapping library

    help    - this help message

    dev - !!! First what you need to do !!!
          It downloads node and bower dependencies
          Copy javascripts to example directory

    clean   - Delete build/ content

    server  - Example server

    lib   - Build the library
        build/deps              - Build deps file

    relib - Delete build and Build the library and examples

    examples    - Build config files for examples and run the server
    compileexamples - Build javascripts with examples

    checkdeps   - Checks whether all required development software is
                     installed on your machine.

    Needed executables:
        jar, java, python, git, gjslint

    """
main()
