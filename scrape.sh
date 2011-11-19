#!/usr/bin/env bash
ruby urls.rb
ruby scraper.rb
ruby parser.rb
cat html/full/* > html/full.html
cat html/partial/* > html/partial.html
ruby indexer.rb
