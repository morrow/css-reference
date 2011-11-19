require 'nokogiri'
require 'yajl'

parser = Yajl::Parser.new
files = Dir.glob("html/full/*.html")

selectors = ['body', '#main', 'article','#pageText']

files.each do |path|
  f = File.open(path)
  doc = Nokogiri::HTML(f)
  f.close
  text = false
  selectors.each do |selector|
    text = doc.css(selector) if not doc.css(selector).empty?
  end
  if text
    f = File.open (path.gsub '/full','/partial'), "w+"
    f.write text
    f.close
  else
    puts "no selector found from #{selectors} in #{path}"
  end
end
