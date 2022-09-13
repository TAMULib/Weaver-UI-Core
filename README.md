[![Build Status](https://travis-ci.org/TAMULib/Weaver-UI-Core.svg?branch=2.x)](https://travis-ci.org/TAMULib/Weaver-UI-Core)
[![Coverage Status](https://coveralls.io/repos/github/TAMULib/Weaver-UI-Core/badge.svg?branch=2.x)](https://coveralls.io/github/TAMULib/Weaver-UI-Core?branch=2.x)

# TAMU AngularJS Core Module

<a href="http://tamulib.github.io/Angular-Framework/docs/index.html">TAMU UI Core ngDocs</a>

# Dependencies

- [Node 16](https://nodejs.org/en/) or greater
- npm 8 or greater

> [Downloading and installing Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

# Fun with Docker

```
docker-compose up
```

When needing to develop on Weaver-UI-Core. Increment version in package.json and run following commands.

```
docker-compose build publish
docker-compose run publish
```
> This will rebuild publishing image and publish to registry container.

# Known Limitations

## Docker Volumes Under Linux

Docker Volumes are created within the Container using the USER_ID specified in the Dockerfile.
The host system running the Docker must have a matching USER_ID or access denied errors will occur.
Change the USER_ID argument to match the USER_ID of the user running the container to avoid this problem.
Example:
```
# id -u
1000

# docker-compose build --build-arg "USER_ID=$(id -u)"
```
The directory on the host that represents the Docker Volume may be created and owned as root on the host system.
When this happens just perform a `sudo chown` command similar to this:
```
# sudo chown -R username:groupname .verdaccio
```

Problems may still occur if the given user ID is not available on either system.
