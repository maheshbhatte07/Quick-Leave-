<?php
include "../config/database.php";

$userId = $_GET['userId'];

$sql = "SELECT * FROM leaves WHERE userId='$userId'";
$result = $conn->query($sql);

$leaves = [];

while($row = $result->fetch_assoc()){
    $leaves[] = $row;
}

echo json_encode($leaves);

?>
