<?php

	if( isset($_REQUEST['database']) ) {
		$database = $_REQUEST['database'];
		$database_host = $database[0];
		$database_user = $database[1];
		$database_pass = $database[2];
		$database_name = $database[3];
		$database_port = $database[4];
	} else {
		if(file_exists("library/php/config.local.php")) include("library/php/config.local.php"); else die("Database Error: " . getcwd());
	}

	/* PDO Class - Connect and communicate with MySQL database 
		* Initialize with 'config.local.php' variables
		* Function db_delete
		* Function register_content_type
		* Function content_type_migration
	*/

	class WackConnector {

		private $db_host;
		private $db_user;
		private $db_pass;
		private $db_name;
		private $db_port;
		private $dbconn;

		/* Class Constructor
			* Connect to database
		*/
		public function __construct() {
			
			global $database_host;
			global $database_user;
			global $database_pass;
			global $database_name;
			global $database_port;

			$this->db_host = $database_host;
			$this->db_user = $database_user;
			$this->db_pass = $database_pass;
			$this->db_name = $database_name;
			$this->db_port = $database_port;

			try {
				$this->dbconn = new PDO('mysql:dbname=' . $this->db_name . ';host=' . $this->db_host . ';port=' . $this->db_port, $this->db_user, $this->db_pass);
				$this->dbconn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
			}
			catch(PDOException $e) {
				die('WackConnector Error: Unable to connect to mysql database!<p>' . $e->getMessage() . '</p>');
			}

		}

		/* Function: db_query
			* Perform a database query and return rows
		*/
		public function db_query( $sqlcmd, $nonquery = false ) {
			try {
				$query = $this->dbconn->prepare($sqlcmd);
				$query->execute();
				if($nonquery) return(true); else return($query->fetchAll());
			} catch(PDOException $e) {
				die('WackConnector Error: Unable to execute db_query!<p>' . $e->getMessage() . '</p><p>' . $sqlcmd . '</p>');	
			}
		}

		/* Function: db_insert
			* Insert data into database and return LAST_INSERT_ID()
			* Parameters:
			* table ( string )
			* data ( array [field_iname ( string ), field_value ( string ), quotes ( bool )] )
		*/
		function db_insert($table, $data) {
			$fields = '';
			$values = '';
			$sqlcmd = "INSERT INTO " . $table . "(";
			
			foreach($data as $d) {
				$fields.= $d[0] . ",";
				$values.= ($d[2] ? "'" : "") . $d[1] . ($d[2] ? "'" : "") . ",";
			}
			
			$fields = substr($fields,0,-1);
			$values = substr($values,0,-1);
			$sqlcmd.= $fields . ") ";
			$sqlcmd.= "VALUES(" . $values . ")";
			
			try {
				$query = $this->dbconn->prepare($sqlcmd);
				$query->execute();
				$lidQ = $this->db_query("SELECT LAST_INSERT_ID() AS id FROM " . $table);
				foreach($lidQ as $l) $id = $l['id'];
				return($id);
			} catch(PDOException $e) {
				die('WackConnector Error: Unable to execute db_insert!<p>' . $e->getMessage() . '</p><p>' . $sqlcmd . '</p>');			
			}
		}

		/* Function: db_update
			* Update database data
			* Parameters:
			* table ( string )
			* data ( array [field_iname ( string ), field_value ( string ), quotes ( bool )] )
			* where ( array )
		*/
		function db_update($table, $data, $where, $caution = false) {
			$values = '';
			$where_string = '';
			$sqlcmd = "UPDATE " . $table . " SET ";
			
			foreach($data as $d) {
				$values.= $d[0] . ' = ' . ($d[2] ? "'" : "") . $d[1] . ($d[2] ? "'" : "") . ",";
			}
			
			$values = substr($values,0,-1);
			$sqlcmd.= $values;
			
			if( is_array($where) && count($where) > 0 ) {
				$where_string = " WHERE ";
				foreach($where as $w) $where_string.= $w . " AND ";
			}

			if( strlen($where_string) > 0 ) {
				$where_string = substr($where_string,0,-5);
				$sqlcmd.= $where_string;
			}

			try {
				if(strlen($where_string) > 0 || (strlen($where_string) == 0 && $caution) ) {
					$query = $this->dbconn->prepare($sqlcmd);
					$query->execute();
				}
			} catch(PDOException $e) {
				die('WackConnector Error: Unable to execute db_update!<p>' . $e->getMessage() . '</p><p>' . $sqlcmd . '</p>');			
			}
		}

		/* Function: db_delete
			* Delete data from database
			* Parameters:
			* table ( string )
			* where ( array )
		*/
		function db_delete($table, $where) {

		}

		function db_num_rows($rows) {
			return( ($rows != false ? count($rows) : 0) );
		}

		/* Function: register_content_type
			* Register a new content type and fields
			* Parameters:
			* iname ( string )
			* name ( string )
			* description ( string )
			* field_data ( Array [iname ( string ), name ( string ), description (string ), field_type ( string ), allow_null ( bool ), default_value ( string )] )
		*/
		function register_content_type($iname, $name, $description, $field_data) {

		}

		function user_has_permission($userID, $permission) {
			return(true);
		}		
	}

	$dbh = new WackConnector();

?>