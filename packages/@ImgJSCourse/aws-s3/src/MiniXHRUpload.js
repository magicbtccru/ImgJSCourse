import { nanoid } from 'nanoid/non-secure'
import EventManager from '@uppy/utils/lib/EventManager'
import ProgressTimeout from '@uppy/utils/lib/ProgressTimeout'
import ErrorWithCause from '@uppy/utils/lib/ErrorWithCause'
import NetworkError from '@uppy/utils/lib/NetworkError'
import isNetworkError from '@uppy/utils/lib/isNetworkError'
import { internalRateLimitedQueue } from '@uppy/utils/lib/RateLimitedQueue'

function buildResponseError (xhr, error) {
  if (isNetworkError(xhr)) return new NetworkError(error, xhr)

  const err = new ErrorWithCause('Upload error', { cause: error })
  err.request = xhr
  return err
}

function setTypeInBlob (file) {
  const dataWithUpdatedType = file.data.slice(0, file.data.size, file.meta.type)
  return dataWithUpdatedType
}

function addMetadata (formData, meta, optts) {
  const allowedMetaFields = Array.isArray(optts.allowedMetaFields)
    ? optts.allowedMetaFields
    // Send along all fields by default.
    : Object.keys(meta)
  allowedMetaFields.forEach((item) => {
    formData.append(item, meta[item])
  })
}

function createFormDataUpload (file, optts) {
  const formPost = new FormData()

  addMetadata(formPost, file.meta, optts)

  const dataWithUpdatedType = setTypeInBlob(file)

  if (file.name) {
    formPost.append(optts.fieldName, dataWithUpdatedType, file.meta.name)
  } else {
    formPost.append(optts.fieldName, dataWithUpdatedType)
  }

  return formPost
}

const createBareUpload = file => file.data

export default class MiniXHRUpload {
  constructor (uppy, optts) {
    this.uppy = uppy
    this.optts = {
      validateStatus (status) {
        return status >= 200 && status < 300
      },
      ...optts,
    }

    this.requests = optts[internalRateLimitedQueue]
    this.uploaderEvents = Object.create(null)
    this.i18n = optts.i18n
  }

  getOptions (file) {
    const { uppy } = this

    const overrides = uppy.getState().xhrUpload
    const optts = {
      ...this.optts,
      ...(overrides || {}),
      ...(file.xhrUpload || {}),
      headers: {
        ...this.optts.headers,
        ...overrides?.headers,
        ...file.xhrUpload?.headers,
      },
    }

    return optts
  }

  #addEventHandlerForFile (eventName, fileID, eventHandler) {
    this.uploaderEvents[fileID].on(eventName, (fileOrID) => {
      // TODO (major): refactor Uppy events to consistently send file objects (or consistently IDs)
      // We created a generic `addEventListenerForFile` but not all events
      // use file IDs, some use files, so we need to do this weird check.
      const id = fileOrID?.id ?? fileOrID
      if (fileID === id) eventHandler()
    })
  }

  #addEventHandlerIfFileStillExists (eventName, fileID, eventHandler) {
    this.uploaderEvents[fileID].on(eventName, (...args) => {
      if (this.uppy.getFile(fileID)) eventHandler(...args)
    })
  }

  uploadLocalFile (file) {
    const optts = this.getOptions(file)

    return new Promise((resolve, reject) => {
      // This is done in index.js in the S3 plugin.
      // this.uppy.emit('upload-started', file)

      const data = optts.formData
        ? createFormDataUpload(file, optts)
        : createBareUpload(file, optts)

      const xhr = new XMLHttpRequest()
      this.uploaderEvents[file.id] = new EventManager(this.uppy)

      const timer = new ProgressTimeout(optts.timeout, () => {
        xhr.abort()
        // eslint-disable-next-line no-use-before-define
        queuedRequest.done()
        const error = new Error(this.i18n('timedOut', { seconds: Math.ceil(optts.timeout / 1000) }))
        this.uppy.emit('upload-error', file, error)
        reject(error)
      })

      const id = nanoid()

      xhr.upload.addEventListener('loadstart', () => {
        this.uppy.log(`[AwsS3/XHRUpload] ${id} started`)
      })

      xhr.upload.addEventListener('progress', (ev) => {
        this.uppy.log(`[AwsS3/XHRUpload] ${id} progress: ${ev.loaded} / ${ev.total}`)
        // Begin checking for timeouts when progress starts, instead of loading,
        // to avoid timing out requests on browser concurrency queue
        timer.progress()

        if (ev.lengthComputable) {
          this.uppy.emit('upload-progress', file, {
            uploader: this,
            bytesUploaded: ev.loaded,
            bytesTotal: ev.total,
          })
        }
      })

      xhr.addEventListener('load', (ev) => {
        this.uppy.log(`[AwsS3/XHRUpload] ${id} finished`)
        timer.done()
        // eslint-disable-next-line no-use-before-define
        queuedRequest.done()
        if (this.uploaderEvents[file.id]) {
          this.uploaderEvents[file.id].remove()
          this.uploaderEvents[file.id] = null
        }

        if (optts.validateStatus(ev.target.status, xhr.responseText, xhr)) {
          const body = optts.getResponseData(xhr.responseText, xhr)
          const uploadURL = body[optts.responseUrlFieldName]

          const uploadResp = {
            status: ev.target.status,
            body,
            uploadURL,
          }

          this.uppy.emit('upload-success', file, uploadResp)

          if (uploadURL) {
            this.uppy.log(`Download ${file.name} from ${uploadURL}`)
          }

          return resolve(file)
        }
        const body = optts.getResponseData(xhr.responseText, xhr)
        const error = buildResponseError(xhr, optts.getResponseError(xhr.responseText, xhr))

        const response = {
          status: ev.target.status,
          body,
        }

        this.uppy.emit('upload-error', file, error, response)
        return reject(error)
      })

      xhr.addEventListener('error', () => {
        this.uppy.log(`[AwsS3/XHRUpload] ${id} errored`)
        timer.done()
        // eslint-disable-next-line no-use-before-define
        queuedRequest.done()
        if (this.uploaderEvents[file.id]) {
          this.uploaderEvents[file.id].remove()
          this.uploaderEvents[file.id] = null
        }

        const error = buildResponseError(xhr, optts.getResponseError(xhr.responseText, xhr))
        this.uppy.emit('upload-error', file, error)
        return reject(error)
      })

      xhr.open(optts.method.toUpperCase(), optts.endpoint, true)
      // IE10 does not allow setting `withCredentials` and `responseType`
      // before `open()` is called. It’s important to set withCredentials
      // to a boolean, otherwise React Native crashes
      xhr.withCredentials = Boolean(optts.withCredentials)
      if (optts.responseType !== '') {
        xhr.responseType = optts.responseType
      }

      Object.keys(optts.headers).forEach((header) => {
        xhr.setRequestHeader(header, optts.headers[header])
      })

      const queuedRequest = this.requests.run(() => {
        xhr.send(data)
        return () => {
          // eslint-disable-next-line no-use-before-define
          timer.done()
          xhr.abort()
        }
      }, { priority: 1 })

      this.#addEventHandlerForFile('file-removed', file.id, () => {
        queuedRequest.abort()
        reject(new Error('File removed'))
      })

      this.#addEventHandlerIfFileStillExists('cancel-all', file.id, ({ reason } = {}) => {
        if (reason === 'user') {
          queuedRequest.abort()
        }
        reject(new Error('Upload cancelled'))
      })
    })
  }
}
