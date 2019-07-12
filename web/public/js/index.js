var focus = false;

$('#content input').focus();

$(window).scroll(function () {

    if ($(this).scrollTop() > 500) {

        if (focus == false) {

            $('header').addClass("fixed");
            $('.default-header').hide();
            $('.fixed-header').fadeIn(700);

            $('.fixed-header input').focus();

            focus = true;
        }

    } else {
        if (focus == true) {

            $('header').removeClass("fixed");
            $('.fixed-header').hide();
            $('.default-header').show();

            focus = false;
        }
    }
});

$('#content .search-button').click(function () {
    var value = $("#content .search-input").val();
    $(location).attr("href", "/search/" + value);
})

$("#content .search-input").keypress(function (e) {
    if (e.which == 13) {
        var value = $("#content .search-input").val();
        $(location).attr("href", "/search/" + value);
    }
});


$('.fixed-header .search-button').click(function () {
    var value = $("#content .search-input").val();
    $(location).attr("href", "/search/" + value);
})

$(".fixed-header .search-input").keypress(function (e) {
    if (e.which == 13) {
        var value = $("#content .search-input").val();
        $(location).attr("href", "/search/" + value);
    }
});