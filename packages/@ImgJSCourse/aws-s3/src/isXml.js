
function removeMimeParams (mimeType) {
  return mimeType.replace(/;.*$/, '')
}

sXml (content, xhr) {
  const rawContentType = (xhr.headers ? xhr.headers['content-type'] : xhr.getResponseHeader('Content-Type'))

  if (typeof rawContentType === 'string') {
    const contentType = removeMimeParams(rawContentType).toLowerCase()
    if (contentType === 'application/xml' || contentType === 'text/xml') {
      return true
    }
    if (contentType === 'text/html' && /^<\?xml /.test(content)) {
      return true
    }
  }
  return false
}

export default isXml
