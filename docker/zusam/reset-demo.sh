#!/bin/sh

echo "Reset demo"
rm -rf "$1/data/*"
sleep 3
mkdir -p "$1/data"
chmod 755 "$1/data"
sleep 3
tar -xf "$1/demo.tar.gz" -C "$1"
sleep 3
chown -R "$2:$3" "$1"
