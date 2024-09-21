import { Uppy, type UppyFile } from '@uppy/core'
import { expectType, expectError } from 'tsd'
import type { AwsS3Part } from '@uppy/aws-s3-multipart'
import AwsS3 from '..'

{
  const uppy = new Uppy()
  uppy.use(AwsS3, {
    getUploadParameters(file) {
      expectType<UppyFile>(file)
      return { method: 'POST', url: '' }
    },
  })
  expectError(
    uppy.use(AwsS3, {
      shouldUseMultipart: false,
      getUploadParameters(file) {
        expectType<UppyFile>(file)
        return { method: 'POST', url: '' }
      },
    }),
  )
  uppy.use(AwsS3, {
    shouldUseMultipart: false,
    getUploadParameters(file) {
      expectType<UppyFile>(file)
      return { method: 'POST', url: '', fields: {} }
    },
  })
  expectError(
    uppy.use(AwsS3, {
      shouldUseMultipart: true,
      getUploadParameters(file) {
        expectType<UppyFile>(file)
        return { method: 'PUT', url: '' }
      },
    }),
  )
  uppy.use(AwsS3, {
    shouldUseMultipart: () => Math.random() > 0.5,
    getUploadParameters(file) {
      expectType<UppyFile>(file)
      return { method: 'PUT', url: '' }
    },
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
