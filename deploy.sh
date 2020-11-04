#!/usr/bin/env bash

set -u
set -o pipefail

readonly __SCRIPT_NAME__="${0##*/}"
readonly __SEE_HELP_MESSAGE__="See '${__SCRIPT_NAME__} --help' for more information."

GH_REMOTE='origin'
SOURCE_BRANCH='master'
DEPLOY_BRANCH='gh-pages'
WEBSITE_DIR_PATH='dist'
RETURN_PATH='..'

function abort {
  local message="${1}"

  printf "ERROR: %s\\n" "${message}" >&2

  exit 1
}

function show_help {
  cat << EOF
${__SCRIPT_NAME__}
Deploy site to GitHub Pages branch
Options:
  -h, --help                    Show help text
  -s, --source <branch>         Upstream branch (defaults to 'master')
  -d, --destination <branch>    Branch to deploy to (defaults to 'gh-pages')
  -r, --remote <remote>         Remote to deploy to (defaults to 'origin')
EOF
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

function preprocess_and_publish {

  yarn lint || abort "Lint failure"
  yarn build || abort "Failed to build"

  local shorthash
  shorthash=$(get_shorthash)

  cd ${WEBSITE_DIR_PATH} || abort "Failed to navigate to website directory"

  git init || abort "Failed to initialize git repository in website directory"
  git add -A . || abort "Failed to stage website files"
  git commit -m "update using ${SOURCE_BRANCH}/${shorthash}" || abort "Failed to commit website files"
  git push -f git@github.com:MetaMask/test-dapp.git ${SOURCE_BRANCH}:${DEPLOY_BRANCH} || abort "Failed to push to ${GH_REMOTE}/${DEPLOY_BRANCH}"
  echo "Successfully pushed to ${GH_REMOTE}/${DEPLOY_BRANCH}"

  rm -rf .git || abort "Failed to delete .git folder in ${WEBSITE_DIR_PATH}"

  cd ${RETURN_PATH} || abort "Failed to navigate back to root directory"
}

function main {

  while :; do
    case "${1-default}" in
      -h|--help)
        show_help
        exit
        ;;
      -s|--source)
        if [[ -z $2 ]]; then
          printf "'source' option requires an argument.\\n" >&2
          printf "%s\\n" "${__SEE_HELP_MESSAGE__}" >&2
          exit 1
        fi
        SOURCE_BRANCH="${2}"
        shift
        ;;
      -d|--destination)
        if [[ -z $2 ]]; then
          printf "'destination' option requires an argument.\\n" >&2
          printf "%s\\n" "${__SEE_HELP_MESSAGE__}" >&2
          exit 1
        fi
        DEPLOY_BRANCH="${2}"
        shift
        ;;
      -r|--remote)
        if [[ -z $2 ]]; then
          printf "'remote' option requires an argument.\\n" >&2
          printf "%s\\n" "${__SEE_HELP_MESSAGE__}" >&2
          exit 1
        fi
        GH_REMOTE="${2}"
        shift
        ;;
      *)
        break
    esac

    shift
  done

  if is_working_tree_dirty
  then
    abort 'Working tree is dirty; please clean it up and try again'
  fi

  preprocess_and_publish
  exit 0
}

main "$@"
