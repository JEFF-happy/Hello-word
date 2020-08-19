var Cropper = require('cropperjs');
Framework7.prototype.plugins.uploadImg = function (app, params) {
  if (!params) {
    return;
  }
  var self = this;
  var defaultOpt = {
    baseUrl: window.baseUrl,
    url: '/service/rest/tk.File/collection/upload',
    root: null,
    list: '.ff7-uploadimglist',
    ctrl: '.ff7-uploadimg-ctrl',
    name: 'file',
    col: 4,
    data: [],
    maxsize: 0, // 设置最大可上传文件大小
    type: [], // 设置可上传图片类型
    cut: true, // 是否开启图片裁剪
    cutWidth: NaN, // 裁剪框初始宽度
    cutHeight: NaN, // 裁剪框初始高度
    aspectRatio: NaN, // 裁剪框比例
    cropBoxResizable: true, // 裁剪框是否任意拉伸
    pictitle: true, // 图片查看器是否显示标题
    pictheme: 'dark', // 图片查看器的主题
    limit: 0 // 最多可上传个数
  }
  var setting = $$.extend({}, defaultOpt, params);
  self.width = '';
  self.tips = '';
  self.list = null;
  self.input = null;
  self.popup = null;
  self.openPopUp = null;
  self.cropper = null;
  self.file = null;
  function init() {
    if (!setting.root) {
      return;
    }
    var fileinput = '<input type="file" name="" id="">';
    if (setting.col) {
      self.width = 'calc(' + '(100% - ' + (setting.col - 1) * .2 + 'rem) / ' + setting.col + ')';
    }
    self.popup = '<div class="popup popup-uploadimg">' +
      '<div class="uploadimg-pic"></div>' +
      '<div class="uploadimg-ctrl buttons-row">' +
      '<a href="#" class="button button-big uploadimg-rotate">旋转</a>' +
      '<a href="#" class="button button-big uploadimg-reset">还原</a>' +
      '<a href="#" class="button button-big uploadimg-crop">裁剪</a>' +
      '<a href="#" class="button button-big close-popup">取消</a>' +
      '</div></div>';
    self.list = myApp.virtualList(setting.list, {
      items: [],
      height: 1,
      renderItem: function (index, item) {
        return '<li class="ff7-uploadimg-item">' +
          '<div class="ff7-uploadimg-close"></div>' +
          '<div class="ff7-uploadimg-pic" style="background-image:url(' + setting.baseUrl + item.url + ')">' +
          '<div></li>'
      }
    });
    self.list.replaceAllItems(setting.data);
    changeWidth();
    $$('body').append(fileinput);
    self.input = $$('body').children().eq(-1);
    addEvent();
  }
  var changeWidth = function () {
    $$(setting.root).find('.ff7-uploadimg-item').attr('style', 'width:' + self.width);
    $$(setting.list).find('.ff7-uploadimg-item:nth-of-type(' + setting.col + 'n)').css('margin-right', 0);
    if (setting.limit > 0) {
      if (self.list.items.length >= setting.limit) {
        $$(setting.ctrl).parents('.ff7-uploadimg-item').hide();
      } else {
        $$(setting.ctrl).parents('.ff7-uploadimg-item').show();
      }
    }
  }
  var addEvent = function () {
    $$(setting.ctrl).on('click', function (e) {
      e.stopPropagation();
      $$(self.input).click();
    })
    $$(self.input).on('change', function (e) {
      var reader = new FileReader();
      self.file = $$(this)[0].files[0];
      if (!self.file) {
        return;
      }
      var filetype = self.file.type;
      if (filetype.indexOf('image') === -1) {
        app.alert('请勿上传非图片格式文件');
        return;
      }
      if (!verify()) {
        self.file = null;
        app.alert(self.tips);
        return;
      }
      if (setting.cut && filetype.indexOf('gif') === -1) {
        reader.readAsDataURL(self.file);
        reader.onload = function (e) {
          var data = e.target.result;
          var image = new Image();
          self.imageFile = image;
          image.src = data;
          image.onload = function () {
            self.openPopUp = app.popup(self.popup);
            $$('body').children('.popup-uploadimg').find('.uploadimg-pic').append(image);
            self.cropper = new Cropper(image, {
              aspectRatio: setting.aspectRatio,
              viewMode: 1,
              dragMode: 'move',
              center: true,
              autoCropArea: 1,
              minCropBoxWidth: 50,
              minCropBoxHeight: 50,
              cropBoxResizable: setting.cropBoxResizable,
              ready() {
                if (setting.cutWidth || setting.cutHeight) {
                  var info = self.cropper.getCropBoxData();
                  var cutW = setting.cutWidth || setting.cutHeight;
                  var cutH = setting.cutHeight || setting.cutWidth;
                  self.cropper.setCropBoxData(
                    {
                      top: info.top + (info.height - cutH) / 2,
                      left: info.left + (info.width - cutW) / 2,
                      width: setting.cutWidth || setting.cutHeight,
                      height: setting.cutHeight || setting.cutWidth
                    }
                  )
                }
                self.cropper.crop();
              },
            });
          };
          image.onerror = function () {
            self.getTips('error', '您上传的图片已损坏，请检查后重新上传!');
          }
        };
      } else {
        app.showPreloader();
        getData(self.file);
      }
    })
    $$('body').on('click', function (e) {
      var target = $$(e.target);
      var isCtrl = target.parent().hasClass('uploadimg-ctrl');
      if (!isCtrl) {
        return;
      }
      var isRotate = target.hasClass('uploadimg-rotate');
      var isReset = target.hasClass('uploadimg-reset');
      var isCrop = target.hasClass('uploadimg-crop');
      if (isRotate) {
        self.cropper.rotate(90);
      }
      if (isReset) {
        self.cropper.reset();
      }
      if (isCrop) {
        var cas = self.cropper.getCroppedCanvas();
        cas.toBlob(function (blob) {
          var file = new File([blob], self.file.name, { type: 'contentType', lastModified: Date.now() });
          app.showPreloader();
          getData(file);
          app.closeModal(self.openPopUp);
        })
      }
    })

    $$('.ff7-uploadimglist').on('click', '.ff7-uploadimg-item', function (e) {
      var popList = self.list.items;
      var index = $$(this).index();
      if ($$(e.target).hasClass('ff7-uploadimg-close')) {
        var idx = $$(this).index();
        app.confirm('确认删除？',
          function () {
            self.list.deleteItem(idx);
            changeWidth();
          }
        );
        return;
      }
      popList.forEach(function (element) {
        if (element && element.url.indexOf(setting.baseUrl) < 0) {
          element.url = setting.baseUrl + element.url;
        }
        if (setting.pictitle) {
          element.caption = element.name;
        }
      });
      var myPhotoBrowser = app.photoBrowser({
        zoom: 400,
        photos: popList,
        loop: true,
        theme: setting.pictheme,
        backLinkText: '返回'
      });
      myPhotoBrowser.open(index);
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
    var formData = new FormData();
    formData.append(setting.name, file);
    $$.ajax({
      url: setting.baseUrl + setting.url,
      type: "POST",
      data: formData,
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
  function getValue() {
    return self.list.items;
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
  // function handlePageInit(pageData) {
  //   return pageData
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