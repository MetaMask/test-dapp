#!/usr/bin/env bash

set -u
set -o pipefail

GH_REMOTE="origin"
SOURCE_BRANCH="main"
DEPLOY_BRANCH="gh-pages"
readonly WEBSITE_DIR_PATH="dist"

# CLI constants
readonly __SCRIPT_NAME__="${0##*/}"
readonly __SEE_HELP_MESSAGE__="See '${__SCRIPT_NAME__} --help' for more information."

function show_help {
  cat << EOF
${__SCRIPT_NAME__}
Deploy site to GitHub Pages branch
Options:
  -h, --help                    Show help text
  -s, --source <branch>         Upstream branch (defaults to 'main')
  -d, --destination <branch>    Branch to deploy to (defaults to 'gh-pages')
  -r, --remote <remote>         Remote to deploy to (defaults to 'origin')
EOF
}

function cli {
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
}

function is_working_tree_dirty {
  ! git diff --quiet
}

function abort {
  local message="${1}"

  printf "ERROR: %s\\n" "${message}" >&2

  exit 1
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

  yarn gh-pages --dist "$WEBSITE_DIR_PATH" --message "$commitMessage" || abort "gh-pages failed to deploy"

  echo "Successfully pushed to ${GH_REMOTE}/${DEPLOY_BRANCH}"
}

# main program

cli "$@"

if is_working_tree_dirty
then
  abort "Working tree is dirty; please clean it up and try again"
fi

preprocess_and_deploy
exit 0
