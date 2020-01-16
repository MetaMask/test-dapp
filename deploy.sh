#!/usr/bin/env bash

set -u
set -o pipefail

readonly __SCRIPT_NAME__="${0##*/}"
readonly __SEE_HELP_MESSAGE__="See '${__SCRIPT_NAME__} --help' for more information."

function die {
  local message="${1}"

  printf "ERROR: %s\\n" "${message}" >&2

  exit 1
}

function show_help {
  cat << EOF
${__SCRIPT_NAME__}"
Deploy site to GitHub Pages branch
Options:
  -h, --help                    Show help text
  -s, --source <branch>         Upstream branch (defaults to 'master')
  -d, --destination <branch>    Branch to deploy to (defaults to 'gh-pages')
  -r, --remote <remote>          Remote to deploy to (defaults to 'origin')
EOF
}

function is_working_tree_dirty {
  ! git diff --quiet
}

# for gh-pages, use unpkg.com for dependencies
function replace_onboarding_src {
  local local_src="node_modules/@metamask/onboarding/dist/metamask-onboarding.bundle.js"
  local web_src="unpkg.com/metamask-onboarding"
  local target_file="index.html"

  sed -i "" -e "s/${local_src}/${web_src}/g" "${target_file}"
}

function main {

  local gh_remote='origin'
  local source_branch='master'
  local deploy_branch='gh-pages'

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
        source_branch="${2}"
        shift
        ;;
      -d|--destination)
        if [[ -z $2 ]]; then
          printf "'destination' option requires an argument.\\n" >&2
          printf "%s\\n" "${__SEE_HELP_MESSAGE__}" >&2
          exit 1
        fi
        deploy_branch="${2}"
        shift
        ;;
      -r|--remote)
        if [[ -z $2 ]]; then
          printf "'remote' option requires an argument.\\n" >&2
          printf "%s\\n" "${__SEE_HELP_MESSAGE__}" >&2
          exit 1
        fi
        gh_remote="${2}"
        shift
        ;;
      *)
        break
    esac

    shift
  done

  if is_working_tree_dirty
  then
    die 'Working tree is dirty; please clean it up and try again'
  fi

  # checkout gh-pages, update files
  if git show-ref "refs/heads/${deploy_branch}"
  then
    git checkout "${deploy_branch}"
  else
    git checkout -b "${deploy_branch}"
    rm *
  fi
  git checkout "${source_branch}" -- contract.js index.html || die "Failed to checkout files from ${source_branch}"

  # make changes for web publication
  replace_onboarding_src

  git commit -am "update to latest master" || die "Failed to commit to ${deploy_branch}"
  git push -f -u ${gh_remote} ${deploy_branch} || die "Failed to push to ${gh_remote}/${deploy_branch}"
  echo "Successfully pushed to ${gh_remote}/${deploy_branch}"
}

main "${@}"
