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
        var className = toString.call(a);
        if (className !== toString.call(b)) return false;
        switch (className) {
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

        var areArrays = className === '[object Array]';
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
            for (var i = 0; i < postData.length ; i++){
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
                        X.prototype.publish(X.prototype.channels["i"],result.message);
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
                    //var ol = that.populate(data);
                    callback && callback(data);
                }
                else{
                    X.prototype.echo("获取数据失败",2);
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
                    X.prototype.publish(X.prototype.channels["i"],result.message);
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