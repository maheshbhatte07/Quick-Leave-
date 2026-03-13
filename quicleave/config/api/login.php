<?php

include "../config/database.php";

$userId = $_POST['userId'];
$password = $_POST['password'];
$userType = $_POST['userType'];

$sql = "SELECT * FROM users WHERE userId='$userId' AND role='$userType'";
$result = $conn->query($sql);

if($result->num_rows > 0){

    $user = $result->fetch_assoc();

    if($user['password'] == $password){

        echo json_encode([
            "status" => "success",
            "user" => $user
        ]);

    }else{
        echo json_encode([
            "status"=>"error",
            "message"=>"Incorrect password"
        ]);
    }

}else{

    echo json_encode([
        "status"=>"error",
        "message"=>"User not found"
    ]);

}

?>