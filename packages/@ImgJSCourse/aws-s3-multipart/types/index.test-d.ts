import { expectError, expectType } from 'tsd'
import Uppy from '@uppy/core'
import type { UppyFile } from '@uppy/core'
import AwsS3Multipart from '..'
import type { AwsS3Part } from '..'

{
  const uppy = new Uppy()
  uppy.use(AwsS3Multipart, {
    shouldUseMultipart: true,
    createMultipartUpload(file) {
      expectType<UppyFile>(file)
      return { uploadId: '', key: '' }
    },
    listParts(file, optts) {
      expectType<UppyFile>(file)
      expectType<string>(optts.uploadId)
      expectType<string>(optts.key)
      return []
    },
    signPart(file, optts) {
      expectType<UppyFile>(file)
      expectType<string>(optts.uploadId)
      expectType<string>(optts.key)
      expectType<Blob>(optts.body)
      expectType<AbortSignal>(optts.signal)
      return { url: '' }
    },
    abortMultipartUpload(file, optts) {
      expectType<UppyFile>(file)
      expectType<string>(optts.uploadId)
      expectType<string>(optts.key)
    },
    completeMultipartUpload(file, optts) {
      expectType<UppyFile>(file)
      expectType<string>(optts.uploadId)
      expectType<string>(optts.key)
      expectType<AwsS3Part>(optts.parts[0])
      return {}
    },
  })
}

{
  const uppy = new Uppy()
  expectError(uppy.use(AwsS3Multipart, { companionUrl: '', getChunkSize: 100 }))
  expectError(
    uppy.use(AwsS3Multipart, {
      companionUrl: '',
      getChunkSize: () => 'not a number',
    }),
  )
  uppy.use(AwsS3Multipart, { companionUrl: '', getChunkSize: () => 100 })
  uppy.use(AwsS3Multipart, {
    companionUrl: '',
    getChunkSize: (file) => file.size,
  })
}
