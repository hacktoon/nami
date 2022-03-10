test:
	npm run test

dev:
	npm run dev

.PHONY: build
build: clean
	npm run build

clean:
	rm -rf build/ .parcel-cache

deploy: build
	git branch -D gh-pages 1> /dev/null 2> /dev/null
	git stash save
	git checkout --orphan gh-pages
	git reset --mixed
	mv build/* .
	git add index.html *.js *.css
	git commit -m 'Deploy-$(shell date --iso=seconds)'
	git push -u -f origin gh-pages 1> /dev/null 2> /dev/null
	git checkout -f main
	@git stash pop 1> /dev/null 2> /dev/null || true
