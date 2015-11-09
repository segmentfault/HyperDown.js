/**
 * Parser in ECMAScript 6
 *
 * @copyright Copyright (c) 2012 SegmentFault Team. (http://segmentfault.com)
 * @author Integ <integ@segmentfault.com>
 * @license BSD License
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

require('babel-core/polyfill');

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
        this.holders = new Map();
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
            if (this.hooks[type]) {
                this.hooks[type].push(callback);
            } else {
                this.hooks[type] = [callback];
            }
        }

        /**
         * @param str
         * @return string
         */
    }, {
        key: 'makeHolder',
        value: function makeHolder(str) {
            var key = '|\r' + this.uniqid + this.id + '\r|';
            this.id++;
            this.holders[key] = str;
            return key;
        }

        /**
         * @param text
         * @return mixed
         */
    }, {
        key: 'initText',
        value: function initText(text) {
            if (text) {
                text = text.replace(/\t/g, '    ');
                text = text.replace(/\r/g, '');
            } else {
                text = '';
            }
            return text;
        }

        /**
         * @param html
         * @return string
         */
    }, {
        key: 'makeFootnotes',
        value: function makeFootnotes(html) {
            var _this2 = this;

            if (this.footnotes.length > 0) {
                (function () {
                    html += '<div class="footnotes"><hr><ol>';
                    var index = 1;
                    _this2.footnotes.forEach(function (val) {
                        if (typeof val === 'string') {
                            val += ' <a href="#fnref-' + index + '" class="footnote-backref">&#8617;</a>';
                        } else {
                            val[val.length - 1] += ' <a href="#fnref-' + index + '" class="footnote-backref">&#8617;</a>';
                            val = val.length > 1 ? _this2.parse(val.join("\n")) : _this2.parseInline(val[0]);
                        }

                        html += '<li id="fn-' + index + '">' + val + '</li>';
                        index++;
                    });
                    html += '</ol></div>';
                })();
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
            var _this3 = this;

            var lines = text.split("\n");
            var blocks = this.parseBlock(text, lines);
            var html = '';

            blocks.forEach(function (block) {
                var _block = _slicedToArray(block, 4);

                var type = _block[0];
                var start = _block[1];
                var end = _block[2];
                var value = _block[3];

                var extract = lines.slice(start, end + 1);
                var method = 'parse' + type.slice(0, 1).toUpperCase() + type.slice(1);
                var beforeMethod = 'beforeParse' + type.slice(0, 1).toUpperCase() + type.slice(1);
                extract = _this3.call(beforeMethod, extract, value);
                var result = _this3[method](extract, value);
                result = _this3.call('after' + method.slice(0, 1).toUpperCase() + method.slice(1), result, value);

                html += result;
            });
            if (this.hooks.afterParse) {
                html = this.call('afterParse', html);
            }
            return html;
        }

        /**
         * @param type
         * @param value
         * @return mixed
         */
    }, {
        key: 'call',
        value: function call(type, value) {
            if (!this.hooks[type]) {
                return value;
            }

            var args = [].slice.call(arguments);
            args = args.slice(1);

            this.hooks[type].forEach(function (callback) {
                value = callback.apply(null, args);
                args[0] = value;
            });

            return value;
        }

        /**
         * @param text
         * @param clearHolders
         * @return string
         */
    }, {
        key: 'releaseHolder',
        value: function releaseHolder(text) {
            var clearHolders = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

            var deep = 0;
            while (text.indexOf("|\r") !== -1 && deep < 10) {
                for (var key in this.holders) {
                    var value = this.holders[key];
                    text = text.replace(key, value);
                }
                deep++;
            }
            if (clearHolders) {
                this.holders.clear();
            }
            return text;
        }

        /**
         * parseInline
         *
         * @param string text
         * @param string whiteList
         * @param bool clearHolders
         * @return string
         */
    }, {
        key: 'parseInline',
        value: function parseInline(text) {
            var _this4 = this;

            var whiteList = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
            var clearHolders = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

            text = this.call('beforeParseInline', text);
            var _this = this;
            // code
            text = text.replace(/(^|[^\\])(`+)(.+?)\2/g, function (match, p1, p2, p3) {
                return p1 + _this.makeHolder('<code>' + _this.htmlspecialchars(p3) + '</code>');
            });

            // link
            text = text.replace(/<(https?:\/\/.+)>/ig, function (match, p1) {
                return _this4.makeHolder('<a href="' + p1 + '">' + p1 + '</a>');
            });

            text = text.replace(/<(\/?)([a-z0-9-]+)(\s+[^>]*)?>/ig, function (match, p1, p2, p3) {
                var whiteLists = _this4.commonWhiteList + '|' + whiteList;
                if (whiteLists.toLowerCase().indexOf(p2.toLowerCase()) !== -1) {
                    return _this4.makeHolder(match);
                } else {
                    return _this4.htmlspecialchars(match);
                }
            });

            text = text.replace(/</g, '&lt;');
            text = text.replace(/>/g, '&gt;');

            // footnote
            var footnotePattern = /\[\^((?:[^\]]|\]|\[)+?)\]/g;
            text = text.replace(footnotePattern, function (match, p1, p2) {
                var id = _this.footnotes.indexOf(p1);

                if (id === -1) {
                    id = _this.footnotes.length;
                    _this.footnotes.push(_this4.parseInline(p1, '', false));
                }

                return _this.makeHolder('<sup id="fnref-' + (id + 1) + '"><a href="#fn-' + (id + 1) + '" class="footnote-ref">' + (id + 1) + '</a></sup>');
            });

            // image
            var imagePattern1 = /!\[((?:[^\]]|\]|\[)*?)\]\(((?:[^\)]|\)|\()+?)\)/g;
            text = text.replace(imagePattern1, function (match, p1, p2) {
                var escaped = _this.escapeBracket(p1);
                var url = _this.escapeBracket(p2);
                return _this.makeHolder('<img src="' + url + '" alt="' + escaped + '" title="' + escaped + '">');
            });

            var imagePattern2 = /!\[((?:[^\]]|\]|\[)*?)\]\[((?:[^\]]|\]|\[)+?)\]/g;
            text = text.replace(imagePattern2, function (match, p1, p2) {
                var escaped = _this.escapeBracket(p1);
                var result = '';
                if (_this.definitions[p2]) {
                    result = '<img src="' + _this.definitions[p2] + '" alt="' + escaped + '" title="' + escaped + '">';
                } else {
                    result = escaped;
                }
                return _this.makeHolder(result);
            });

            // link
            var linkPattern1 = /\[((?:[^\]]|\]|\[)+?)\]\(((?:[^\)]|\)|\()+?)\)/g;
            text = text.replace(linkPattern1, function (match, p1, p2) {
                var escaped = _this.parseInline(_this.escapeBracket(p1), '', false);
                var url = _this.escapeBracket(p2);
                return _this.makeHolder('<a href="' + url + '">' + escaped + '</a>');
            });

            var linkPattern2 = /\[((?:[^\]]|\]|\[)+?)\]\[((?:[^\]]|\]|\[)+?)\]/g;
            text = text.replace(linkPattern2, function (match, p1, p2) {
                var escaped = _this.parseInline(_this.escapeBracket(p1), '', false);

                var result = _this.definitions[p2] ? '<a href="' + _this.definitions[p2] + '">' + escaped + '</a>' : escaped;

                return _this.makeHolder(result);
            });

            // escape
            text = text.replace(/\\(`|\*|_|~)/g, function (match, p1) {
                return _this.makeHolder(_this.htmlspecialchars(p1));
            });

            // strong and em and some fuck
            text = this.parseInlineCallback(text);
            text = text.replace(/<([_a-z0-9-\.\+]+@[^@]+\.[a-z]{2,})>/ig, "<a href=\"mailto:$1\">$1</a>");

            // autolink url
            text = text.replace(/(^|[^"])((http|https|ftp|mailto):[_a-z0-9-\.\/%#@\?\+=~\|\,&\(\)]+)($|[^"])/ig, "$1<a href=\"$2\">$2</a>$4");

            text = this.call('afterParseInlineBeforeRelease', text);

            // release
            text = this.releaseHolder(text, clearHolders);

            text = this.call('afterParseInline', text);

            return text;
        }

        /**
         * @param text
         * @return mixed
         */
    }, {
        key: 'parseInlineCallback',
        value: function parseInlineCallback(text) {
            var _this5 = this;

            text = text.replace(/(\*{3})(.+?)\1/g, function (match, p1, p2) {
                return '<strong><em>' + _this5.parseInlineCallback(p2) + '</em></strong>';
            });

            text = text.replace(/(\*{2})(.+?)\1/g, function (match, p1, p2) {
                return '<strong>' + _this5.parseInlineCallback(p2) + '</strong>';
            });

            text = text.replace(/(\*)(.+?)\1/g, function (match, p1, p2) {
                return '<em>' + _this5.parseInlineCallback(p2) + '</em>';
            });

            text = text.replace(/(\s+|^)(_{3})(.+?)\2(\s+|$)/g, function (match, p1, p2, p3, p4) {
                return p1 + '<strong><em>' + _this5.parseInlineCallback(p3) + '</em></strong>' + p4;
            });

            text = text.replace(/(\s+|^)(_{2})(.+?)\2(\s+|$)/g, function (match, p1, p2, p3, p4) {
                return p1 + '<strong>' + _this5.parseInlineCallback(p3) + '</strong>' + p4;
            });

            text = text.replace(/(\s+|^)(_)(.+?)\2(\s+|$)/g, function (match, p1, p2, p3, p4) {
                return p1 + '<em>' + _this5.parseInlineCallback(p3) + '</em>' + p4;
            });

            text = text.replace(/(~{2})(.+?)\1/g, function (match, p1, p2) {
                return '<del>' + _this5.parseInlineCallback(p2) + '</del>';
            });
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
        value: function parseBlock(text, lines) {
            var _this6 = this;

            this.blocks = [];
            this.current = 'normal';
            this.pos = -1;
            var special = Object.keys(this.specialWhiteList).join("|");
            var emptyCount = 0;
            // analyze by line
            for (var key in lines) {
                key = parseInt(key); // ES6 的 for key in Array 循环时返回的 key 是字符串，不是 int
                var line = lines[key];
                // code block is special
                if (matches = line.match(/^(\s*)(~|`){3,}([^`~]*)$/i)) {
                    if (this.isBlock('code')) {
                        var block = this.getBlock();
                        var isAfterList = block[3][2];

                        if (isAfterList) {
                            this.combineBlock().setBlock(key);
                        } else {
                            this.setBlock(key).endBlock();
                        }
                    } else {
                        var isAfterList = false;
                        if (this.isBlock('list')) {
                            var block = this.getBlock();
                            var space = block[3];
                            isAfterList = space > 0 && matches[1].length >= space || matches[1].length > space;
                        }
                        this.startBlock('code', key, [matches[1], matches[3], isAfterList]);
                    }
                    continue;
                } else if (this.isBlock('code')) {
                    this.setBlock(key);
                    continue;
                }

                // html block is special too
                var htmlPattern1 = new RegExp('^\s*<(' + special + ')(\s+[^>]*)?>', 'i');
                var htmlPattern2 = new RegExp('<\/(' + special + ')>\s*$', 'i');
                if (matches = line.match(htmlPattern1)) {
                    var tag = matches[1].toLowerCase();
                    if (!this.isBlock('html', tag) && !this.isBlock('pre')) {
                        this.startBlock('html', key, tag);
                    }

                    continue;
                } else if (matches = line.match(htmlPattern2)) {
                    var tag = matches[1].toLowerCase();

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
                        emptyCount = 0;

                        // opened
                        if (this.isBlock('list')) {
                            this.setBlock(key, listSpace);
                        } else {
                            this.startBlock('list', key, listSpace);
                        }
                        break;

                    // footnote
                    case /^\[\^((?:[^\]]|\]|\[)+?)\]:/.test(line):
                        var footnoteMatches = /^\[\^((?:[^\]]|\]|\[)+?)\]:/.exec(line);
                        var footnoteSpace = footnoteMatches[0].length - 1;
                        this.startBlock('footnote', key, [footnoteSpace, footnoteMatches[1]]);
                        break;

                    // definition
                    case /^\s*\[((?:[^\]]|\]|\[)+?)\]:\s*(.+)$/.test(line):
                        var definitionMatches = line.match(/^\s*\[((?:[^\]]|\]|\[)+?)\]:\s*(.+)$/);
                        this.definitions[definitionMatches[1]] = definitionMatches[2];
                        this.startBlock('definition', key).endBlock();
                        break;

                    // block quote
                    case /^\s*>/.test(line):
                        if (this.isBlock('quote')) {
                            this.setBlock(key);
                        } else {
                            this.startBlock('quote', key);
                        }
                        break;

                    // pre
                    case /^ {4}/.test(line):
                        emptyCount = 0;

                        if (this.isBlock('pre') || this.isBlock('list')) {
                            this.setBlock(key);
                        } else if (this.isBlock('normal')) {
                            this.startBlock('pre', key);
                        }
                        break;

                    // table
                    case /^((?:(?:(?:[ :]*\-[ :]*)+(?:\||\+))|(?:(?:\||\+)(?:[ :]*\-[ :]*)+)|(?:(?:[ :]*\-[ :]*)+(?:\||\+)(?:[ :]*\-[ :]*)+))+)$/g.test(line):
                        var tableMatches = /^((?:(?:(?:[ :]*\-[ :]*)+(?:\||\+))|(?:(?:\||\+)(?:[ :]*\-[ :]*)+)|(?:(?:[ :]*\-[ :]*)+(?:\||\+)(?:[ :]*\-[ :]*)+))+)$/g.exec(line);
                        if (this.isBlock('normal')) {
                            (function () {
                                var block = _this6.getBlock();
                                var head = false;

                                if (block.length === 0 || block[0] !== 'normal' || /^\s*$/.test(lines[block[2]])) {
                                    _this6.startBlock('table', key);
                                } else {
                                    head = true;
                                    _this6.backBlock(1, 'table');
                                }

                                if (tableMatches[1][0] == '|') {
                                    tableMatches[1] = tableMatches[1].substr(1);

                                    if (tableMatches[1][tableMatches[1].length - 1] == '|') {
                                        tableMatches[1] = tableMatches[1].slice(0, -1);
                                    }
                                }

                                var rows = tableMatches[1].split(/(\+|\|)/);
                                var aligns = [];
                                rows.forEach(function (row) {
                                    var align = 'none';

                                    if (tableMatches = row.match(/^\s*(:?)\-+(:?)\s*$/)) {
                                        if (tableMatches[1] && tableMatches[2]) {
                                            align = 'center';
                                        } else if (tableMatches[1]) {
                                            align = 'left';
                                        } else if (tableMatches[2]) {
                                            align = 'right';
                                        }
                                    }

                                    aligns.push(align);
                                });

                                _this6.setBlock(key, [head, aligns]);
                            })();
                        }
                        break;

                    // single heading
                    case /^(#+)(.*)$/.test(line):
                        var singleHeadingMatches = line.match(/^(#+)(.*)$/);
                        var num = Math.min(singleHeadingMatches[1].length, 6);
                        this.startBlock('sh', key, num).endBlock();
                        break;

                    // multi heading
                    case /^\s*((=|-){2,})\s*$/.test(line) && (this.getBlock() && this.getBlock()[0] === 'normal' && !/^\s*$/.test(lines[this.getBlock()[2]])):
                        // check if last line isn't empty
                        var multiHeadingMatches = line.match(/^\s*((=|-){2,})\s*$/);
                        if (this.isBlock('normal')) {
                            this.backBlock(1, 'mh', multiHeadingMatches[1][0] == '=' ? 1 : 2).setBlock(key).endBlock();
                        } else {
                            this.startBlock('normal', key);
                        }
                        break;

                    // hr
                    case /^[-\*]{3,}\s*$/.test(line):
                        this.startBlock('hr', key).endBlock();
                        break;

                    // normal
                    default:
                        if (this.isBlock('list')) {
                            // let matches = line.match(/^(\s*)/)
                            //
                            // if (line.length == matches[1].length) { // empty line
                            if (/^(\s*)/.test(line)) {
                                // empty line
                                if (emptyCount > 0) {
                                    this.startBlock('normal', key);
                                } else {
                                    this.setBlock(key);
                                }

                                emptyCount++;
                            } else if (emptyCount === 0) {
                                this.setBlock(key);
                            } else {
                                this.startBlock('normal', key);
                            }
                        } else if (this.isBlock('footnote')) {
                            var _matches = line.match(/^(\s*)/);

                            if (_matches[1].length >= this.getBlock()[3][0]) {
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
                        } else if (this.isBlock('quote')) {
                            if (/^(\s*)/.test(line)) {
                                // empty line
                                if (emptyCount > 0) {
                                    this.startBlock('normal', key);
                                } else {
                                    this.setBlock(key);
                                }

                                emptyCount++;
                            } else if ($emptyCount == 0) {
                                this.setBlock(key);
                            } else {
                                this.startBlock('normal', key);
                            }
                        } else {
                            var block = this.getBlock();
                            if (block === null || block.length === 0 || block[0] !== 'normal') {
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

            blocks.forEach(function (block, key) {
                var prevBlock = blocks[key - 1] ? blocks[key - 1] : null;
                var nextBlock = blocks[key + 1] ? blocks[key + 1] : null;

                var _block2 = _slicedToArray(block, 3);

                var type = _block2[0];
                var from = _block2[1];
                var to = _block2[2];

                if ('pre' === type) {
                    var isEmpty = lines.reduce(function (result, line) {
                        return line.match(/^\s*$/) && result;
                    }, true);

                    if (isEmpty) {
                        block[0] = type = 'normal';
                    }
                }

                if ('normal' === type) {
                    // combine two blocks
                    var types = ['list', 'quote'];

                    if (from === to && lines[from].match(/^\s*$/) && prevBlock && nextBlock) {
                        if (prevBlock[0] == nextBlock[0] && types.indexOf(prevBlock[0]) !== -1) {
                            // combine 3 blocks
                            blocks[key - 1] = [prevBlock[0], prevBlock[1], nextBlock[2], null];
                            blocks.splice(key, 2);
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
        value: function parseCode(lines, parts) {
            var _parts = _slicedToArray(parts, 2);

            var blank = _parts[0];
            var lang = _parts[1];

            lang = lang.trim();
            var count = blank.length;

            if (!/^[_a-z0-9-\+\#]+$/i.test(lang)) {
                lang = null;
            }

            lines = lines.slice(1, -1).map(function (line) {
                var pattern = new RegExp('/^[ ]{' + count + '}/');
                return line.replace(pattern, '');
            });
            var str = lines.join('\n');

            return (/^\s*$/.test(str) ? '' : '<pre><code' + (lang ? ' class="' + lang + '"' : '') + '>' + this.htmlspecialchars(lines.join('\n')) + '</code></pre>'
            );
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
            var _this7 = this;

            lines.forEach(function (line, ind) {
                lines[ind] = _this7.htmlspecialchars(line.substr(4));
            });
            var str = lines.join('\n');

            return (/^\s*$/.test(str) ? '' : '<pre><code>' + str + '</code></pre>'
            );
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
            if (lines[0]) {
                var line = this.parseInline(lines[0].trim().replace(/^#+|#+$/g, ''));
                return (/^\s*$/.test(line) ? '' : '<h' + num + '>' + line + '</h' + num + '>'
                );
            } else {
                return '';
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
            if (lines[0]) {
                var line = this.parseInline(lines[0].trim().replace(/^#+|#+$/g, ''));
                return (/^\s*$/.test(line) ? '' : '<h' + num + '>' + line + '</h' + num + '>'
                );
            } else {
                return '';
            }
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
            lines.forEach(function (line, key) {
                lines[key] = line.replace(/^\s*> ?/, '');
            });
            var str = lines.join('\n');
            return (/^\s*$/.test(str) ? '' : '<blockquote>' + this.parse(str) + '</blockquote>'
            );
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
            var _this8 = this;

            var html = '';
            var minSpace = 99999;
            var rows = [];

            // count levels
            lines.forEach(function (line, key) {
                var matches = line.match(/^(\s*)((?:[0-9a-z]+\.?)|\-|\+|\*)(\s+)(.*)$/);
                if (matches) {
                    var space = matches[1].length;
                    var type = /[\+\-\*]/.test(matches[2]) ? 'ul' : 'ol';
                    minSpace = Math.min(space, minSpace);

                    rows.push([space, type, line, matches[4]]);
                } else {
                    rows.push(line);
                }
            });

            var found = false;
            var secondMinSpace = 99999;
            rows.forEach(function (row) {
                if (Array.isArray(row) && row[0] != minSpace) {
                    secondMinSpace = Math.min(secondMinSpace, row[0]);
                    found = true;
                }
            });
            secondMinSpace = found ? 0 : minSpace;

            var lastType = '';
            var leftLines = [];

            rows.forEach(function (row) {
                if (Array.isArray(row)) {
                    var _row = _slicedToArray(row, 4);

                    var space = _row[0];
                    var type = _row[1];
                    var line = _row[2];
                    var text = _row[3];

                    if (space !== minSpace) {
                        var pattern = new RegExp("^\s{" + secondMinSpace + "}");
                        leftLines.push(line.replace(pattern, ''));
                    } else {
                        if (leftLines.length) {
                            html += "<li>" + _this8.parse(leftLines.join("\n")) + "</li>";
                        }
                        if (lastType !== type) {
                            if (lastType.length) {
                                html += '</' + lastType + '>';
                            }

                            html += '<' + type + '>';
                        }

                        leftLines = [text];
                        lastType = type;
                    }
                } else {
                    var pattern = new RegExp("^\s{" + secondMinSpace + "}");
                    leftLines.push(row.replace(pattern, ''));
                }
            });

            if (leftLines.length) {
                html += "<li>" + this.parse(leftLines.join("\n")) + ('</li></' + lastType + '>');
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
            var _this9 = this;

            var _value = _slicedToArray(value, 2);

            var head = _value[0];
            var aligns = _value[1];

            var ignore = head ? 1 : 0;

            var html = '<table>';
            var body = false;

            var _loop = function (key) {
                var line = lines[key];
                if (parseInt(key) === ignore) {
                    head = false;
                    body = true;
                    return 'continue';
                }

                if (line) {
                    line = line.trim();
                }

                if (line[0] === '|') {
                    line = line.substr(1);

                    if (line[line.length - 1] === '|') {
                        line = line.slice(0, -1);
                    }
                }

                var rows = line.split('|').map(function (row) {
                    if (row.match(/^\s+$/)) {
                        return ' ';
                    } else {
                        return row.trim();
                    }
                });

                var columns = [];
                var last = -1;

                rows.forEach(function (row) {
                    if (row.length > 0) {
                        last++;
                        columns[last] = [columns[last] ? columns[last][0] + 1 : 1, row];
                    } else if (columns[last]) {
                        columns[last][0]++;
                    } else {
                        columns[0] = [1, row];
                    }
                });

                if (head === true) {
                    html += '<thead>';
                } else if (body === true) {
                    html += '<tbody>';
                }

                html += '<tr>';

                columns.forEach(function (column, key) {
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

                    html += '>' + _this9.parseInline(text) + ('</' + tag + '>');
                });

                html += '</tr>';

                if (head) {
                    html += '</thead>';
                } else if (body) {
                    body = false;
                }
            };

            for (var key in lines) {
                var _ret3 = _loop(key);

                if (_ret3 === 'continue') continue;
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
            var _this10 = this;

            lines = lines.map(function (line) {
                return _this10.parseInline(line);
            });

            var str = lines.join("\n").trim();
            str = str.replace(/(\n\s*){2,}/g, "</p><p>");
            str = str.replace(/\n/g, "<br>");

            return (/^\s*$/.test(str) ? '' : '<p>' + str + '</p>'
            );
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
            if (-1 !== index) {
                if (lines[0]) {
                    lines[0] = lines[0].replace(/^\[\^((?:[^\]]|\]|\[)+?)\]:/, '');
                }
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
            var _this11 = this;

            lines.forEach(function (line) {
                line = _this11.parseInline(line, _this11.specialWhiteList[type] ? _this11.specialWhiteList[type] : '');
            });

            return lines.join("\n");
        }

        /**
         * @param str
         * @return mixed
         */
    }, {
        key: 'escapeBracket',
        value: function escapeBracket(str) {
            if (str) {
                str = str.replace(/\[/g, '[');
                str = str.replace(/\]/g, ']');
                str = str.replace(/\(/g, '(');
                str = str.replace(/\)/g, ')');
                return str;
            }
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

        /**
         * htmlspecialchars
         *
         * @param text
         * @return string
         */
    }, {
        key: 'htmlspecialchars',
        value: function htmlspecialchars(text) {
            var map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };

            return text.replace(/[&<>"']/g, function (m) {
                return map[m];
            });
        }

        /**
         * @return this
         */
    }, {
        key: 'combineBlock',
        value: function combineBlock() {
            if (this.pos < 1) {
                return this;
            }

            var prev = this.blocks[this.pos - 1];
            var current = this.blocks[this.pos];

            prev[2] = current[2];
            this.blocks[this.pos - 1] = prev;
            this.current = prev[0];
            this.blocks.splice(this.pos, 1);
            this.pos--;

            return this;
        }
    }]);

    return Parser;
})();

exports['default'] = Parser;
module.exports = exports['default'];
