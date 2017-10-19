<?php
	
	include('../class.database.php');

	$user = $_REQUEST['user'];
	$permissions = $_REQUEST['permissions'];

	echo "\n /* checking permissions for user " . $user . " */ \n";

	if($user == 0) {
		die("{error:1, message: 'Invalid User'}");
	}

	/* get all groups from user */
	$pQuery = "(SELECT wack_permission_id FROM wack_permission WHERE permission_name = '[p]' LIMIT 1)";
	$groupQ = $dbh->db_query("SELECT WUG.wack_group_id, WG.group_admin FROM wack_user_group WUG LEFT JOIN wack_group WG ON(WG.wack_group_id = WUG.wack_group_id) WHERE WUG.wack_user_id = " . $user);

	/* store groups check if any group is admin */
	$groups = Array();
	$is_admin = false;
	foreach($groupQ as $g) {
		array_push($groups, $g['wack_group_id']);
		if($g['group_admin']) $is_admin = true;
	}

	/* if any group is admin, return true for all permissions */
	if($is_admin) {
		echo "{";
		foreach($permissions as $p) {
			echo $p . ": true,";
		}
		echo "}";
	} else {

		/* for each required permission, locate permission_id and check wack_group_permission table */
		echo "{";
		foreach($permissions as $p) {
			$found = false;
			$permQ = $dbh->db_query("SELECT wack_permission_id FROM wack_permission WHERE permission_name = '" . $p . "' LIMIT 1");
			$permC = $dbh->db_num_rows($permQ);
			if($permC == 0) {
				echo $p . ": false,";
			} else {
				foreach($permQ as $prm) $permission_id = $prm['wack_permission_id'];
				foreach($groups as $g) {
					$testQ = $dbh->db_query("SELECT wack_group_permission_id FROM wack_group_permission WHERE wack_group_id = " . $g . " AND wack_permission_id = " . $permission_id . " LIMIT 1");
					$testC = $dbh->db_num_rows($testQ);
					if($testC > 0) {
						$found = true;
					}
				}
			}
			echo $p . ": " . ($found ? 'true' : 'false') . ",";
		}
		echo "}";
	}

?>