.PHONY: build

build:
	npx babel src --out-dir build/  --presets=@babel/env

deploy:
	git checkout master
	make build
	git push dropbox master
	git push origin master
