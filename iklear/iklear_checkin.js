[MITM]
hostname = shop42867343.youzan.com

[Script]
iklear_checkin = type=cron,cronexp=0 18 * * *,wake-system=1,script-path=iklear_checkin.js
iklear_cookie = type=http-request,pattern=^https:\/\/shop42867343\.youzan\.com\/wscump\/checkin\/checkin\.json,script-path=iklear_cookie.js

const cookieName = 'IKlear微商城'
const signurlKey = 'senku_signurl_iklear'
const signheaderKey = 'senku_signheader_iklear'
const signbodyKey = 'senku_signbody_iklear'
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
    if (code == 0) {
      const times = result.data.times
      const points = result.data.prizes[0].points
      subTitle = `签到结果: ✅`
      detail = `获得${points}积分，连续签到${times}天`
    } else if (code == 160540409) {
      subTitle = `签到结果: ❌`
      detail = `你似乎已经签过到了...`
    } else if (code == 160540414) {
      subTitle = `签到结果: ❌`
      detail = `Cookie失效，请重新获取Cookie`
    } else {
      subTitle = `签到结果: ❌`
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