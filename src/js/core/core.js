//采用即时函数实现的框架核心支撑部分
//Xbn()....
(function (Obj) {
    //版本信息, 该版本信息代表当前的默认版本
    //框架允许多版本共存, 默认返回当前版本对应的实例对象)
    var version = "1.0",
            //合法标记
            //, 可以通过该标记辨认对象实例是否来自于该框架对象
            mark = "X",
            //顶级命名空间对象, 在这里代表传递进来的参数对象
            //, 在浏览器下, 则为window对象
            topObj = Obj,
            //核心库命名空间对象, 如果顶级命名空间对象下面已经存在该库对象
            //, 则认为已经实例化过(已存在)
            Xbn = topObj.Xbn,
            //版本相关实例对象数组, 该框架核心库对象可以多版本共存
            //, 根据版本信息进行多版本库对象的存储
            //, 以达到返回每个版本对应的库对象实例的目的
            VERSIONS = {},
            //模块包实例对象数组, 用来存储框架内定义的所有模块对象
            //, 用户获取特定模块对象时, 就是从该列表里获得
            MODULES = {},
            //调试选项, debug参数为0时, 则默认只输出异常信息,
            //隐藏框架追踪信息及开发调试信息
            //, debug参数为1时, 则输出框架跟踪调试信息及异常信息
            //, debug参数为2时, 则输出开发调试信息及异常信息
            //, debug参数为3时, 则输出所有调试信息, 包括异常信息
            opt = {
                debug: 2
            },
    //调试输出函数, 框架内用该函数取代默认的console.log
    //日志输出函数来输出调试信息及异常信息, 该函数接收两个参数,
    //第一个参数为异常信息或调试信息对象(或信息字符串)
    //, 当为信息字符串时, 该字符串代表要输出的提示信息
    //, 当为信息对象时, 该对象需要一个必要属性及4个可选属性
    //, 一个必要属性就是信息字符串, 属性名称为"message", 代表要输出的提示信息
    //, 4个可选属性分别为"name", "fileName", "lineNumber", "stack"
    //, 分别代表信息或错误名称, 文件名, 行号, 栈信息(可忽略)
    //第二个参数为调试信息类型, 0代表开发调试信息, 1代表异常信息, 2代表框架调试信息
    //输出信息格式如下:
    //...
    echo = function () {
        //接收的调试信息对象
        var errorObj = arguments[0] || {},
                //调试信息类型, 默认为附加调试信息
                errorType = arguments[1] || 0;

        //如果接收的调试信息对象参数是字符串(信息字符串)
        //, 则将该字符串转换为调试信息对象
        if (Object.prototype.toString.call(errorObj).slice(8, -1) === "String") {
            errorObj = {
                message: errorObj
            };
        }
        //将调试信息类型转换为10进制的整数类型
        errorType = parseInt(errorType, 10);

        //从接收的调试信息对象中抽出相关的属性部分并给予默认值

        //调试或错误提示信息
        var message = errorObj.message || '';
        //调试或错误名称
        var name = errorObj.name || undefined;
        //调试或错误所在文件名
        var fileName = errorObj.fileName || undefined;
        //调试或错误行号
        var lineNumber = errorObj.lineNumber || undefined;
        //调试或错误栈信息(可忽略)
        var stack = errorObj.stack || undefined;

        //要输出的错误或调试信息
        var msg = "";
        if (name != undefined) {
            msg += "[" + name + "] ";
        }
        msg += String(message);
        if (fileName != undefined) {
            msg += ", file: " + fileName;
        }
        if (lineNumber != undefined) {
            msg += ", line: " + lineNumber;
        }
        if (stack != undefined) {
            msg += ", stack: " + stack;
        }

        //判断顶级对象(可能是window对象, 在浏览器下)是否支持console控制台
        //, 如果支持则输出调试信息到控制台
        if (topObj.console) {
            //判断错误或调试信息类型, 1代表异常信息, 总是输出异常信息
            if (errorType === 1) {
                console.error(msg);
            } else if ((opt.debug === 1 || opt.debug === 3) && errorType === 2) {
                //如果调试参数中debug选项(即opt.debug)值为1或3
                //, 并且错误或调试信息类型为框架跟踪调试信息(即errortype值为2)
                //, 则输出框架跟踪调试信息
                //console.log(msg);
            } else if ((opt.debug === 2 || opt.debug === 3) && errorType === 0) {
                //如果调试参数中debug选项(即opt.debug)值为2或3
                //, 并且错误或调试信息类型为开发调试信息(即errortype值为0)
                //, 则输出开发调试信息
                //console.log(msg);
            }
        }
        return msg;
    },
            //框架库对象构造函数, 返回特定版本实例对象, 并执行初始化过程
            //该构造函数接收两个参数:
            //第一个参数为版本号, 构造函数回根据该版本号返回特定的对象实例
            //第二个参数为布尔值, 指明是否需要创建新的对象实例, 如果该值为真
            //, 构造函数则被强制返回一个新的对象实例
            constructFn = function (ver, isNewOne) {
                //暂存当前对象
                var self = this,
                        //判断对象是否是另一个对象的实例
                        //该函数接收两个参数:
                        //第一个参数是要进行判断的对象(这里参数名是"o")
                        //第二个参数是需要确定的实例化的对象类型(这里参数名是"type")
                        //返回值为布尔值, 如果o是type的一个实例, 则返回true, 否则返回false
                        instanceOf = function (o, type) {
                            return (o && o.hasOwnProperty && (o instanceof type));
                        },
                        //需要输出的错误信息
                        errorMsg = '';

                //如果需要返回一个新的对象实例
                if (isNewOne) {
                    //如果是第一次执行则初始化对象
                    //, 这里判断当前对象(即self)不是Xbn的一个实例
                    if (!(instanceOf(self, Xbn))) {
                        //如果是非new操作符创建实例对象
                        //, 则重新用new操作符创建实例对象
                        self = new Xbn(ver);
                    } else {
                        //用new操作符创建实例对象
                        //, 则执行正常的初始化过程
                        self._init();
                    }
                } else {
                    //不创建新实例, 返回以前创建的旧实例
                    //, 单例模式
                    //如果提供版本号信息参数, 则尽量返回版本号对应的实例对象
                    if (ver) {
                        ver = String(ver);

                        try {
                            //没有当前版本, 并且当前版本号也不等于默认版本号时
                            //, 则返回默认版本的实例对象
                            if (!Xbn.VERSIONS[ver] && ver !== Xbn.DEFAULT_VERSION) {
                                errorMsg = "没有找到 Xbn version " + ver;
                                errorMsg += ", 返回默认版本 Xbn version " + Xbn.DEFAULT_VERSION + ".";
                                ver = Xbn.DEFAULT_VERSION;
                            }
                            //如果仍然不存在, 则初始化新的默认版本实例对象
                            if (!Xbn.VERSIONS[ver]) {
                                Xbn.VERSIONS[ver] = new Xbn(ver, true);
                            }
                            //设置特定版本的实例对象为当前对象, 后续将作为返回值返回
                            self = Xbn.VERSIONS[ver];
                            //如果以上没有找到相关版本的实例对象, 则抛出异常信息
                            if (errorMsg !== '') {
                                throw new Error(errorMsg);
                            }

                        } catch (e) {
                            //捕获并输出异常信息
                            echo(e, 1);
                        }

                    } else {
                        //未提供版本号, 则返回默认版本对应的实例对象

                        //如果没有缓存默认版本对应的实例对象
                        //, 则生成一个默认版本的新的实例对象
                        if (!Xbn.VERSIONS[Xbn.DEFAULT_VERSION]) {
                            Xbn.VERSIONS[Xbn.DEFAULT_VERSION] = new Xbn(Xbn.DEFAULT_VERSION, true);
                        }
                        //将默认版本对应的实例对象设置为当前对象
                        //, 后续将作为返回值返回
                        self = Xbn.VERSIONS[Xbn.DEFAULT_VERSION];
                    }

                }
                //返回实例对象
                return self;
            },
            //框架库对象的原型对象
            prototypeObj = {
                //版本信息
                version: version,
                //调试选项
                option: opt,
                //调试信息输出函数
                echo: echo,
                //实例化过程中的初始化函数
                _init: function () {
                    //设置构造函数对象为Xbn框架库对象本身
                    this.constructor = Xbn;
                    //框架组件对象依附命名空间对象
                    //this.B = {};
                }
            };

    //初始化核心组件
    try {
        //如果框架对象命名空间没有被使用或者已经使用的命名空间确实是来自于该框架对象
        //, 则进行以下初始化过程
        if (typeof Xbn === "undefined" || (Xbn.mark && Xbn.mark === mark)) {
            //如果确实是来自于该框架对象(有可能是不同版本的实例对象)
            //, 则暂时保留版本实例对象信息及组件列表信息
            if (Xbn) {
                VERSIONS = Xbn.VERSIONS;
                MODULES = Xbn.MODULES;
            }
            //重新设置命名空间构造函数
            Xbn = constructFn;
            //重新设置原型对象
            Xbn.prototype = prototypeObj;
            //还原版本实例对象信息
            Xbn.VERSIONS = VERSIONS;
            //还原组件列表信息
            Xbn.MODULES = MODULES;
            //重新设置默认版本信息
            Xbn.DEFAULT_VERSION = version;
            //设置合法标记
            Xbn.mark = mark;
            //框架全局环境变量依附命名空间对象
            Xbn.ENV = {};
            //让顶级对象的Xbn对象引用新的Xbn对象
            topObj.Xbn = Xbn;
        } else {
            //框架库对象命名空间已被其他库使用
            throw new Error("'Xbn' is defined in another place.");
        }
    } catch (e) {
        //初始化失败, 输出异常调试信息
        echo(e, 1);
    }
    ;
}(this));
//框架的基础工具函数, 这些函数是框架其他核心功能的基石
(function (X) {
    //字符串序列化借用工具, 该函数将对象序列化为字符串
    var toStr = Object.prototype.toString,
            //该函数基于传入的参数对象, 创建新对象
            //, 即传入的参数对象最为新对象的原型对象
            //该函数接收一个参数, o, 即原型对象
            //返回值: 基于传入的原型对象参数o创建的新对象
            createObject = function (o) {
                function F() {}
                F.prototype = o;
                return new F();
            },
            //该函数基于一定算法返回一个16进制的唯一字符串序列
            createGuid = function () {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0,
                            v = (c == 'x') ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                }).toUpperCase();
            },
            //该函数判断传入的参数对象是否是数值类型
            //该函数接收一个参数, 即要判断的参数对象
            //返回值: 如果传入的参数对象是数值类型, 则返回true, 否则返回false
            isNumber = function (testArr) {
                return (toStr.call(testArr).slice(8, -1) === "Number");
            },
            //该函数判断传入的参数对象是否是布尔类型
            //该函数接收一个参数, 即要判断的参数对象
            //返回值: 如果传入的参数对象是布尔类型, 则返回true, 否则返回false
            isBoolean = function (testArr) {
                return (toStr.call(testArr).slice(8, -1) === "Boolean");
            },
            //该函数判断传入的参数对象是否是字符串类型
            //该函数接收一个参数, 即要判断的参数对象
            //返回值: 如果传入的参数对象是字符串类型, 则返回true, 否则返回false
            isString = function (testArr) {
                return (toStr.call(testArr).slice(8, -1) === "String");
            },
            //该函数判断传入的参数对象是否是正则表达式类型
            //该函数接收一个参数, 即要判断的参数对象
            //返回值: 如果传入的参数对象是正则表达式类型, 则返回true, 否则返回false
            isRegExp = function (testArr) {
                return (toStr.call(testArr).slice(8, -1) === "RegExp");
            },
            //该函数判断传入的参数对象是否是纯粹的对象类型
            //(即通过字面量{}或new Object字样创建的对象)
            //该函数接收一个参数, 即要判断的参数对象
            //返回值: 如果传入的参数对象是纯粹的对象类型, 则返回true, 否则返回false
            isPlainObject = function (testObj) {
                return (toStr.call(testObj).slice(8, -1) === "Object");
            },
            //代理函数, 该函数前置传入的函数在特定的上下文中运行
            //该函数接收两个参数
            //第一个参数为函数需要的上下文对象, 传入的函数将在该上下文中运行
            //第二个参数为要强制在特定上下文中运行的函数
            //返回值: 返回一个代理函数
            //, 该函数内包装了要执行的函数和函数运行的上下文对象
            proxy = function (context, func) {
                return (function () {
                    return func.apply(context, arguments);
                });
            },
            //去除字符串末尾的一个特定字符
            //该函数接收两个参数
            //第一个参数为要从中删除字符的字符串
            //第二个参数为要从字符串末尾删除的一个特定字符
            //返回值: 删除一个特定字符后的字符串
            rTrim = function (str, char) {
                if (!isString(str)) {
                    return str;
                }
                str = $.trim(str);
                if (str.length === 0) {
                    return str;
                }
                if (!isString(char) || char.length > 1) {
                    return str;
                }
                if (str.charAt(str.length - 1) === char) {
                    return str.substr(0, str.length - 1);
                }
                return str;
            },
            //复制传入的参数对象
            //该函数接收一个参数, 即要复制的参数对象
            //返回值: 复制后的新对象
            clone = function (obj) {
                return $.extend(true, {}, obj);
            },
            firstLetter = function (str) {
                str = str.toLowerCase();
                return str.replace(/\b(\w)|\s(\w)/g, function (m) {
                    return m.toUpperCase();
                });
            },
            /**
             * 验证数据类型 是否为函数类型.
             * @method isFunction
             * @param {func}  需要验证的数据
             * @return {Boolean} 返回布尔值
             */
            isFunction = function (func) {
                return toStr.call(func) === "[object Function]";
            },
            /**
             * 验证数据类型 是否为数组类型.
             * @method isArray
             * @param {array}  需要验证的数据
             * @return {Boolean} 返回布尔值
             */
            isArray = function (array) {
                return toStr.call(array) === "[object Array]";
            },
            /**
             * 强制数据类型转化 数组.
             * @method makeArray
             * @param  {Array} array 数组类型的数据
             * @return {Array} 返回数组数据
             */
            makeArray = function (array) {
                return array ? this.isArray(array) ? array : [array] : [];
            },
            /**
             * 简单的遍历数据方法.
             * @method each
             * @param  {Array|Object} data 数据，可以是数组类型或对象类型
             */
            each = function (data, callback) {
                if (this.isArray(data)) {
                    for (var i = 0; i < data.length; i++) {
                        callback(data[i], i);
                    }
                } else {
                    for (var k in data) {
                        callback(data[k], k);
                    }
                }
            },
            /**
             * 查找元素是否在该数组中.
             * @method inArray
             * @param  {Array}   array 数组数据
             * @param  {}        item 数组中的一个属性
             * @return {Boolean} 返回布尔值
             */
            inArray = function (array, item) {
                array = this.makeArray(array);

                if (array.indexOf) {
                    return array.indexOf(array) > -1;
                } else {
                    for (var i = 0; i < array.length; i++) {
                        if (array[i] === item)
                            return true;
                    }

                    return false;
                }
            };
    

    //对外曝露使用接口
    X.prototype.inArray = inArray;
    X.prototype.each = each;
    X.prototype.makeArray = makeArray;
    X.prototype.createObject = createObject;
    X.prototype.createGuid = createGuid;
    X.prototype.isArray = isArray;
    X.prototype.isNumber = isNumber;
    X.prototype.isBoolean = isBoolean;
    X.prototype.isString = isString;
    X.prototype.isRegExp = isRegExp;
    X.prototype.isFunction = isFunction;
    X.prototype.isPlainObject = isPlainObject;
    X.prototype.proxy = proxy;
    X.prototype.rTrim = rTrim;
    X.prototype.clone = clone;
    X.prototype.firstLetter = firstLetter;
    X.prototype.uploadArr = [];
    X.prototype.extend = $.extend;
}(this.Xbn));
//消息组件, 中介者模式
//, 任何组件都可以利用该组件在全局范围内发布和订阅广播消息
//该组件是其他核心组件实现的基础
(function (X) {
    //借用prototype对象
    var that = X.prototype;

    //区分优先级的消息发布及订阅的执行队列
    //优先级别分为优先, 普通, 延迟三个等级
    var execQueue = function (queueHigh, args) {
        var subscription,
                delArr = [];
        //遍历消息执行队列, 逐一执行订阅函数, 并记录执行过的订阅函数的索引
        //, 以便后续从队列中清除已经执行过的一次订阅函数
        for (var i = 0, l = queueHigh.length; i < l; i++) {
            subscription = queueHigh[i];
            if (subscription !== undefined) {
                subscription.callback.apply(subscription.context, args);
                //如果为一次订阅, 则记录执行过的订阅函数的索引
                if (subscription.atOnce) {
                    delArr.unshift(i);
                }
            } else {
                //订阅参数对象错误, 输出错误调试信息
                that.echo("subscribe object is undefined", 1);
            }
        }
        //遍历已经执行过的订阅函数的索引数组
        //, 从执行队列中删除相应的订阅函数
        for (var j = 0, k = delArr.length; j < k; j++) {
            queueHigh.splice(delArr[j], 1);
        }

        return true;
    };

    //消息订阅函数
    //该函数接收三个参数, 两个必要参数和一个可选参数
    //第一个必要参数为要订阅的消息名称
    //第二个必要参数为要执行的订阅函数
    //, 该订阅函数接收一系列参数, 第一个参数为订阅的消息名称
    //, 后面的每个参数都代表发布消息时传递的附加参数信息
    //第三个可选参数是订阅消息时设置的配置信息对象
    //, 该配置对象包含以下可选属性
    //atOnce: 是否只订阅一次, 如果为true, 则只订阅一次该消息
    //prior: 消息订阅的优先级, 根据该优先级, 框架将判断消息订阅函数的执行顺序
    //, 优先级分为三个等级, 即优先, 普通, 延迟, 分别对应数值1, 0, -1
    //, 优先级别的订阅函数将最先被执行, 普通的在优先的之后执行, 延迟的最后执行
    //返回值: 返回框架实例对象本身
    var subscribe = function (channel, fn) {
        //配置信息对象
        var confObj = (arguments.length > 2) ? arguments[2] : {};
        //是否是一次订阅, 默认为多次订阅
        confObj.atOnce = confObj.atOnce || false;
        //订阅优先级, 默认为普通订阅
        confObj.prior = confObj.prior || 0;
        //初始化该订阅消息的订阅函数执行队列
        if (!mediator.channels[channel]) {
            mediator.channels[channel] = {
                low: [],
                normal: [],
                high: []
            };
        }

        //优先队列
        if (confObj.prior > 0) {
            //优先队列
            mediator.channels[channel].high.push({
                context: this,
                callback: fn,
                atOnce: confObj.atOnce
            });
        } else if (confObj.prior < 0) {
            //延迟队列
            mediator.channels[channel].low.push({
                context: this,
                callback: fn,
                atOnce: confObj.atOnce
            });
        } else {
            //普通队列
            mediator.channels[channel].normal.push({
                context: this,
                callback: fn,
                atOnce: confObj.atOnce
            });
        }

        return this;
    };

    //消息发布函数
    //该函数接收一系列参数
    //第一个参数为要发布的消息名称
    //后面的每个参数都代表发布消息时传递的附加参数信息
    //返回值: 返回框架实例对象本身
    var publish = function (channel) {
        //要发布的消息没有注册任何订阅函数, 则直接返回
        if (!mediator.channels[channel])
            return false;
        //获得除消息名称外的所有附加参数
        var args = Array.prototype.slice.call(arguments, 1);
        //将消息名称压入参数数组顶部
        args.unshift(channel);
        //获得优先队列
        var queueHigh = mediator.channels[channel].high;
        //获得普通队列
        var queueNormal = mediator.channels[channel].normal;
        //获得延迟队列
        var queueLow = mediator.channels[channel].low;

        //执行优先订阅队列
        if (queueHigh.length > 0) {
            execQueue(queueHigh, args);
        }
        //执行普通订阅队列
        if (queueNormal.length > 0) {
            execQueue(queueNormal, args);
        }
        //执行延迟订阅队列
        if (queueLow.length > 0) {
            execQueue(queueLow, args);
        }

        return this;
    };

    //消息对象包装对象
    var mediator = {
        channels: {},
        publish: publish,
        subscribe: subscribe,
        installTo: function (obj) {
            obj.subscribe = subscribe;
            obj.publish = publish;
            obj.channels = this.channels;
        }
    };

    //对外曝露接口
    mediator.installTo(X.prototype);
}(this.Xbn));
//基础对象组件, 所有定义的对象都可以基于该对象进行扩展
(function (X) {
    //借用prototype对象
    var that = X.prototype;

    //对象包装器
    var mod = {
        //基于当前对象, 创建一个新的实例
        newOne: function () {
            var object = that.createObject(this);
            object.init.apply(object, arguments);
            return object;
        },
        //当前对象的实例被创建时, 执行的初始化函数
        //, 默认为空函数, 可以在定义对象时实现该函数
        init: function () {},
        //将当前对象的属性和方法附加到参数对象上, 并返回该参数对象
        //该函数接收一个参数, 即要附加的参数对象
        //返回值: 附加了当前对象属性和方法的参数对象
        create: function (ob) {
            var i;
            ob = ob || {};
            for (i in this) {
                if (this.hasOwnProperty(i) && !ob.hasOwnProperty(i)) {
                    if (typeof this[i] === "object") {
                        ob[i] = that.isArray(this[i]) ? [] : {};
                        this.create.apply(this[i], ob[i]);
                    } else {
                        ob[i] = this[i];
                    }
                }
            }

            return ob;
        }
    };

    //对外曝露接口
    X.prototype.object = mod;
}(this.Xbn));
//消息订阅注册包装器,　通过该包装器注册的订阅函数只执一次, 即只订阅一次
(function (X) {
    //借用prototype对象
    var that = X.prototype;
    //包装器对象, 继承了框架的基础对象的属性和方法
    var resObj = that.object.create({
        //对象实例化时的初始化函数
        //该函数接收一个配置对象参数, 该配置对象包含了一些属性, 如下:
        //waitMsg: 要注册的订阅函数所接收的消息名称
        //, 该属性可以是一个单一的消息名称字符串, 也可以是一个数组
        //, 该数组内的每一个元素都是一个单一的消息名称字符串
        //, 如果该属性以一个数组的方式提供
        //, 则订阅函数需要等待数组里的所有消息都被发布后, 才被执行
        //success: 要注册的订阅函数
        //prior: 订阅函数的优先级
        //, 该属性会标记该订阅函数在消息队列里的优先级
        //, 优先级高的将会被优先执行, 默认的优先级有三种: 优先, 普通, 延迟
        //, 分别对应值为1, 0, -1, 该属性为可选的, 默认为普通优先级
        init: function (conf) {
            var msg = conf.waitMsg;
            //记录真正的消息订阅函数
            this.callback = conf.success;
            this.prior = conf.prior || 0;

            //初始化注册订阅函数的依赖消息数组
            this.dependMsg = [];
            //处理消息锁, 如果处理函数正在处理该消息
            //, 则该锁值为true, 否则为false
            this.locked = false;

            //如果要订阅的消息是以数组的形式多个消息
            //, 则遍历消息数组, 并将每条消息都添加到依赖消息序列中, 并且注册订阅函数
            if (that.isArray(msg)) {
                if (msg.length > 0) {
                    for (var i = 0; i < msg.length; i++) {
                        //调用依赖管理函数, 将每条消息都添加到依赖消息序列中
                        //, 并且注册订阅函数
                        this.dependReg(msg[i]);
                    }
                }
            } else {
                //如果要订阅的消息是单一消息字符串
                //, 则直接注册订阅函数
                that.subscribe(msg, that.proxy(this, this.callback), {
                    atOnce: true,
                    prior: this.prior
                });
            }
        },
        //订阅函数优先级
        prior: 0,
        //依赖消息序列数组
        dependMsg: [],
        //处理消息锁
        locked: false,
        callback: function () {},
        //消息依赖管理函数, 将每条消息都添加到依赖消息序列中
        //, 并且注册订阅函数
        dependReg: function (msg) {
            this.dependMsg.push(msg);
            that.subscribe(msg, that.proxy(this, this.depend), {
                atOnce: true,
                prior: this.prior
            });
        },
        //代理的消息订阅函数, 当处理消息的时候
        //, 会间接执行真正的消息订阅函数
        depend: function (msg) {
            //如果消息处理函数没有被锁定, 则调用消息处理函数处理消息
            if (!this.locked) {
                this.doMsg(msg);
                return true;
            }

            //当消息处理函数被锁定, 则等待
            //, 直到消息处理函数解锁后, 再执行消息处理函数
            while (this.locked) {
                if (this.locked) {
                    continue;
                }
                this.doMsg(msg);
            }

            return true;
        },
        //消息处理函数, 在该函数中执行真正的消息订阅函数
        doMsg: function (msg) {
            //加锁
            this.locked = true;
            if ($.inArray(msg, this.dependMsg) !== -1) {
                //从依赖消息序列中删除该消息
                this.dependMsg.splice($.inArray(msg, this.dependMsg), 1);
            }
            //如果依赖的消息序列中的所有消息都被发布完成
            //, 则执行真正的消息订阅函数
            if (this.dependMsg.length === 0) {
                try {
                    this.callback();
                } catch (e) {
                    //输出错误调试信息
                    that.echo(e, 1);
                }
            }
            //解锁
            this.locked = false;

            return true;
        }
    });

    //对外曝露接口
    X.prototype.msgWrapper = resObj;
}(this.Xbn));
//异步请求组件, 基于jquery的ajax方法进行的封装
(function (X) {
    //借用prototype对象
    var that = X.prototype;

    //请求时，生成一层覆盖，怕用户乱点
    function renderCover(hide) {
        var requestCover = $('.requestCover')
        if (!requestCover.length) {
            requestCover = $('<div class="requestCover"></div>')
            $('body').append(requestCover)
        }
        hide? requestCover.addClass('none'): requestCover.removeClass('none')
    }

    //跨域请求回调函数临时依附空间
    //X.ENV.callback = {};
    var ie = (function () {
        if ($.browser["msie"]==true && parseInt($.browser["version"])<10){
            return true;
        }
        return false;
    })();

    //状态管理器, 记录当前ajax模块订阅的所有消息及其当前状态等信息
    var stateObj = {
        subscribeArr: {
            //controller.loaded: {
            //    funcName: "",
            //    loaded: false
            //}
        }
    },
    //统一订阅函数, 接收订阅loaded消息, 并更新状态管理器中
    //当前消息状态中loaded标记为true, 即已经接收到loaded消息
    //避免重复发布loaded消息
    subFn = function (msg) {
        if (stateObj.subscribeArr[msg]) {
            stateObj.subscribeArr[msg].loaded = true;
        }
        return false;
    },
            //核心请求模块
            ajaxReq = function (opt) {
                //$(".loadings").fadeIn();
                if (!opt.url) {
                    that.echo("RequestError", 1);
                    opt.url = '';
                }

                var ajaxOpt = opt.optionObj || {};

                opt.msg = opt.msg || '';
                opt.vendor = opt.vendor || false;
                opt.vendorMsg = opt.vendorMsg || '';

                //订阅模块的loaded消息, 以避免重复发布该消息
                if (stateObj.subscribeArr[opt.msg]) {
                    //已经存在该订阅函数, 重置状态为未接收到loaded消息
                    stateObj.subscribeArr[opt.msg].loaded = false;
                } else {
                    //该订阅函数不存在, 则添加该订阅函数
                    stateObj.subscribeArr[opt.msg] = {
                        funcName: "subFn",
                        loaded: false
                    };
                    //发布订阅
                    that.subscribe(opt.msg, subFn);
                }

                if (!ajaxOpt['type']) {
                    ajaxOpt['type'] = "POST";
                }

                if(opt.url.indexOf('debugger')==0){
                    ajaxOpt['type'] = "GET";
                    if(opt.optionObj.data){
                        opt.optionObj.data = '';
                    }
                    //排除image接口
                    if(opt.url.match(/;jsessionid=.*/)){
                        opt.url = opt.url.replace(document.location.protocol + fullImgPath,'');
                        opt.url = opt.url.replace(/;jsessionid=.*/,'');
                    }
                }
                var token = '';
                if (!ajaxOpt['success']) {
                    ajaxOpt['success'] = function (data, status, xhr) {
                        //console.log("resource loaded, data: " + data);
                        if (opt.msg) {
                            if (stateObj.subscribeArr[opt.msg] === undefined || stateObj.subscribeArr[opt.msg].loaded === false) {
                                if (ajaxOpt.dataType === "script") {
                                    that.publish(opt.msg);
                                } else {
                                    that.publish(opt.msg, data);
                                }
                            } else {
                                stateObj.subscribeArr[opt.msg].loaded = false;
                            }

                        }
                        //vendor msg
                        if (opt.vendor && opt.vendorMsg) {
                            if (ajaxOpt.dataType === "script") {
                                that.publish(opt.vendorMsg);
                            } else {
                                that.publish(opt.vendorMsg, data);
                            }
                        }
                        token = xhr.getResponseHeader("token");
                    };
                }

                ajaxOpt.url = opt.url;

                if (that.isFunction(opt.callback)) {
                    ajaxOpt['success'] = function (data, status, xhr) {
                        //console.log("resource loaded");
                        if (ajaxOpt.dataType === "script") {
                            //console.log("script");
                            opt.callback();
                            if (opt.msg) {
                                if (stateObj.subscribeArr[opt.msg] === undefined || stateObj.subscribeArr[opt.msg].loaded === false) {
                                    that.publish(opt.msg);
                                } else {
                                    stateObj.subscribeArr[opt.msg].loaded = false;
                                }

                            }
                            //vendor msg
                            if (opt.vendor && opt.vendorMsg) {
                                that.publish(opt.msg);
                            }
                        } else {
                            //判断登出
                            //if (data.statusCode && (data.statusCode == '2001000' || data.statusCode == '1000100' || data.statusCode == '-2') && new Xbn().parseURL(location.href).params.a != 'login') {
                               //location.href = X.prototype.config.PATH_FILE.path.root+'/category/user/login.html?refer='+location.href;
                              // return false;
                            //}
                            opt.callback(data);

                            if (opt.msg) {
                                if (stateObj.subscribeArr[opt.msg] === undefined || stateObj.subscribeArr[opt.msg].loaded === false) {
                                    that.publish(opt.msg, data);
                                } else {
                                    stateObj.subscribeArr[opt.msg].loaded = false;
                                }

                            }
                            //vendor msg
                            if (opt.vendor && opt.vendorMsg) {
                                that.publish(opt.msg, data);
                            }
                        }
                        token = xhr.getResponseHeader("token");
                    }
                }

                ajaxOpt.error = function(XMLHttpRequest, textStatus, errorThrown){
                    that.publish("app.serviceError",textStatus);
                };

                if(opt.contentType){
                    ajaxOpt.contentType = opt.contentType;
                }
                ajaxOpt.xhrFields={
                    withCredentials: true
                };
                ajaxOpt.crossDomain=true;
                ajaxOpt.beforeSend = function(xhr) {
                    if (ie) {
                        xhr.setRequestHeader("token", token);
                    }
                };
                return $.ajax(ajaxOpt);
            },
            //封装的4种请求类型接口
            resObj = {
                syncRequest: function (url) {
                    var html = $.ajax({
                        url: url,
                        async: false,
                        cache: false
                    }).responseText;
                    return html;
                },
                syncRequestScript: function (optObj) {
                    optObj.url = optObj.url || '';
                    optObj.callback = optObj.callback || function () {};

                    var confOpt = {
                        url: optObj.url,
                        optionObj: {
                            type: "GET",
                            dataType: "script",
                            async: false,
                            cache: false
                        },
                        callback: optObj.callback
                    };

                    return ajaxReq.call(this, confOpt);

                    //return this;
                },
                request: function (optObj) {
                    optObj.url = optObj.url || '';
                    if (ie) {
                        if (optObj.url.indexOf('?') < 0) {
                            optObj.url = optObj.url + '?IEVersion=lt10';
                        } else {
                            optObj.url = optObj.url + '&IEVersion=lt10';
                        }
                    }
                    optObj.data = optObj.data || {};
                    optObj.dataType = optObj.dataType || "";
                    optObj.msg = optObj.msg || '';
                    optObj.callback = optObj.callback || function () {};
                    optObj.type = optObj.type || "POST";
                    optObj.async= typeof optObj.async=='undefined'? true : optObj.async;
                    var confOpt = {
                        url: optObj.url,
                        optionObj: {
                            type: optObj.type,
                            cache: false,
                            async: optObj.async,
                            data: JSON.stringify(optObj.data)
                        },
                        msg: optObj.msg,
                        callback: function(res) {
                            renderCover(1);
                            optObj.callback(res);
                        }
                    };

                    if (optObj.dataType !== "") {
                        confOpt.optionObj.dataType = optObj.dataType;
                    }
                    if(optObj.contentType){
                        confOpt.contentType = optObj.contentType;
                    }

                    renderCover();
                    return ajaxReq.call(this, confOpt);
                },
                requestScript: function (optObj) {
                    optObj.url = optObj.url || '';
                    optObj.msg = optObj.msg || '';
                    optObj.callback = optObj.callback || function () {};
                    optObj.vendor = optObj.vendor || false;
                    optObj.vendorMsg = optObj.vendorMsg || "";

                    var confOpt = {
                        url: optObj.url,
                        optionObj: {
                            type: "GET",
                            dataType: "script",
                            cache: false
                        },
                        msg: optObj.msg,
                        callback: optObj.callback,
                        vendor: optObj.vendor,
                        vendorMsg: optObj.vendorMsg
                    };

                    return ajaxReq.call(this, confOpt)
                },
                requestRemote: function (optObj) {
                    optObj.url = optObj.url || '';
                    optObj.data = optObj.data || {};
                    //optObj.dataType = "jsonp";
                    //optObj.msg = optObj.msg || '';
                    optObj.callback = optObj.callback || function () {};
                    optObj.type = optObj.type || "GET";

                    /*
                     var confOpt = {
                     url: optObj.url,
                     optionObj: {
                     type: optObj.type,
                     cache: false,
                     data: optObj.data
                     },
                     msg: optObj.msg,
                     callback: optObj.callback
                     };

                     if (optObj.dataType !== "") {
                     confOpt.optionObj.dataType = optObj.dataType;
                     }
                     */

                    //var callback = "callbackFn_" + that.createGuid();
                    //X.ENV.callback[callback] = function (data) {
                    //    if (that.isFunction(optObj.callback)) {
                    //        optObj.callback(data);
                    //    }
                    //    delete X.ENV.callback[callback];
                    //};
                    return $.ajax({
                        url: optObj.url,
                        type: optObj.type,
                        dataType: "json",
                        data: optObj.data,
                        success: function (data) {
                            if (that.isFunction(optObj.callback)) {
                                optObj.callback(data);
                            }
                        }
                    });
                }
            };

    //对外曝露接口
    X.prototype.loadRemoteData = resObj.requestRemote;
    X.prototype.loadData = resObj.request;
    X.prototype.requestScript = resObj.requestScript;
    X.prototype.syncRequest = resObj.syncRequest;
    X.prototype.syncRequestScript = resObj.syncRequestScript;
}(this.Xbn));
//config module
(function (X) {
    //借用prototype对象
    var that = X.prototype;

    var config = {
        path: {
            root: "./",
            custom: ""
        },
        map: {
            //jquery: "js/vendor/jquery.1.0.js"
        },
        custom: {} //custom config items
    },
    //set path config items
    setPath = function (path) {
        path.root = path.root || '';
        path.custom = path.custom || '';

        //root path
        if (that.isString(path.root) && path.root !== '') {
            config.path.root = that.rTrim(path.root, "/") + "/";
        }

        //custom path
        if (that.isString(path.custom) && path.custom !== '') {
            config.path.custom = that.rTrim(path.custom, "/") + "/";
        }

        return true;
    },
            //set vendor map path items
            setMap = function (map) {
                var i;
                for (i in map) {
                    if (map.hasOwnProperty(i) && that.isString(map[i])) {
                        config.map[i] = map[i];
                    }
                }
                return true;
            },
            //set custom config items
            setCustom = function (custom) {
                config.custom = that.clone(custom);
                return true;
            },
            setConfig = function (confObj) {
                confObj = confObj || {};
                //path items
                confObj.path = confObj.path || {};
                //map items
                confObj.map = confObj.map || {};
                //custom items
                confObj.custom = confObj.custom || {};
                //set path config items
                setPath(confObj.path);
                //set vendor map path
                setMap(confObj.map);
                //set custom config items
                setCustom(confObj.custom);

                return this;
            },
            //get path items of config object
            getConfigPath = function () {
                return that.clone(config.path);
            },
            //get vendor map items of config object
            getConfigMap = function (mapKey) {
                mapKey = mapKey || '';
                if (that.isString(mapKey) && mapKey !== '') {
                    return config.map[mapKey];
                }
                return undefined;
            },
            //get custom config items
            getConfigCustom = function () {
                return that.clone(config.custom);
            };

    //对外曝露接口
    X.prototype.setConfig = setConfig;
    X.prototype.getConfigPath = getConfigPath;
    X.prototype.getConfigMap = getConfigMap;
    X.prototype.getConfigCustom = getConfigCustom;
}(this.Xbn));
//dependency module
(function (X) {
    //借用prototype对象
    var that = X.prototype;

    //map name string to real script file
    var map = function (mapStr, mapType) {
        //global config path
        var path = that.getConfigPath();

        var filePath;
        //vendor map
        if (mapType === 2) {
            //vendor alias
            if (that.getConfigMap(mapStr) != undefined) {
                filePath = that.getConfigMap(mapStr);
            } else {
                filePath = mapStr;
            }
            filePath = path.root + filePath;
        } else {
            //base map
            filePath = mapStr + ".js";
            //business map
            filePath = path.root + path.custom + filePath;
        }

        return filePath;
    };

    //libs loaded
    var loaded = {
        //vendors of loaded
        vendor: ["jquery"],
        //base libs of loaded
        base: []
    };

    //async load script
    var loadScript = function (confObj) {
        confObj.url = confObj.url || '';
        confObj.vendor = confObj.vendor || false;
        confObj.msg = confObj.msg || '';
        confObj.callback = confObj.callback || function () {};

        if (!confObj.url) {
            return this;
        }
        var toLoad = true,
                scriptFile = '',
                loadStr,
                loadedArr,
                d,
                self = this;

        //vendor script
        if (confObj.vendor) {
            loadedArr = loaded.vendor;
            loadStr = confObj.url;
            //vendor map
            scriptFile = map(confObj.url, 2);
        } else {
            loadedArr = loaded.base;
            //split namespace
            d = confObj.url.split('.');
            loadStr = d.join("_");
            //base map
            scriptFile = map(d.join("/"), 1);
        }

        //not to load , loaded
        if ($.inArray(loadStr, loadedArr) !== -1) {
            if (that.isFunction(confObj.callback)) {
                confObj.callback();
            }
            //publish msg
            if (confObj.msg) {
                that.publish(confObj.msg);
            } else {
                that.publish(confObj.url + ".loaded");
                that.publish(confObj.url + ".ready");
            }
            return self;
        }

        //loading script file
        that.requestScript({
            url: scriptFile,
            callback: function () {
                //push loaded script alias into related array
                loadedArr.push(loadStr);
                if (self.isFunction(confObj.callback)) {
                    confObj.callback();
                }
            },
            msg: confObj.msg ? confObj.msg : (confObj.url + ".loaded"),
            vendor: confObj.vendor,
            vendorMsg: (confObj.url + ".ready")
        });

        return self;
    };

    //对外曝露接口
    X.prototype.loadScript = loadScript;
}(this.Xbn));
//util functions
(function (X) {
    //借用prototype对象
    var that = X.prototype;

    //注册制定状态消息的待执行函数
    var onState = function (mods, fn, msgType) {
        var msg = [];
        if (that.isArray(mods)) {
            for (var i = 0; i < mods.length; i++) {
                if (that.isString(mods[i])) {
                    msg.push(mods[i] + "." + msgType);
                }
            }
        } else {
            if (that.isString(mods)) {
                msg.push(mods + "." + msgType);
            }
        }

        if (msg.length > 0) {
            that.msgWrapper.newOne({
                waitMsg: msg,
                //high priority, execute at first
                prior: 1,
                success: function () {
                    //callback
                    if (that.isFunction(fn)) {
                        fn();
                    }
                }
            });
        }
        return true;
    },
            //设置制定状态消息
            setState = function (mods, msgType) {
                if (that.isArray(mods)) {
                    for (var i = 0; i < mods.length; i++) {
                        that.publish(mods[i] + "." + msgType);
                    }
                } else {
                    that.publish(mods + "." + msgType);
                }
                return true;
            },
            //register function to excute when module ready
            onReady = function () {
                var mods = arguments[0] || [],
                        fn = arguments[1] || function () {};

                onState(mods, fn, "ready");
                return this;
            },
            //register function to excute when module loaded
            onLoaded = function () {
                var mods = arguments[0] || [],
                        fn = arguments[1] || function () {};

                onState(mods, fn, "loaded");
                return this;
            },
            onMsg = function () {
                mods = arguments[0] || [];
                fn = arguments[1] || function () {};

                var msg = [];
                if (that.isArray(mods)) {
                    for (var i = 0; i < mods.length; i++) {
                        if (that.isString(mods[i]) && mods[i] !== "") {
                            msg.push(mods[i]);
                        }
                    }
                } else {
                    if (that.isString(mods) && mods[i] !== "") {
                        msg.push(mods);
                    }
                }

                if (msg.length > 0) {
                    that.msgWrapper.newOne({
                        waitMsg: msg,
                        success: function () {
                            //callback
                            if (that.isFunction(fn)) {
                                fn();
                            }
                        }
                    });
                }
                return this;
            },
            //set component to ready state
            setReady = function (mods) {
                return setState(mods, "ready");
            },
            //set component to loaded state
            setLoaded = function (mods) {
                return setState(mods, "loaded");
            },
            //虚拟递延对象
            promise = that.object.create({
                data: {},
                error: false,
                textStatus: '',
                errorThrown: {},
                init: function (conf) {
                    this.data = conf.data || {};
                    this.error = conf.error || false;
                    this.textStatus = conf.textStatus || 200;
                    this.errorThrown = conf.errorThrown || {};
                },
                //callback: [],
                then: function (funcSuccess, funcFail) {
                    if (this.error) {
                        if (X.isFunction(funcFail)) {
                            funcFail(this, this.textStatus, this.errorThrown);
                        }
                        return this;
                    }
                    if (X.isFunction(funcSuccess)) {
                        funcSuccess(this.data, this.textStatus, this);
                    }
                    return this;
                }
            });

    //export api
    X.prototype.onReady = onReady;
    X.prototype.onLoaded = onLoaded;
    X.prototype.onMsg = onMsg;
    X.prototype.setReady = setReady;
    X.prototype.setLoaded = setLoaded;
    X.prototype.promise = promise;
}(this.Xbn));


(function (window, document, undefined) {

    var require, define;

    var X = window.Xbn;
    var common = X.prototype;
    var requireid = 0; //模块ID 递增

    /**
     * Module类的静态属性,模块载入初始化状态定义，其中包括（LOADDEPTH{1} 加载中 LOADED{2} 加载完毕）
     * @property Module.loadStatus
     * @type {Object}
     */
    Module.loadStatus = {
        LOADDEPTH: 1,
        LOADED: 2
    };
    /**
     * Module类的静态属性,缓存模块载入完毕并实例化后的数据。
     * @property Module.cache
     * @type {Object}
     */
    Module.cache = {};
    /**
     * Module类的静态属性,缓存每个模块所需要通知被依赖模块的实例。
     * @property Module.noticesCache
     * @type {Object}
     */
    Module.noticesCache = {};
    /**
     * Module类的静态属性,缓存加载中的资源。
     * @property Module.loadingSource
     * @type {Object}
     */
    Module.loadingSource = {};
    /**
     * Module类的静态属性,缓存已经加载的资源。
     * @property Module.loadedSource
     * @type {Object}
     */
    Module.loadedSource = {};


    /**
     * 加载模块管理器
     * @class Module
     * @constructor
     * @param  {String}   name        模块的命名
     * @param  {Function} callback    回掉函数
     * @param  {object}   depth       模块加载依赖，数组形式
     * @example
     *
     */
    function Module(modulename, callback, depth, use) {

        if (!(this instanceof Module))
            return new Module(modulename, callback, depth, use);

        if (Module.cache[modulename])
            throw "当前模块【" + modulename + "】已经存在！";

        var self = this;

        //当前类的实例属性 模块的名称
        self.modulename = modulename;

        self.callback = callback;

        //获取真实的依赖文件列表【数组】
        self.depths = Module.getDeps(depth);

        //计数器 需要加载的依赖模块的数量
        self.needLoadDepth = self.depths.length;

        //当模块所有依赖以及本身全部加载完后, 所通知的主模块列表
        self.notices = (Module.noticesCache[modulename] || {}).notices || [];

        //公开出的成员
        self.exports = {};

        //是否执行过，延迟执行的标志
        self.execed = false;

        //是否是require.async
        self.use = use;

        //初始化模块管理器
        self.init();
    }

    Module.prototype = {
        /**
         * 初始化Module类，并为缓存列表中的模块赋值Module类实例。
         * @method
         */
        init: function () {
            var self = this;

            //当模块类被实例话后表示该模块本身的js已经被成功加载 删除loading表中自身所对应的js
            Module.cache[self.modulename] = self;
            //如果没有依赖 直接complete
            self.needLoadDepth ? self.loadDepths() : self.complete();
        },
        /**
         * 加载依赖模块列表
         * @method
         */
        loadDepths: function () {
            var self = this;

            self.status = Module.loadStatus.LOADDEPTH;

            common.each(self.depths, function (modulename) {
                Module.load(modulename, self.modulename);
            });
        },
        //接受通知
        //此处当依赖本模块的模块加载完后 会执行
        receiveNotice: function () {
            if (!--this.needLoadDepth) {
                this.complete();
            }
        },
        //当本身加载完后 通知所依赖本模块的模块
        noticeModule: function (notice) {
            var self = this;

            //手动通知某个模块
            if (notice) {
                //如果该模块自己的依赖还没加载完，将需要通知的模块添加至通知队列
                if (self.status != Module.loadStatus.LOADED) {
                    return self.notices.push(notice);
                }

                //通知所依赖本模块的模块
                Module.cache[notice].receiveNotice();
            } else {
                //通知所有模块
                common.each(self.notices, function (item) {
                    Module.cache[item].receiveNotice();
                });

                self.notices.length = 0;
            }
        },
        /**
         * @method
         * @returns {undefined}
         */
        complete: function () {
            var self = this;

            self.status = Module.loadStatus.LOADED;
            //如果是require.async 立即执行
            //self.use && self.execute();
            self.execute();            
            self.noticeModule();
        },
        //运行单个实例的回掉函数，如果回掉函数有返回值，则直接把返回值填充到单个实例的exports属性上
        execute: function () {
            var self = this;

            if (self.execed)
                return self.mexport;

            self.execed = true;

            if (common.isFunction(self.callback)) {
                // var exports;


                // if (exports = self.callback.call(window, Module.require, self.mexports, self)) {
                //     self.mexports = exports;
                // }

                var deps = self.depths;  //当前模块的依赖数组
                var args = [];　　//当前模块的回调函数参数
                for (var i = 0, len = deps.length; i < len; i++) { //遍历
                    var dep = Module.cache[deps[i]];　　　　　　　　　　　
                    args[i] = self.execute.apply(dep); //递归得到依赖模块返回值作为对应参数
                }

                self.mexport = self.callback.apply(self,args);

                return self.mexport; // 调用回调函数，传递给依赖模块对应的参数
            }
        }
    };



    /**
     * 模块载入管理
     * @method
     * @param {String} modulename
     * @param {String} notice
     * @returns {unresolved}
     */
    Module.load = function (modulename, notice) {
        var
                cache,
                module;

        if (cache = Module.cache[modulename])
            return cache.noticeModule(notice);

        if (module = Module.noticesCache[modulename])
            return module.notices.push(notice);

        Module.noticesCache[modulename] = {
            notices: [notice]
        };

        var realpath = Module.getRealPath(modulename);


        if (!Module.loadingSource[realpath]) {
            Module._load(realpath, modulename);
        } else if (Module.loadedSource[realpath]) {
            Module.init(modulename);
        }
    };


    Module._load = function (realpath, modulename) {
        Module.loadingSource[realpath] = 1;

        var
                isCss = /\.css$/.test(modulename),
                isLoaded = 0,
                isOldWebKit = +navigator.userAgent.replace(/.*(?:Apple|Android)WebKit\/(\d+).*/, "$1") < 536,
                type = isCss ? 'link' : 'script',
                source = document.createElement(type),
                supportOnload = 'onload' in source;

        //支持css加载
        if (isCss) {
            source.rel = 'stylesheet';
            source.type = 'text/css';
            source.href = realpath;
        } else {
            source.type = 'text/javascript';
            source.src = realpath;
        }

        common.each(require.config.attrs || {}, function (v, k) {
            if (common.isFunction(v)) {
                v = v({
                    type: type,
                    realpath: realpath,
                    modulename: modulename
                });
            }

            v !== undefined && source.setAttribute(k, v);
        });

        function onload() {
            //这边放置css中存在@import  import后会多次触发onload事件
            if (isLoaded)
                return;

            if (!source.readyState || /loaded|complete/.test(source.readyState)) {
                source.onload = source.onerror = source.onreadystatechange = null;
                //已加载
                Module.loadedSource[realpath] = isLoaded = 1;
            }
        }

        source.onload = source.onerror = source.onreadystatechange = onload;
        source.charset = require.config.charset;
        document.getElementsByTagName('head')[0].appendChild(source);

        //有些老版本浏览器不支持对css的onload事件，需检查css的sheet属性是否存在，如果加载完后，此属性会出现
        if (isCss && (isOldWebKit || !supportOnload)) {
            var id = setTimeout(function () {
                if (source.sheet) {
                    clearTimeout(id);
                    return onload();
                }

                setTimeout(arguments.callee);
            });
        }
    };

    /**
     * 初始化模块缓存，如果模块不再缓存列表中则直接创建并缓存在模块列表中
     * @param {String} path  模块路径，通常是模块的名称
     * @method
     */
    Module.init = function (path) {
        !Module.cache[path] && Module(path);
    };

    /**
     * 获取已经加载完成的模块
     * @param {type} modulename             模块缓存内的模块名称
     * @method
     * @returns {Module@arr;cache.exports}  模块的实例
     */
    Module.getModule = function (modulename) {

        var cache = Module.cache[Module.getModuleName(modulename)];
        if(cache){
            cache.execute();              
            return cache.mexport;            
        } 
    };

    /**
     * 获取完整的模块名称，这里定义的是完整的模块加载路径
     * @method
     * @param {String}   path 路径字符串 ，如果该路径是以http://开始则直接返回
     * @returns {String}      处理后的路径字符串
     */
    Module.getModuleName = function (path) {
        if (/:\/\//.test(path))
            return path;

        var
                config = require.config,
                baseurl = config.baseurl || '';

        common.each(config.rules || [], function (item) {
            if (item)
                path = path.replace(new RegExp(item[0],"gi"), item[1]);
        });

        if (baseurl && path.charAt(0) != '/')
            path = baseurl.replace(/\/+$/, '') + '/' + path;

        return path.replace(/\/+/g, '/');
    };

    //获取全路径 此处代码考虑后期的扩展，其中有95%的代码预留向后扩展
    Module.getRealPath = function (path) {
        var
                config = require.config,
                map = config.map || {};

        for (var i in map) {
            if (map.hasOwnProperty(i) && common.inArray(map[i], path)) {
                path = i;
                break;
            }
        }

        if(path){
            path+=".js";
        }

        return this.addRevision(path);

    };

    //发布环境中添加版本号 
    Module.addRevision = function(path) {
        if(require.revision){
            var arr   = path.split('/'),
                loop  = arr.length,
                new_p = ''

            while(arr.length) {
                new_p = arr.join('/')
                if (require.revision[new_p]) {
                    path = path.replace(new_p, require.revision[new_p])
                    break
                }
                arr.shift()
            }
        }

        return path
    }

    /**
     * 获取依赖关系数组
     * @param   {Array}  deps 依赖模块的关系数组
     * @method
     * @returns {Array}  合并后的依赖关系数组
     */
    Module.getDeps = function (deps) {
        var d = [];

        common.each(common.makeArray(deps), function (dep) {
            dep = Module.getModuleName(dep);
            d.push(dep);
            d.push.apply(d, Module.getDeps(require.config.deps[dep]));
        });
        return d;
    };

    Module.require = function (paths, callback) {
        Module('_r_' + requireid++, function () {
            var depthmodules = [];

            common.each(common.makeArray(paths), function (path) {
                depthmodules.push(Module.getModule(path));
            });

            common.isFunction(callback) && callback.apply(window, depthmodules);
        }, paths, true);
    };
    require = Module.require;

    require.getModule = Module.getModule;

    require.config = {
        baseurl: '',
        rules: [],
        charset: 'utf-8',
        deps: {},
        attrs: {}
    };



    /**
     * 合并加载配置文件
     * @param {Object} config 自定义的配置信息
     */
    require.mergeConfig = function (config) {
        var _config = require.config;

        common.each(config, function (c, i) {
            var tmp = _config[i];

            if (i == 'deps') {
                common.each(c, function (dep, name) {
                    tmp[name] = dep;
                });
            } else if (common.isArray(c)) {
                tmp.push.apply(tmp, c);
            } else {
                tmp = c;
            }

            _config[i] = tmp;
        });
    };


    define = function (modulename, callback, depth) {
        if (common.isFunction(depth)) {
            var _callback = callback;
            callback = depth;
            depth = _callback;
        }

        modulename = Module.getModuleName(modulename);
        depth = depth || require.config.deps[modulename];

        Module(modulename, callback, depth);
    };

    X.prototype.require = require;
    X.prototype.define = define;

})(window, document);


(function (X) {
    //bind event to object
    var on = function (event, callback, context) {
        var callbacks = this._callbacks || (this._callbacks = {});
        var events = callbacks[event] || (callbacks[event] = []);
        events.push({
            callback: callback,
            context: context
        });
    };

    //trigger every function in current event type
    var trigger = function (event) {
        var args = Array.prototype.slice.call(arguments, 1);
        var callbacks = this._callbacks || {};
        var events = callbacks[event] || [];
        for (var i = 0; i < events.length; i++) {
            events[i].callback.apply(events[i].context || this, args);
        }
    };

    var off = function (event, callback, context) {
        if (!callback && !context) {
            delete this._callbacks[event];
        }
        var events = this._callbacks[event] || [];
        for (var i = 0; i < events.length; i++) {
            if (!(callback && events[i].callback !== callback || context && events[i].context !== context)) {
                events.splice(i, 1);
            }
        }
    };

    var resObj = {
        on: on,
        off: off,
        trigger: trigger
    };

    X.prototype.event = resObj;
})(this.Xbn);


(function (win,X){ 
	/** 
    *@param {string} url 完整的URL地址 
    *@returns {object} 自定义的对象 
    *@description 用法示例：var myURL = parseURL('http://abc.com:8080/dir/index.html?id=255&m=hello#top');
    myURL.file='index.html' 

    myURL.hash= 'top' 

    myURL.host= 'abc.com' 

    myURL.query= '?id=255&m=hello' 

    myURL.params= Object = { id: 255, m: hello } 

    myURL.path= '/dir/index.html' 

    myURL.segments= Array = ['dir', 'index.html'] 

    myURL.port= '8080' 

    myURL.protocol= 'http' 

    myURL.source= 'http://abc.com:8080/dir/index.html?id=255&m=hello#top' 

    */

    var prototype = X.prototype;   

    prototype.parseURL = function (url) {
		var a = document.createElement('a');
		a.href = url;
		return {
			source: url,
			protocol: a.protocol.replace(':', ''),
			host: a.hostname,
			port: a.port,
			query: a.search,
			params: (function () {
				var ret = {},
					seg = a.search.replace(/^\?/, '').split('&'),
					len = seg.length,
					i = 0,
					s;
				for (; i < len; i++) {
					if (!seg[i]) {
						continue;
					}
					s = seg[i].split('=');
					ret[s[0]] = s[1];
				}
				return ret;
			})(),
			filterXSSForUrl:(function(url){
				url=unescape(url);
		        var result = true;
		        $.each(['<', '>', '(', ')'], function(key, val){
		            if(url.indexOf(val) >= 0){
		                result = false;
		            }
		        });
		        return result;
		    })(url),
			file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
			hash: a.hash.replace('#', ''),
			path: a.pathname.replace(/^([^\/])/, '/$1'),
			relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],
			segments: a.pathname.replace(/^\//, '').split('/')
		};
	};

	var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	var base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
		52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
		15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
		41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);

	//64加密算法

	prototype.base64encode = function (str) {
		var out, i, len;
		var c1, c2, c3;

		len = str.length;
		i = 0;
		out = "";
		while (i < len) {
			c1 = str.charCodeAt(i++) & 0xff;
			if (i == len) {
				out += base64EncodeChars.charAt(c1 >> 2);
				out += base64EncodeChars.charAt((c1 & 0x3) << 4);
				out += "==";
				break;
			}
			c2 = str.charCodeAt(i++);
			if (i == len) {
				out += base64EncodeChars.charAt(c1 >> 2);
				out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
				out += base64EncodeChars.charAt((c2 & 0xF) << 2);
				out += "=";
				break;
			}
			c3 = str.charCodeAt(i++);
			out += base64EncodeChars.charAt(c1 >> 2);
			out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
			out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
			out += base64EncodeChars.charAt(c3 & 0x3F);
		}
		return out;
	}

	//64解密算法
	prototype.base64decode = function (str) {
		var c1, c2, c3, c4;
		var i, len, out;

		len = str.length;
		i = 0;
		out = "";
		while (i < len) {
			/* c1 */
			do {
				c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
			} while (i < len && c1 == -1);
			if (c1 == -1)
				break;

			/* c2 */
			do {
				c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
			} while (i < len && c2 == -1);
			if (c2 == -1)
				break;

			out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

			/* c3 */
			do {
				c3 = str.charCodeAt(i++) & 0xff;
				if (c3 == 61)
					return out;
				c3 = base64DecodeChars[c3];
			} while (i < len && c3 == -1);
			if (c3 == -1)
				break;

			out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));

			/* c4 */
			do {
				c4 = str.charCodeAt(i++) & 0xff;
				if (c4 == 61)
					return out;
				c4 = base64DecodeChars[c4];
			} while (i < len && c4 == -1);
			if (c4 == -1)
				break;
			out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
		}
		return out;
	}

	prototype.getRequest = function (args) {
		var theRequest = {},
                url = win.location.search,
                strs = '',
                str = '';
            if (typeof args == 'string' && args.indexOf("=") != -1) {
                str = args;
            } else if (typeof args != 'undefined') {
                return theRequest;
            } else {
                if (url.indexOf("?") != -1) {
                    str = url.substr(1);
                } else {
                    return theRequest;
                }
            }
            strs = str.split("&");
            for (var i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
            }
            return theRequest;
	}

	prototype.toUrlPara = function (para) {
		var result = [];
		for(var key in para){
			if(para.hasOwnProperty(key)){
				result.push(key);
				result.push("=");
				result.push(para[key]);
				result.push("&");				
			}
		}		
		if(result.length>0){
			result.length = result.length -1;
		}
		return result.join("");
	}
})(window,this.Xbn);
/*
   定义了数据模型
*/

(function (X){ 
	Object.create = Object.create || function(o){
        function F(){};

        F.prototype = o;
        return new F();
    };


    


    

    /****************************************************************
        原型，实例方法，所有对象共享
    *****************************************************************/

    var ModelInstance = function(){};

    //是否新实例
    ModelInstance.prototype.newRecord = true;

    //哪些属性发生了改变
    ModelInstance.prototype.changed = null;

    //初始化对象，options包含了当前对象特有的配置信息
    ModelInstance.prototype.init = function(attributes,options){
        var attrs = attributes || {};
        this.options = options || {};
        if (this.options.parse) attrs = this.parse(attrs, options) || {};

        this.attributes = attrs;

        this.set(attrs,options);

        this.changed = {};
    };


    // Get the value of an attribute.
    ModelInstance.prototype.get = function(attr) {
        return this.attributes[attr];
    };


    // Returns `true` if the attribute contains a value that is not null or undefined.
    ModelInstance.prototype.has = function(attr){
        return this.get(attr)!=null;
    };




    // Set a hash of model attributes on the object, firing `"change"`. This is
    // the core primitive operation of a model, updating the data and notifying
    // anyone who needs to know about the change in state. The heart of the beast.
    ModelInstance.prototype.set = function(key,value,options){
        if (key == null) return this;

        // Handle both `"key", value` and `{key: value}` -style arguments.
        var attrs;
        if (typeof key === 'object') {
          attrs = key;
          options = val;
        } else {
          (attrs = {})[key] = val;
        }

        options || (options = {});

        // Run validation.
        if (!validate(this,attrs, options)) return false;

        // Extract attributes and options.
        var unset      = options.unset;
        var silent     = options.silent;
        var changes    = [];
        var changing   = this._changing;
        this._changing = true;

        if (!changing) {
            this._previousAttributes = X.prototype.clone(this.attributes);
            this.changed = {};
        }

        var current = this.attributes;
        var changed = this.changed;
        var prev    = this._previousAttributes;

        // For each `set` attribute, update or delete the current value.
        for (var attr in attrs) {
            var val = attrs[attr];
            if (!this.equal(current[attr], val)) changes.push(attr);
            if (!this.equal(prev[attr], val)) {
              changed[attr] = val;
            } else {
              delete changed[attr];
            }
            unset ? delete current[attr] : current[attr] = val;
        }

        // Update the `id`.
        if (this.idAttribute in attrs) this.id = this.get(this.idAttribute);

        // Trigger all relevant attribute changes.
        if (!silent) {
            if (changes.length) this._pending = options;
            for (var i = 0; i < changes.length; i++) {
              this.trigger('change:' + changes[i], this, current[changes[i]], options);
            }
        }

        // You might be wondering why there's a `while` loop here. Changes can
        // be recursively nested within `"change"` events.
        if (changing) return this;
            if (!silent) {
            while (this._pending) {
              options = this._pending;
              this._pending = false;
              this.trigger('change', this, options);
            }
        }
        this._pending = false;
        this._changing = false;
        return this;

    };


    ModelInstance.prototype.clone = function(){
        return X.prototype.clone(this);
    };


    ModelInstance.prototype.equal = function(a,b,aStack,bStack){
        // Identical objects are equal. `0 === -0`, but they aren't identical.
        // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
        if (a === b) return a !== 0 || 1 / a === 1 / b;
        // A strict comparison is necessary because `null == undefined`.
        if (a == null || b == null) return a === b;
        // Compare `[[Class]]` names.
        var className2 = {}.toString.call(a);
        if (className2 !== {}.toString.call(b)) return false;
        switch (className2) {
          // Strings, numbers, regular expressions, dates, and booleans are compared by value.
          case '[object RegExp]':
          // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
          case '[object String]':
            // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
            // equivalent to `new String("5")`.
            return '' + a === '' + b;
          case '[object Number]':
            // `NaN`s are equivalent, but non-reflexive.
            // Object(NaN) is equivalent to NaN
            if (+a !== +a) return +b !== +b;
            // An `egal` comparison is performed for other numeric values.
            return +a === 0 ? 1 / +a === 1 / b : +a === +b;
          case '[object Date]':
          case '[object Boolean]':
            // Coerce dates and booleans to numeric primitive values. Dates are compared by their
            // millisecond representations. Note that invalid dates with millisecond representations
            // of `NaN` are not equivalent.
            return +a === +b;
        }

        var areArrays = className2 === '[object Array]';
        if (!areArrays) {
          if (typeof a != 'object' || typeof b != 'object') return false;

          // Objects with different constructors are not equivalent, but `Object`s or `Array`s
          // from different frames are.
          var aCtor = a.constructor, bCtor = b.constructor;
          if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                                   _.isFunction(bCtor) && bCtor instanceof bCtor)
                              && ('constructor' in a && 'constructor' in b)) {
            return false;
          }
        }

        // Assume equality for cyclic structures. The algorithm for detecting cyclic
        // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

        // Initializing stack of traversed objects.
        // It's done here since we only need them for objects and arrays comparison.
        aStack = aStack || [];
        bStack = bStack || [];
        var length = aStack.length;
        while (length--) {
            // Linear search. Performance is inversely proportional to the number of
            // unique nested structures.
            if (aStack[length] === a) return bStack[length] === b;
        }

        // Add the first object to the stack of traversed objects.
        aStack.push(a);
        bStack.push(b);

        // Recursively compare objects and arrays.
        if (areArrays) {
            // Compare array lengths to determine if a deep comparison is necessary.
            length = a.length;
            if (length !== b.length) return false;
            // Deep compare the contents, ignoring non-numeric properties.
            while (length--) {
                if (!this.equal(a[length], b[length], aStack, bStack)) return false;
            }
        } else {
            /*
              // Deep compare objects.
              var keys = _.keys(a), key;
              length = keys.length;
              // Ensure that both objects contain the same number of properties before comparing deep equality.
              if (_.keys(b).length !== length) return false;
              while (length--) {
                // Deep compare each member
                key = keys[length];
                if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
              }
            */

            //调用对象自身的比较方法
            if(a.equal && X.isFunction(a.equal) && a.constructor==b.constructor){
                return a.equal(b);
            }
            else{
                return false;
            }
        }
        // Remove the first object from the stack of traversed objects.
        aStack.pop();
        bStack.pop();
        return true;
    };


    ModelInstance.prototype.toJSON = function(){
        return X.clone(this.attributes);
    };

    // Fetch the model from the server, merging the response with the model's
    // local attributes. Any changed attributes will trigger a "change" event.
    ModelInstance.prototype.fetch = function(options){
        options = X.prototype.extend({parse: true}, options);
        var model = this;
        var success = options.success;
        options.success = function(resp) {
            var serverAttrs = options.parse ? model.parse(resp, options) : resp;
            if (!model.set(serverAttrs, options)){ return false; }
            if (success) { success.call(options.context, model, resp, options); }

            model.trigger('fetch', model, resp, options);
        };

        var optObj = {};
        optObj.url = Model.options.url;
        optObj.data = options.data ;
        optObj.callback = options.success;


        wrapError(this, options);

        return X.requestRemote(optObj);
    };

    // 将新创建的数据保存到服务器
    ModelInstance.prototype.createRemote = function(key,val,options){
        // Handle both `"key", value` and `{key: value}` -style arguments.
        var attrs;
        if (key == null || typeof key === 'object') {
            attrs = key;
            options = val;
        } else {
            (attrs = {})[key] = val;
        }

        options = X.prototype.extend({validate: true, parse: true}, options);
        var wait = options.wait;

        // If we're not waiting and attributes exist, save acts as
        // `set(attr).save(null, opts)` with validation. Otherwise, check if
        // the model will be valid when the attributes, if any, are set.
        if (attrs && !wait) {
            if (!this.set(attrs, options)) return false;
        } else if (!this._validate(attrs, options)) {
            return false;
        }

        // After a successful server-side save, the client is (optionally)
        // updated with the server-side state.
        var model = this;
        var success = options.success;
        var attributes = this.attributes;
        options.success = function(resp) {
            // Ensure attributes are restored during synchronous saves.
            model.attributes = attributes;
            var serverAttrs = options.parse ? model.parse(resp, options) : resp;
            if (wait) serverAttrs = X.prototype.extend({}, attrs, serverAttrs);
            if (serverAttrs && !model.set(serverAttrs, options)) return false;
            if (success) success.call(options.context, model, resp, options);
            model.trigger('createRemote', model, resp, options);
        };
        wrapError(this, options);

        // Set temporary attributes if `{wait: true}` to properly find new ids.
        if (attrs && wait) this.attributes = X.prototype.extend({}, attributes, attrs);

        var optObj = {};
        optObj.url = this.clazz.option.service.createUrl; //数据模型公共服务地址
        optObj.data = this.attributes;
        optObj.callback = options.success;
        optObj.type = options.type || (optObj.data?"POST":"GET");


        wrapError(this, options);

        // Restore attributes.
        this.attributes = attributes;

        return X.prototype.loadRemoteData(optObj);

    };  


    //从数组删除
    ModelInstance.prototype.destroy = function(){
        debugger;
        delete this.clazz.redcords[this.clazz.get(this.idAttribute)];
        return this;
    };

    //更新到数组
    ModelInstance.prototype.update = function(){

        this.clazz.records[this.get(this.clazz.idAttribute)] = this;
        return this;
    };
    

    // Wrap an optional error callback with a fallback error event.
    var wrapError = function(model, options) {
        var error = options.error;
        options.error = function(resp) {
            if (error) error.call(options.context, model, resp, options);
            model.trigger('error', model, resp, options);
        };
    };


    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
    var validate = function(model,attrs, options) {
      if (!options.validate || !model.validate) return true;
      attrs = X.prototype.extend({}, model.attributes, attrs);
      var error = model.validationError = model.validate(attrs, options) || null;
      if (!error) return true;
      model.trigger('invalid', this, error, X.prototype.extend(options, {validationError: error}));
      return false;
    };



    /***********************************************
      构造新对象时，以此对象作基，扩展生成新对象。
      主要存储数据的元数据、服务地址等（查询方案也可以考虑置于此）
    ************************************************/

    var ModelClazz = function(option){

        var defaultOption = {
                meta : [],
                services : {},
                idAttribute : "id"
            };
        
        option = option || {};
       
        option = X.prototype.extend(defaultOption,option);

        //当前模型中缓存的对象

        var Model = function(option){
            this.option = option;
        };


        Model.prototype.getIds = function(data){
            var postData = [];

            if(!X.prototype.isArray(data)){
                postData.push(data);
            }
            else{
                postData = data;
            }

            var ids = [];
            for (var i = 0; i < postData.length ; i++){                ;
                ids.push(postData[i][this.option.idAttribute]);
            }
            return ids;
        };
      
        /**
        @method find 从服务器加载一条数据，根据ID
        @param options {id:id,callback:callback} 传入id,及回调函数
        */
        Model.prototype.find = function(options){
            var that = this;
            var id = options.data && options.data[this.option.idAttribute];
            var callback = options.callback;
            var success = function(result){
                    if(result && result.statusCode == "2000000"){
                        var data = result.data[0];
                        var record = that.create(data,that.option);
                        record.newRecord = false;                        
                        callback && callback(record);
                    }
                    else{
                        callback && callback(result);
                    }
                }

            var url = this.option["service"]["find"] || options["url"];
            url += id;
            var option = {
                callback:success,
                url: url,
                type :"GET" || options["type"]
            }

            this.getFromServer(option);
        };

        Model.prototype.populate = function(values){
            var records = {};
            for(var i=0, il=values.length ; i<il ; i++ ){
                var record = this.create(values[i],option);
                record.newRecord = false;
                records[record.attributes[this.option.idAttribute]] = record;
            }

            return records;
        };

        // 根据数据构建一个数据模型对象
        Model.prototype.create = function(){
            var instance = Object.create(ModelInstance.prototype);
            instance.clazz = this;
            instance.init.apply(instance,arguments);
            return instance;
        };


        Model.prototype.getFromServer = function(option){
            var optObj = {};
            optObj.url = option["url"] || this.option["service"].query;
            optObj.data = option["data"] || {};
            optObj.dataType = "JSON";
            optObj.msg = '';
            optObj.callback = option["callback"] || function(){} ;
            optObj.type = option["type"] || "GET" ;

            X.prototype.loadData(optObj);
        };


        // 根据参数条件加载一批数据模型
        Model.prototype.load = function(postData,callback){
        	var that = this;
            var option = {data:postData,callback:function(result){
                if(result && result.statusCode == "2000000"){
                    var data = result.data;
                    var ol = that.populate(data);
                    callback && callback(ol);
                }
                else{
                    callback && callback(result);
                }
            }};

            this.getFromServer(option);
        };

        Model.prototype.m_delete = function(options){
            var that = this;

            var postData = this.getIds(options.data);

            var callback = options.callback;

            var url = this.option["service"]["delete"] || options["url"];
            //url += id;

            var success = function(result){
                if(result && result.statusCode == "2000000"){
                    var data = result.data[0];
                    callback && callback(data);
                }
                else{
                    callback && callback(result);
                }
            };

            var option = {
                callback:success,
                url: url,
                data : postData,
                type :"DELETE" || options["type"]
            }

            this.getFromServer(option);

        };

        return new Model(option);
    };




    var ModelManager = (function(){

        var models = {};

        var getModel = function(modelName,option){
            if(models[modelName]){
                return models[modelName];
            }
            else{
                var m = new ModelClazz(option);
                models[modelName] = m;
                return m;
            }
        };


        return {
            getModel : getModel
        };
    }());





    X.prototype.extend(ModelClazz,X.event);

    X.prototype.extend(ModelInstance.prototype,X.event);


	    /*
	* 树节点数据模型
	*/
	var TreeNode = (function () {
	    function TreeNode(o, is_root, TreeNode_class) {
	        if (is_root == null) {
	            is_root = false;
	        }
	        if (TreeNode_class == null) {
	            TreeNode_class = TreeNode;
	        }
	        this.setData(o);
	        this.children = [];
	        this.parent = null;
	        if (is_root) {
	            this.id_mapping = {};
	            this.tree = this;
	            this.TreeNode_class = TreeNode_class;
	        }
	    }

	    TreeNode.prototype.setData = function (o) {
	        var key, value, _results;
	        if (typeof o !== 'object') {
	            return this.name = o;
	        } else {
	            _results = [];
	            for (key in o) {
	                value = o[key];
	                if (key === 'label') {
	                    _results.push(this.name = value);
	                }else if(key==='code'){
	                    _results.push(this.code = value);
	                } else {
	                    _results.push(this[key] = value);
	                }
	            }
	            return _results;
	        }
	    };

	    TreeNode.prototype.initFromData = function (data) {
	        var addChildren, addTreeNode,
	    _this = this;
	        addTreeNode = function (TreeNode_data) {
	            _this.setData(TreeNode_data);
	            if (TreeNode_data.children) {
	                return addChildren(TreeNode_data.children);
	            }
	        };
	        addChildren = function (children_data) {
	            var child, TreeNode, _i, _len;
	            for (_i = 0, _len = children_data.length; _i < _len; _i++) {
	                child = children_data[_i];
	                TreeNode = new _this.tree.TreeNode_class('');
	                TreeNode.initFromData(child);
	                _this.addChild(TreeNode);
	            }
	            return null;
	        };
	        addTreeNode(data);
	        return null;
	    };

	    /*
	    Create tree from data.

	    Structure of data is:
	    [
	    {
	    label: 'TreeNode1',
	    children: [
	    { label: 'child1' },
	    { label: 'child2' }
	    ]
	    },
	    {
	    label: 'TreeNode2'
	    }
	    ]
	    */


	    TreeNode.prototype.loadFromData = function (data) {
	        var TreeNode, o, _i, _len;
	        this.removeChildren();
	        for (_i = 0, _len = data.length; _i < _len; _i++) {
	            o = data[_i];
	            TreeNode = new this.tree.TreeNode_class(o);
	            this.addChild(TreeNode);
	            if (typeof o === 'object' && o.children) {
	                TreeNode.loadFromData(o.children);
	            }
	        }
	        return null;
	    };

	    /*
	    Add child.

	    tree.addChild(
	    new TreeNode('child1')
	    );
	    */


	    TreeNode.prototype.addChild = function (TreeNode) {
	        this.children.push(TreeNode);
	        return TreeNode._setParent(this);
	    };

	    /*
	    Add child at position. Index starts at 0.

	    tree.addChildAtPosition(
	    new TreeNode('abc'),
	    1
	    );
	    */


	    TreeNode.prototype.addChildAtPosition = function (TreeNode, index) {
	        this.children.splice(index, 0, TreeNode);
	        return TreeNode._setParent(this);
	    };

	    TreeNode.prototype._setParent = function (parent) {
	        this.parent = parent;
	        this.tree = parent.tree;
	        return this.tree.addTreeNodeToIndex(this);
	    };

	    /*
	    Remove child. This also removes the children of the TreeNode.

	    tree.removeChild(tree.children[0]);
	    */


	    TreeNode.prototype.removeChild = function (TreeNode) {
	        TreeNode.removeChildren();
	        return this._removeChild(TreeNode);
	    };

	    TreeNode.prototype._removeChild = function (TreeNode) {
	        this.children.splice(this.getChildIndex(TreeNode), 1);
	        return this.tree.removeTreeNodeFromIndex(TreeNode);
	    };

	    /*
	    Get child index.

	    var index = getChildIndex(TreeNode);
	    */


	    TreeNode.prototype.getChildIndex = function (TreeNode) {
	        return $.inArray(TreeNode, this.children);
	    };

	    /*
	    Does the tree have children?

	    if (tree.hasChildren()) {
	    //
	    }
	    */


	    TreeNode.prototype.hasChildren = function () {
	        return this.children.length !== 0;
	    };

	    TreeNode.prototype.isFolder = function () {
	        return this.hasChildren() || this.load_on_demand;
	    };

	    /*
	    Iterate over all the TreeNodes in the tree.

	    Calls callback with (TreeNode, level).

	    The callback must return true to continue the iteration on current TreeNode.

	    tree.iterate(
	    function(TreeNode, level) {
	    console.log(TreeNode.name);

	    // stop iteration after level 2
	    return (level <= 2);
	    }
	    );
	    */


	    TreeNode.prototype.iterate = function (callback) {
	        var _iterate,
	    _this = this;
	        _iterate = function (TreeNode, level) {
	            var child, result, _i, _len, _ref1;
	            if (TreeNode.children) {
	                _ref1 = TreeNode.children;
	                for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
	                    child = _ref1[_i];
	                    result = callback(child, level);
	                    if (_this.hasChildren() && result) {
	                        _iterate(child, level + 1);
	                    }
	                }
	                return null;
	            }
	        };
	        _iterate(this, 0);
	        return null;
	    };

	    /*
	    Move TreeNode relative to another TreeNode.

	    Argument position: Position.BEFORE, Position.AFTER or Position.Inside

	    // move TreeNode1 after TreeNode2
	    tree.moveTreeNode(TreeNode1, TreeNode2, Position.AFTER);
	    */


	    TreeNode.prototype.moveTreeNode = function (moved_TreeNode, target_TreeNode, position) {
	        if (moved_TreeNode.isParentOf(target_TreeNode)) {
	            return;
	        }
	        moved_TreeNode.parent._removeChild(moved_TreeNode);
	        if (position === Position.AFTER) {
	            return target_TreeNode.parent.addChildAtPosition(moved_TreeNode, target_TreeNode.parent.getChildIndex(target_TreeNode) + 1);
	        } else if (position === Position.BEFORE) {
	            return target_TreeNode.parent.addChildAtPosition(moved_TreeNode, target_TreeNode.parent.getChildIndex(target_TreeNode));
	        } else if (position === Position.INSIDE) {
	            return target_TreeNode.addChildAtPosition(moved_TreeNode, 0);
	        }
	    };

	    /*
	    Get the tree as data.
	    */


	    TreeNode.prototype.getData = function () {
	        var getDataFromTreeNodes,
	    _this = this;
	        getDataFromTreeNodes = function (TreeNodes) {
	            var data, k, TreeNode, tmp_TreeNode, v, _i, _len;
	            data = [];
	            for (_i = 0, _len = TreeNodes.length; _i < _len; _i++) {
	                TreeNode = TreeNodes[_i];
	                tmp_TreeNode = {};
	                for (k in TreeNode) {
	                    v = TreeNode[k];
	                    if ((k !== 'parent' && k !== 'children' && k !== 'element' && k !== 'tree') && Object.prototype.hasOwnProperty.call(TreeNode, k)) {
	                        tmp_TreeNode[k] = v;
	                    }
	                }
	                if (TreeNode.hasChildren()) {
	                    tmp_TreeNode.children = getDataFromTreeNodes(TreeNode.children);
	                }
	                data.push(tmp_TreeNode);
	            }
	            return data;
	        };
	        return getDataFromTreeNodes(this.children);
	    };

	    TreeNode.prototype.getTreeNodeByName = function (name) {
	        var result;
	        result = null;
	        this.iterate(function (TreeNode) {
	            if (TreeNode.name === name) {
	                result = TreeNode;
	                return false;
	            } else {
	                return true;
	            }
	        });
	        return result;
	    };

        TreeNode.prototype.getTreeNodeByCode = function (code) {
            var result;
            result = null;
            this.iterate(function (TreeNode) {
                if (TreeNode.code === code) {
                    result = TreeNode;
                    return false;
                } else {
                    return true;
                }
            });
            return result;
        };
	    TreeNode.prototype.addAfter = function (TreeNode_info) {
	        var child_index, TreeNode;
	        if (!this.parent) {
	            return null;
	        } else {
	            TreeNode = new this.tree.TreeNode_class(TreeNode_info);
	            child_index = this.parent.getChildIndex(this);
	            this.parent.addChildAtPosition(TreeNode, child_index + 1);
	            return TreeNode;
	        }
	    };

	    TreeNode.prototype.addBefore = function (TreeNode_info) {
	        var child_index, TreeNode;
	        if (!this.parent) {
	            return null;
	        } else {
	            TreeNode = new this.tree.TreeNode_class(TreeNode_info);
	            child_index = this.parent.getChildIndex(this);
	            this.parent.addChildAtPosition(TreeNode, child_index);
	            return TreeNode;
	        }
	    };

	    TreeNode.prototype.addParent = function (TreeNode_info) {
	        var child, new_parent, original_parent, _i, _len, _ref1;
	        if (!this.parent) {
	            return null;
	        } else {
	            new_parent = new this.tree.TreeNode_class(TreeNode_info);
	            new_parent._setParent(this.tree);
	            original_parent = this.parent;
	            _ref1 = original_parent.children;
	            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
	                child = _ref1[_i];
	                new_parent.addChild(child);
	            }
	            original_parent.children = [];
	            original_parent.addChild(new_parent);
	            return new_parent;
	        }
	    };

	    TreeNode.prototype.remove = function () {
	        if (this.parent) {
	            this.parent.removeChild(this);
	            return this.parent = null;
	        }
	    };

	    TreeNode.prototype.append = function (TreeNode_info) {
	        var TreeNode;
	        TreeNode = new this.tree.TreeNode_class(TreeNode_info);
	        this.addChild(TreeNode);
	        return TreeNode;
	    };

	    TreeNode.prototype.prepend = function (TreeNode_info) {
	        var TreeNode;
	        TreeNode = new this.tree.TreeNode_class(TreeNode_info);
	        this.addChildAtPosition(TreeNode, 0);
	        return TreeNode;
	    };

	    TreeNode.prototype.isParentOf = function (TreeNode) {
	        var parent;
	        parent = TreeNode.parent;
	        while (parent) {
	            if (parent === this) {
	                return true;
	            }
	            parent = parent.parent;
	        }
	        return false;
	    };

	    TreeNode.prototype.getLevel = function () {
	        var level, TreeNode;
	        level = 0;
	        TreeNode = this;
	        while (TreeNode.parent) {
	            level += 1;
	            TreeNode = TreeNode.parent;
	        }
	        return level;
	    };

	    TreeNode.prototype.getTreeNodeById = function (TreeNode_id) {
	        return this.id_mapping[TreeNode_id];
	    };

	    TreeNode.prototype.addTreeNodeToIndex = function (TreeNode) {
	        if (TreeNode.id != null) {
	            return this.id_mapping[TreeNode.id] = TreeNode;
	        }
	    };

	    TreeNode.prototype.removeTreeNodeFromIndex = function (TreeNode) {
	        if (TreeNode.id != null) {
	            return delete this.id_mapping[TreeNode.id];
	        }
	    };

	    TreeNode.prototype.removeChildren = function () {
	        var _this = this;
	        this.iterate(function (child) {
	            _this.tree.removeTreeNodeFromIndex(child);
	            return true;
	        });
	        return this.children = [];
	    };

	    TreeNode.prototype.getPreviousSibling = function () {
	        var previous_index;
	        if (!this.parent) {
	            return null;
	        } else {
	            previous_index = this.parent.getChildIndex(this) - 1;
	            if (previous_index >= 0) {
	                return this.parent.children[previous_index];
	            } else {
	                return null;
	            }
	        }
	    };

	    TreeNode.prototype.getNextSibling = function () {
	        var next_index;
	        if (!this.parent) {
	            return null;
	        } else {
	            next_index = this.parent.getChildIndex(this) + 1;
	            if (next_index < this.parent.children.length) {
	                return this.parent.children[next_index];
	            } else {
	                return null;
	            }
	        }
	    };

	    return TreeNode;

	})();


    X.prototype.model = {
        create : function(modelName,option){  return ModelManager.getModel(modelName,option);},
        createTreeNode : function (o, is_root, TreeNode_class) {
            return new TreeNode(o, is_root, TreeNode_class);
        } 
    };


})(this.Xbn);
 
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
            this.view.el.off(eName, selector).on(eName, selector, function () {
                var context = $.extend(eContext, {
                    that: this
                });
                eContext[method].call(context);
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
(function (X){ 

    function i18nReplace(elem,text){
        if(elem.length>0){
            var type = elem.get(0).tagName.toLowerCase();
            switch(type){
                case "input":
                    if(elem.attr("type")=="button"){
                        elem.val(text);    
                    }
                break;
                default:
                    elem.html(text);
                break;
            }    
        }
        
    }

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
            //资源文件
            this.res = conf.res ;             
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

            //处理完多语言，再添加到界面中
            if(X.prototype.config.env.production){
                $(toElem).loadTemplate(tpl, data,setting);
            }else{
                this.i18n(tpl,function(){ 
                    $(toElem).loadTemplate(tpl, data,setting);
                });
            }
                   
        },
        //视图内部元素定位辅助函数
        find: function (selector) {
            return this.el.find(selector);
        },
        //渲染函数
        render: function (data,callback) {
            if(arguments.length==1){
                callback = data;
                data = {};
            }

            var success = function(){
                 callback();
            };

            var that = this;

            var elem = $("<div/>");

            elem.loadTemplate(this.url,data,{success:function(){  
                if(X.prototype.config.env.production){
                    that.el.html(elem.html());
                    success();
                }
                else{
                    that.i18n(elem,function(){
                        that.el.html(elem.html());                      
                        success();
                    }); 
                }                      
            }});   

            return that;


            //return this.el.loadTemplate(this.url, data,{success:success});
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
        },
        //国际化
        i18n : function (elem,callback) {            
            if(this.res){
                $.i18n.properties({
                    name : this.res,
                    mode : "map",
                    cache : true,
                    language : "en-US",
                    callback : function () {
                        elem.find("[data-i18n]").each(function (index,element){
                            i18nReplace($(this),$.i18n.prop($(this).data("i18n")))
                        });

                        elem.find("[placeholder]").each(function (index,element){
                            var that = $(this);
                            that.attr("placeholder",$.i18n.prop(that.attr("placeholder")));
                        });

                        if(X.prototype.isFunction(callback)){
                            callback();
                        }
                    }
                })
            }
        },
        /**
         * ie10 以上 会把placehoder的内容带到value中，这不会出错，
         * 但经过templateContainer一到手就变成真正的值了
         * 本来打算放在loadtemplate中的，因为这事loadtemplate的bug，但由于改了val没用，
         * 所以就在渲染完，再去掉好了，有可能还有其他好的解决方式
         */
        iePlaceholderBug: function($templateContainer) {
            if (navigator.userAgent.indexOf('Trident') > -1) {
                $templateContainer.find('textarea').each(function(i, item) {
                    var me = $(item)
                    me.attr('placeholder') === $.i18n.prop(me.html()) && me.val('')
                })  
            }
        }
    });
    proto.view = view;

})(this.Xbn);
;
(function (win, X) {



	var pro = X.prototype;


	var Router = function (uri) {

		var onPopstate = function (that) {
			$(win).on("popstate", function (event) {

				var state = event.originalEvent.state;

				that.callback(pro.getRequest(),state);

			});
		};

		var runCallback = function (that,state,mold) {
			//外部回调函数，调用时需要为Router类动态添加实例属性Callback
			(that.callback && that.callback(pro.getRequest(),state,mold));
		}

		this.init = function () {

			runCallback(this);

			//初始Histor变化监听器
			onPopstate(this);
		};

		this.setHistory = function (uri, title,state) {

			var doc_title = document.title;

			title ? document.title = title : document.title = doc_title;

			win.history.pushState(state, "", "?"+uri);
		};		
		

		this.run = function (url,title,state) {
			var mold = pro.getRequest();
			var mnew = pro.getRequest(url);
			if(JSON.stringify(mold)!=JSON.stringify(mnew)){	
				this.setHistory(url,title,state);
				runCallback(this,state,mold);					
			}			
		};

		this.back = function(){
			win.history.back();
		};
	};


	var RouterHash = (function (win) {
		var is_supports = (function() {			
			return 'onhashchange' in window && (document.documentMode === undefined || document.documentMode > 7);
		})(),
		
		//ie6,7不支持hashchange，用iframe来模拟并产生浏览器历史记录
		initIframe = function() {
			iframe = document.createElement('iframe');
			iframe.style.display = "none";
			iframe.setAttribute('tabindex', '-1');
			iframe.setAttribute('title', 'empty');
			document.body.appendChild(iframe);

			iframe_content = iframe.contentWindow;
			iframe.onload = function() {
				this.onload = null;
				loopTimeId || loopListen();
			}

			iframe.src = "javascript:false;";
		},

		get_hash = function(url) {
			url = url || location.href;
			return '#' + url.replace(/^[^#]*#?(.*)$/, '$1');
		},

		set_history = function(hash, history_hash) {
			var doc = iframe_content.document;
			if (hash !== history_hash) {
				doc.title = document.title;
				doc.open();
	            doc.close();
	            iframe_content.location.hash = hash;
			}
		},

		fixHashChange = function() {
			initIframe();
		},

		loopListen = function() {
			var hash = get_hash(),
				history_hash = get_hash(iframe_content.location.href);
			if (hash != last_hash) {
				last_hash = hash;
		        set_history(hash, history_hash);
		        hashChange(hash.replace('#', ''));
		    } else if (history_hash != last_hash) {
		        location.href = location.href.replace(/#.*/, '') + history_hash;
		    }

			loopTimeId = setTimeout(loopListen, loopTimer);
		};

		var iframe, iframe_content, loopTimeId = null, loopTimer = 100, last_hash = get_hash();

	
		var hashRouter = {};
		hashRouter.stop = function() {
			loopTimeId && clearTimeout(loopTimeId);
		}
		

		hashRouter.init = function (argument) {		
			var that = this;	
			if(is_supports){
				that.runCallback(get_hash());
				win.onhashchange = function() {
					that.runCallback(get_hash());
				}
			}
			else{
				fixHashChange(that);
			}
		}
		
		hashRouter.runCallback = function (hash) {
			var str = hash.replace("#!"),
				strs = str.split("="),
				theRequest = {};

            for (var i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
            }
            theRequest;

			(this.callback && this.callback(theRequest));
		};

		hashRouter.setHistory = function (argument) {
			if(is_supports){
				win.location.hash = "#!" + argument;
			}						
		};

		return hashRouter;

	})(win);


	Router.prototype = pro.createObject(pro);

	pro.router = new Router(pro.getRequest());

	//pro.router = RouterHash;	

})(window, this.Xbn);

/** 扩展系统方法，支持IE8，IE9 **/
(function () {

/****/
Array.prototype.forEach = Array.prototype.forEach || function(fun /*, thisp*/) {  
    var len = this.length;  
    if (typeof fun != "function")  
        throw new TypeError();  

    var thisp = arguments[1];  
    for (var i = 0; i < len; i++)  
    {  
        if (i in this)  
            fun.call(thisp, this[i], i, this);  
    }  
};  

})();