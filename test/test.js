var assert = require("assert");
var Parser = require("../Parser.js");
var parser = new Parser();

describe('HyperDown.js', function() {
    describe('heading type1', function() {
        it('#heading#', function() {
            assert.equal('<h1>heading</h1>', parser.makeHtml('#heading#'));
            assert.equal('<h6>heading</h6>', parser.makeHtml('######heading######'));
        });
    });

    describe('heading type2', function() {
        it('heading ======', function() {
            assert.equal('<h1>heading</h1>', parser.makeHtml('heading\n======'));
        });
    });

    describe('bold', function() {
        it('**bold**', function() {
            assert.equal('<p>123<strong>bold</strong>123</p>', parser.makeHtml('123**bold**123'));
        });
    });

    describe('italy', function() {
        it('*italy*', function() {
            assert.equal('<p>123 <em>italy</em> 123</p>', parser.makeHtml('123 *italy* 123'));
        });
    });

    describe('list', function() {
        it('ul', function() {
            assert.equal('<ul><li><p>list</p></li></ul>', parser.makeHtml('\n\n - list'));
        });
        it('ol', function() {
            assert.equal('<ol><li><p>list</p></li></ol>', parser.makeHtml('1. list'));
        });
    });

    describe('link', function() {
        it('type1', function() {
            assert.equal('<p><a href="http://sf.gg">sf.gg</a>123</p>', parser.makeHtml('[sf.gg](http://sf.gg)123'));
        });
        it('type2', function() {
            assert.equal('<p>123<a href="http://sf.gg(tt)">http://sf.gg(tt)</a> 123 <a href="http://sf.gg">http://sf.gg</a></p>', parser.makeHtml('123http://sf.gg(tt) 123 http://sf.gg'));
        });
        it('type3', function() {
            assert.equal('<p><a href="http://sf.gg">sf.gg</a></p>', parser.makeHtml('[sf.gg][1]\n [1]: http://sf.gg'));
        });
        it('type4', function() {
            assert.equal('<p><a href="http://sf.gg">http://sf.gg</a></p>', parser.makeHtml('<http://sf.gg>'));
        });
    });

    describe('image', function() {
        it('type1', function() {
            assert.equal('<p><img src="http://sfault-avatar.b0.upaiyun.com/388/398/3883982934-55d3f0dc8f1e1_huge256" alt="integ" title="integ"></p>', parser.makeHtml('![integ](http://sfault-avatar.b0.upaiyun.com/388/398/3883982934-55d3f0dc8f1e1_huge256)'));
        });
        it('type2', function() {
            assert.equal('<p><img src="http://sfault-avatar.b0.upaiyun.com/388/398/3883982934-55d3f0dc8f1e1_huge256" alt="integ" title="integ"></p>', parser.makeHtml('![integ][1]\n [1]: http://sfault-avatar.b0.upaiyun.com/388/398/3883982934-55d3f0dc8f1e1_huge256'));
        });
    });

    describe('code', function() {
        it('type1', function() {
            assert.equal('<pre><code class="javascript">var s=&quot;123&quot;;</code></pre>', parser.makeHtml('```javascript\nvar s="123";\n```'));
        });
        it('type2', function() {
            assert.equal('<p><code>Objective-C</code>使用了消息机制代替调<code>javascript</code>用方法。</p>', parser.makeHtml('`Objective-C`使用了消息机制代替调`javascript`用方法。'));
        });
        it('type3', function() {
            assert.equal('<pre><code class="javascript" rel="example.js">var s=&quot;123&quot;;</code></pre>', parser.makeHtml('```javascript:example.js\nvar s="123";\n```'));
        });
    });

    describe('quote', function() {
        it('> ', function() {
            assert.equal('<blockquote><p>test</p></blockquote>', parser.makeHtml('> test'));
        });
    });

    describe('table', function() {
        it('type1 html ', function() {
            assert.equal('<table><tbody><tr><td>test</td><td>test</td><tr></tbody></table>', parser.makeHtml('<table><tbody><tr><td>test</td><td>test</td><tr></tbody></table>'));
        });
        it('type2 |', function() {
            assert.equal('<table><thead><tr><th align="left">Item</th><th align="right">Value</th><th align="center">Qty</th></tr></thead><tbody><tr><td align="left">Computer</td><td align="right">1600 USD</td><td align="center">5</td></tr><tr><td align="left">Phone</td><td align="right">12 USD</td><td align="center">12</td></tr><tr><td align="left">Pipe</td><td align="right">1 USD</td><td align="center">234</td></tr></tbody></table>',
                parser.makeHtml('| Item      |    Value | Qty  |\n| :-------- | --------:| :--: |\n| Computer  | 1600 USD |  5   |\n| Phone     |   12 USD |  12  |\n| Pipe      |    1 USD | 234  |'));
        });
        it('table align', function() {
            assert.equal('<table>\
<thead>\
<tr>\
<th align="left">Left-Aligned</th>\
<th align="center">Center Aligned</th>\
<th align="right">Right Aligned</th>\
</tr>\
</thead>\
<tbody>\
<tr>\
<td align="left">col 3 is</td>\
<td align="center">some wordy text</td>\
<td align="right">$1600</td>\
</tr>\
<tr>\
<td align="left">col 2 is</td>\
<td align="center">centered</td>\
<td align="right">$12</td>\
</tr>\
<tr>\
<td align="left">zebra stripes</td>\
<td align="center">are neat</td>\
<td align="right">$1</td>\
</tr>\
</tbody>\
</table>', parser.makeHtml('| Left-Aligned  | Center Aligned  | Right Aligned |\n\
| :------------ |:---------------:| -----:|\n\
| col 3 is      | some wordy text | $1600 |\n\
| col 2 is      | centered        |   $12 |\n\
| zebra stripes | are neat        |    $1 |'));
        });
    });

    describe('footnote', function() {
        it('脚注 ', function() {
            assert.equal('<p>Never write "[click here]<sup id="fnref-1"><a href="#fn-1" class="footnote-ref">1</a></sup>".</p><div class="footnotes"><hr><ol><li id="fn-1">2 <a href="#fnref-1" class="footnote-backref">&#8617;</a></li></ol></div>', parser.makeHtml('Never write "[click here][^2]".\n [^2]: http://www.w3.org/QA/Tips/noClickHere'));
        });
    });

    describe('complex', function() {
        it('specialhtml', function() {
            assert.equal('<p>&lt;li&gt;asdf</p>', parser.makeHtml('<li>asdf'));
        });
        it('specialHR', function() {
            assert.equal('<pre><code>a</code></pre><hr>', parser.makeHtml('```\na\n```\n---'));
        });
        it('list + code', function() {
            var codeInList = "1. 1111\n 1111\n 1111\`operator new\` 在分配内存失败的情况下会调用 \`new_handler\` 尝试让系统释放点内存，然后再次尝试申请内存。如果这时系统中内存确实紧张，即使调用。";
            assert.equal('<ol><li><p>1111<br> 1111</p></li></ol><p>1111<code>operator new</code> 在分配内存失败的情况下会调用 <code>new_handler</code> 尝试让系统释放点内存，然后再次尝试申请内存。如果这时系统中内存确实紧张，即使调用。</p>', parser.makeHtml(codeInList));
        });
    });

    describe('bugfix', function() {
        it('escape', function () {
            assert.equal('<p>[系统盘]:\\Documents and Settings\\[用户名]\\Cookies</p>', parser.makeHtml('\\[系统盘]:\\\\Documents and Settings\\\\[用户名]\\\\Cookies'));
        });

        it('table', function () {
            assert.equal('<table><thead><tr><th>Variable_name</th><th>Value</th></tr></thead><tbody><tr><td>sql_mode</td><td>ONLY_FULL_GROUP_BY, STRICT_TRANS_TABLES, NO_ZERO_IN_DATE, NO_ZERO_DATE, ERROR_FOR_DIVISION_BY_ZERO, NO_AUTO_CREATE_USER, NO_ENGINE_SUBSTITUTION</td></tr></tbody></table>', parser.makeHtml('|---------------|-------|\n| Variable_name | Value |\n| ------------- | ----- |\n| sql_mode      | ONLY_FULL_GROUP_BY, STRICT_TRANS_TABLES, NO_ZERO_IN_DATE, NO_ZERO_DATE, ERROR_FOR_DIVISION_BY_ZERO, NO_AUTO_CREATE_USER, NO_ENGINE_SUBSTITUTION |\n|---------------|-------|'));
        });
    });

});
