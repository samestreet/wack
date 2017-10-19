<?php
	
	include('../class.database.php');

	$user_id = $_REQUEST['user_id'];
	$password = $_REQUEST['password'];

	$loginQ = $dbh->db_query("SELECT * FROM wack_user WHERE wack_user_id = " . $user_id . " AND user_upwd = MD5('" . $password . "') LIMIT 1");
	$loginC = $dbh->db_num_rows($loginQ);

	if($loginC == 0) {
		die("{status: 0, error: 1}");
	} else {
		die("{status: 1, error: 0}");
	}

?>