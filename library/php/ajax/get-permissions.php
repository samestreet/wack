<?php
	
	include('../class.database.php');

	$prm = $dbh->db_query("SELECT * FROM wack_permission ORDER BY permission_name");
	
	echo "[";
	foreach($prm as $c) {
		echo "{";
		echo "id: " . $c['wack_permission_id'] . ",";
		echo "name: '" . $c['permission_name'] . "',";
		echo "type: '" . $c['permission_type'] . "',";
		echo "description: '" . (!empty($c['permission_description']) ? $c['permission_description'] : '<span style="color:#999">Sem Descrição</span>') . "'";
		echo "},";
	}
	echo "]";

?>