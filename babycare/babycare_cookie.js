/*

[MITM]
hostname = shop43460925.youzan.com

**Surge**
[Script]
babycare_cookie = type=http-request,pattern=^https:\/\/shop42867343\.youzan\.com\/wscump\/checkin\/checkin\.json,script-path=https://raw.githubusercontent.com/LJJJia/script/master/babycare/babycare_cookie.js

babycare_checkin = type=cron,cronexp=0 0 * * *,wake-system=1,script-path=https://raw.githubusercontent.com/LJJJia/script/master/babycare/babycare_checkin.js

**QuanX**
[rewrite_local]
^https:\/\/shop42867343\.youzan\.com\/wscump\/checkin\/checkin\.json url script-request-header https://raw.githubusercontent.com/LJJJia/script/master/babycare/babycare_cookie.js

[task_local]
0 0 * * * https://raw.githubusercontent.com/LJJJia/script/master/babycare/babycare_checkin.js, tag=babycare_checkin, enabled=true

**Loon**
[Script]
http-request ^https:\/\/shop42867343\.youzan\.com\/wscump\/checkin\/checkin\.json script-path=https://raw.githubusercontent.com/LJJJia/script/master/babycare/babycare_cookie.js, timeout=10, tag=babycare_cookie

cron "0 0 * * *" script-path=https://raw.githubusercontent.com/LJJJia/script/master/babycare/babycare_checkin.js, tag=babycare_checkin

*/
const cookieName = 'babycare微商城'
const signurlKey = 'senku_signurl_babycare'
const signheaderKey = 'senku_signheader_babycare'
const signbodyKey = 'senku_signbody_babycare'
const senku = init()

const requrl = $request.url
if ($request && $request.method != 'OPTIONS') {
  const signurlVal = requrl
  const signheaderVal = JSON.stringify($request.headers)
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
