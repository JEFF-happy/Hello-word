Framework7.prototype.plugins.cascade = function (app, params) {
  if (!params) {
    return;
  }
  var self = this;
  var $$ = Dom7;
  var defaultOpt = {
    baseUrl: window.baseUrl,
    url: '/service/rest/tk.Zone/086/tree',
    root: '',
    code: null,
    allStep: false,
    textAlign: 'center',
    toolbar: true,
    start: 0,  // 0 省 1 市 2 区 
    depth: 3,  // 1 2 3
    onOpen: function () { },
    onChange: function () { },
    onClose: function () { }
  }
  var setting = $$.extend({}, defaultOpt, params); // 配置信息
  var colWidth = 100 / (setting.depth) + '%';
  var minRange = setting.start;
  var maxRange = setting.start + setting.depth;
  // ...plugin code here ...
  var pickerDependent;
  var provinceSelect = null;
  var proCode = null;
  var cityCode = null;
  var areaCode = null;
  function setCode (curCode) {
    proArr = getCodeArr(allData, '086');
    cityArr = getCodeArr(allData, '110000');
    areaArr = getCodeArr(allData, '110100');
    if (curCode) {
      var _code = curCode + '';
      var pro = _code.substr(0, 2);
      var city = _code.substr(2, 2) === '00' ? '01' : _code.substr(2, 2);
      var reg = _code.substr(4, 2) === '00' ? '01' : _code.substr(4, 2);
      proCode = pro + '0000';
      cityCode = pro + city + '00';
      areaCode = pro + city + reg;
      cityArr = getCodeArr(allData, proCode);
      areaArr = getCodeArr(allData, cityCode) || getCodeArr(allData, cityArr.values[0]);
    }
  };
  function setValue (value) {
    if (value) {
      setCode(value);
      var val = [proCode, cityCode, areaCode];
      pickerDependent.open();
      pickerDependent.setValue(val.slice(minRange, maxRange));
      pickerDependent.close();
    }
  };
  function clear () {
    pickerDependent.setValue(['110000', '110100', '110101'])
    pickerDependent.input.val('');
  };
  function setReset () {
    if (!setting.code) {
      clear();
    } else {
      setValue(setting.code);
    }
  };
  function getValue () {
    if (!pickerDependent.input.val()) {
      return pickerDependent.input.val();
    } else if (pickerDependent.value) {
      return pickerDependent.value[2];
    }
  };
  var allData = new Map();
  var proArr = {
    values: [],
    displayValues: []
  };
  var cityArr = {};
  var areaArr = {};
  function dealData (data, index) {
    var info = {
      values: [],
      displayValues: []
    };
    data.children.forEach(function (item) {
      if (item.code === '310000') {
        allData.set(item.code, {
          values: ['310100'],
          displayValues: [item.name]
        })
      } else if (item.code === '710000' || item.code === '810000' || item.code === '820000') {
        var suffix = item.code.substr(0, 2)
        allData.set(item.code, {
          values: [item.code],
          displayValues: [item.name]
        })
        allData.set(suffix + '0100', {
          values: [suffix + '0101'],
          displayValues: [item.name]
        })
      } else if (item.code.substr(4, 2) === '00' && item.leaf) {
        allData.set(item.code, {
          values: [item.code],
          displayValues: [item.name]
        })
      }
      info.values.push(item.code);
      info.displayValues.push(item.name);
      if (!item.leaf) {
        dealData(item, index)
      }
    })
    if (data.code === '310000') {
      allData.set('310100', info)
    } else {
      allData.set(data.code, info)
    }
  }
  function getCodeArr (data, code) {
    return data.get(code)
  }
  function getData (callback) {
    var url = setting.baseUrl + setting.url;
    $$.get(url, function (data) {
      dealData(JSON.parse(data), 0);
      console.log(allData)
      callback();
    }, function (err) {
      app.alert('网络错误，请重试')
      set.reset()
    })
  };
  getData(function () {
    setCode(setting.code);
    var proCol = {
      values: proArr.values,
      displayValues: proArr.displayValues,
      textAlign: setting.textAlign,
      width: colWidth,
      onChange: function (picker, province) {
        if (picker.cols[1] && picker.cols[1].replaceValues) {
          provinceSelect = province;
          cityArr = getCodeArr(allData, provinceSelect);
          areaArr = getCodeArr(allData, cityArr.values[0]);
          picker.cols[1].replaceValues(cityArr.values, cityArr.displayValues);
          if (picker.cols[2] && picker.cols[2].replaceValues) {
            picker.cols[2].replaceValues(areaArr.values, areaArr.displayValues);
          }
        }
      }
    }
    var cityCol = {
      values: cityArr.values,
      displayValues: cityArr.displayValues,
      textAlign: setting.textAlign,
      width: colWidth,
      onChange: function (picker, city) {
        var index = this.container.index();
        var next = index + 1;
        if (picker.cols[next] && picker.cols[next].replaceValues) {
          areaArr = getCodeArr(allData, city);
          picker.cols[next].replaceValues(areaArr.values, areaArr.displayValues);
        }
      }
    }
    var areaCol = {
      values: areaArr.values,
      displayValues: areaArr.displayValues,
      textAlign: setting.textAlign,
      width: colWidth,
      onChange: function (picker, area) { }
    }
    var setInput = function (p, values, displayValues) {
      var valStr = '';
      if (['710000', '810000', '820000'].indexOf(values[0]) > -1) {
        valStr = displayValues[0];
      } else if (values[2] === values[1]) {
        valStr = displayValues[0] + '/' + displayValues[1]
      } else {
        valStr = setting.allStep ? displayValues.join('/') : displayValues[setting.depth - 1];
      }
      return valStr;
    }
    var colArr = [proCol, cityCol, areaCol];
    var pickCol = colArr.slice(minRange, maxRange);
    pickerDependent = app.picker({
      input: setting.root,
      cols: pickCol,
      toolbar: setting.toolbar,
      toolbarTemplate: setting.toolbarTemplate,
      formatValue: setInput,
      onChange: function (picker, value, displayValues) {
        setting.onChange(value, displayValues);
      },
      onOpen: setting.onOpen,
      onClose: function () {
        if (!pickerDependent.input.val()) {
          pickerDependent.input.val(setInput(pickerDependent, pickerDependent.value, pickerDependent.displayValue))
        }
        setting.onClose()
      }
    });
    if (setting.code) {
      setValue(setting.code)
    }
  });
  // // Handle app init hook
  // // 在App完全初始化时，会被触发
  // function handleAppInit() {
  //   console.log('appInit');
  // }
  // // 和"navbarInit"事件一样
  // function handleNavbarInit(navbar, pageData) {
  //   console.log('navbarInit', navbar, pageData);
  // }
  // // 在Framework7初始化页面组件和导航栏之后，会被触发
  // function handlePageInit(pageData) {
  //   console.log('pageInit', pageData);
  // }
  // // 在Framework7将要向DOM插入新页面之前，会被触发
  // function handlePageBeforeInit(pageData) {
  //   console.log('pageBeforeInit', pageData);
  //   // init();
  // }
  // // 在每样东西都已经初始化，并且页面（和导航栏）做好动画准备的时候，会被触发
  // function handlePageBeforeAnimation(pageData) {
  //   console.log('pageBeforeAnimation', pageData);
  // }
  // // 在页面（和导航栏）动画结束后，会被触发
  // function handlePageAfterAnimation(pageData) {
  //   console.log('pageAfterAnimation', pageData);
  // }
  // // 在Page要从DOM中被删除时，会被触发
  // function handlePageBeforeRemove(pageData) {
  //   console.log('pageBeforeRemove', pageData);
  // }
  // // 在用户通过调用myApp.addView来添加页面时，会被触发。它接收初始化的页面实例作为参数
  // function handleAddView(view) {
  //   console.log('addView', view);
  // }
  // // 在页面加载进程的最开始，即它还没有被加入DOM的时候，会被触发
  // function handleLoadPage(view, url, content) {
  //   console.log('loadPage', view, url, content);
  // }
  // // 在返回操作的最开始，会被触发
  // function handleGoBack(view, url, preloadOnly) {
  //   console.log('goBack', view, url, preloadOnly);
  // }
  // // 在滑动面板上滑动时，会被触发
  // function handleSwipePanelSetTransform(views, panel, percentage) {
  //   console.log('swipePanelSetTransform', views, panel, percentage);
  // }


  // Return hooks
  return {
    // project: self,
    clear: clear,
    reset: setReset,
    setValue: setValue,
    getvalue: getValue,
    // hooks: {
    //   appInit: handleAppInit,
    //   navbarInit: handleNavbarInit,
    //   pageInit: handlePageInit,
    //   pageBeforeInit: handlePageBeforeInit,
    //   pageBeforeAnimation: handlePageBeforeAnimation,
    //   pageAfterAnimation: handlePageAfterAnimation,
    //   pageBeforeRemove: handlePageBeforeRemove,
    //   addView: handleAddView,
    //   loadPage: handleLoadPage,
    //   goBack: handleGoBack,
    //   swipePanelSetTransform: handleSwipePanelSetTransform

    // }
  };
};   