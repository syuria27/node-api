var mysql = require("mysql");
const isset = require('isset');
var InsertQuery = require('mysql-insert-multiple');
var moment = require('moment');

function PRODUCT_ROUTER(router,connection) {
    var self = this;
    self.handleRoutes(router,connection);
}

PRODUCT_ROUTER.prototype.handleRoutes= function(router,connection) {
    
    router.get("/products/:uid",function(req,res){
    	var data = {"error":true,
			    "error_msg":""};

        var query = `SELECT * FROM product WHERE kode_product NOT IN
        			(SELECT kode_product FROM product_report where uid = ? AND tanggal = NOW())`;
	    var table = [req.params.uid];
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

	router.post("/products/report",function(req,res){
    	var data = {"error":true,
			    	"error_msg":""};
		var prods = req.body.products;
		console.log(prods);
		var tanggal = moment().format('YYYY-MM-DD');
		/*var jsonObj = {
		        "log": [{
		            "uid": "SPG-0001",
		            "kode_product": "PRD-0001",
		            "volume": 95.0
		        }, {
		            "date": "15/09/2016",
		            "uid": "SPG-0001",
		            "kode_product": "PRD-0001",
		            "volume": 95.0
		        }, {
		            "date": "15/09/2016",
		            "uid": "SPG-0001",
		            "kode_product": "PRD-0001",
		            "volume": 95.0
		        }]
		    };*/
		var jsonObj = JSON.parse(prods);


		 var jsonArr = jsonObj['log'];
		 var inserts = [];

		 for(var i in jsonArr){
		 	  var uid = jsonArr[i]['uid'];
		 	  var kode_product = jsonArr[i]['kode_product'];
		 	  var volume = jsonArr[i]['volume'];
		 	  inserts.push([uid, tanggal, kode_product, volume]);
		 }

        var query = `INSERT INTO product_report 
        			(uid, tanggal, kode_product, volume) 
					VALUES ?`;
		var table = [inserts];
		query = mysql.format(query,table);
		console.log(query);
		connection.query(query,function(err,results){
		    if(err) {
		    	console.log(err);
		        res.json({"error" : true, "error_msg" : "Error executing MySQL query"});
		    } else {
		        data["error"] = false;
				data["error_msg"] = 'Report succesfuly submited';
				res.json(data);
			}
		});
	});

	router.get("/product/:uid/:tanggal",function(req,res){
    	var data = {"error":true,
			    "error_msg":""};

        var query = `SELECT pr.kode_laporan,pr.uid,pr.tanggal,p.nama_product,pr.volume
        			FROM product_report pr 
        			LEFT JOIN product p ON pr.kode_product = p.kode_product  
        			WHERE pr.uid = ? AND pr.tanggal = ?`;
        var table = [req.params.uid,req.params.tanggal];
        query = mysql.format(query,table);
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"error" : true, "error_msg" : "Error executing MySQL query"});
            } else {
            	if(rows.length > 0){
                	data["error"] = false;
			        data["error_msg"] = 'Success..';
			        data["history"] = rows;
			        res.json(data);
			    }else{
		            data["error_msg"] = 'No History Found..';
		            res.json(data);
		        }
            }
        });
    });
}

module.exports = PRODUCT_ROUTER;
