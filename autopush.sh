#!/bin/bash

git add .

if git diff --cached --quiet; then
  echo "Niente da committare."
  exit 0
fi

git commit -m "auto commit"

# recupera aggiornamenti
git fetch origin

# se ci sono cambiamenti remoti, fai rebase
git rebase origin/main

# poi push
git push origin main
