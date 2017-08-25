 
(function (X){ 

    var proto = X.prototype;


    var controller = proto.object.create({
        //初始化函数
        init: function (conf) {
            //视图对象
            this.view = conf.view;
            //数据模型
            this.model = conf.model;
            //dom事件注册数组
            this.events = [];
        },

        load : function () {
            // body...
        },

        dispose : function () {
            // body...
        },



        //注册dom事件
        addEvent: function (eName, selector, method, context) {

            //初始化回调函数上下文对象
            var eContext = this;
            if (context && X.isPlainObject(context)) {
                //设置上下文对象
                eContext = context;
            }

            //绑定dom事件
            this.view.el.off(eName, selector).on(eName, selector, function (e) {
                var context = $.extend(eContext, {
                    that: this
                });
                eContext[method].call(context,e);
            });

            //记录dom注册事件到注册数组
            this.events.push({
                eName: eName,
                selector: selector,
                method: method,
                context: eContext
            });

            return this;
        }
    });
    proto.controller = controller;

})(this.Xbn);