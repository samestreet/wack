<?php
	
	include('../class.database.php');

	function downloadFile($url, $path) {
	    $newfname = $path;
	    $file = fopen ($url, 'rb');
	    if ($file) {
	        $newf = fopen ($newfname, 'wb');
	        if ($newf) {
	            while(!feof($file)) {
	                fwrite($newf, fread($file, 1024 * 8), 1024 * 8);
	            }
	        }
	    }
	    if ($file) {
	        fclose($file);
	    }
	    if ($newf) {
	        fclose($newf);
	    }
	}

	$file = $_REQUEST['file'];

	downloadFile($dbh->update_server . 'files/' . $file . '.zip', '../../../' . $file . '.zip');
	echo '..... ' . $dbh->update_server . 'files/' . $file . '.zip downloaded';
	chdir("../../../");
	shell_exec($extract_command . ' ' . $file . '.zip');
	unlink($file . '.zip');

?>