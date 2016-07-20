
Fs = require 'fs'
Parser = require './Parser'

read = no
file = null
process.argv.forEach (val) ->
    if read
        file = val
        read = no
    else
        read = yes if val is '-f'

process.exit 1 if not file?

parser = new Parser
buff = Fs.readFileSync file

console.log parser.makeHtml buff.toString()

