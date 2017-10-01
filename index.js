'use strict';

let fs = require('fs');
let path = require('path');

let myDefaults = {
  // etcd object which provides .get(), .set() and .del() methods such as "node-etcd" module
  etcdObj: null,
  // etcd path prefix where challenges are stored
  etcdPathPrefix: '/le-challenge-etcd/',
  loopbackTimeout: 5 * 1000,
  debug: false
};

let Challenge = module.exports;

Challenge.create = function (options) {
  let results = {};

  Object.keys(Challenge).forEach(function (key) {
    results[key] = Challenge[key];
  });
  results.create = undefined;

  Object.keys(myDefaults).forEach(function (key) {
    if ('undefined' === typeof options[key]) {
      options[key] = myDefaults[key];
    }
  });
  
  if(!options.etcdObj) {
    throw new Error(`options.etcdObj has to be defined`);
  }
  
  results._options = options;

  results.getOptions = function () {
    return results._options;
  };

  return results;
};

//
// NOTE: the "args" here in `set()` are NOT accessible to `get()` and `remove()`
// They are provided so that you can store them in an implementation-specific way
// if you need access to them.
//
Challenge.set = function (args, domain, challengePath, keyAuthorization, done) {
  keyAuthorization = String(keyAuthorization);

  args.etcdObj.set(
    path.posix.join(args.etcdPathPrefix, challengePath),
    keyAuthorization,
    err => {
      done(err)
    }
  )
};


//
// NOTE: the "defaults" here are still merged and templated, just like "args" would be,
// but if you specifically need "args" you must retrieve them from some storage mechanism
// based on domain and key
//
Challenge.get = function (defaults, domain, key, done) {
  defaults.etcdObj.get(path.posix.join(defaults.etcdPathPrefix, key), done);
};

Challenge.remove = function (defaults, domain, key, done) {
  defaults.etcdObj.del(path.posix.join(defaults.etcdPathPrefix, key), done);
};

Challenge.loopback = function (defaults, domain, key, done) {
  let hostname = domain + (defaults.loopbackPort ? ':' + defaults.loopbackPort : '');
  let urlstr = 'http://' + hostname + '/.well-known/acme-challenge/' + key;

  require('http').get(urlstr, function (res) {
    if (200 !== res.statusCode) {
      done(new Error("local loopback failed with statusCode " + res.statusCode));
      return;
    }
    let chunks = [];
    res.on('data', function (chunk) {
      chunks.push(chunk);
    });
    res.on('end', function () {
      let str = Buffer.concat(chunks).toString('utf8').trim();
      done(null, str);
    });
  }).setTimeout(defaults.loopbackTimeout, function () {
    done(new Error("loopback timeout, could not reach server"));
  }).on('error', function (err) {
    done(err);
  });
};

Challenge.test = function (args, domain, challenge, keyAuthorization, done) {
  let me = this;
  let key = keyAuthorization || challenge;

  me.set(args, domain, challenge, key, function (err) {
    if (err) { done(err); return; }

    myDefaults.loopbackPort = args.loopbackPort;
    myDefaults.webrootPath = args.webrootPath;
    me.loopback(args, domain, challenge, function (err, _key) {
      if (err) { done(err); return; }

      if (key !== _key) {
        err = new Error("keyAuthorization [original] '" + key + "'"
          + " did not match [result] '" + _key + "'");
        return;
      }

      me.remove(myDefaults, domain, challenge, function (_err) {
        if (_err) { done(_err); return; }

        done(err);
      });
    });
  });
};
