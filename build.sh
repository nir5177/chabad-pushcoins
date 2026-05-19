#!/bin/bash
cd "$(dirname "$0")"
git fetch origin
git checkout claude/research-pushcoins-app-yiw6T
git pull origin claude/research-pushcoins-app-yiw6T
eas build --platform android --profile preview
