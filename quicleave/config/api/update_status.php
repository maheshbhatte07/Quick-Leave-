<?php
include "../config/database.php";

$id = $_POST['leaveId'];
$status = $_POST['status'];

$sql = "UPDATE leaves SET status='$status' WHERE id='$id'";

if($conn->query($sql)){
    echo json_encode(["status"=>"updated"]);
}else{
    echo json_encode(["status"=>"error"]);
}

?>