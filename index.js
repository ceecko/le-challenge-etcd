const myDefaults = {
  // etcd3 object
  etcdObj: null,
  // etcd path prefix where challenges are stored
  etcdPathPrefix: 'le-challenge-etcd/',
};

module.exports = cfg => {
  const options = {...myDefaults, ...cfg}

  if(!options.etcdObj) {
    throw new Error(`options.etcdObj has to be defined`)
  }

  return {
    init: async () => {},
    get: async opts => {
      const value = await options.etcdObj.get(`${options.etcdPathPrefix}${opts.challenge.token}`)
      return {keyAuthorization: value}
    },
    set: opts => options.etcdObj.put(`${options.etcdPathPrefix}${opts.challenge.token}`).value(opts.challenge.keyAuthorization),
    remove: opts => options.etcdObj.delete().key(`${options.etcdPathPrefix}${opts.challenge.token}`),
  }
}

