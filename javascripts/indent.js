var indent;
indent = function(html_source, options) {
  var Parser, brace_style, indent_character, indent_size, max_char, multi_parser, t, unformatted;
  Parser = function() {
    this.pos = 0;
    this.token = "";
    this.current_mode = "CONTENT";
    this.tags = {
      parent: "parent1",
      parentcount: 1,
      parent1: ""
    };
    this.tag_type = "";
    this.token_text = this.last_token = this.last_text = this.token_type = "";
    this.Utils = {
      whitespace: "\n\r\t ".split(""),
      single_token: "br,input,link,meta,!doctype,basefont,base,area,hr,wbr,param,img,isindex,?xml,embed".split(","),
      extra_liners: "head,body,/html".split(","),
      in_array: function(what, arr) {
        var i;
        i = 0;
        while (i < arr.length) {
          if (what === arr[i]) {
            return true;
          }
          i++;
        }
        return false;
      }
    };
    this.get_content = function() {
      var content, i, input_char, space;
      input_char = "";
      content = [];
      space = false;
      while (this.input.charAt(this.pos) !== "<") {
        if (this.pos >= this.input.length) {
          if (content.length) {
            return content.join("");
          } else {
            return ["", "TK_EOF"];
          }
        }
        input_char = this.input.charAt(this.pos);
        this.pos++;
        this.line_char_count++;
        if (this.Utils.in_array(input_char, this.Utils.whitespace)) {
          if (content.length) {
            space = true;
          }
          this.line_char_count--;
          continue;
        } else if (space) {
          if (this.line_char_count >= this.max_char) {
            content.push("\n");
            i = 0;
            while (i < this.indent_level) {
              content.push(this.indent_string);
              i++;
            }
            this.line_char_count = 0;
          } else {
            content.push(" ");
            this.line_char_count++;
          }
          space = false;
        }
        content.push(input_char);
      }
      if (content.length) {
        return content.join("");
      } else {
        return "";
      }
    };
    this.get_script = function() {
      var content, end_script, input_char, reg_array, reg_match;
      input_char = "";
      content = [];
      reg_match = new RegExp("</script" + ">", "igm");
      reg_match.lastIndex = this.pos;
      reg_array = reg_match.exec(this.input);
      end_script = (reg_array ? reg_array.index : this.input.length);
      while (this.pos < end_script) {
        if (this.pos >= this.input.length) {
          if (content.length) {
            return content.join("");
          } else {
            return ["", "TK_EOF"];
          }
        }
        input_char = this.input.charAt(this.pos);
        this.pos++;
        content.push(input_char);
      }
      if (content.length) {
        return content.join("");
      } else {
        return "";
      }
    };
    this.record_tag = function(tag) {
      if (this.tags[tag + "count"]) {
        this.tags[tag + "count"]++;
        this.tags[tag + this.tags[tag + "count"]] = this.indent_level;
      } else {
        this.tags[tag + "count"] = 1;
        this.tags[tag + this.tags[tag + "count"]] = this.indent_level;
      }
      this.tags[tag + this.tags[tag + "count"] + "parent"] = this.tags.parent;
      return this.tags.parent = tag + this.tags[tag + "count"];
    };
    this.retrieve_tag = function(tag) {
      var temp_parent;
      if (this.tags[tag + "count"]) {
        temp_parent = this.tags.parent;
        while (temp_parent) {
          if (tag + this.tags[tag + "count"] === temp_parent) {
            break;
          }
          temp_parent = this.tags[temp_parent + "parent"];
        }
        if (temp_parent) {
          this.indent_level = this.tags[tag + this.tags[tag + "count"]];
          this.tags.parent = this.tags[temp_parent + "parent"];
        }
        delete this.tags[tag + this.tags[tag + "count"] + "parent"];
        delete this.tags[tag + this.tags[tag + "count"]];
        if (this.tags[tag + "count"] === 1) {
          return delete this.tags[tag + "count"];
        } else {
          return this.tags[tag + "count"]--;
        }
      }
    };
    this.get_tag = function() {
      var comment, content, input_char, space, tag_check, tag_complete, tag_index;
      input_char = "";
      content = [];
      space = false;
      while (true) {
        if (this.pos >= this.input.length) {
          if (content.length) {
            return content.join("");
          } else {
            return ["", "TK_EOF"];
          }
        }
        input_char = this.input.charAt(this.pos);
        this.pos++;
        this.line_char_count++;
        if (this.Utils.in_array(input_char, this.Utils.whitespace)) {
          space = true;
          this.line_char_count--;
          continue;
        }
        if (input_char === "'" || input_char === "\"") {
          if (!content[1] || content[1] !== "!") {
            input_char += this.get_unformatted(input_char);
            space = true;
          }
        }
        if (input_char === "=") {
          space = false;
        }
        if (content.length && content[content.length - 1] !== "=" && input_char !== ">" && space) {
          if (this.line_char_count >= this.max_char) {
            this.print_newline(false, content);
            this.line_char_count = 0;
          } else {
            content.push(" ");
            this.line_char_count++;
          }
          space = false;
        }
        content.push(input_char);
        if (input_char === ">") {
          break;
        }
      }
      tag_complete = content.join("");
      tag_index = void 0;
      if (tag_complete.indexOf(" ") !== -1) {
        tag_index = tag_complete.indexOf(" ");
      } else {
        tag_index = tag_complete.indexOf(">");
      }
      tag_check = tag_complete.substring(1, tag_index).toLowerCase();
      if (tag_complete.charAt(tag_complete.length - 2) === "/" || this.Utils.in_array(tag_check, this.Utils.single_token)) {
        this.tag_type = "SINGLE";
      } else if (tag_check === "script") {
        this.record_tag(tag_check);
        this.tag_type = "SCRIPT";
      } else if (tag_check === "style") {
        this.record_tag(tag_check);
        this.tag_type = "STYLE";
      } else if (this.Utils.in_array(tag_check, unformatted)) {
        comment = this.get_unformatted("</" + tag_check + ">", tag_complete);
        content.push(comment);
        this.tag_type = "SINGLE";
      } else if (tag_check.charAt(0) === "!") {
        if (tag_check.indexOf("[if") !== -1) {
          if (tag_complete.indexOf("!IE") !== -1) {
            comment = this.get_unformatted("-->", tag_complete);
            content.push(comment);
          }
          this.tag_type = "START";
        } else if (tag_check.indexOf("[endif") !== -1) {
          this.tag_type = "END";
          this.unindent();
        } else if (tag_check.indexOf("[cdata[") !== -1) {
          comment = this.get_unformatted("]]>", tag_complete);
          content.push(comment);
          this.tag_type = "SINGLE";
        } else {
          comment = this.get_unformatted("-->", tag_complete);
          content.push(comment);
          this.tag_type = "SINGLE";
        }
      } else {
        if (tag_check.charAt(0) === "/") {
          this.retrieve_tag(tag_check.substring(1));
          this.tag_type = "END";
        } else {
          this.record_tag(tag_check);
          this.tag_type = "START";
        }
        if (this.Utils.in_array(tag_check, this.Utils.extra_liners)) {
          this.print_newline(true, this.output);
        }
      }
      return content.join("");
    };
    this.get_unformatted = function(delimiter, orig_tag) {
      var content, input_char, space;
      if (orig_tag && orig_tag.indexOf(delimiter) !== -1) {
        return "";
      }
      input_char = "";
      content = "";
      space = true;
      while (true) {
        if (this.pos >= this.input.length) {
          return content;
        }
        input_char = this.input.charAt(this.pos);
        this.pos++;
        if (this.Utils.in_array(input_char, this.Utils.whitespace)) {
          if (!space) {
            this.line_char_count--;
            continue;
          }
          if (input_char === "\n" || input_char === "\r") {
            content += "\n";
            this.line_char_count = 0;
            continue;
          }
        }
        content += input_char;
        this.line_char_count++;
        space = true;
        if (content.indexOf(delimiter) !== -1) {
          break;
        }
      }
      return content;
    };
    this.get_token = function() {
      var tag_name_type, temp_token, token;
      token = void 0;
      if (this.last_token === "TK_TAG_SCRIPT") {
        temp_token = this.get_script();
        if (typeof temp_token !== "string") {
          return temp_token;
        }
        token = js_beautify(temp_token.replace(/^[\r\n]+/, ""), {
          indent_size: this.indent_size,
          indent_char: this.indent_character,
          brace_style: this.brace_style
        });
        return [token, "TK_CONTENT"];
      }
      if (this.current_mode === "CONTENT") {
        token = this.get_content();
        if (typeof token !== "string") {
          return token;
        } else {
          return [token, "TK_CONTENT"];
        }
      }
      if (this.current_mode === "TAG") {
        token = this.get_tag();
        if (typeof token !== "string") {
          return token;
        } else {
          tag_name_type = "TK_TAG_" + this.tag_type;
          return [token, tag_name_type];
        }
      }
    };
    this.printer = function(js_source, indent_character, indent_size, max_char, brace_style) {
      var i;
      this.input = js_source || "";
      this.output = [];
      this.indent_character = indent_character;
      this.indent_string = "";
      this.indent_size = indent_size;
      this.brace_style = brace_style;
      this.indent_level = 0;
      this.max_char = max_char;
      this.line_char_count = 0;
      i = 0;
      while (i < this.indent_size) {
        this.indent_string += this.indent_character;
        i++;
      }
      this.print_newline = function(ignore, arr) {
        var _results;
        this.line_char_count = 0;
        if (!arr || !arr.length) {
          return;
        }
        if (!ignore) {
          while (this.Utils.in_array(arr[arr.length - 1], this.Utils.whitespace)) {
            arr.pop();
          }
        }
        arr.push("\n");
        i = 0;
        _results = [];
        while (i < this.indent_level) {
          arr.push(this.indent_string);
          _results.push(i++);
        }
        return _results;
      };
      this.print_token = function(text) {
        return this.output.push(text);
      };
      this.indent = function() {
        return this.indent_level++;
      };
      return this.unindent = function() {
        if (this.indent_level > 0) {
          return this.indent_level--;
        }
      };
    };
    return this;
  };
  multi_parser = void 0;
  indent_size = void 0;
  indent_character = void 0;
  max_char = void 0;
  brace_style = void 0;
  options = options || {};
  indent_size = options.indent_size || 4;
  indent_character = options.indent_char || " ";
  brace_style = options.brace_style || "collapse";
  max_char = options.max_char || "70";
  unformatted = options.unformatted || ["a"];
  multi_parser = new Parser();
  multi_parser.printer(html_source, indent_character, indent_size, max_char, brace_style);
  while (true) {
    t = multi_parser.get_token();
    multi_parser.token_text = t[0];
    multi_parser.token_type = t[1];
    if (multi_parser.token_type === "TK_EOF") {
      break;
    }
    switch (multi_parser.token_type) {
      case "TK_TAG_START":
      case "TK_TAG_STYLE":
        multi_parser.print_newline(false, multi_parser.output);
        multi_parser.print_token(multi_parser.token_text);
        multi_parser.indent();
        multi_parser.current_mode = "CONTENT";
        break;
      case "TK_TAG_SCRIPT":
        multi_parser.print_newline(false, multi_parser.output);
        multi_parser.print_token(multi_parser.token_text);
        multi_parser.current_mode = "CONTENT";
        break;
      case "TK_TAG_END":
        multi_parser.print_newline(true, multi_parser.output);
        multi_parser.print_token(multi_parser.token_text);
        multi_parser.current_mode = "CONTENT";
        break;
      case "TK_TAG_SINGLE":
        multi_parser.print_newline(false, multi_parser.output);
        multi_parser.print_token(multi_parser.token_text);
        multi_parser.current_mode = "CONTENT";
        break;
      case "TK_CONTENT":
        if (multi_parser.token_text !== "") {
          multi_parser.print_newline(false, multi_parser.output);
          multi_parser.print_token(multi_parser.token_text);
        }
        multi_parser.current_mode = "TAG";
    }
    multi_parser.last_token = multi_parser.token_type;
    multi_parser.last_text = multi_parser.token_text;
  }
  return multi_parser.output.join("");
};