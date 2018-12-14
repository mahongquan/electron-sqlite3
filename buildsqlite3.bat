cd .\node_modules\sqlite3
npm install nan --save
npm run prepublishOnly
node-gyp configure --msvs_version=2015 --module_name=hello_nodegyp --module_path=./build/Release
node-gyp rebuild  --msvs_version=2015 --target=1.8.2 --arch=ia32 --target_platform=win32 --dist-url=https://atom.io/download/electron/ --module_name=hello_nodegyp --module_path=./build/Release