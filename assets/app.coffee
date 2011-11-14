class App

  constructor:(element)->
    @index = -1
    @history = [] 
    $.ajax
      url:"json/paths.json"
      success:(r)=>
        try
          @paths = JSON.parse(r)
        catch e
          console.log e
    @document = data.document
    @write(@root)
    @bindEvents()
    window.app = @
    if window.location.hash and window.location.hash.length > 0
      query = window.location.hash
      app.load(query)

  bindEvents:->
    app = @
    # tab-key handling
    $("input[type=search]").live 'keydown', (e)-> 
      if e.keyCode == 9 and app.keyCode != 9
        e.preventDefault()
        $(@).val(($('.results .approximate li:first-child').text()) or '')
    # search history navigation and enter-key handling
    $("input[type=search]").live 'keyup', (e)-> 
      switch e.keyCode
        when 13 then app.commit($(@).val())
        when 38 then $(@).val(app.history[(app.index = Math.max(app.index-1, 0))])
        when 40 then $(@).val(app.history[(app.index = Math.min(app.index+1, app.history.length))])
      app.display()
      app.preview($(@).val())
      app.keyCode = e.keyCode
    # commit on blur
    $("body").live 'click', (e)->
      target = $(e.target)
      if target.attr('type') != 'search' and not target.parents('.results').length > 0
        app.commit($("input[type=search]").val()) if $("input[type=search]").val().length > 0
    # navigation of search history
    $(".history li").live "click", (e)->
      arr = []
      $.map $(".history li").toArray(), (val, i)-> arr.push $(val).text()
      app.index = arr.indexOf($(@).text())
      $("input[type=search]").val(arr[app.index])
      app.preview(arr[app.index])
      app.display()
    # search result click event
    $(".approximate li").live "click", (e)->
      $("input[type=search]").val($(@).text())
      app.preview($(@).text())
      app.commit($(@).text())
    # html5 history
    window.onpopstate = (e)-> 
      query = window.location.pathname.split('/')
      query = query[query.length-1]
      app.load(query, false)

  load:(path, commit=true)->
    try
      query = path.replace('/', '')
      $('input[type=search]').val(query)
      @preview query
      @commit query if commit
      arr = []
      $.map($(".history li").toArray(), (val, i)-> arr.push $(val).text())
      app.index = arr.indexOf(query)
      @display()
    catch e
      console.log e

      
  display:->
    $(".history li").each(-> $(@).removeClass("selected"))
    $($(".history li")[app.index]).addClass("selected")

  preview:(input)->
    # approximate matches
    approximates = []
    for attribute of @paths
      if attribute.match input# or input.match attribute
        approximates.push attribute
    lenSort = (a,b)->
      a = a.toString().length
      b = b.toString().length
      return 0 if a == b
      return -1 if a < b
      return 1 if a > b
    html = @htmlify(approximates.sort())
    html = "No results found for #{input}" if not (html and html.length > 1)
    $(".results .approximate").html(html)
    # exact match
    if input of @paths or approximates.length == 1
      attribute = approximates[0]
      attribute = input if (input of @paths)
      $.ajax
        type:'GET'
        dataType:'html'
        url:@paths[attribute] 
        success:(r)=> 
          html = @tagify('h1', attribute) + r
          html = html.replace 'https://developer.mozilla.org/en/CSS/', ''
          html += '<hr />'
          $(".results .exact").html(html)
    else
      $(".results .exact").html('')
  
  commit:(input, mode=false)->
    if @history.indexOf(input) < 0
      @history.push input
      @index = @history.length-1
      title = input[0].toUpperCase() + input[1..]
      url = "/CSS-Reference/#{input}"
      window.history.pushState({query:input},title, url)
      $('.search .history').html(app.htmlify(app.history)) if input
    else
      app.load(input, false)
    
  write:(element)->
    $(element).hide()
    $(element).append @htmlify @document
    #$(element).append(document.createElement("pre")).find("pre").text @htmlify(@document, true)
    $(element).fadeIn("fast")

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

  process:(type="value", input)->
    return input

  htmlify:(object, prettify=false)->
    result = ""
    if object instanceof Array
      for item in object
        item = @process("value", item)
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
      return @process("value", object)
    if prettify
      result = indent(result, null)
    return result