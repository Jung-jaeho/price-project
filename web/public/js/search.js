//초기화 ===================
var page = 0;
var order = "";
//검색 키워드
keyword = $("#search-input").val();
//제거하고 싶은 키워드
var removeKeywords = "";
var scrollBreak = false;

//초기화 ===================

function sendRequest(page, keyword, removeKeywords, order) {
    data = "";

    $('.spinner').show();

    if (scrollBreak == false) {
        scrollBreak = true;
        //비동기 Request 
        $.ajax({
            url: '/api/v1/search/',
            type: 'post',
            dataType: 'json',
            data: {
                keyword: keyword,
                removeKeywords: removeKeywords,
                order: order,
                page: page
            },
            success: function (data) {
                if (data.state == "success" && Number(data.productCount) > 0) {
                    //성공하면 DOM 그리기 
                    drawView(data);

                } else {
                    //실패하면 DOM 그리기 
                    failDrawView(keyword);
                }

                $('.spinner').hide();

                if (data['articles'].length == 15) {

                    scrollBreak = false;
                } else {
                    scrollBreak = true;
                }
            }
        })
    }
}

//카드 그리기
function cardDraw(data, count, vCount, dCount) {

    $('#productCount').text(count);

    $('#vCount').text(vCount + "개");
    $('#dCount').text(dCount + "개");

    for (i = 0; i < data.length; i++) {

        $('#content-list').append(`
            <div class="col-md-4" onclick="linkDetail('${data[i].aURL}')">

            <div class="card-box">
                <div class="card mb-4 shadow-sm">
                    <div style="width:100%; height:300px;">
                        <img src="${data[i].image}" onerror="this.src='/images/not-found.png'" style="width:100%; height:300px; object-fit:  cover;">
                    </div>
                    <div class="card-body">
                        <p class="card-text" style="height:65px"><b>${data[i].title}</b></p>
                        <p class="card-text" style="overflow: hidden; text-overflow:ellipsis; height:170px">${data[i].content}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="btn-group">
                                <button type="button" class="btn btn-sm btn-outline-secondary">${data[i].price} 원</button>
                                <img src="/images/${data[i].site}.png" style="width:25px; height:25px; object-fit: contain; margin-left:20px; ">
                            </div>
                            <small class="text-muted">${data[i].publish.slice(0, 10)}</small>
                        </div>
                    </div>
                </div>
        </div>`);
    }
}

//차트 그리기
function chartDraw(data) {
    var x = [];
    var y = [];

    var ctx = document.getElementById('myChart').getContext('2d');
    ctx.height = 300;
    ctx.width = "100%";


    for (i = 0; i < data.length; i++) {
        x.push(data[i].price);
        y.push(data[i].PDcount);
    }

    var lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: x,
            datasets: [{
                label: "개수",
                data: y,
                backgroundColor: 'rgba(52,31,151,1)',
                color: 'rgba(52,31,151,1)',
                borderColor: 'rgba(52,31,151,1)',
                pointBorderWidth: 1,
                pointBorderColor: 'rgba(52,31,151,1)',
                pointBackgroundColor: 'rgba(52,31,151,1)',
                fill: false
            }]
        },
        options: {
            legend: {
                display: false
            },
            responsive: true,
            title: {
                display: false,
                text: '중고가 거래 시세'
            },
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: false,
                        labelString: '가격'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: false,
                        labelString: '개수'
                    }
                }]
            }
        }
    });
}


//DOM 그리기  ( 성공 )
function drawView(data) {
    //차트 그리기
    chartDraw(data['chartDatas']);
    //카드 그리기
    cardDraw(data['articles'], data['productCount'], data['vCount'], data['dCount']);

}

//DOM 그리기 ( 실패 )
function failDrawView(keyword) {
    $('.load').html(`<p style=' font-size:30px; text-align:center; font-weight:400;'>"<span style="color:#1B1464; font-weight:bold;">${keyword}"</span>에 대한 데이터를 찾을 수 없습니다.</p>`)
    console.log("FIAL!!");
}


function linkDetail(url) {

    window.open(url, "_blank");

}

function redirect() {
    var value = $("#search-input").val();
    $(location).attr("href", "/search/" + value);
}

function reset() {
    page = 0;
    scrollBreak = false;

    sendRequest(++page, keyword, removeKeywordsSplit(), order);

    $("#content-list").html('');
    $("#chartContainer").html('');


    $("#chartContainer").append('<canvas id="myChart" style="width:100%; height:300px;"></canvas>');

}

$('#tags-input').on('itemAdded', function (event) {
    reset();

});

$('#tags-input').on('itemRemoved', function (event) {
    reset();
});

function orderChnage() {
    var date = $('#dateOrderInput').val();
    var price = $('#priceOrderInput').val();


    if (price == 1 && date == 3) { // 가격 오름 날짜 오름
        order = "pudu";
    } else if (price == 1 && date == 4) { // 가격 오름 날짜 내림
        order = "pudd";
    } else if (price == 2 && date == 3) { // 가격 내림 날짜 오름
        order = "pddu";
    } else if (price == 2 && date == 4) { // 가격 내림 날짜 내림
        order = "pddd";
    } else if (price == 1) { //가격 오름차순
        order = "pu";
    } else if (price == 2) { //가격 내림차순
        order = "pd";
    } else if (date == 3) { //날짜 오름차순
        order = "du";
    } else if (date == 4) { //날짜 내림차순
        order = "dd";
    } else if (date == -1 && date == -1) {
        order = "";
    }

    reset();

}

//정렬 상태
$('.dateOrder').click(function () {
    var value = $(this).attr("value");
    var text = $(this).text();

    $('#orderDateTitle').text(text);
    $('#dateOrderInput').val(value);

    orderChnage();

})

//정렬 상태
$('.priceOrder').click(function () {
    var value = $(this).attr("value");
    var text = $(this).text();

    $('#orderPriceTitle').text(text);
    $('#priceOrderInput').val(value);

    orderChnage();


})

$('#search-button').click(function () {
    if ($("#search-input").val().length > 1) {
        redirect();
    } else {
        alert("2글자 이상 입력해주세요.");
    }

});

$("#search-input").keypress(function (e) {
    if (e.which == 13) {
        if ($("#search-input").val().length > 1) {
            redirect();
        } else {
            alert("2글자 이상 입력해주세요.");
        }
    }
});

function removeKeywordsSplit() {

    var removeKeywords = "";
    //제거할 키워들 리스트를 쉼표로 Join
    if ($("#tags-input").val().length > 0) {
        removeKeywords = $("#tags-input").val().join();
    } else {
        removeKeywords = "";
    }

    return removeKeywords
}

$(window).scroll(function () {
    if ($(window).scrollTop() == $(document).height() - $(window).height()) {

        //제거할 키워들 리스트를 쉼표로 Join
        if ($("#tags-input").val().length > 0) {
            removeKeywords = $("#tags-input").val().join();
        } else {
            removeKeywords = "";
        }
        if (scrollBreak == false) {

            sendRequest(++page, keyword, removeKeywords, order);

        }
    }
});