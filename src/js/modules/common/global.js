/**
 * Created by Administrator on 2016/9/20.
 */
X.define("modules.common.global",["modules.common.nav","modules.common.footer"],function (nav,footer) {
	var imageLoader = {
		load : function (option) {

			option =  X.isArray(option) ? option : [];
			option.forEach(function (value, index, array) {
				$.ajax({
					url : value["src"],
					beforeSned:function (xhr) {
						xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
					}
				}).done(function (argument) {

					var isBg = value["isBg"];

					if(isBg){
						$(value["selector"]).animate({opacity: 0.9}, 'fast', function() {
							$(this)
					            .css({'background-image': 'url('+value["src"]+')'})
					            .animate({opacity: 1});
					    });
					}
					else{
						$(value["selector"]).attr("src",value["src"]);
					}					
				});			
			});
		}
	};

	return imageLoader;  
    
});