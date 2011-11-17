var Htmlify;
Htmlify = (function() {
  function Htmlify() {}
  Htmlify.prototype.tagify = function(tag, content) {
    var attributes, matches, node;
    if (content == null) {
      content = "";
    }
    if (tag && tag.indexOf("(") > 0 && tag.indexOf(")") > 0) {
      attributes = tag.split("(")[1].split(")")[0];
      tag = tag.split("(")[0];
    } else {
      attributes = "";
    }
    matches = tag.match(/a|abbr|address|area|article|aside|audio|b|base|bdi|bdo|blockquote|body|br|button|canvas|caption|cite|code|col|colgroup|command|datalist|dd|del|details|device|dfn|div|dl|dt|em|embed|fieldset|figcaption|figure|footer|form|h1|h2|h3|h4|h5|h6|head|header|hgroup|hr|html|i|iframe|img|input|ins|kbd|keygen|label|legend|li|link|map|mark|menu|meta|meter|nav|noscript|object|ol|optgroup|option|output|p|param|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|source|span|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|ul|var|video|wbr/);
    if (matches && matches[0].length === tag.length && !matches[0].match(/title/)) {
      if (parseInt(tag) > 0 && parseInt(tag).toString().length === tag.toString().length) {
        tag = "n" + tag;
      }
      return "<" + tag + "  " + attributes + ">" + content + "</" + tag + ">";
    } else {
      if (tag.match(/input|img|link/)) {
        switch (tag) {
          case 'input':
            return "<" + tag + " " + attributes + " placeholder='" + content + "'/>";
          case 'img':
            return "<" + tag + " " + attributes + " alt='" + content + "'/>";
          case 'link':
            return "<" + tag + " " + attributes + " href='" + content + "'/>";
        }
      }
      node = "div";
      if ((attributes && attributes.match(/href/)) || content.indexOf('http') === 0) {
        node = "a";
        attributes = "href='" + content + "'";
        if (!attributes.match(window.location.href)) {
          attributes += " target='_blank'";
        }
      }
      if (content.match(/\.jpg$|\.png$|\.gif$/)) {
        return "<img class='" + tag + "' src='" + content + "' />";
      }
      return "<" + node + " class=\"" + tag + "\"" + attributes + ">" + content + "</" + node + ">";
    }
  };
  Htmlify.prototype.htmlify = function(object, prettify) {
    var item, result, _i, _len;
    if (prettify == null) {
      prettify = false;
    }
    result = "";
    if (object instanceof Array) {
      for (_i = 0, _len = object.length; _i < _len; _i++) {
        item = object[_i];
        result += this.tagify("li", item);
      }
      result = this.tagify("ul", result);
    } else if (object instanceof Object) {
      for (item in object) {
        switch (typeof object[item]) {
          case "string":
            result += this.tagify(item, this.htmlify(object[item]));
            break;
          case "object":
            result += this.tagify(item, this.htmlify(object[item]));
        }
      }
    } else {
      return object;
    }
    if (prettify) {
      result = indent(result, null);
    }
    return result;
  };
  return Htmlify;
})();