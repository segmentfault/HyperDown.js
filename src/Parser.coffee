
class Parser

    # begin php function wrappers
    ucfirst = (str) ->
        (str.charAt 0).toUpperCase() + str.substring 1


    preg_quote = (str) -> str.replace /[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"

    pL = 'A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC'

    
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
            regex = new RegExp "(^|[^\"])((https?):[#{pL}_0-9-\\./%#!@\\?\\+=~\\|\\,&\\(\\)]+)($|[^\"])", 'ig'
            text = text.replace regex, (matches...) =>
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
        if !!(matches = line.match /^(\s*)((?:[0-9]+\.)|\-|\+|\*)\s+/i)
            space = matches[1].length
            state.empty = 0

            # opened
            if @isBlock 'list'
                @setBlock key, space
            else
                @startBlock 'list', key, space

            return no
        else if (@isBlock 'list') and not line.match /^\s*\[((?:[^\]]|\\\]|\\\[)+?)\]:\s*(.+)$/
            if (state.empty <= 1) and !!(matches = line.match /^(\s+)/) and matches[1].length > block[3]
                state.empty = 0
                @setBlock key
                return no
            else if (line.match /^\s*$/) and state.empty is 0
                state.empty += 1
                @setBlock key
                return no

        yes


    parseBlockCode: (block, key, line) ->
        if !!(matches = line.match /^(\s*)(~{3,}|`{3,})([^`~]*)$/i)
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
        if !!(matches = line.match /^((?:(?:(?:\||\+)(?:[ :]*\-+[ :]*)(?:\||\+))|(?:(?:[ :]*\-+[ :]*)(?:\||\+)(?:[ :]*\-+[ :]*))|(?:(?:[ :]*\-+[ :]*)(?:\||\+))|(?:(?:\||\+)(?:[ :]*\-+[ :]*)))+)$/)
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
        if !!(line.match /^(\* *){3,}\s*$/)
            @startBlock 'hr', key
                .endBlock()
            
            return no

        yes


    parseBlockDhr: (block, key, line) ->
        if !!(line.match /^(- *){3,}\s*$/)
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
                    if prevBlock[0] == nextBlock[0] and (types.indexOf prevBlock[0]) >= 0
                        # combine 3 blocks
                        blocks[key - 1] = [prevBlock[0], prevBlock[1], nextBlock[2], null]
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
                line = line.replace (new RegExp "/^[ ]{#{count}}/"), ''
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
        minSpace = 99999
        secondMinSpace = 99999
        found = no
        secondFound = no
        rows = []

        for line, key in lines
            if matches = line.match /^(\s*)((?:[0-9]+\.?)|\-|\+|\*)(\s+)(.*)$/i
                space = matches[1].length
                type = if 0 <= '+-*'.indexOf matches[2] then 'ul' else 'ol'
                minSpace = Math.min space, minSpace
                found = yes

                if space > 0
                    secondMinSpace = Math.min space, secondMinSpace
                    secondFound = yes

                rows.push [space, type, line, matches[4]]
            else
                rows.push line

                if !!(matches = line.match /^(\s*)/)
                    space = matches[1].length

                    if space > 0
                        secondMinSpace = Math.min space, secondMinSpace
                        secondFound = yes

        minSpace = if found then minSpace else 0
        secondMinSpace = if secondFound then secondMinSpace else minSpace

        lastType = ''
        leftLines = []
        leftStart = 0

        for row, key in rows
            if row instanceof Array
                [space, type, line, text] = row

                if space != minSpace
                    leftLines.push line.replace (new RegExp "^\\s{#{secondMinSpace}}"), ''
                else
                    if leftLines.length > 0
                        html += '<li>' + (@parse (leftLines.join "\n"), yes, start + leftStart) + '</li>'

                    if lastType != type
                        if !!lastType
                            html += "</#{lastType}>"

                        html += "<#{type}>"

                    leftStart = key
                    leftLines = [text]
                    lastType = type
            else
                leftLines.push row.replace (new RegExp "^\\s{#{secondMinSpace}}"), ''

        if leftLines.length > 0
            html += '<li>' + (@parse (leftLines.join "\n"), yes, start + leftStart) + "</li></#{lastType}>"

        html


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


    parseNormal: (lines, inline = no, start) ->
        key = 0
        lines = lines.map (line) =>
            line = @parseInline line

            if !line.match /^\s*$/
                line = (@markLine start + key) + line

            key += 1
            line

        str = trim lines.join "\n"
        str = str.replace /(\n\s*){2,}/g, '</p><p>'
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


    cleanUrl: (url) ->
        regexUrl = new RegExp "^\\s*((http|https|ftp|mailto):[#{pL}_a-z0-9-:\\.\\*/%#!@\\?\\+=~\\|\\,&\\(\\)]+)", 'i'
        regexWord = new RegExp "^\\s*([#{pL}_a-z0-9-:\\.\\*/%#!@\\?\\+=~\\|\\,&]+)", 'i'

        if !!(matches = url.match regexUrl)
            matches[1]
        else if !!(matches = url.match regexWord)
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

