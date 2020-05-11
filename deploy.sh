#!/usr/bin/env bash

set -u
set -o pipefail

readonly __SCRIPT_NAME__="${0##*/}"
readonly __SEE_HELP_MESSAGE__="See '${__SCRIPT_NAME__} --help' for more information."

GH_REMOTE='origin'
SOURCE_BRANCH='master'
DEPLOY_BRANCH='gh-pages'
WEBSITE_DIR_PATH='website'

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

# for gh-pages, use unpkg.com for dependencies
function replace_onboarding_src {
  local local_src="./metamask-onboarding.bundle.js"
  local web_src="https://unpkg.com/@metamask/onboarding@0.2.1/dist/metamask-onboarding.bundle.js"
  local target_file="${WEBSITE_DIR_PATH}/index.html"

  sed -i "" -e "s#${local_src}#${web_src}#g" "${target_file}"
}

function preprocess_and_publish {

  local shorthash

  git checkout "${SOURCE_BRANCH}" || abort "Failed to checkout ${SOURCE_BRANCH} branch"

  # string transforms for web publication
  replace_onboarding_src || abort "Failed to replace onboarding script source"

  # get shorthash
  shorthash=$(git rev-parse --short "refs/heads/${SOURCE_BRANCH}")

  # the shorthash is 7 characters long
  if [ ${#shorthash} -lt 7 ]
  then
    abort "git rev-parse returned an invalid shorthash from branch '${SOURCE_BRANCH}'"
  fi

  # commit to destination branch with shorthash in message
  git commit -am "update using ${SOURCE_BRANCH}/${shorthash}" || abort "Failed to commit to destination branch '${DEPLOY_BRANCH}'"

  # executes a forced "git subtree push" (git subtree does not take a force so we have to nest)
  git push "${GH_REMOTE}" "$(git subtree split --prefix "${WEBSITE_DIR_PATH}" "${SOURCE_BRANCH}")":"${DEPLOY_BRANCH}" --force || abort "Failed to push to '${GH_REMOTE}/${DEPLOY_BRANCH}'"
  echo "Successfully pushed to ${GH_REMOTE}/${DEPLOY_BRANCH}"
  git reset --hard HEAD~1 || abort "Failed to reset after publishing"
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
