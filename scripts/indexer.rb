#!/usr/bin/env ruby

html = ''
path = 'http://morrow.github.com'
repo = 'https://github.com/morrow/CSS-Reference'
files = Dir.glob 'html/partial/*.html'
files.sort.each do |file|
  file = file.sub 'html/', ''
  name = file.gsub(/partial\/|\.html/, '')
  name = ":#{name[1..-1]}" if name[0] == 'x' 
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
    <p> Some item links listed below may not display the exact attribute name correctly, due to file-name limitations. </p>
    <p>The page text will display the correct formatting for the attribute, however.</p>
    <p><a href='#{path}/CSS-Reference'>Interactive Search</a></p>
    <p><a href='#{repo}'>Github Repo</a></p>
    <hr />
    <ul> #{html} </ul>
  </body>
</html>
"""
f = File.open 'html/index.html', 'w+'
f.write(html)
f.close
