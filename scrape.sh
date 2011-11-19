#!/usr/bin/env bash

# fetch and parse urls
ruby scripts/urls.rb
# scrape given urls
ruby scripts/scraper.rb
# parse html into partial html pages
ruby scripts/parser.rb
# concatenate directories into single files for searching
cat html/full/* > html/full.html
cat html/partial/* > html/partial.html
# index page (html/index.html)
ruby scripts/indexer.rb
