var mysql = require("mysql");
const isset = require('isset');
var pad = require('pad-left');

function DAILY_ROUTER(router,connection,md5) {
    var self = this;
    self.handleRoutes(router,connection,md5);
}

DAILY_ROUTER.prototype.handleRoutes= function(router,connection,md5) {
    
    router.post("/daily/insert",function(req,res){
    	var data = {"error":true,
			    "error_msg":""};

        if (isset(req.body.uid) && isset(req.body.ccm)) {
        	var query = `SELECT kode_laporan FROM daily_report WHERE uid = ? AND tanggal 
	        			= DATE(CONVERT_TZ(CURDATE(),@@session.time_zone,'+07:00'))`;
	        var table = [req.body.uid];
        	query = mysql.format(query,table);
        	connection.query(query,function(err,rows){
        		if(err) {
		            res.json({"error" : true, "error_msg" : "Error executing MySQL query"});
		        } else {
		            if(rows.length > 0){
		              	data["error"] = true;
					    data["error_msg"] = 'Already submited';
					    res.json(data);
					}else{
						var query = `INSERT INTO daily_report (uid, tanggal, ccm) 
								    VALUES(?, CONVERT_TZ(NOW(),@@session.time_zone,'+07:00'), ?)`;
					    var table = [req.body.uid,req.body.ccm];
					    query = mysql.format(query,table);
					    connection.query(query,function(err,results){
					        if(err) {
					            res.json({"error" : true, "error_msg" : "Error executing MySQL query"});
					        } else {
					            var kode_report = 'LPD-' + (pad(results.insertId, 11, '0'));
								var query = `UPDATE daily_report SET kode_laporan = ? WHERE id = ?`;
								var table = [kode_report,results.insertId];
								query = mysql.format(query,table);
								connection.query(query,function(err){
									if (err) {
										console.log(err);
										res.json({"error" : true, "error_msg" : "Error executing MySQL query"});
									}else{
										data["error"] = false;
										data["error_msg"] = 'Report succesfuly submited';
										res.json(data);
									}
								});
					        }
					    });
					}
				}
			});
	    }else{
	    	data["error_msg"] = 'Missing some params..';
	        res.json(data);
	    }
    });

    router.get("/daily/:uid/:bulan/:tahun",function(req,res){
    	var data = {"error":true,
			    "error_msg":""};

        var query = `SELECT kode_laporan,uid,DATE_FORMAT(tanggal, '%d-%m-%Y') as tanggal,ccm
        			FROM daily_report WHERE uid = ? AND MONTH(tanggal) = ? AND YEAR(tanggal) = ?`;
        var table = [req.params.uid,req.params.bulan,req.params.tahun];
        query = mysql.format(query,table);
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"error" : true, "error_msg" : "Error executing MySQL query"});
            } else {
            	if(rows.length != 0){
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

    router.put("/daily/update",function(req,res){
    	var data = {"error":true,
			    "error_msg":""};

        if (isset(req.body.kode_laporan) && isset(req.body.ccm)) {
	        var query = `UPDATE daily_report SET ccm = ? WHERE kode_laporan = ?`;
	        var table = [req.body.ccm,req.body.kode_laporan];
	        query = mysql.format(query,table);
	        console.log(query);
	        connection.query(query,function(err,rows){
	            if(err) {
	                res.json({"error" : true, "error_msg" : "Error executing MySQL query"});
	            } else {
	            	data["error"] = false;
				    data["error_msg"] = 'Success..';
				    res.json(data);
	            }
	        });
	    }else{
	    	data["error_msg"] = 'Missing some params..';
		    res.json(data);
	    }
    });
}

module.exports = DAILY_ROUTER;
