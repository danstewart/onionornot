#!/usr/bin/env bash

# Actions
serve=0
build=0
deploy=0
help=0

while [[ "$#" -gt 0 ]]; do
	case "$1" in
		--serve) serve=1 ;;
		--build) build=1 ;;
        --deploy) build=1; deploy=1 ;;
		-h|--help) help=1 ;;
		--) shift; break ;;
	esac

	shift
done

if [[ $help == 1 ]] || [[ $serve == 1 && $build == 1 ]]; then
    echo "Usage: ./ctl.sh [--serve] [--build] [--help]"
    echo ""
    echo "--server: Serve the app for local development on http://localhost:8000"
    echo "          JavaScript will be live transpiled"
    echo "--build:  Build the app for production"
    echo "--deploy: Build and deploy to production"
    echo "--help:   Show this help text"
    echo ""
    echo "Requires: npm install --global @swc/cli @swc/core chokidar"
    echo "NOTE: chokidar is only required for the '--serve' mode"
    exit 0
fi


if [[ $serve == 1 ]]; then
    # Transpile JS
    npx swc --source-maps --watch src/js --out-dir src/build/ &

    # Serve
    echo "Starting server at http://localhost:8000"
    cd src
    python3 -m http.server
fi

if [[ $build == 1 ]]; then
    npx swc src/js --out-dir src/build/
fi

if [[ $deploy == 1 ]]; then
    scp -r src/* nginx:/data/www/onion.danstewart.xyz/
fi
