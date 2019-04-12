# How to make the library available to the public:

1 - Make sure all tests pass (tb -cbt)

2 - Review git changelog to decide the new version value based on the GIT changes: minor, major, ...
    
3 - Update the version number on the project root package.json file
    Make sure we have increased the version number regarding the previously published one

4 - Commit and push all the new version changes to repository.

5 - Make sure the git tag is updated with the new project version we want to publish
    (First in remote GIT repo and then in our Local by performing a fetch)

6 - Generate a release build executing tests (tb -cr)

7 - Copy the package.json file from the project root to target/turbotesting-node-x.x.x/dist/ts

8 - Add the readme.md file if exists to the target/turbotesting-node-x.x.x/dist/ts folder

9 - Open a command line inside target/turbotesting-node-x.x.x/dist/ts folder and run:
    npm publish
   
10 - Verify that new version appears for the package at www.npmjs.com/~edertone
