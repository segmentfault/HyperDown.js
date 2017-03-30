
class Parser

    # begin php function wrappers
    ucfirst = (str) ->
        (str.charAt 0).toUpperCase() + str.substring 1


    preg_quote = (str) -> str.replace /[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"

    
    str_replace = (search, replace, str) ->
        if search instanceof Array
            if replace instanceof Array
                for val, i in search
                    str = str_replace val, replace[i], str
            else
                for val in search
                    str = str_replace val, replace, str
        else
            search = preg_quote search
            str = str.replace (new RegExp search, 'g'), replace

        str


    htmlspecialchars = (str) ->
        str.replace /&/g, '&amp;'
            .replace /</g, '&lt;'
            .replace />/g, '&gt;'
            .replace /"/g, '&quot;'


    trim = (str, ch = null) ->
        if ch?
            search = ''
            for i in [0..ch.length - 1]
                c = ch[i]
                c = preg_quote c
                search += c

            search = '[' + search + ']*'
            str.replace (new RegExp '^' + search), ''
                .replace (new RegExp search + '$'), ''
        else
            str.replace /^\s*/, ''
                .replace /\s*$/, ''


    array_keys = (arr) ->
        result = []
        if arr instanceof Array
            result.push k for _, k in arr
        else
            result.push k for k of arr
        result


    array_values = (arr) ->
        result = []
        if arr instanceof Array
            result.push v for v in arr
        else
            result.push v for _, v of arr
        result
    
    # end php function wrappers


    constructor: ->
        @commonWhiteList = 'kbd|b|i|strong|em|sup|sub|br|code|del|a|hr|small'
        @specialWhiteList =
            table:  'table|tbody|thead|tfoot|tr|td|th'
        @hooks = {}
        @html = no

    
    # parse markdown text
    makeHtml: (text) ->
        @footnotes = []
        @definitions = {}
        @holders = {}
        @uniqid = (Math.ceil Math.random() * 10000000) + (Math.ceil Math.random() * 10000000)
        @id = 0

        text = @initText text
        html = @parse text
        html = @makeFootnotes html

        @call 'makeHtml', html


    enableHtml: (@html = yes) ->

    
    hook: (type, cb) ->
        @hooks[type] = [] if not @hooks[type]?
        @hooks[type].push cb

    
    makeHolder: (str) ->
        key = "|\r" + @uniqid + @id + "\r|"
        @id += 1
        @holders[key] = str
        key


    # clear all special chars
    initText: (text) ->
        text.replace /\t/g, '    '
            .replace /\r/g, ''

    
    makeFootnotes: (html) ->
        if @footnotes.length > 0
            html += '<div class="footnotes"><hr><ol>'
            index = 1

            while val = @footnotes.shift()
                if typeof val is 'string'
                    val += " <a href=\"#fnref-#{index}\" class=\"footnote-backref\">&#8617;</a>"
                else
                    val[val.length - 1] += " <a href=\"#fnref-#{index}\" class=\"footnote-backref\">&#8617;</a>"
                    val = if val.length > 1 then (@parse val.join "\n") else @parseInline val[0]

                html += "<li id=\"fn-#{index}\">#{val}</li>"
                index += 1

            html += '</ol></div>'

        html


    # parse text
    parse: (text) ->
        lines = []  # array ref
        blocks = @parseBlock text, lines
        html = ''

        for block in blocks
            [type, start, end, value] = block
            extract = lines.slice start, end + 1
            method = 'parse' + ucfirst type

            extract = @call ('before' + ucfirst method), extract, value
            result = @[method] extract, value
            result = @call ('after' + ucfirst method), result, value

            html += result

        html


    # call hook
    call: (type, args...) ->
        [value] = args
        return value if not @hooks[type]?

        for callback in @hooks[type]
            value = callback.apply @, args
            args[0] = value

        value


    # release holder
    releaseHolder: (text, clearHolders = yes) ->
        deep = 0

        while (text.indexOf "\r") >= 0 and deep < 10
            text = str_replace (array_keys @holders), (array_values @holders), text
            deep += 1

        @holders = {} if clearHolders
        text


    # parse inline
    parseInline: (text, whiteList = '', clearHolders = yes, enableAutoLink = yes) ->
        text = @call 'beforeParseInline', text 

        # code
        text = text.replace /(^|[^\\])(`+)(.+?)\2/mg, (matches...) =>
            matches[1] + @makeHolder '<code>' + (htmlspecialchars matches[3]) + '</code>'

        # escape
        text = text.replace /\\(.)/g, (matches...) =>
            escaped = htmlspecialchars matches[1]
            escaped = escaped.replace /\$/g, '&dollar;'
            @makeHolder escaped
        
        # link
        text = text.replace /<(https?:\/\/.+)>/ig, (matches...) =>
            url = @cleanUrl matches[1]
            link = @call 'parseLink', matches[1]

            @makeHolder "<a href=\"#{url}\">#{link}</a>"

        # encode unsafe tags
        text = text.replace /<(\/?)([a-z0-9-]+)(\s+[^>]*)?>/ig, (matches...) =>
            if (('|' + @commonWhiteList + '|' + whiteList + '|').indexOf '|' + matches[2].toLowerCase() + '|') >= 0
                @makeHolder matches[0]
            else
                htmlspecialchars matches[0]

        text = str_replace ['<', '>'], ['&lt;', '&gt;'], text

        # footnote
        text = text.replace /\[\^((?:[^\]]|\\\]|\\\[)+?)\]/g, (matches...) =>
            id = @footnotes.indexOf matches[1]

            if id < 0
                id = @footnotes.length + 1
                @footnotes.push @parseInline matches[1], '', no

            @makeHolder "<sup id=\"fnref-#{id}\"><a href=\"#fn-#{id}\" class=\"footnote-ref\">#{id}</a></sup>"

        # image
        text = text.replace /!\[((?:[^\]]|\\\]|\\\[)*?)\]\(((?:[^\)]|\\\)|\\\()+?)\)/g, (matches...) =>
            escaped = htmlspecialchars @escapeBracket matches[1]
            url = @escapeBracket matches[2]
            url = @cleanUrl url
            @makeHolder "<img src=\"#{url}\" alt=\"#{escaped}\" title=\"#{escaped}\">"

        text = text.replace /!\[((?:[^\]]|\\\]|\\\[)*?)\]\[((?:[^\]]|\\\]|\\\[)+?)\]/g, (matches...) =>
            escaped = htmlspecialchars @escapeBracket matches[1]

            result = if @definitions[matches[2]]? then "<img src=\"#{@definitions[matches[2]]}\" alt=\"#{escaped}\" title=\"#{escaped}\">" else escaped

            @makeHolder result

        # link
        text = text.replace /\[((?:[^\]]|\\\]|\\\[)+?)\]\(((?:[^\)]|\\\)|\\\()+?)\)/g, (matches...) =>
            escaped = @parseInline (@escapeBracket matches[1]), '', no, no
            url = @escapeBracket matches[2]
            url = @cleanUrl url
            @makeHolder "<a href=\"#{url}\">#{escaped}</a>"

        text = text.replace /\[((?:[^\]]|\\\]|\\\[)+?)\]\[((?:[^\]]|\\\]|\\\[)+?)\]/g, (matches...) =>
            escaped = @parseInline (@escapeBracket matches[1]), '', no, no

            result = if @definitions[matches[2]]? then "<a href=\"#{@definitions[matches[2]]}\">#{escaped}</a>" else escaped

            @makeHolder result

        # strong and em and some fuck
        text = @parseInlineCallback text
        text = text.replace /<([_a-z0-9-\.\+]+@[^@]+\.[a-z]{2,})>/ig, '<a href="mailto:$1">$1</a>'

        # autolink url
        if  enableAutoLink
            text = text.replace /(^|[^"])((https?):[x80-xff_a-z0-9-\.\/%#!@\?\+=~\|\,&\(\)]+)($|[^"])/ig, (matches...) =>
                link = @call 'parseLink', matches[2]
                "#{matches[1]}<a href=\"#{matches[2]}\">#{link}</a>#{matches[4]}"

        text = @call 'afterParseInlineBeforeRelease', text
        text = @releaseHolder text, clearHolders

        text = @call 'afterParseInline', text

        text


    parseInlineCallback: (text) ->
        text = text.replace /(\*{3})((?:.|\r)+?)\1/mg, (matches...) =>
            '<strong><em>' + (@parseInlineCallback matches[2]) + '</em></strong>'

        text = text.replace /(\*{2})((?:.|\r)+?)\1/mg, (matches...) =>
            '<strong>' + (@parseInlineCallback matches[2]) + '</strong>'

        text = text.replace /(\*)((?:.|\r)+?)\1/mg, (matches...) =>
            '<em>' + (@parseInlineCallback matches[2]) + '</em>'

        text = text.replace /(\s+|^)(_{3})((?:.|\r)+?)\2(\s+|$)/mg, (matches...) =>
            matches[1] + '<strong><em>' + (@parseInlineCallback matches[3]) + '</em></strong>' + matches[4]

        text = text.replace /(\s+|^)(_{2})((?:.|\r)+?)\2(\s+|$)/mg, (matches...) =>
            matches[1] + '<strong>' + (@parseInlineCallback matches[3]) + '</strong>' + matches[4]

        text = text.replace /(\s+|^)(_)((?:.|\r)+?)\2(\s+|$)/mg, (matches...) =>
            matches[1] + '<em>' + (@parseInlineCallback matches[3]) + '</em>' + matches[4]

        text = text.replace /(~{2})((?:.|\r)+?)\1/mg, (matches...) =>
            '<del>' + (@parseInlineCallback matches[2]) + '</del>'

        text


    # parse block
    parseBlock: (text, lines) ->
        lines.push line for line in text.split "\n"
        @blocks = []
        @current = 'normal'
        @pos = -1
        special = (array_keys @specialWhiteList).join '|'
        emptyCount = 0

        for line, key in lines
            block = @getBlock()
            block = block.slice 0 if block?

            if !!(matches = line.match /^(\s*)(~|`){3,}([^`~]*)$/i)
                if @isBlock 'code'
                    isAfterList = block[3][2]

                    if isAfterList
                        @combineBlock().setBlock(key)
                    else
                        (@setBlock key).endBlock()
                else
                    isAfterList = no

                    if @isBlock 'list'
                        space = block[3]

                        isAfterList = (space > 0 && matches[1].length >= space) || matches[1].length > space

                    @startBlock 'code', key, [matches[1], matches[3], isAfterList]

                continue
            else if @isBlock 'code'
                @setBlock key
                continue

            # super html mode
            if @html
                if !!(matches = line.match /^(\s*)!!!(\s*)$/i)
                    if @isBlock 'shtml'
                        @setBlock key
                            .endBlock()
                    else
                        @startBlock 'shtml', key

                    continue
                else if @isBlock 'shtml'
                    @setBlock key
                    continue

            # html block is special too
            if !!(matches = line.match new RegExp "^\\s*<(#{special})(\\s+[^>]*)?>", 'i')
                tag = matches[1].toLowerCase()
                if !(@isBlock 'html', tag) && !(@isBlock 'pre')
                    @startBlock 'html', key, tag

                continue
            else if !!(matches = line.match new RegExp "</(#{special})>\\s*$", 'i')
                tag = matches[1].toLowerCase()

                if @isBlock 'html', tag
                    @setBlock key
                        .endBlock()
                
                continue
            else if @isBlock 'html'
                @setBlock key
                continue

            switch true
                # pre block
                when !!(line.match /^ {4}/)
                    emptyCount = 0

                    if (@isBlock 'pre') or @isBlock 'list'
                        @setBlock key
                    else
                        @startBlock 'pre', key

                # list
                when !!(matches = line.match /^(\s*)((?:[0-9a-z]+\.)|\-|\+|\*)\s+/)
                    space = matches[1].length
                    emptyCount = 0

                    # opened
                    if @isBlock 'list'
                        @setBlock key, space
                    else
                        @startBlock 'list', key, space

                # foot note
                when !!(matches = line.match /^\[\^((?:[^\]]|\]|\[)+?)\]:/)
                    space = matches[0].length - 1
                    @startBlock 'footnote', key, [space, matches[1]]

                # definition
                when !!(matches = line.match /^\s*\[((?:[^\]]|\]|\[)+?)\]:\s*(.+)$/)
                    @definitions[matches[1]] = @cleanUrl matches[2]
                    @startBlock 'definition', key
                        .endBlock()

                # block quote
                when !!(line.match /^\s*>/)
                    if @isBlock 'quote'
                        @setBlock key
                    else
                        @startBlock 'quote', key

                # table
                when !!(matches = line.match /^((?:(?:(?:[ :]*\-[ :]*)+(?:\||\+))|(?:(?:\||\+)(?:[ :]*\-[ :]*)+)|(?:(?:[ :]*\-[ :]*)+(?:\||\+)(?:[ :]*\-[ :]*)+))+)$/)
                    if @isBlock 'table'
                        block[3][0].push block[3][2]
                        block[3][2] += 1
                        @setBlock key, block[3]
                    else
                        head = 0

                        if not block? or block[0] != 'normal' or lines[block[2]].match /^\s*$/
                            @startBlock 'table', key
                        else
                            head = 1
                            @backBlock 1, 'table'

                        if matches[1][0] == '|'
                            matches[1] = matches[1].substring 1

                            if matches[1][matches[1].length - 1] == '|'
                                matches[1] = matches[1].substring 0, matches[1].length - 1

                        rows = matches[1].split /\+|\|/
                        aligns = []

                        for row in rows
                            align = 'none'

                            if !!(matches = row.match /^\s*(:?)\-+(:?)\s*$/)
                                if !!matches[1] && !!matches[2]
                                    align = 'center'
                                else if !!matches[1]
                                    align = 'left'
                                else if !!matches[2]
                                    align = 'right'

                            aligns.push align

                        @setBlock key, [[head], aligns, head + 1]
                        
                
                # single heading
                when !!(matches = line.match /^(#+)(.*)$/)
                    num = Math.min matches[1].length, 6
                    @startBlock 'sh', key, num
                        .endBlock()

                # multi heading
                when !!(matches = (line.match /^\s*((=|-){2,})\s*$/)) and (block? and block[0] == 'normal' and !lines[block[2]].match /^\s*$/)
                    if @isBlock 'normal'
                        @backBlock 1, 'mh', if matches[1][0] == '=' then 1 else 2
                            .setBlock key
                            .endBlock()
                    else
                        @startBlock 'normal', key

                # hr
                when !!(line.match /^[-\*]{3,}\s*$/)
                    @startBlock 'hr', key
                        .endBlock()

                # normal
                else
                    if @isBlock 'list'
                        if line.match /^(\s*)/
                            if emptyCount > 0
                                @startBlock 'normal', key
                            else
                                @setBlock key

                            emptyCount += 1
                        else if emptyCount == 0
                            @setBlock key
                        else
                            @startBlock 'normal', key
                    else if @isBlock 'footnote'
                        matches = line.match /^(\s*)/
                        if matches[1].length >= block[3][0]
                            @setBlock key
                        else
                            @startBlock 'normal', key
                    else if @isBlock 'table'
                        if 0 <= line.indexOf '|'
                            block[3][2] += 1
                            @setBlock key, block[3]
                        else
                            @startBlock 'normal', key
                    else if @isBlock 'pre'
                        if line.match /^\s*$/
                            if emptyCount > 0
                                @startBlock 'normal', key
                            else
                                @setBlock key

                            emptyCount += 1
                        else
                            @startBlock 'normal', key
                    else if @isBlock 'quote'
                        if line.match /^(\s*)/      # empty line
                            if emptyCount > 0
                                @startBlock 'normal', key
                            else
                                @setBlock key

                            emptyCount += 1
                        else if emptyCount == 0
                            @setBlock key
                        else
                            @startBlock 'normal', key
                    else
                        if not block? || block[0] != 'normal'
                            @startBlock 'normal', key
                        else
                            @setBlock key

        @optimizeBlocks @blocks, lines


    optimizeBlocks: (_blocks, _lines) ->
        blocks = _blocks.slice 0
        lines = _lines.slice 0

        blocks = @call 'beforeOptimizeBlocks', blocks, lines

        key = 0
        while blocks[key]?
            moved = no

            block = blocks[key]
            prevBlock = if blocks[key - 1]? then blocks[key - 1] else null
            nextBlock = if blocks[key + 1]? then blocks[key + 1] else null

            [type, from, to] = block

            if 'pre' == type
                isEmpty = lines.reduce (result, line) ->
                    (line.match /^\s*$/) and result
                , yes

                if isEmpty
                    block[0] = type = 'normal'

            if 'normal' == type
                types = ['list', 'quote']

                if from == to and (lines[from].match /^\s*$/) and prevBlock? and nextBlock?
                    if prevBlock[0] == nextBlock[0] and (types.indexOf prevBlock[0]) >= 0
                        # combine 3 blocks
                        blocks[key - 1] = [prevBlock[0], prevBlock[1], nextBlock[2], null]
                        blocks.splice key, 2

                        # do not move
                        moved = yes

            key += 1 if not moved

        @call 'afterOptimizeBlocks', blocks, lines


    parseCode: (lines, parts) ->
        [blank, lang] = parts
        lang = trim lang
        count = blank.length

        if not lang.match /^[_a-z0-9-\+\#\:\.]+$/i
            lang = null
        else
            parts = lang.split ':'
            if parts.length > 1
                [lang, rel] = parts
                lang = trim lang
                rel = trim rel
        

        lines = lines.slice 1, -1
            .map (line) ->
                line.replace (new RegExp "/^[ ]{#{count}}/"), ''

        str = lines.join "\n"

        if str.match /^\s*$/ then '' else '<pre><code' \
            + (if !!lang then " class=\"#{lang}\"" else '') \
            + (if !!rel then " rel=\"#{rel}\"" else '') + '>' \
            + (htmlspecialchars str) + '</code></pre>'

    
    parsePre: (lines) ->
        lines = lines.map (line) ->
            htmlspecialchars line.substring 4
        str = lines.join "\n"

        if str.match /^\s*$/ then '' else '<pre><code>' + str + '</code></pre>'


    parseShtml: (lines) ->
        trim (lines.slice 1, -1).join "\n"


    parseSh: (lines, num) ->
        line = @parseInline trim lines[0], '# '
        if line.match /^\s*$/ then '' else "<h#{num}>#{line}</h#{num}>"


    parseMh: (lines, num) ->
        @parseSh lines, num


    parseQuote: (lines) ->
        lines = lines.map (line) ->
            line.replace /^\s*> ?/, ''
        str = lines.join "\n"

        if str.match /^\s*$/ then '' else '<blockquote>' + (@parse str) + '</blockquote>'


    parseList: (lines) ->
        html = ''
        minSpace = 99999
        rows = []

        for line, key in lines
            if matches = line.match /^(\s*)((?:[0-9a-z]+\.?)|\-|\+|\*)(\s+)(.*)$/
                space = matches[1].length
                type = if 0 <= '+-*'.indexOf matches[2] then 'ul' else 'ol'
                minSpace = Math.min space, minSpace

                rows.push [space, type, line, matches[4]]
            else
                rows.push line

        found = no
        secondMinSpace = 99999
        for row in rows
            if row instanceof Array and row[0] != minSpace
                secondMinSpace = Math.min secondMinSpace, row[0]
                found = yes
        secondMinSpace = if found then secondMinSpace else minSpace

        lastType = ''
        leftLines = []

        for row in rows
            if row instanceof Array
                [space, type, line, text] = row

                if space != minSpace
                    leftLines.push line.replace (new RegExp "^\\s{#{secondMinSpace}}"), ''
                else
                    if leftLines.length > 0
                        html += '<li>' + (@parse leftLines.join "\n") + '</li>'

                    if lastType != type
                        if !!lastType
                            html += "</#{lastType}>"

                        html += "<#{type}>"

                    leftLines = [text]
                    lastType = type
            else
                leftLines.push row.replace (new RegExp "^\\s{#{secondMinSpace}}"), ''

        if leftLines.length > 0
            html += '<li>' + (@parse leftLines.join "\n") + "</li></#{lastType}>"

        html


    parseTable: (lines, value) ->
        [ignores, aligns] = value
        head = ignores.length > 0 and (ignores.reduce (prev, curr) -> curr + prev) > 0

        html = '<table>'
        body = if head then null else yes
        output = no

        for line, key in lines
            if 0 <= ignores.indexOf key
                if head and output
                    head = no
                    body = yes
                continue

            line = trim line
            output = yes

            if line[0] == '|'
                line = line.substring 1

                if line[line.length - 1] == '|'
                    line = line.substring 0, line.length - 1

            rows = line.split '|'
                .map (row) ->
                    if row.match /^\s+$/ then '' else trim row
            columns = {}
            last = -1

            for row in rows
                if row.length > 0
                    last += 1
                    columns[last] = [(if columns[last]? then columns[last][0] + 1 else 1), row]
                else if columns[last]?
                    columns[last][0] += 1
                else
                    columns[0] = [1, row]

            if head
                html += '<thead>'
            else if body
                html += '<tbody>'

            html += '<tr>'

            for key, column of columns
                [num, text] = column
                tag = if head then 'th' else 'td'

                html += "<#{tag}"
                if num > 1
                    html += " colspan=\"#{num}\""

                if aligns[key]? and aligns[key] != 'none'
                    html += " align=\"#{aligns[key]}\""

                html += '>' + (@parseInline text) + "</#{tag}>"

            html += '</tr>'

            if head
                html += '</thead>'
            else if body
                body = no

        if body != null
            html += '</tbody>'

        html += '</table>'



    parseHr: -> '<hr>'


    parseNormal: (lines) ->
        lines = lines.map (line) =>
            @parseInline line

        str = trim lines.join "\n"
        str = str.replace /(\n\s*){2,}/g, '</p><p>'
        str = str.replace /\n/g, '<br>'

        if str.match /^\s*$/ then '' else "<p>#{str}</p>"


    parseFootnote: (lines, value) ->
        [space, note] = value
        index = @footnotes.indexOf note

        if index >= 0
            lines = lines.slice 0 # clone array
            lines[0] = lines[0].replace /^\[\^((?:[^\]]|\]|\[)+?)\]:/, ''
            @footnotes[index] = lines

        ''


    parseDefinition: -> ''

    
    parseHtml: (lines, type) ->
        lines = lines.map (line) =>
            @parseInline line, if @specialWhiteList[type]? then @specialWhiteList[type] else ''

        lines.join "\n"


    cleanUrl: (url) ->
        if !!(matches = url.match /^\s*((http|https|ftp|mailto):[x80-xff_a-z0-9-\.\/%#!@\?\+=~\|\,&\(\)]+)/i)
            matches[1]
        if !!(matches = url.match /^\s*([x80-xff_a-z0-9-\.\/%#!@\?\+=~\|\,&]+)/i)
            matches[1]
        else
            '#'


    escapeBracket: (str) ->
        str_replace ['\\[', '\\]', '\\(', '\\)'], ['[', ']', '(', ')'], str


    startBlock: (type, start, value = null) ->
        @pos += 1
        @current = type

        @blocks.push [type, start, start, value]
        @


    endBlock: ->
        @current = 'normal'
        @


    isBlock: (type, value = null) ->
        @current == type and (if null == value then yes else @blocks[@pos][3] == value)


    getBlock: ->
        if @blocks[@pos]? then @blocks[@pos] else null


    setBlock: (to = null, value = null) ->
        @blocks[@pos][2] = to if to != null

        @blocks[@pos][3] = value if value != null

        @


    backBlock: (step, type, value = null) ->
        return @startBlock type, 0, value if @pos < 0

        last = @blocks[@pos][2]
        @blocks[@pos][2] = last - step

        item = [type, last - step + 1, last, value]
        if @blocks[@pos][1] <= @blocks[@pos][2]
            @pos += 1
            @blocks.push item
        else
            @blocks[@pos] = item

        @current = type
        @


    combineBlock: ->
        return @ if @pos < 1

        prev = @blocks[@pos - 1].slice 0
        current = @blocks[@pos].slice 0

        prev[2] = current[2]
        @blocks[@pos - 1] = prev
        @current = prev[0]
        @blocks = @blocks.slice 0, -1
        @pos -= 1

        @


if module?
    module.exports = Parser
else if window?
    window.HyperDown = Parser

