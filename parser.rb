require 'nokogiri'
require 'yajl'

parser = Yajl::Parser.new
files = Dir.glob("html/full/*.html")

files.each do |path|
  f = File.open(path)
  doc = Nokogiri::HTML(f)
  f.close
  text = doc.css("#pageText")
  f = File.open (path.gsub '/full','/partial'), "w+"
  f.write text
  f.close
end
