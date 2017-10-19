<?php
	
	$schemas = $_REQUEST['schemas'];
	$dbConfig = '';

	echo "{";
		echo "schemas: [";
		foreach($schemas as $s) {
			echo "'" . $s . "',";
			$dbConfig.= $s . ": ";
			$dbFile = file_get_contents("../../../application/database/config/" . $s . ".dbconfig");
			$dbConfig.= $dbFile . ",";
		}
		echo "],";
		echo "schemaConfig: {" . $dbConfig . "}";
	echo "}";

?>