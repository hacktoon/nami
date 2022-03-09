.PHONY: build

dev:
	npm run dev

build:
	rm build/*
	npm run build

deploy:
	rm build/* docs/*
	npm run build
	cp build/* docs/

test:
	npm run test