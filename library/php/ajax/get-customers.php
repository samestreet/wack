<?php
	
	include('../class.database.php');

	$customers = $dbh->db_query("SELECT * FROM customer ORDER BY customer_name");
	
	echo "[";
	foreach($customers as $c) {
		echo "{";
		echo "id: " . $c['customer_id'] . ",";
		echo "name: '" . $c['customer_name'] . "'";
		echo "},";
	}
	echo "]";

?>