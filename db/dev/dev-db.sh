#!/bin/bash

# Script for MacOS/Linux only
# Make sure you run this script in this directory so docker mounts work properly
# Docker installation is also a prerequisite.

docker pull postgres;
docker run -d -it --name postgres-sb -p 5432:5432 -e POSTGRES_USER=root -e POSTGRES_PASSWORD=pass -e POSTGRES_DB=smartbard -v $PWD/sql:/docker-entrypoint-initdb.d postgres
