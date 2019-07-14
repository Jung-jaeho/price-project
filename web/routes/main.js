module.exports = function (app, connection) {

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

    function chartQuery(query, datas) {

        var chartDatas = []
        var productCount = 0

        //query 1
        return new Promise((resolve, reject) => {

            connection.query(query, function (err, rows, fields) {
                if (!err) {

                    for (var i = 0; i < rows.length; i++) {

                        chartDatas.push({
                            price: rows[i].price,
                            PDcount: rows[i].productCount
                        });

                        productCount += rows[i].productCount; // 총 상품의 개수 저장
                    }

                    datas['chartDatas'] = chartDatas;
                    datas['productCount'] = productCount;

                    resolve(datas);

                } else {
                    //에러 출력
                    reject(new Error("Request is failed"));
                    console.log(err);
                }
            });
        });
    }

    function siteCountQuery(query, datas) {
        //query 2
        return new Promise((resolve, reject) => {

            connection.query(query, function (err, rows, fields) {
                if (!err) {
                    if (rows.length > 0) {
                        if(rows[0].site_name=="daangn"){
                            datas['dCount'] = rows[0].siteCount;
                            datas['vCount'] = 0;
                        }else if(rows[0].site_name == "bunjang" && !rows[1]){
                            datas['vCount'] = rows[0].siteCount;
                            datas['dCount'] = 0;
                        }else{
                            datas['vCount'] = rows[0].siteCount;
                            datas['dCount'] = rows[1].siteCount;    
                        }
                    }else {
                        datas['vCount'] = 0;
                        datas['dCount'] = 0;
                    }
                    resolve(datas);
                } else {
                    reject(new Error("Request is failed"));
                    console.log(err);
                }
            });

        });

    }

    function articlesQuery(query, datas) {
        var articles = []
        //query 3
        return new Promise((resolve, reject) => {
            connection.query(query, function (err, rows, fields) {
                if (!err) {

                    for (var i = 0; i < rows.length; i++) {
                        articles.push({
                            title: rows[i].title,
                            content: rows[i].content,
                            price: rows[i].price,
                            image: rows[i].image,
                            publish: rows[i].published_at,
                            aURL: rows[i].article_url,
                            site: rows[i].site_name
                        });
                    }

                    datas['articles'] = articles;

                    resolve(datas);
                } else {
                    reject(new Error("Request is failed"));
                    console.log(err);
                }
            });
        });

    }

    //검색 API
    app.post('/api/v1/search', function (req, res) {

        //url decode and trim 
        var keyword = decodeURI(req.body.keyword).replace(" ", "");

        var removeKeywords = req.body.removeKeywords;

        var page = Number(req.body.page);
        var order = req.body.order;

        var datas = {
            'state': '',
            'articles': '',
            'chartDatas': '',
            'productCount': '',
            'dCount': '',
            'vCount': ''
        };

        var removeSplit = [];
        var addQueryTitle = "";
        var addQueryContent = "";
        var addQueryOrder = "";


        if (keyword != "") {
            //검색어 제외 시
            if (removeKeywords) {

                removeSplit = removeKeywords.split(',');

                for (var value of removeSplit) {
                    var removeWord = value.replace(" ", "");

                    addQueryTitle += ` AND NOT (replace(title, " ", "") LIKE "%${removeWord}%")`;
                    addQueryContent += ` AND NOT (replace(content," ","") LIKE '%${removeWord}%')`;

                    if (value == keyword) {

                        return res.json({
                            'state': "fail",
                        });
                    }
                }
            }

            if (order == "pudu") { // 가격 오름 날짜 오름
                addQueryOrder = "ORDER BY PRICE, PUBLISHED_AT";
            } else if (order == "pudd") { // 가격 오름 날짜 내림
                addQueryOrder = "ORDER BY PRICE, PUBLISHED_AT DESC";
            } else if (order == "pddu") { // 가격 내림 날짜 오름
                addQueryOrder = "ORDER BY PRICE DESC, PUBLISHED_AT";
            } else if (order == "pddd") { // 가격 내림 날짜 내림
                addQueryOrder = "ORDER BY PRICE DESC, PUBLISHED_AT DESC";
            } else if (order == "pu") { //가격 오름차순
                addQueryOrder = "ORDER BY PRICE"
            } else if (order == "pd") { //가격 내림차순
                addQueryOrder = "ORDER BY PRICE DESC"
            } else if (order == "du") { //날짜 오름차순
                addQueryOrder = "ORDER BY PUBLISHED_AT"
            } else if (order == "dd") { //날짜 내림차순
                addQueryOrder = "ORDER BY PUBLISHED_AT DESC"
            } else if (order == "") {
                addQueryOrder = "ORDER BY RAND()";
            }

            // 첫 번째 쿼리(카운트 확인)
            query1 = `SELECT price, count(*) as productCount from articles WHERE (replace(title, " ", "") LIKE "%${keyword}%" OR replace(content, " ", "") LIKE "%${keyword}%") AND (price > 500) ${addQueryTitle} ${addQueryContent} GROUP BY price;`
            // 두 번째 쿼리 (그룹으로 번개장터, 당근마켓 데이터가 몇 개 있는지 확인)
            query2 = `SELECT site_name, count(*) AS siteCount from articles WHERE (replace(title, " ", "") LIKE "%${keyword}%" OR replace(content, " ", "") LIKE "%${keyword}%") AND (price > 500) ${addQueryTitle} ${addQueryContent} GROUP BY site_name;`

            // ====== 비동기 쿼리 호출 시작 ======
            chartQuery(query1, datas).then(datas => {
                siteCountQuery(query2, datas).then(datas => {

                    limitStart = (page - 1) * 15;
                    // 세 번째 쿼리(카운트 확인)
                    query3 = `SELECT * from articles WHERE (replace(title, " ", "") LIKE "%${keyword}%" OR replace(content, " ", "") LIKE "%${keyword}%") AND (price > 500) ${addQueryTitle} ${addQueryContent} ${addQueryOrder}  LIMIT ${limitStart}, 15;`

                    articlesQuery(query3, datas, page).then(datas => {
                        datas['state'] = "success";
                        res.json(datas);

                    }).catch(function (err) {
                        datas['state'] = "fail";
                        res.json(datas);
                    })
                }).catch(function (err) {
                    datas['state'] = "fail";
                    res.json(datas);
                })
            }).catch(function (err) {
                datas['state'] = "fail";
                res.json(datas);
            });
            // ====== 비동기 쿼리 호출 종료 ======

        }
    });


}