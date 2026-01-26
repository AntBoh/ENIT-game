#!/bin/bash

git add .

if git diff --cached --quiet; then
  echo "Niente da committare."
  exit 0
fi

git commit -m "auto commit"
git pull --rebase origin main
git push origin main
