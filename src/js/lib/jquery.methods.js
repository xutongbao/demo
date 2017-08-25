;(function (_$) {

    var ROOT_PATH = window.X.config.PATH_FILE.path.prefixUrl;
    var userUrl = window.X.config.PATH_FILE.path.userUrl;
    var ruls = {
        iphone: function (value, element) {
            var length = value.length;
            return this.optional(element) || (length == 11 && /^(((13[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/.test(value));
        },
        email: function (value, element) {
            return this.optional(element) || /^([a-z0-9A-Z]+[-|_|\.]?)+[a-z0-9A-Z]@([a-z0-9A-Z]+(-[a-z0-9A-Z]+)?\.)+[a-zA-Z]{2,}$/.test(value)
        }/*1118*/
        ,
        name: function (value, element) {
            return this.optional(element) || /^[a-zA-Z0-9]\w{3,20}$/.test(value);
        }

    };

    //验证原密码是否正确
    _$.validator.addMethod("isOldpassword", function (value, element) {

        var flag = 1;

        _$.ajax({
            type: "POST",
            url: userUrl + "/user/verifyPassword",
            async: false,
            data: toStringify({
                'password': value,
                'userId':152
            }),
            success: function (data) {
                if (data.statusCode == '2000000') {
                    flag = data.data;
                }else{
                    flag = 0;
                }
            }
        });

        if (flag == 1) {
            return true;
        } else if(flag == 0){
            return false;
        }

    }, '您的原密码输入不正确！');
    //验证手机是否被注册
    _$.validator.addMethod("isIphone", function (value, element) {

        var flag = 1;

        _$.ajax({
            type: "POST",
            url: userUrl + "/user/check",
            async: false,
            data: toStringify({
                'mobile': value
            }),
            success: function (data) {
                if (data.statusCode == '2000000') {
                    flag = data.data;
                }
            }
        });

        if (flag == 1) {
            return false;
        } else if(flag == 0){
            return true;
        }

    }, '您的手机号已被注册！');
    //验证手机是否被注册
    _$.validator.addMethod("isNoIphone", function (value, element) {

        var flag = 1;

        _$.ajax({
            type: "POST",
            url: userUrl + "/user/check",
            async: false,
            data: toStringify({
                'mobile': value
            }),
            success: function (data) {
                if (data.statusCode == '2000000') {
                    flag = data.data;
                }
            }
        });

        if (flag == 0) {
            return false;
        } else if(flag == 1){
            return true;
        }

    }, '您的手机号已被注册！');
    //验证证件号是否被注册
    _$.validator.addMethod("isLicenseNumber", function (value, element) {

        var flag = 1;

        _$.ajax({
            type: "POST",
            url: userUrl + "/company/licenseNumber",
            async: false,
            data: toStringify({
                'number': value
            }),
            success: function (data) {
                if (data.statusCode == '2000000') {
                    flag = data.data;
                }
            }
        });

        if (flag == 1) {
            return false;
        } else if(flag == 0){
            return true;
        }

    }, '您的证件号已被注册！');

    //验证多选框是否选中
    _$.validator.addMethod("isChecked", function (value,element) {
        return element.checked

    }, '请选择！');
    //验证邮箱是否被注册 POST /api/international/member/verifyEmail
    _$.validator.addMethod("isEmail", function (value, element, option) {

        var flag = 1;

        _$.ajax({
            type: "POST",
            url: ROOT_PATH + "/member/verifyEmail",
            async: false,
            data: JSON.stringify({
                'email': value
            }),
            success: function (data) {
                if (data.statusCode == '2000000') {
                    flag = data.data[0].code ;
                }
            }
        });
        if (flag == 1) {
            return false;
        } else if(flag == 0){
            return true;
        }

    }, '您的邮箱账号已被注册，<a class="js-regSign" data-type="email" href="javascript:;">使用邮箱账号登录！</a>');

    //验证用户名是否被注册
    _$.validator.addMethod("isUserName", function (value, element) {

        var flag = 1;

        _$.ajax({
            type: "POST",
            url: userUrl + "/user/check",
            async: false,
            data: toStringify({
                'userName': value
            }),
            success: function (data) {
                if (data.statusCode == '2000000') {
                    flag = data.data;
                }
            }
        });

        if (flag == 1) {
            return false;
        } else if(flag == 0){
            return true;
        }

    }, '您的用户名已被注册');
    //验证身份证是否被注册
    _$.validator.addMethod("checkPersonalId", function (value, element) {

        var flag = 1;

        _$.ajax({
            type: "GET",
            url: ROOT_PATH + "/member/checkPersonalId/"+value,
            async: false,
            success: function (data) {
                if (data.statusCode == '2000000') {
                    flag = data.data[0].code;
                }
            }
        });

        if (flag == 1) {
            return false;
        } else if(flag == 0){
            return true;
        }

    }, '您的身份证号已被注册');
         //验证手机号是否重复
    _$.validator.addMethod("verifyMobile", function (value, element) {

        var flag = 0;

        _$.ajax({
            type: "get",
            url: ROOT_PATH + "/member/verifyMobile/"+ value,
            async: false, //同步方法，如果用异步的话，flag永远为1
            success: function (data) {
                if (data.statusCode == '2000000') {
                   flag = data.data[0].code;
                }
            }
        });

        if (flag == 0) {
            return true;
        } else if(flag == 1){
            return false;
        }

    }, "手机号重复!");
    //验证用户名是否重复 
    _$.validator.addMethod("checkUserName", function (value, element) {

        var flag = 0;

        _$.ajax({
            type: "get",
            url: ROOT_PATH + "/member/checkUserName/"+ value,
            async: false, //同步方法，如果用异步的话，flag永远为1
            success: function (data) {
                if (data.statusCode == '2000000') {
                   flag = data.data[0].code;
                }
            }
        });

        if (flag == 0) {
            return true;
        } else if(flag == 1){
            return false;
        }

    }, "用户名重复!");
    //验证身份证是否超过16
    _$.validator.addMethod("isAdult", function (value, element) {
        var date = new Date();
        var year = date.getFullYear(); 
        var birthday_year = parseInt(value.substr(6,4));
        var userage= year - birthday_year;
        if (year - birthday_year < 16) {
            return false;
        }else{
            return true;
        }      

    }, "不能超过小于16!");

    //验证手机号码,用户名，邮箱是否会员
    _$.validator.addMethod("isnotIphone", function (value, element) {
        value = $.trim(value);
        var flag = true,
            source = {},
            uri = ROOT_PATH + "api/user/verify/",
            iphone = ruls.iphone.call(this, value, element),
            email = ruls.email.call(this, value, element),
            name = ruls.name.call(this, value, element);

        if (iphone) {
            source["mobile"] = value;
        } else if (email) {
            source["email"] = value;
        } else if (name) {
            source["name"] = value;
        }

        _$.ajax({
            type: "POST",
            url: uri,
            async: false,
            data: toStringify(source),
            success: function (data) {

                if (data.statusCode == '2000000') {
                    if (iphone) {
                        flag = data.data ? false : true;
                    } else
                    if (email) {
                        flag = data.data ? false : true;
                    } else
                    if (name) {
                        flag = data.data ? false : true;
                    }
                }
            }
        });
        return flag;
    }, '该账号不存在！');

    //验证登录密码
    _$.validator.addMethod("isPassWord", function (value, element) {
        var flag = 0;

        _$.ajax({
            type: "POST",
            url: ROOT_PATH + "api/user/pwd/verify",
            dataType: "json",
            async: false,
            data: toStringify({
                'id': store.get("user").id,
                'password': hex_md5(value)
            }),
            success: function (data) {
                if (data.statusCode == '2000000') {
                    return flag = data.data ? 1 : 0;
                }
            }
        });

        if (flag) {
            return true;
        } else {
            return false;
        }

    }, '密码错误!<em></em>');

    //验证登录密码
    _$.validator.addMethod("isNotPassWord", function (value, element) {
        var flag = 0;

        _$.ajax({
            type: "POST",
            url: ROOT_PATH + "api/user/pwd/verify",
            dataType: "json",
            async: false,
            data: toStringify({
                'id': store.get("user").id,
                'password': hex_md5(value)
            }),
            success: function (data) {
                if (data.statusCode == '2000000') {
                    return flag = data.data ? 1 : 0;
                }
            }
        });

        if (flag) {
            return false;
        } else {
            return true;
        }

    }, '与原密码相同!<em></em>');

    //验证radio单选框
    _$.validator.addMethod("radioCheck", function (value, element) {
        var elem = $(element),
            str = elem.data("name");

        var radioBox = $("[data-name=" + str + "]:checked");

        var state = false;

        if (radioBox.length != 0) {
            state = true;
        } else {
            state = false;
        }

        return state;

    });

    //判断邮箱或手机输入是否正确
    _$.validator.addMethod("isphoneAndemail", function (value, element) {
        return ruls.iphone.call(this, value, element) || ruls.email.call(this, value, element);
    }, "请输入有效手机号或邮箱地址!");
    //判断邮箱或纯数字输入是否正确
    _$.validator.addMethod("isnumberAndemail", function (value, element) {
        return  ruls.email.call(this, value, element) || /^\d{1,11}$/.test(value);
    }, "请输入有效手机号或邮箱地址!");

    //判断用户名是否正确
    _$.validator.addMethod("isName", function (value, element) {
        return ruls.name.call(this, value, element);
    }, "用户名不存在");


    // 判断密码不能为手机号
    _$.validator.addMethod("equalFalse", function (value, element, option) {

        var _val = option.elem;

        for (prop in option.target) {
            if (option.target[prop].val() != "") {
                if (_val.val() == option.target[prop].val()) {
                    return false;
                }
            }
        }
        return true;
    });

    //验证中文字符长度
    _$.validator.addMethod("maxCnLength", function (value, element, options) {
        var len = value.replace(/[^\x00-\xff]/g, "**").length;
        return this.optional(element) || Number(len) <= Number(options);
    }, "您输入的文字已超过!");

    // 只包含数字和字母
    _$.validator.addMethod("isNumLetter", function (value, element) {
        var values = parseInt(value);
        return this.optional(element) || (/^[\d\-\sA-Za-z]*$/.test(value));
    }, "手机电话格式不正确");

    // 只包含数字和字母(纯数字和字母)
    _$.validator.addMethod("isNumCharacter", function (value, element) {
        return this.optional(element) || /^[a-zA-Z0-9]{5,18}$/.test(value);
    }, "格式不正确");

    // 只能输入[0-9]数字
    _$.validator.addMethod("isDigits", function (value, element) {
        return this.optional(element) || /^\d+$/.test(value);
    }, "只能输入0-9数字");


    // 不包含[0-9]数字
    _$.validator.addMethod("isNoDigits", function (value, element) {
        return this.optional(element) || !/\d+/.test(value);
    }, "不能包含数字");

    // 只能为中文和数字
    _$.validator.addMethod("isChineseNumber", function (value, element) {
        return this.optional(element) || /^[0-9\u4E00-\u9FA5]+$/.test(value);
    }, "只能为中文和数字。");

    // 判断中文字符
    _$.validator.addMethod("isChinese", function (value, element) {
        return this.optional(element) || /^[\u0391-\uFFE5]+$/.test(value);
    }, "只能包含中文字符。");

    // 手机号码验证
    _$.validator.addMethod("isMobile", function (value, element) {
        var length = value.length;
        return this.optional(element) || (length == 11 && /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1})|(14[0-9]{1}))+\d{8})$/.test(value));
    }, "请输入13/14/15/17/18开头的手机号！");

    // 电话号码验证
    _$.validator.addMethod("isPhone", function (value, element) {
        var tel = /^(\d{3,4}-?)?\d{7,9}$/g;
        return this.optional(element) || (tel.test(value));
    }, "请正确填写您的电话号码。");

    // 空格验证
    _$.validator.addMethod("isSpace", function (value, element) {
        var space = /\s+/g;
        return this.optional(element) || (!space.test(value));
    }, "不能输入空格。");

    // 联系电话(手机/电话皆可)验证
    _$.validator.addMethod("isTel", function (value, element) {
        var length = value.length;
        var mobile = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
        var tel = /^(\d{3,4}-?)?\d{7,9}$/g;
        return this.optional(element) || tel.test(value) || (length == 11 && mobile.test(value));
    }, "请正确填写您的联系方式");

    //字母、数字及“-”，不能以下划线开头
    _$.validator.addMethod("isName", function (value, element) {
        return this.optional(element) || (/^[a-zA-Z0-9]\w{4,20}$/.test(value));
    }, "请正确填写您的用户名。");

    // 匹配密码，以字母开头，长度在6-16之间，只能包含字符、数字和下划线。
    _$.validator.addMethod("isPwd", function (value, element) {
        return this.optional(element) || /^[a-zA-Z]\\w{6,16}$/.test(value);
    }, "以字母开头，长度在6-16之间，只能包含字符、数字和下划线。");

    // 匹配密码，必须包含字母、大小写、数字、特殊字符其中两种规则。
    _$.validator.addMethod("strongPsw", function (value, element) {
        if(passwordLevel(value)==1){return false;}
        return true;
        function passwordLevel(password) {
            var Modes = 0;
            for (i = 0; i < password.length; i++) {
                Modes |= CharMode(password.charCodeAt(i));
            }
            return bitTotal(Modes);
            //CharMode函数
            function CharMode(iN) {
                if (iN >= 48 && iN <= 57)//数字
                    return 1;
                if (iN >= 65 && iN <= 90) //大写字母
                    return 2;
                if ((iN >= 97 && iN <= 122) || (iN >= 65 && iN <= 90))
                //大小写
                    return 4;
                else
                    return 8; //特殊字符
            }
            //bitTotal函数
            function bitTotal(num) {
                modes = 0;
                for (i = 0; i < 4; i++) {
                    if (num & 1) modes++;
                    num >>>= 1;
                }
                return modes;
            }
        }
    }, "密码必须包含字母、大小写、数字、特殊字符其中两种规则");

    // 字符验证，只能包含中文、英文、数字、下划线等字符。
    _$.validator.addMethod("stringCheck", function (value, element) {
        return this.optional(element) || /^[a-zA-Z0-9\u4e00-\u9fa5-_]+$/.test(value);
    }, "只能包含中文、英文、数字、下划线等字符");

    // 匹配english
    _$.validator.addMethod("isEnglish", function (value, element) {
        return this.optional(element) || /^[A-Za-z]|\s+$/.test(value);
    }, "匹配english");
    // 身份证号码验证
    _$.validator.addMethod("isIdCardNo", function (value, element) {
        //var idCard = /^(\d{6})()?(\d{4})(\d{2})(\d{2})(\d{3})(\w)$/;
        return this.optional(element) || /^(\d{6})()?(\d{4})(\d{2})(\d{2})(\d{3})(\w)$/.test(value);
    }, "请输入正确的身份证号码。");

    // 匹配only english
    _$.validator.addMethod("onlyEnglish", function (value, element) {
        return this.optional(element) || /^[A-Za-z]+$/.test(value);
    }, "匹配english");

    //匹配英文地址
    _$.validator.addMethod("enAddress", function (value, element) {
        return this.optional(element) || /^[A-Za-z0-9]|\s|[,.]+$/.test(value);
    }, "匹配english");

    // 匹配中文(包括汉字和字符)
    _$.validator.addMethod("isChineseChar", function (value, element) {
        return this.optional(element) || /^[\u0391-\uFFE5]+$/.test(value);
    }, "匹配中文(包括汉字和字符) ");


    // 判断是否包含中英文特殊字符，除英文"-_"字符外
    _$.validator.addMethod("isContainsSpecialChar", function (value, element) {
        var reg = RegExp(/[(\ )(\`)(\~)(\!)(\@)(\#)(\$)(\%)(\^)(\&)(\*)(\()(\))(\+)(\=)(\|)(\{)(\})(\')(\:)(\;)(\')(',)(\[)(\])(\.)(\<)(\>)(\/)(\?)(\~)(\！)(\@)(\#)(\￥)(\%)(\…)(\&)(\*)(\（)(\）)(\—)(\+)(\|)(\{)(\})(\【)(\】)(\‘)(\；)(\：)(\”)(\“)(\’)(\。)(\，)(\、)(\？)]+/);
        return this.optional(element) || !reg.test(value);
    }, "含有中英文特殊字符");

    // 判断是否包含中英文特殊字符，除英文"-_"字符以及空格外
    _$.validator.addMethod("isContainsSpecialCharNotSpace", function (value, element) {
        var reg = RegExp(/[(\`)(\~)(\!)(\@)(\#)(\$)(\%)(\^)(\&)(\*)(\()(\))(\+)(\=)(\|)(\{)(\})(\')(\:)(\;)(\')(',)(\[)(\])(\.)(\<)(\>)(\/)(\?)(\~)(\！)(\@)(\#)(\￥)(\%)(\…)(\&)(\*)(\（)(\）)(\—)(\+)(\|)(\{)(\})(\【)(\】)(\‘)(\；)(\：)(\”)(\“)(\’)(\。)(\，)(\、)(\？)]+/);
        return this.optional(element) || !reg.test(value);
    }, "含有中英文特殊字符");

    // 匹配中文 字母  空格
    _$.validator.addMethod("isGroupByCnWordsSpace", function (value, element) {
        return this.optional(element) || /^[\u0391-\uFFE5a-zA-Z\s\d]*$/.test(value);
    }, "");

    // 只能输入[0-9]数字
    _$.validator.addMethod("isDigits", function (value, element) {
        return this.optional(element) || /^\d+$/.test(value);
    }, "只能输入0-9数字");

    //只能输入开头不为0的数字
    _$.validator.addMethod("isDigitsGt0", function (value, element,params) {
        return this.optional(element) || /^[1-9]\d*$/.test(value);
    }, "数字无效");

    // 判断中文字符
    _$.validator.addMethod("isChinese", function (value, element) {
        return this.optional(element) || /^[\u0391-\uFFE5]+$/.test(value);
    }, "只能包含中文字符。");

    // 判断非中文
    _$.validator.addMethod("nonChinese", function (value, element) {
        return this.optional(element) || /^[^\u4E00-\u9FFF]+$/.test(value);
    }, "不能包含中文字符。");

    // 只能包含字母、数字、英文横杠
    _$.validator.addMethod("isWordNumBar", function (value, element) {
        return this.optional(element) || /^[A-Za-z\d\-_]+$/.test(value);
    }, "只能包含中文字符。");

    // 只能包含字母、下横杠
    _$.validator.addMethod("isWordUnderbar", function (value, element) {
        return this.optional(element) || /^[A-Za-z\_\s]+$/.test(value);
    }, "只能包含中文字符。");
    // 只能包含字母、数字、句号
    _$.validator.addMethod("isWordNumStop", function (value, element) {
        return this.optional(element) || /^[\d\.]+$/.test(value);
    }, "只能包含中文字符。");

    // 手机号码验证
    _$.validator.addMethod("isMobile", function (value, element) {
        var length = value.length;
        return this.optional(element) || (length == 11 && /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1})|(14[0-9]{1}))+\d{8})$/.test(value));
    }, "请输入13/14/15/17/18开头的手机号！");

    // 电话号码验证
    _$.validator.addMethod("isPhone", function (value, element) {
        var tel = /^(\d{3,4}-?)?\d{7,9}$/g;
        return this.optional(element) || (tel.test(value));
    }, "请正确填写您的电话号码。");

    // 空格验证
    _$.validator.addMethod("isSpace", function (value, element) {
        var space = /\s+/g;
        return this.optional(element) || (!space.test(value));
    }, "不能输入空格。");

    // 联系电话(手机/电话皆可)验证
    _$.validator.addMethod("isTel", function (value, element) {
        var length = value.length;
        var mobile = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
        var tel = /^(\d{3,4}-?)?\d{7,9}$/g;
        return this.optional(element) || tel.test(value) || (length == 11 && mobile.test(value));
    }, "请正确填写您的联系方式");

    //字母、数字及“-”，不能以下划线开头
    _$.validator.addMethod("isName", function (value, element) {
        return this.optional(element) || (/^[a-zA-Z0-9]\w{4,20}$/.test(value));
    }, "请正确填写您的用户名。");

    //字母、数字及“-”，只能以字母开头
    _$.validator.addMethod("isFirstName", function (value, element) {
        return this.optional(element) || (/^[a-zA-Z]\w{4,20}$/.test(value));
    }, "请正确填写您的用户名。");
    //验证国际通用电话号码 /^(\+\d+ )?(\(\d+\) )?[\d ]+$/
    _$.validator.addMethod("isInternationalCall", function (value, element) {
        return this.optional(element) || (/^(\+\d+ )?(\(\d+\) )?[\d ]+$/.test(value));
    }, "请正确填写电话号码。");    
    // 匹配密码，以字母开头，长度在6-12之间，只能包含字符、数字和下划线。
    _$.validator.addMethod("isPwd", function (value, element) {
        return this.optional(element) || /^[a-zA-Z]\\w{6,12}$/.test(value);
    }, "以字母开头，长度在6-12之间，只能包含字符、数字和下划线。");


    // 字符验证，只能包含中文、英文、数字、下划线等字符。
    _$.validator.addMethod("stringCheck", function (value, element) {
        return this.optional(element) || /^[a-zA-Z0-9\u4e00-\u9fa5-_]+$/.test(value);
    }, "只能包含中文、英文、数字、下划线等字符");

    //匹配英文地址
    _$.validator.addMethod("enAddress", function (value, element) {
        return this.optional(element) || /^[A-Za-z0-9]|\s|[,.]+$/.test(value);
    }, "匹配english");

    // 只能为英文
    _$.validator.addMethod("isAllEnglish", function (value, element) {
        if($.inArray(false, isAllEnglish(value)) == -1){
            return true;
        }else{
            return false;
        }

        function isAllEnglish(value) {
            var arr = [];
            for (i = 0; i < value.length; i++) {
                arr.push(CharMode(value.charCodeAt(i)));
            }
            return arr;
            //CharMode函数
            function CharMode(iN) {
                var boolean;
                //大小写
                if ((iN >= 97 && iN <= 122) || (iN >= 65 && iN <= 90)) {
                    boolean = true;
                }else {
                    boolean = false;
                }
                return boolean;
            }
        }
    }, "匹配english");

    // 匹配汉字
    _$.validator.addMethod("isChinese", function (value, element) {
        return this.optional(element) || /^[\u4e00-\u9fa5]+$/.test(value);
    }, "匹配汉字");

    // 匹配中文(包括汉字和字符)
    _$.validator.addMethod("isChineseChar", function (value, element) {
        return this.optional(element) || /^[\u0391-\uFFE5]+$/.test(value);
    }, "匹配中文(包括汉字和字符) ");


    // 匹配中文 字母  空格
    _$.validator.addMethod("isGroupByCnWordsSpace", function (value, element) {
        return this.optional(element) || /^[\u0391-\uFFE5a-zA-Z\s\d]*$/.test(value);
    }, "");

    //此邮箱验证允许点开头
    _$.validator.addMethod("email", function (value, element) {
        $(element).val(value);
        return this.optional(element) || /^\w+([\.\-]\w+)*\@\w+([\.\-]\w+)*\.\w+$/.test(value);
    }, "您的邮箱格式填写有误，请重新输入<em></em>");

    //此邮箱验证不允许点开头
    _$.validator.addMethod("emailTrue", function (value, element) {
        $(element).val(value);
        return this.optional(element) || /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/.test(value) && /[_a-z\d\-\./]+@[_a-z\d\-]+(\.[_a-z\d\-]+)*(\.(info|biz|com|edu|gov|net|am|bz|cn|cx|hk|jp|tw|vc|vn))$/.test(value);
    }, "您的邮箱格式填写有误，请重新输入<em></em>");

    // 匹配汉字、字母、数字
    _$.validator.addMethod("isChineseAndWords", function (value, element) {

        return this.optional(element) || /^[\u0391-\uFFE5\w]+$/.test(value);
    }, "只能输入汉字、字母、数字 ");

    //只能包含字母、数字、英文横杠(用逗号分隔,空格,换行)
    _$.validator.addMethod("skus", function (value, element) {
        $(element).val(value);
        return this.optional(element) || /^[0-9a-zA-Z-\s,]+$/.test(value);
    });
    
    //不能包含中文
    _$.validator.addMethod("ridCh", function (value, element) {
        return this.optional(element) || /^[A-Za-z0-9(\-)(\《)(\》)(\>)(\<)(\_)(\ )(\`)(\~)(\!)(\@)(\#)(\$)(\%)(\^)(\&)(\*)(\()(\))(\+)(\=)(\|)(\{)(\})(\")(\")(\')(\:)(\;)(\')(',)(\[)(\])(\.)(\<)(\>)(\/)(\?)(\~)(\！)(\@)(\#)(\￥)(\%)(\…)(\&)(\*)(\（)(\）)(\—)(\+)(\|)(\{)(\})(\【)(\】)(\‘)(\；)(\：)(\”)(\“)(\’)(\。)(\，)(\、)(\？)]*$/.test(value);
    });

})(jQuery);


