<?php
session_start();

if ( !isset( $_SESSION[ 'admin_id' ] ) ) {
    header( 'Location: admin.php' );
    exit();
}

$username  = $_SESSION[ 'username' ] ?? 'Admin';
?>

<!DOCTYPE html>
<html lang='en'>

<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>EBI - ADMIN DASHBOARD</title>

    <script src='https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4'></script>
    <script src='https://kit.fontawesome.com/faff1bf098.js' crossorigin='anonymous'></script>
</head>

<body>

    <aside id='default-sidebar'
        class='fixed top-0 left-0 z-40 w-44 h-screen transition-transform -translate-x-full sm:translate-x-0'
        aria-label='Sidebar'>

        <aside id='default-sidebar'
            class='fixed top-0 left-0 z-40 w-44 h-screen transition-transform -translate-x-full sm:translate-x-0'
            aria-label='Sidebar'>
            <div class='h-full px-3 py-4 overflow-y-hidden  bg-gray-50'>
                <div class='flex gap-2 text-blue-800 items-center text-lg p-2 mb-6 animate__hinge'>
                    <i class='fa-regular fa-user'></i>
                    <h4 class='text-sm font-bold text-black font-[nothing-writing, sana-serif]'>Admin Portal</h4>
                </div>

                <ul class='space-y-2 font-medium items-center'>
                    <li class='mb-5' id='dashboard_btn'>
                        <a href='#' class='flex bg-blue-100 rounded items-center p-2 text-blue-700 gap-1 '>
                            <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24'
                                fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round'
                                stroke-linejoin='round' class='lucide lucide-house-icon lucide-house'>
                                <path d='M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8' />
                                <path
                                    d='M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' />
                            </svg> <span class='ml-1 font-[sans-serif] font-semibold '>Dashboard</span>
                        </a>
                    </li>
                    <li class='mb-5'>
                        <a href='#' class='flex items-center p-2  gap-1 '>
                            <i class="fa-solid fa-user-group"></i> <span
                                class='ml-1 font-[sans-serif] font-semibold '>Students</span>
                        </a>
                    </li>
                    <li class='mb-3'>
                        <a href='#' class='flex items-center p-2 text-gray-900 gap-1  '>
                            <i class='fa-regular fa-file'></i>
                            <span class='ml-1 font-[sans-serif] font-semibold '>Document</span>
                        </a>
                    </li>
                    <li class='mb-3'>
                        <a href='#' class='flex items-center p-2 text-gray-900 gap-1 gap-1 '>
                            <i class='fa-solid fa-coins'></i>
                            <span class='ml-1'>Payment</span>
                        </a>
                    </li>

                    <li class='mb-3'>
                        <a href='#' class='flex items-center p-2 text-gray-900 gap-1 '>
                            <i class='fa-solid fa-chart-pie'></i>
                            <span class='ml-1'>Report</span>
                        </a>
                    </li>
                    <li class='mb-3'>
                        <a href='#' class='flex items-center p-2 text-gray-900 gap-1 '><i
                                class='fa-regular fa-calendar'></i> <span class='ml-1'>Calendar</span></a>
                    </li>
                    <li class='mb-3'>
                        <a href='#' class='flex items-center p-2 text-gray-900 gap-1 '><svg
                                xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24'
                                fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round'
                                stroke-linejoin='round' class='lucide lucide-message-circle-icon lucide-message-circle'>
                                <path
                                    d='M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719' />
                            </svg> <span class='ml-1'>Message</span> </a>
                    </li>
                    <li class='mb-3'>
                        <a href='#' class='flex items-center p-2 text-gray-900 gap-1 '><i class='fa-solid fa-gears'></i>
                            <span class='ml-1'>Settings</span> </a>
                    </li>
                    <li class='mt-'>
                        <a href='admin.phpx '
                            class='hover:bg-red-500  bg-red-600 p-2 flex items-center gap-1 rounded-xl trasnition duration-500'>
                            <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24'
                                fill='none' stroke='white' stroke-width='3' stroke-linecap='round'
                                stroke-linejoin='round' class='lucide lucide-log-out-icon lucide-log-out'>
                                <path d='m16 17 5-5-5-5' />
                                <path d='M21 12H9' />
                                <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
                            </svg> <span class=' text-white  ml-1'>Logout</span>
                        </a>
                    </li>
                </ul>
            </div>
        </aside>

    </aside>
    <!--Navigation Bar-->
    <nav class='p-2 flex justify-between items-center lg:ml-44'>
        <div class="flex flex-col  items-start">
            <span class='text-2xl font-bold ml-1'>EBI - Adminstration Dashboard</span>
            <span class="text-[10px] text-gray-600 font-semibold">This is what's happening in the school today.</span>
        </div>

        <div class='flex items-center gap-4'>
            <div class="flex items-center  justify-center">
                <i class='fa-regular fa-bell text-2xl font-bold'></i>
                <span
                    class="bg-red-600 w-4 h-4 rounded-full flex items-center justify-center text-white text-xs -mt-4 -ml-2">
                    3
                </span>
            </div>
            <div class='flex items-center gap-2 '>
                <img src='../logo/Eden BULB LOGO OR BARGE.png' alt='Admin_logo'
                    class='w-8 h-auto rounded-full object-cover'>
                <div class='flex flex-col'>
                    <span id="time" class="text-md font-bold -mb-1"><span id="icon"></span></span>
                    <span class="text-blue-600 text-sm ">
                        <?php echo($username); ?>
                    </span>
                </div>
                <span><i class="fa-solid fa-chevron-down"></i></span>

            </div>
        </div>
    </nav>
    <!--Dashboard Information-->
    <div class='grid lg:grid-cols-4 px-4 py-6 lg:ml-44 md:ml-33 sm:ml-43 x  gap-4'>
        <div class="bg-white font-bold flex p-3 rounded-lg gap-6 justify-center items-center shadow-md shadow-indigo-700">
            <i class="fa-solid fa-users text-2xl text-"></i>
            <div class="flex flex-col">
                <span class="text-sm font-semibold text-indigo-800">Number Of Students</span>
                <span class="text-xl text-indigo-800">2,500</span>
                <span class="text-[8px] text-gray-600">+12 this week</span>
            </div>
        </div>
        <div class="bg-white font-bold flex p-3 rounded-lg gap-6 justify-center items-center shadow-md shadow-indigo-700">
            <i class="fa-solid fa-id-badge text-2xl text-"></i>
            <div class="flex flex-col">
                <span class="text-sm font-semibold text-indigo-800">Total Teachers</span>
                <span class="text-xl text-indigo-800">100</span>
                <span class="text-[8px] text-gray-600">+50 this week</span>
            </div>
        </div>
        <div class="bg-white font-bold flex p-3 rounded-lg gap-6 justify-center items-center shadow-md shadow-indigo-700">
            <i class="fa-solid fa-hourglass text-2xl text-"></i>
            <div class="flex flex-col">
                <span class="text-sm font-semibold text-indigo-800">Pending Payment</span>
                <span class="text-xl text-indigo-800">50</span>
                <span class="text-[8px] text-gray-600">-6 this week</span>
            </div>
        </div>
        <div class="bg-white font-bold flex p-5 rounded-lg gap-6 justify-center items-center shadow-md shadow-indigo-700">
            <i class="fa-solid fa-building-columns text-2xl text-"></i>
            <div class="flex flex-col">
                <span class="text-sm font-semibold text-indigo-800">Verified Payment </span>
                <span class="text-xl text-indigo-800">500</span>
                <span class="text-[8px] text-gray-600">+20 this week</span>
            </div>
        </div>
    </div>












    <script src="../js/adminDash.js"></script>>
</body>

</html>