<?php
	
	include('../class.database.php');

	$id = $_REQUEST['id'];
	$customer = $_REQUEST['customer'];
	$real_name = $_REQUEST['real_name'];
	$login = $_REQUEST['login'];
	$group = $_REQUEST['group'];
	$email = $_REQUEST['email'];
	$join = $_REQUEST['join'];

	if($id == 0) {
		// Insert user
		$uid = $dbh->db_insert("wack_user", Array(
			Array("user_login", $login, true),
			Array("user_email", $email, true),
			Array("user_upwd", "MD5('123456')", false),
			Array("customer_id", $customer, false),
			Array("user_real_name", $real_name, true)
		));
		// Create group
		$group_id = $dbh->db_insert("wack_group", Array(
			Array("group_name", $group, true),
			Array("group_description", 'Grupo do Usuário ' . $login, true)
		));
		// Join groups (self group first)
		$dbh->db_insert("wack_user_group", Array(
			Array("wack_group_id", $group_id, false),
			Array("wack_user_id", $uid, false)
		));
		if(is_array($join)) {
			foreach($join as $j) {
				$dbh->db_insert("wack_user_group", Array(
					Array("wack_group_id", $j, false),
					Array("wack_user_id", $uid, false)
				));
			}
		}
	} else {
		// Update user
		$dbh->db_update("wack_user", Array(
			Array("user_login", $login, true),
			Array("user_email", $email, true),
			Array("user_upwd", "MD5('123456')", false),
			Array("customer_id", $customer, false),
			Array("user_real_name", $real_name, true)
		),
			Array("wack_user_id = " . $id)
		);
		$dbh->db_query("DELETE FROM wack_user_group WHERE wack_user_id = " . $id, true);
		if(is_array($join)) {
			foreach($join as $j) {
				$dbh->db_insert("wack_user_group", Array(
					Array("wack_group_id", $j, false),
					Array("wack_user_id", $id, false)
				));
			}
		}
	}

?>