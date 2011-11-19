#!/usr/bin/env ruby
require 'fileutils'
require 'yajl'

# initialize variables
robots = 'https://developer.mozilla.org/robots.txt'
parser = Yajl::Parser.new
urls = parser.parse open('json/urls.json').read

# prompt for file overwrite
puts "overwrite files? "
message = STDIN.gets.chomp  
if message.match /y|Y/ then overwrite = true else overwrite = false end

# make directories for html files
FileUtils.mkdir_p 'json'
FileUtils.mkdir_p 'javascripts'
FileUtils.mkdir_p 'html/full'
FileUtils.mkdir_p 'html/partial'

# form urls array for scraping
if ARGV.length > 0
  _urls = {}
  ARGV.each do |arg|
    urls.each do |name, url|
      if name.match arg or arg.match name
        _urls[name] = urls[name]
      else
        puts "not found: #{name} in #{arg}"
      end
    end
  end
  urls = _urls
end

# update js version of paths
json = open('json/paths.json').read

# get timeout delay from robots.txt
t = Time.now.to_i.to_s
`wget #{robots} -O /tmp/#{t}.txt`
if File.exists? "/tmp/#{t}.txt"
  delay = open("/tmp/#{t}.txt").read
  if delay and delay.class.to_s == "String"
    delay = delay.split('Crawl-delay:')[1] if delay
    delay = delay.split("\n")[0].strip.to_i if delay
  else
    delay = 5
  end    
end
delay = 5 if not delay or delay and delay.class.to_s != 'Fixnum'

# fetch URL contents, output to file
urls.each do |unsafename, url|
  name = unsafename.gsub /^.*(\\|\/)/, ''
  name.gsub!(/[^0-9A-Za-z.\-]/, 'x')
  puts "Checking for #{name} in \"html/full/#{name}.html\""
  if not File.exists? "html/full/#{name}.html" or overwrite
    `wget "#{url}" -O "html/full/#{name}.html"`
    begin
      sleep delay
    rescue
      sleep 5
    end
  else
    puts "File exists for #{name}"
  end
end