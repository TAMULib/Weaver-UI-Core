[![Build Status](https://travis-ci.org/TAMULib/Weaver-UI-Core.svg?branch=2.x)](https://travis-ci.org/TAMULib/Weaver-UI-Core)
[![Coverage Status](https://coveralls.io/repos/github/TAMULib/Weaver-UI-Core/badge.svg?branch=2.x)](https://coveralls.io/github/TAMULib/Weaver-UI-Core?branch=2.x)

# TAMU AngularJS Core Module

<a href="http://tamulib.github.io/Angular-Framework/docs/index.html">TAMU UI Core ngDocs</a>

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
