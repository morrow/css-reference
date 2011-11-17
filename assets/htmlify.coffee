class Htmlify

  tagify:(tag, content="")->
    if tag and tag.indexOf("(") > 0 and tag.indexOf(")") > 0
      attributes = tag.split("(")[1].split(")")[0]
      tag = tag.split("(")[0]
    else
      attributes = ""
    matches = tag.match /a|abbr|address|area|article|aside|audio|b|base|bdi|bdo|blockquote|body|br|button|canvas|caption|cite|code|col|colgroup|command|datalist|dd|del|details|device|dfn|div|dl|dt|em|embed|fieldset|figcaption|figure|footer|form|h1|h2|h3|h4|h5|h6|head|header|hgroup|hr|html|i|iframe|img|input|ins|kbd|keygen|label|legend|li|link|map|mark|menu|meta|meter|nav|noscript|object|ol|optgroup|option|output|p|param|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|source|span|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|ul|var|video|wbr/
    if matches and matches[0].length == tag.length and !matches[0].match /title/
      tag = "n#{tag}" if parseInt(tag) > 0 and parseInt(tag).toString().length == tag.toString().length
      return "<#{tag}  #{attributes}>#{content}</#{tag}>"
    else
      if tag.match /input|img|link/
        switch tag
          when 'input'
            return "<#{tag} #{attributes} placeholder='#{content}'/>"
          when 'img'
            return "<#{tag} #{attributes} alt='#{content}'/>"
          when 'link'
            return "<#{tag} #{attributes} href='#{content}'/>"
      node = "div"
      if (attributes and attributes.match /href/) or content.indexOf('http') == 0
        node = "a"
        attributes = "href='#{content}'"
        if not attributes.match window.location.href
          attributes += " target='_blank'"
      if content.match /\.jpg$|\.png$|\.gif$/
        return "<img class='#{tag}' src='#{content}' />"
      return "<#{node} class=\"#{tag}\"#{attributes}>#{content}</#{node}>"

  htmlify:(object, prettify=false)->
    result = ""
    if object instanceof Array
      for item in object
        result += @tagify "li", item
      result = @tagify "ul", result
    else if object instanceof Object
      for item of object
        switch typeof object[item]
          when "string"
            result += @tagify item, @htmlify(object[item])
          when "object"
            result += @tagify item, @htmlify(object[item])
    else
      return object
    if prettify
      result = indent(result, null)
    return result