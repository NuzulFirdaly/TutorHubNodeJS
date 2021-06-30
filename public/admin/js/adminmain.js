(function($) {

    "use strict";

    var fullHeight = function() {

        $('.js-fullheight').css('height', $(window).height());
        $(window).resize(function() {
            $('.js-fullheight').css('height', $(window).height());
        });

    };
    fullHeight();

    $('#sidebarCollapse').on('click', function() {
        $('#sidebar').toggleClass('active');
    });

    var carousel = function() {
        $('.featured-carousel').owlCarousel({
            loop: false,
            autoplay: true,
            margin: 30,
            animateOut: 'fadeOut',
            animateIn: 'fadeIn',
            nav: true,
            dots: true,
            autoplayHoverPause: false,
            items: 1,
            navText: ["<span class='ion-ios-arrow-back'></span>", "<span class='ion-ios-arrow-forward'></span>"],
            responsive: {
                0: {
                    items: 1
                },
                600: {
                    items: 2
                },
                1000: {
                    items: 3
                }
            }
        });

    };
    carousel();

    $("#updateadmin").submit(function(e) {
        e.preventDefault();
        var formData = new FormData();

        $.ajax({
            url: "/admin/editprofile/:user_id",
            type: 'POST',
            data: formData,
            success: function(data) {
                alert(data)
            },
            cache: false,
            contentType: "multipart/form-data",
            processData: false
        });
    });

})(jQuery);