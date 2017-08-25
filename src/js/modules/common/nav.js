X.define("modules.common.nav", [], function () {

    //初始化视图对象
    var view = X.view.newOne({
        el: $(".js-nav"),
        url: X.config.common.tpl.nav,
        res: X.config.common.res.nav
    });

    //初始化控制器
    var nav = X.controller.newOne({
        view: view
    });

    /*
     在此补充界面事件。
     登录，注册，采购商入口，供应商入口

     首页，招标信息，用户管理及搜索

     等等页面可以操作的部分。

     如果是单纯的链接，也可以直接写在界面中

     */

    var secondStyle = ["about"];

    nav.rendering = function (callback) {
        return view.render(function () {
            initChannel();
            callback();
        });
    };
    nav.load = function () {
        nav.rendering(function () {
            nav.loginRegist();
        });
    };   

    var initChannel = function () {
        view.el.find(".js-home").attr("href", X.config.common.link.home);
        view.el.find(".js-products").attr("href", X.config.common.link.sourceProducts);
        view.el.find(".js-buyingRequest").attr("href", X.config.common.link.buyingRequest);
        view.el.find(".js-aboutUs").attr("href", X.config.common.link.aboutUs);
        view.el.find(".js-blog").attr("href", X.config.common.link.blogIndex);
        view.el.find(".js-freeSource").attr("href", X.config.common.link.freeSource);

        //share()
        X.publish(X.CONSTANT.channel["navReady"]);

        nav.howItWorksControl();


        view.el.find(".js-step-service").attr("href", X.config.common.link.stepsOfService);
        view.el.find(".js-guarantee").attr("href", X.config.common.link.guarantee);
        view.el.find(".js-about-payment").attr("href", X.config.common.link.aboutPayment);

        nav.ifIe8(".howItWorksCon");
        nav.ifIe8(".sign_out");


        if(location.pathname == '/service/about-payment.html'){
            view.el.find('.ign_out').addClass('sign_out_deep');
        }

    };

    nav.ifIe8 = function (elem) {
        //如果是ie8，透明色则给一个颜色值
        if (navigator.userAgent.indexOf('MSIE 8.0') > -1) {
            view.el.find(elem).css({
                background: "#d1d1d1"
            })
        }
    }

    nav.howItWorksControl = function () {
        //控制howItWorks下拉菜单
        var howItWorks = view.el.find('.js-howItWorks');
        var howItWorksCon = view.el.find('.js-howItWorksCon');
        var timer;

        $(howItWorks, howItWorksCon).hover(function () {
            clearTimeout(timer);
            $(howItWorksCon).removeClass("none");
        }, function () {
            timer = setTimeout(function () {
                $(howItWorksCon).addClass("none");
            }, 200)
        });
    }

    nav.loginRegist = function () {
    };

    nav.loginSuccess = function (data) {
        var userSign = $('.user-sign', view.el),
            jsUserInfo = $('.js-user-info', view.el);
        var userUserHover = $('.js-user-hover', view.el);
        var userUsername = $('.js-user-info', view.el);
        var userSignOut = $('.user-sign-out', view.el);


        userSign.toggleClass('none');
        if (data.firstName.length > 11) {
            data.firstName = data.firstName.substr(0, 11) + '...';
        } else {
            data.firstName = data.firstName;
        }
        jsUserInfo.html(data.firstName);
        var timer = null;
        userUsername.hover(function () {
            userSignOut.css('visibility', 'visible');
        }, function () {
            //userSignOut.css('visibility', 'hidden');
        });
        userUserHover.hover(function () {
            userSignOut.css('visibility', 'visible');
        }, function () {
            timer = setTimeout(function () {
                userSignOut.css('visibility', 'hidden');
            }, 310)

        });
        userSignOut.hover(function () {
            clearTimeout(timer)
        });


    }

    nav.setActive = function (name) {
        nav.view.el.find(".js-nav").find("li[name='" + name + "']").addClass("curd");
        nav.view.el.find(".js-nav").find("li[name='" + name + "']").find("a").removeAttr('href');
        if (name === 'home' || name === 'products' || name === 'aboutUs' || name === 'blog' || name === 'howItWorks') {
            nav.view.el.find(".js-nav").find("li[name='" + name + "']").find("a").addClass('nav-active');
        }
        if (name === 'howItWorks') {
            nav.view.el.find(".js-nav").find("li[name='" + name + "']").addClass("active");
        }
    };

    //nav.goSearch()    
    nav.load();
    return nav;
});