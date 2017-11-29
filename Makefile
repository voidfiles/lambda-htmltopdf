PROJECT =htmltopdf
PROJECT_DIR =$(shell pwd)
CACHE_DIR =$(PROJECT_DIR)/_cache
VENDOR_DIR =$(PROJECT_DIR)/vendor
ARTIFACT_DIR =$(PROJECT_DIR)/artifact
GITHASH :=$(shell git rev-parse --short HEAD)
BUILDDATE :=$(shell date -u +%Y%m%d%H%M)
CHROME_HEADLESS_FILENAME :=stable-headless-chromium-amazonlinux-2017-03.zip
CHROME_HEADLESS_URL :=https://github.com/adieuadieu/serverless-chrome/releases/download/v1.0.0-29/$(CHROME_HEADLESS_FILENAME)
ARTIFACT_BUCKET :="artifacts.production.bepress.com"
ARTIFACT_NAME =$(PROJECT)-$(GITHASH).zip
.SILENT: ;  # no need for @

download_chrome:
	# This is for packaging for aws
	mkdir -p $(CACHE_DIR)
	mkdir -p $(VENDOR_DIR)
	echo $(CHROME_HEADLESS_URL)
	(cd $(CACHE_DIR) && curl -L -O $(CHROME_HEADLESS_URL))
	(cd $(VENDOR_DIR) && unzip -o $(CACHE_DIR)/$(CHROME_HEADLESS_FILENAME))

install_chrome:
	# This will trigger a download of chrome
	node lib/cli.js

install:
	yarn install

install_production:
	yarn install --production

init: install
	echo "Setting pre-push hook..."
	(cd .git/hooks && ln -sf ../../misc/pre-push.sh pre-push)
	echo "Done..."

lint:
	echo "Linting..."
	./misc/pre-push.sh

clean:
	rm -fR $(CACHE_DIR)
	rm -fR $(VENDOR_DIR)

compile:
	mkdir -p $(CACHE_DIR)
	node_modules/.bin/babel lib/index.js > $(CACHE_DIR)/index.js

artifact:
	mkdir -p $(ARTIFACT_DIR)
	zip -rv $(ARTIFACT_DIR)/$(ARTIFACT_NAME) node_modules vendor $(CACHE_DIR)/index.js

upload:
	aws s3 cp $(ARTIFACT_DIR)/$(ARTIFACT_NAME) s3://$(ARTIFACT_BUCKET)/$(PROJECT)/release/$(GITHASH)/$(PROJECT).zip
	aws s3 cp s3://$(ARTIFACT_BUCKET)/$(PROJECT)/release/$(GITHASH)/$(PROJECT).zip s3://$(ARTIFACT_BUCKET)/$(PROJECT)/production/$(PROJECT).tar.gz

tests: compile
	yarn run test
