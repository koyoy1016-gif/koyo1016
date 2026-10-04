#!/bin/bash
cd "$(dirname "$0")"
F=ch/c00.js,ch/c01.js,ch/c02.js,ch/c03.js,ch/c04.js,ch/c05.js,ch/c06a.js,ch/c06b.js,ch/c07.js,ch/c08.js,ch/c09.js,ch/c10.js,ch/c11.js,ch/c12.js,ch/c13.js,ch/c14.js,ch/c15.js,ch/c16.js,ch/c17.js,ch/c99.js
FILES=$F OUT=out/ALL.pptx node build.js > out/ALL_build1.log 2>&1
FILES=$F OUT=out/ALL.pptx node build.js > out/ALL_build.log 2>&1
tail -1 out/ALL_build.log; grep -c "⚠" out/ALL_build.log
node check.js out/ALL_terms.json > out/ALL_check.log; tail -1 out/ALL_check.log
