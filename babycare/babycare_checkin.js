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
const signurlVal = senku.getdata(signurlKey)
const signheaderVal = senku.getdata(signheaderKey)

sign()

function sign() {
  const url = { url: signurlVal, headers: JSON.parse(signheaderVal)}
  senku.get(url, (error, response, data) => {
    const result = JSON.parse(data)
    const code = result.code
    const msg = result.msg
    let subTitle = ``
    let detail = ``
    if (code == 0 && msg == "ok") {
      const times = result.data.times
      const points = result.data.prizes[0].points
      subTitle = `签到结果: ✅`
      detail = `获得${points}积分，连续签到${times}天`
    } else if (code == 160540409 || msg == "你今天已经签到过啦") {
      subTitle = `签到结果: ✅`
      detail = `你似乎已经签过到了...`
    } else if (code == 160540414) {
      subTitle = `签到结果: ❌`
      detail = `Cookie失效，请重新获取Cookie`
    } else {
      subTitle = `签到结果: ❌`
      detail = `请查看日志提交反馈`
      console.log(data)
    }
    senku.msg(cookieName, subTitle, detail)
    senku.done()
  })
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
      $task.fetch(url).then((resp) => cb(null, resp, resp.body))
    }
  }
  post = (url, cb) => {
    if (isSurge()) {
      $httpClient.post(url, cb)
    }
    if (isQuanX()) {
      url.method = 'POST'
      $task.fetch(url).then((resp) => cb(null, resp, resp.body))
    }
  }
  done = (value = {}) => {
    $done(value)
  }
  return { isSurge, isQuanX, msg, log, getdata, setdata, get, post, done }
}
