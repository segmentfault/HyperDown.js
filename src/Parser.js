/**
 * Parser in ECMAScript 6
 *
 * @copyright Copyright (c) 2012 SegmentFault Team. (http://segmentfault.com)
 * @author Integ <integ@segmentfault.com>
 * @license BSD License
 */
import "babel-polyfill";

export default class Parser {
    constructor() {
        this.commonWhiteList = 'kbd|b|i|strong|em|sup|sub|br|code|del|a|hr|small';
        this.specialWhiteList = {
            table: 'table|tbody|thead|tfoot|tr|td|th'
        };
        this.footnotes;
        this.blocks;
        this.current;
        this.pos;
        this.definitions;
        this.hooks = {};
        this.holders;
        this.uniqid;
        this.id;
    }

    md5(prefix, more_entropy) {
        //  discuss at: http://phpjs.org/functions/uniqid/
        // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        //  revised by: Kankrelune (http://www.webfaktory.info/)
        //        note: Uses an internal counter (in php_js global) to avoid collision
        //        test: skip
        //   example 1: uniqid();
        //   returns 1: 'a30285b160c14'
        //   example 2: uniqid('foo');
        //   returns 2: 'fooa30285b1cd361'
        //   example 3: uniqid('bar', true);
        //   returns 3: 'bara20285b23dfd1.31879087'

        if (typeof prefix === 'undefined') {
            prefix = '';
        }

        var retId;
        var formatSeed = function (seed, reqWidth) {
            seed = parseInt(seed, 10).toString(16); // to hex str
            if (reqWidth < seed.length) {
                // so long we split
                return seed.slice(seed.length - reqWidth);
            }
            if (reqWidth > seed.length) {
                // so short we pad
                return Array(1 + (reqWidth - seed.length)).join('0') + seed;
            }
            return seed;
        };

        let uniqidSeed = Math.floor(Math.random() * 0x75bcd15);

        uniqidSeed++;

        retId = prefix; // start with prefix, add current milliseconds hex string
        retId += formatSeed(parseInt(new Date().getTime() / 1000, 10), 8);
        retId += formatSeed(uniqidSeed, 5); // add seed hex string
        if (more_entropy) {
            // for more entropy we add a float lower to 10
            retId += (Math.random() * 10).toFixed(8).toString();
        }

        return retId;
    }

    /**
     * makeHtml
     *
     * @param mixed text
     * @return string
     */
    makeHtml(text) {
        this.footnotes = [];
        this.definitions = [];
        this.holders = [];
        this.uniqid = this.md5();
        this.id = 0;
        
        text = this.initText(text);
        let html = this.parse(text);
        html = this.makeFootnotes(html);
        if (this.hooks.afterParse) {
            html = this.call('afterParse', html);
        }
        return html;
    }

    /**
     * @param type
     * @param callback
     */
    hook(type, callback) {
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
    makeHolder(str) {
        let key = '|\r' + this.uniqid + this.id + '\r|';
        this.id++;
        this.holders[key] = str;
        return key;
    }

    /**
     * @param text
     * @return mixed
     */
    initText(text) {
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
    makeFootnotes(html) {
        if (this.footnotes.length > 0) {
            html += '<div class="footnotes"><hr><ol>';
            let index = 1;
            let val = this.footnotes.shift();
            while (val) {
                if (typeof val === 'string') {
                    val += ` <a href="#fnref-${ index }" class="footnote-backref">&#8617;</a>`;
                } else {
                    val[val.length - 1] += ` <a href="#fnref-${ index }" class="footnote-backref">&#8617;</a>`;
                    val = val.length > 1 ? this.parse(val.join("\n")) : this.parseInline(val[0]);
                }

                html += `<li id="fn-${ index }">${ val }</li>`;
                index++;
                val = this.footnotes.shift();
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
    parse(text) {
        let lines = text.split("\n");
        let blocks = this.parseBlock(text, lines);
        let html = '';

        blocks.forEach(block => {
            let [type, start, end, value] = block;
            let extract = lines.slice(start, end + 1);
            let method = 'parse' + type.slice(0, 1).toUpperCase() + type.slice(1);

            let beforeMethod = 'before' + method.slice(0, 1).toUpperCase() + method.slice(1);
            extract = this.call(beforeMethod, extract, value);
            let result = this[method](extract, value);
            result = this.call('after' + method.slice(0, 1).toUpperCase() + method.slice(1), result, value);

            html += result;
        });
        return html;
    }

    /**
     * @param type
     * @param value
     * @return mixed
     */
    call(type, value) {
        if (!this.hooks[type]) {
            return value;
        }

        let args = [].slice.call(arguments);
        args = args.slice(1);

        this.hooks[type].forEach(callback => {
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
    releaseHolder(text, clearHolders = true) {
        let deep = 0;
        while (text.indexOf("|\r") !== -1 && deep < 10) {
            for (let key in this.holders) {
                let value = this.holders[key];
                text = text.replace(key, value);
            }
            deep++;
        }
        if (clearHolders) {
            this.holders= [];
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
    parseInline(text, whiteList = '', clearHolders = true,enableAutoLink = true) {
        text = this.call('beforeParseInline', text);
        let _this = this;
        
        // code
        text = text.replace(/(^|[^\\])(`+)(.+?)\2/g, (match, p1, p2, p3) => {
            return p1 + _this.makeHolder('<code>' + _this.htmlspecialchars(p3) + '</code>');
        });

        // link
        text = text.replace(/<(https?:\/\/.+)>/ig, (match, p1) => {
            return _this.makeHolder(`<a href="${ p1 }">${ p1 }</a>`);
        });

        // encode unsafe tags
        text = text.replace(/<(\/?)([a-z0-9-]+)(\s+[^>]*)?>/ig, (match, p1, p2, p3) => {
            let whiteLists = _this.commonWhiteList + '|' + whiteList;
            if (whiteLists.toLowerCase().indexOf(p2.toLowerCase()) !== -1) {
                return _this.makeHolder(match);
            } else {
                return _this.htmlspecialchars(match);
            }
        });

        text = text.replace(/</g, '&lt;');
        text = text.replace(/>/g, '&gt;');

        // footnote
        let footnotePattern = /\[\^((?:[^\]]|\]|\[)+?)\]/g;
        text = text.replace(footnotePattern, (match, p1, p2) => {
            let id = _this.footnotes.indexOf(p1);

            if (id === -1) {
                id = _this.footnotes.length;
                _this.footnotes.push(this.parseInline(p1, '', false));
            }

            return _this.makeHolder(`<sup id="fnref-${ id + 1 }"><a href="#fn-${ id + 1 }" class="footnote-ref">${ id + 1 }</a></sup>`);
        });

        // image
        let imagePattern1 = /!\[((?:[^\]]|\]|\[)*?)\]\(((?:[^\)]|\)|\()+?)\)/g;
        text = text.replace(imagePattern1, (match, p1, p2) => {
            let escaped = _this.escapeBracket(p1);
            let url = _this.escapeBracket(p2);
            return _this.makeHolder(`<img src="${ url }" alt="${ escaped }" title="${ escaped }">`);
        });

        let imagePattern2 = /!\[((?:[^\]]|\]|\[)*?)\]\[((?:[^\]]|\]|\[)+?)\]/g;
        text = text.replace(imagePattern2, (match, p1, p2) => {
            let escaped = _this.escapeBracket(p1);
            let result = '';
            if (_this.definitions[p2]) {
                result = `<img src="${ _this.definitions[p2] }" alt="${ escaped }" title="${ escaped }">`;
            } else {
                result = escaped;
            }
            return _this.makeHolder(result);
        });

        // link
        let linkPattern1 = /\[((?:[^\]]|\]|\[)+?)\]\(((?:[^\)]|\)|\()+?)\)/g;
        text = text.replace(linkPattern1, (match, p1, p2) => {
            let escaped = _this.parseInline(_this.escapeBracket(p1), '', false, false);
            let url = _this.escapeBracket(p2);
            return _this.makeHolder(`<a href="${ url }">${ escaped }</a>`);
        });

        let linkPattern2 = /\[((?:[^\]]|\]|\[)+?)\]\[((?:[^\]]|\]|\[)+?)\]/g;
        text = text.replace(linkPattern2, (match, p1, p2) => {
            let escaped = _this.parseInline(_this.escapeBracket(p1), '', false, false);

            let result = _this.definitions[p2] ? `<a href="${ _this.definitions[p2] }">${ escaped }</a>` : escaped;

            return _this.makeHolder(result);
        });

        // escape
        text = text.replace(/\\(`|\*|_|~)/g, (match, p1) => {
            return _this.makeHolder(_this.htmlspecialchars(p1));
        });

        // strong and em and some fuck
        text = this.parseInlineCallback(text);
        text = text.replace(/<([_a-z0-9-\.\+]+@[^@]+\.[a-z]{2,})>/ig, "<a href=\"mailto:$1\">$1</a>");

        // autolink url
        if(enableAutoLink){
            text = text.replace(/(^|[^"])((http|https|ftp|mailto):[\u4e00-\u9fa5_a-z0-9-\.\/%#@\?\+=~\|\,&\(\)]+)($|[^"])/ig, "$1<a href=\"$2\">$2</a>$4");

        text = this.call('afterParseInlineBeforeRelease', text);
        text = this.releaseHolder(text, clearHolders);

            text = this.call('afterParseInline', text);
        }


        return text;
    }

    /**
     * @param text
     * @return mixed
     */
    parseInlineCallback(text) {
        text = text.replace(/(\*{3})(.+?)\1/g, (match, p1, p2) => {
            return '<strong><em>' + this.parseInlineCallback(p2) + '</em></strong>';
        });

        text = text.replace(/(\*{2})(.+?)\1/g, (match, p1, p2) => {
            return '<strong>' + this.parseInlineCallback(p2) + '</strong>';
        });

        text = text.replace(/(\*)(.+?)\1/g, (match, p1, p2) => {
            return '<em>' + this.parseInlineCallback(p2) + '</em>';
        });

        text = text.replace(/(\s+|^)(_{3})(.+?)\2(\s+|$)/g, (match, p1, p2, p3, p4) => {
            return p1 + '<strong><em>' + this.parseInlineCallback(p3) + '</em></strong>' + p4;
        });

        text = text.replace(/(\s+|^)(_{2})(.+?)\2(\s+|$)/g, (match, p1, p2, p3, p4) => {
            return p1 + '<strong>' + this.parseInlineCallback(p3) + '</strong>' + p4;
        });

        text = text.replace(/(\s+|^)(_)(.+?)\2(\s+|$)/g, (match, p1, p2, p3, p4) => {
            return p1 + '<em>' + this.parseInlineCallback(p3) + '</em>' + p4;
        });

        text = text.replace(/(~{2})(.+?)\1/g, (match, p1, p2) => {
            return '<del>' + this.parseInlineCallback(p2) + '</del>';
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
    parseBlock(text, lines) {
        // let lines = text.split('\n');
        this.blocks = [];
        this.current = 'normal';
        this.pos = -1;
        let special = Object.keys(this.specialWhiteList).join("|");
        let emptyCount = 0;

        // analyze by line
        for (let key in lines) {
            key = parseInt(key); // ES6 的 for key in Array 循环时返回的 key 是字符串，不是 int
            let line = lines[key];
            let block = this.getBlock();

            // code block is special
            let codeMatches = line.match(/^(\s*)(~|`){3,}([^`~]*)$/i);
            if (codeMatches) {
                if (this.isBlock('code')) {
                    let isAfterList = block[3][2];

                    if (isAfterList) {
                        this.combineBlock().setBlock(key);
                    } else {
                        this.setBlock(key).endBlock();
                    }
                } else {
                    let isAfterList = false;
                    if (this.isBlock('list')) {
                        let space = block[3];

                        isAfterList = space > 0 && codeMatches[1].length >= space || codeMatches[1].length > space;
                    }
                    this.startBlock('code', key, [codeMatches[1], codeMatches[3], isAfterList]);
                }
                continue;
            } else if (this.isBlock('code')) {
                this.setBlock(key);
                continue;
            }

            // html block is special too
            let htmlPattern1 = new RegExp('^\s*<(' + special + ')(\s+[^>]*)?>', 'i');
            let htmlPattern2 = new RegExp('<\/(' + special + ')>\s*$', 'i');
            let htmlMatches1 = line.match(htmlPattern1);
            let htmlMatches2 = line.match(htmlPattern2);
            if (htmlMatches1) {
                let tag = htmlMatches1[1].toLowerCase();
                if (!this.isBlock('html', tag) && !this.isBlock('pre')) {
                    this.startBlock('html', key, tag);
                }

                continue;
            } else if (htmlMatches2) {
                let tag = htmlMatches2[1].toLowerCase();

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
                case /^(\s*)((?:[0-9a-z]+\.)|\-|\+|\*)\s+/.test(line):
                    let matches = line.match(/^(\s*)((?:[0-9a-z]+\.)|\-|\+|\*)\s+/);

                    let listSpace = matches[1].length;
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
                    let footnoteMatches = /^\[\^((?:[^\]]|\]|\[)+?)\]:/.exec(line);
                    let footnoteSpace = footnoteMatches[0].length - 1;
                    this.startBlock('footnote', key, [footnoteSpace, footnoteMatches[1]]);
                    break;

                // definition
                case /^\s*\[((?:[^\]]|\]|\[)+?)\]:\s*(.+)$/.test(line):
                    let definitionMatches = line.match(/^\s*\[((?:[^\]]|\]|\[)+?)\]:\s*(.+)$/);
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
                    let tableMatches = /^((?:(?:(?:[ :]*\-[ :]*)+(?:\||\+))|(?:(?:\||\+)(?:[ :]*\-[ :]*)+)|(?:(?:[ :]*\-[ :]*)+(?:\||\+)(?:[ :]*\-[ :]*)+))+)$/g.exec(line);
                    if (this.isBlock('normal')) {
                        let head = false;

                        if (block.length === 0 || block[0] !== 'normal' || /^\s*$/.test(lines[block[2]])) {
                            this.startBlock('table', key);
                        } else {
                            head = true;
                            this.backBlock(1, 'table');
                        }

                        if (tableMatches[1][0] == '|') {
                            tableMatches[1] = tableMatches[1].substr(1);

                            if (tableMatches[1][tableMatches[1].length - 1] == '|') {
                                tableMatches[1] = tableMatches[1].slice(0, -1);
                            }
                        }

                        let rows = tableMatches[1].split(/[\+|\|]/);
                        let aligns = [];
                        rows.forEach(row => {
                            let align = 'none';
                            let tableMatches = row.match(/^\s*(:?)\-+(:?)\s*$/);
                            if (tableMatches) {
                                if (tableMatches[1] == tableMatches[2]) {
                                    align = 'center';
                                } else if (tableMatches[1]) {
                                    align = 'left';
                                } else if (tableMatches[2]) {
                                    align = 'right';
                                }
                            }

                            aligns.push(align);
                        });

                        this.setBlock(key, [head, aligns]);
                    }
                    break;

                // single heading
                case /^(#+)(.*)$/.test(line):
                    let singleHeadingMatches = line.match(/^(#+)(.*)$/);
                    let num = Math.min(singleHeadingMatches[1].length, 6);
                    this.startBlock('sh', key, num).endBlock();
                    break;

                // multi heading
                case /^\s*((=|-){2,})\s*$/.test(line) && (block && block[0] === 'normal' && !/^\s*$/.test(lines[block[2]])):
                    // check if last line isn't empty
                    let multiHeadingMatches = line.match(/^\s*((=|-){2,})\s*$/);
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
                        let matches = line.match(/^(\s*)/);
                        if (matches[1].length >= block[3][0]) {
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
                        } else if (emptyCount == 0) {
                            this.setBlock(key);
                        } else {
                            this.startBlock('normal', key);
                        }
                    } else {
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
    optimizeBlocks(blocks, lines) {
        blocks = this.call('beforeOptimizeBlocks', blocks, lines);

        blocks.forEach((block, key) => {
            let prevBlock = blocks[key - 1] ? blocks[key - 1] : null;
            let nextBlock = blocks[key + 1] ? blocks[key + 1] : null;

            let [type, from, to] = block;

            if ('pre' === type) {
                let isEmpty = lines.reduce(function (result, line) {
                    return line.match(/^\s*$/) && result;
                }, true);

                if (isEmpty) {
                    block[0] = type = 'normal';
                }
            }

            if ('normal' === type) {
                // combine two blocks
                let types = ['list', 'quote'];

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
    parseCode(lines, parts) {
        let [blank, lang] = parts;
        lang = lang.trim();
        let count = blank.length;

        if (!/^[_a-z0-9-\+\#]+$/i.test(lang)) {
            lang = null;
        }

        lines = lines.slice(1, -1).map(line => {
            let pattern = new RegExp('/^[ ]{' + count + '}/');
            return line.replace(pattern, '');
        });
        let str = lines.join('\n');

        return (/^\s*$/.test(str) ? '' : '<pre><code' + (lang ? ` class="${ lang }"` : '') + '>' + this.htmlspecialchars(lines.join('\n')) + '</code></pre>'
        );
    }

    /**
     * parsePre
     *
     * @param array lines
     * @return string
     */
    parsePre(lines) {
        lines.forEach((line, ind) => {
            lines[ind] = this.htmlspecialchars(line.substr(4));
        });
        let str = lines.join('\n');

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
    parseSh(lines, num) {
        if (lines[0]) {
            let line = this.parseInline(lines[0].trim().replace(/^#+|#+$/g, ''));
            return (/^\s*$/.test(line) ? '' : `<h${ num }>${ line }</h${ num }>`
            );
        } else {
            return ``;
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
        if (lines[0]) {
            let line = this.parseInline(lines[0].trim().replace(/^#+|#+$/g, ''));
            return (/^\s*$/.test(line) ? '' : `<h${ num }>${ line }</h${ num }>`
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
    parseQuote(lines) {
        lines.forEach((line, key) => {
            lines[key] = line.replace(/^\s*> ?/, '');
        });
        let str = lines.join('\n');
        return (/^\s*$/.test(str) ? '' : '<blockquote>' + this.parse(str) + '</blockquote>'
        );
    }

    /**
     * parseList
     *
     * @param array lines
     * @return string
     */
    parseList(lines) {
        let html = '';
        let minSpace = 99999;
        let rows = [];

        // count levels
        lines.forEach((line, key) => {
            let matches = line.match(/^(\s*)((?:[0-9a-z]+\.?)|\-|\+|\*)(\s+)(.*)$/);
            if (matches) {
                let space = matches[1].length;
                let type = /[\+\-\*]/.test(matches[2]) ? 'ul' : 'ol';
                minSpace = Math.min(space, minSpace);

                rows.push([space, type, line, matches[4]]);
            } else {
                rows.push(line);
            }
        });

        let found = false;
        let secondMinSpace = 99999;
        rows.forEach(row => {
            if (Array.isArray(row) && row[0] != minSpace) {
                secondMinSpace = Math.min(secondMinSpace, row[0]);
                found = true;
            }
        });
        secondMinSpace = found ? 0 : minSpace;

        let lastType = '';
        let leftLines = [];

        rows.forEach(row => {
            if (Array.isArray(row)) {
                let [space, type, line, text] = row;

                if (space !== minSpace) {
                    let pattern = new RegExp("^\s{" + secondMinSpace + "}");
                    leftLines.push(line.replace(pattern, ''));
                } else {
                    if (leftLines.length) {
                        html += "<li>" + this.parse(leftLines.join("\n")) + "</li>";
                    }
                    if (lastType !== type) {
                        if (lastType.length) {
                            html += `</${ lastType }>`;
                        }

                        html += `<${ type }>`;
                    }

                    leftLines = [text];
                    lastType = type;
                }
            } else {
                let pattern = new RegExp("^\s{" + secondMinSpace + "}");
                leftLines.push(row.replace(pattern, ''));
            }
        });

        if (leftLines.length) {
            html += "<li>" + this.parse(leftLines.join("\n")) + `</li></${ lastType }>`;
        }

        return html;
    }

    /**
     * @param array lines
     * @param array value
     * @return string
     */
    parseTable(lines, value) {
        let [head, aligns] = value;
        let ignore = head ? 1 : 0;

        let html = '<table>';
        let body = false;

        for (let key in lines) {
            let line = lines[key];
            if (parseInt(key) === ignore) {
                head = false;
                body = true;
                continue;
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

            let rows = line.split('|').map(row => {
                if (row.match(/^\s+$/)) {
                    return ' ';
                } else {
                    return row.trim();
                }
            });

            let columns = [];
            let last = -1;

            rows.forEach(row => {
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

            columns.forEach((column, key) => {
                let [num, text] = column;
                let tag = head ? 'th' : 'td';

                html += `<${ tag }`;
                if (num > 1) {
                    html += ` colspan="${ num }"`;
                }

                if (aligns[key] && aligns[key] != 'none') {
                    html += ` align="${ aligns[key] }"`;
                }

                html += '>' + this.parseInline(text) + `</${ tag }>`;
            });

            html += '</tr>';

            if (head) {
                html += '</thead>';
            } else if (body) {
                body = false;
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
    parseHr() {
        return '<hr>';
    }

    /**
     * parseNormal
     *
     * @param array lines
     * @return string
     */
    parseNormal(lines) {
        lines = lines.map(line => {
            return this.parseInline(line);
        });

        let str = lines.join("\n").trim();
        str = str.replace(/(\n\s*){2,}/g, "</p><p>");
        str = str.replace(/\n/g, "<br>");

        return (/^\s*$/.test(str) ? '' : `<p>${ str }</p>`
        );
    }

    /**
     * parseFootnote
     *
     * @param array lines
     * @param array value
     * @return string
     */
    parseFootnote(lines, value) {
        let note = value[1];
        let index = this.footnotes.indexOf(note);
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
    parseDefinition() {
        return '';
    }

    /**
     * parseHtml
     *
     * @param array lines
     * @param string type
     * @return string
     */
    parseHtml(lines, type) {
        lines.forEach(line => {
            line = this.parseInline(line, this.specialWhiteList[type] ? this.specialWhiteList[type] : '');
        });

        return lines.join("\n");
    }

    /**
     * @param str
     * @return mixed
     */
    escapeBracket(str) {
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
    startBlock(type, start, value = null) {
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
    endBlock() {
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
    isBlock(type, value = null) {
        return this.current == type && (null === value ? true : this.blocks[this.pos][3] == value);
    }

    /**
     * getBlock
     *
     * @return array
     */
    getBlock() {
        return this.blocks[this.pos] ? this.blocks[this.pos] : null;
    }

    /**
     * setBlock
     *
     * @param mixed to
     * @param mixed value
     * @return this
     */
    setBlock(to = null, value = null) {
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
    backBlock(step, type, value = null) {
        if (this.pos < 0) {
            return this.startBlock(type, 0, value);
        }

        let last = this.blocks[this.pos][2];
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
    htmlspecialchars(text) {
        let map = {
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
    combineBlock() {
        if (this.pos < 1) {
            return this;
        }

        let prev = this.blocks[this.pos - 1];
        let current = this.blocks[this.pos];

        prev[2] = current[2];
        this.blocks[this.pos - 1] = prev;
        this.current = prev[0];
        this.blocks.splice(this.pos, 1);
        this.pos--;

        return this;
    }
}
