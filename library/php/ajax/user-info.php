<?php
	
	include('../class.database.php');

	$user = $_REQUEST['user'];
	$uid = $_REQUEST['uid'];

	$sqlcmd = "SELECT WU.*,C.customer_name FROM wack_user WU LEFT JOIN customer C ON(C.customer_id=WU.customer_id) " . ($uid != 0 ? "WHERE WU.wack_user_id = " . $uid : "") . " ORDER BY WU.wack_user_id";
	$userQ = $dbh->db_query($sqlcmd);

	echo "[";
	foreach($userQ as $user) {
		$groupQ = $dbh->db_query("SELECT WUG.*, WG.group_name FROM wack_user_group WUG LEFT JOIN wack_group WG ON(WG.wack_group_id=WUG.wack_group_id) WHERE WUG.wack_user_id = " . $user['wack_user_id']);
		echo "{";
		echo "uid: " . $user['wack_user_id'] . ",";
		echo "name: '" . $user['user_real_name'] . "',";
		echo "login: '" . $user['user_login'] . "',";
		echo "email: '" . $user['user_email'] . "',";
		echo "customer_id: " . $user['customer_id'] . ",";
		echo "customer: '" . $user['customer_name'] . "',";
		echo "groups: '";
		$groups = '';
		$groups_ids = '';
		foreach($groupQ as $gr) {
			$groups.= $gr['group_name'] . ", ";
			$groups_ids.= $gr['wack_group_id'] . ", ";
		}
		$groups = substr($groups,0,-2);
		$groups_ids = substr($groups_ids,0,-2);
		echo $groups;
		echo "',";
		echo "groups_ids: [" . $groups_ids . "]";
		echo "},";
	}
	echo "]";

?>