#!/usr/bin/env bash

set -ex

rsync -avz extensions/geolonia/gui/ src/lib/libraries/extensions/
rsync -avz extensions/geolonia/vm/ node_modules/scratch-vm/src/extension-support/
