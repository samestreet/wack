<?php
	
	include('../class.database.php');

	$cData = $_POST['cData'];

	/* Search content type to avoid duplicated entries */
	$search = $dbh->db_query("SELECT * FROM content_type WHERE content_type_iname = '" . $cData['id'] . "' LIMIT 1");
	if( $dbh->db_num_rows($search) > 0 ) {
		echo "{";
			echo "error: 1,";
			echo "message: 'content type already exists'";
		echo "}";
	} else {
		$content = $dbh->db_insert('content_type', Array(
			Array('content_type_iname', $cData['id'], true),
			Array('content_type_name', $cData['name'], true),
			Array('content_type_description', $cData['description'], true)
		));
		foreach($cData['fields'] as $f) {
			$dbh->db_insert('content_type_field', Array(
				Array('content_type_id', $content, true),
				Array('field_iname', $f['id'], true),
				Array('field_name', $f['name'], true),
				Array('field_description', $f['description'], true),
				Array('field_type', $f['type'], true),
				Array('field_size', $f['size'], false),
				Array('field_allow_null', $f['allowNull'], false),
				Array('field_default_value', $f['defaultValue'], true)
			));
		}
		echo "{";
			echo "error: 0,";
			echo "message: 'content type created with " . count($cData['fields']) . "' field(s)";
		echo "}";
	}

?>