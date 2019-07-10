var redirect = function () {
    var value = $("#search-input").val();
    $(location).attr("href", "/search/" + value);
}

$('#search-button').click(function () {
    redirect();
});

$("#search-input").keypress(function (e) {
    if (e.which == 13) {
        redirect();
    }
});

//DataLoad 함수형 선언
var dataLoad = function (page) {

    $.ajax({
        url: '/api/v1/search/',
        type: 'post',
        dataType: 'json',
        data: {
            keyword: $("#search-input").val(),
            page: page
        },
        success: function (data) {
            if (data.state == "success") {
                for (i = 0; i < data['articles'].length; i++) {
                    $('#test-content').append("<h1>" + data['articles'][i].title + "</h1>" + "<h5>" + data['articles'][i].content + "</h5>" + "<h5>" + data['articles'][i].price + "</h5>");
                }
            } else {
                $('#test-content').text("error");
            }
        }
    })
}