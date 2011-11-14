require 'yajl'

overwrite = ARGV[0] or false
parser = Yajl::Parser.new
urls = parser.parse open('json/urls.json').read

# update js version of paths file
json = open('json/paths.json').read
f = File.open 'javascripts/paths.js', 'w+'
f.write "window.paths = JSON.parse('#{json}');"
f.close

t = Time.now.to_i.to_s

`wget https://developer.mozilla.org/robots.txt -O /tmp/#{t}.txt`

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

urls.each do |unsafename, url|
  name = unsafename.gsub /^.*(\\|\/)/, ''
  name.gsub!(/[^0-9A-Za-z.\-]/, 'x')
  puts "Checking for #{name} in \"html/full/#{name}.html\""
  if not File.exists? "html/full/#{name}.html" or overwrite
    `wget #{url} -O html/full/#{name}.html`
    begin
      sleep delay
    rescue
      sleep 5
    end
  else
    puts "File exists for #{name}"
  end
end