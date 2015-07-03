EMC Cloud Provider Search App
=============================

Dependencies and Config:
	- Node.js/NPM
		- package.json
	- Bower
		- bower.json
	- Grunt
		- Gruntfile.js
		- build.config.js

Development:
	1. Install Node.js, Grunt and Bower
	2. Run: `npm install`
	3. Run: `bower install`
	4. Run: `grunt watch` (starts continuous compilation to /build/ during development)
	5. Run: `grunt compile` (compiles to /bin/ for deployment)

	*** See Gruntfile config files (above) for detailed notes about Grunt tasks and file management


URL:
	- http://www.emc.com/auth/service-provider/index.htm


Web Services:
	- http://emc.bluelevel.co.uk/Services/ServiceProviders.asmx/:resource/
		- Archive: Appends `ServiceProviderSearchSpecArchive` as `:resource`
		- Detail: Appends `ServiceProviderSearchSpecDetail?serviceProviderId=[12345]` as `:resource`


Freemarker Template:
	Source:
		- src/app/index.htm (Local use only; configure external asset paths as needed)
		- src/app/index_production.htm (Production; must be updated manually)
	Development Build:
		- build/index.htm
	Deployment Build:
		- bin/index.htm (Update src/app/index_production.htm as needed)
	Server Location:
		- CONTENT PAGES/Service Provider Search/Service Provider Landing Page (en_US)


CSS:
	Source:
		- src/sass/*
	Development Build:
		- build/assets/app.css
	Deployment Build:
		- bin/assets/app.css
	Server Location:
		- PresentationCode/CSS/css/service-provider-search/app


Javascript:
	Source:
		- src/app/*.js
		- src/app/home.tpl.html
		- src/common/*
	Development Build:
		- build/src/*
		- build/vendor/*
		- templates-*.js
	Deployment Build:
		- bin/assets/app.js
	Server Location:
		- PresentationCode/JS/js/service-provider-search/app
		- PresentationCode/JS/js/service-provider-search/respond
		- PresentationCode/JS/js/service-provider-search/hammer
		- PresentationCode/JS/js/service-provider-search/html5shiv


Images and Fonts:
	Source:
		- src/assets/*
	Development Build:
		- build/assets/*
	Deployment Build:
		- bin/assets/*
	Server Location:
		- emc/Art & Media/IMAGES/Service Provider Search/bkgrnd_app_header_pattern_full.jpg
		- emc/Art & Media/IMAGES/Service Provider Search/glyphicons-halflings-regular.eot
		- emc/Art & Media/IMAGES/Service Provider Search/glyphicons-halflings-regular.svg
		- emc/Art & Media/IMAGES/Service Provider Search/glyphicons-halflings-regular.ttf
		- emc/Art & Media/IMAGES/Service Provider Search/glyphicons-halflings-regular.woff
