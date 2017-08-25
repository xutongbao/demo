window.X = Xbn();
X.require.config.baseurl="js/";
X.require.config.rules.push(["\\.","/"]);

(function (win,X) {
	var rootPath = "http://dev.xutongbao.com/";
	var prefixUrl = rootPath + "api/international";
	var config = {
		PATH_FILE: {
	        path: {
	            root: rootPath
	        }
    	},

	    common : {
	    	tpl :{
	    		header : rootPath + "tpl/common/header.tpl",
	    		nav : rootPath + "tpl/common/nav.tpl",
	    		footer : rootPath + "tpl/common/footer.tpl"
	    	},
			res : {
				header : rootPath + "i18n/common/common",
				footer : rootPath + "i18n/common/common",
				nav : rootPath + "i18n/common/common",
				common : rootPath + "i18n/common/common"
			},
			link :{
				home : rootPath
			}
	    },

		request: {
			api:{
                getIpInfo: prefixUrl + "/ipinfo"
			}
		},

	    index : {
	    	tpl : {
	    		index : rootPath + "tpl/index/index.tpl"
	    	},
	    	res : {
	    		index : rootPath + "i18n/index/index"
			}
	    },

		env: {
			production: (rootPath.indexOf("dev") ==-1)
		}
	};

	X.prototype.config = config;

	X.prototype.CONSTANT = {
		statusCode : {
			SUCCESS : 2000000,
			NOTPHONE : 2000309,//登录手机号码不存在
			NOTPASSWORD : 2000310, //登录密码不正确
			LOGININVALID : 2000312, //登录用户名或密码错误
			FROEENACOUNT : 2000205, //当前用户已被冻结
			SESSIONEXPIRE : 1000100,//session 失效
			NOLOGIN : 2001000,//未登录
			INVALIDPRODUCT : 2000800 //失效产品
		},
		channel : {
			"navReady" : "navReady"
		}
	};

})(window,this.Xbn);