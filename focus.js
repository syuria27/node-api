var mysql = require("mysql");
const isset = require('isset');
var moment = require('moment');

function FOCUS_ROUTER(router,pool) {
    var self = this;
    self.handleRoutes(router,pool);
}

FOCUS_ROUTER.prototype.handleRoutes= function(router,pool) {
    
    router.get("/focus/:uid",function(req,res){
    	var data = {"error":true,
			    "error_msg":""};

        var query = `SELECT * FROM product_focus WHERE kode_product NOT IN
        			(SELECT kode_product FROM focus_report WHERE uid = ?)`;
	    var table = [req.params.uid];
	    query = mysql.format(query,table);
	    pool.getConnection(function(err,connection){
		    connection.query(query,function(err,rows){
		        connection.release();
	            if(err) {
		            res.json({"error" : true, "error_msg" : "Error executing MySQL query"});
		        } else {
		            if(rows.length != 0){
		                data["error"] = false;
					    data["error_msg"] = 'Success..';
					    data["focuses"] = rows;
					    res.json(data);
					}else{
				        data["error_msg"] = 'No product Found..';
				        res.json(data);
				    }
				}
		    });
		});
	});

	router.post("/focus/report",function(req,res){
    	var data = {"error":true,
			    	"error_msg":""};
		
		if (isset(req.body.uid) && isset(req.body.focuses)) {
	        var prods = req.body.focuses;
			var tanggal = moment().format('YYYY-MM-DD');
			
			var jsonObj = JSON.parse(prods);
			var jsonArr = jsonObj['focuses'];
			var inserts = [];

			for(var i in jsonArr){
			  var kode_product = jsonArr[i]['kode_product'];
			  inserts.push([req.body.uid, tanggal, kode_product]);
			}

	        var query = `INSERT INTO focus_report 
	        			(uid, tanggal, kode_product) 
						VALUES ?`;
			var table = [inserts];
			query = mysql.format(query,table);
			console.log(query);
			pool.getConnection(function(err,connection){
			    connection.query(query,function(err){
				    connection.release();
	            	if(err) {
				    	console.log(err);
				        res.json({"error" : true, "error_msg" : "Error executing MySQL query"});
				    } else {
				        data["error"] = false;
						data["error_msg"] = 'Report succesfuly submited..';
						res.json(data);
					}
				});
			});
		}else{
			data["error_msg"] = 'Missing some params..';
	        res.json(data);
		}
	});

	/*router.put("/focus/update",function(req,res){
    	var data = {"error":true,
			    	"error_msg":""};
		
		if (isset(req.body.id) && isset(req.body.volume)) {
	        var query = `UPDATE product_report SET volume = ? WHERE id = ?`;
			var table = [req.body.volume,req.body.id];
			query = mysql.format(query,table);
			connection.query(query,function(err){
			    if(err) {
			    	console.log(err);
			        res.json({"error" : true, "error_msg" : "Error executing MySQL query"});
			    } else {
			        data["error"] = false;
					data["error_msg"] = 'Report succesfuly updated..';
					res.json(data);
				}
			});
		}else{
			data["error_msg"] = 'Missing some params..';
	        res.json(data);
		}
	});*/

	router.get("/focus/history/:uid/",function(req,res){
    	var data = {"error":true,
			    "error_msg":""};

        var query = `SELECT pr.id,pr.uid,DATE_FORMAT(pr.tanggal, '%d-%m-%Y') as tanggal,p.nama_product
        			FROM focus_report pr 
        			LEFT JOIN product_focus p ON pr.kode_product = p.kode_product  
        			WHERE pr.uid = ?`;
        var table = [req.params.uid,req.params.tanggal];
        query = mysql.format(query,table);
        pool.getConnection(function(err,connection){
		    connection.query(query,function(err,rows){
	            connection.release();
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
    });
}

module.exports = FOCUS_ROUTER;
