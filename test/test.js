var assert = require("assert");
var Parser = require("../dist/Parser.js");
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
            assert.equal('<p><strong>bold</strong></p>', parser.makeHtml('**bold**'));
        });
    });

    describe('italy', function() {
        it('*italy*', function() {
            assert.equal('<p><em>italy</em></p>', parser.makeHtml('*italy*'));
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
            assert.equal('<p><a href="http://sf.gg">sf.gg</a></p>', parser.makeHtml('[sf.gg](http://sf.gg)'));
        });
        it('type2', function() {
            assert.equal('<p><a href="http://sf.gg">http://sf.gg</a></p>', parser.makeHtml('http://sf.gg'));
        });
        it('type3', function() {
            assert.equal('<p><a href="http://sf.gg">sf.gg</a></p>', parser.makeHtml('[sf.gg][1]\n [1]: http://sf.gg'));
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
            assert.equal('<p><code>123</code></p>', parser.makeHtml('`123`'));
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
            assert.equal('<table><thead><tr><th>test</th><th>test</th></tr></thead><thead><tr><th>------</th><th colspan="2">------</th></tr></thead><thead><tr><th>test</th><th>test</th></tr></thead></tbody></table>', parser.makeHtml('test | test\n------ | ------|\ntest | test'));
        });
    });
});
