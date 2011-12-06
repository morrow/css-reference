#!/usr/bin/env ruby

html = ''
path = 'http://morrow.github.com'
repo = 'https://github.com/morrow/CSS-Reference'
files = Dir.glob 'html/partial/*.html'
files.each do |file|
  file = file.sub 'html/', ''
  name = file.gsub /partial\/|\.html/, ''
  html += "<li><a href='#{file}'>#{name}</a></li>"
end
html = """
<!DOCTYPE html>
<html>
  <head>
    <title>CSS Reference - Directory</title>
    <link rel='stylesheet' href='#{path}/stylesheets/screen.css' />
  </head>
  <body>
    <h1>CSS Reference - Directory</h1>
    <ul>
      <li>
        <h2><a href='#{path}/CSS-Reference'>Interactive Search</a></h2>
      </li>
      <li>
        <h2><a href='#{repo}'>Github Repo</a></h2>
      </li>
      #{html}
    </ul>
  </body>
</html>
"""
f = File.open 'html/index.html', 'w+'
f.write(html)
f.close
