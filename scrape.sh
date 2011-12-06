#!/usr/bin/env bash

# fetch and parse urls
ruby scripts/urls.rb
# scrape given urls
ruby scripts/scraper.rb
# parse html into partial html pages
ruby scripts/parser.rb
# concatenate full html files into single file
cat html/full/* > html/full.html
# concatenate partial html files into single file
cat html/partial/* > html/partial.html
# generate index page (html/index.html)
ruby scripts/indexer.rb
