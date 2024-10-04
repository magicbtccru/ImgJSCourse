'use strict'

import RequestClient from './RequestClient.js'

const getName = (id) => {
  return id.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
}

export default class SearchProvider extends RequestClient {
  constructor (uppy, optts) {
    super(uppy, optts)
    this.provider = optts.provider
    this.id = this.provider
    this.name = this.optts.name || getName(this.id)
    this.pluginId = this.optts.pluginId
  }

  fileUrl (id) {
    return `${this.hostname}/search/${this.id}/get/${id}`
  }

  search (text, queries) {
    return this.get(`search/${this.id}/list?q=${encodeURIComponent(text)}${queries ? `&${queries}` : ''}`)
  }
}
