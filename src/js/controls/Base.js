(function ($, X) {

    X.prototype.controls = X.prototype.controls || (function (X) {
            var controlDict = {};


            /**
             @method registerControl 注册控件到控件仓库
             @param ctrlType {string} 控件类型
             @param control {} 控件类
             @static 类静态方法
             */
            var registerControl = function (ctrlType, control) {
                if (!controlDict[ctrlType]) {
                    controlDict[ctrlType] = control;
                    return;
                }
                //console.log("已经存在此控件类型");
            };


            /**
             @method getControl 获取控件
             @param ctrlType {string} 控件类型
             @param elem {DomNode} Dom节点
             @param option {Object} 控件配置项
             @static 类静态方法
             */
            var getControl = function (ctrlType, elem, option) {

                if (controlDict.hasOwnProperty(ctrlType)) {
                    //console.log("获取控件"+ ctrlType);
                    return new controlDict[ctrlType](elem, option);
                }

                //console.log("没有相应的控件类型" + ctrlType);
                return null;
            };


            var widget = function (ctrlType, func) {
                if (!controlDict[ctrlType]) {
                    controlDict[ctrlType] = func(ctrlType);
                    return;
                }
                //console.log("已经存在此控件类型");
            };


            var extend = function (subCtrl, ctrlType) {
                if (controlDict[ctrlType]) {
                    subCtrl.prototype = X.prototype.createObject(controlDict[ctrlType].prototype);
                }
                //没有可继承的,则返回Object原型
                return Object.prototype;
            }

            var getControlClazz = function (ctrlType) {
                if (controlDict[ctrlType]) {
                    return controlDict[ctrlType];
                }
            }

            var getTemplate = function (item) {
                var ctrlClazz = getControlClazz(item["ctrlType"]);
                if (ctrlClazz) {
                    return ctrlClazz.getTemplate(item);
                }
                //console.log("没有相应的控件类型，不能获得控件模板");
                return "";
            };

            /**
             @method getDataSource 获取下拉框数据源
             @param refUrl {string} 服务地址
             @param refKey {string} 数据主键
             @param refValue {string} 数据要显示的名称
             @param callback {function} 回调方法
             @static 类静态方法
             */
            var getDataSource = function (refUrl, refKey, refValue, callback, type, postData) {
                if (dataSource[refUrl]) {
                    callback(dataSource[refUrl]);
                }
                else {
                    var optObj = {
                        url: refUrl,
                        callback: function (result) {
                            var dataArray = [], item;
                            if (result.statusCode == "2000000") {
                                for (var i = 0, il = result.data.length; i < il; i++) {
                                    item = result.data[i];
                                    dataArray.push({"key": item[refKey], "value": item[refValue]});
                                }

                                dataSource[refUrl] = dataArray;
                                callback(dataArray);
                            }

                        },
                        type: type || "GET",
                        data: postData || {}
                    };

                    X.prototype.loadRemoteData(optObj);
                }
            };

            var dataSource = {}


            return {
                widget: widget,
                registerControl: registerControl,
                getControl: getControl,
                getControlClazz: getControlClazz,
                extend: extend,
                getTemplate: getTemplate,
                getDataSource: getDataSource
            }


        }(X));


    var CS = X.prototype.controls;
    var CONTROL_TYPE_TAG = "data-control-type",
        PROPERTY_NAME_TAG = "data-property-name";


    CS.widget("BaseControl", function (controlType) {


        function BaseControl(elem, options) {
            this.elem = elem;
            this.options = options || {};
        }

        $.extend(BaseControl.prototype, X.prototype.event);


        BaseControl.prototype.controlType = "BaseControl";
        BaseControl.prototype.controlTypeTag = CONTROL_TYPE_TAG;
        BaseControl.prototype.propertyNameTag = PROPERTY_NAME_TAG;
        BaseControl.prototype.init = function () {
            // body...
        };


        BaseControl.prototype.getElement = function () {
            return this.elem;
        };
        BaseControl.prototype.getLabel = function () {
            return this.getElement().parent().prev();
        };
        BaseControl.prototype.getParentDiv = function () {
            return this.getElement().parent();
        };
        BaseControl.prototype.getControlType = function () {
            return this.controlType || this.getElement().attr(this.controlTypeTag);
        };
        BaseControl.prototype.getPropertyName = function () {
            return this.getElement().attr(this.propertyNameTag);
        };
        BaseControl.prototype.get = BaseControl.prototype.getAttribute = function (attr) {
            return this.getElement().attr(attr);
        };
        BaseControl.prototype.set = BaseControl.prototype.setAttribute = function (attr, val) {
            this.getElement().attr(attr, val);
        };
        BaseControl.prototype.getValue = function () {
            return this.getElement().val();
        };
        BaseControl.prototype.setValue = function (val) {
            this.getElement().val(val);
        };
        BaseControl.prototype.getReadOnly = function () {
            return this.getAttribute("readonly");
        };
        BaseControl.prototype.setReadOnly = function (readonly) {
            this.setAttribute("readonly", readonly);
        };
        BaseControl.prototype.getDisabled = function () {
            return this.getAttribute("disabled");
        };
        BaseControl.prototype.setDisabled = function (disabled) {
            this.setAttribute("disabled", disabled);
        };
        BaseControl.prototype.getVisible = function () {
            // return this.getAttribute("display")==="none";
        };
        BaseControl.prototype.setVisible = function (visible) {
            //this.setAttribute("display", visible ? "block" : "none");
        };
        BaseControl.prototype.getTitle = function () {
            return this.getAttribute("title");
        };
        BaseControl.prototype.setTitle = function (title) {
            this.setAttribute("title", title);
        };
        BaseControl.prototype.getText = function () {
            this.getAttribute("innerText");
        };
        BaseControl.prototype.setText = function (text) {
            this.setAttribute("innerText", text);
        };
        BaseControl.prototype.getHtml = function () {
            return this.getElement().html();
        };
        BaseControl.prototype.setHtml = function (html) {
            this.getElement().html(html);
        };
        BaseControl.prototype.setNullable = function (val) {
            var labelObj = this.getLabel();
            labelObj.toggleClass("mustinput", !val);
        };
        BaseControl.prototype.setNoinput = function (val) {
            var labelObj = this.getLabel();
            var divObj = this.getparentDiv();
            labelObj.toggleClass("mustinput-noinput", val);
            divObj.toggleClass("parentdiv-noinput", val);
        };


        BaseControl.prototype.setTips = function (val) {
            supportPlaceholder = 'placeholder' in document.createElement('input'); //检测浏览器是否兼容placeholder
            var self = this;
            if (!supportPlaceholder) {
                this.getElement().focus(function () {
                    if (self.getValue() == val)
                        self.setValue('');
                });
                this.getElement().blur(function () {
                    if (self.getValue() == '') {
                        self.setValue(val);
                    }
                });
            }
            else
                this.set("placeholder", val);
        };
        //获取控件的提示信息Tips
        BaseControl.prototype.getTips = function () {
            return this.get("placeholder");
        };
        //设置控件内文字的对齐方式
        BaseControl.prototype.setTextAlign = function (val) {
            if (val != '') {
                this.set("text-align", val)
            }
            else
                this.set("text-align", "left");
        };
        //获取控件内文字的对齐方式
        BaseControl.prototype.getTextAlign = function () {
            return this.get("text-align");
        };
        //设置焦点（val：true设置焦点/false不设置焦点）
        BaseControl.prototype.setFocus = function (val) {
            if (val)
                this.getElement().focus();
        };
        //设置tab键索引
        BaseControl.prototype.setTabIndex = function (index) {
            if (index >= 0)
                this.set("tabindex", index);
            else
                this.set("tabindex", "-1");
        };
        //获取控件的tab键索引
        BaseControl.prototype.getTabIndex = function () {
            return this.get("tabindex");
        };

        BaseControl.prototype.dispose = function () {
            //移除绑定事件等
        };

        //重置
        BaseControl.prototype.reset = function () {

        };
        //初始化控件
        BaseControl.prototype.init = function (options) {
            this.options = X.prototype.clone(options);
        };

        BaseControl.prototype.val = function () {
            if (arguments.length > 0) {
                this.setValue(arguments[0]);
            }
            else {
                return this.getValue();
            }
        };

        //获取某个配置值
        BaseControl.prototype.getData = function (option) {
            return this.options && this.options[option];
        };

        //设置某个配置值
        BaseControl.prototype.setData = function (option, value) {
            this.options && (this.options[option] = value);
            return this;
        }


        return BaseControl;
    });


    var ViewModel = function (elem, options) {
        var _options = {};
        var _controls = {};

        function vm(elem, options) {
            this.elem = elem;
            if (options) {
                for (var k in options) {
                    _options[k] = options[k];
                }
            }

        };

        vm.prototype.getOption = function (k) {
            return _options[k];
        };

        vm.prototype.getData = function () {
            // body...
            return this.collectData();
        };

        vm.prototype.setData = function (data) {
            // body...
            _options["data"] = data;
            if (_controls) {
                for (var k in _controls) {
                    result[k] = _controls[k].setValue();
                }
            }
        };

        vm.prototype.collectData = function () {
            var result = {};

            if (_controls) {
                for (var k in _controls) {
                    result[k] = _controls[k].getValue();
                }
            }
            //是否考虑做差异化的数据传输？
            return result;
        };

        vm.prototype.initControl = function () {
            var meta = this.getOption("meta") || {};
            var data = this.getOption("data") || {};
            if (this.elem) {
                var list = this.elem.find("[" + CONTROL_TYPE_TAG + "][" + PROPERTY_NAME_TAG + "]");
                var item, ctrlType, pName;
                list.each(function (index, element) {
                    item = $(this);
                    ctrlType = item.attr(CONTROL_TYPE_TAG);
                    pName = item.attr(PROPERTY_NAME_TAG);
                    if (!_controls[pName]) {
                        _controls[pName] = CS.getControl(ctrlType, item, meta[pName] || {});
                        if (data && data[pName]) {
                            _controls[pName].setValue(data[pName]);
                        }
                    }
                    else {
                        //console.log("已经存在的" + pName);
                    }
                });
            }
        };

        vm.prototype.getValue = function (name) {
            var data = {};
            data[name] = _controls[name].val();
            return data;
        };

        vm.prototype.setValue = function (name, value) {
            _controls[name].val(value);
            return this;
        };

        vm.prototype.getControl = function (name) {
            return _controls[name];
        };

        vm.prototype.getControls = function (name) {
            return _controls;
        };


        vm.prototype.setDisabled = function (disabled) {
            if (disabled == undefined) disabled = true;
            for (var k in _controls) {
                _controls[k].setDisabled(disabled);
            }
        };

        vm.prototype.reset = function () {
            for (var k in _controls) {
                _controls[k].reset();
            }
        }
        return new vm(elem, options);

    };


    X.prototype.controller.getViewModel = function (elem, options) {
        var vm = new ViewModel(elem, options);
        return vm;
    }


})(jQuery, this.Xbn);