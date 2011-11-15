#!/usr/bin/env ruby

html = ''
files = Dir.glob 'partial/*.html'
files.each do |file|
  html += "<li><a href='#{file}'>#{file}</a></li>"
end
html = """
<!DOCTYPE html>
<html>
  <head>
    <title>CSS Reference - Directory</title>
    <link rel='stylesheet' href='http://morrow.github.com/stylesheets/screen.css' />
  </head>
  <body>
    <h1>CSS Reference - Directory</h1>
    <ul>
      <li>
        <h2><a href='http://morrow.github.com/CSS-Reference'>Interactive Search</a></h2>
      </li>
      <li>
        <h2><a href='https://github.com/morrow/CSS-Reference'>Github Repo</a></h2>
      </li>
      #{html}
    </ul>
  </body>
</html>
"""
f = File.open 'index.html', 'w+'
f.write(html)
f.close
