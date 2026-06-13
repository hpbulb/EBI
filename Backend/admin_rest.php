<?php
session_start();
include "sch_db.php";

/*
------------------------------------
ADMIN PASSWORD RESET PAGE
------------------------------------
IMPORTANT:
Delete this file after resetting
password OR protect it properly.
------------------------------------
*/

$message = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $username = trim($_POST["username"]);
    $new_password = trim($_POST["new_password"]);

    // HASH PASSWORD
    $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);

    // UPDATE ADMIN PASSWORD
    $sql = "UPDATE admins SET password=? WHERE username=?";
    $stmt = $pdo->prepare($sql);

    if ($stmt->execute([$hashed_password, $username])) {

        if ($stmt->rowCount() > 0) {
            $message = "Password updated successfully!";
        } else {
            $message = "Admin username not found!";
        }

    } else {
        $message = "Failed to reset password!";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Admin Reset Password</title>

    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>

<body class="bg-gray-100 flex items-center justify-center h-screen">

<div class="bg-white p-8 rounded-2xl shadow-xl w-96">

    <h1 class="text-3xl font-bold text-center mb-6">
        Admin Reset Password
    </h1>

    <?php if($message): ?>
        <div class="bg-blue-100 text-blue-700 p-3 rounded mb-4 text-center">
            <?= $message ?>
        </div>
    <?php endif; ?>

    <form method="POST">

        <label class="block mb-2 font-semibold">
            Admin Username
        </label>

        <input
            type="text"
            name="username"
            placeholder="Enter admin username"
            required
            class="w-full border border-gray-300 p-3 rounded-lg mb-4 outline-none focus:border-blue-500"
        >

        <label class="block mb-2 font-semibold">
            New Password
        </label>

        <input
            type="password"
            name="new_password"
            placeholder="Enter new password"
            required
            class="w-full border border-gray-300 p-3 rounded-lg mb-6 outline-none focus:border-blue-500"
        >

        <button
            type="submit"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded-lg transition"
        >
            Reset Password
        </button>
         
        
        <button class="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold p-3 rounded-lg mt-4 transition">
            <a href="admin.php">Back to Login</a>
            </button>

    </form>

</div>

</body>
</html>