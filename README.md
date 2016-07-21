HyperDown.js
======================

这是 js 版本 HyperDown (使用CoffeeScript实现)

##使用方法##
```
npm install hyperdown
```

##开发者使用方法##

###nodejs 中使用##

安装

```
npm install hyperdown
```

使用

```
HyperDown = require('hyperdown');

var parser = new HyperDown,
    html = parser.makeHtml(markdownText);
```


###浏览器中使用##

直接引用`Parser.js`即可

```
<script src="yourpath/hyperdown/Parser.js"></script>
<script>
var parser = new HyperDown,
    html = parser.makeHtml(markdownText);
</script>
```

###单元测试###
```
npm test
```

为何要写这样一个解析器
======================

Markdown已经面世许多年了，国内外许多大大小小的网站都在用它，但是它的解析器却依然混乱不堪。SegmentFault 是中国较大规模使用 Markdown 语法的网站，我们一直在使用一些开源类库，包括但不限于

1. [php-markdown](https://github.com/michelf/php-markdown)
2. [CommonMark for PHP](https://github.com/thephpleague/commonmark)
3. [Parsedown](https://github.com/erusev/parsedown)

他们都有或多或少的毛病，有的性能较差，有的代码比较业余，更多的情况是由于Markdown本身解析比较复杂，因此我们几乎无法去维护另外一个人写的代码。基于这个原因，我为 SegmentFault 专门编写了这么一个Markdown解析器。


当前支持的语法
--------------

- 标题
- 列表（可递归）
- 引用（可递归）
- 缩进风格的代码块
- Github风格的代码块
- 各种行内文字加粗，斜体等效果
- 链接，图片
- 自动链接
- 段内折行
- 脚标
- 分隔符
- 表格
- 图片和链接支持互相套用


更多请参阅：[php 版 Hyperdown](https://github.com/SegmentFault/HyperDown)
