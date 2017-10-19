<?php

	/*if( !isset($_REQUEST['maintenance']) ) die("Manutenção");*/

	if(!file_exists("install.log")) header("Location: install/");

	include("library/php/class.database.php");

	if(!file_exists("update/scripts/_script_file_table.log")) {
		include("update/scripts/201709261615_create_update_script_table.php");
		file_put_contents("update/scripts/_script_file_table.log", "script_file table created");
	}

	$update_files = scandir("update/scripts");
	foreach($update_files as $u) {
		if($u != "." && $u != ".." && strpos($u,".php") !== FALSE && $u != "201709261615_create_update_script_table.php") {
			$updQ = $dbh->db_query("SELECT * FROM update_script WHERE update_file = '" . $u . "' LIMIT 1");
			$updC = $dbh->db_num_rows($updQ);
			if($updC == 0) {
				include("update/scripts/" . $u);
				$dbh->db_insert("update_script", Array(
					Array("update_file", $u, true),
					Array("datetime_run", "NOW()", false)
				));
				file_put_contents("update/scripts/update.log", $u . "\n");
			}
		}
	}

?>
<!doctype html>
<html>
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=1.0" />
		<link href="./resources/fonts/icomoon/style.css" rel="stylesheet" type="text/css" />
		<link href="./library/css/style.css" rel="stylesheet" type="text/css" />
		<link href="./library/css/loader.css" rel="stylesheet" type="text/css" />
		<link rel="apple-touch-icon" sizes="57x57" href="./resources/icons/apple-icon-57x57.png">
		<link rel="apple-touch-icon" sizes="60x60" href="./resources/icons/apple-icon-60x60.png">
		<link rel="apple-touch-icon" sizes="72x72" href="./resources/icons/apple-icon-72x72.png">
		<link rel="apple-touch-icon" sizes="76x76" href="./resources/icons/apple-icon-76x76.png">
		<link rel="apple-touch-icon" sizes="114x114" href="./resources/icons/apple-icon-114x114.png">
		<link rel="apple-touch-icon" sizes="120x120" href="./resources/icons/apple-icon-120x120.png">
		<link rel="apple-touch-icon" sizes="144x144" href="./resources/icons/apple-icon-144x144.png">
		<link rel="apple-touch-icon" sizes="152x152" href="./resources/icons/apple-icon-152x152.png">
		<link rel="apple-touch-icon" sizes="180x180" href="./resources/icons/apple-icon-180x180.png">
		<link rel="icon" type="image/png" sizes="192x192"  href="./resources/icons/android-icon-192x192.png">
		<link rel="icon" type="image/png" sizes="32x32" href="./resources/icons/favicon-32x32.png">
		<link rel="icon" type="image/png" sizes="96x96" href="./resources/icons/favicon-96x96.png">
		<link rel="icon" type="image/png" sizes="16x16" href="./resources/icons/favicon-16x16.png">
		<link rel="manifest" href="./resources/icons/manifest.json">
		<meta name="msapplication-TileColor" content="#ffffff">
		<meta name="msapplication-TileImage" content="./resources/icons/ms-icon-144x144.png">
		<meta name="theme-color" content="#ffffff">
		<title>W.A.C.K Pro</title>
		<script src="./library/js/jquery-3.2.1.min.js" type="text/javascript"></script>
		<script src="./library/js/shared/Chart.js-master/dist/Chart.bundle.js" type="text/javascript"></script>
		<script src="./library/js/moment-locales.js" type="text/javascript"></script>
		<script src="./library/js/wack-objects.js" type="text/javascript"></script>
		<script src="./library/js/wack-database.js" type="text/javascript"></script>
		<script src="./library/js/wack.js" type="text/javascript"></script>
	</head>

	<body>
		<div class="all" id="app" lastWidth="0" lastHeight="0">
			
			<!-- Loader -->
			<div class="all fixed loadingScreen">
				<div id="loader">
					<div class="circle"></div>
					<div class="circle1"></div>
					<div class="wackAnimation">
						<span id="w">W</span>
						<span id="a">A</span>
						<span id="c">C</span>
						<span id="k">K</span>
					</div>
				</div>
				<div id="footerLoader"></div>
			</div>
			
		</div>
	</body>
</html>