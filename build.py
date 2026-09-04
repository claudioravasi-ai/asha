#!/usr/bin/env python3
"""
Ensambla ALGOS en un unico index.html autocontenido.

    python3 build.py

No hace falta Node, ni npm, ni ningun paquete: solo Python 3. La salida es
un index.html que se puede abrir con doble clic o subir a cualquier hosting
estatico (GitHub Pages, Netlify, el servidor del consultorio).
"""
import os
import re
import sys
import datetime

BASE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(BASE, 'src')

CSS = ['styles.css']

# El orden importa: los datos primero, despues el nucleo, despues la interfaz.
JS = [
    'marca.js',
    'firebase-config.js',
    'email-config.js',
    'data-escalas.js',
    'data-mapa.js',
    'data-sindromes.js',
    'data-icd.js',
    'data-farmacos.js',
    'data-procedimientos.js',
    'core.js',
    'motor.js',
    'efectividad.js',
    'email.js',
    'ui-ventanas.js',
    'ui-mapa.js',
    'ui-auth.js',
    'ui-equipo.js',
    'ui-pacientes.js',
    'ui-historia.js',
    'ui-plan.js',
    'resumen-paciente.js',
    'ui-agudo.js',
    'ui-extras.js',
    'demo.js',
    'portal-paciente.js',
    'app.js',
]


def leer(nombre):
    ruta = os.path.join(SRC, nombre)
    if not os.path.exists(ruta):
        print('  !! falta %s (se omite)' % nombre)
        return ''
    with open(ruta, 'r', encoding='utf-8') as f:
        return f.read()


def main():
    sello = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
    version = datetime.datetime.now().strftime('%Y.%m.%d.%H%M')

    cuerpo = leer('body.html')
    if not cuerpo:
        print('ERROR: src/body.html es obligatorio')
        sys.exit(1)

    css = '\n'.join('/* ==== %s ==== */\n%s' % (f, leer(f)) for f in CSS)

    partes = []
    for f in JS:
        codigo = leer(f)
        if codigo:
            partes.append('/* ================ %s ================ */\n%s' % (f, codigo))
    js = '\n'.join(partes)

    # El nombre de la aplicacion vive en src/marca.js. Leerlo de ahi evita que
    # la pestaña del navegador siga diciendo un nombre viejo despues de que se
    # cambio la marca, que es justo lo que pasaba.
    marca = leer('marca.js')
    m = re.search(r"nombre:\s*'([^']*)'", marca)
    nombre = m.group(1) if m else 'ALGOS'
    m = re.search(r"bajada:\s*'([^']*)'", marca)
    bajada = m.group(1) if m else 'Unidad de Dolor'

    html = """<!DOCTYPE html>
<html lang="es-AR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=5">
<meta name="theme-color" content="#2d6a72">
<meta name="description" content="%(bajada)s. Historia clinica de dolor, mapa corporal con intensidad, fenotipado mecanistico, plan terapeutico y seguimiento de efectividad.">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="%(nombre)s">
<meta name="mobile-web-app-capable" content="yes">
<meta name="format-detection" content="telephone=no">
<title>%(nombre)s</title>
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/icon-192.png">
<script>window.ALGOS_BUILD = "%(version)s";</script>
<style>
%(css)s
</style>
</head>
<body>
%(cuerpo)s
<script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-database-compat.js"></script>
<script>
%(js)s
</script>
</body>
</html>
""" % {'css': css, 'cuerpo': cuerpo, 'js': js, 'version': version,
           'nombre': nombre, 'bajada': bajada}

    salida = os.path.join(BASE, 'index.html')
    with open(salida, 'w', encoding='utf-8') as f:
        f.write(html)

    kb = os.path.getsize(salida) / 1024.0
    print('OK  index.html  %.0f KB  (build %s, %s)' % (kb, version, sello))
    print('    %d modulos de JavaScript, %d de CSS' % (len(partes), len(CSS)))


if __name__ == '__main__':
    main()
