
Fs = require 'fs'
Parser = require './Parser'

read = no
html = no
file = null
process.argv.forEach (val) ->
    html = yes if val is '-h'

    if read
        file = val
        read = no
    else
        read = yes if val is '-f'

process.exit 1 if not file?

parser = new Parser
parser.enableHtml yes if html
buff = Fs.readFileSync file

console.log parser.makeHtml buff.toString()

