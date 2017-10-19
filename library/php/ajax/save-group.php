<?php
	
	include('../class.database.php');

	$id = $_REQUEST['id'];
	$name = $_REQUEST['name'];
	$description = $_REQUEST['description'];

	if($id == 0) {
		// Insert group
		$uid = $dbh->db_insert("wack_group", Array(
			Array("group_name", $name, true),
			Array("group_description", $description, true),
			Array("group_admin", "0", false)
		));
	} else {
		// Update group
		$uid = $id;
		$dbh->db_update("wack_group", Array(
			Array("group_name", $name, true),
			Array("group_description", $description, true)
		),
			Array("wack_group_id = " . $id)
		);
	}

	echo $uid;

?>