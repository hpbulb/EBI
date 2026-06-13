<?php

include "sch_db.php";

$student_id = "";
$plain_password = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $surname = $_POST["surname"];
    $firstname = $_POST["firstname"];
    $middlename = $_POST["middlename"];
    $date_of_birth = $_POST["date_of_birth"];
    $gender = $_POST["gender"];
    $status = $_POST["status"];
    $state_of_origin = $_POST["state_of_origin"];
    $lga_of_origin = $_POST["lga_of_origin"];
    $city = $_POST["city"];
    $nationality = $_POST["nationality"];
    $houseaddress = $_POST["houseaddress"];
    $religion = $_POST["religion"];
    $email = $_POST["email"];

    // GENERATE STUDENT ID
    $student_id = "EBI" . rand(1000, 9999);

    // GENERATE PASSWORD
    $plain_password = substr(str_shuffle("EBI123456789"), 0, 8);

    // HASH PASSWORD
    $hashed_password = password_hash($plain_password, PASSWORD_DEFAULT);

    // IMAGE
    $passport = $_FILES["passport"]["name"];
    $tmp_name = $_FILES["passport"]["tmp_name"];

    move_uploaded_file($tmp_name, "uploads/" . $passport);

    // INSERT
    $sql = "INSERT INTO students (

        surname,
        firstname,
        middlename,
        date_of_birth,
        gender,
        passport,
        status,
        state_of_origin,
        lga_of_origin,
        city,
        nationality,
        houseaddress,
        religion,
        email,
        student_id,
        password

    )

    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([

        $surname,
        $firstname,
        $middlename,
        $date_of_birth,
        $gender,
        $passport,
        $status,
        $state_of_origin,
        $lga_of_origin,
        $city,
        $nationality,
        $houseaddress,
        $religion,
        $email,
        $student_id,
        $hashed_password

    ]);
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Registered Successfullyt</title>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <script src="https://kit.fontawesome.com/faff1bf098.js" crossorigin="anonymous"></script>


</head>

<body class="bg-linear-to-bl from-indigo-700 to-violet-800">
    <div class="flex justify-center items-center h-screen">
        <div class="flex flex-col bg-white text-blue-900 text-2xl p-8 rounded justify-center items-center">
            <p><i class="fa-solid fa-check text-green-500 bg-green-200 p-2 rounded-full"></i></p>
            <h2 class="text-green-500">Student Registered Successfully</h2>
            <p class="text-lg font-bold text-blue-900">Student ID: <?php echo $student_id; ?></p>
            <p class="text-lg font-bold text-blue-900">
                Student Password: <?php echo $plain_password; ?>
                </p> <button class="bg-green-900 text-lg font-semibold p-4 rounded text-white m-3 hover:bg-green-500" id="student"><a href="login.php">Student Portal</a></button>
        </div>
    </div>
<script>
    const studentBtn = document.getElementById("student");
    studentBtn.onclick = function(){
        window.alert("Please note down your Student ID and Password. You will need them to log in to the Student Portal. And you can not login if you are not verified by the school admin. Thank you!");
        window.location.href = "login.php";
    }
</script>
</body>

</html>