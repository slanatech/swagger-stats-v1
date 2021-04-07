#!/bin/bash
echo 'Setting up local dashblocks package as dependency for development'

cd node_modules
mkdir dashblocks_dev
cd dashblocks_dev
ln -s ../../../dashblocks/dist .
ln -s ../../../dashblocks/src .




