.PHONY: build

build:
	npx babel src --out-dir build/  --presets=@babel/env