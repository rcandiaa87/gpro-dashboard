import os

php = '/var/www/html/gprocalc/inicio.php'

with open(php, 'r') as f:
    c = f.read()

# --- Eliminar los <li> del menú inyectados por patch_inicio.py ---
m  = '\n              <li class="nav-item">'
m += '<a class="nav-link" '
m += 'href="/gprocalc/dashboard'
m += "?idm=<?= $_SESSION['usuario_idm'] ?>"
m += '" target="_blank">Dashboard &#8599;</a></li>'
m += '\n              <li class="nav-item">'
m += '<a class="nav-link" href="#"'
m += " data-idm=\"<?= $_SESSION['usuario_idm'] ?>\""
m += ' id="btn_dashboard">Dashboard</a></li>'

if m in c:
    c = c.replace(m, '', 1)
    print('Menu items eliminados.')
else:
    print('AVISO: menu items no encontrados (¿ya fue revertido antes?).')

# --- Eliminar el bloque <script> inyectado por patch_inicio.py ---
js  = '\n  <script>\n'
js += '  $("#btn_dashboard").click(function(e){\n'
js += '    e.preventDefault();\n'
js += '    var idm = $(this).data("idm");\n'
js += '    var f = document.createElement("iframe");\n'
js += '    f.src = "/gprocalc/dashboard?idm=" + idm;\n'
js += '    f.style.cssText = "width:100%;'
js += 'height:calc(100vh - 60px);border:none;";\n'
js += '    $("#principal").empty().append(f);\n'
js += '  });\n'
js += '  </script>\n'

if js in c:
    c = c.replace(js, '', 1)
    print('Script iframe eliminado.')
else:
    print('AVISO: script iframe no encontrado (¿ya fue revertido antes?).')

with open(php, 'w') as f:
    f.write(c)

print('OK! inicio.php restaurado al original.')
os.remove(__file__)
print('Script eliminado.')
