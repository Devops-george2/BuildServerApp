#!/bin/sh
URL="/Users/panzer/NCSU/DevOps/milestones/m1/BuildServer/JavaTest.git"
branch=${1:-master}
unset GIT_WORK_TREE
git clone $URL
#echo $branch
cd JavaTest
git checkout $branch
mvn clean install
cd ..
rm -rf JavaTest