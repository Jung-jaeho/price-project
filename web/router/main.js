module.exports = function (app, fs) {
    app.get('/', function (req, res) {
        res.render('search', {
            title: "Price:: 가장 빠른 중고시세 확인"
        })
    });
}