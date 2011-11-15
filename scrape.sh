#!/usr/bin/env bash
ruby scraper.rb
ruby parser.rb
cat html/full/* > html/full.html
cat html/partial/* > html/partial.html
ruby html/indexer.rb
