
echo 'Setting up local dashblocks package as dependency for development'

cd node_modules
mkdir dashblocks_dev
cd dashblocks_dev

mklink /D dist ..\..\..\dashblocks\dist
mklink /D src ..\..\..\dashblocks\src



