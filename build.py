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
    variables.PYTHON = 'python.exe'
    variables.JAVA = 'java.exe'
    variables.BOWER = 'bower.cmd'
    variables.GIT = 'git.exe'
    variables.GJSLINT = 'gjslint.exe'
    variables.CASPERJS = 'casperjs.exe'
else:
    variables.GULP = 'gulp'
    variables.GRUNT = 'grunt'
    variables.NPM = 'npm'
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
               variables.GIT, variables.GJSLINT, variables.CASPERJS]

# SRC = [path for path in ifind('src/mapito') if path.endswith('.js')]
SRC = [path for path in ifind('src/mapito') if (path.endswith('.js') and not(path.startswith('src/mapito/templates_/')))]

TEST_SRC = [path for path in ifind('test/specs') if path.endswith('.js')]
TEMPLATES_SRC = [path for path in ifind(os.path.join('src', 'mapito', 'tmpl'))
                 if path.endswith('.soy')]
EXAMPLES_SRC = [path for path in ifind(os.path.join('examples', 'stable'))
                if path.endswith('.html')]
EXAMPLES_SRC_JS = [path.replace('.html', '.js') for path in EXAMPLES_SRC]
EXAMPLES_SANDBOX_SRC = [path for path in ifind(os.path.join('examples',
                                                            'sandbox'))
                        if path.endswith('.html')]
EXAMPLES_SANDBOX_SRC_JS = [path.replace('.html', '.js')
                           for path in EXAMPLES_SANDBOX_SRC]
JSDOC_SRC = [path for path in ifind('src') if path.endswith('.jsdoc')]
EXPORTS = [path for path in ifind('src')
           if path.endswith('.exports')]
OL_EXTERNS = [path for path in ifind(os.path.join(
    'bower_components', 'openlayers3', 'externs'))
    if path.endswith('.js')]

REACT_EXTERNS = [os.path.join(
    'bower_components', 'react-externs', 'externs.js')]

COMPILED = 'build/lib/mapito.js'
COMPILED_WHITESPACE = 'build/lib/mapito-space.js'
COMPILED_DEPS = 'build/lib/deps'
COMPILED_SIMPLE = 'build/lib/mapito-simple.js'
BUILDS = [COMPILED, COMPILED_SIMPLE, COMPILED_WHITESPACE]
APIDOC = 'build/doc/apidoc'
DOC = 'build/doc/'
TEMPLATES_STAMP = os.path.join('build', 'templates', 'time_stamp')


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


@target(os.path.join(APIDOC, 'index.html'),
        SRC,
        'build/src/exports.js',
        'build/src/typedefs.js')
def build_apidoc(trgt):
    """Generates API documentation
    """
    trgt.run('%(JSDOC)s', '-c', 'doc/conf.json',
             'src', 'bower_components/openlayers3/src/',
             'doc/index.md',
             '-d', APIDOC)
    trgt.touch()


@target('test_apidoc', SRC, TEST_SRC)
def test_apidoc(trgt):
    "!! Currently not used !!"
    trgt.run('%(JSDOC)s', '-c', 'doc/conf.json',
             'src', 'doc/index.md', '-T')


@target('build/test_lib', SRC, TEST_SRC, COMPILED_SIMPLE)
def test_lib(trgt):
    """ Running casperjs tests
    """

    includes = ','.join([os.path.join('build', 'lib', 'mapito-simple.js'),
                         os.path.join('bower_components', 'closure-library',
                                      'closure', 'goog', 'base.js')])
    tests_src = os.path.join('test',
                             'specs',
                             sys.argv[2]) if (len(sys.argv) > 2) else TEST_SRC

    trgt.run('%(CASPERJS)s',
             'test',
             '--includes=' + includes,
             tests_src)


@target('build/api_data', SRC, TEST_SRC, COMPILED)
def test_api(trgt):
    """ Update api data
    """

    trgt.rm_rf('examples/stable/data/gp2/')
    includes = ','.join([os.path.join('build', 'lib', 'mapito.js'),
                         os.path.join('bower_components',
                                      'closure-library',
                                      'closure',
                                      'goog',
                                      'base.js')])
    api_version = sys.argv[2] if (len(sys.argv)>2) else "api"

    trgt.run('%(CASPERJS)s',
             'test',
             '--web-security=no',
             '--includes=' + includes,
             'test/api/load.test.js',
             '--gp-id=23',
             '--gp-api='+api_version)
    trgt.run('%(CASPERJS)s',
             'test',
             '--web-security=no',
             '--includes=' + includes,
             'test/api/load.test.js',
             '--gp-id=11372',
             '--gp-api='+api_version)

@target('build/api_pretty_json', SRC, TEST_SRC, COMPILED)
def test_api_json(trgt):
    """ Pretty print json from api response
    """

    path = 'examples/stable/data/gp2/'
    subdirs = [x[0] for x in os.walk(path)]
    for subdir in subdirs:
        files = os.walk(subdir).next()[2]
        if (len(files) > 0):
            for file in files:
                filepath = subdir + "/" + file
                jsonFileR = open(filepath, 'r')
                parsed = json.load(jsonFileR)
                prettyJSON = json.dumps(parsed, indent=2, sort_keys=False)
                jsonFileR.close()

                jsonFileW = open(filepath, 'w')
                jsonFileW.truncate()
                jsonFileW.write(prettyJSON)
                jsonFileW.close()


@target(COMPILED, SRC, 'build/templates/time_stamp', COMPILED_DEPS)
def compile_lib_advanced(trgt):
    """Compile lib in advanced mode
    """
    compile_lib(trgt, 'ADVANCED')


@target(COMPILED_SIMPLE, SRC, 'build/templates/time_stamp', COMPILED_DEPS)
def compile_lib_simple(trgt):
    """Compile lib in simple mode
    """
    compile_lib(trgt, 'SIMPLE')


@target(COMPILED_WHITESPACE, SRC, 'build/templates/time_stamp', COMPILED_DEPS)
def compile_lib_whitespace(trgt):
    """Compile lib in whitespace mode
    """
    compile_lib(trgt, 'WHITESPACE_ONLY')


@target(COMPILED_DEPS, SRC, 'build/templates/time_stamp')
def compile_lib_deps(trgt):
    """Compile dependencies
    """

    trgt.makedirs('build/cfg')

    trgt.output('%(PYTHON)s',
                '%(BUILDER)s',
                '--compiler_jar=%(CLOSURE_JAR)s',
                '--root=bower_components/closure-library/closure/goog',
                '--root=bower_components/closure-templates/',
                '--root=bower_components/closure-library/' +
                'third_party/closure/goog',
                '--root=bower_components/openlayers3/src/ol',
                '--root=bower_components/openlayers3/externs',
                '--root=src/mapito',
                '--root=build/templates/',
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


@target('build/templates/time_stamp')
def make_tests_cfg(trgt):
    """generate templates javascript files
    """
    trgt.makedirs(os.path.join('build', 'templates'))
    trgt.touch()


@target('cleanBuild')
def clean_build(trgt):
    """Clean build directory
    """
    trgt.rm_rf('build/')


@target('clean_bower')
def clean_bower(trgt):
    """Clean bower_components directory
    """
    trgt.rm_rf('bower_components')


@target('build/doc')
def mk_docdir(trgt):
    """Make doc directory
    """
    trgt.makedirs('build/doc')

@target('testtest', SRC, TEST_SRC, EXAMPLES_SRC_JS)
def build_fix_src_timestamp(trgt):
  print("addd")

@target('build/fix-stamp', SRC, TEST_SRC, EXAMPLES_SRC_JS)
def build_fix_src_timestamp(trgt):
    """Run fix js style
    """

    print(trgt.newer(trgt.dependencies))

    print("_____________________________________________________")

    trgt.run('fixjsstyle',
             '--jslint_error=all',
             '--strict',
             trgt.newer(trgt.dependencies))


    print("lkjehfdklashdflkahsdflkahsdfklashjfklajhdflkajhsdfklashdflkhj")
    trgt.touch()


@target('build/lint-stamp', SRC, TEST_SRC, EXAMPLES_SRC_JS)
def build_lint_src_timestamp(trgt):
    """Lint source
    """
    trgt.run('%(GJSLINT)s',
             '--jslint_error=all',
             '--strict',
             trgt.newer(trgt.dependencies))
    trgt.touch()


@target('retag')
def retag(trgt):
    if sys.platform == 'win32':
        trgt.run('bin\deletetag.cmd')
    else:
        trgt.run('sh', 'bin/deletetag.sh')
    trgt.run('%(GIT)s', 'fetch', '-p')


@target('updateBower', 'cleanBuild')
def bower(trgt):
    """Run bower install and update
    """
    trgt.run('%(BOWER)s', 'install')
    trgt.run('%(BOWER)s', 'update')


@target('gulp')
def initgulp(trgt):
    """Run gulp install
    """
    trgt.run('%(NPM)s', 'install')


@target('build/src/exports.js', EXPORTS, SRC)
def create_typedefs_file(trgt):
    """Create typedefs files
    """
    trgt.output('%(PYTHON)s', 'bin/generate-exports.py', '--exports', EXPORTS)


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


@target('build/examples/loader.js',
        'build/src/exports.js',
        EXAMPLES_SRC,
        EXAMPLES_SRC_JS)
def compile_example_javascripts(trgt):
    """compile examples into single files
    """
    trgt.rm_rf('build/examples')
    trgt.makedirs('build/examples')
    trgt.makedirs('build/examples/fonts')

    # copy fontawesome fonts
    for root, dirs, files in os.walk(os.path.join('bower_components',
                                                  'font-awesome', 'fonts')):
        for filen in files:
            shutil.copy(os.path.join(root, filen),
                        os.path.join('build', 'examples', 'fonts'))

    # copy bootstrap fonts
    for root, dirs, files in os.walk(os.path.join('bower_components',
                                                  'bootstrap', 'fonts')):
        for filen in files:
            shutil.copy(os.path.join(root, filen),
                        os.path.join('build', 'examples', 'fonts'))

    # copy roboto fonts
    for root, dirs, files in os.walk('fonts'):
        for filen in files:
            shutil.copy(os.path.join(root, filen),
                        os.path.join('build', 'examples', 'fonts'))

    # copy unip icons
    trgt.cp_r(os.path.join('examples', 'stable', 'unipicons'),
              os.path.join('build', 'examples', 'unipicons'))

    # copy style icons
    trgt.cp_r('img', os.path.join('build', 'examples', 'img'))

    # copy input static data
    trgt.cp_r(os.path.join('examples', 'stable', 'data'),
               os.path.join('build', 'examples', 'data'))
    trgt.cp_r(os.path.join('examples', 'stable', 'lang'),
              os.path.join('build', 'examples', 'lang'))

    # minify css by gulp
    trgt.run('%(GULP)s', 'minify-css')
    trgt.cp(os.path.join('examples', 'stable', 'css', 'local.css'),
            os.path.join('build', 'examples', 'css', 'local.css'))

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


@target('sandbox',
        'build/examples/loader.js',
        EXAMPLES_SANDBOX_SRC,
        EXAMPLES_SANDBOX_SRC_JS)
def compile_sandbox_examples(trgt):
    """compile sandboxs examples into single files
    """
    for html in EXAMPLES_SANDBOX_SRC:

        (html_path, html_name) = os.path.split(html)
        js_name = html_name.replace('.html', '.js')
        trgt.cp(html, os.path.join('build', 'examples'))

        tar_name = 'build/examples/' + js_name
        tar = targets.get(tar_name)
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


def template_factory(tmpl_in, tmpl_out):
    """Create build target for given template
    """

    @target(tmpl_out, tmpl_in, TEMPLATES_STAMP)
    def compile_template(trgt):
        """Compile template"""
        trgt.run('%(JAVA)s',
                 '-client',
                 '-XX:+TieredCompilation',
                 '-jar',
                 os.path.join('bower_components', 'closure-templates',
                              'SoyToJsSrcCompiler.jar'),
                 '--shouldDeclareTopLevelNamespaces', 'true',
                 '--shouldProvideRequireSoyNamespaces', 'true',
                 '--outputPathFormat', tmpl_out,
                 '--srcs', tmpl_in)
        trgt.touch()

# create examples targets
EXAMPLES_OUT = []
for js_in in EXAMPLES_SRC_JS:
    js_out = js_in.replace('examples/stable', 'build/examples')
    EXAMPLES_OUT.append(js_out)
    example_factory(js_out, js_in)

# create sandbox examples targets
EXAMPLES_SANDBOX_OUT = []
for js_in in EXAMPLES_SANDBOX_SRC_JS:
    js_out = js_in.replace('examples/sandbox', 'build/examples')
    EXAMPLES_SANDBOX_OUT.append(js_out)
    example_factory(js_out, js_in)

# create template targets
TEMPLATES_OUT = []
for tmpl_in in TEMPLATES_SRC:
    tmpl_out = tmpl_in.replace(
        'src/mapito/tmpl', 'build/templates').replace('.soy', '.js')
    TEMPLATES_OUT.append(tmpl_out)
    template_factory(tmpl_in, tmpl_out)


virtual('tests', 'buildexamples', 'test')
virtual('check', 'test')
virtual('test', 'build/test_lib')
virtual('templates', TEMPLATES_OUT)
virtual('testfull', 'relib', 'test')
virtual('test_doc', 'test_apidoc')
virtual('doc', 'userdoc', 'apidoc')
virtual('apidoc', os.path.join(APIDOC, 'index.html'))
virtual('userdoc', DOC)
virtual('lint', 'build/lint-stamp')
virtual('fix', 'build/fix-stamp')
virtual('lib', 'fix', 'lint', 'templates', COMPILED,
        COMPILED_WHITESPACE, COMPILED_SIMPLE)
virtual('librigid', 'lint', 'templates', COMPILED,
        COMPILED_WHITESPACE, COMPILED_SIMPLE)
virtual('build', 'gulp', 'updateBower', 'lib', 'buildexamples')
virtual('buildexamples', 'build/examples/loader.js')
virtual('server', 'serve')
virtual('examples', 'buildexamples', 'serve')
virtual('api', 'buildexamples', 'build/api_data',
        'build/api_pretty_json')
virtual('clean', 'cleanBuild', 'clean_bower')
virtual('relib', 'cleanBuild', 'lib', 'buildexamples')
virtual('jenkinsbuild', 'clean',
        'gulp', 'updateBower', 'librigid', 'buildexamples')
virtual('all', 'clean', 'build', 'test_doc', 'test')


@target('help')
def print_help(trgt):
    """Print help short help message and exit
    """

    print """
    Pmake build system for GeoSense mapping library

    help    - this help message
    all     - For everything: lib, doc, test,
    clean   - Delete build/ content
    server  - Example server
    api     - copy REST API to local repository

    doc     - API documentation and User documentation
        apidoc  - API documentation
        userdoc - User documentation

    test    - Run test suite
        build/test_lib - Test library
        build/test_doc - Test doc strings

    lib   - Build the library
        build/deps              - Build deps file

    relib - Delete build and Build the library and examples

    examples    - Build config files for examples and run the server
    compileexamples - Build javascripts with examples
    sandbox     - Build sandbox examples

    checkdeps   - Checks whether all required development software is
                     installed on your machine.

    updateBower - Pulling repository OL3, Closure, ..., rebuild

    Needed executables:
        jsdoc, casperjs, jar, java, python, git

    """
main()
