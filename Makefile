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
	if git show-ref -q --heads gh-pages; then \
		git branch -D gh-pages;\
	fi
	git stash save
	git checkout --orphan gh-pages
	git reset --mixed
	mv build/* .
	git add index.html *.js *.css
	git commit -m 'Deploy-$(shell date --iso=seconds)'
	git push -f origin gh-pages
	git checkout -f main
	git stash pop
