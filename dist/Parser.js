/**
 * Parser in ECMAScript 6
 *
 * @copyright Copyright (c) 2012 SegmentFault Team. (http://segmentfault.com)
 * @author Integ <integ@segmentfault.com>
 * @license BSD License
 */

'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _md5 = require('md5');

var _md52 = _interopRequireDefault(_md5);

var Parser = (function () {
    function Parser() {
        _classCallCheck(this, Parser);

        this.commonWhiteList = 'kbd|b|i|strong|em|sup|sub|br|code|del|a|hr|small';
        this.specialWhiteList = {
            table: 'table|tbody|thead|tfoot|tr|td|th'
        };
        this.footnotes = [];
        this.blocks = [];
        this.current = 'normal';
        this.pos = -1;
        this.definitions = [];
        this.hooks = {};
        this.holders = {};
        this.uniqid = (0, _md52['default'])(new Date().getTime());
        this.id = 0;
    }

    /**
     * makeHtml
     *
     * @param mixed text
     * @return string
     */

    _createClass(Parser, [{
        key: 'makeHtml',
        value: function makeHtml(text) {
            text = this.initText(text);
            var html = this.parse(text);
            return this.makeFootnotes(html);
        }

        /**
         * @param type
         * @param callback
         */
    }, {
        key: 'hook',
        value: function hook(type, callback) {
            this.hooks[type] = callback;
        }

        /**
         * @param text
         * @return mixed
         */
    }, {
        key: 'initText',
        value: function initText(text) {
            text = text.replace('\t', '    ');
            text = text.replace('\r', '');
            return text;
        }

        /**
         * @param html
         * @return string
         */
    }, {
        key: 'makeFootnotes',
        value: function makeFootnotes(html) {
            if (this.footnotes.length > 0) {
                html += '<div class="footnotes"><hr><ol>';
                var index = 1;
                var val = this.footnotes.pop();
                while (val) {
                    if (typeof val === 'string') {
                        val += ' <a href="#fnref-' + index + '" class="footnote-backref">&#8617;</a>';
                    } else {
                        val[val.length - 1] += ' <a href="#fnref-' + index + '" class="footnote-backref">&#8617;</a>';
                        val = val.length > 1 ? this.parse(val.join("\n")) : this.parseInline(val[0]);
                    }

                    html += '<li id="fn-' + index + '">' + val + '</li>';

                    index++;
                }
                html += '</ol></div>';
            }
            return html;
        }

        /**
         * parse
         *
         * @param string text
         * @return string
         */
    }, {
        key: 'parse',
        value: function parse(text) {
            var _this = this;

            var lines = text.split("\n");
            var blocks = this.parseBlock(text, lines);
            var html = '';

            blocks.forEach(function (block) {
                var _block = _slicedToArray(block, 4);

                var type = _block[0];
                var start = _block[1];
                var end = _block[2];
                var value = _block[3];

                var extract = lines.slice(start, end - start + 1);
                var method = 'parse' + _lodash2['default'].capitalize(type);

                extract = _this.call('before' + _lodash2['default'].capitalize(method), extract, value);
                var result = _this[method](extract, value);
                result = _this.call('after' + _lodash2['default'].capitalize(method), result, value);

                html += result;
            });

            return html;
        }

        /**
         * @param type
         * @param value
         * @return mixed
         */
    }, {
        key: 'call',
        value: function call(type) {
            for (var _len = arguments.length, value = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                value[_key - 1] = arguments[_key];
            }

            if (!this.hooks[type]) {
                return value[0];
            }

            var args = value;

            this.hooks[type].forEach(function (callback) {
                value = callback(args);
                args[0] = value;
            });

            return value[0];
        }

        /**
         * @param str
         * @return string
         */
    }, {
        key: 'makeHolder',
        value: function makeHolder(str) {
            var key = '|' + this.uniqid + this.id + '|';
            this.id++;
            this.holders[key] = str;

            return key;
        }

        /**
         * @param text
         * @return string
         */
    }, {
        key: 'releaseHolder',
        value: function releaseHolder(text) {
            _lodash2['default'].forOwn(this.holders, function (value, key) {
                text = text.replace(key, value);
            });
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
    }, {
        key: 'parseInline',
        value: function parseInline(text) {
            var whiteList = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

            text = this.call('beforeParseInline', text);

            // code
            var codeMatches = /(^|[^\\])`(.+?)`/.exec(text);
            if (codeMatches) {
                text = codeMatches[1] + this.makeHolder('<code>' + htmlspecialchars(codeMatches[2]) + '</code>');
            }

            // escape unsafe tags
            var unsafeTagMatches = /<(\/?)([a-z0-9-]+)(\s+[^>]*)?>/i.exec(text);
            if (unsafeTagMatches) {
                var whiteLists = this.commonWhiteList + '|' + whiteList;
                if (whiteLists.toLowerCase().indexOf(unsafeTagMatches[2].toLowerCase()) !== -1) {
                    return this.makeHolder(unsafeTagMatches[0]);
                } else {
                    return htmlspecialchars(unsafeTagMatches[0]);
                }
            }

            text = text.replace('<', '&lt;');
            text = text.replace('>', '&gt;');

            // footnote  \[\^((?:[^\]]|\\]|\\[)+?)\]
            var footnotePattern = new RegExp("[^((?:[^]]|\]|\[)+?)]");
            var footnoteMatches = footnotePattern.exec(text);
            if (footnoteMatches) {
                id = this.footnotes.indexOf(footnoteMatches[1]);

                if (id === -1) {
                    id = this.footnotes.length + 1;
                    this.footnotes[id] = footnoteMatches[1];
                }

                text = this.makeHolder('<sup id="fnref-' + id + '"><a href="#fn-' + id + '" class="footnote-ref">' + id + '</a></sup>');
            }

            // image
            var imagePattern1 = new RegExp("![((?:[^]]|\]|\[)*?)](([^)]+))");
            var imageMatches1 = imagePattern1.exec(text);
            if (imageMatches1) {
                var escaped = this.escapeBracket(imageMatches1[1]);
                text = this.makeHolder('<img src="' + imageMatches1[2] + '" alt="' + escaped + '" title="' + escaped + '">');
            }

            var imagePattern2 = new RegExp("![((?:[^]]|\]|\[)*?)][((?:[^]]|\]|\[)+)]");
            var imageMatches2 = imagePattern2.exec(text);
            if (imageMatches2) {
                var escaped = this.escapeBracket(imageMatches2[1]);
                var result = '';
                if (this.definitions[imageMatches2[2]]) {
                    result = '<img src="' + this.definitions[imageMatches2[2]] + '" alt="' + escaped + '" title="' + escaped + '">';
                } else {
                    result = escaped;
                }
                text = this.makeHolder(result);
            }

            // link
            var linkPattern1 = new RegExp("[((?:[^]]|\]|\[)+?)](([^)]+))");
            var linkMatches1 = linkPattern1.exec(text);
            if (linkMatches1) {
                var escaped = this.escapeBracket(linkMatches1[1]);
                text = this.makeHolder('<a href="' + linkMatches1[2] + '">' + escaped + '</a>');
            }

            var linkPattern2 = new RegExp("[((?:[^]]|\]|\[)+?)][((?:[^]]|\]|\[)+)]");
            var linkMatches2 = linkPattern2.exec(text);
            if (linkMatches2) {
                var escaped = this.escapeBracket(linkMatches2[1]);

                var result = this.definitions[linkMatches2[2]] ? '<a href="' + this.definitions[linkMatches2[2]] + '">' + escaped + '</a>' : escaped;

                text = this.makeHolder(result);
            }

            // escape
            var escapeMatches = /\\(`|\*|_)/.exec(text);
            if (escapeMatches) {
                text = this.makeHolder(htmlspecialchars(escapeMatches[1]));
            }

            // strong and em and some fuck
            text = text.replace(/(\s|^)(_|\*){3}(.+?)\1{3}(\s|$)/, "$1<strong><em>$3</em></strong>$4");
            text = text.replace(/(\s|^)(_|\*){2}(.+?)\1{2}(\s|$)/, "$1<strong>$3</strong>$4");
            text = text.replace(/(\s|^)(_|\*)(.+?)\1(\s|$)/, "$1<em>$3</em>$4");
            text = text.replace(/<(https?:\/\/.+)>/i, "<a href=\"$1\">$1</a>");

            // autolink
            text = text.replace(/(^|[^\"])((http|https|ftp|mailto):[_a-z0-9-\.\/%#@\?\+=~\|\,]+)($|[^\"])/i, "$1<a href=\"$2\">$2</a>$4");

            // release
            text = this.releaseHolder(text);

            text = this.call('afterParseInline', text);

            return text;
        }

        /**
         * parseBlock
         *
         * @param string text
         * @param array lines
         * @return array
         */
    }, {
        key: 'parseBlock',
        value: function parseBlock(text) {
            var lines = text.split("\n");
            this.blocks = [];
            this.current = 'normal';
            this.pos = -1;
            var special = Object.keys(this.specialWhiteList).join("|");
            var emptyCount = 0;

            // analyze by line
            for (var key in lines) {
                var line = lines[key];
                console.log(key);
                console.log(line);
                // code block is special
                if (matches = line.match("/^(~|`){3,}([^`~]*)$/i")) {
                    if (this.isBlock('code')) {
                        this.setBlock(key).endBlock();
                    } else {
                        this.startBlock('code', key, matches[2]);
                    }
                    continue;
                } else if (this.isBlock('code')) {
                    this.setBlock(key);
                    continue;
                }

                // html block is special too
                if (matches = line.match(/^\s*<({$special})(\s+[^>]*)?>/i)) {
                    tag = matches[1].toLowerCase();
                    if (!this.isBlock('html', tag) && !this.isBlock('pre')) {
                        this.startBlock('html', key, tag);
                    }

                    continue;
                } else if (matches = line.match(/<\/({$special})>\s*$/i)) {
                    tag = matches[1].toLowerCase();

                    if (this.isBlock('html', tag)) {
                        this.setBlock(key).endBlock();
                    }

                    continue;
                } else if (this.isBlock('html')) {
                    this.setBlock(key);
                    continue;
                }

                switch (true) {
                    // list
                    case /^(\s*)((?:[0-9a-z]\.)|\-|\+|\*)\s+/.test(line):
                        var matches = line.match(/^(\s*)((?:[0-9a-z]\.)|\-|\+|\*)\s+/);
                        var listSpace = matches[1].length;
                        var emptyCount = 0;

                        // opened
                        if (this.isBlock('list')) {
                            this.setBlock(key, space);
                        } else {
                            this.startBlock('list', key, listSpace);
                        }
                        break;

                    // footnote
                    case /^\[\^((?:[^\]]|\]|\[)+?)\]:/.test(line):
                        var footnoteMatches = line.match(/^\[\^((?:[^\]]|\]|\[)+?)\]:/);
                        var footnoteSpace = footnoteMatches[0].length - 1;
                        this.startBlock('footnote', key, [footnoteSpace, footNoteMatches[1]]);
                        break;

                    // definition
                    case /^\s*\[((?:[^\]]|\]|\[)+?)\]:\s*(.+)$/.test(line):
                        var definitionMatches = line.match(/^\s*\[((?:[^\]]|\]|\[)+?)\]:\s*(.+)$/);
                        this.definitions[definitionMatches[1]] = definitionMatches[2];
                        this.startBlock('definition', key).endBlock();
                        break;

                    // pre
                    case /^ {4,}/.test(line):
                        emptyCount = 0;
                        if (this.isBlock('pre')) {
                            this.setBlock(key);
                        } else if (this.isBlock('normal')) {
                            this.startBlock('pre', key);
                        }
                        break;

                    // table
                    case /^((?:(?:(?:[ :]*\-[ :]*)+(?:\||\+))|(?:(?:\||\+)(?:[ :]*\-[ :]*)+)|(?:(?:[ :]*\-[ :]*)+(?:\||\+)(?:[ :]*\-[ :]*)+))+)$/.test(line):
                        var tableMatches = line.match(/^((?:(?:(?:[ :]*\-[ :]*)+(?:\||\+))|(?:(?:\||\+)(?:[ :]*\-[ :]*)+)|(?:(?:[ :]*\-[ :]*)+(?:\||\+)(?:[ :]*\-[ :]*)+))+)$/);
                        if (this.isBlock('normal')) {
                            var block = this.getBlock();
                            var head = false;

                            if (block.length === 0 || block[0] !== 'normal' || /^\s*$/.exec(lines[block[2]])) {
                                this.startBlock('table', key);
                            } else {
                                head = true;
                                this.backBlock(1, 'table');
                            }

                            if (tableMatches[1][0] == '|') {
                                tableMatches[1] = tableMatches[1].substr(1);

                                if (tableMatches[1][tableMatches[1].length - 1] == '|') {
                                    tableMatches[1] = tableMatches[1].substr(0, -1);
                                }
                            }

                            var _rows = tableMatches[1].split(/(\+|\|)/);
                            var aligns = [];
                            var _iteratorNormalCompletion = true;
                            var _didIteratorError = false;
                            var _iteratorError = undefined;

                            try {
                                for (var _iterator = _rows[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                    var row = _step.value;

                                    var align = 'none';

                                    if (tableMatches = row.match(/^\s*(:?)\-+(:?)\s*$/)) {
                                        if (!tableMatches[1] && !tableMatches[2]) {
                                            align = 'center';
                                        } else if (!tableMatches[1]) {
                                            align = 'left';
                                        } else if (!tableMatches[2]) {
                                            align = 'right';
                                        }
                                    }

                                    aligns.push(align);
                                }
                            } catch (err) {
                                _didIteratorError = true;
                                _iteratorError = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion && _iterator['return']) {
                                        _iterator['return']();
                                    }
                                } finally {
                                    if (_didIteratorError) {
                                        throw _iteratorError;
                                    }
                                }
                            }

                            this.setBlock(key, [head, aligns]);
                        }
                        break;

                    // single heading
                    case /^(#+)(.*)$/.test(line):
                        var singleHeadingMatches = line.match(/^(#+)(.*)$/);
                        var num = Math.min(singleHeadingMatches[1].length, 6);
                        this.startBlock('sh', key, num).endBlock();
                        break;

                    // multi heading
                    case /^\s*((=|-){2,})\s*$/.test(line) && (this.getBlock() && !/^\s*$/.test(lines[this.getBlock()[2]])):
                        // check if last line isn't empty
                        var multiHeadingMatches = line.match(/^\s*((=|-){2,})\s*$/);
                        if (this.isBlock('normal')) {
                            this.backBlock(1, 'mh', multiHeadingMatches[1][0] == '=' ? 1 : 2).setBlock(key).endBlock();
                        } else {
                            this.startBlock('normal', key);
                        }
                        break;

                    // block quote
                    case /^>/.test(line):
                        if (this.isBlock('quote')) {
                            this.setBlock(key);
                        } else {
                            this.startBlock('quote', key);
                        }
                        break;

                    // hr
                    case /^[-\*]{3,}\s*$/.test(line):
                        this.startBlock('hr', key).endBlock();
                        break;

                    // normal
                    default:
                        if (this.isBlock('list')) {
                            var _matches = line.match(/^(\s*)/);

                            if (line.length == _matches[1].length) {
                                // empty line
                                if (emptyCount > 0) {
                                    this.startBlock('normal', key);
                                } else {
                                    this.setBlock(key);
                                }

                                emptyCount++;
                            } else if (_matches[1].length >= this.getBlock()[3] && emptyCount == 0) {
                                this.setBlock(key);
                            } else {
                                this.startBlock('normal', key);
                            }
                        } else if (this.isBlock('footnote')) {
                            var _matches2 = line.match(/^(\s*)/);

                            if (_matches2[1].length >= this.getBlock()[3][0]) {
                                this.setBlock(key);
                            } else {
                                this.startBlock('normal', key);
                            }
                        } else if (this.isBlock('table')) {
                            if (-1 !== line.indexOf('|')) {
                                this.setBlock(key);
                            } else {
                                this.startBlock('normal', key);
                            }
                        } else if (this.isBlock('pre')) {
                            if (/^\s*$/.test(line)) {
                                if (emptyCount > 0) {
                                    this.startBlock('normal', key);
                                } else {
                                    this.setBlock(key);
                                }

                                emptyCount++;
                            } else {
                                this.startBlock('normal', key);
                            }
                        } else {
                            var block = this.getBlock();
                            console.log(block);
                            if (!block || block[0] !== 'normal') {
                                this.startBlock('normal', key);
                            } else {
                                this.setBlock(key);
                            }
                        }
                        break;
                }
            }

            return this.optimizeBlocks(this.blocks, lines);
        }

        /**
         * @param array blocks
         * @param array lines
         * @return array
         */
    }, {
        key: 'optimizeBlocks',
        value: function optimizeBlocks(blocks, lines) {
            blocks = this.call('beforeOptimizeBlocks', blocks, lines);

            _lodash2['default'].forOwn(blocks, function (block, key) {
                var prevBlock = blocks[key - 1] ? blocks[key - 1] : null;
                var nextBlock = blocks[key + 1] ? blocks[key + 1] : null;

                var _block2 = _slicedToArray(block, 3);

                var type = _block2[0];
                var from = _block2[1];
                var to = _block2[2];

                if ('pre' === type) {
                    var isEmpty = lines.reduce(function (result, line) {
                        return line.match("/^\s*$/") && result;
                    }, true);

                    if (isEmpty) {
                        block[0] = type = 'normal';
                    }
                }

                if ('normal' === type) {
                    // one sigle empty line
                    if (from === to && lines[from].match(/^\s*$/) && prevBlock && nextBlock) {
                        if (prevBlock[0] === 'list' && nextBlock[0] === 'list') {
                            // combine 3 blocks
                            blocks[key - 1] = ['list', prevBlock[1], nextBlock[2], null];
                            array_splice(blocks, key, 2);
                        }
                    }
                }
            });

            return this.call('afterOptimizeBlocks', blocks, lines);
        }

        /**
         * parseCode
         *
         * @param array lines
         * @param string lang
         * @return string
         */
    }, {
        key: 'parseCode',
        value: function parseCode(lines, lang) {
            lang = lang.trim();
            lines = lines.slice(1, -1);

            return '<pre><code' + (lang ? ' class="' + lang + '"' : '') + '>'.htmlspecialchars(lines.join("\n")) + '</code></pre>';
        }

        /**
         * parsePre
         *
         * @param array lines
         * @return string
         */
    }, {
        key: 'parsePre',
        value: function parsePre(lines) {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = lines[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var line = _step2.value;

                    line = htmlspecialchars(line.substr(4));
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                        _iterator2['return']();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            return '<pre><code>' + lines.join("\n") + '</code></pre>';
        }

        /**
         * parseSh
         *
         * @param array lines
         * @param int num
         * @return string
         */
    }, {
        key: 'parseSh',
        value: function parseSh(lines, num) {
            console.log(lines);
            if (lines[0]) {
                var line = this.parseInline(lines[0].trim().replace(/^#+|#+$/g, ''));
                return line.match(/^\s*$/) ? '' : '<h' + num + '>' + line + '</h' + num + '>';
            } else {
                return '<h' + num + '></h' + num + '>';
            }
        }

        /**
         * parseMh
         *
         * @param array lines
         * @param int num
         * @return string
         */
    }, {
        key: 'parseMh',
        value: function parseMh(lines, num) {
            var line = this.parseInline(lines[0].trim().replace(/^#+|#+$/g, ''));
            return '<h' + num + '>' + line + '</h' + num + '>';
        }

        /**
         * parseQuote
         *
         * @param array lines
         * @return string
         */
    }, {
        key: 'parseQuote',
        value: function parseQuote(lines) {
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = lines[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var line = _step3.value;

                    line = line.replace(/^> ?/, '');
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3['return']) {
                        _iterator3['return']();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            return '<blockquote>' + this.parse(lines.join("\n")) + '</blockquote>';
        }

        /**
         * parseList
         *
         * @param array lines
         * @return string
         */
    }, {
        key: 'parseList',
        value: function parseList(lines) {
            html = '';
            minSpace = 99999;
            rows = [];

            // count levels
            _lodash2['default'].forOwn(lines, function (line, key) {
                var matches = line.match(/^(\s*)((?:[0-9a-z]\.?)|\-|\+|\*)(\s+)(.*)$/);
                if (matches) {
                    var _space = matches[1].length;
                    var type = -1 !== matches[2].indexOf('+-*') ? 'ul' : 'ol';
                    minSpace = Math.min(_space, minSpace);

                    rows.push([_space, type, line, matches[4]]);
                } else {
                    rows.push(line);
                }
            });

            var found = false;
            var secondMinSpace = 99999;
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = rows[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var row = _step4.value;

                    if (Array.isArray(row) && row[0] != minSpace) {
                        secondMinSpace = min(secondMinSpace, row[0]);
                        found = true;
                    }
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4['return']) {
                        _iterator4['return']();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            secondMinSpace = found || minSpace;

            var lastType = '';
            var leftLines = [];

            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = rows[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var row = _step5.value;

                    if (Array.isArray(row)) {
                        var _row = _slicedToArray(row, 4);

                        var _space2 = _row[0];
                        var type = _row[1];
                        var line = _row[2];
                        var text = _row[3];

                        if (_space2 !== minSpace) {
                            var pattern = new RegExp("^\s{" + secondMinSpace + "}");
                            leftLines.push(line.replace(pattern, ''));
                        } else {
                            if (lastType !== type) {
                                if (lastType) {
                                    html += '</' + lastType + '>';
                                }

                                html += '<' + type + '>';
                            }

                            if (leftLines) {
                                html += "<li>" + this.parse(leftLines.join("\n")) + "</li>";
                            }

                            leftLines = [text];
                            lastType = type;
                        }
                    } else {
                        var pattern = new RegExp("^\s{" + secondMinSpace + "}");
                        leftLines.push(row.replace(pattern, ''));
                    }
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5['return']) {
                        _iterator5['return']();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            if ($leftLines) {
                html += "<li>" + this.parse(lefftLines.join("\n")) + ('</li></' + lastType + '>');
            }

            return html;
        }

        /**
         * @param array lines
         * @param array value
         * @return string
         */
    }, {
        key: 'parseTable',
        value: function parseTable(lines, value) {
            var _this2 = this;

            var _value = _slicedToArray(value, 2);

            var head = _value[0];
            var aligns = _value[1];

            var ignore = head ? 1 : 0;

            var html = '<table>';
            var body = null;

            // function* entries(obj) {
            //   for (let key of Object.keys(obj)) {
            //     yield [key, obj[key]];
            //   }
            // }
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = lines[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var _step6$value = _slicedToArray(_step6.value, 2);

                    var key = _step6$value[0];
                    var line = _step6$value[1];

                    if (key === ignore) {
                        head = false;
                        body = true;
                        continue;
                    }

                    if (line[0] === '|') {
                        line = line.substr(1);
                        if (line[line.length - 1] === '|') {
                            line = line.substr(0, -1);
                        }
                    }

                    line = line.replace(/^(\|?)(.*?)\\1$/, "$2", line);
                    rows = line.split('|').map(function (item) {
                        return item.trim();
                    });
                    var columns = [];
                    var last = -1;

                    var _iteratorNormalCompletion7 = true;
                    var _didIteratorError7 = false;
                    var _iteratorError7 = undefined;

                    try {
                        for (var _iterator7 = rows[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                            var row = _step7.value;

                            if (row.length > 0) {
                                last++;
                                columns[last] = [1, row];
                            } else if (columns[last]) {
                                columns[last][0]++;
                            }
                        }
                    } catch (err) {
                        _didIteratorError7 = true;
                        _iteratorError7 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion7 && _iterator7['return']) {
                                _iterator7['return']();
                            }
                        } finally {
                            if (_didIteratorError7) {
                                throw _iteratorError7;
                            }
                        }
                    }

                    if (head) {
                        html += '<thead>';
                    } else if (body) {
                        html += '<tbody>';
                    }

                    html += '<tr>';

                    _lodash2['default'].forOwn(columns, function (column, key) {
                        var _column = _slicedToArray(column, 2);

                        var num = _column[0];
                        var text = _column[1];

                        var tag = head ? 'th' : 'td';

                        html += '<' + tag;
                        if (num > 1) {
                            html += ' colspan="' + num + '"';
                        }

                        if (aligns[key] && aligns[key] != 'none') {
                            html += ' align="' + aligns[key] + '"';
                        }

                        html += '>' + _this2.parseInline(text) + ('</' + tag + '>');
                    });

                    html += '</tr>';

                    if (head) {
                        html += '</thead>';
                    } else if (body) {
                        body = false;
                    }
                }
            } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion6 && _iterator6['return']) {
                        _iterator6['return']();
                    }
                } finally {
                    if (_didIteratorError6) {
                        throw _iteratorError6;
                    }
                }
            }

            if (body !== null) {
                html += '</tbody>';
            }

            html += '</table>';
            return html;
        }

        /**
         * parseHr
         *
         * @return string
         */
    }, {
        key: 'parseHr',
        value: function parseHr() {
            return '<hr>';
        }

        /**
         * parseNormal
         *
         * @param array lines
         * @return string
         */
    }, {
        key: 'parseNormal',
        value: function parseNormal(lines) {
            var _iteratorNormalCompletion8 = true;
            var _didIteratorError8 = false;
            var _iteratorError8 = undefined;

            try {
                for (var _iterator8 = lines[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                    var line = _step8.value;

                    line = this.parseInline(line);
                }
            } catch (err) {
                _didIteratorError8 = true;
                _iteratorError8 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion8 && _iterator8['return']) {
                        _iterator8['return']();
                    }
                } finally {
                    if (_didIteratorError8) {
                        throw _iteratorError8;
                    }
                }
            }

            var str = lines.join("\n");
            str = str.replace(/(\n\s*){2,}/, "</p><p>");
            str = str.replace(/\n/, "<br>");

            return !str ? '' : '<p>' + str + '</p>';
        }

        /**
         * parseFootnote
         *
         * @param array lines
         * @param array value
         * @return string
         */
    }, {
        key: 'parseFootnote',
        value: function parseFootnote(lines, value) {
            var _value2 = _slicedToArray(value, 2);

            var space = _value2[0];
            var note = _value2[1];

            var index = this.footnotes.indexOf(note);

            if (false !== index) {
                lines[0] = lines[0].replace(/^\[\^((?:[^\]]|\]|\[)+?)\]:/, '');
                this.footnotes[index] = lines;
            }

            return '';
        }

        /**
         * parseDefine
         *
         * @return string
         */
    }, {
        key: 'parseDefinition',
        value: function parseDefinition() {
            return '';
        }

        /**
         * parseHtml
         *
         * @param array lines
         * @param string type
         * @return string
         */
    }, {
        key: 'parseHtml',
        value: function parseHtml(lines, type) {
            var _iteratorNormalCompletion9 = true;
            var _didIteratorError9 = false;
            var _iteratorError9 = undefined;

            try {
                for (var _iterator9 = lines[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                    var line = _step9.value;

                    line = this.parseInline(line, this.specialWhiteList[type] ? this.specialWhiteList[type] : '');
                }
            } catch (err) {
                _didIteratorError9 = true;
                _iteratorError9 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion9 && _iterator9['return']) {
                        _iterator9['return']();
                    }
                } finally {
                    if (_didIteratorError9) {
                        throw _iteratorError9;
                    }
                }
            }

            return lines.join("\n");
        }

        /**
         * @param str
         * @return mixed
         */
    }, {
        key: 'escapeBracket',
        value: function escapeBracket(str) {
            return str.replace(['[', ']'], ['[', ']']);
        }

        /**
         * startBlock
         *
         * @param mixed type
         * @param mixed start
         * @param mixed value
         * @return this
         */
    }, {
        key: 'startBlock',
        value: function startBlock(type, start) {
            var value = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

            this.pos++;
            this.current = type;
            this.blocks[this.pos] = [type, start, start, value];

            return this;
        }

        /**
         * endBlock
         *
         * @return this
         */
    }, {
        key: 'endBlock',
        value: function endBlock() {
            this.current = 'normal';
            return this;
        }

        /**
         * isBlock
         *
         * @param mixed type
         * @param mixed value
         * @return bool
         */
    }, {
        key: 'isBlock',
        value: function isBlock(type) {
            var value = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

            return this.current == type && (null === value ? true : this.blocks[this.pos][3] == value);
        }

        /**
         * getBlock
         *
         * @return array
         */
    }, {
        key: 'getBlock',
        value: function getBlock() {
            console.log(this.pos);
            return this.blocks[this.pos] ? this.blocks[this.pos] : null;
        }

        /**
         * setBlock
         *
         * @param mixed to
         * @param mixed value
         * @return this
         */
    }, {
        key: 'setBlock',
        value: function setBlock() {
            var to = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
            var value = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

            console.log(this.blocks);
            if (null !== to) {
                this.blocks[this.pos][2] = to;
            }

            if (null !== value) {
                this.blocks[this.pos][3] = value;
            }

            return this;
        }

        /**
         * backBlock
         *
         * @param mixed step
         * @param mixed type
         * @param mixed value
         * @return this
         */
    }, {
        key: 'backBlock',
        value: function backBlock(step, type) {
            var value = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

            if (this.pos < 0) {
                return this.startBlock(type, 0, value);
            }

            var last = this.blocks[this.pos][2];
            this.blocks[this.pos][2] = last - step;

            if (this.blocks[this.pos][1] <= this.blocks[this.pos][2]) {
                this.pos++;
            }

            this.current = type;
            this.blocks[this.pos] = [type, last - step + 1, last, value];

            return this;
        }
    }]);

    return Parser;
})();

var parser = new Parser();
// console.log(parser.makeHtml('#qw#\n__sdsd__\nasfsadf'))

if (typeof module !== 'undefined' && typeof exports === 'object') {
    module.exports = parser.makeHtml;
} else if (typeof define === 'function' && define.amd) {
    define(function () {
        return parser.makeHtml;
    });
} else {
    undefined.hyperdown = parser.makeHtml;
}