#!/usr/bin/env python3
"""
Genera los iconos de la aplicacion sin ninguna dependencia externa.

En esta computadora no hay Pillow ni ImageMagick, asi que el PNG se escribe
a mano: es un formato simple si uno se limita a RGBA sin comprimir mas alla
de lo que hace zlib. Dibuja un circulo con la letra A recortada, en el color
de la marca.

    python3 make-icons.py
"""
import struct
import zlib
import os

FONDO = (45, 106, 114, 255)     # --acento
TINTA = (255, 255, 255, 255)

BASE = os.path.dirname(os.path.abspath(__file__))


def png(ruta, ancho, alto, pixeles):
    """Escribe un PNG RGBA de 8 bits."""
    crudo = b''
    for y in range(alto):
        crudo += b'\x00'  # filtro "none" al inicio de cada fila
        for x in range(ancho):
            crudo += bytes(pixeles[y][x])

    def trozo(tipo, datos):
        c = struct.pack('>I', len(datos)) + tipo + datos
        return c + struct.pack('>I', zlib.crc32(tipo + datos) & 0xffffffff)

    with open(ruta, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n')
        f.write(trozo(b'IHDR', struct.pack('>IIBBBBB', ancho, alto, 8, 6, 0, 0, 0)))
        f.write(trozo(b'IDAT', zlib.compress(crudo, 9)))
        f.write(trozo(b'IEND', b''))


def dentro_de_la_a(x, y, n):
    """La letra A como tres trazos gruesos, en coordenadas de 0 a 1."""
    ancho = n * 0.085
    # los dos palos oblicuos
    for signo in (1, -1):
        # x = centro + signo * pendiente * (y - arriba)
        objetivo = n * 0.5 + signo * (y - n * 0.30) * 0.42
        if abs(x - objetivo) < ancho / 2 and n * 0.28 <= y <= n * 0.74:
            return True
    # la barra del medio
    if n * 0.55 <= y <= n * 0.55 + ancho and \
       n * 0.5 - (n * 0.55 - n * 0.30) * 0.42 <= x <= n * 0.5 + (n * 0.55 - n * 0.30) * 0.42:
        return True
    return False


def generar(n):
    r = n / 2.0
    fila_vacia = (0, 0, 0, 0)
    pix = []
    for y in range(n):
        fila = []
        for x in range(n):
            d = ((x - r + 0.5) ** 2 + (y - r + 0.5) ** 2) ** 0.5
            if d > r - 0.5:
                fila.append(fila_vacia)
            elif dentro_de_la_a(x, y, n):
                fila.append(TINTA)
            else:
                fila.append(FONDO)
        pix.append(fila)
    return pix


def main():
    carpeta = os.path.join(BASE, 'icons')
    os.makedirs(carpeta, exist_ok=True)
    for n in (192, 512):
        ruta = os.path.join(carpeta, 'icon-%d.png' % n)
        png(ruta, n, n, generar(n))
        print('OK  %s  %.1f KB' % (os.path.basename(ruta), os.path.getsize(ruta) / 1024.0))


if __name__ == '__main__':
    main()
