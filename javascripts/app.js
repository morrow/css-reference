var App;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
App = (function() {
  function App(element) {
    var query;
    this.index = -1;
    this.history = [];
    this.document = data.document;
    this.paths = window.paths;
    this.write(this.root);
    this.bindEvents();
    window.app = this;
    if (window.location.hash) {
      query = window.location.hash.replace('#/', '');
      query = window.location.hash.replace('#', '');
      if (query && query.toLowerCase().match(/css\-reference/)) {
        query = '';
      }
      app.load(query, true, 'replace');
    }
  }
  App.prototype.bindEvents = function() {
    var app;
    app = this;
    $("input[type=search]").live('keydown', function(e) {
      if (e.keyCode === 9 && app.keyCode !== 9) {
        e.preventDefault();
        return $(this).val(($('.results .approximate li:first-child').text()) || '');
      }
    });
    $("input[type=search]").live('keyup click', function(e) {
      if (e.keyCode) {
        switch (e.keyCode) {
          case 13:
            app.commit($(this).val());
            break;
          case 38:
            $(this).val(app.history[(app.index = Math.max(app.index - 1, 0))]);
            break;
          case 40:
            $(this).val(app.history[(app.index = Math.min(app.index + 1, app.history.length))]);
        }
      }
      app.display();
      app.preview($(this).val());
      if (e.keyCode) {
        return app.keyCode = e.keyCode;
      }
    });
    $("body").live('click', function(e) {
      var target;
      target = $(e.target);
      if (target.attr('type') === 'search' || (target.parents('.approximate').length > 0 && target.nodeName === 'li')) {
        if ($("input[type=search]").val().length > 0) {
          return app.commit($("input[type=search]").val());
        }
      }
    });
    $(".history li").live("click", function(e) {
      var arr;
      arr = [];
      $.map($(".history li").toArray(), function(val, i) {
        return arr.push($(val).text());
      });
      app.index = arr.indexOf($(this).text());
      $("input[type=search]").val(arr[app.index]);
      app.preview(arr[app.index]);
      return app.display();
    });
    $(".approximate li").live("click", function(e) {
      $("input[type=search]").val($(this).text());
      app.preview($(this).text());
      return app.commit($(this).text());
    });
    return window.onpopstate = function(e) {
      var query;
      query = window.location.pathname.split('/');
      query = query[query.length - 1];
      return app.load(query, false);
    };
  };
  App.prototype.load = function(path, commit, mode) {
    var arr, query;
    if (commit == null) {
      commit = true;
    }
    if (mode == null) {
      mode = 'push';
    }
    query = path.replace('/', '');
    $('input[type=search]').val(query);
    this.preview(query);
    if (commit) {
      this.commit(query, mode);
    }
    arr = [];
    $.map($(".history li").toArray(), function(val, i) {
      return arr.push($(val).text());
    });
    app.index = arr.indexOf(query);
    return this.display();
  };
  App.prototype.display = function() {
    $(".history li").each(function() {
      return $(this).removeClass("selected");
    });
    return $($(".history li")[app.index]).addClass("selected");
  };
  App.prototype.preview = function(input) {
    var approximates, attribute, html, lenSort;
    approximates = [];
    for (attribute in this.paths) {
      if (attribute.match(input)) {
        approximates.push(attribute);
      }
    }
    lenSort = function(a, b) {
      a = a.toString().length;
      b = b.toString().length;
      if (a === b) {
        return 0;
      }
      if (a < b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
    };
    html = this.htmlify(approximates.sort());
    if (!(html && html.length > 1)) {
      html = "No results found for " + input;
    }
    $(".results .approximate").html(html);
    if (input in this.paths || approximates.length === 1) {
      attribute = approximates[0];
      if (input in this.paths) {
        attribute = input;
      }
      return $.ajax({
        type: 'GET',
        dataType: 'html',
        url: this.paths[attribute],
        beforeSend: __bind(function(r) {
          return $('body').addClass('loading');
        }, this),
        complete: __bind(function(r) {
          return $('body').removeClass('loading');
        }, this),
        success: __bind(function(r) {
          html = this.tagify('a(href="/CSS-Reference/#/' + attribute + '")', attribute);
          html = this.tagify('h1', html);
          html += r + '<hr />';
          return $(".results .exact").html(html);
        }, this)
      });
    } else {
      return $(".results .exact").html('');
    }
  };
  App.prototype.commit = function(input, mode) {
    var title, url;
    if (mode == null) {
      mode = 'push';
    }
    if (input && this.history.indexOf(input) < 0) {
      this.history.push(input);
      this.index = this.history.length - 1;
      title = input[0].toUpperCase() + input.slice(1);
      url = "/CSS-Reference/" + input;
      if (mode === 'push') {
        window.history.pushState({
          query: input
        }, title, url);
      }
      if (mode === 'replace') {
        window.history.replaceState({
          query: input
        }, title, url);
      }
      if (input) {
        return $('.search .history').html(app.htmlify(app.history));
      }
    } else {
      return app.load(input, false);
    }
  };
  App.prototype.write = function(element) {
    $(element).hide();
    $(element).append(this.htmlify(this.document));
    return $(element).fadeIn("fast");
  };
  App.prototype.tagify = function(tag, content) {
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
  App.prototype.process = function(type, input) {
    if (type == null) {
      type = "value";
    }
    return input;
  };
  App.prototype.htmlify = function(object, prettify) {
    var item, result, _i, _len;
    if (prettify == null) {
      prettify = false;
    }
    result = "";
    if (object instanceof Array) {
      for (_i = 0, _len = object.length; _i < _len; _i++) {
        item = object[_i];
        item = this.process("value", item);
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
      return this.process("value", object);
    }
    if (prettify) {
      result = indent(result, null);
    }
    return result;
  };
  return App;
})();