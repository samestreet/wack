<?php
	
	include('../class.database.php');

	$user = $_REQUEST['login'];

	$loginQ = $dbh->db_query("SELECT * FROM wack_user WHERE user_login = '" . $user . "' LIMIT 1");
	$loginC = $dbh->db_num_rows($loginQ);

	if($loginC == 0) {
		die("{error: 1}");
	} else {
		foreach($loginQ as $user) {
			$user_id = $user['wack_user_id'];
			$user_name = $user['user_real_name'];
			$user_name_array = explode(" ", $user_name);
			$user_first_name = $user_name_array[0];
			$customer = $user['customer_id'];
		}
		echo "{";
			echo "error: 0,";
			echo "id: " . $user_id . ",";
			echo "name: '" . $user_name . "',";
			echo "first_name: '" . $user_first_name . "',";
			echo "customer: " . $customer;
		echo "}";
	}

?>