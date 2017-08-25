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