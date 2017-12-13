
Fs = require 'fs'
Parser = require './Parser'

read = no
html = no
line = no
file = null
process.argv.forEach (val) ->
    return html = yes if val is '-h'
    return line = yes if val is '-l'

    if read
        file = val
        read = no
    else
        read = yes if val is '-f'

process.exit 1 if not file?

parser = new Parser
parser.enableHtml yes if html
parser.enableLine yes if line
buff = Fs.readFileSync file

console.log parser.makeHtml buff.toString()

