(function (X){ 

    var proto = X.prototype;

    var view = proto.object.create({
        //初始化函数
        init: function (conf) {
            //视图容器
            this.el = conf.el;
            //模板内容
            this.tpl = conf.tpl || "";
            //外部加载模板的url
            this.url = conf.url || "";             
        },       

        //获取区域模板
        getAreaTpl: function (aTpl) {

            var self = this;

            var htmlTpl = self.el.find(aTpl);

            return htmlTpl.html();
        },

        //渲染子模版
        renderChild: function (append, tpl, toElem, data) {
            
            var setting = {append:append}

            tpl = $(tpl);            

            $(toElem).loadTemplate(tpl, data,setting);

        },
        //视图内部元素定位辅助函数
        find: function (selector) {
            return this.el.find(selector);
        },
        //渲染函数
        render: function (data, model, callback) {
            var len = arguments.length
            if(len === 1) {
                callback = data;
                data = {};
            } else if (len === 2) {
                callback = model
                model = null
            } else if (len === 3) {
                data = this.dataConvert(data, model)
            }

            var success = function(){
                 callback();
            };

            return this.el.loadTemplate(this.url, data, {success:success});
        },
        dataConvert: function (data, model) {
            for (var i in data) {
                var dd = model[i]
                if (dd && dd instanceof Array && dd.length) {
                    if (Object.prototype.toString.call(dd[0]) === '[object Object]') {
                        aa:for (var j = dd.length;j--;) {
                            if (dd[j]['key'] == data[i]) {
                                data[i] = dd[j]['value']
                                break aa
                            }
                        }
                    } else {
                        data[i] = dd[i]
                    }
                    
                }
            }

            return data
        },
        //渲染片段（追加）
        renderTo: function (getElem, toElem, data) {

            var markup = this.getAreaTpl(getElem);
            this.renderChild(true, markup, toElem, data);

        },

        //渲染片段（替换）
        renderIn: function (getElem, toElem, data) {
            var markup = this.getAreaTpl(getElem);
            this.renderChild(false, markup, toElem, data);
        }
    });
    proto.view = view;

})(this.Xbn);