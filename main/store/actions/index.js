// const uuidv4 = require('uuid/v4')
// const { URL } = require('url')
//
// const trayInitial = true

module.exports = {
  // setSync: (u, key, payload) => u(key, () => payload),
  selectNetwork: (u, net) => {
    const reset = { status: 'loading', connected: false, type: '', network: '' }
    u('main.connection', connection => {
      connection.network = net
      connection.local = Object.assign({}, connection.local, reset)
      connection.secondary = Object.assign({}, connection.secondary, reset)
      return connection
    })
  },
  selectSecondary: (u, value) => {
    u('main.connection', connection => {
      connection.secondary.settings[connection.network].current = value
      return connection
    })
  },
  setSecondaryCustom: (u, target) => {
    u('main.connection', connection => {
      connection.secondary.settings[connection.network].options.custom = target
      return connection
    })
  },
  toggleConnection: (u, node, on) => u('main.connection', node, 'on', (value) => on !== undefined ? on : !value),
  setLocal: (u, status) => u('main.connection.local', local => Object.assign({}, local, status)),
  setSecondary: (u, status) => u('main.connection.secondary', secondary => Object.assign({}, secondary, status)),
  setLaunch: (u, launch) => u('main.launch', _ => launch),
  toggleLaunch: u => u('main.launch', launch => !launch),
  toggleReveal: u => u('main.reveal', reveal => !reveal),
  clearPermissions: (u, address) => {
    u('main.addresses', address, address => {
      address.permissions = {}
      return address
    })
  },
  giveAccess: (u, req, access) => {
    u('main.addresses', req.address, address => {
      address = address || { permissions: {} }
      address.permissions[req.handlerId] = { handlerId: req.handlerId, origin: req.origin, provider: access }
      return address
    })
  },
  toggleAccess: (u, address, handlerId) => {
    u('main.addresses', address, address => {
      address.permissions[handlerId].provider = !address.permissions[handlerId].provider
      return address
    })
  },
  syncPath: (u, path, value) => {
    if (!path || path === '*' || path.startsWith('main') || path.startsWith('dock')) return // Don't allow updates to main state
    u(path, () => value)
  },
  dontRemind: (u, version) => {
    u('main.updater.dontRemind', dontRemind => {
      if (dontRemind.indexOf(version) === -1) dontRemind.push(version)
      return dontRemind
    })
  },
  updateAccount: (u, updatedAccount, add) => {
    u('main.accounts', updatedAccount.id, account => {
      if (account) return updatedAccount // Account exists
      if (add) return updatedAccount // Account is new and should be added
      return account
    })
  },
  removeAccount: (u, id) => {
    u('main.accounts', accounts => {
      delete accounts[id]
      return accounts
    })
  },
  removeSigner: (u, id) => {
    u('main.signers', signers => {
      delete signers[id]
      return signers
    })
  },
  updateSigner: (u, signer) => {
    if (!signer.id) return
    u('main.signers', signer.id, () => signer)
  },
  newSigner: (u, signer) => {
    u('main.signers', signers => {
      signers[signer.id] = signer
      return signers
    })
  },
  // Ethereum and IPFS clients
  setClientState: (u, client, state) => u(`main.clients.${client}.state`, () => state),
  updateClient: (u, client, key, value) => u(`main.clients.${client}.${key}`, () => value),
  toggleClient: (u, client, on) => u(`main.clients.${client}.on`, (value) => on !== undefined ? on : !value),
  resetClient: (u, client, on) => {
    const data = { on: false, state: 'off', latest: false, installed: false, version: null }
    u(`main.clients.${client}`, () => data)
  },
  moveOldAccountsToNewAddresses: (u, signer) => {
    const addressesToMove = {}
    u('main.accounts', accounts => {
      Object.keys(accounts).forEach(id => {
        if (id.startsWith('0x')) {
          addressesToMove[id] = accounts[id]
          delete accounts[id]
        }
      })
      return accounts
    })
    u('main.addresses', addresses => {
      Object.keys(addressesToMove).forEach(id => {
        addresses[id] = addressesToMove[id]
      })
      return addresses
    })
  },
  setLedgerDerivation: (u, value) => {
    u('main.ledger.derivation', () => value)
  },
  muteAlphaWarning: (u) => {
    u('main.mute.alphaWarning', () => true)
  },
  addDapp: (u, namehash, data, options) => {
    u(`main.dapp.details.${namehash}`, () => data)
    u('main.dapp.map', map => {
      if (options.docked && map.docked.length <= 10) {
        map.docked.push(namehash)
      } else {
        map.added.unshift(namehash)
      }
      return map
    })
  },
  setDappOpen: (u, ens, open) => {
    u('main.openDapps', (dapps) => {
      if (open) {
        if (dapps.indexOf(ens) === -1) dapps.push(ens)
      } else {
        dapps = dapps.filter(e => e !== ens)
      }
      return dapps
    })
  },
  removeDapp: (u, namehash) => {
    u('main.dapp.details', (dapps) => {
      dapps = { ...dapps }
      delete dapps[namehash]
      return dapps
    })
    u('main.dapp.map', map => {
      let index = map.added.indexOf(namehash)
      if (index !== -1) {
        map.added.splice(index, 1)
      } else {
        index = map.docked.indexOf(namehash)
        if (index !== -1) map.docked.splice(index, 1)
      }
      return map
    })
  },
  moveDapp: (u, fromArea, fromIndex, toArea, toIndex) => {
    u('main.dapp.map', map => {
      const hash = map[fromArea][fromIndex]
      map[fromArea].splice(fromIndex, 1)
      map[toArea].splice(toIndex, 0, hash)
      return map
    })
  },
  updateDapp: (u, namehash, data) => {
    // console.log('updateDapp', namehash, data)
    u(`main.dapp.details.${namehash}`, (oldData) => {
      return { ...oldData, ...data }
    })
  },
  setDappStorage: (u, hash, state) => {
    if (state) u(`main.dapp.storage.${hash}`, () => state)
  },
  expandDock: (u, expand) => {
    u('dock.expand', (s) => expand)
  },
  pin: (u) => {
    u('main.pin', pin => !pin)
  },
  saveAccount: (u, id) => {
    u('main.save.account', () => id)
  },
  setIPFS: (u, ipfs) => {
    u('main.ipfs', () => ipfs)
  }
  // TODO move all tray actions here..
}
