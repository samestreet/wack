<?php
	
	include('../class.database.php');

	$id = ( isset($_REQUEST['id']) ? $_REQUEST['id'] : 0 );
	$groups = $dbh->db_query("SELECT WG.*, (SELECT COUNT(*) FROM wack_user_group WHERE wack_group_id = WG.wack_group_id) AS GroupMembers FROM wack_group WG " . ($id != 0 ? "WHERE WG.wack_group_id = " . $id : "") . " ORDER BY WG.group_name");
	
	echo "[";
	foreach($groups as $g) {
		$permQ = $dbh->db_query("SELECT wack_permission_id FROM wack_group_permission WHERE wack_group_id = " . $g['wack_group_id']);
		$permissions = '';
		foreach($permQ as $p) $permissions.= $p['wack_permission_id'] . ",";
		$permissions = substr($permissions,0,-1);
		echo "{";
		echo "id: " . $g['wack_group_id'] . ",";
		echo "name: '" . $g['group_name'] . "',";
		echo "description: '" . $g['group_description'] . "',";
		echo "admin: " . ($g['group_admin'] ? "true" : "false") . ",";
		echo "members: " . $g['GroupMembers'] . ",";
		echo "permissions: [" . $permissions . "]";
		echo "},";
	}
	echo "]";

?>