#!/bin/sh
set -e

cd "$(dirname "$0")/.."
version='2.3.0'
outfile="zoterocitationcountsmanager-${version}-zotero10.xpi"

rm -f "${outfile}"
zip -r "${outfile}" \
  locale/* \
  icons/* \
  manifest.json \
  bootstrap.js \
  preferences.js \
  preferences.xhtml \
  prefs.js \
  zoterocitationcounts.js

echo "Built ${outfile} successfully."
