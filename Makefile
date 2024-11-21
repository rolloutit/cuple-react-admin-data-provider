clean:
	rm packages/ra-data-provider/tsconfig.tsbuildinfo || echo ok
	rm packages/ra-api/tsconfig.tsbuildinfo || echo ok
	rm -rf packages/ra-data-provider/dist || echo ok
	rm -rf packages/ra-api/dist || echo ok

clean-if-needed:
	sh -c "( test -e packages/ra-data-provider/dist/ && test -e packages/ra-api/dist ) || make clean" 

build:
	make clean-if-needed
	cd packages/ra-api && npx tsc
	cd packages/ra-data-provider && npx tsc
	npx tsc

test: build
	npx mocha

lint:
	npx eslint ./packages ./test

lint-fix:
	npx eslint --fix ./packages ./test
