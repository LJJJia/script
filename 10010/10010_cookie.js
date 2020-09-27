/*
@LJJJia 借鉴 @GideonSenku、@chavyleung 两位大佬的脚本

使用方法：
添加 MITM,添加 SCRIPT,自行修改所需task执行时间，示例为每日早8点和晚7点提醒。

获取cookie方法：
打开联通“手机营业厅”APP，即可获取cookie

配置：

[MITM]
hostname = *.10010.com

**Surge**
[Script]
10010余额提醒cookie = type=http-request, pattern=^http\:\/\/m\.client\.10010\.com\/mobileService\/home\/queryUserInfoSeven\.htm, script-path=https://raw.githubusercontent.com/LJJJia/script/master/10010/10010_cookie.js
10010余额提醒 = type=cron,cronexp="0 8,19 * * *",wake-system=1,script-path=https://raw.githubusercontent.com/LJJJia/script/master/10010/10010.js,script-update-interval=0

**QuanX**
[rewrite_local]
^http\:\/\/m\.client\.10010\.com\/mobileService\/home\/queryUserInfoSeven\.htm url script-request-header https://raw.githubusercontent.com/LJJJia/script/master/10010/10010_cookie.js
[task_local]
0 8,19 * * * https://raw.githubusercontent.com/LJJJia/script/master/10010/10010.js, tag=10010余额提醒, enabled=true
**Loon**
[Script]
http-request ^http\:\/\/m\.client\.10010\.com\/mobileService\/home\/queryUserInfoSeven\.htm script-path=https://raw.githubusercontent.com/LJJJia/script/master/10010/10010_cookie.js, timeout=10, tag=10010余额提醒cookie
cron "0 8,19 * * *" script-path=https://raw.githubusercontent.com/LJJJia/script/master/10010/10010.js, tag=10010余额提醒
*/

const cookieName = '联通话费提醒'
const signurlKey = 'senku_signurl_10010'
const signheaderKey = 'senku_signheader_10010'
const signbodyKey = 'senku_signbody_10010'
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