    <?php
session_start();
include "sch_db.php";

/*
------------------------------------
ONLY ADMIN CAN ACCESS
------------------------------------
*/

if (!isset($_SESSION["admin_id"])) {
    header("Location: admin.php");
    exit();
}

/*
------------------------------------
GET STUDENT ID
------------------------------------
*/

if (!isset($_GET["id"])) {
    die("Student ID not found");
}

$id = $_GET["id"];

/*
------------------------------------
DELETE STUDENT
------------------------------------
*/

$sql = "DELETE FROM students WHERE id=?";
$stmt = $pdo->prepare($sql);

if ($stmt->execute([$id])) {

    header("Location: verify.php");
    exit();

} else {

    echo "Failed to delete student";

}
?>