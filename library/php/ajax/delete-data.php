<?php
	
	include('../class.database.php');

	$ct = $_POST['contentType'];
	$idList = $_POST['contentIDs'];
	$user = $_POST['user'];
	$mode = $_POST['mode'];
	$customer = $_POST['customer'];

	// Build a query string to locate content_type_id
	$ctQuery = " (SELECT content_type_id FROM content_type WHERE content_type_iname = '" . $ct . "' LIMIT 1) ";

	// Number of deleted content
	$deletedList = Array();

	// Warning list
	$warningList = Array();

	// Set content as 'deleted'
	foreach($idList as $id) {
		
		/* get all information about the content */
		$contentQ = $dbh->db_query("SELECT * FROM content WHERE content_id = " . $id . " LIMIT 1");
		foreach($contentQ as $content) $content_owner = $content['wack_user_id'];

		/* check if user has permission to delete this content */
		$req_permission = '';
		if($content_owner == 0) {
			$req_permission = 'delete_public_' . $ct;
		} elseif($content_owner != 0 && $content_owner != $user) {
			$req_permission = 'delete_other_' . $ct;
		} else {
			$req_permission = 'delete_self_' . $ct;
		}
		if($dbh->user_has_permission($user,$req_permission)) {
			$sqlcmd = "UPDATE content SET is_deleted = TRUE WHERE content_id = " . $id . " AND content_type_id = " . $ctQuery . " AND content_mode = '" . $mode . "' AND customer_id = " . $customer;
			$dbh->db_query($sqlcmd, true);
			array_push($deletedList,$id);
		} else {
			array_push($warningList,'User has no permission to delete content #' . $id);
		}
	}

	echo "{";
		echo "deleted: [";
		foreach($deletedList as $d) echo $d . ",";
		echo "],";
		echo "warning: [";
		foreach($warningList as $w) echo "'" . $w . "',";
		echo "]";
	echo "}";

?>