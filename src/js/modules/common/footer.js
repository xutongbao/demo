X.define("modules.common.footer",function () {

    //初始化视图对象
    var view = X.view.newOne({
        el: $(".js-footer"),
        url: X.config.common.tpl.footer,
        res : X.config.common.res.footer
    });

    //初始化控制器
    var footer = X.controller.newOne({
        view: view
    });

    /*
        在此补充界面事件。
        

    */

    //添加百度统计
    footer.baiduStatistics = function () {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?a7f72eafd157745565d6f62e0f25a20b";
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(hm, s);
    };

    //添加网站图标
    footer.addIcons = function () {
        var hm = $('<link rel="shortcut icon" type="image/x-icon" href="/favicon.ico">');
        var s = document.getElementsByTagName("head")[0];
        s.appendChild(hm.get(0));
    };

    footer.rendering = function () {
        return view.render(function () {   
           

            initFooterLink();
        });
    };

    footer.load = function (argument) {
        footer.rendering();
        //footer.baiduStatistics();
        footer.addIcons();
    };
    
    var initFooterLink = function () {        
        //初始化链接地址
        view.el.find(".js-aboutUs").attr("href",X.config.common.link.aboutUs);
        view.el.find(".js-contactUs").attr("href",X.config.common.link.contactUs);
        view.el.find(".js-termOfUse").attr("href",X.config.common.link.termOfUse);
        
        view.el.find(".js-privacyPollicy").attr("href",X.config.common.link.privacyPollicy);
        view.el.find(".js-siteMap").attr("href",X.config.common.link.siteMap);
    };

    footer.load();

    return footer;
});