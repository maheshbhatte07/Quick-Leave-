<?php
include "../config/database.php";

$sql = "SELECT * FROM leaves";
$result = $conn->query($sql);

$data = [];

while($row = $result->fetch_assoc()){
    $data[] = $row;
}

echo json_encode($data);
?>