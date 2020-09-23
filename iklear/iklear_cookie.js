const cookieName = 'IKlear微商城'
const signurlKey = 'senku_signurl_iklear'
const signheaderKey = 'senku_signheader_iklear'
const signbodyKey = 'senku_signbody_iklear'
const senku = init()

const requrl = $request.url
if ($request && $request.method != 'OPTIONS') {
  const signurlVal = requrl
  const signheaderVal = JSON.stringify($request.headers)
//   const signbodyVal = $request.body
//   const cmd = JSON.parse($request.body).cmd
  // senku.log(`signurlVal:${signurlVal}`)
  // senku.log(`signheaderVal:${signheaderVal}`)
//   senku.log(`signbodyVal:${signbodyVal}`)
  if (signurlVal) senku.setdata(signurlVal, signurlKey)
  if (signheaderVal) senku.setdata(signheaderVal, signheaderKey)
  senku.msg(cookieName, `🎉获取Cookie: 成功`, ``)
  
}  

function init() {
  isSurge = () => {
    return undefined === this.$httpClient ? false : true
  }
  isQuanX = () => {
    return undefined === this.$task ? false : true
  }
  getdata = (key) => {
    if (isSurge()) return $persistentStore.read(key)
    if (isQuanX()) return $prefs.valueForKey(key)
  }
  setdata = (key, val) => {
    if (isSurge()) return $persistentStore.write(key, val)
    if (isQuanX()) return $prefs.setValueForKey(key, val)
  }
  msg = (title, subtitle, body) => {
    if (isSurge()) $notification.post(title, subtitle, body)
    if (isQuanX()) $notify(title, subtitle, body)
  }
  log = (message) => console.log(message)
  get = (url, cb) => {
    if (isSurge()) {
      $httpClient.get(url, cb)
    }
    if (isQuanX()) {
      url.method = 'GET'
      $task.fetch(url).then((resp) => cb(null, {}, resp.body))
    }
  }
  post = (url, cb) => {
    if (isSurge()) {
      $httpClient.post(url, cb)
    }
    if (isQuanX()) {
      url.method = 'POST'
      $task.fetch(url).then((resp) => cb(null, {}, resp.body))
    }
  }
  done = (value = {}) => {
    $done(value)
  }
  return { isSurge, isQuanX, msg, log, getdata, setdata, get, post, done }
}
senku.done()