var express = require('express');
var app = express();
var PORT = 3001;

app.use(express.static('.'));

app.get('/',function(req, res){
    res.sendFile(__dirname+'/index.html');
});

var server = app.listen(PORT,function(err){
    console.log('已启动服务器，地址为：'+PORT);
})