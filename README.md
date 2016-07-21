HyperDown.js
======================

这是 js 版本 HyperDown (使用CoffeeScript实现)

##使用方法##

###nodejs 中使用##

安装

```bash
npm install hyperdown
```

使用

```javascript
HyperDown = require('hyperdown');

var parser = new HyperDown,
    html = parser.makeHtml(markdownText);
```


###浏览器中使用##

直接引用`Parser.js`即可

```html
<script src="yourpath/hyperdown/Parser.js"></script>
<script>
var parser = new HyperDown,
    html = parser.makeHtml(markdownText);
</script>
```

###单元测试###

```bash
npm test
```

更多请参阅：[php 版 Hyperdown](https://github.com/SegmentFault/HyperDown)
