<?php
session_start();
if (isset($_SESSION['usuario_idm']) && $_SESSION['usuario_idm'] > 0) {
    http_response_code(200);
    echo json_encode(['valid' => true]);
} else {
    http_response_code(401);
    echo json_encode(['valid' => false]);
}
