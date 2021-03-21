#!/usr/bin/env bash

set -u
set -o pipefail

readonly GH_REMOTE="origin"
readonly SOURCE_BRANCH="main"
readonly DEPLOY_BRANCH="gh-pages"
readonly WEBSITE_DIR_PATH="dist"
readonly GH_PAGES_BIN_PATH="./node_modules/gh-pages/bin/gh-pages.js"

function abort {
  local message="${1}"

  printf "ERROR: %s\\n" "${message}" >&2

  exit 1
}

function is_working_tree_dirty {
  ! git diff --quiet
}

function get_shorthash {

  local shorthash

  shorthash=$(git rev-parse --short "refs/heads/${SOURCE_BRANCH}")

  # the shorthash is 7 characters long
  if [ ${#shorthash} -lt 7 ]
  then
    abort "git rev-parse returned an invalid shorthash from branch '${SOURCE_BRANCH}'"
  fi

  echo "${shorthash}"
}

function preprocess_and_deploy {

  yarn lint || abort "Lint failure"
  yarn build || abort "Failed to build"

  local shorthash
  shorthash=$(get_shorthash)

  local commitMessage="Update using ${SOURCE_BRANCH}/${shorthash}"

  node "$GH_PAGES_BIN_PATH" --dist "$WEBSITE_DIR_PATH" --message "$commitMessage" || abort "gh-pages failed to deploy"

  echo "Successfully pushed to ${GH_REMOTE}/${DEPLOY_BRANCH}"
}

function main {
  if is_working_tree_dirty
  then
    abort "Working tree is dirty; please clean it up and try again"
  fi

  preprocess_and_deploy
  exit 0
}

main "$@"
