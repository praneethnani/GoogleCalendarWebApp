var express = require('express');

var app = express();
app.use(express.static(__dirname + '/public'));

app.get("/username", function (req, res) {
  res.send("praneeth");
    //res.write("Hello")
  });

app.post("/AuthenticateUser", function (req, res) {
 var uname = req.body.uname;
 var password = sha1(req.body.password);

 dbUser.user.findOne({username:uname},function(err, results){
  if (results !=null){
   json_password=results.password;
   if(password==json_password){
    req.session.username=uname;
    console.log(req.session.username);
    res.send("success");
  }else{
    res.send("password is incorrect")
  }
}else{
  res.send("username not found");
}
});
});

app.get('/users', function(req,res){
  dbUser.user.find(function(er,data){
    res.json(data)
  });
});



var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port      = process.env.OPENSHIFT_NODEJS_PORT || 3000;

app.listen(port,ipaddress);


