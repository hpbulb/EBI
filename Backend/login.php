<?php

session_start();

include "sch_db.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $student_id = trim($_POST["student_id"]);
    $password = trim($_POST["password"]);

    // CHECK STUDENT
    $sql = "SELECT * FROM students WHERE student_id = ?";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([$student_id]);

    $student = $stmt->fetch();

    if ($student) {

        // VERIFY ACCOUNT
        if ($student["verified"] != "verified") {

            $error = "Your account has not been verified.";

        } 

        // CHECK PASSWORD
        elseif (password_verify($password, $student["password"])) {

            $_SESSION["student_id"] = $student["student_id"];
            $_SESSION["surname"] = $student["surname"];
            $_SESSION["firstname"] = $student["firstname"];
            $_SESSION["passport"] = $student["passport"];

            header("Location: dashboard.php");

            exit();

        } else {

            $error = "Incorrect Password";
        }

    } else {

        $error = "Student Not Found";
    }
}

?>

<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Student Login</title>

    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>

</head>

<body class="bg-gradient-to-r from-indigo-700 to-violet-800 h-screen flex justify-center items-center">

    <form method="POST"
        class="bg-white p-10 rounded-2xl shadow-2xl w-96">

        <h1 class="text-3xl font-bold text-center text-indigo-800 mb-6">
            Student Login
        </h1>

        <?php if(isset($error)) { ?>

            <div class="bg-red-100 text-red-700 p-3 rounded mb-4">
                <?php echo $error; ?>
            </div>

        <?php } ?>

        <!-- STUDENT ID -->
        <div class="mb-4">

            <label class="font-semibold text-gray-700">
                Student ID
            </label>

            <input type="text"
                name="student_id"
                required
                placeholder="Enter Student ID"
                class="w-full mt-2 p-3 border rounded-lg outline-none focus:border-indigo-500">

        </div>

        <!-- PASSWORD -->
        <div class="mb-6">

            <label class="font-semibold text-gray-700">
                Password
            </label>

            <input type="password"
                name="password"
                required
                placeholder="Enter Password"
                class="w-full mt-2 p-3 border rounded-lg outline-none focus:border-indigo-500">

        </div>

        <!-- BUTTON -->
        <button type="submit"
            class="w-full bg-indigo-700 hover:bg-indigo-600 text-white font-bold py-3 rounded-lg transition duration-300">

            Login

        </button>

    </form>

</body>

</html>