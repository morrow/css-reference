A search interface to a local copy of the MDN CSS Reference

Try it out here: [http://morrow.github.com/css-reference](http://morrow.github.com/css-reference)

Inspired from: [This Hacker News article](http://news.ycombinator.com/item?id=3233826) and [this web-page](http://instacss.com/).

If you want to generate a local version, you need ruby capable of running the scripts in scripts/ (call via scrape.sh)

To run, serve the files on a local server, and either set up routing to /#/attribute, or just redirect to the client-side javascript router called 404.html

It won't work dynamically with a local file:/// url, as local AJAX requets aren't allowed by Access-Control-Allow-Origin, but there is an index of the files under html/index.html.