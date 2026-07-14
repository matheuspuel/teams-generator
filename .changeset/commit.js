module.exports = {
  getVersionMessage: (info, _options) => {
    const version = info.releases[0].newVersion
    if (!version) throw new Error('version not found')
    return `v${version}`
  },
}
