module.exports = function (app, connection) {

    connection.connect();
    //첫 페이지
    app.get('/', function (req, res) {
        res.render('index', {
            title: "Price:: 가장 빠른 중고시세 확인"
        })
    });

    //검색 페이지 NULL
    app.get('/search/', function (req, res) {

        res.render('search', {
            title: "Price:: 가장 빠른 중고시세 확인",
            keyword: ""

        })
    });

    //검색 페이지
    app.get('/search/:keyword', function (req, res) {

        res.render('search', {
            title: "Price:: 가장 빠른 중고시세 확인",
            keyword: req.params.keyword
        })

    });

    //검색 API
    app.post('/api/v1/search', function (req, res) {
        var keyword = req.body.keyword;
        var page = req.body.page;
        var articles = []
        var state = ""

        var startRowCount = (page - 1) * 15;
        var endRowCount = page * 15

        if (keyword != "") {

            connection.query('SELECT * from articles WHERE title LIKE "%' + keyword + '%" AND content LIKE "%' + keyword + '%" LIMIT ' + startRowCount + ',' + endRowCount,

                function (err, rows, fields) {
                    if (!err) {
                        state = "success";

                        for (i = 0; i < rows.length; i++) {
                            articles.push({
                                title: rows[i].title,
                                content: rows[i].content,
                                price: rows[i].price,
                                image: rows[i].image,
                            });
                        }
                    } else {
                        state = "fail";
                        console.log('Error while performing Query.', err);
                    }

                    res.json({
                        'state': state,
                        'articles': articles
                    });
                });
        }
    });


}