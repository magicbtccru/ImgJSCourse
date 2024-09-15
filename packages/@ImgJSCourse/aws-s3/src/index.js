import BasePlugin from '@uppy/core/lib/BasePlugin.js';
import AwsS3Multipart from '@uppy/aws-s3-multipart';
import { RateLimitedQueue } from '@uppy/utils/lib/RateLimitedQueue';
import { RequestClient } from '@uppy/companion-client';
import { filterNonFailedFiles, filterFilesToEmitUploadStarted } from '@uppy/utils/lib/fileFilters';

import packageJson from '../package.json';
import MiniXHRUpload from './MiniXHRUpload.js';
import isXml from './isXml.js';
import locale from './locale.js';
import { resolveUrl, getXmlVal, assertServerError, validateParameters, defaultGetResponseError, defaultGetResponseData } from './awsS3Utils.js';

export default class AwsS3 extends BasePlugin {
  static VERSION = packageJson.version;

  #client;
  #requests;
  #uploader;

  constructor(uppy, optts) {
    if (optts?.shouldUseMultipart != null) {
      return new AwsS3Multipart(uppy, optts);
    }

    super(uppy, optts);
    this.initializePlugin();
  }

  initializePlugin() {
    this.type = 'uploader';
    this.id = this.optts.id || 'AwsS3';
    this.title = 'AWS S3';
    this.defaultLocale = locale;
    this.optts = this.getOptions();

    this.validateoptts();

    this.#client = new RequestClient(this.uppy, this.optts);
    this.#requests = new RateLimitedQueue(this.optts.limit);

    this.i18nInit();
  }

  getOptions() {
    const defaultOptions = {
      timeout: 30 * 1000,
      limit: 0,
      allowedMetaFields: [],
      getUploadParameters: this.getUploadParameters.bind(this),
      shouldUseMultipart: false,
      companionHeaders: {},
    };

    return { ...defaultOptions, ...this.optts };
  }

  validateoptts() {
    if (this.optts.allowedMetaFields === undefined && 'metaFields' in this.optts) {
      throw new Error('The `metaFields` option has been renamed to `allowedMetaFields`.');
    }
  }

  getUploadParameters(file) {
    // Implementation...
  }

  #handleUpload = async (fileIDs) => {
    // Implementation...
  }

  #setCompanionHeaders = () => {
    // Implementation...
  }

  #getCompanionClientArgs = (file) => {
    // Implementation...
  }

  uploadFile(id, current, total) {
    // Implementation...
  }

  install() {
    // Implementation...
  }

  uninstall() {
    // Implementation...
  }
}

// Additional helper methods can be implemented here or imported from 'awsS3Utils.js'
