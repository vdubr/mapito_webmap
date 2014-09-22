#!/usr/bin/env python
""" JSON Schema validator
@autor: Jachym Cepicky
"""

from optparse import OptionParser
import sys
import os
import json
sys.path.insert(0, 'resources/jsonschema/')

from jsonschema import validate


def validate_json(inputdata, schemadata):
    """Validate json data
    """
    #try:
    validate(json.loads(inputdata), json.loads(schemadata))
    #except SchemaError, except_:
    #    print "SchemaError: %s" % except_.message


def main(options):
    """Main function, get files and run validate_json
    """

    infile = None
    schemafile = None

    if options.input == '-':
        infile = sys.stdin
    elif os.path.isfile(options.input):
        infile = open(options.input)

    if options.schema and os.path.isfile(options.schema):
        schemafile = open(options.schema)

    if infile and schemafile:
        validate_json(infile.read(), schemafile.read())
        print "OK"
    else:
        print "\n"
        if infile is None:
            print """ERROR: Could not open INPUT '%s'\n""" % (options.input)
        if schemafile is None:
            print """ERROR: Could not open SCHEMA '%s'\n""" % (options.schema)
        sys.exit(1)

if __name__ == '__main__':
    PARSER_ = OptionParser()
    PARSER_.add_option('-i', '--input', dest='input', default='-',
                       help='input file or data stream')
    PARSER_.add_option('-s', '--schema', dest='schema',
                       help='input file with schema')
    (OPTIONS, ARGS) = PARSER_.parse_args()
    main(OPTIONS)
