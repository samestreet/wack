<?php
	
	include('../class.database.php');

	$v = $_REQUEST['version'];

	if(file_exists("../../../update/scripts/" . $v . ".php")) {
		include("../../../update/scripts/" . $v . ".php");
		rename("../../../update/scripts/" . $v . ".php", "../../../update/scripts/" . $v . ".php_");
	} else {
		echo "0";
	}

?>