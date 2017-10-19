<?php
	
	include('../class.database.php');
	
	$version = $dbh->version;

	$update_info = file_get_contents($dbh->update_server . "?version=" . $version);
	echo $update_info;

?>