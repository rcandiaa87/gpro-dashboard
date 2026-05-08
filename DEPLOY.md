# Guía de Despliegue en Servidor de Producción

Stack del servidor: **Apache + PHP + MariaDB (Debian/Ubuntu)**

---

## Requisitos previos

- Node.js 18+ instalado (`node --version`)
- npm instalado (`npm --version`)
- PM2 instalado globalmente (`npm install -g pm2`)
- Acceso SSH al servidor
- Git instalado

Si Node.js no está instalado, pedirle al administrador:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

---

## 1. Clonar el repositorio

```bash
mkdir -p ~/gpro-dashboard
cd ~/gpro-dashboard
git clone https://github.com/rcandiaa87/gpro-dashboard.git .
```

---

## 2. Variables de entorno

Crear el archivo `.env.production.local` en la raíz del proyecto:

```bash
printf 'GPRO_DATABASE_URL=mysql://USUARIO:CLAVE@localhost:3306/NOMBRE_BD\nNEXTAUTH_SECRET=un-string-secreto-largo\nNEXTAUTH_URL=http://TU_DOMINIO\n' > .env.production.local
```

Reemplazar:
- `USUARIO` — usuario de MariaDB
- `CLAVE` — contraseña de MariaDB
- `NOMBRE_BD` — nombre de la base de datos GPRO
- `TU_DOMINIO` — URL del servidor (ej: `http://miservidor.com`)

---

## 3. Instalar dependencias y compilar

```bash
npm install --legacy-peer-deps
npm run build
```

El build puede tardar 2-5 minutos. Al finalizar debe mostrar `✓ Compiled successfully`.

> **Nota:** Si el servidor no tiene acceso a Google Fonts, el build mostrará
> errores de conexión a `fonts.gstatic.com` pero completará igual con fuentes
> de fallback. No es un error bloqueante.

---

## 4. Iniciar con PM2

```bash
pm2 start npm --name "gpro-dashboard" -- start
pm2 save
```

Verificar que está corriendo:
```bash
pm2 status
```

Para que PM2 arranque automáticamente tras un reinicio del servidor,
pedirle al administrador que ejecute el comando que genera:
```bash
pm2 startup
```

Verificar que el app responde:
```bash
curl http://localhost:3000/gprocalc/dashboard
```

---

## 5. Configurar Apache (reverse proxy)

Verificar que los módulos proxy están habilitados:
```bash
ls /etc/apache2/mods-enabled/ | grep proxy
```
Deben aparecer `proxy.load` y `proxy_http.load`.
Si no están, el administrador debe ejecutar:
```bash
sudo a2enmod proxy proxy_http
sudo systemctl restart apache2
```

Agregar estas dos líneas dentro del bloque `<VirtualHost>` en
`/etc/apache2/sites-enabled/000-default.conf` (o el archivo correspondiente),
**antes** del cierre `</VirtualHost>`:

```apache
ProxyPass /gprocalc/dashboard http://localhost:3000/gprocalc/dashboard
ProxyPassReverse /gprocalc/dashboard http://localhost:3000/gprocalc/dashboard
```

Reiniciar Apache:
```bash
sudo systemctl restart apache2
```

El dashboard quedará accesible en:
`http://TU_DOMINIO/gprocalc/dashboard`

---

## 6. Integración con el menú PHP (vía base de datos)

El sistema de menú está basado en BD. **No modificar `inicio.php` directamente.**

### 6a. Copiar el formulario PHP del dashboard

```bash
sudo cp dashboard_form.php /var/www/html/gprocalc/servidor/forms/frm_dashboard.php
```

El archivo `frm_dashboard.php` contiene un iframe que carga el dashboard con el IDM
del usuario logueado tomado de la sesión PHP:

```php
<?php
if (session_status() === PHP_SESSION_NONE) { session_start(); }
if (!isset($_SESSION['usuario_idm'])) { http_response_code(403); exit; }
$idm = (int) $_SESSION['usuario_idm'];
?>
<iframe
  src="/gprocalc/dashboard?idm=<?= $idm ?>"
  style="width:100%;height:calc(100vh - 60px);border:none;"
  title="GPRO Dashboard">
</iframe>
```

### 6b. Insertar el ítem de menú en la BD

```sql
-- Categoría padre
INSERT INTO menu (mnu_menu, mnu_submenu, mnu_dir_form, mnu_icon)
VALUES ('Dashboard', NULL, NULL, 'speedometer2');
SET @parent_id = LAST_INSERT_ID();

-- Submenú
INSERT INTO menu (mnu_menu, mnu_submenu, mnu_dir_form, mnu_icon)
VALUES ('Dashboard', 'GPRO Dashboard', 'frm_dashboard', NULL);
SET @submenu_id = LAST_INSERT_ID();

-- Acceso para roles User_Gral (2) y User_Adv (3)
INSERT INTO rol_menu (rm_rol_id, rm_mnu_id, rm_fecha_alta, rm_usr_fecha_alta)
VALUES
  (2, @parent_id,  NOW(), 'sysadmin'),
  (2, @submenu_id, NOW(), 'sysadmin'),
  (3, @parent_id,  NOW(), 'sysadmin'),
  (3, @submenu_id, NOW(), 'sysadmin');
```

> El IDM del usuario logueado se pasa automáticamente vía `$_SESSION['usuario_idm']`.
> No se requiere selector de manager — el dashboard muestra solo los datos del usuario activo.

---

## 7. Actualizar el app (deploys futuros)

```bash
cd ~/gpro-dashboard
git pull
npm run build
pm2 restart gpro-dashboard
```

---

## Troubleshooting

**El dashboard no carga (502 Bad Gateway)**
- Verificar que PM2 está corriendo: `pm2 status`
- Ver logs: `pm2 logs gpro-dashboard --lines 50`
- Reiniciar: `pm2 restart gpro-dashboard`

**Error de base de datos**
- Verificar credenciales en `.env.production.local`
- Probar conexión: `mysql -u USUARIO -pCLAVE NOMBRE_BD -e "SHOW TABLES;"`

**El menú PHP no muestra datos del usuario**
- Verificar que `$_SESSION['usuario_idm']` existe en la sesión PHP
- Revisar el archivo `servidor/login/logear.php`
