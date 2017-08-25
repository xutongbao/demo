X.define('modules.common.suspensionBox',function () {
    function suspensionBox() {
        var html = [
            '<ul class="suspensionBox mt20 curp">',
            '    <li style="border-left: 1px solid rgb(209, 209, 209); background-position: 4px 5px;">',
            '        <div class="contactLabel por  f12 bgcff" style="display: none;">Skype: +86 132 4002 0366</div>',
            '    </li>',
            '    <li style="background-position: -39px 5px ">',
            '        <div class="contactLabel por  f12 bgcff">WhatsApp: +86 132 4002 0366</div>',
            '    </li>',
            '    <li style="background-position: -84px 5px ">',
            '        <div class="contactLabel por colMainBlue f12 bgcff tac" style="width:110px;height:110px;left:-129px;padding:8px;">',
            '            <img src="../../images/QRCode.jpg" style="margin-top:0px">',
            '        </div>',
            '    </li>',
            '    <li style="background-position: -128px 5px"><a class="inlineb" id="myEmail" onclick="" href="mailto:contact@weintrade.com?" style="width: 100%;height: 100%"> </a></li>',
            '    <li style="background-position: -172px 5px" class="js-buyingRequest"></li>',
            '    <li style="background-position: -216px 5px" class="js-toTop"></li>',
            '</ul>'
        ].join('')

        $('body').append(html);
        addEvent()
    }

    function addEvent() {
        var suspenBox  = $(".suspensionBox"),
            setHeight  = $('body').attr('suspensionBoxAllShow')? 0: 400

        $(window).scroll(function () {
            $(document).scrollTop() >= setHeight ? suspenBox.show() : suspenBox.hide()
        });

        $(".suspensionBox>li").mouseover(function () {
            var x = $(this).css("backgroundPosition").split(" ")[0];
            var newPos = x + " -33px";
            $(this).css("background-position", newPos);
        }).mouseout(function () {
            var x = $(this).css("backgroundPosition").split(" ")[0];
            var newPos = x + " 5px";
            $(this).css("background-position", newPos);
        });

        $(".suspensionBox>li:lt(3) ").hover(function () {
            $(this).css("borderLeft", "1px solid #fff");
            $(this).find(".contactLabel").show();
        }, function () {
            $(this).css("borderLeft", "1px solid #d1d1d1");
            $(this).find(".contactLabel").hide();
        });

        $('.js-toTop').on('click', function() {
            $('body,html').animate({scrollTop: 0}, 300);    
        });
        $('.js-buyingRequest').on('click', function() {
            window.open(X.config.common.link.freeSource);
        });
    }
    suspensionBox();
});