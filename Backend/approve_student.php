<?php

include "admin/sch_db.php";

$id = $_GET["id"];

$sql = "UPDATE students SET verified = 'verified' WHERE id = ?";

$stmt = $pdo->prepare($sql);

$stmt->execute([$id]);

session_start();

if (!isset($_SESSION["admin_id"])) {
    header("Location: admin_login.php");
    exit();
}
 echo "Student approved successfully! <a href='verify.php'>Go back</a>";
?>
