#!/usr/bin/env bash

set -u
set -o pipefail

readonly __SCRIPT_NAME__="${0##*/}"
readonly __SEE_HELP_MESSAGE__="See '${__SCRIPT_NAME__} --help' for more information."

GH_REMOTE='origin'
SOURCE_BRANCH='master'
DEPLOY_BRANCH='gh-pages'
DEPLOY_FILES='index.html metamask.css contract.js'

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
  local local_src="node_modules/@metamask/onboarding/dist/metamask-onboarding.bundle.js"
  local web_src="https://unpkg.com/@metamask/onboarding@0.2.0/dist/metamask-onboarding.bundle.js"
  local target_file="index.html"

  sed -i "" -e "s#${local_src}#${web_src}#g" "${target_file}"
}

function preprocess_and_publish {

  git fetch || abort "Failed to fetch"

  # checkout gh-pages, update local files
  if git show-ref "refs/heads/${DEPLOY_BRANCH}"
  then
    git checkout "${DEPLOY_BRANCH}" || abort "Failed to check out ${DEPLOY_BRANCH}"
    git reset --hard "${GH_REMOTE}/${DEPLOY_BRANCH}" || abort "Failed to reset to '${GH_REMOTE}/${DEPLOY_BRANCH}'"
  else
    git checkout -b "${DEPLOY_BRANCH}" || abort "Failed to checkout '${GH_REMOTE}/${DEPLOY_BRANCH}'"
    git rm -r ./\* || abort "Failed to clean git index"
  fi
  git checkout "${SOURCE_BRANCH}" -- "${DEPLOY_FILES}" || abort "Failed to checkout files from '${SOURCE_BRANCH}'"

  # make changes for web publication
  replace_onboarding_src || abort "Failed to replace onboarding script source"

  # get shorthash
  local shorthash=$(git rev-parse --short "refs/heads/${SOURCE_BRANCH}")

  # the shorthash is 7 characters long
  if [ ${#shorthash} -lt 7 ]
  then
    abort "git rev-parse returned an invalid shorthash from branch '${SOURCE_BRANCH}'"
  fi

  # commit to destination branch with shorthash in message
  git commit -am "update using ${SOURCE_BRANCH}/${shorthash}" || abort "Failed to commit to destination branch '${DEPLOY_BRANCH}'"

  # the "-u" here is if the branch was created
  git push -u "${GH_REMOTE}" "${DEPLOY_BRANCH}" || abort "Failed to push to '${GH_REMOTE}/${DEPLOY_BRANCH}'"
  echo "Successfully pushed to ${GH_REMOTE}/${DEPLOY_BRANCH}"
  git checkout "${SOURCE_BRANCH}" || abort "Failed to checkout source branch after publishing"
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
