<?php

include "sch_db.php";

$sql = "SELECT * FROM students WHERE verified = 'pending'";
$stmt = $pdo->query($sql);

session_start();

if (!isset($_SESSION["admin_id"])) {
    header("Location: admin.php");
    exit();
}




?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Verify Students</title>

    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>

<body class="bg-gray-100 p-10">

    <h1 class="text-3xl font-bold mb-6">
        Pending Students
    </h1>
    </p> <button class="bg-green-900 text-lg font-semibold p-4 rounded text-white m-3 hover:bg-green-500"><a href="login.php">Student Portal Login</a></button>

    <div class="grid grid-cols-2 gap-4">

        <?php while ($student = $stmt->fetch()) { ?>

            <div class="bg-white p-5 rounded shadow">

                <h2 class="text-2xl font-bold">
                    <?php echo $student["surname"]; ?>
                    <?php echo $student["firstname"]; ?>
                </h2>

                <p>
                    Email:
                    <?php echo $student["email"]; ?>
                </p>

                <p>
                    Student ID:
                    <?php echo $student["student_id"]; ?>
                </p>

                <br>

                <a href="approve_student.php?id=<?php echo $student['id']; ?>"
                    class="bg-green-600 text-white px-5 py-2 rounded mr-2">

                    Verify Student

                </a>
                <a href="delete_student.php?id=<?= $student['id'] ?>"
                    class="bg-red-600 text-white px-4 py-2 rounded">
                    Reject
                </a>

            </div>

        <?php } ?>

    </div>

</body>

</html>