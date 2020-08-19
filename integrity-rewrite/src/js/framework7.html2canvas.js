// import html2canvas from 'html2canvas';
var html2canvas = require('html2canvas');
Framework7.prototype.plugins.html2canvas = function (root, param) {
  if (!root) {
    return;
  }

  var self = this;
  var $$ = Dom7;
  var defaultOpt = {
    root: root,
    backgroundColor: null,// 设置背景透明
    logging: false, //日志开关，便于查看html2canvas的内部执行流程
    useCORS: true,// 【重要】开启跨域配置
    scale: 2
  }
  function init(callback) {
    console.log($$(defaultOpt.root))
    self.setting = $$.extend({}, defaultOpt, param || {});
    self.setting.y = $$(defaultOpt.root)[0].getBoundingClientRect().top + window.pageYOffset;
    html2canvas($$(root)[0], self.setting).then(function (canvas) {
      callback(canvas);
    });
  }

  // Handle app init hook
  // 在App完全初始化时，会被触发
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
    init: init,
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