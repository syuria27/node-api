var mysql = require("mysql");
const isset = require('isset');

function PRODUCT_ROUTER(router,connection) {
    var self = this;
    self.handleRoutes(router,connection);
}

PRODUCT_ROUTER.prototype.handleRoutes= function(router,connection) {
    
    router.get("/products",function(req,res){
    	var data = {"error":true,
			    "error_msg":""};

        var query = "SELECT * FROM ??";
	    var table = ["product"];
	    query = mysql.format(query,table);
	    connection.query(query,function(err,rows){
	        if(err) {
	            res.json({"error" : true, "error_msg" : "Error executing MySQL query"});
	        } else {
	            if(rows.length != 0){
	                data["error"] = false;
				    data["error_msg"] = 'Success..';
				    data["products"] = rows;
				    res.json(data);
				}else{
			        data["error_msg"] = 'No product Found..';
			        res.json(data);
			    }
			}
	    });
	});
}

module.exports = PRODUCT_ROUTER;
