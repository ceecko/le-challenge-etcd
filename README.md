[![npm Badge](https://nodei.co/npm/le-challenge-etcd.png?downloads=true)](http://npmjs.org/package/le-challenge-etcd)

# le-challenge-etcd

An etcd-based strategy for [node-greenlock](https://git.daplie.com/Daplie/node-greenlock) for setting, retrieving, and clearing ACME challenges issued by the ACME server.

This module saves ACME challenge in etcd as specified by `etcdPathPrefix`
and removes it once the challenge has either completed or failed.

* Safe to use with node cluster
* Safe to use with ephemeral services (EvenNode, Heroku, etc.)

Install
-------

```bash
npm install --save le-challenge-etcd
```

Usage
-----

```javascript
let 
  Etcd = require('node-etcd'),
  etcd = new Etcd('localhost');

let leChallenge = require('le-challenge-etcd').create({
  etcdObj: etcd,
  etcdPathPrefix: '/letsencrypt/www/:hostname/'  // defaults to "/le-challenge-etcd/"
});

let LE = require('letsencrypt');

LE.create({
  server: LE.stagingServerUrl,   // Change to LE.productionServerUrl in production
  challenge: leChallenge
});
```

NOTE: If you request a certificate with 6 domains listed, it will require 6 individual challenges.

Exposed Methods
---------------

For ACME Challenge:

* `set(opts, domain, key, val, done)`
* `get(defaults, domain, key, done)`
* `remove(defaults, domain, key, done)`

For node-letsencrypt internals:

* `getOptions()` returns the internal defaults merged with the user-supplied options
* `loopback(defaults, domain, key, value, done)` test, by external means, that the ACME server's challenge server will succeed
