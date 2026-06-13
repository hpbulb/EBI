<?php
session_start();
include "sch_db.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $username = trim($_POST["username"]);
    $password = trim($_POST["password"]);

    $sql = "SELECT * FROM admins WHERE username = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$username]);

    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($admin && password_verify($password, $admin["password"])) {

        $_SESSION["admin_id"] = $admin["id"];
        $_SESSION["admin_username"] = $admin["username"];
        $_SESSION["admin_name"] = $admin["name"];

        header("Location: adminDashboard.php");
        exit();

    } else {
        $error = "Invalid Username or Password";
    }
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login</title>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>

<body class="bg-gray-100 flex items-center justify-center h-screen">

    <form method="POST" class="bg-white p-8 rounded-xl shadow-lg w-96">

        <h1 class="text-2xl font-bold mb-6 text-center">
            Admin Login
        </h1>

        <?php if(isset($error)): ?>
            <p class="text-red-500 mb-4 text-center">
                <?= htmlspecialchars($error) ?>
            </p>
        <?php endif; ?>

        <input
            type="text"
            name="username"
            placeholder="Username"
            class="w-full border p-3 rounded mb-4"
            required>

        <input
            type="password"
            name="password"
            placeholder="Password"
            class="w-full border p-3 rounded mb-4"
            required>

        <button
            type="submit"
            class="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700">
            Login
        </button>

    </form>

</body>

</html>