<?php
	
	include('../class.database.php');

	$content = $_POST['content'];
	$cData = $_POST['cData'];

	$migrations = Array();

	$ctQuery = "(SELECT content_type_id FROM content_type WHERE content_type_iname = '" . $content . "' LIMIT 1)";

	/* Search content type migrations */
	$search = $dbh->db_query("SELECT * FROM content_type_migration WHERE content_type_id = (SELECT content_type_id FROM content_type WHERE content_type_iname = '" . $content . "' LIMIT 1)");
	foreach($search as $s) {
		array_push($migrations, $s['migration_name']);
	}

	foreach($cData as $mig) {
		if( array_search($mig[1], $migrations) === FALSE ) {
			$fname = str_replace("-","",$mig[0]) . "_" . str_replace(" ","-",$mig[1]) . "_" . $content . ".migration";
			echo "/* migrate: " . str_replace("-","",$mig[0]) . "_" . str_replace(" ","-",$mig[1]) . "_" . $content . ".migration */\n";
			$fp = file_get_contents('../../../application/database/migration/' . $fname);
			$fp = str_replace("\n","",$fp);
			$lines = explode(";",$fp);
			
			echo "/* Commands Found: " . (count($lines) - 1) . " */ \n";

			for($a=0; $a<count($lines); $a++) {
				$command_line = $lines[$a];
				echo "/* " . $lines[$a] . " */\n";
				$command_line = str_replace("\n","",$command_line);
				$cmds = explode("@", $command_line);
				$cmd = $cmds[0];
				$params = explode(",", $cmds[1]);
				$args = Array();

				for($a=0;$a<count($params);$a++) $params[$a] = trim($params[$a]);

				foreach($params as $p) {
					$temp_array = explode(":", $p);
					$args[$temp_array[0]] = $temp_array[1];
				}

				switch(strtolower($cmd)) {

					case 'addfield':
						$field_iname = ( isset($args['iname']) ? $args['iname'] : null);
						$field_name = ( isset($args['name']) ? $args['name'] : null);
						$field_description = ( isset($args['description']) ? $args['description'] : null);
						$field_type = ( isset($args['type']) ? $args['type'] : null);
						$field_size = ( isset($args['size']) ? $args['size'] : '0');
						$field_null = ( isset($args['can_be_null']) ? $args['can_be_null'] : null);
						$field_default = ( isset($args['default_value']) ? $args['default_value'] : null);
						echo "/* Add Field: " . $field_iname . " (" . $field_type . ") */ \n";
						if( $field_iname == null || $field_name == null || $field_type == null ) {
							echo "{";
								echo "error: 1,";
								echo "message: 'Field iname, name and type cannot be null'";
							echo "}";
							die("/* FATAL ERROR */");
						} else {
							$new_field_id = $dbh->db_insert('content_type_field', Array(
								Array('content_type_id', "(SELECT content_type_id FROM content_type WHERE content_type_iname = '" . $content . "' LIMIT 1)", false),
								Array('field_iname', $field_iname, true),
								Array('field_name', $field_name, true),
								Array('field_description', $field_description, true),
								Array('field_type', $field_type, true),
								Array('field_size', $field_size, false),
								Array('field_allow_null', $field_null, false),
								Array('field_default_value', $field_default, true)
							));
							echo "..... Command [  OK  ] \n";
							// Add default or null value for all content
							$contentQ = $dbh->db_query("SELECT content_id FROM content WHERE content_type_id = " . $ctQuery);
							foreach($contentQ as $c) {
								$dbh->db_insert("content_data", Array(
									Array('content_id', $c['content_id'], false),
									Array('content_type_field_id', $new_field_id, false),
									Array('field_value', (!empty($field_default) ? $field_default : ''), true)
								));
							}
							echo "..... Data Update [  OK  ] \n";
						}
					break;

					case 'dropfield':
						$field_iname = ( isset($args['iname']) ? $args['iname'] : null);
						echo "/* Drop Field: " . $field_iname . " */ \n";
						if( $field_iname == null ) {
							echo "{";
								echo "error: 1,";
								echo "message: 'Field iname, name and type cannot be null'";
							echo "}";
							die("/* FATAL ERROR */");
						} else {
							$search_field = $dbh->db_query("SELECT content_type_field_id FROM content_type_field WHERE field_iname = '" . $field_iname . "' AND content_type_id = (SELECT content_type_id FROM content_type WHERE content_type_iname = '" . $content . "' LIMIT 1)");
							foreach($search_field as $sf) $field_id = $sf['content_type_field_id'];
							$dbh->db_query("DELETE FROM content_type_field WHERE content_type_field_id = " . $field_id, true);
							$dbh->db_query("DELETE FROM content_data WHERE content_type_field_id = " . $field_id);
						}
					break;

					default:
						echo "/* Unknown Command: " . $cmd . " (skipped) */ \n";
					break;
				}
			}

			/* add migration entry to database (content_type_migration) */
			$dbh->db_insert('content_type_migration', Array(
				Array('content_type_id', "(SELECT content_type_id FROM content_type WHERE content_type_iname = '" . $content . "' LIMIT 1)", false),
				Array('migration_name', $mig[1], true),
				Array('datetime_add', 'NOW()', false)
			));
		}
	}
?>