
const cookieName = '联通话费提醒'
const signheaderKey = 'senku_signheader_10010'
const senku = init()
const signurlVal = 'https://m.client.10010.com/mobileService/home/queryUserInfoSeven.htm'
const signheaderVal = senku.getdata(signheaderKey)

sign()

function sign() {
  const url = { url: signurlVal, headers: JSON.parse(signheaderVal)}
  senku.get(url, (error, response, data) => {
    const result = JSON.parse(data)
    const code = result.code
    const traffic = result.data.dataList[0];
    const money = result.data.dataList[1];
    let time = ``
    let subTitle = ``
    let detail = ``
    if (code == "Y") {
      if (parseFloat(money.number) < 10){
      time = `请查收${result.flush_date_time} 的话费使用情况报告～`
      subTitle = `【话费建议】💰该充话费了💰`
      detail = `【话费情况】${money.remainTitle} ${money.number} ${money.unit}
【流量情况】${traffic.remainTitle} ${traffic.number} ${traffic.unit}，${traffic.usedTitle}`
    } esle if (parseFloat(money.number) > 10){
      time = `请查收${result.flush_date_time} 的话费使用情况报告～`
      subTitle = `【话费建议】💰土豪不需要查话费💰`
      detail = `【话费情况】${money.remainTitle} ${money.number} ${money.unit}
【流量情况】${traffic.remainTitle} ${traffic.number} ${traffic.unit}，${traffic.usedTitle}`
    } else {
      time = `请查收${result.flush_date_time} 的话费使用情况报告～`
      subTitle = `【话费建议】🎉还能可劲造几天🎉`
      detail = `【话费情况】${money.remainTitle} ${money.number} ${money.unit}
【流量情况】${traffic.remainTitle} ${traffic.number} ${traffic.unit}，${traffic.usedTitle}`
      }   
    } else {
        subTitle = `❌话费流量Token失效啦，快去更新！❌`
        detail = `进入查看日志详情`
        console.log(data)
      }
    senku.msg(time, subTitle, detail)
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
