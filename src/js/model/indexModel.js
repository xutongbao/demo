X.define("model.indexModel",function () {
    var indexModel =	X.model.create("model.indexModel");

    indexModel.getIpInfo = function(callback){
        var option = {url:X.config.request.api.getIpInfo,type:"GET",callback:function(result){
            callback&&callback(result);
        }};
        X.loadData(option);
    };
    return indexModel
});