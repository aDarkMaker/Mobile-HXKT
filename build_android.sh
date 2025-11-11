#!/bin/bash

echo "Building changes in android..."

bun run build

bunx cap sync android

echo "Build done!"

echo "Test Now ? (y/n)"
read -r test
test=${test:-y}

if [ "$test" = "y" ]; then
    bunx cap run android
else
    echo "Done!"
fi