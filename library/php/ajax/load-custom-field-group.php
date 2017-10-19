<?php

	include('../class.database.php');

	$group = $_POST['group'];

	$gQuery = "(SELECT custom_field_group_id FROM custom_field_group WHERE group_id = '" . $group . "' LIMIT 1)";
	$fields = $dbh->db_query("SELECT * FROM custom_field WHERE custom_field_group_id = " . $gQuery);

	foreach($fields as $f) {
		echo $f['field_id'] . ": new TextBox({icon: null, blockSize: " . $f['field_size'] . ", label: 'Custom Field', placeholder: '" . $f['field_help'] . "', attributes: {custom_field_id: " . $f['custom_field_id'] . "} }),";
	}

?>