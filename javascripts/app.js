var App;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
App = (function() {
  function App(element) {
    var query;
    this.htmlify = new Htmlify();
    this.dir = "/CSS-Reference";
    this.history = [];
    this.history_pos = -1;
    this.paths = window.paths;
    this.write(this.root);
    this.bindEvents();
    window.app = this;
    if (window.location.hash) {
      query = window.location.hash.replace(/#\/|#/, '');
      if (query && query.toLowerCase().match(/css/)) {
        query = '';
      }
      app.load(query, true, 'replace');
    }
  }
  App.prototype.bindEvents = function() {
    $("input[type=search]").live('keydown', function(e) {
      if (e.keyCode === 9 && app.previous_keyCode !== 9) {
        e.preventDefault();
        return $(this).val(($('.results .approximate li:first-child').text()) || '');
      }
    });
    $("input[type=search]").live('keyup click', function(e) {
      switch (e.keyCode) {
        case 13:
          app.commit($(this).val());
          break;
        case 38:
          $(this).val(app.history[(app.history_pos = Math.min(app.history_pos + 1, app.history.length))]);
          break;
        case 40:
          $(this).val(app.history[(app.history_pos = Math.max(app.history_pos - 1, 0))]);
      }
      app.display();
      app.preview($(this).val());
      if (e.keyCode) {
        return app.previous_keyCode = e.keyCode;
      }
    });
    $("body").live('click', function(e) {
      if ($(e.target).attr('type') === 'search' || ($(e.target).parents('.approximate').length > 0 && $(e.target).nodeName === 'li')) {
        if ($("input[type=search]").val().length > 0) {
          return app.commit($("input[type=search]").val());
        }
      }
    });
    $(".history li").live("click", function(e) {
      return app.load(false);
    });
    $(".approximate li").live("click", function(e) {
      app.load($(this).text());
      return window.scrollTo(0, 0);
    });
    $(".header h1 a").live("click", function(e) {
      if (e.keyCode === 0) {
        app.load('');
      }
      return e.preventDefault();
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
    arr = [];
    $.map($(".history li").toArray(), function(val, i) {
      return arr.push($(val).text());
    });
    if (!(path != null)) {
      path = arr[app.history_pos] || '';
    }
    query = path.replace('/', '');
    this.preview(query);
    if (commit) {
      this.commit(query, mode);
    }
    this.history_pos = arr.indexOf(query);
    $("input[type=search]").val(arr[app.history_pos]);
    return this.display();
  };
  App.prototype.display = function() {
    $('.search .history').html(app.htmlify.htmlify(app.history));
    $(".history li").each(function() {
      return $(this).removeClass('selected');
    });
    return $($('.history li')[app.history_pos]).addClass('selected');
  };
  App.prototype.preview = function(input) {
    var approximates, attr, attribute, html, query;
    html = "";
    approximates = [];
    query = input.toLowerCase();
    for (attribute in this.paths) {
      attr = attribute.toLowerCase();
      if (attr.match(query) || !query || query === '') {
        approximates.push(attribute);
      }
    }
    if (approximates.length <= 0) {
      html = "No results for: " + query;
      for (attribute in this.paths) {
        approximates.push(attribute);
      }
    }
    html += this.htmlify.htmlify(approximates.sort());
    $('.results .approximate').html(html);
    if (!(input in this.paths || approximates.length === 1)) {
      return $('.results .exact').text('');
    } else {
      $('.results .exact').text('loading...');
      attribute = approximates[0];
      if (input in this.paths) {
        attribute = input;
      }
      return $.ajax({
        type: 'GET',
        dataType: 'html',
        url: this.paths[attribute],
        success: __bind(function(r) {
          html = this.htmlify.tagify('a(href="#{@dir}/#/' + attribute + '")', attribute);
          html = this.htmlify.tagify('h1', html);
          html += r + '<hr />';
          return $(".results .exact").html(html);
        }, this),
        error: __bind(function(r) {
          return $('.results .exact').html('');
        }, this)
      });
    }
  };
  App.prototype.commit = function(input, mode) {
    var url;
    if (mode == null) {
      mode = 'push';
    }
    if (input && input.length > 0 && this.history.indexOf(input) < 0) {
      this.history.unshift(input);
    }
    this.history_pos = this.history.indexOf(input);
    url = "" + this.dir + "/" + input;
    if (mode === 'push') {
      window.history.pushState({
        query: input
      }, url, url);
    }
    if (mode === 'replace') {
      window.history.replaceState({
        query: input
      }, url, url);
    }
    return app.load('', false);
  };
  App.prototype.write = function(element) {
    $(element).hide();
    $(element).append(this.htmlify.htmlify(window.data.document));
    return $(element).fadeIn('fast');
  };
  return App;
})();