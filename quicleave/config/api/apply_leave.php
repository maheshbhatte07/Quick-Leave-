<?php
include "../config/database.php";

$userId = $_POST['userId'];
$type = $_POST['leaveType'];
$start = $_POST['startDate'];
$end = $_POST['endDate'];
$reason = $_POST['reason'];

$sql = "INSERT INTO leaves(userId,leaveType,startDate,endDate,reason)
VALUES('$userId','$type','$start','$end','$reason')";

if($conn->query($sql)){
    echo json_encode(["status"=>"success"]);
}else{
    echo json_encode(["status"=>"error"]);
}
?>