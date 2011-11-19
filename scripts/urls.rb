#!/usr/bin/env ruby
require 'json'
require 'nokogiri'
require 'cgi'

urls = {}
paths = {}

sources = {
  'https://developer.mozilla.org/en/CSS/CSS_Reference' => 'a[rel=custom]',
  'https://developer.mozilla.org/en/CSS/CSS_Reference/Mozilla_Extensions ' => 'a[rel=custom]',
  'http://css-infos.net/properties/webkit' => 'a.property'
}

sources.each do |url, selector|
  t = Time.now.to_i.to_s
  `wget #{url} -O /tmp/#{t}.txt`
  if not File.exists? "/tmp/#{t}.txt"
    puts "trouble downloading #{urls}"
    exit
  end
  doc = open("/tmp/#{t}.txt").read
  doc = Nokogiri::HTML(doc)
  doc.css(selector).each do |link|
    href = link.attribute('href').value
    name = CGI.unescape(href.split('/').last)
    if not href.match /http/
      if href[0] == '/'
        href = url.split("/")[0..2].join("/") + href        
      else
        href = url + href
      end
    end
    href = href.gsub('://', ':$$').gsub('//', '/').gsub(':$$', '://')
    urls[name] = href
    filename = name.gsub /^.*(\\|\/)/, ''
    filename.gsub!(/[^0-9A-Za-z.\-]/, 'x')
    paths[name] = "html/partial/#{filename}.html"
    puts "paths[#{name}] = \"html/partial/#{filename}.html\""
  end
end

urls = urls.to_json
paths = paths.to_json

f = File.open 'json/urls.json', 'w+'
f.write urls
f.close

f = File.open 'json/paths.json', 'w+'
f.write paths
f.close

f = File.open 'javascripts/urls.js', 'w+'
f.write "window.urls = JSON.parse('#{urls}');"
f.close

f = File.open 'javascripts/paths.js', 'w+'
f.write "window.paths = JSON.parse('#{paths}');"
f.close