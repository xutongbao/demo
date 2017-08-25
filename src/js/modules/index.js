X.define("modules.index", ["modules.common.global", "model.indexModel",  "modules.common.suspensionBox"], function (global, indexModel) {
    var view = X.view.newOne({
        el: $(".js-content"),
        url: X.config.index.tpl.index,
        res: X.config.index.res.index
    });

    var ctrl = X.controller.newOne({
        view: view
    });
    ctrl.rendering = function (callback) {
        var data = {};
        return view.render(data, function () {
            $(view.el.find('.js-flexslider1')).flexslider({
                animation: "slide",
                slideshow: false,
                animationLoop: false,
                itemWidth: 300,
                itemMargin: 50,
                manualControls: true,
                maxItems: 3
            });

            $(view.el.find('.js-flexslider2')).flexslider({
                animation: "slide",
                slideshow: false,
                animationLoop: false,
                itemWidth: 340,
                itemMargin: 5,
                manualControls: true,
                minItems: 3
            });
            callback();
        });

    };

    ctrl.load = function () {
        ctrl.rendering(function () {
            $(document).attr("title", $.i18n.prop("index_title"));
            indexModel.getIpInfo(function(resp) {
                var countryCode = (resp && resp.data.country) ? resp.data.country : "";
                countryCode = countryCode.toLowerCase();
                if (countryCode == 'undefined' || countryCode == '') {
                    localStorage.setItem('countryCode', 'cn');
                } else {
                    localStorage.setItem('countryCode', countryCode);
                }
            });
        });
    };
    ctrl.load();

    return ctrl;
});