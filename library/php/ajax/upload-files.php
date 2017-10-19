<?php
	
	//include('../class.database.php');

	$uploaded = Array();
	$today_year = date('Y');
	$today_month = date('m');
	$today_day = date('d');
	$today_folder = $today_year . $today_month . $today_day;

	if(!is_dir("../../../resources/uploads/" . $today_folder)) {
		mkdir("../../../resources/uploads/" . $today_folder);
	}

	foreach($_FILES as $file) {
		$count = 0;
		$new_file = $file['name'] . ($count > 0 ? $count : '');
		$ready = false;
		while(!$ready) {
			if(file_exists("../../../resources/uploads/" . $today_folder . "/" . $new_file)) {
				$count++;
				$new_file = ($count > 0 ? '(' . $count . ')' : '') . $file['name'];
			} else {
				$ready = true;
			}
		}
		move_uploaded_file($file['tmp_name'], "../../../resources/uploads/" . $today_folder . "/" . $new_file);
		if(file_exists("../../../resources/uploads/" . $today_folder . "/" . $file['name'])) array_push($uploaded, Array('name' => $new_file, 'size' => $file['size']) );
	}
	
    echo "[";
    foreach($uploaded as $u) {
    	echo "{";
    		echo "name: '" . $u['name'] . "',";
    		echo "size: " . $u['size'];
    	echo "},";
    }
    echo "]";

?>