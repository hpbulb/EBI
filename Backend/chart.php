<?php

require "sch_db.php";

$stmt = $pdo->query("
    SELECT month,total_students
    FROM student_stats
");

$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

header("Content-Type: application/json");

echo json_encode($data);