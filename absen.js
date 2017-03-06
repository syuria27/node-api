var mysql = require("mysql");
var moment = require('moment');
const isset = require('isset');
var fs = require( 'fs' );
var pad = require('pad-left');

function ABSEN_ROUTER(router,pool) {
    var self = this;
    self.handleRoutes(router,pool);
}

ABSEN_ROUTER.prototype.handleRoutes= function(router,pool) {
    router.get("/",function(req,res){
        res.json({"Message" : "Hello World !"});
    });

    router.get("/absen/pulang/:uid/:bulan/:tahun",function(req,res){
    	var data = {"error":true,
			    "error_msg":""};

        var query = `SELECT kode_absen,uid,tanggal,jam_pulang,lokasi_pulang
        			FROM absen WHERE uid = ? AND MONTH(tanggal) = ? AND YEAR(tanggal) = ?`;
        var table = [req.params.uid,req.params.bulan,req.params.tahun];
        query = mysql.format(query,table);
        pool.getConnection(function(err,connection){
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
    });

    router.get("/absen/masuk/:uid/:bulan/:tahun",function(req,res){
    	var data = {"error":true,
			    "error_msg":""};

        var query = `SELECT kode_absen,uid,tanggal,jam_masuk,lokasi_masuk
        			FROM absen WHERE uid = ? AND MONTH(tanggal) = ? AND YEAR(tanggal) = ?`;
        var table = [req.params.uid,req.params.bulan,req.params.tahun];
        query = mysql.format(query,table);
        pool.getConnection(function(err,connection){
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
    });

    router.post("/absen/masuk",function(req,res){
    	var data = {"error":true,
			    "error_msg":""};

		if (isset(req.body.uid) && isset(req.body.lokasi) && isset(req.body.photo)) {
			var a = moment().format('H:m:s');
			var b = "08:37:00";
			var aa1 = a.split(":");
			var aa2 = b.split(":");

			var d1 = new Date(parseInt("2001",10),(parseInt("01",10))-1,parseInt("01",10),parseInt(aa1[0],10),parseInt(aa1[1],10),parseInt(aa1[2],10));
			var d2 = new Date(parseInt("2001",10),(parseInt("01",10))-1,parseInt("01",10),parseInt(aa2[0],10),parseInt(aa2[1],10),parseInt(aa2[2],10));
			var dd1 = d1.valueOf();
			var dd2 = d2.valueOf();
			
	        if (false/*dd1 > dd2*/) {
	        	data["error_msg"] = 'Lewat waktu absen';
	        	res.json(data);	
	        }else{
	        	var query = `SELECT kode_absen FROM absen WHERE uid = ? AND tanggal 
	        				= DATE(CONVERT_TZ(CURDATE(),@@session.time_zone,'+07:00'))`;
	        	var table = [req.body.uid];
        		query = mysql.format(query,table);
        		pool.getConnection(function(err,connection){
		    		connection.query(query,function(err,rows){
	        			if(err) {
			                res.json({"error" : true, "error_msg" : "Error executing MySQL query"});
			            } else {
			                if(rows.length > 0){
			                	data["error"] = true;
						        data["error_msg"] = 'Already absen';
						        res.json(data);
						    }else{
						    	var query = `INSERT INTO absen (uid, tanggal, jam_masuk, lokasi_masuk) 
						    				VALUES(?, CONVERT_TZ(NOW(),@@session.time_zone,'+07:00'), 
						    				CONVERT_TZ(NOW(),@@session.time_zone,'+07:00'), ?)`;
					        	var table = [req.body.uid,req.body.lokasi];
				        		query = mysql.format(query,table);
				        		pool.getConnection(function(err,connection){
			    					connection.query(query,function(err,results){
					        			if(err) {
					        				console.log(err);
							                res.json({"error" : true, "error_msg" : "Error executing MySQL query"});
							            } else {
							            	var kode_absen = 'ABS-' + (pad(results.insertId, 11, '0'));
							            	var query = `UPDATE absen SET kode_absen = ? WHERE id = ?`;
								        	var table = [kode_absen,results.insertId];
							        		query = mysql.format(query,table);
							        		pool.getConnection(function(err,connection){
			    								connection.query(query,function(err){
								        			if (err) {
								        				console.log(err);
								                		res.json({"error" : true, "error_msg" : "Error executing MySQL query"});
								        			}else{
								        				fs.writeFile('./upload/'+kode_absen+'-M.jpeg', req.body.photo, 'base64', function(err) {
														    console.log(err);
														});
														data["error"] = false;
										            	data["error_msg"] = 'Absen succesfuly submited';
									            		res.json(data);
										        	}
								        		});
								        	});
							            }
							        });
							    });
					        }
			            }
	        		});
	        	});
	        }
	    }else{
	    	data["error_msg"] = 'Missing some params..';
	        res.json(data);
	    }
    });

    router.post("/absen/pulang",function(req,res){
    	var data = {"error":true,
			    "error_msg":""};

		if (isset(req.body.uid) && isset(req.body.lokasi) && isset(req.body.photo)) {
			var a = moment().format('H:m:s');
			var b = "16:37:00";
			var aa1 = a.split(":");
			var aa2 = b.split(":");

			var d1 = new Date(parseInt("2001",10),(parseInt("01",10))-1,parseInt("01",10),parseInt(aa1[0],10),parseInt(aa1[1],10),parseInt(aa1[2],10));
			var d2 = new Date(parseInt("2001",10),(parseInt("01",10))-1,parseInt("01",10),parseInt(aa2[0],10),parseInt(aa2[1],10),parseInt(aa2[2],10));
			var dd1 = d1.valueOf();
			var dd2 = d2.valueOf();
			
	        if (false/*dd1 < dd2*/) {
	        	data["error_msg"] = 'Belum masuk waktu absen';
	        	res.json(data);	
	        }else{
	        	var query = `SELECT kode_absen FROM absen WHERE uid = ? AND tanggal 
	        				= DATE(CONVERT_TZ(CURDATE(),@@session.time_zone,'+07:00'))`;
	        	var table = [req.body.uid];
        		query = mysql.format(query,table);
        		pool.getConnection(function(err,connection){
			    	connection.query(query,function(err,rows){
	        			if(err) {
			                res.json({"error" : true, "error_msg" : "Error executing MySQL query"});
			            } else {
			                if(rows.length == 0){
			                	data["error"] = true;
						        data["error_msg"] = 'anda sudah telat hari ini';
						        res.json(data);
						    }else{
						    	var query = `SELECT kode_absen,jam_pulang FROM absen 
						    				WHERE kode_absen = ?`;
					        	var table = [rows[0].kode_absen];
				        		query = mysql.format(query,table);
				        		pool.getConnection(function(err,connection){
			    					connection.query(query,function(err,rows){
								    	if(err){
								    		res.json({"error" : true, "error_msg" : "Error executing MySQL query"});
								    	}else{
								    		if (rows[0].jam_pulang !== null) {
								    			data["error"] = true;
										        data["error_msg"] = 'anda sudah absen';
										        res.json(data);
								    		}else{
								    			var kode_absen = rows[0].kode_absen;
										    	var query = `UPDATE absen SET jam_pulang = CONVERT_TZ(NOW(),@@session.time_zone,'+07:00'),
										    				 lokasi_pulang = ? WHERE kode_absen = ?`;
									        	var table = [req.body.lokasi,kode_absen];
								        		query = mysql.format(query,table);
								        		pool.getConnection(function(err,connection){
			    									connection.query(query,function(err,results){
									        			if(err) {
									        				console.log(err);
											                res.json({"error" : true, "error_msg" : "Error executing MySQL query"});
											            } else {
											           		fs.writeFile('./upload/'+kode_absen+'-P.jpeg', req.body.photo, 'base64', function(err) {
														    console.log(err);
															});
															data["error"] = false;
											            	data["error_msg"] = 'Absen succesfuly submited';
											            	res.json(data);
													    }
											        });
											    });
								    		}
								    	}
								    });
								});
					        }
			            }
	        		});
	        	});
	        }
	    }else{
	    	data["error_msg"] = 'Missing some params..';
	        res.json(data);
	    }
    });
}

module.exports = ABSEN_ROUTER;
