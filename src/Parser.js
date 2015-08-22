/**
 * Parser in ECMAScript 6
 *
 * @copyright Copyright (c) 2012 SegmentFault Team. (http://segmentfault.com)
 * @author Integ <integ@segmentfault.com>
 * @license BSD License
 */

import _ from 'lodash'
import md5 from 'md5'

class Parser {
    constructor () {
        this.commonWhiteList = 'kbd|b|i|strong|em|sup|sub|br|code|del|a|hr|small'
        this.specialWhiteList = {
            table:  'table|tbody|thead|tfoot|tr|td|th'
        }
        this.footnotes = []
        this.blocks = []
        this.current = 'normal'
        this.pos = -1
        this.definitions = []
        this.hooks = {}
        this.holders = {}
        this.uniqid = md5((new Date()).getTime())
        this.id = 0
    }

    /**
     * makeHtml
     *
     * @param mixed text
     * @return string
     */
    makeHtml (text) {
        text = this.initText(text)
        let html = this.parse(text)
        return this.makeFootnotes(html)
    }

    /**
     * @param type
     * @param callback
     */
    hook (type, callback) {
        this.hooks[type] = callback
    }

    /**
     * @param text
     * @return mixed
     */
    initText (text) {
        text = text.replace('\t', '    ')
        text = text.replace('\r', '')
        return text;
    }

    /**
     * @param html
     * @return string
     */
    makeFootnotes (html) {
        if (this.footnotes.length > 0) {
            html += '<div class="footnotes"><hr><ol>'
            let index = 1
            let val = this.footnotes.pop()
            while (val) {
                if (typeof val === 'string') {
                    val += ` <a href="#fnref-${index}" class="footnote-backref">&#8617;</a>`
                } else {
                    val[val.length - 1] += ` <a href="#fnref-${index}" class="footnote-backref">&#8617;</a>`
                    val = val.length > 1 ? this.parse(val.join("\n")) : this.parseInline(val[0])
                }

                html += `<li id="fn-${index}">${val}</li>`

                index++
            }
            html += '</ol></div>'
        }
        return html
    }

    /**
     * parse
     *
     * @param string text
     * @return string
     */
    parse (text) {
        let lines = text.split("\n")
        let blocks = this.parseBlock(text, lines)
        let html = ''

        blocks.forEach (block => {
            let [type, start, end, value] = block
            let extract = lines.slice(start, end - start + 1)
            let method = 'parse' + _.capitalize(type)

            extract = this.call('before' + _.capitalize(method), extract, value)
            let result = this[method](extract, value)
            result = this.call('after' + _.capitalize(method), result, value)

            html += result
        })

        return html
    }

    /**
     * @param type
     * @param value
     * @return mixed
     */
    call (type, ...value) {
        if (!this.hooks[type]) {
            return value[0]
        }

        let args = value

        this.hooks[type].forEach (callback => {
            value = callback(args)
            args[0] = value
        })

        return value[0]
    }

    /**
     * @param str
     * @return string
     */
    makeHolder (str) {
        let key = '|' + this.uniqid + this.id + '|'
        this.id++
        this.holders[key] = str;

        return key;
    }

    /**
     * @param text
     * @return string
     */
    releaseHolder(text) {
        _.forOwn(this.holders, (value, key) => {
            text = text.replace(key, value)
        })
        this.holders = [];

        return text;
    }

    /**
     * parseInline
     *
     * @param string text
     * @param string whiteList
     * @return string
     */
    parseInline (text, whiteList = '') {
        text = this.call('beforeParseInline', text)

        // code
        let codeMatches = /(^|[^\\])`(.+?)`/.exec(text)
        if (codeMatches) {
            text = codeMatches[1] + this.makeHolder('<code>' + htmlspecialchars(codeMatches[2]) + '</code>')
        }

        // escape unsafe tags
        let unsafeTagMatches = /<(\/?)([a-z0-9-]+)(\s+[^>]*)?>/i.exec(text)
        if (unsafeTagMatches) {
            let whiteLists = this.commonWhiteList + '|' + whiteList
            if (whiteLists.toLowerCase().indexOf(unsafeTagMatches[2].toLowerCase()) !== -1) {
                return this.makeHolder(unsafeTagMatches[0])
            } else {
                return htmlspecialchars(unsafeTagMatches[0])
            }
        }

        text = text.replace('<', '&lt;')
        text = text.replace('>', '&gt;')

        // footnote  \[\^((?:[^\]]|\\]|\\[)+?)\]
        let footnotePattern = new RegExp("[^((?:[^]]|\]|\[)+?)]")
        let footnoteMatches = footnotePattern.exec(text)
        if(footnoteMatches) {
            id = this.footnotes.indexOf(footnoteMatches[1])

            if (id === -1) {
                id = this.footnotes.length + 1
                this.footnotes[id] = footnoteMatches[1]
            }

            text = this.makeHolder(`<sup id="fnref-${id}"><a href="#fn-${id}" class="footnote-ref">${id}</a></sup>`)
        }

        // image
        let imagePattern1 = new RegExp("![((?:[^]]|\]|\[)*?)](([^)]+))")
        let imageMatches1 = imagePattern1.exec(text)
        if (imageMatches1) {
            let escaped = this.escapeBracket(imageMatches1[1])
            text = this.makeHolder(`<img src="${imageMatches1[2]}" alt="${escaped}" title="${escaped}">`)
        }

        let imagePattern2 = new RegExp("![((?:[^]]|\]|\[)*?)][((?:[^]]|\]|\[)+)]")
        let imageMatches2 = imagePattern2.exec(text)
        if(imageMatches2) {
            let escaped = this.escapeBracket(imageMatches2[1])
            let result = ''
            if(this.definitions[imageMatches2[2]]) {
                result = `<img src="${this.definitions[imageMatches2[2]]}" alt="${escaped}" title="${escaped}">`
            } else {
                result = escaped
            }
            text = this.makeHolder(result)
        }

        // link
        let linkPattern1 = new RegExp("[((?:[^]]|\]|\[)+?)](([^)]+))")
        let linkMatches1 = linkPattern1.exec(text)
        if(linkMatches1) {
            let escaped = this.escapeBracket(linkMatches1[1])
            text = this.makeHolder(`<a href="${linkMatches1[2]}">${escaped}</a>`)
        }

        let linkPattern2 = new RegExp("[((?:[^]]|\]|\[)+?)][((?:[^]]|\]|\[)+)]")
        let linkMatches2 = linkPattern2.exec(text)
        if(linkMatches2) {
            let escaped = this.escapeBracket(linkMatches2[1])

            let result = this.definitions[linkMatches2[2]] ?
                `<a href="${this.definitions[linkMatches2[2]]}">${escaped}</a>`
                : escaped

            text = this.makeHolder(result)
        }

        // escape
        let escapeMatches = /\\(`|\*|_)/.exec(text)
        if (escapeMatches) {
            text = this.makeHolder(htmlspecialchars(escapeMatches[1]))
        }

        // strong and em and some fuck
        text = text.replace(/(\s|^)(_|\*){3}(.+?)\1{3}(\s|$)/, "$1<strong><em>$3</em></strong>$4")
        text = text.replace(/(\s|^)(_|\*){2}(.+?)\1{2}(\s|$)/, "$1<strong>$3</strong>$4")
        text = text.replace(/(\s|^)(_|\*)(.+?)\1(\s|$)/, "$1<em>$3</em>$4")
        text = text.replace(/<(https?:\/\/.+)>/i, "<a href=\"$1\">$1</a>")

        // autolink
        text = text.replace(/(^|[^\"])((http|https|ftp|mailto):[_a-z0-9-\.\/%#@\?\+=~\|\,]+)($|[^\"])/i,
            "$1<a href=\"$2\">$2</a>$4")

        // release
        text = this.releaseHolder(text)

        text = this.call('afterParseInline', text)

        return text
    }

    /**
     * parseBlock
     *
     * @param string text
     * @param array lines
     * @return array
     */
    parseBlock (text) {
        let lines = text.split("\n")
        this.blocks = []
        this.current = 'normal'
        this.pos = -1
        let special = Object.keys(this.specialWhiteList).join("|")
        let emptyCount = 0

        // analyze by line
        for (let key in lines) {
            let line = lines[key]
            console.log(key)
            console.log(line)
            // code block is special
            if (matches = line.match("/^(~|`){3,}([^`~]*)$/i")) {
                if (this.isBlock('code')) {
                    this.setBlock(key)
                        .endBlock()
                } else {
                    this.startBlock('code', key, matches[2])
                }
                continue
            } else if (this.isBlock('code')) {
                this.setBlock(key)
                continue
            }

            // html block is special too
            if (matches = line.match(/^\s*<({$special})(\s+[^>]*)?>/i)) {
                tag = matches[1].toLowerCase()
                if (!this.isBlock('html', tag) && !this.isBlock('pre')) {
                    this.startBlock('html', key, tag)
                }

                continue
            } else if (matches = line.match(/<\/({$special})>\s*$/i)) {
                tag = matches[1].toLowerCase()

                if (this.isBlock('html', tag)) {
                    this.setBlock(key)
                        .endBlock()
                }

                continue
            } else if (this.isBlock('html')) {
                this.setBlock(key)
                continue
            }

            switch (true) {
                // list
                case /^(\s*)((?:[0-9a-z]\.)|\-|\+|\*)\s+/.test(line):
                    let matches = line.match(/^(\s*)((?:[0-9a-z]\.)|\-|\+|\*)\s+/)
                    let listSpace = matches[1].length
                    let emptyCount = 0

                    // opened
                    if (this.isBlock('list')) {
                        this.setBlock(key, space)
                    } else {
                        this.startBlock('list', key, listSpace)
                    }
                    break

                // footnote
                case /^\[\^((?:[^\]]|\]|\[)+?)\]:/.test(line):
                    let footnoteMatches = line.match(/^\[\^((?:[^\]]|\]|\[)+?)\]:/)
                    let footnoteSpace = footnoteMatches[0].length - 1
                    this.startBlock('footnote', key, [footnoteSpace, footNoteMatches[1]])
                    break

                // definition
                case /^\s*\[((?:[^\]]|\]|\[)+?)\]:\s*(.+)$/.test(line):
                    let definitionMatches = line.match(/^\s*\[((?:[^\]]|\]|\[)+?)\]:\s*(.+)$/)
                    this.definitions[definitionMatches[1]] = definitionMatches[2]
                    this.startBlock('definition', key)
                        .endBlock()
                    break

                // pre
                case /^ {4,}/.test(line):
                    emptyCount = 0
                    if (this.isBlock('pre')) {
                        this.setBlock(key)
                    } else if (this.isBlock('normal')) {
                        this.startBlock('pre', key)
                    }
                    break

                // table
                case /^((?:(?:(?:[ :]*\-[ :]*)+(?:\||\+))|(?:(?:\||\+)(?:[ :]*\-[ :]*)+)|(?:(?:[ :]*\-[ :]*)+(?:\||\+)(?:[ :]*\-[ :]*)+))+)$/.test(line):
                    let tableMatches = line.match(/^((?:(?:(?:[ :]*\-[ :]*)+(?:\||\+))|(?:(?:\||\+)(?:[ :]*\-[ :]*)+)|(?:(?:[ :]*\-[ :]*)+(?:\||\+)(?:[ :]*\-[ :]*)+))+)$/)
                    if (this.isBlock('normal')) {
                        let block = this.getBlock()
                        let head = false

                        if (block.length === 0 || block[0] !== 'normal' || /^\s*$/.exec(lines[block[2]])) {
                            this.startBlock('table', key)
                        } else {
                            head = true
                            this.backBlock(1, 'table')
                        }

                        if (tableMatches[1][0] == '|') {
                            tableMatches[1] = tableMatches[1].substr(1)

                            if (tableMatches[1][tableMatches[1].length - 1] == '|') {
                                tableMatches[1] = tableMatches[1].substr(0, -1)
                            }
                        }

                        let rows = tableMatches[1].split(/(\+|\|)/)
                        let aligns = []
                        for(let row of rows) {
                            let align = 'none'

                            if (tableMatches = row.match(/^\s*(:?)\-+(:?)\s*$/)) {
                                if (!tableMatches[1] && !tableMatches[2]) {
                                    align = 'center'
                                } else if (!tableMatches[1]) {
                                    align = 'left'
                                } else if (!tableMatches[2]) {
                                    align = 'right'
                                }
                            }

                            aligns.push(align)
                        }

                        this.setBlock(key, [head, aligns])
                    }
                    break

                // single heading
                case /^(#+)(.*)$/.test(line):
                    let singleHeadingMatches = line.match(/^(#+)(.*)$/)
                    let num = Math.min(singleHeadingMatches[1].length, 6)
                    this.startBlock('sh', key, num)
                        .endBlock()
                    break

                // multi heading
                case /^\s*((=|-){2,})\s*$/.test(line)
                    && (this.getBlock() && !/^\s*$/.test(lines[this.getBlock()[2]])):    // check if last line isn't empty
                    let multiHeadingMatches = line.match(/^\s*((=|-){2,})\s*$/)
                    if (this.isBlock('normal')) {
                        this.backBlock(1, 'mh', multiHeadingMatches[1][0] == '=' ? 1 : 2)
                            .setBlock(key)
                            .endBlock()
                    } else {
                        this.startBlock('normal', key)
                    }
                    break

                // block quote
                case /^>/.test(line):
                    if (this.isBlock('quote')) {
                        this.setBlock(key)
                    } else {
                        this.startBlock('quote', key)
                    }
                    break

                // hr
                case /^[-\*]{3,}\s*$/.test(line):
                    this.startBlock('hr', key)
                        .endBlock()
                    break

                // normal
                default:
                    if (this.isBlock('list')) {
                        let matches = line.match(/^(\s*)/)

                        if (line.length == matches[1].length) { // empty line
                            if (emptyCount > 0) {
                                this.startBlock('normal', key)
                            } else {
                                this.setBlock(key)
                            }

                            emptyCount++
                        } else if (matches[1].length >= this.getBlock()[3] && emptyCount == 0) {
                            this.setBlock(key)
                        } else {
                            this.startBlock('normal', key)
                        }
                    } else if (this.isBlock('footnote')) {
                        let matches = line.match(/^(\s*)/)

                        if (matches[1].length >= this.getBlock()[3][0]) {
                            this.setBlock(key)
                        } else {
                            this.startBlock('normal', key)
                        }
                    } else if (this.isBlock('table')) {
                        if (-1 !== line.indexOf('|')) {
                            this.setBlock(key)
                        } else {
                            this.startBlock('normal', key)
                        }
                    } else if (this.isBlock('pre')) {
                        if (/^\s*$/.test(line)) {
                            if (emptyCount > 0) {
                                this.startBlock('normal', key)
                            } else {
                                this.setBlock(key)
                            }

                            emptyCount++
                        } else {
                            this.startBlock('normal', key)
                        }
                    } else {
                        let block = this.getBlock()
                        console.log(block)
                        if (!block || block[0] !== 'normal') {
                            this.startBlock('normal', key)
                        } else {
                            this.setBlock(key)
                        }
                    }
                    break
            }
        }

        return this.optimizeBlocks(this.blocks, lines)
    }

    /**
     * @param array blocks
     * @param array lines
     * @return array
     */
    optimizeBlocks(blocks, lines) {
        blocks = this.call('beforeOptimizeBlocks', blocks, lines)

        _.forOwn(blocks, (block, key) => {
            let prevBlock = blocks[key - 1] ? blocks[key - 1] : null
            let nextBlock = blocks[key + 1] ? blocks[key + 1] : null

            let [type, from, to] = block

            if ('pre' === type) {
                let isEmpty = lines.reduce(function (result, line) {
                    return line.match("/^\s*$/") && result;
                }, true);

                if (isEmpty) {
                    block[0] = type = 'normal'
                }
            }

            if ('normal' === type) {
                // one sigle empty line
                if (from === to && lines[from].match(/^\s*$/)
                    && prevBlock && nextBlock) {
                    if (prevBlock[0] === 'list' && nextBlock[0] === 'list') {
                        // combine 3 blocks
                        blocks[key - 1] = ['list', prevBlock[1], nextBlock[2], null]
                        array_splice(blocks, key, 2)
                    }
                }
            }
        })

        return this.call('afterOptimizeBlocks', blocks, lines)
    }

    /**
     * parseCode
     *
     * @param array lines
     * @param string lang
     * @return string
     */
    parseCode(lines, lang) {
        lang = lang.trim()
        lines = lines.slice(1, -1)

        return '<pre><code' + (lang ? ` class="${lang}"` : '') + '>'
            . htmlspecialchars(lines.join("\n")) + '</code></pre>'
    }

    /**
     * parsePre
     *
     * @param array lines
     * @return string
     */
    parsePre(lines) {
        for (let line of lines) {
            line = htmlspecialchars(line.substr(4))
        }

        return '<pre><code>' + lines.join("\n") + '</code></pre>'
    }

    /**
     * parseSh
     *
     * @param array lines
     * @param int num
     * @return string
     */
    parseSh(lines, num) {
        console.log(lines)
        if(lines[0]) {
            let line = this.parseInline(lines[0].trim().replace(/^#+|#+$/g, ''))
            return line.match(/^\s*$/) ? '' : `<h${num}>${line}</h${num}>`
        } else {
            return `<h${num}></h${num}>`
        }
    }

    /**
     * parseMh
     *
     * @param array lines
     * @param int num
     * @return string
     */
    parseMh(lines, num) {
        let line = this.parseInline(lines[0].trim().replace(/^#+|#+$/g, ''))
        return `<h${num}>${line}</h${num}>`
    }

    /**
     * parseQuote
     *
     * @param array lines
     * @return string
     */
    parseQuote(lines) {
        for (let line of lines) {
            line = line.replace(/^> ?/, '')
        }

        return '<blockquote>' + this.parse(lines.join("\n")) + '</blockquote>'
    }

    /**
     * parseList
     *
     * @param array lines
     * @return string
     */
    parseList(lines) {
        html = ''
        minSpace = 99999
        rows = []

        // count levels
        _.forOwn (lines, (line, key) => {
            let matches = line.match(/^(\s*)((?:[0-9a-z]\.?)|\-|\+|\*)(\s+)(.*)$/)
            if (matches) {
                let space = matches[1].length
                let type = (-1 !== matches[2].indexOf('+-*')) ? 'ul' : 'ol'
                minSpace = Math.min(space, minSpace)

                rows.push([space, type, line, matches[4]])
            } else {
                rows.push(line)
            }
        })

        let found = false
        let secondMinSpace = 99999
        for (let row of rows) {
            if (Array.isArray(row) && row[0] != minSpace) {
                secondMinSpace = min(secondMinSpace, row[0])
                found = true
            }
        }
        secondMinSpace = found || minSpace

        let lastType = ''
        let leftLines = []

        for (let row of rows) {
            if (Array.isArray(row)) {
                let [space, type, line, text] = row

                if (space !== minSpace) {
                    let pattern = new RegExp("^\s{" + secondMinSpace + "}")
                    leftLines.push(line.replace(pattern, ''))
                } else {
                    if (lastType !== type) {
                        if (lastType) {
                            html += `</${lastType}>`
                        }

                        html += `<${type}>`
                    }

                    if (leftLines) {
                        html += "<li>" + this.parse(leftLines.join("\n")) + "</li>"
                    }

                    leftLines = [text]
                    lastType = type
                }
            } else {
                let pattern = new RegExp("^\s{" + secondMinSpace + "}")
                leftLines.push(row.replace(pattern, ''))
            }
        }

        if ($leftLines) {
            html += "<li>" + this.parse(lefftLines.join("\n")) + `</li></${lastType}>`
        }

        return html
    }

    /**
     * @param array lines
     * @param array value
     * @return string
     */
    parseTable(lines, value) {
        let [head, aligns] = value
        let ignore = head ? 1 : 0

        let html = '<table>'
        let body = null

        // function* entries(obj) {
        //   for (let key of Object.keys(obj)) {
        //     yield [key, obj[key]];
        //   }
        // }
        for (let [key, line] of lines) {
            if (key === ignore) {
                head = false
                body = true
                continue
            }

            if (line[0] === '|') {
                line = line.substr( 1)
                if (line[line.length - 1] === '|') {
                    line = line.substr(0, -1)
                }
            }

            line = line.replace(/^(\|?)(.*?)\\1$/, "$2", line)
            rows = line.split('|').map(function(item){return item.trim()})
            let columns = []
            let last = -1

            for (let row of rows) {
                if (row.length > 0) {
                    last++
                    columns[last] = [1, row]
                } else if (columns[last]) {
                    columns[last][0]++
                }
            }

            if (head) {
                html += '<thead>'
            } else if (body) {
                html += '<tbody>'
            }

            html += '<tr>'

            _.forOwn (columns, (column, key) => {
                let [num, text] = column
                let tag = head ? 'th' : 'td'

                html += `<${tag}`
                if (num > 1) {
                    html += ` colspan="${num}"`
                }

                if (aligns[key] && aligns[key] != 'none') {
                    html += ` align="${aligns[key]}"`
                }

                html += '>' + this.parseInline(text) + `</${tag}>`
            })

            html += '</tr>'

            if (head) {
                html += '</thead>'
            } else if (body) {
                body = false
            }
        }

        if (body !== null) {
            html += '</tbody>'
        }

        html += '</table>'
        return html
    }

    /**
     * parseHr
     *
     * @return string
     */
    parseHr() {
        return '<hr>'
    }

    /**
     * parseNormal
     *
     * @param array lines
     * @return string
     */
    parseNormal(lines) {
        for (let line of lines) {
            line = this.parseInline(line)
        }

        let str = lines.join("\n")
        str = str.replace(/(\n\s*){2,}/, "</p><p>")
        str = str.replace(/\n/, "<br>")

        return !str ? '' : `<p>${str}</p>`
    }

    /**
     * parseFootnote
     *
     * @param array lines
     * @param array value
     * @return string
     */
    parseFootnote(lines, value) {
        let [space, note] = value
        let index = this.footnotes.indexOf(note)

        if (false !== index) {
            lines[0] = lines[0].replace(/^\[\^((?:[^\]]|\]|\[)+?)\]:/, '')
            this.footnotes[index] = lines
        }

        return ''
    }

    /**
     * parseDefine
     *
     * @return string
     */
    parseDefinition() {
        return ''
    }

    /**
     * parseHtml
     *
     * @param array lines
     * @param string type
     * @return string
     */
    parseHtml(lines, type) {
        for (let line of lines) {
            line = this.parseInline(line,
                this.specialWhiteList[type] ? this.specialWhiteList[type] : '')
        }

        return lines.join("\n")
    }

    /**
     * @param str
     * @return mixed
     */
    escapeBracket(str) {
        return str.replace(['[', ']'], ['[', ']'])
    }

    /**
     * startBlock
     *
     * @param mixed type
     * @param mixed start
     * @param mixed value
     * @return this
     */
    startBlock(type, start, value = null) {
        this.pos++
        this.current = type
        this.blocks[this.pos] = [type, start, start, value]

        return this
    }

    /**
     * endBlock
     *
     * @return this
     */
    endBlock() {
        this.current = 'normal'
        return this
    }

    /**
     * isBlock
     *
     * @param mixed type
     * @param mixed value
     * @return bool
     */
    isBlock(type, value = null) {
        return this.current == type
            && (null === value ? true : this.blocks[this.pos][3] == value)
    }

    /**
     * getBlock
     *
     * @return array
     */
    getBlock() {
        console.log(this.pos)
        return this.blocks[this.pos] ? this.blocks[this.pos] : null
    }

    /**
     * setBlock
     *
     * @param mixed to
     * @param mixed value
     * @return this
     */
    setBlock(to = null, value = null) {
        console.log(this.blocks)
        if (null !== to) {
            this.blocks[this.pos][2] = to
        }

        if (null !== value) {
            this.blocks[this.pos][3] = value
        }

        return this
    }

    /**
     * backBlock
     *
     * @param mixed step
     * @param mixed type
     * @param mixed value
     * @return this
     */
    backBlock(step, type, value = null) {
        if (this.pos < 0) {
            return this.startBlock(type, 0, value)
        }

        let last = this.blocks[this.pos][2]
        this.blocks[this.pos][2] = last - step

        if (this.blocks[this.pos][1] <= this.blocks[this.pos][2]) {
            this.pos++
        }

        this.current = type
        this.blocks[this.pos] = [type, last - step + 1, last, value]

        return this
    }
}

var parser = new Parser()
console.log(parser.makeHtml('#qw#\n__sdsd__\nasfsadf'))
