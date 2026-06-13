<?php
// Simple Entrance Exam System (single-file demo using SQLite)
session_start();
$db = new PDO('sqlite:exam.db');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Create tables
$db->exec("CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
)");
$db->exec("CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    score INTEGER,
    total INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)");
$db->exec("CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT,
    a TEXT,
    b TEXT,
    c TEXT,
    d TEXT,
    answer TEXT
)");

// Seed questions
$count = $db->query("SELECT COUNT(*) FROM questions")->fetchColumn();
if ($count == 0) {
    $db->exec("INSERT INTO questions (question,a,b,c,d,answer) VALUES
    ('What is 25% of 200?','25','50','75','100','B'),
    ('Capital of Nigeria?','Lagos','Abuja','Kano','Enugu','B'),
    ('2 + 2 = ?','3','4','5','6','B')");
}

$message = '';

// Register
if (isset($_POST['register'])) {
    $user = $_POST['username'];
    $pass = password_hash($_POST['password'], PASSWORD_DEFAULT);
    try {
        $stmt = $db->prepare("INSERT INTO users (username,password) VALUES (?,?)");
        $stmt->execute([$user,$pass]);
        $message = 'Registration successful';
    } catch (Exception $e) {
        $message = 'Username already exists';
    }
}

// Login
if (isset($_POST['login'])) {
    $stmt = $db->prepare("SELECT * FROM users WHERE username=?");
    $stmt->execute([$_POST['username']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($user && password_verify($_POST['password'], $user['password'])) {
        $_SESSION['user'] = $user;
    } else {
        $message = 'Invalid login';
    }
}

// Submit exam
if (isset($_POST['submit_exam']) && isset($_SESSION['user'])) {
    $questions = $db->query("SELECT * FROM questions")->fetchAll(PDO::FETCH_ASSOC);
    $score = 0;
    foreach ($questions as $q) {
        $ans = $_POST['q'.$q['id']] ?? '';
        if ($ans == $q['answer']) $score++;
    }
    $stmt = $db->prepare("INSERT INTO results (user_id,score,total) VALUES (?,?,?)");
    $stmt->execute([$_SESSION['user']['id'],$score,count($questions)]);
    $_SESSION['result'] = "$score / ".count($questions);
}

// Logout
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: '.$_SERVER['PHP_SELF']);
    exit;
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Entrance Exam System</title>
    <script>
    let timeLeft = 60;
    function startTimer(){
        let timer = setInterval(function(){
            document.getElementById('timer').innerText = timeLeft;
            timeLeft--;
            if(timeLeft < 0){
                clearInterval(timer);
                document.getElementById('examForm').submit();
            }
        },1000);
    }
    </script>
</head>
<body <?php if(isset($_SESSION['user']) && !isset($_SESSION['result'])) echo 'onload="startTimer()"'; ?>>
<h1>Entrance Exam System</h1>
<p><?php echo $message; ?></p>

<?php if (!isset($_SESSION['user'])): ?>
<h2>Register</h2>
<form method="post">
<input name="username" placeholder="Username" required>
<input type="password" name="password" placeholder="Password" required>
<button name="register">Register</button>
</form>

<h2>Login</h2>
<form method="post">
<input name="username" placeholder="Username" required>
<input type="password" name="password" placeholder="Password" required>
<button name="login">Login</button>
</form>

<?php elseif (isset($_SESSION['result'])): ?>
<h2>Exam Result</h2>
<p>Your score: <?php echo $_SESSION['result']; unset($_SESSION['result']); ?></p>
<a href="?logout=1">Logout</a>

<?php else: ?>
<p>Welcome, <?php echo htmlspecialchars($_SESSION['user']['username']); ?> | <a href="?logout=1">Logout</a></p>
<h2>Exam Starts</h2>
<p>Time left: <span id="timer">60</span> seconds</p>
<form method="post" id="examForm">
<?php
$questions = $db->query("SELECT * FROM questions")->fetchAll(PDO::FETCH_ASSOC);
foreach ($questions as $q): ?>
<p><strong><?php echo $q['question']; ?></strong></p>
<label><input type="radio" name="q<?php echo $q['id']; ?>" value="A"> A. <?php echo $q['a']; ?></label><br>
<label><input type="radio" name="q<?php echo $q['id']; ?>" value="B"> B. <?php echo $q['b']; ?></label><br>
<label><input type="radio" name="q<?php echo $q['id']; ?>" value="C"> C. <?php echo $q['c']; ?></label><br>
<label><input type="radio" name="q<?php echo $q['id']; ?>" value="D"> D. <?php echo $q['d']; ?></label><br><hr>
<?php endforeach; ?>
<button name="submit_exam">Submit Exam</button>
</form>
<?php endif; ?>
</body>
</html>
