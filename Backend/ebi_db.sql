-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 28, 2026 at 12:01 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ebi_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'admin',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `username`, `password`, `role`, `created_at`) VALUES
(1, 'admin', '$2y$10$3yUdhyTbv6mQx.UN96hMVO8ctCfagL.NYiGSz1CxRz3Gfp9KfIOse', 'admin', '2026-05-28 09:49:19');

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` int(11) NOT NULL,
  `student_id` varchar(50) DEFAULT NULL,
  `document_name` varchar(255) DEFAULT NULL,
  `document_path` varchar(255) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `student_id` varchar(50) DEFAULT NULL,
  `payment_reference` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_status` varchar(50) DEFAULT NULL,
  `paid_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `surname` varchar(225) NOT NULL,
  `firstname` varchar(225) NOT NULL,
  `middlename` varchar(225) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` varchar(225) NOT NULL,
  `passport` varchar(225) NOT NULL,
  `status` varchar(225) NOT NULL,
  `state_of_origin` varchar(225) NOT NULL,
  `lga_of_origin` varchar(225) NOT NULL,
  `city` varchar(225) NOT NULL,
  `nationality` varchar(225) NOT NULL,
  `houseaddress` varchar(255) NOT NULL,
  `religion` varchar(225) NOT NULL,
  `email` varchar(225) NOT NULL,
  `student_id` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `verified` varchar(20) DEFAULT 'pending',
  `payment_status` varchar(50) DEFAULT 'Pending',
  `verification_status` varchar(50) DEFAULT 'Pending',
  `ai_score` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `surname`, `firstname`, `middlename`, `date_of_birth`, `gender`, `passport`, `status`, `state_of_origin`, `lga_of_origin`, `city`, `nationality`, `houseaddress`, `religion`, `email`, `student_id`, `password`, `verified`, `payment_status`, `verification_status`, `ai_score`, `created_at`) VALUES
(1, 'Onwuchekwa', 'Ulu', 'mark', '2026-01-24', 'Male', '', 'Single', 'Abia', 'Bende', 'Umuahia', 'Nigeria', 'No. 30 Azikiwe Road Umuahia', 'Christian', '', '', '', 'verified', 'Pending', 'Pending', 0, '2026-05-28 09:46:22'),
(2, 'Onwuchekwa', 'Ulu', 'mark', '2026-01-24', 'Male', '', 'Single', 'Abia', 'Bende', 'Umuahia', 'Nigeria', 'No. 30 Azikiwe Road Umuahia', 'Christian', '', '', '', 'verified', 'Pending', 'Pending', 0, '2026-05-28 09:46:22'),
(3, 'Onwuchekwa', 'Ulu', 'mark', '2026-04-27', 'Male', '', 'Single', 'Abia', 'Bende', 'Umuahia', 'Nigeria', 'No. 30 Azikiwe Road Umuahia', 'Muslim', '', '', '', 'verified', 'Pending', 'Pending', 0, '2026-05-28 09:46:22'),
(4, 'Rex', 'Kevin', 'mark', '2008-06-17', 'Male', 'scbck.jpg', 'Single', 'Federal Capital Territory', 'bende', 'Abuja', ' nigeria', 'FXGX+3JF', 'Christian', 'rexk722@gmail.com', 'EBI2703', '$2y$10$jyIhfAOrTJqH1u4naY78hexLGfRwgCj6n7oS8XcfzJIJ65qd6Mbsi', 'verified', 'Pending', 'Pending', 0, '2026-05-28 09:46:22'),
(5, 'Rex', 'Kevin', 'mark', '2008-06-17', 'Male', 'scbck.jpg', 'Single', 'Federal Capital Territory', 'bende', 'Abuja', ' nigeria', 'FXGX+3JF', 'Christian', 'rexk722@gmail.com', 'EBI1336', '$2y$10$M7WiROtNfcdoioxEJeYfHedquBnzV1GZCUQ8Mp41B0c/idJmGTFaG', 'verified', 'Pending', 'Pending', 0, '2026-05-28 09:46:22'),
(6, 'Rex', 'Kevin', 'mark', '2008-06-17', 'Male', 'scbck.jpg', 'Single', 'Federal Capital Territory', 'bende', 'Abuja', ' nigeria', 'FXGX+3JF', 'Christian', 'rexk722@gmail.com', 'EBI9486', '$2y$10$Q8WE3M2/JFDT4YEhisbJ.uRcuO6JpM4UYeHR0NFZUDLHpHLBcV6qG', 'verified', 'Pending', 'Pending', 0, '2026-05-28 09:46:22'),
(7, 'Rex', 'Kevin', 'mark', '2008-06-17', 'Male', 'scbck.jpg', 'Single', 'Federal Capital Territory', 'bende', 'Abuja', ' nigeria', 'FXGX+3JF', 'Christian', 'rexk722@gmail.com', 'EBI7278', '$2y$10$23A33IugBW75HG5gVjva/OaYvQ.mtYn2czdvHLP5AyMFuhreZeEs.', 'verified', 'Pending', 'Pending', 0, '2026-05-28 09:46:22'),
(8, 'Rex', 'Kevin', 'mark', '2008-06-17', 'Male', 'scbck.jpg', 'Single', 'Federal Capital Territory', 'bende', 'Abuja', ' nigeria', 'FXGX+3JF', 'Christian', 'rexk722@gmail.com', 'EBI9598', '$2y$10$L2GY7Y2jxfkT/HM.tDXwb.LcWjNw5naXWYA/wlXs2GGOVGYlUGBiS', 'verified', 'Pending', 'Pending', 0, '2026-05-28 09:46:22'),
(9, 'ulu onwuchekwa', 'unique', 'mark', '2026-04-30', 'Female', 'default.png', 'Married', 'Abia', 'bende', 'Umuahia', 'united state', 'No.30 Azikiwe Road Umuahia', 'Muslim', 'markunique112@gmail.com', 'EBI8840', '$2y$10$YBCWfpYBXmasNlwpndme6uuJ9gIjpEUWKvioJFUN8fp7wPlZbOwEO', 'verified', 'Pending', 'Pending', 0, '2026-05-28 09:46:22'),
(10, 'ulu onwuchekwa', 'unique', 'mark', '2026-04-30', 'Female', 'default.png', 'Married', 'Abia', 'bende', 'Umuahia', 'united state', 'No.30 Azikiwe Road Umuahia', 'Muslim', 'markunique112@gmail.com', 'EBI8252', '$2y$10$bhxdUdf3WUck47ipgyjXZ.n5cEfeQIU0kT6aJPUrynrWqJeQvbnG.', 'verified', 'Pending', 'Pending', 0, '2026-05-28 09:46:22'),
(11, 'ulu onwuchekwa', 'unique', 'mark', '2026-04-30', 'Female', '6 (1).jpg', 'Single', 'Abia', 'bende', 'Umuahia', 'united state', 'No.30 Azikiwe Road Umuahia', 'Christian', 'markunique12@gmail.com', 'EBI3866', '$2y$10$lZSPgeio79ML4NybKaESkeQvknNTg2LSOp1Pr93OV9TnD0xIMHueq', 'verified', 'Pending', 'Pending', 0, '2026-05-28 09:46:22'),
(12, 'ulu onwuchekwa', 'unique', 'mark', '2026-04-30', 'Female', '6 (1).jpg', 'Single', 'Abia', 'bende', 'Umuahia', 'united state', 'No.30 Azikiwe Road Umuahia', 'Christian', 'markunique12@gmail.com', 'EBI4516', '$2y$10$wzQp2EJuJCYogbp4IwoXGuso/.HBcvzQKfPdOgaoSgekHDI75U6L2', 'verified', 'Pending', 'Pending', 0, '2026-05-28 09:46:22'),
(13, 'ulu onwuchekwa', 'unique', 'mark', '2026-04-30', 'Female', 'IMG-20260526-WA0045.jpg', 'Married', 'Abia', 'bende', 'Umuahia', 'united state', 'No.30 Azikiwe Road Umuahia', 'Christian', 'markunique12@gmail.com', 'EBI5255', '$2y$10$CwlB4jkYoSW8NW8rKS50tuVhRPtUrPervPDZz8cgwme7uemMmxKcK', 'verified', 'Pending', 'Pending', 0, '2026-05-28 09:46:22');

-- --------------------------------------------------------

--
-- Table structure for table `verification_logs`
--

CREATE TABLE `verification_logs` (
  `id` int(11) NOT NULL,
  `student_id` varchar(50) DEFAULT NULL,
  `verification_type` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `verified_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `verification_logs`
--
ALTER TABLE `verification_logs`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `verification_logs`
--
ALTER TABLE `verification_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
