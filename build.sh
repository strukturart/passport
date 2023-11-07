#!/bin/sh 


rm -rf ./build
mkdir ./build




#!/bin/bash

# Create default app zip
cd application/
rm ../build/passport.zip
rm ../build/passport-kaios3.zip
zip -r ../build/passport.zip ./*

mv manifest.webapp ../
zip -r ../build/passport-kaios3.zip ./*
mv ../manifest.webapp ./

# Create bHaCkers zip
rm ../build/passport-omnisd.zip
zip -r ../build/application.zip ./*
cd ../build/
mkdir -p passport-omnisd
touch ./passport-omnisd/metadata.json
echo '{ "version": 1, "manifestURL": "app://passport/manifest.webapp" }' > ./passport-omnisd/metadata.json

cp application.zip passport-omnisd/
cd passport-omnisd/
zip -r ../passport-omnisd.zip ./*
rm -fr ../passport-omnisd
cd ../
rm ./application.zip
exit;





