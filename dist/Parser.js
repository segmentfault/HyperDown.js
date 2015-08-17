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

var marked0$0 = [entries].map(regeneratorRuntime.mark);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

/**
 * Generator 遍历json
 */

function entries(obj) {
    var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, key;

    return regeneratorRuntime.wrap(function entries$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                context$1$0.prev = 3;
                _iterator = Object.keys(obj)[Symbol.iterator]();

            case 5:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                    context$1$0.next = 12;
                    break;
                }

                key = _step.value;
                context$1$0.next = 9;
                return [key, obj[key]];

            case 9:
                _iteratorNormalCompletion = true;
                context$1$0.next = 5;
                break;

            case 12:
                context$1$0.next = 18;
                break;

            case 14:
                context$1$0.prev = 14;
                context$1$0.t0 = context$1$0['catch'](3);
                _didIteratorError = true;
                _iteratorError = context$1$0.t0;

            case 18:
                context$1$0.prev = 18;
                context$1$0.prev = 19;

                if (!_iteratorNormalCompletion && _iterator['return']) {
                    _iterator['return']();
                }

            case 21:
                context$1$0.prev = 21;

                if (!_didIteratorError) {
                    context$1$0.next = 24;
                    break;
                }

                throw _iteratorError;

            case 24:
                return context$1$0.finish(21);

            case 25:
                return context$1$0.finish(18);

            case 26:
            case 'end':
                return context$1$0.stop();
        }
    }, marked0$0[0], this, [[3, 14, 18, 26], [19,, 21, 25]]);
}

/**
 * md5
 * discuss at: http://phpjs.org/functions/md5/
 * original by: Webtoolkit.info (http://www.webtoolkit.info/)
 * improved by: Michael White (http://getsprink.com)
 * improved by: Jack
 * improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
 * input by: Brett Zamir (http://brett-zamir.me)
 * bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
 * depends on: utf8_encode
 * example 1: md5('Kevin van Zonneveld')
 * returns 1: '6e658d4bfcb59cc13f96c14450ac40b9'
 */
function md5(str) {
    var xl;

    var rotateLeft = function rotateLeft(lValue, iShiftBits) {
        return lValue << iShiftBits | lValue >>> 32 - iShiftBits;
    };

    var addUnsigned = function addUnsigned(lX, lY) {
        var lX4, lY4, lX8, lY8, lResult;
        lX8 = lX & 0x80000000;
        lY8 = lY & 0x80000000;
        lX4 = lX & 0x40000000;
        lY4 = lY & 0x40000000;
        lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
            return lResult ^ 0x80000000 ^ lX8 ^ lY8;
        }
        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return lResult ^ 0xC0000000 ^ lX8 ^ lY8;
            } else {
                return lResult ^ 0x40000000 ^ lX8 ^ lY8;
            }
        } else {
            return lResult ^ lX8 ^ lY8;
        }
    };

    var _F = function _F(x, y, z) {
        return x & y | ~x & z;
    };
    var _G = function _G(x, y, z) {
        return x & z | y & ~z;
    };
    var _H = function _H(x, y, z) {
        return x ^ y ^ z;
    };
    var _I = function _I(x, y, z) {
        return y ^ (x | ~z);
    };

    var _FF = function _FF(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_F(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var _GG = function _GG(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_G(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var _HH = function _HH(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_H(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var _II = function _II(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_I(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var convertToWordArray = function convertToWordArray(str) {
        var lWordCount;
        var lMessageLength = str.length;
        var lNumberOfWords_temp1 = lMessageLength + 8;
        var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - lNumberOfWords_temp1 % 64) / 64;
        var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
        var lWordArray = new Array(lNumberOfWords - 1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - lByteCount % 4) / 4;
            lBytePosition = lByteCount % 4 * 8;
            lWordArray[lWordCount] = lWordArray[lWordCount] | str.charCodeAt(lByteCount) << lBytePosition;
            lByteCount++;
        }
        lWordCount = (lByteCount - lByteCount % 4) / 4;
        lBytePosition = lByteCount % 4 * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | 0x80 << lBytePosition;
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
    };

    var wordToHex = function wordToHex(lValue) {
        var wordToHexValue = '',
            wordToHexValue_temp = '',
            lByte,
            lCount;
        for (lCount = 0; lCount += 3; lCount++) {
            lByte = lValue >>> lCount * 8 & 255;
            wordToHexValue_temp = '0' + lByte.toString(16);
            wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
        }
        return wordToHexValue;
    };

    var x = [],
        k,
        AA,
        BB,
        CC,
        DD,
        a,
        b,
        c,
        d,
        S11 = 7,
        S12 = 12,
        S13 = 17,
        S14 = 22,
        S21 = 5,
        S22 = 9,
        S23 = 14,
        S24 = 20,
        S31 = 4,
        S32 = 11,
        S33 = 16,
        S34 = 23,
        S41 = 6,
        S42 = 10,
        S43 = 15,
        S44 = 21;

    str = this.utf8_encode(str);
    x = convertToWordArray(str);
    a = 0x67452301;
    b = 0xEFCDAB89;
    c = 0x98BADCFE;
    d = 0x10325476;

    xl = x.length;
    for (k = 0; k < xl; k += 16) {
        AA = a;
        BB = b;
        CC = c;
        DD = d;
        a = _FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
        d = _FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
        c = _FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
        b = _FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
        a = _FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
        d = _FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
        c = _FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
        b = _FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
        a = _FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
        d = _FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
        c = _FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
        b = _FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
        a = _FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
        d = _FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
        c = _FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
        b = _FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
        a = _GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
        d = _GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
        c = _GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
        b = _GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
        a = _GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
        d = _GG(d, a, b, c, x[k + 10], S22, 0x2441453);
        c = _GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
        b = _GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
        a = _GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
        d = _GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
        c = _GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
        b = _GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
        a = _GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
        d = _GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
        c = _GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
        b = _GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
        a = _HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
        d = _HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
        c = _HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
        b = _HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
        a = _HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
        d = _HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
        c = _HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
        b = _HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
        a = _HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
        d = _HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
        c = _HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
        b = _HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
        a = _HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
        d = _HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
        c = _HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
        b = _HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
        a = _II(a, b, c, d, x[k + 0], S41, 0xF4292244);
        d = _II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
        c = _II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
        b = _II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
        a = _II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
        d = _II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
        c = _II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
        b = _II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
        a = _II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
        d = _II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
        c = _II(c, d, a, b, x[k + 6], S43, 0xA3014314);
        b = _II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
        a = _II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
        d = _II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
        c = _II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
        b = _II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
        a = addUnsigned(a, AA);
        b = addUnsigned(b, BB);
        c = addUnsigned(c, CC);
        d = addUnsigned(d, DD);
    }

    var temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);

    return temp.toLowerCase();
}

var Parser = (function () {
    function Parser() {
        _classCallCheck(this, Parser);
    }

    _createClass(Parser, [{
        key: 'constractor',
        value: function constractor() {
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
        }

        /**
         * makeHtml
         *
         * @param mixed text
         * @return string
         */
    }, {
        key: 'makeHtml',
        value: function makeHtml(text) {
            var html = this.parser(text);
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
         * @param html
         * @return string
         */
    }], [{
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

            var id = 0;
            var uniqid = md5(new Date().getTime());
            var codes = [];

            text = this.call('beforeParseInline', text);

            // code
            var codeMatches = /(^|[^\\])`(.+?)`/.exec(text);
            if (codeMatches) {
                var key = '|' + uniqid + id + '|';
                codes[key] = '<code>' + htmlspecialchars(codeMatches[2]) + '</code>';
                id++;
                text = codeMatches[1] + key;
            }

            // escape unsafe tags
            var unsafeTagMatches = /<(\/?)([a-z0-9-]+)(\s+[^>]*)?>/i.exec(text);
            if (unsafeTagMatches) {
                var whiteLists = this.commonWhiteList + '|' + whiteList;
                if (whiteLists.toLowerCase().indexOf(unsafeTagMatches[2].toLowerCase()) !== -1) {
                    return unsafeTagMatches[0];
                } else {
                    return htmlspecialchars(unsafeTagMatches[0]);
                }
            }

            // footnote
            var footnotePattern = new RegExp("\[\^((?:[^\]]|\\]|\\[)+?)\]");
            var footnoteMatches = footnotePattern.exec(text);
            if (footnoteMatches) {
                id = this.footnotes.indexOf(footnoteMatches[1]);

                if (id === -1) {
                    id = this.footnotes.length + 1;
                    this.footnotes[id] = footnoteMatches[1];
                }

                text = '<sup id="fnref-' + id + '"><a href="#fn-' + id + '" class="footnote-ref">' + id + '</a></sup>';
            }

            // image
            var imagePattern1 = new RegExp("!\[((?:[^\]]|\\]|\\[)+?)\]\(([^\)]+)\)");
            var imageMatches1 = imagePattern1.exec(text);
            if (imageMatches1) {
                var escaped = this.escapeBracket(imageMatches1[1]);
                text = '<img src="' + imageMatches1[2] + '" alt="' + escaped + '" title="' + escaped + '">';
            }

            var imagePattern2 = new RegExp("!\[((?:[^\]]|\\]|\\[)+?)\]\[((?:[^\]]|\\]|\\[)+)\]");
            var imageMatches2 = imagePattern2.exec(text);
            if (imageMatches2) {
                var escaped = this.escapeBracket(imageMatches2[1]);

                if (this.definitions[imageMatches2[2]]) {
                    text = '<img src="' + this.definitions[imageMatches2[2]] + '" alt="' + escaped + '" title="' + escaped + '">';
                } else {
                    text = escaped;
                }
            }

            // link
            var linkPattern1 = new RegExp("\[((?:[^\]]|\\]|\\[)+?)\]\(([^\)]+)\)");
            var linkMatches1 = linkMatches1.exec(text);
            if (linkMatches1) {
                var escaped = this.escapeBracket(linkMatches1[1]);
                text = '<a href="' + linkMatches1[2] + '">' + escaped + '</a>';
            }

            var linkPattern2 = new regExp("\[((?:[^\]]|\\]|\\[)+?)\]\[((?:[^\]]|\\]|\\[)+)\]");
            var linkMatches2 = linkMatches2.exec(text);
            if (linkMatches2) {
                var escaped = this.escapeBracket(linkMatches2[1]);

                if (this.definitions[linkMatches2[2]]) {
                    text = '<a href="' + this.definitions[linkMatches2[2]] + '">' + escaped + '</a>';
                } else {
                    text = escaped;
                }
            }

            // escape
            var escapeMatches = /\\(`|\*|_)/.exec(text);
            if (escapeMatches) {
                var key = '|' + uniqid + id + '|';
                codes[key] = htmlspecialchars(escapeMatches[1]);
                id++;

                text = key;
            }

            // strong and em and some fuck
            text = text.replace(/(_|\*){3}(.+?)\\1{3}/, "<strong><em>$2</em></strong>");
            text = text.replace(/(_|\*){2}(.+?)\\1{2}/, "<strong>$2</strong>");
            text = text.replace(/(_|\*)(.+?)\\1/, "<em>$2</em>");
            text = text.replace(/<(https?:\/\/.+)>/i, "<a href=\"$1\">$1</a>");

            // autolink
            text = text.replace(/(^|[^\"])((http|https|ftp|mailto):[_a-z0-9-\.\/%#@\?\+=~\|\,]+)($|[^\"])/i, "$1<a href=\"$2\">$2</a>$4");

            // release
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = entries(codes)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var _step2$value = _slicedToArray(_step2.value, 2);

                    var key = _step2$value[0];
                    var value = _step2$value[1];

                    text = text.replace(key, value);
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
        value: function parseBlock(text, lines) {
            lines = explode("\n", text);
            this.blocks = [];
            this.current = '';
            this.pos = -1;
            var special = Object.keys(this.specialWhiteList).join("|");
            var emptyCount = 0;

            // analyze by line
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = entries(lines)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var _step3$value = _slicedToArray(_step3.value, 2);

                    var key = _step3$value[0];
                    var _line = _step3$value[1];

                    // code block is special
                    if (matches = _line.match("/^(~|`){3,}([^`~]*)$/i")) {
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
                    if (matches = _line.match(/^\s*<({$special})(\s+[^>]*)?>/i)) {
                        tag = matches[1].toLowerCase();
                        if (!this.isBlock('html', tag) && !this.isBlock('pre')) {
                            this.startBlock('html', key, tag);
                        }

                        continue;
                    } else if (matches = _line.match(/<\/({$special})>\s*$/i)) {
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
                        case /^(\s*)((?:[0-9a-z]\.)|\-|\+|\*)\s+/.test(_line):
                            var matches = _line.match(/^(\s*)((?:[0-9a-z]\.)|\-|\+|\*)\s+/);
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
                        case /^\[\^((?:[^\]]|\]|\[)+?)\]:/.test(_line):
                            var footnoteMatches = _line.match(/^\[\^((?:[^\]]|\]|\[)+?)\]:/);
                            var footnoteSpace = footnoteMatches[0].length - 1;
                            this.startBlock('footnote', key, [footnoteSpace, footNoteMatches[1]]);
                            break;

                        // definition
                        case /^\s*\[((?:[^\]]|\]|\[)+?)\]:\s*(.+)$/.test(_line):
                            var definitionMatches = _line.match(/^\s*\[((?:[^\]]|\]|\[)+?)\]:\s*(.+)$/);
                            this.definitions[definitionMatches[1]] = definitionMatches[2];
                            this.startBlock('definition', key).endBlock();
                            break;

                        // pre
                        case /^ {4,}/.test($line):
                            if (this.isBlock('pre')) {
                                this.setBlock(key);
                            } else if (this.isBlock('normal')) {
                                this.startBlock('pre', key);
                            }
                            break;

                        // table
                        case /^((?:(?:(?:[ :]*\-[ :]*)+(?:\||\+))|(?:(?:\||\+)(?:[ :]*\-[ :]*)+)|(?:(?:[ :]*\-[ :]*)+(?:\||\+)(?:[ :]*\-[ :]*)+))+)$/.test(_line):
                            var tableMatches = _line.match(/^((?:(?:(?:[ :]*\-[ :]*)+(?:\||\+))|(?:(?:\||\+)(?:[ :]*\-[ :]*)+)|(?:(?:[ :]*\-[ :]*)+(?:\||\+)(?:[ :]*\-[ :]*)+))+)$/);
                            if (this.isBlock('normal')) {
                                var _block2 = this.getBlock();
                                var head = false;

                                if (_block2.length === 0 || _block2[0] !== 'normal' || /^\s*$/.exec(lines[_block2[2]])) {
                                    this.startBlock('table', key);
                                } else {
                                    head = true;
                                    this.backBlock(1, 'table');
                                }

                                if (tableMatches[1][0] += '|') {
                                    tableMatches[1] = tableMatches[1].substr(1);

                                    if (tableMatches[1][tableMatches[1].length - 1] += '|') {
                                        tableMatches[1] = tableMatches[1].substr(0, -1);
                                    }
                                }

                                var _rows = tableMatches[1].split(/(\+|\|)/);
                                var aligns = [];
                                var _iteratorNormalCompletion4 = true;
                                var _didIteratorError4 = false;
                                var _iteratorError4 = undefined;

                                try {
                                    for (var _iterator4 = _rows[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                        var row = _step4.value;

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

                                this.setBlock(key, [head, aligns]);
                            }
                            break;

                        // single heading
                        case /^(#+)(.*)$/.test(_line):
                            var singleHeadingMatches = _line.match(/^(#+)(.*)$/);
                            var num = Math.min(singleHeadingMatches[1].length, 6);
                            this.startBlock('sh', key, num);
                            endBlock();
                            break;

                        // multi heading
                        case /^\s*((=|-){2,})\s*$/.test(_line) && (this.getBlock() && !/^\s*$/.test(lines[this.getBlock()[2]])):
                            // check if last line isn't empty
                            var multiHeadingMatches = _line.match(/^\s*((=|-){2,})\s*$/);
                            if (this.isBlock('normal')) {
                                this.backBlock(1, 'mh', multiHeadingMatches[1][0] += '=' ? 1 : 2).setBlock(key).endBlock();
                            } else {
                                this.startBlock('normal', key);
                            }
                            break;

                        // block quote
                        case /^>/.test(_line):
                            if (this.isBlock('quote')) {
                                this.setBlock(key);
                            } else {
                                this.startBlock('quote', key);
                            }
                            break;

                        // hr
                        case /^[-\*]{3,}\s*$/.test(_line):
                            this.startBlock('hr', key).endBlock();
                            break;

                        // normal
                        default:
                            if (this.isBlock('list')) {
                                var _matches = _line.match(/^(\s*)/);

                                if (_line.length += _matches[1].length) {
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
                                var _matches2 = _line.match(/^(\s*)/);

                                if (_matches2[1].length += this.getBlock()[3][0]) {
                                    this.setBlock(key);
                                } else {
                                    this.startBlock('normal', key);
                                }
                            } else if (this.isBlock('table')) {
                                if (-1 !== _line.indexOf('|')) {
                                    this.setBlock(key);
                                } else {
                                    this.startBlock('normal', key);
                                }
                            } else {
                                block = this.getBlock();

                                if (block.length === 0 || block[0] !== 'normal') {
                                    this.startBlock('normal', key);
                                } else {
                                    this.setBlock(key);
                                }
                            }
                            break;
                    }
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

            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = entries(blocks)[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var _step5$value = _slicedToArray(_step5.value, 2);

                    var key = _step5$value[0];
                    var _block3 = _step5$value[1];

                    var prevBlock = blocks[key - 1] ? blocks[key - 1] : null;
                    var nextBlock = $blocks[key + 1] ? blocks[key + 1] : null;

                    var _block32 = _slicedToArray(_block3, 3);

                    var type = _block32[0];
                    var from = _block32[1];
                    var to = _block32[2];

                    if ('pre' === type) {
                        var isEmpty = true;

                        for (var i = from; i += to; i++) {
                            line = lines[i];
                            if (!line.match(/^\s*$/)) {
                                isEmpty = false;
                                break;
                            }
                        }

                        if (isEmpty) {
                            _block3[0] = type = 'normal';
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
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = lines[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var _line2 = _step6.value;

                    _line2 = htmlspecialchars(_line2.substr(4));
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
            var line = this.parseInline(lines[0].trim().replace(/^#+|#+$/g, ''));
            return '<h' + num + '>' + line + '</h' + num + '>';
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
            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = lines[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    var _line3 = _step7.value;

                    _line3 = _line3.replace(/^> ?/, '');
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
            var _iteratorNormalCompletion8 = true;
            var _didIteratorError8 = false;
            var _iteratorError8 = undefined;

            try {
                for (var _iterator8 = entries(lines)[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                    var _step8$value = _slicedToArray(_step8.value, 2);

                    var key = _step8$value[0];
                    var _line4 = _step8$value[1];

                    var _matches3 = _line4.match(/^(\s*)((?:[0-9a-z]\.?)|\-|\+|\*)(\s+)(.*)$/);
                    if (_matches3) {
                        var _space = _matches3[1].length;
                        var type = -1 !== _matches3[2].indexOf('+-*') ? 'ul' : 'ol';
                        minSpace = Math.min(_space, minSpace);

                        rows.push([_space, type, _line4, _matches3[4]]);
                    } else {
                        rows.push(_line4);
                    }
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

            var found = false;
            var secondMinSpace = 99999;
            var _iteratorNormalCompletion9 = true;
            var _didIteratorError9 = false;
            var _iteratorError9 = undefined;

            try {
                for (var _iterator9 = rows[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                    var row = _step9.value;

                    if (Array.isArray(row) && row[0] != minSpace) {
                        secondMinSpace = min(secondMinSpace, row[0]);
                        found = true;
                    }
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

            secondMinSpace = found || minSpace;

            var lastType = '';
            var leftLines = [];

            var _iteratorNormalCompletion10 = true;
            var _didIteratorError10 = false;
            var _iteratorError10 = undefined;

            try {
                for (var _iterator10 = rows[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                    var row = _step10.value;

                    if (Array.isArray(row)) {
                        var _row = _slicedToArray(row, 4);

                        var _space2 = _row[0];
                        var type = _row[1];
                        var _line5 = _row[2];
                        var text = _row[3];

                        if (_space2 !== minSpace) {
                            var pattern = new RegExp("^\s{" + secondMinSpace + "}");
                            leftLines.push(_line5.replace(pattern, ''));
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
                _didIteratorError10 = true;
                _iteratorError10 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion10 && _iterator10['return']) {
                        _iterator10['return']();
                    }
                } finally {
                    if (_didIteratorError10) {
                        throw _iteratorError10;
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
            var _value = _slicedToArray(value, 2);

            var head = _value[0];
            var aligns = _value[1];

            var ignore = head ? 1 : 0;

            var html = '<table>';
            var body = null;

            var _iteratorNormalCompletion11 = true;
            var _didIteratorError11 = false;
            var _iteratorError11 = undefined;

            try {
                for (var _iterator11 = entries(lines)[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                    var _step11$value = _slicedToArray(_step11.value, 2);

                    var key = _step11$value[0];
                    var _line6 = _step11$value[1];

                    if (key === ignore) {
                        head = false;
                        body = true;
                        continue;
                    }

                    if (_line6[0] === '|') {
                        _line6 = _line6.substr(1);
                        if (_line6[_line6.length - 1] === '|') {
                            _line6 = _line6.substr(0, -1);
                        }
                    }

                    _line6 = _line6.replace(/^(\|?)(.*?)\\1$/, "$2", _line6);
                    rows = _line6.split('|').map(function (item) {
                        return item.trim();
                    });
                    var columns = [];
                    var last = -1;

                    var _iteratorNormalCompletion12 = true;
                    var _didIteratorError12 = false;
                    var _iteratorError12 = undefined;

                    try {
                        for (var _iterator12 = rows[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                            var row = _step12.value;

                            if (row.length > 0) {
                                last++;
                                columns[last] = [1, row];
                            } else if (columns[last]) {
                                columns[last][0]++;
                            }
                        }
                    } catch (err) {
                        _didIteratorError12 = true;
                        _iteratorError12 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion12 && _iterator12['return']) {
                                _iterator12['return']();
                            }
                        } finally {
                            if (_didIteratorError12) {
                                throw _iteratorError12;
                            }
                        }
                    }

                    if (head) {
                        html += '<thead>';
                    } else if (body) {
                        html += '<tbody>';
                    }

                    html += '<tr>';

                    var _iteratorNormalCompletion13 = true;
                    var _didIteratorError13 = false;
                    var _iteratorError13 = undefined;

                    try {
                        for (var _iterator13 = entries(columns)[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                            var _step13$value = _slicedToArray(_step13.value, 2);

                            var _key2 = _step13$value[0];
                            var column = _step13$value[1];

                            var _column = _slicedToArray(column, 2);

                            var num = _column[0];
                            var text = _column[1];

                            var _tag = head ? 'th' : 'td';

                            html += '<' + _tag;
                            if (num > 1) {
                                html += ' colspan="' + num + '"';
                            }

                            if (aligns[_key2] && aligns[_key2] != 'none') {
                                html += ' align="' + aligns[_key2] + '"';
                            }

                            html += '>' + this.parseInline(text) + ('</' + _tag + '>');
                        }
                    } catch (err) {
                        _didIteratorError13 = true;
                        _iteratorError13 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion13 && _iterator13['return']) {
                                _iterator13['return']();
                            }
                        } finally {
                            if (_didIteratorError13) {
                                throw _iteratorError13;
                            }
                        }
                    }

                    html += '</tr>';

                    if (head) {
                        html += '</thead>';
                    } else if (body) {
                        body = false;
                    }
                }
            } catch (err) {
                _didIteratorError11 = true;
                _iteratorError11 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion11 && _iterator11['return']) {
                        _iterator11['return']();
                    }
                } finally {
                    if (_didIteratorError11) {
                        throw _iteratorError11;
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
            var _iteratorNormalCompletion14 = true;
            var _didIteratorError14 = false;
            var _iteratorError14 = undefined;

            try {
                for (var _iterator14 = lines[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
                    var _line7 = _step14.value;

                    _line7 = this.parseInline(_line7);
                }
            } catch (err) {
                _didIteratorError14 = true;
                _iteratorError14 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion14 && _iterator14['return']) {
                        _iterator14['return']();
                    }
                } finally {
                    if (_didIteratorError14) {
                        throw _iteratorError14;
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
            var _iteratorNormalCompletion15 = true;
            var _didIteratorError15 = false;
            var _iteratorError15 = undefined;

            try {
                for (var _iterator15 = lines[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
                    var _line8 = _step15.value;

                    _line8 = this.parseInline(_line8, this.specialWhiteList[type] ? this.specialWhiteList[type] : '');
                }
            } catch (err) {
                _didIteratorError15 = true;
                _iteratorError15 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion15 && _iterator15['return']) {
                        _iterator15['return']();
                    }
                } finally {
                    if (_didIteratorError15) {
                        throw _iteratorError15;
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

            return this.current += type && (null === value ? true : this.blocks[this.pos][3] += value);
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

            if (this.blocks[this.pos][1] += this.blocks[this.pos][2]) {
                this.pos++;
            }

            this.current = type;
            this.blocks[this.pos] = [type, last - step + 1, last, value];

            return this;
        }
    }]);

    return Parser;
})();

exports['default'] = Parser;
module.exports = exports['default'];
//# sourceMappingURL=Parser.js.map