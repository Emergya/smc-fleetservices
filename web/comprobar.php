<?php
session_start();
if(!isset($_SESSION['IDUSER']))header("Location: index.php");
?>
