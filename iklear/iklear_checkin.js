/*
iklear是美国显示器清洁品牌，Apple Store官方在使用的清洁产品，脚本可签到iklear官方微商城获取积分，兑换iklear清洁产品。目前不知未购买过iklear产品的用户是否可以登录商城签到领积分，如有测试结果还望反馈一下，感谢。
@LJJJia 根据 @GideonSenku 大佬的教程，通过修改 @chavyleung 大佬的签到脚本而成，本意自用，放出来各位有需求的使用，感谢各位大佬的mode和教程。

使用方法：
添加 MITM,添加 SCRIPT,自行修改所需task执行时间。

获取cookie方法：
浏览器打开iklear官方微商城h5，链接：

https://shop42867343.m.youzan.com/v2/feature/koy4ThfGd6?st=1&is_share=1&from_uuid=631f330d-80c2-626f-173f-f4855e50ee12&sf=wx_sm&share_cmpt=native_wechat

点击我的订单 => 右上角“签到” => 签到，提示 “🎉获取Cookie: 成功” 即可使用checkin脚本自动签到。


[MITM]
hostname = shop42867343.youzan.com

**Surge**
[Script]
iklear_cookie = type=http-request,pattern=^https:\/\/shop42867343\.youzan\.com\/wscump\/checkin\/checkin\.json,script-path=https://raw.githubusercontent.com/LJJJia/script/master/iklear/iklear_cookie.js

iklear_checkin = type=cron,cronexp=0 0 * * *,wake-system=1,script-path=https://raw.githubusercontent.com/LJJJia/script/master/iklear/iklear_checkin.js

**QuanX**
[rewrite_local]
^https:\/\/shop42867343\.youzan\.com\/wscump\/checkin\/checkin\.json url script-request-header https://raw.githubusercontent.com/LJJJia/script/master/iklear/iklear_cookie.js

[task_local]
0 0 * * * https://raw.githubusercontent.com/LJJJia/script/master/iklear/iklear_checkin.js, tag=iklear_checkin, enabled=true

**Loon**
[Script]
http-request ^https:\/\/shop42867343\.youzan\.com\/wscump\/checkin\/checkin\.json script-path=https://raw.githubusercontent.com/LJJJia/script/master/iklear/iklear_cookie.js, timeout=10, tag=iklear_cookie

cron "0 0 * * *" script-path=https://raw.githubusercontent.com/LJJJia/script/master/iklear/iklear_checkin.js, tag=iklear_checkin

*/
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
