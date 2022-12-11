#!/bin/sh 

rm -rf ./dist
mkdir ./dist


rm -rf ./build
mkdir ./build






cp -r ./application/* ./dist/



#!/bin/bash
#create default app zip
cd dist/
mv manifest.webmanifest ../
rm ../build/passport.zip
zip -r ../build/passport.zip ./*
mv  ../manifest.webmanifest ./





#create bHaCkers zip
rm ../build/passport-omnisd.zip
zip -r ../build/application.zip ./*
cd ../build/
mkdir -p passport-omnisd
touch ./passport-omnisd/metadata.json
echo '{ "version": 1, "manifestURL": "app://passport/manifest.webapp" }'  > ./passport-omnisd/metadata.json

cp application.zip passport-omnisd/
cd passport-omnisd/
zip -r ../passport-omnisd.zip ./*
rm -fr ../passport-omnisd
rm ../application.zip


#create KaiOS 3.0 app zip

cd ../../
cd dist/
mv manifest.webapp ../
zip -r ../build/passport-kaios3.zip ./*
mv  ../manifest.webapp ./
exit






