var ts_localStorage = {};
ts_localStorage.cachePrefix = "tslsc_";
ts_localStorage.isSupported = function () {
  try {
    return "localStorage" in window && window["localStorage"] !== null;
  } catch (e) {
    return false;
  }
};
ts_localStorage.setLocalStorage = function (name, data) {
  if (!this.isSupported()) return false;
  localStorage.setItem(name, JSON.stringify(data));
};
ts_localStorage.getLocalStorage = function (name) {
  if (!this.isSupported()) return null;
  var val = localStorage.getItem(name);
  if (val === null) return null;
  return JSON.parse(val);
};
ts_localStorage.setLocalCache = function (name, value, ttl) {
  var data = {
    v: value,
    e: new Date().getTime() + ttl * 1000,
  };
  this.setLocalStorage(this.cachePrefix + name, data);
};
ts_localStorage.getLocalCache = function (name) {
  var data = this.getLocalStorage(ts_localStorage.cachePrefix + name);
  if (!data) return null;
  if ("e" in data == false || isNaN(data.e)) {
    this.removeLocalCache(name);
    return null;
  }
  if ("v" in data == false) {
    this.removeLocalCache(name);
    return null;
  }
  if (new Date().getTime() > data.e) {
    this.removeLocalCache(name);
    return null;
  }
  return data.v;
};
ts_localStorage.removeLocalCache = function (name) {
  localStorage.removeItem(this.cachePrefix + name);
};
ts_localStorage.removeAllCache = function () {
  for (var i in localStorage) {
    if (i.indexOf(this.cachePrefix) === 0) localStorage.removeItem(i);
  }
};

var ts_popular_widget = {
  ranges: ["monthly", "weekly", "alltime"],
  default: "weekly",
  range_selectors: {
    weekly: ".wpop.wpop-weekly",
    monthly: ".wpop.wpop-monthly",
    alltime: ".wpop.wpop-alltime",
  },
  update_selector: "#wpop-items",
  currentTime: null,
  lstimename: "ts_Sika ANIMEstream_cwpop",
  lswpopcont: "ts_Sika ANIMEstream_cnwpop",
};
ts_popular_widget.is_valid_range = function (range) {
  return this.ranges.indexOf(range) !== -1;
};
ts_popular_widget.run = function (time) {
  this.currentTime = time;
  this.updateWidget();
  this.show_items(this.default);
  this.attach_events();
};
ts_popular_widget.show_items = function (range) {
  if (!ts_popular_widget.is_valid_range(range)) return;
  jQuery("#sidebar .wpop").hide();
  var el = jQuery("#sidebar " + this.range_selectors[range]);
  jQuery("#sidebar .ts-wpop-nav-tabs li").removeClass("active");
  jQuery("#sidebar .ts-wpop-nav-tabs li a[data-range='" + range + "']")
    .closest("li")
    .addClass("active");
  el.show();
};
ts_popular_widget.getCurrent = function () {
  var current = jQuery(this.update_selector).html();
  current = current.replace(/[\n\r]/g, "").replace(/\s\s+/g, " ");
  return current;
};
ts_popular_widget.updateWidget = function () {
  var lastwpop = ts_localStorage.getLocalStorage(this.lstimename);
  if (!isNaN(lastwpop)) {
    if (lastwpop < this.currentTime) {
      ts_localStorage.setLocalStorage(this.lstimename, this.currentTime);
      ts_localStorage.setLocalStorage(this.lswpopcont, this.getCurrent());
      return;
    } else if (lastwpop > this.currentTime) {
      var lastwpopcontent = ts_localStorage.getLocalStorage(this.lswpopcont);
      if (!lastwpopcontent) return;
      jQuery(this.update_selector).html(lastwpopcontent);
      return;
    }
    return;
  }
  ts_localStorage.setLocalStorage(this.lstimename, this.currentTime);
  ts_localStorage.setLocalStorage(this.lswpopcont, this.getCurrent);
};
ts_popular_widget.attach_events = function () {
  jQuery(".ts-wpop-tab").on("click", function () {
    var range = jQuery(this).attr("data-range");
    if (!ts_popular_widget.is_valid_range(range)) return;
    ts_popular_widget.show_items(range);
  });
};
