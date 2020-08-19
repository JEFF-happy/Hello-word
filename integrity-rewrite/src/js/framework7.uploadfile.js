Framework7.prototype.plugins.uploadfile = function (app, params) {
  if (!params) {
    return;
  }
  var self = this;
  var defaultOpt = {
    baseUrl: window.baseUrl,
    url: '/service/rest/tk.File/collection/upload',
    root: null,
    list: '.ff7-uploadfilelist',
    ctrl: '.ff7-uploadfile-ctrl',
    name: 'file',
    col: 2,
    data: [],
    maxsize: 0, // 设置最大可上传文件大小
    type: [],
    limit: 2,
    inline: true,
    base64: false
  }
  var setting = $$.extend({}, defaultOpt, params);
  self.width = '';
  self.tips = '';
  self.list = null;
  self.input = null;
  self.file = null;
  function init() {
    if (!setting.root) {
      return;
    }
    var fileinput = '<input type="file" name="" id="">';
    if (setting.col) {
      self.width = 'calc(' + '(100% - ' + (setting.col - 1) * .2 + 'rem) / ' + setting.col + ')';
    }
    self.list = myApp.virtualList(setting.list, {
      items: [],
      height: 1,
      renderItem: function (index, item) {
        var url = item.url;
        var inline = 'playsinline webkit-playsinline';
        if (item.url.indexOf('http') < 0 && item.url.indexOf('base64') < 0) {
          url = setting.baseUrl + item.url
        }
        if (!setting.inline) {
          inline = ''
        }

        return '<li class="ff7-uploadfile-item">' +
          '<div class="ff7-uploadfile-close"></div>' +
          '<div class="ff7-uploadfile-pic">' +
          '<video preload="auto" src="' + url + '" controls ' + inline + '></video>' +
          '<div></li>'
      }
    });
    self.list.replaceAllItems(setting.data);
    changeWidth();
    $$('body').append(fileinput);
    self.input = $$('body').children().eq(-1);
    addEvent();
  }
  function changeWidth() {
    $$(setting.root).find('.ff7-uploadfile-item').attr('style', 'width:' + self.width);
    $$(setting.list).find('.ff7-uploadfile-item:nth-of-type(' + setting.col + 'n)').css('margin-right', 0);
    if (setting.limit > 0) {
      if (self.list.items.length >= setting.limit) {
        $$(setting.ctrl).parents('.ff7-uploadfile-item').hide();
      } else {
        $$(setting.ctrl).parents('.ff7-uploadfile-item').show();
      }
    }
  }
  function addEvent() {
    $$(setting.ctrl).on('click', function (e) {
      e.stopPropagation();
      $$(self.input).click();
    })
    $$(self.input).on('change', function (e) {
      self.file = $$(this)[0].files[0];
      if (!self.file) {
        return;
      }
      var fivarype = self.file.type;
      if (fivarype.indexOf('video') === -1) {
        app.alert('请勿上传非视频格式文件');
        return;
      }
      if (!verify()) {
        self.file = null;
        app.alert(self.tips);
        return;
      }
      app.showPreloader();
      getData(self.file);
    })
    $$('.ff7-uploadfilelist').on('click', '.ff7-uploadfile-item', function (e) {
      if ($$(e.target).hasClass('ff7-uploadfile-close')) {
        var idx = $$(this).index();
        app.confirm('确认删除？',
          function () {
            console.log(self.list)
            self.list.deleteItem(idx);
            changeWidth();
          }
        );
        return;
      }
    })
  }

  function verify() {
    var name = self.file.name;
    var size = (self.file.size / 1024).toFixed(2); // 转换为kb
    var suffix = name.substr(name.lastIndexOf('.'));
    var maxsize = setting.maxsize;
    var typeArr = setting.type;
    var isVerify = false;
    if (maxsize === 0 || size <= maxsize) {
      isVerify = true;
    } else {
      var unit = maxsize / 1024 >= 1 ? ((maxsize / 1024) + 'M') : (maxsize + 'KB');
      self.tips = '文件过大，请上传大小不超过' + unit + '的文件';
    }
    if (isVerify) {
      if (typeArr.length === 0) {
        isVerify = true;
      } else if (typeArr.indexOf(suffix) === -1) {
        isVerify = false;
        self.tips = '文件格式错误，请上传格式为' + typeArr.join('/') + '的文件';
      }
    } else {
      return isVerify;
    }
    return isVerify;
  }

  function getData(file) {
    var params = null;
    if (setting.base64) {
      params = {};
      var reader = new FileReader();
      reader.readAsDataURL(file)
      reader.onload = function (e) {
        params[setting.name] = e.target.result;
      }
    } else {
      var formData = new FormData();
      formData.append(setting.name, file);
      params = formData;
    }

    $$.ajax({
      url: setting.baseUrl + setting.url,
      type: "POST",
      data: params,
      processData: false,
      contentType: false,
      success: function (res) {
        var data = JSON.parse(res);
        self.file = null;
        app.hidePreloader();
        if (data.error === 1) {
          app.alert('error', '上传失败，' + data.message);
          return;
        }
        self.list.appendItem(data);
        changeWidth();
      },
      error: function (res) {
        app.hidePreloader();
        app.alert('上传失败，请重新上传!');
      }
    })
  }

  function setValue(data) {
    self.list.replaceAllItems(data);
  }
  function getValue() {
    return self.list.items;
  }
  function reset() {
    console.log(setting.data)
  }
  // // Handle app init hook
  // // 在App完全初始化时，会被触发
  // function handleAppInit(callback) {
  //   callback();
  // }
  // // 和"navbarInit"事件一样
  // function handleNavbarInit(navbar, pageData, callback) {
  //   callback(navbar, pageData);
  // }
  // // 在Framework7初始化页面组件和导航栏之后，会被触发
  // function handlePageInit(pageData, callback) {
  //   callback(pageData);
  // }
  // // 在Framework7将要向DOM插入新页面之前，会被触发
  // function handlePageBeforeInit(pageData, callback) {
  //   callback(pageData);
  // }
  // // 在每样东西都已经初始化，并且页面（和导航栏）做好动画准备的时候，会被触发
  // function handlePageBeforeAnimation(pageData, callback) {
  //   callback(pageData);
  // }
  // // 在页面（和导航栏）动画结束后，会被触发
  // function handlePageAfterAnimation(pageData, callback) {
  //   callback(pageData);
  // }
  // // 在Page要从DOM中被删除时，会被触发
  // function handlePageBeforeRemove(pageData, callback) {
  //   callback(pageData);
  // }
  // // 在用户通过调用myApp.addView来添加页面时，会被触发。它接收初始化的页面实例作为参数
  // function handleAddView(view, callback) {
  //   callback(view);
  // }
  // // 在页面加载进程的最开始，即它还没有被加入DOM的时候，会被触发
  // function handleLoadPage(view, url, content, callback) {
  //   callback(view, url, content);
  // }
  // // 在返回操作的最开始，会被触发
  // function handleGoBack(view, url, preloadOnly, callback) {
  //   callback(view, url, preloadOnly);
  // }
  // // 在滑动面板上滑动时，会被触发
  // function handleSwipePanelSetTransform(views, panel, percentage, callback) {
  //   callback(views, panel, percentage);
  // }

  // Return hooks
  return {
    // project: self,
    init: init,
    getValue: getValue,
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