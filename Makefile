test:
	npm run test

dev:
	npm run dev

.PHONY: build
build: clean
	npm run build

clean:
	rm -rf build/ .cache

deploy: build
	if git show-ref -q --heads gh-pages; then \
		git branch -D gh-pages;\
	fi
	git checkout --orphan gh-pages
	git reset --mixed
	mv build/* .
	git add index.html *.js *.css
	git commit -m 'deploy-$(shell date --iso=seconds)'
	git push -f origin gh-pages
	git checkout -f main
