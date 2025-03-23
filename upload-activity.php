<?php
// Direktori tempat gambar aktivitas akan disimpan
$target_dir = "uploads/activities/";
if (!is_dir($target_dir)) {
    mkdir($target_dir, 0777, true); // Buat folder jika belum ada
}

$target_file = $target_dir . basename($_FILES["activity_image"]["name"]);
$uploadOk = 1;
$imageFileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

// Periksa apakah file adalah gambar
if (isset($_POST["submit"])) {
    $check = getimagesize($_FILES["activity_image"]["tmp_name"]);
    if ($check !== false) {
        $uploadOk = 1;
    } else {
        echo "File bukan gambar.";
        $uploadOk = 0;
    }
}

// Periksa jika file sudah ada
if (file_exists($target_file)) {
    echo "File sudah ada.";
    $uploadOk = 0;
}

// Periksa ukuran file (maks 5MB)
if ($_FILES["activity_image"]["size"] > 5000000) {
    echo "File terlalu besar.";
    $uploadOk = 0;
}

// Hanya izinkan format tertentu
if ($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg") {
    echo "Hanya file JPG, JPEG, dan PNG yang diizinkan.";
    $uploadOk = 0;
}

// Periksa jika `$uploadOk` masih 1
if ($uploadOk == 1) {
    if (move_uploaded_file($_FILES["activity_image"]["tmp_name"], $target_file)) {
        echo "Gambar berhasil diunggah.";
    } else {
        echo "Terjadi kesalahan saat mengunggah gambar.";
    }
}
?>
