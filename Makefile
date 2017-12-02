PROJECT =htmltopdf
PROJECT_DIR =$(shell pwd)
CACHE_DIR =$(PROJECT_DIR)/_cache
VENDOR_DIR =$(PROJECT_DIR)/vendor
ARTIFACT_DIR =$(PROJECT_DIR)/_artifact
BUILD_DIR =$(PROJECT_DIR)/_build
GITHASH :=$(shell git rev-parse --short HEAD)
BUILDDATE :=$(shell date -u +%Y%m%d%H%M)
CHROME_HEADLESS_FILENAME :=stable-headless-chromium-amazonlinux-2017-03.zip
CHROME_HEADLESS_URL :=https://github.com/adieuadieu/serverless-chrome/releases/download/v1.0.0-29/$(CHROME_HEADLESS_FILENAME)
ARTIFACT_BUCKET :="artifacts.production.bepress.com"
ARTIFACT_NAME =$(PROJECT).zip
.SILENT: ;  # no need for @

download_chrome:
	docker run -dt --rm --name headless-chromium adieuadieu/headless-chromium-for-aws-lambda:dev
	docker cp headless-chromium:/bin/headless-chromium $(VENDOR_DIR)/headless-chromium
	docker stop headless-chromium

install_chrome:
	# This will trigger a download of chrome
	node lib/cli.js

install:
	yarn install

install_production:
	yarn install --production

install_debs:
	sudo apt-get install gconf-service libasound2 libatk1.0-0 \
	  libc6 libcups2 libdbus-1-3 libgconf-2-4 libgtk-3-0 libnspr4 \
		libxcomposite1 libxcursor1 libxi6 libxrandr2 libxss1 libxtst6 \
		fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget

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

build:
	mkdir -p $(CACHE_DIR)
	node_modules/.bin/babel lib/index.js > $(CACHE_DIR)/index.js

artifact:
	rm -fR $(BUILD_DIR)
	mkdir -p $(BUILD_DIR)
	mkdir -p $(ARTIFACT_DIR)
	cp -fR node_modules $(BUILD_DIR)/
	cp -fR vendor $(BUILD_DIR)/
	cp -fR package.json $(BUILD_DIR)/
	cp -fR yarn.lock $(BUILD_DIR)/
	(cd $(BUILD_DIR) && yarn install --production)
	cp -fR $(CACHE_DIR)/index.js $(BUILD_DIR)/
	rm -fR $(BUILD_DIR)/node_modules/puppeteer/.local-chromium
	rm -fR $(ARTIFACT_DIR)/$(ARTIFACT_NAME)
	(cd $(BUILD_DIR) && zip -rv $(ARTIFACT_DIR)/$(ARTIFACT_NAME) *)

upload:
	aws s3 cp $(ARTIFACT_DIR)/$(ARTIFACT_NAME) s3://$(ARTIFACT_BUCKET)/$(PROJECT)/release/$(GITHASH)/$(PROJECT).zip
	aws s3 cp s3://$(ARTIFACT_BUCKET)/$(PROJECT)/release/$(GITHASH)/$(PROJECT).zip s3://$(ARTIFACT_BUCKET)/$(PROJECT)/production/$(PROJECT).zip

tests: build
	yarn run test

package:
	serverless package

deploy:
	serverless deploy

deploy_function:
	serverless deploy function --function hello

logs:
	serverless logs -t -f hello
