let { emitKeypressEvents } = require('readline')
let sandbox = require('../')

module.exports = function handleStdin (params) {
  let { rehydrate, update, watcher } = params

  // Listen for important keystrokes
  emitKeypressEvents(process.stdin)
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true)
  }

  // process.stdin.on('SIGINT', () => {
  //   console.log('Received SIGINT.');
  // });//COUREY

  process.stdin.on('keypress', function now (input, key) {
    update.warn(`KEYPRESS SEQUENCE: ${key.sequence}`)
    if (input === 'H') {
      rehydrate({
        timer: 'rehydrateAll',
        msg: 'Rehydrating all shared files...',
        force: true
      })
    }
    if (input === 'S') {
      rehydrate({
        timer: 'rehydrateShared',
        only: 'shared',
        msg: 'Rehydrating src/shared...',
        force: true
      })
    }
    if (input === 'V') {
      rehydrate({
        timer: 'rehydrateViews',
        only: 'views',
        msg: 'Rehydrating src/views...',
        force: true
      })
    }
    if (key.sequence === '\u0003' || key.sequence === '\u0004') {
      if (watcher) {
        watcher.close().then(end)
      }
      else end()
    }
    process.on('SIGINT', () => {
      console.log('Received SIGINT HERE. FINALLY.');
      exit(0)
    });//COUREY
  })

  function end () {
    update.warn(`ENDING FUNCTION`)
    sandbox.end(function (err) {
      if (err) {
        update.err(err)
        process.exit(1)
      }
      update.warn(`EXITING PROCESS`)
      process.exit(0)
    })
  }
}
