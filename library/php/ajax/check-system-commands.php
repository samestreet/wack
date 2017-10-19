<?php
	
	include('../class.database.php');

	$commQ = $dbh->db_query("SELECT * FROM wack_syscomm ORDER BY datetime_add DESC");
	echo "[";
		foreach($commQ as $c) {
			echo "{";
				echo "id: " . $c['id'] . ",";
				echo "user: " . $c['wack_user_id'] . ",";
				echo "command: '" . $c['syscomm'] . "'";
			echo "}";
		}
	echo "]";
?>