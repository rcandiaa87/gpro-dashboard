import os

php = '/var/www/html/gprocalc/inicio.php'

with open(php, 'r') as f:
    c = f.read()

# --- Menu items ---
i = c.find("require 'servidor/forms/menu.php';")
i = c.find('?>', i) + 2

m  = '\n              <li class="nav-item">'
m += '<a class="nav-link" '
m += 'href="/gprocalc/dashboard'
m += "?idm=<?= $_SESSION['usuario_idm'] ?>"
m += '" target="_blank">Dashboard &#8599;</a></li>'
m += '\n              <li class="nav-item">'
m += '<a class="nav-link" href="#"'
m += " data-idm=\"<?= $_SESSION['usuario_idm'] ?>\""
m += ' id="btn_dashboard">Dashboard</a></li>'

c = c[:i] + m + c[i:]

# --- JS para iframe ---
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

c = c.replace('</body>', js + '</body>', 1)

with open(php, 'w') as f:
    f.write(c)

print('OK! inicio.php actualizado.')
os.remove(__file__)
print('Script eliminado.')
