PROJECT       =htmltopdf
PROJECT_DIR		=$(shell pwd)
CACHE_DIR    =$(PROJECT_DIR)/_vendor
VENDOR_DIR    =$(PROJECT_DIR)/vendor
GITHASH         :=$(shell git rev-parse --short HEAD)
BUILDDATE      	:=$(shell date -u +%Y%m%d%H%M)
CHROME_HEADLESS_FILENAME :=stable-headless-chromium-amazonlinux-2017-03.zip
CHROME_HEADLESS_URL :=https://github.com/adieuadieu/serverless-chrome/releases/download/v1.0.0-29/$(CHROME_HEADLESS_FILENAME)

.SILENT: ;  # no need for @

download_chrome:
	mkdir -p $(VENDOR_DIR)
	(cd $(CACHE_DIR) && curl -O $(CHROME_HEADLESS_URL))
	(cd $(VENDOR_DIR) && unzip -o $(CACHE_DIR)/$(CHROME_HEADLESS_FILENAME))

install:
	yarn install

init: install
	echo "Setting pre-push hook..."
	(cd .git/hooks && ln -sf ../../misc/pre-push.sh pre-push)
	echo "Done..."

lint:
	echo "Linting..."
	./misc/pre-push.sh
