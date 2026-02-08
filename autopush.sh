#!/bin/bash

set -e

git add -A

if git diff --cached --quiet; then
  echo "Niente da committare."
  exit 0
fi

git commit -m "auto update"

echo "Force pushing to origin/main..."
git push origin main --force
