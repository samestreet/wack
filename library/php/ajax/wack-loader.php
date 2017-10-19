<?php
	
	$language = $_REQUEST['language'];
	$library = $_REQUEST['library'];

	echo "{";

		/* load language file and echo it as a javascript variable */
		$lang_fp = file_get_contents("../../../resources/languages/wack_" . $language . '.wlng');
		echo "language:" . $lang_fp . ",";

		/* load all shared libraries and echo as a javascript string to be evaluated later */
		echo "library: [";
		foreach($library as $l) {
			if($l[2]) {
				$script_fp = file_get_contents("../../../library/js/shared/" . $l[1] . ".js");
				echo "function() {" . $script_fp . "},";
			}
		}
		echo "]";

	echo "}";

?>