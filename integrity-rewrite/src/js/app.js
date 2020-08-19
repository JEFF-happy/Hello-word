require('framework7/dist/js/framework7');
require('./framework7.cascade');
require('./framework7.signature');
// require('./framework7.html2canvas');
// require('./framework7.uploadImg');
require('./framework7.uploadfile');

window.baseUrl = 'http://dev.lawschool.homolo.net';
// $.ajaxSetup({
//   error: function (jqXHR, textStatus, errorThrown) {
//     var statusCode = jqXHR.status
//     if (/^5[/d+]{2}$/.test(statusCode) || !statusCode) {
//       window.location.href = "/badgateway.html"
//     }
//   }
// });
var $$ = Dom7;
var myApp;
var framework = {
  init: function (e) {
    if (myApp) {
      return myApp;
    } else {
      return new Framework7(e);
    }
  }
};
var set = {
  init: function () {
    myApp = framework.init({
      pushState: true,
      animateNavBackIcon: true,
      modalButtonOk: '确定',
      modalButtonCancel: '取消',
      modalTitle: '温馨提示'
    });
    var mainView = myApp.addView('.view-main', {
      // Because we use fixed-through navbar we can enable dynamic navbar
      dynamicNavbar: true,
      animatePages: true,
      swipeBackPageAnimateOpacity: false
    });

    myApp.onPageInit('cascade', function (page) {
      var cascade = new myApp.plugins.cascade(myApp, {
        root: '#picker-dependent',
        code: 460300,
        textAlign: 'center',
        allStep: true,
        onChange: function (p, v, d) {
          console.log(v, '438594389050')
        }
        // start:2,
        // depth: 1
      })

      $$('.right').click(function () {
        cascade.setValue(500104);
        console.log(cascade);
      })
      $$('.left').click(function () {
        cascade.reset();
        console.log(cascade.getvalue());
      })
      $$('.clear').click(function () {
        cascade.clear();
        console.log(cascade.getvalue());
      })
    });

    myApp.onPageInit('signature', function (page) {
      var signature1 = new myApp.plugins.signature(myApp, {
        root: '#signature1',
        redo: '.redobox',
        undo: '.undobox',
        clear: '.clearbox'
      })
      var signature2 = new myApp.plugins.signature(myApp, {
        root: '#signature2',
        redo: '.redobox',
        undo: '.undobox',
        clear: '.clearbox'
      })
      $$('.getFile').on('click', function () {
        signature1.getFile(function (blob, base64) {
          console.log(blob, base64);
        }, 'image/jpg')
      })

    });

    myApp.onPageInit('html2canvas', function (page) {
      const html2canvas = new myApp.plugins.html2canvas('#html2canvas');

      $$('.getPic').on('click', function () {
        html2canvas.init(function (canvas) {
          console.log(canvas);
          $$('.page-content').append(canvas);
        });
      })
    });


    myApp.onPageInit('uploadimg', function (page) {
      var uploadImg = new myApp.plugins.uploadImg(myApp, {
        baseUrl: 'http://10.222.10.28:8082',
        url: '/aclms/service/rest/tk.File/collection/upload',
        root: '.card-content-inner',
        list: '.ff7-uploadimglist',
        name: 'file',
        data: [
          {
            error: 0,
            fileId: "3d312fe0bf464ff5b4da2c62c2520a7f",
            name: "8c19f1169c095617e557772f2048496e.jpg",
            size: 54090,
            success: true,
            url: "/aclms/service/rest/tk.File/3d312fe0bf464ff5b4da2c62c2520a7f/"
          },
          {
            error: 0,
            fileId: "b1271d10283745d599aede9315bf6236",
            name: "20140805182358_CckFB.thumb.700_0.png",
            size: 479831,
            success: true,
            url: "/aclms/service/rest/tk.File/b1271d10283745d599aede9315bf6236/"
          }
        ],
        col: 3,
        cutWidth: 100,
        // cropBoxResizable: false,
        // limit: 3,
        // maxsize: 1024,
        // type: ['.png'],
        // cut: false
      })

      uploadImg.init();

      $$('.getList').on('click', function () {
        const list = uploadImg.getValue();
        console.log(list);
      })
    })

    myApp.onPageInit('search', function (page) {
      $$(".my-btn").click(function () {
        $$(this).addClass('my-btn-active').siblings().removeClass('my-btn-active');
      });
      $$(".btn-reset").click(function () {
        $$(".my-btn").removeClass('my-btn-active');
      });
      $$('.content-item').click(function () {
        $$(this).addClass('content-active').siblings().removeClass('content-active');
      });
      $$('.sort-item').click(function () {
        $$(this).addClass('active').siblings().removeClass('active');
        var L = $$('.item-text-right').length;
        var index = $$(this).index();
        for (var i = 0; i < L; i++) {
          $$('.item-text-right').eq(i).hide();
          $$('.item-text-right').eq(index).show();
        }
      });
      $$('.text-right-icon').click(function () {
        $$(this).addClass('iconfont-active').siblings().removeClass('iconfont-active')
      });
      $$('.search-title').click(function () {
        $$('.search-select').removeClass('search-select-hide');
      });
      $$('.sele-item').click(function () {
        $$(this).addClass('sele-item-active').siblings().removeClass('sele-item-active')
        $$('.search-title').html($$(this).html() + '<i class="iconfont iconreturn-copy-copy"></i>')
        $$('.search-select').addClass('search-select-hide');
      });
      $$('.tabs-animated-wrap').click(function () {
        $$('.search-select').addClass('search-select-hide');
      });
      // $$('.sort-submit').click(function(){
      //   $$('.tab3').removeClass('tab-active');
      //   $$('.tab-home').addClass('tab-active');
      //   $$('.tab-link').removeClass('active')
      // });
      // $$('.btn-submit').click(function(){
      //   $$('.tab1').removeClass('tab-active');
      //   $$('.tab-home').addClass('tab-active');
      // });
      // $$('.bottom-btn').click(function(){
      //   $$('.tab2').removeClass('tab-active');
      //   $$('.tab-home').addClass('tab-active');
      // });
    });

    myApp.onPageInit('home', function (page) {
      $$('.search-title').click(function () {
        $$('.search-select').removeClass('search-select-hide');
      });
      $$('.sele-item').click(function () {
        $$(this).addClass('sele-item-active').siblings().removeClass('sele-item-active')
        $$('.search-title').html($$(this).html() + '<i class="iconfont iconreturn-copy-copy"></i>')
        $$('.search-select').addClass('search-select-hide');
      });
      
    });

    myApp.onPageInit('uploadfile', function (page) {
      var uploadFile = new myApp.plugins.uploadfile(myApp, {
        baseUrl: 'http://10.222.10.28:8082',
        url: '/aclms/service/rest/tk.File/collection/upload',
        root: '.card-content-inner',
        list: '.ff7-uploadfilelist',
        data: [
          {
            fileId: '637dfbe6b93642e6a448467937eeda24',
            url: 'http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4',
            name: '17961491_090735541000_2.jpg'
          }
        ],
        // col: 2,
        // limit: 7,
        // inline: false,
        // base64: true,
        // maxsize: 1024,
        // type: [],
      })

      uploadFile.init();

      $$('.getList').on('click', function () {
        const list = uploadFile.getValue();
        console.log(list);
      })
    })
  }
};

exports.set = set;
exports.framework = framework;
// exports.chart = chart;
