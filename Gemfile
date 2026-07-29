# Local preview only — GitHub Pages ignores this file and builds the site with
# its own pinned gem set (Jekyll 3.9 + Liquid 4.0). That set cannot run on a
# current Ruby: Liquid 4.0 calls String#tainted?, removed in Ruby 3.2. So local
# previews use modern Jekyll instead. The rendered output matches for this site
# — same kramdown/rouge/jekyll-feed, and the templates use plain Liquid — but
# production is the source of truth, so check the live site after a push.
#
# Setup (needs Homebrew Ruby; macOS system Ruby 2.6 is too old):
#   brew install ruby && echo 'export PATH="/opt/homebrew/opt/ruby/bin:$PATH"' >> ~/.zshrc
#   bundle install
#   bundle exec jekyll serve --livereload

source "https://rubygems.org"

gem "jekyll", "~> 4.4"

group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.17"
end

# Ruby 3.4+ dropped these from the standard library; Jekyll and its
# dependencies still require them.
gem "csv"
gem "base64"
gem "bigdecimal"
gem "logger"

# Ruby 3 dropped webrick, which `jekyll serve` needs.
gem "webrick", "~> 1.8"
