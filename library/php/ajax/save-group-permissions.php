<?php
	
	include('../class.database.php');

	$id = $_REQUEST['id'];
	$permissions = $_REQUEST['perms'];

	// Delete all permission from group
	$dbh->db_query("DELETE FROM wack_group_permission WHERE wack_group_id = " . $id, true);

	foreach($permissions as $p) {
		$dbh->db_insert("wack_group_permission", Array(
			Array("wack_group_id", $id, false),
			Array("wack_permission_id", $p, false)
		));
	}

	echo $id;

?>