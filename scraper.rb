require 'yajl'

overwrite = ARGV[0] or false
parser = Yajl::Parser.new
urls = parser.parse open('json/urls.json').read

t = Time.now.to_i.to_s

`wget https://developer.mozilla.org/robots.txt -O /tmp/#{t}.txt`

if File.exists? "/tmp/#{t}.txt"
  delay = open("/tmp/#{t}.txt").read
  delay = delay.split('Crawl-delay:')[1].split("\n")[0].strip.to_i
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