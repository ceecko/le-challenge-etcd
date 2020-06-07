const path = require('path');

const myDefaults = {
  // etcd object which provides .get(), .set() and .del() methods such as "node-etcd" module
  etcdObj: null,
  // etcd path prefix where challenges are stored
  etcdPathPrefix: '/le-challenge-etcd/',
};

module.exports = cfg => {
  const options = {...myDefaults, ...cfg}

  if(!options.etcdObj) {
    throw new Error(`options.etcdObj has to be defined`)
  }

  return {
    init: async () => {},
  
    get: opts => {
      return new Promise((resolve, reject) => {
        options.etcdObj.get(
          path.posix.join(options.etcdPathPrefix, opts.challenge.token), 
          (err, data) => {
            if(err) {
              reject(err)
              return
            }

            resolve({keyAuthorization: data.node.value})
          }
        )
      })
    },
  
    set: opts => {
      return new Promise((resolve, reject) => {
        options.etcdObj.set(
          path.posix.join(options.etcdPathPrefix, opts.challenge.token), 
          opts.challenge.keyAuthorization,
          err => {
            if(err) {
              reject(err)
              return
            }

            resolve()
          }
        )
      })
    },
  
    remove: opts => {
      return new Promise((resolve, reject) => {
        options.etcdObj.del(
          path.posix.join(options.etcdPathPrefix, opts.challenge.token), 
          err => {
            if(err) {
              reject(err)
              return
            }

            resolve()
          }
        )
      })
    }
  }
}

