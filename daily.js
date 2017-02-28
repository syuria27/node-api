var mysql = require("mysql");
const isset = require('isset');

function DAILY_ROUTER(router,connection,md5) {
    var self = this;
    self.handleRoutes(router,connection,md5);
}

DAILY_ROUTER.prototype.handleRoutes= function(router,connection,md5) {
    
    router.post("/daily",function(req,res){
    	var data = {"error":true,
			    "error_msg":""};

        if (isset(req.body.uid) && isset(req.body.ccm)) {
			var query = `SELECT kode_spg,nama_spg,nama_toko,depot,password FROM t_user u
	         			LEFT JOIN t_login l ON u.kode_spg = l.username 
	         			WHERE u.kode_spg = ? AND l.hak_akses = 'User'`;
	        var table = [req.body.username];
	        query = mysql.format(query,table);
	        connection.query(query,function(err,rows){
	            if(err) {
	                res.json({"error" : true, "error_msg" : "Error executing MySQL query"});
	            } else {
	                if(rows.length != 0){
	                	if (rows[0].password == md5(req.body.password)) {
				            data["error"] = false;
				            data["error_msg"] = 'Success..';
				            data["user"] = rows[0];
				            res.json(data);
				        }else{
				        	data["error_msg"] = 'Login Gagal Cek password..';
			            	res.json(data);
				        }
			        }else{
			            data["error_msg"] = 'No users Found..';
			            res.json(data);
			        }
	            }
	        });
	    }else{
	    	data["error_msg"] = 'Missing some params..';
	        res.json(data);
	    }
    });
}

module.exports = DAILY_ROUTER;
