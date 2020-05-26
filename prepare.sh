#!/usr/bin/env bash

set -u
set -e
set -o pipefail

mkdir -p ./website/scripts
rm -rf ./website/scripts/*
cp ./node_modules/@metamask/onboarding/dist/metamask-onboarding.bundle.js ./website/scripts
