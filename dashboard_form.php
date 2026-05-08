<?php
if (!isset($_SESSION['usuario_idm'])) { http_response_code(403); exit; }
$idm = (int) $_SESSION['usuario_idm'];
?>
<iframe
  src="/gprocalc/dashboard?idm=<?= $idm ?>"
  style="width:100%;height:calc(100vh - 60px);border:none;"
  title="GPRO Dashboard">
</iframe>
