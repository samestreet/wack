<?php
	
	include('../class.database.php');

	$ct = $_POST['dataSource'];
	$id = $_POST['id'];
	$data = $_POST['data'];
	$custom_fields = $_POST['custom_field'];

	$user = $_POST['user'];
	$mode = $_POST['mode'];
	$public = $_POST['public'];
	$customer = $_POST['customer'];

	// Build a query string to locate content_type_id
	$ctQuery = " (SELECT content_type_id FROM content_type WHERE content_type_iname = '" . $ct . "' LIMIT 1) ";

	// Array to store fields
	$fields = Array();

	// Array to store the correct data
	$saveData = Array();

	// Variable to store content title
	$title = '';

	// Retrieve field list from content type
	$ctFields = $dbh->db_query("SELECT * FROM content_type_field WHERE content_type_id = " . $ctQuery);
	foreach($ctFields as $f) {
		array_push($fields, Array(
			'name'		=> $f['field_iname'],
			'type'		=> $f['field_type'],
			'size'		=> $f['field_size'] ,
			'null'		=> $f['field_allow_null'],
			'default'	=> $f['field_default_value']
		));
	}

	// Format and Size Verification
	foreach($data as $d) {
		$fld = $d[0];
		$vlr = $d[1];
		if( $fld == 'title' ) $title = $vlr;
		foreach($fields as $f) {
			$field_type = $f['type'];
			if( $fld == $f['name'] ) {
				// Verify format using field type (ToDo)
				// Verify Size (If size is zero, means unlimited)
				if( strlen($vlr) > $f['size'] && $f['size'] > 0 ) $vlr = substr($vlr, 0, $f['size'] - 1);
				// Rewrite Values
				array_push($saveData, Array('field' => $fld, 'value' => $vlr));
			}
		}
	}

	if( $id == 0 ) {
		
		$permName = 'add_' . $ct;
		
		$dados = Array();
		foreach($fields as $f) {
			$sqlcmd_fields.= $f['name'] . ",";
			foreach($data as $d) {
				if($d[0] == $f['name']) array_push($dados, Array($f['name'], $d[1], true));
			}
		}

		// Insert content
		$regID = $dbh->db_insert($ct, $dados);
		$dbh->db_insert("content", Array(
			Array('content_title', $title, true),
			Array('datetime_add', 'NOW()', false),
			Array('is_public', $public, false),
			Array('wack_user_id', $user, false),
			Array('content_type_id', $ctQuery, false),
			Array('content_mode', $mode, true),
			Array('customer_id', $customer, false),
			Array('refer_id', $regID, false)
		));

		echo "{";
			echo "error: 0, ";
			echo "id: " . $regID . ", ";
			echo "db_action: 'add'";
		echo "}";
	
	} else {

		$permName = 'update_' . $ct;
		
		$dados = Array();
		foreach($fields as $f) {
			$sqlcmd_fields.= $f['name'] . ",";
			foreach($data as $d) {
				if($d[0] == $f['name']) array_push($dados, Array($f['name'], $d[1], true));
			}
		}

		// Update content
		$dbh->db_update($ct, $dados, Array("id = (SELECT refer_id FROM content WHERE content_id = " . $id . " AND content_type_id = " . $ctQuery . ")"));
		$dbh->db_update("content", Array(
			Array("datetime_update", "NOW()", false),
			Array("content_title", $title, true)
		), Array(
			"refer_id = " . $id,
			"content_type_id = " . $ctQuery
		));

		echo "{";
			echo "error: 0, ";
			echo "id: " . $id . ", ";
			echo "db_action: 'update'";
		echo "}";

	}

?>