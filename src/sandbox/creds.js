let awsLite = require('@aws-lite/client')
module.exports = function loadCreds (params, callback) {
  let { inventory } = params
  awsLite({
    autoloadPlugins: false,
    profile: inventory.inv?.aws?.profile,
    region: 'us-west-1',
  })
    .then(aws => {
      params.creds = {
        // secretAccessKey + sessionToken are non-enumerable, so we can't just ref or spread
        accessKeyId: aws.credentials.accessKeyId,
        secretAccessKey: aws.credentials.secretAccessKey,
        sessionToken: aws.credentials.sessionToken,
      }
      callback()
    })
    .catch(() => {
      params.creds = {
        accessKeyId: 'arc_dummy_access_key',
        secretAccessKey: 'arc_dummy_secret_key',
      }
      callback()
    })
}
