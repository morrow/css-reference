class App

  constructor:(element)->
    # load htmlify object
    @htmlify = new Htmlify()
    # set base directory
    @dir = "/CSS-Reference"
    # query history
    @history = [] 
    # current position in query history
    @history_pos = -1
    # paths object 
    @paths = window.paths
    # write to root
    @write(@root)
    # bind click events
    @bindEvents()
    # set window.app 
    window.app = @
    # initial load
    if window.location.hash
      query = window.location.hash.replace(/#\/|#/, '')
      query = '' if query and query.toLowerCase().match /css/
      app.load(query, true, 'replace')
    else
      app.load('')

  bindEvents:->
    # tab-key handling
    $("input[type=search]").live 'keydown', (e)-> 
      # tab key pressed (and wasn't just previously pressed)
      if e.keyCode == 9 and app.previous_keyCode != 9
        # stop from tabbing out of input box (on first tab event in-a-row only)
        e.preventDefault()
        # set search input box to first approximate result
        $(@).val($('.results .approximate li:first-child').text() or '')
    # search history navigation and enter-key handling
    $("input[type=search]").live 'keyup click', (e)-> 
      switch e.keyCode
        # enter key pressed, commit value
        when 13 then app.commit($(@).val())
        # up key pressed, navigate to previous element
        when 38
          # subtract one from app.history
          app.history_pos = Math.max(app.history_pos-1, 0)
          # set value of search input box
          $(@).val(app.history[app.history_pos])
          # display history list
          app.display(app.history[app.history_pos])
        # down key pressed, navigate to next element
        when 40 
          # subtract one from app.history
          app.history_pos = Math.min(app.history_pos+1, app.history.length-1)
          # set value of search input box
          $(@).val(app.history[app.history_pos])
          # display history list
          app.display(app.history[app.history_pos])
      # preview display
      app.preview($(@).val())
      # save previous keycode
      app.previous_keyCode = e.keyCode if e.keyCode
    # commit on blur of search input box
    $("body").live 'click', (e)->
      if $(e.target).attr('type') is 'search' or ($(e.target).parents('.approximate').length > 0 and $(e.target).nodeName == 'li')
        # commit content of search box
        app.commit($("input[type=search]").val()) if $("input[type=search]").val().length > 0
    # navigation of search history
    $(".history li").live "click", (e)->
      # load clicked element
      app.load($(@).text())
    # search result click event
    $(".approximate li").live "click", (e)->
      # load clicked element
      app.load($(@).text())
      # scroll to top
      window.scrollTo(0,0)
    $(".header h1 a").live "click", (e)->
      # load blank query
      app.load('') if e.keyCode is 0 or e.button is 0
      # stop loading of page if left click 
      e.preventDefault()
    # html5 history handling
    window.onpopstate = (e)-> 
      query = window.location.pathname.split('/')
      query = query[query.length-1]
      app.load(query, false)

  load:(path, commit=true, mode='push')->
    # format query
    query = path.replace('/', '')
    # update preview
    @preview(query)
    # commit if necessary
    @commit(query, mode) if commit
    # set position to index of element in array
    @history_pos = @history.indexOf(query)
    # update display
    @display(query)
      
  display:(query)->
    # update app history
    $('.search .history').html(app.htmlify.htmlify(app.history))
    # remove selected class from all history elements
    $(".history li").each(-> $(@).removeClass('selected'))
    # add selected class to history element at current index position
    $($('.history li')[app.history_pos]).addClass('selected')
    # set search value to current value
    $("input[type=search]").val(app.history[app.history_pos])

  preview:(input)->
    # setup html string
    html = ""
    # setup arrray for approximate matches
    approximates = []
    # convert query to lower case
    query = input.toLowerCase()
    # check paths for match to query
    for attribute of @paths
      attr = attribute.toLowerCase()
      try
        if attr.match(query) and query.length > 0
          approximates.push attribute
      catch e
        if (attr.indexOf(query.toString()) >= 0) or (attribute.indexOf(query.toString()) >= 0)  or (query.indexOf(attribute) >= 0) or (query.indexOf(attr) >= 0) and query.length > 0
          approximates.push attribute
    # display message for no approximate results
    if approximates.length <= 0
      # set html to appropriate error message 
      html = "No results for: #{query}" if query != ''
      # populate attribute array
      for attribute of @paths
        approximates.push attribute
    # sort approximates
    exact = []
    lower = []
    upper = []
    vendor = []
    special = []
    for attribute in approximates.sort()
      if query and attribute[0].toLowerCase() == query[0].toLowerCase()
        exact.push attribute
      else if attribute[0].match /[a-z]/
        lower.push attribute
      else if attribute[0].match /[A-Z]/
        upper.push attribute
      else if attribute[0].match /-/
        vendor.push attribute
      else
        special.push attribute
    # re-assemble approximate array
    approximates = exact.sort().concat(lower.sort()).concat(upper.sort()).concat(special.sort()).concat(vendor.sort())
    # added sorted list of approximate matches to html string
    html += @htmlify.htmlify(approximates)
    # fill approximate results element with html
    $('.results .approximate').html(html)
    # exact matches / approximate matches with only one element
    if input of @paths or approximates.length == 1
      # set loading text for exact result
      $('.results .exact').text("loading: #{input} ...")
      # take first element of approximates
      attribute = approximates[0]
      # overwrite with input if it's an exact match to given input
      attribute = input if (input of @paths)
      # fetch the html of the matched item
      $.ajax
        type:'GET'
        dataType:'html'
        url:@paths[attribute]
        success:(r)=>
          # add h1 link to current attribute
          html = @htmlify.tagify "a(href='#{@dir}/#/#{attribute}')", attribute if attribute
          html = @htmlify.tagify 'h1', html if attribute
          # add horizontal line
          html += r + '<hr />'
          # fill exact results element with html string
          $(".results .exact").html(html)
        error:(r)=> $('.results .exact').html('')
    else
      $('.results .exact').text('')
  
  commit:(input, mode='push')->
    # commit current search query to history if it's not already in it
    if input and input.length > 0 and @history.indexOf(input) < 0
      # add query to beginning of history array (newest items will appear on top of history list)
      @history.unshift input
    # change position of index of input in history 
    @history_pos = @history.indexOf(input) if input
    # prepend directory to url
    url = "#{@dir}/#{input}"
    # add to browser history
    window.history.pushState({query:input},url, url) if mode is 'push'
    window.history.replaceState({query:input},url, url) if mode is 'replace'
    # load 
    app.load(input, false)
    
  write:(element)->
    # hide element to write to
    $(element).hide()
    # write to document
    $(element).append(@htmlify.htmlify(window.data.document))
    # show element
    $(element).fadeIn('fast')