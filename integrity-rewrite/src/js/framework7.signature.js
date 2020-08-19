Framework7.prototype.plugins.signature = function (app, params) {
  if (!params) {
    return;
  }
  var self = this;
  var $$ = Dom7;
  var defaultOpt = {
    root: '',
    canvas: null,
    redo: null,
    undo: null,
    clear: null,
    // export: null,
    color: '#000',
    lineWidth: 5,
    width: null,
    height: null,
    lineCap: 'round',
    lineJoin: 'round'
  }
  var setting = $$.extend({}, defaultOpt, params); // 配置信息
  self.offsetTop = 0;
  self.offsetLeft = 0;
  self.mousedown = false;
  self.step = -1;
  self.history = [];
  function init() {
    if (!setting.width) {
      setting.width = $$(setting.root).width();
    }
    if (!setting.height) {
      setting.height = $$(setting.root).height();
    }
    initCanvas();
    getCtrl();
    addEvent();
  };
  function initCanvas() {
    var idnum = 'signature' + new Date().getTime();
    var canvas = $$('<canvas id="' + idnum + '"></canvas>');
    if (!setting.canvas) {
      if ($$(setting.root).find('canvas').length > 0) {
        setting.canvas = $$(setting.root).find('canvas');
      } else {
        $$(setting.root).append(canvas);
        setting.canvas = $$('#' + idnum);
      }
    }
    self.cas = setting.canvas[0];
    self.cas.width = setting.width;
    self.cas.height = setting.height;
    self.offsetTop = $$(setting.root)[0].offsetTop + self.cas.offsetTop;
    self.offsetLeft = $$(setting.root)[0].offsetLeft + self.cas.offsetLeft;
    self.ctx = self.cas.getContext('2d');
  }
  function getCtrl() {
    if (setting.redo) {
      setting.redo = $$(setting.root).find(setting.redo);
      setting.redo.hide();
    }
    if (setting.undo) {
      setting.undo = $$(setting.root).find(setting.undo);
      setting.undo.hide();
    }
    if (!setting.clear) {
      $$(setting.root).append('<button class="clear" type="button">清除</button>');
      setting.clear = $$(setting.root).find('.clear');
    } else {
      setting.clear = $$(setting.root).find(setting.clear);
    }
    // if (!setting.export) {
    //   $$(setting.root).append('<button class="export" type="button">导出</button>');
    //   setting.export = $$(setting.root).find('.export');
    // } else {
    //   setting.export = $$(setting.export);
    // }
  }
  function addEvent() {
    setting.canvas.on('touchstart mousedown', function (e) {
      self.mousedown = true;
      if (self.step < self.history.length - 1) {
        self.history.length = self.step + 1;
      }
      self.ctx.beginPath();
      if (e.clientX) {
        self.ctx.moveTo(e.clientX - self.offsetLeft, e.clientY - self.offsetTop + $$(window)[0].screenTop);
      } else {
        self.ctx.moveTo(e.targetTouches[0].clientX - self.offsetLeft, e.targetTouches[0].clientY - self.offsetTop + $$(window)[0].screenTop);
      }
    })
    setting.canvas.on('touchend touchcancel mouseup', function (e) {
      if (self.mousedown) {
        self.mousedown = false;
        self.step++;
      }
      if (self.step > -1 && setting.undo) {
        setting.undo.show();
      }
      self.history.push(self.cas.toDataURL());
    })
    setting.canvas.on('touchmove mousemove', function (e) {
      e.preventDefault();
      if (!self.mousedown) {
        return
      }
      self.ctx.strokeStyle = setting.color;
      self.ctx.lineWidth = setting.lineWidth;
      self.ctx.lineCap = setting.lineCap;
      self.ctx.lineJoin = setting.lineJoin;
      if (e.clientX) {
        self.ctx.lineTo(e.clientX - self.offsetLeft, e.clientY - self.offsetTop + $$(window)[0].screenTop);
      } else {
        self.ctx.lineTo(e.targetTouches[0].clientX - self.offsetLeft, e.targetTouches[0].clientY - self.offsetTop + $$(window)[0].screenTop);
      }
      self.ctx.stroke();
    })
    setting.clear.on('click', function (e) {
      e.stopPropagation();
      self.history = [];
      self.step = -1;
      self.ctx.clearRect(0, 0, self.cas.width, self.cas.height);
      if (setting.redo) {
        setting.redo.hide();
      }
      if (setting.undo) {
        setting.undo.hide();
      }
    })
    // setting.export.on('click', function () {
    //   self.cas.toBlob(function (blob) {
    //     // if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    //     //   window.navigator.msSaveOrOpenBlob(blob);
    //     // } else {
    //     //   var a = document.createElement("a");
    //     //   document.body.appendChild(a);
    //     //   a.setAttribute('download', '');
    //     //   a.href = 
    //     //   a.click();
    //     //   a.remove();
    //     // }
    //     window.location.href = window.URL.createObjectURL(blob);
    //   });
    // })
    if (setting.undo && setting.redo) {
      setting.redo.on('click', function (e) {
        e.stopPropagation();
        self.step++;
        var images = new Image();
        images.src = self.history[self.step];
        images.onload = function () {
          self.ctx.drawImage(images, 0, 0);
        };
        setting.undo.show();
        if (self.step > self.history.length - 2) {
          $$(this).hide();
        }
      })
      setting.undo.on('click', function (e) {
        e.stopPropagation();
        self.step--;
        self.ctx.clearRect(0, 0, self.cas.width, self.cas.height);
        if (self.step < 0) {
          $$(this).hide();
          return;
        }
        var images = new Image();
        images.src = self.history[self.step];
        images.onload = function () {
          self.ctx.drawImage(images, 0, 0);
        };
        setting.redo.show();
      })
    }
  }

  function getFile(callback, type) {
    var image = self.cas.toDataURL(type || 'image/png');
    self.cas.toBlob(function (blob) {
      callback(blob, image);
    });
  }

  init();
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
    getFile: getFile,
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