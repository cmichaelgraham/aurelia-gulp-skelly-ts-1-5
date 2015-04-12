rm -fR aurelia-latest

mkdir aurelia-latest

cd aurelia-latest

git clone git://github.com/aurelia/loader
git clone git://github.com/aurelia/loader-default
git clone git://github.com/aurelia/path
git clone git://github.com/aurelia/task-queue
git clone git://github.com/aurelia/logging
git clone git://github.com/aurelia/logging-console
git clone git://github.com/aurelia/history
git clone git://github.com/aurelia/history-browser
git clone git://github.com/aurelia/event-aggregator
git clone git://github.com/aurelia/framework
git clone git://github.com/aurelia/metadata
git clone git://github.com/aurelia/binding
git clone git://github.com/aurelia/templating
git clone git://github.com/aurelia/dependency-injection
git clone git://github.com/aurelia/router
git clone git://github.com/aurelia/templating-binding
git clone git://github.com/aurelia/templating-resources
git clone git://github.com/aurelia/templating-router
git clone git://github.com/aurelia/route-recognizer
git clone git://github.com/aurelia/http-client
git clone git://github.com/aurelia/bootstrapper
git clone git://github.com/aurelia/html-template-element

cd ..

echo build aurelia-bundle
node r.js -o name=aurelia-bundle-manifest baseUrl=. mainConfigFile=main-config.js out=aurelia-bundle.js optimize=none

echo build aurelia-bundle-latest
node r.js -o name=aurelia-bundle-manifest baseUrl=. mainConfigFile=main-config-latest.js out=aurelia-bundle-latest.js optimize=none

rm -fR aurelia-latest

cp -f aurelia-bundle.js aurelia-bundle-latest.js aurelia-bundle.min.js ../scripts/aurelia
