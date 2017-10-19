<?php
	
	include('../class.database.php');

	/* getContent (Javascript/Ajax) request
		getContent({
			contentType: 'content',
			contentIDs: [1,2,3],
			query: [
				** First Case **
				[
					['title LIKE endrigo']
				],
				** Second Case (OR) **
				[
					['cliente_nasc >= 1985-01-01'],
					['cliente_nasc <= 2000-01-01']
				]
			],
			orderBy: 'title ASC',
			references: [
				['table', 'field']
			]
		})
	*/

	$contentType = $_POST['contentType'];
	$contentID = $_POST['contentIDs'];
	$query = $_POST['query'];
	$mode = $_POST['mode'];
	$user = $_POST['user'];
	$customer = $_POST['customer'];
	$orderBy = $_POST['orderBy'];
	$references = $_POST['references'];

	if(empty($orderBy)) {
		$orderBy = 'datetime_update DESC';
	}

	$ctQuery = " (SELECT content_type_id FROM content_type WHERE content_type_iname = '" . $contentType . "' LIMIT 1) ";
	$content = Array();
	$fields = Array();

	/* Function to get real values (cref, for example) */
	function format_value($val, $type) {
		global $dbh;
		$fv = $val;
		if($type == 'cref') {
			$content = $dbh->db_query("SELECT content_title FROM content WHERE content_id = " . $val . " LIMIT 1");
			foreach($content as $c) $fv = $c['content_title'];
		}
		return($fv);
	}

	function testOpr($opr, $v, $val, $aux) {
		$res = false;
		$val = str_replace("_", " ", $val);

		if( $opr == '==' || $opr == 'EQUALS' ) {
			if( $v == $val ) {
				$res = true;
			} else {
				$res = false;
			}
		}

		if( $opr == '>=' ) {
			if( $v >= $val ) {
				$res = true;
			} else {
				$res = false;
			}
		}

		if( $opr == '<=' ) {
			if( $v <= $val ) {
				$res = true;
			} else {
				$res = false;
			}
		}

		if( $opr == 'BETWEEN' ) {
			if( $v >= $val && $v <= $aux ) {
				$res = true;
			} else {
				$res = false;
			}
		}

		if( $opr == 'LIKE' || $opr == 'CONTAINS' ) {
			$v = strtolower($v);
			$val = strtolower($val);
			if( strpos($v, $val) !== FALSE ) {
				$res = true;
			} else {
				$res = false;
			}
		}

		echo "/* ..... " . ($res ? 'TRUE' : 'FALSE') . " ..... */\n";
		return($res);

	}

	/* Check if field_value matches 'query' parameter */
	function query_content($q, $content) {
		foreach($q as $where) {
			$match = 0;
			$clauses = count($where);
			foreach($where as $w) {
				$w_array = explode(" ", $w);
				$fld = $w_array[0];
				$opr = $w_array[1];
				$val = $w_array[2];
				$aux = $w_array[3];

				foreach($content['data'] as $tcd) {
					if( $tcd['field'] == str_replace("F.","",$fld) ) $v = $tcd['value'];
				}
				
				// Trocar os ifs abaixo por uma função parametrizada
				echo "\n/* Testing field data '" . $fld . "' with [[ " . $opr . " ]] - values '" . $v . "', '" . $val . "', '" . $aux . "' */\n";
				if( testOpr($opr, $v, $val, $aux) ) {
					$match++;
				} else {
					$match--;
				}

			}
		}

		if( $match > 0 ) return(true); else return(false);

	}

	// Get all content (and content_data) of this type
	$allContent = $dbh->db_query("SELECT T1.*, C.content_id, C.content_title AS title, C.datetime_add, C.datetime_update, C.wack_user_id, C.is_public, C.is_deleted, C.content_mode, C.customer_id FROM " . $contentType . " T1 LEFT JOIN content C ON(C.refer_id = T1.id) WHERE C.content_mode = '" . $mode . "' AND C.customer_id = " . $customer . " AND C.content_type_id = " . $ctQuery . " ORDER BY " . $orderBy);
	foreach($allContent as $c) {
		// ToDo: If user != 0 AND content.wack_user_id != user AND content.is_public == 0 then check_permissions (view_other_[content.iname])
		if( $user != 0 && $c['wack_user_id'] != $user && $c['is_public'] == 0 ) {
			$has_permission = $dbh->user_has_permission($user, 'view_other_' . $contentType);
		} else {
			$has_permission = true;
		}
		if( $has_permission ) {
			$temp_array = Array(
				'content_id' => $c['content_id'],
				'content_title' => $c['title'],
				'datetime_add' => $c['datetime_add'],
				'wack_user_id' => $c['wack_user_id'],
				'exclude' => 0,
				'data' => Array(
					Array('field' => 'title', 'value' => $c['title'], 'type' => 'varchar')
				)
			);
			$cData = $dbh->db_query("SELECT * FROM content_type_field WHERE content_type_id = " . $ctQuery);
			foreach($cData as $cd) {
				array_push($temp_array['data'], Array(
					'field' => $cd['field_iname'],
					'value' => $c[$cd['field_iname']],
					'type'  => $cd['field_type']
				));
			}
			array_push($content, $temp_array);
		}
	}

	// If contentID is not null, remove entries that are not in contentID list
	if( count($contentID) > 0 ) {
		foreach($contentID as $cid) {
			for($a=0; $a<count($content); $a++) {
				if( $content[$a]['content_id'] != $cid ) $content[$a]['exclude'] = 1;
			}
		}
	}

	// For each remaining content, make a query test to remove 'non-matches'
	for($a=0; $a<count($content); $a++) {
		$matches = 0;
		if( !$content[$a]['exclude'] ) {
			if(!empty($query) && count($query) > 0) {
				foreach($query as $qr) {
					$q = query_content($qr, $content[$a]);
					if($q) $matches++;
				}
				if($matches == 0) $content[$a]['exclude'] = 1;
			}
		}
	}

	echo "[";
	foreach($content as $c) {
		
		$userQ = $dbh->db_query("SELECT user_real_name FROM wack_user WHERE wack_user_id = " . $c['wack_user_id']);
		foreach($userQ as $u) $usuario_nome = $u['user_real_name'];

		$reflist = Array();
		if(is_array($references)) {
			foreach($references as $r) {
				$ref_tbl = $r[0];
				$ref_fld = $r[1];
				$refQ = $dbh->db_query("SELECT * FROM " . $ref_tbl . " WHERE " . $ref_fld . " = '" . $c['content_id'] . "'");
				$ref_count = $dbh->db_num_rows($refQ);
				array_push($reflist,Array($ref_tbl,$ref_count));
			}
		}

		if(!$c['exclude']) {
			echo "{";
				echo "id: " . $c['content_id'] . ", ";
				echo "title: '" . $c['content_title'] . "', ";
				echo "add: '" . $c['datetime_add'] . "', ";
				echo "user: {";
					echo "id: " . $c['wack_user_id'] . ",";
					echo "name: '" . $usuario_nome . "'";
				echo "},";
				echo "data: {";
					foreach($c['data'] as $cd) {
						echo $cd['field'] . ": {";
							echo "value: '" . $cd['value'] . "',";
							echo "friendlyValue: '" . format_value($cd['value'],$cd['type']) . "',";
							echo "type: '" . $cd['type'] . "',";
						echo "},";
					}
				echo "},";
				echo "references: {";
				foreach($reflist as $rf) {
					echo $rf[0] . ": {";
						echo "total: " . $rf[1];
					echo "},";
				}
				echo "}";
			echo "},";
		}
	}
	echo "]";

?>