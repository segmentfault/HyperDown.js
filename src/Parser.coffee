
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
            str = str.replace (new RegExp search, 'g'), replace.replace /\$/g, '$$$$'

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
        @blockHtmlTags = 'p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|address|form|fieldset|iframe|hr|legend|article|section|nav|aside|hgroup|header|footer|figcaption|svg|script|noscript'
        @specialWhiteList =
            table:  'table|tbody|thead|tfoot|tr|td|th'
        @hooks = {}
        @html = no
        @line = no

        @blockParsers = [
            ['code', 10]
            ['shtml', 20]
            ['pre', 30]
            ['ahtml', 40]
            ['shr', 50]
            ['list', 60]
            ['math', 70]
            ['html', 80]
            ['footnote', 90]
            ['definition', 100]
            ['quote', 110]
            ['table', 120]
            ['sh', 130]
            ['mh', 140]
            ['dhr', 150]
            ['default', 9999]
        ]
        @parsers = {}

    
    # parse markdown text
    makeHtml: (text) ->
        @footnotes = []
        @definitions = {}
        @holders = {}
        @uniqid = (Math.ceil Math.random() * 10000000) + (Math.ceil Math.random() * 10000000)
        @id = 0

        @blockParsers.sort (a, b) -> if a[1] < b[1] then -1 else 1
        
        for parser in @blockParsers
            [name] = parser

            if parser[2] isnt undefined
                @parsers[name] = parser[2]
            else
                @parsers[name] = @['parseBlock' + (ucfirst name)].bind @

        text = @initText text
        html = @parse text
        html = @makeFootnotes html
        html = @optimizeLines html

        @call 'makeHtml', html


    enableHtml: (@html = yes) ->


    enableLine: (@line = yes) ->

    
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
            .replace /(\u000A|\u000D|\u2028|\u2029)/g, "\n"

    
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
    parse: (text, inline = no, offset = 0) ->
        lines = []  # array ref
        blocks = @parseBlock text, lines
        html = ''

        # inline mode for single normal block
        if inline and blocks.length is 1 and blocks[0][0] is 'normal'
            blocks[0][3] = yes

        for block in blocks
            [type, start, end, value] = block
            extract = lines.slice start, end + 1
            method = 'parse' + ucfirst type

            extract = @call ('before' + ucfirst method), extract, value
            result = @[method] extract, value, start + offset, end + offset
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


    # mark line
    markLine: (start, end = -1) ->
        if @line
            end = if end < 0 then start else end
            return '<span class="line" data-start="' + start + '" data-end="' + end + '" data-id="' + @uniqid + '"></span>'

        ''

    
    # mark lines
    markLines: (lines, start) ->
        i = -1

        if @line then lines.map (line) =>
            i += 1
            (@markLine start + i) + line
        else lines


    # optimize lines
    optimizeLines: (html) ->
        last = 0

        regex = new RegExp "class=\"line\" data\\-start=\"([0-9]+)\" data\\-end=\"([0-9]+)\" (data\\-id=\"#{@uniqid}\")", 'g'
        if @line then html.replace regex, (matches...) ->
            if last != parseInt matches[1]
                replace = 'class="line" data-start="' + last + '" data-start-original="' + matches[1] + '" data-end="' + matches[2] + '" ' + matches[3]
            else
                replace = matches[0]

            last = 1 + parseInt matches[2]
            replace
        else html

    # parse inline
    parseInline: (text, whiteList = '', clearHolders = yes, enableAutoLink = yes) ->
        text = @call 'beforeParseInline', text
        
        # code
        text = text.replace /(^|[^\\])(`+)(.+?)\2/mg, (matches...) =>
            matches[1] + @makeHolder '<code>' + (htmlspecialchars matches[3]) + '</code>'
        
        # mathjax
        text = text.replace /(^|[^\\])(\$+)(.+?)\2/mg, (matches...) =>
            matches[1] + @makeHolder matches[2] + (htmlspecialchars matches[3]) + matches[2]

        # escape
        text = text.replace /\\(.)/g, (matches...) =>
            prefix = if matches[1].match /^[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]$/ then '' else '\\'
            escaped = htmlspecialchars matches[1]
            escaped = escaped.replace /\$/g, '&dollar;'
            @makeHolder prefix + escaped
        
        # link
        text = text.replace /<(https?:\/\/.+|(?:mailto:)?[_a-z0-9-\.\+]+@[_\w-]+(?:\.[a-z]{2,})+)>/ig, (matches...) =>
            url = @cleanUrl matches[1]
            link = @call 'parseLink', url

            @makeHolder "<a href=\"#{url}\">#{link}</a>"

        # encode unsafe tags
        text = text.replace /<(\/?)([a-z0-9-]+)(\s+[^>]*)?>/ig, (matches...) =>
            if @html or (('|' + @commonWhiteList + '|' + whiteList + '|').indexOf '|' + matches[2].toLowerCase() + '|') >= 0
                @makeHolder matches[0]
            else
                @makeHolder htmlspecialchars matches[0]

        if @html
            text = text.replace /<!\-\-(.*?)\-\->/g, (matches...) =>
                @makeHolder matches[0]

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
            [url, title] = @cleanUrl url, yes
            title = if not title? then escaped else " title=\"#{title}\""
            @makeHolder "<img src=\"#{url}\" alt=\"#{title}\" title=\"#{title}\">"

        text = text.replace /!\[((?:[^\]]|\\\]|\\\[)*?)\]\[((?:[^\]]|\\\]|\\\[)+?)\]/g, (matches...) =>
            escaped = htmlspecialchars @escapeBracket matches[1]

            result = if @definitions[matches[2]]? then "<img src=\"#{@definitions[matches[2]]}\" alt=\"#{escaped}\" title=\"#{escaped}\">" else escaped

            @makeHolder result

        # link
        text = text.replace /\[((?:[^\]]|\\\]|\\\[)+?)\]\(((?:[^\)]|\\\)|\\\()+?)\)/g, (matches...) =>
            escaped = @parseInline (@escapeBracket matches[1]), '', no, no
            url = @escapeBracket matches[2]
            [url, title] = @cleanUrl url, yes
            title = if not title? then '' else " title=\"#{title}\""

            @makeHolder "<a href=\"#{url}\"#{title}>#{escaped}</a>"

        text = text.replace /\[((?:[^\]]|\\\]|\\\[)+?)\]\[((?:[^\]]|\\\]|\\\[)+?)\]/g, (matches...) =>
            escaped = @parseInline (@escapeBracket matches[1]), '', no, no

            result = if @definitions[matches[2]]? then "<a href=\"#{@definitions[matches[2]]}\">#{escaped}</a>" else escaped

            @makeHolder result

        # strong and em and some fuck
        text = @parseInlineCallback text

        # autolink url
        if  enableAutoLink
            text = text.replace /(^|[^\"])(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\b([-a-zA-Z0-9@:%_\+.~#?&\/=]*)|(?:mailto:)?[_a-z0-9-\.\+]+@[_\w-]+(?:\.[a-z]{2,})+)($|[^\"])/g, (matches...) =>
                url = @cleanUrl matches[2]
                link = @call 'parseLink', matches[2]
                "#{matches[1]}<a href=\"#{url}\">#{link}</a>#{matches[5]}"

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

        state =
            special: (array_keys @specialWhiteList).join '|'
            empty: 0
            html: no

        for line, key in lines
            block = @getBlock()
            block = block.slice 0 if block?

            if @current isnt 'normal'
                pass = @parsers[@current] block, key, line, state, lines
                continue if not pass

            for name, parser of @parsers
                if name isnt @current
                    pass = parser block, key, line, state, lines
                    
                    break if not pass
            

        @optimizeBlocks @blocks, lines


    parseBlockList: (block, key, line, state) ->
        # list 
        if (@isBlock 'list') and not line.match /^\s*\[((?:[^\]]|\\\]|\\\[)+?)\]:\s*(.+)$/
            if !!(line.match /^(\s*)(~{3,}|`{3,})([^`~]*)$/i)
                # ignore code
                return yes
            else if (state.empty <= 1) and !!(matches = line.match /^(\s*)\S+/) and matches[1].length >= (block[3][0] + state.empty)
                state.empty = 0
                @setBlock key
                return no
            else if (line.match /^\s*$/) and state.empty is 0
                state.empty += 1
                @setBlock key
                return no

        if !!(matches = line.match /^(\s*)((?:[0-9]+\.)|\-|\+|\*)\s+/i)
            space = matches[1].length
            tab = matches[0].length - space
            state.empty = 0
            type = if 0 <= '+-*'.indexOf matches[2] then 'ul' else 'ol'

            # opened
            if @isBlock 'list'
                if space < block[3][0] or (space == block[3][0] and type != block[3][1])
                    @startBlock 'list', key, [space, type, tab]
                else
                    @setBlock key
            else
                @startBlock 'list', key, [space, type, tab]

            return no

        yes


    parseBlockCode: (block, key, line, state) ->
        if !!(matches = line.match /^(\s*)(~{3,}|`{3,})([^`~]*)$/i)
            if @isBlock 'code'
                if state.code != matches[2]
                    @setBlock key
                    return no

                isAfterList = block[3][2]

                if isAfterList
                    state.empty = 0
                    @combineBlock().setBlock(key)
                else
                    (@setBlock key).endBlock()
            else
                isAfterList = no

                if @isBlock 'list'
                    space = block[3][0]

                    isAfterList = matches[1].length >= space + state.empty

                state.code = matches[2]
                @startBlock 'code', key, [matches[1], matches[3], isAfterList]

            return no
        else if @isBlock 'code'
            @setBlock key
            return no

        yes


    parseBlockShtml: (block, key, line, state) ->
        if @html
            if !!(matches = line.match /^(\s*)!!!(\s*)$/)
                if @isBlock 'shtml'
                    @setBlock key
                        .endBlock()
                else
                    @startBlock 'shtml', key

                return no
            else if @isBlock 'shtml'
                @setBlock key
                return no

        yes


    parseBlockAhtml: (block, key, line, state) ->
        if @html
            htmlTagRegExp = new RegExp "^\\s*<(#{@blockHtmlTags})(\\s+[^>]*)?>", 'i'
            if matches = line.match htmlTagRegExp
                if @isBlock 'ahtml'
                    @setBlock key
                    return no
                else if matches[2] is undefined or matches[2] isnt '/'
                    @startBlock 'ahtml', key
                    htmlTagAllRegExp = new RegExp "\\s*<(#{@blockHtmlTags})(\\s+[^>]*)?>", 'ig'
                    loop
                        m = htmlTagAllRegExp.exec line
                        break if !m
                        lastMatch = m[1]

                    if 0 <= line.indexOf "</#{lastMatch}>"
                        @endBlock()
                    else
                        state.html = lastMatch

                    return no
            else if !!state.html and 0 <= line.indexOf "</#{state.html}>"
                @setBlock key
                    .endBlock()
                state.html = no
                return no
            else if @isBlock 'ahtml'
                @setBlock key
                return no
            else if !!(matches = line.match /^\s*<!\-\-(.*?)\-\->\s*$/)
                @startBlock 'ahtml', key
                    .endBlock()
                return no

        yes


    parseBlockMath: (block, key, line) ->
        if !!(matches = line.match /^(\s*)\$\$(\s*)$/)
            if @isBlock 'math'
                @setBlock key
                    .endBlock()
            else
                @startBlock 'math', key

            return no
        else if @isBlock 'math'
            @setBlock key
            return no

        yes


    parseBlockPre: (block, key, line, state) ->
        if !!(line.match /^ {4}/)
            if @isBlock 'pre'
                @setBlock key
            else
                @startBlock 'pre', key
                
            return no
        else if (@isBlock 'pre') and line.match /^\s*$/
            @setBlock key
            return no

        yes


    parseBlockHtml: (block, key, line, state) ->
        if !!(matches = line.match new RegExp "^\\s*<(#{state.special})(\\s+[^>]*)?>", 'i')
            tag = matches[1].toLowerCase()
            if !(@isBlock 'html', tag) && !(@isBlock 'pre')
                @startBlock 'html', key, tag

            return no
        else if !!(matches = line.match new RegExp "</(#{state.special})>\\s*$", 'i')
            tag = matches[1].toLowerCase()

            if @isBlock 'html', tag
                @setBlock key
                    .endBlock()

            return no
        else if @isBlock 'html'
            @setBlock key
            return no

        yes

    parseBlockFootnote: (block, key, line) ->
        if !!(matches = line.match /^\[\^((?:[^\]]|\\\]|\\\[)+?)\]:/)
            space = matches[0].length - 1
            @startBlock 'footnote', key, [space, matches[1]]

            return no
        
        yes


    parseBlockDefinition: (block, key, line) ->
        if !!(matches = line.match /^\s*\[((?:[^\]]|\\\]|\\\[)+?)\]:\s*(.+)$/)
            @definitions[matches[1]] = @cleanUrl matches[2]
            @startBlock 'definition', key
                .endBlock()

            return no

        yes


    parseBlockQuote: (block, key, line) ->
        if !!(matches = line.match /^(\s*)>/)
            if (@isBlock 'list') and matches[1].length > 0
                @setBlock key
            else if @isBlock 'quote'
                @setBlock key
            else
                @startBlock 'quote', key

            return no

        yes


    parseBlockTable: (block, key, line, state, lines) ->
        if !!(matches = line.match /^\s*(\|?[ :]*-{2,}[ :]*(?:[\|\+][ :]*-{2,}[ :]*)*\|?)\s*$/)
           if matches[1].indexOf('|') >= 0 or matches[1].indexOf('+') >= 0
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

                return no

        yes


    parseBlockSh: (block, key, line) ->
        if !!(matches = line.match /^(#+)(.*)$/)
            num = Math.min matches[1].length, 6
            @startBlock 'sh', key, num
                .endBlock()

            return no
        
        yes


    parseBlockMh: (block, key, line, state, lines) ->
        if !!(matches = (line.match /^\s*((=|-){2,})\s*$/)) and (block? and block[0] == 'normal' and !lines[block[2]].match /^\s*$/)
            if @isBlock 'normal'
                @backBlock 1, 'mh', if matches[1][0] == '=' then 1 else 2
                    .setBlock key
                    .endBlock()
            else
                @startBlock 'normal', key

            return no

        yes


    parseBlockShr: (block, key, line) ->
        if !!(line.match /^\*{3,}\s*$/)
            @startBlock 'hr', key
                .endBlock()
            
            return no

        yes


    parseBlockDhr: (block, key, line) ->
        if !!(line.match /^-{3,}\s*$/)
            @startBlock 'hr', key
                .endBlock()
            
            return no

        yes


    parseBlockDefault: (block, key, line, state) ->
        if @isBlock 'footnote'
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
        else if @isBlock 'quote'
            if not line.match /^(\s*)$/      # empty line
                @setBlock key
            else
                @startBlock 'normal', key
        else
            if not block? || block[0] != 'normal'
                @startBlock 'normal', key
            else
                @setBlock key

        yes


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
                isEmpty = (lines.slice block[1], block[2] + 1).reduce (result, line) ->
                    (line.match /^\s*$/) and result
                , yes

                if isEmpty
                    block[0] = type = 'normal'

            if 'normal' == type
                types = ['list', 'quote']

                if from == to and (lines[from].match /^\s*$/) and prevBlock? and nextBlock?
                    if prevBlock[0] == nextBlock[0] and (types.indexOf prevBlock[0]) >= 0 \
                        and (prevBlock[0] != 'list' \
                            or (prevBlock[3][0] == nextBlock[3][0] and prevBlock[3][1] == nextBlock[3][1]))
                        # combine 3 blocks
                        blocks[key - 1] = [prevBlock[0], prevBlock[1], nextBlock[2], if prevBlock[3]? then prevBlock[3] else null]
                        blocks.splice key, 2

                        # do not move
                        moved = yes

            key += 1 if not moved

        @call 'afterOptimizeBlocks', blocks, lines


    parseCode: (lines, parts, start) ->
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
        
        isEmpty = yes

        lines = lines.slice 1, -1
            .map (line) ->
                line = line.replace (new RegExp "^[ ]{#{count}}"), ''
                if isEmpty and !line.match /^\s*$/
                    isEmpty = no

                htmlspecialchars line

        str = (@markLines lines, start + 1).join "\n"

        if isEmpty then '' else '<pre><code' \
            + (if !!lang then " class=\"#{lang}\"" else '') \
            + (if !!rel then " rel=\"#{rel}\"" else '') + '>' \
            + str + '</code></pre>'

    
    parsePre: (lines, value, start) ->
        lines = lines.map (line) ->
            htmlspecialchars line.substring 4
        str = (@markLines lines, start).join "\n"

        if str.match /^\s*$/ then '' else '<pre><code>' + str + '</code></pre>'


    parseAhtml: (lines, value, start) ->
        trim (@markLines lines, start).join "\n"


    parseShtml: (lines, value, start) ->
        trim (@markLines (lines.slice 1, -1), start + 1).join "\n"


    parseMath: (lines, value, start, end) ->
        '<p>' + (@markLine start, end) + (htmlspecialchars lines.join "\n") + '</p>'


    parseSh: (lines, num, start, end) ->
        line = (@markLine start, end) + @parseInline trim lines[0], '# '
        if line.match /^\s*$/ then '' else "<h#{num}>#{line}</h#{num}>"


    parseMh: (lines, num, start, end) ->
        @parseSh lines, num, start, end


    parseQuote: (lines, value, start) ->
        lines = lines.map (line) ->
            line.replace /^\s*> ?/, ''
        str = lines.join "\n"

        if str.match /^\s*$/ then '' else '<blockquote>' + (@parse str, yes, start) + '</blockquote>'


    parseList: (lines, value, start) ->
        html = ''
        [space, type, tab] = value
        rows = []
        suffix = ''
        last = 0

        for line, key in lines
            if matches = line.match new RegExp "^(\\s{#{space}})((?:[0-9]+\\.?)|\\-|\\+|\\*)(\\s+)(.*)$"
                if type is 'ol' and key is 0
                    olStart = parseInt matches[2]

                    suffix = ' start="' +  olStart + '"' if olStart != 1

                rows.push [matches[4]]
                last = rows.length - 1
            else
                rows[last].push line.replace (new RegExp "^\\s{#{tab + space}}"), ''

        for row in rows
            html += '<li>' + (@parse (row.join "\n"), yes, start) + '</li>'
            start += row.length

        "<#{type}#{suffix}>#{html}</#{type}>"


    parseTable: (lines, value, start) ->
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
                    if row.match /^\s*$/ then ' ' else trim row
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

            html += '<tr'

            if @line
                html += ' class="line" data-start="' + (start + key) + '" data-end="' + (start + key) + '" data-id="' + @uniqid + '"'

            html += '>'

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



    parseHr: (lines, value, start) ->
        if @line then '<hr class="line" data-start="' + start + '" data-end="' + start + '">' else '<hr>'


    parseNormal: (lines, inline, start) ->
        key = 0
        lines = lines.map (line) =>
            line = @parseInline line

            if !line.match /^\s*$/
                line = (@markLine start + key) + line

            key += 1
            line

        str = trim lines.join "\n"
        str = str.replace /(\n\s*){2,}/g, () => 
                inline = false
                '</p><p>'
        str = str.replace /\n/g, '<br>'

        if str.match /^\s*$/ then '' else (if inline then str else "<p>#{str}</p>")


    parseFootnote: (lines, value) ->
        [space, note] = value
        index = @footnotes.indexOf note

        if index >= 0
            lines = lines.slice 0 # clone array
            lines[0] = lines[0].replace /^\[\^((?:[^\]]|\]|\[)+?)\]:/, ''
            @footnotes[index] = lines

        ''


    parseDefinition: -> ''

    
    parseHtml: (lines, type, start) ->
        lines = lines.map (line) =>
            @parseInline line, if @specialWhiteList[type]? then @specialWhiteList[type] else ''

        (@markLines lines, start).join "\n"


    cleanUrl: (url, parseTitle = false) ->
        title = null
        url = trim url

        if parseTitle
            pos = url.indexOf ' '

            if pos >= 0
                title = htmlspecialchars trim (url.substring pos + 1), ' "\''
                url = url.substring 0, pos

        url = url.replace /["'<>\s]/g, ''

        if !!(matches = url.match /^(mailto:)?[_a-z0-9-\.\+]+@[_\w-]+(?:\.[a-z]{2,})+$/i)
            url = 'mailto:' + url if not matches[1]?

        return '#' if (url.match /^\w+:/i) and not (url.match /^(https?|mailto):/i)

        if parseTitle then [url, title] else url


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

