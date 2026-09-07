#!/usr/bin/env python3
"""
Genera los iconos de la aplicacion a partir de  icons/logo.png .

En esta computadora no hay Pillow ni ImageMagick, asi que el PNG se lee y se
escribe a mano: es un formato simple si uno se limita a 8 bits por canal y a
los filtros por fila, que es lo unico que hace falta aca.

Salen tres archivos:

  icons/icon-192.png   el icono chico de la pantalla de inicio
  icons/icon-512.png   el icono grande
  icons/logo-chico.png el logo recortado y con fondo transparente, que
                       build.py incrusta en el index.html para mostrarlo
                       adentro de la aplicacion, al lado del nombre

Los dos iconos llevan fondo solido y margen porque el manifiesto los declara
"maskable": Android los recorta en circulo y sin aire se come la frente y el
menton del dibujo.

    python3 make-icons.py

El original vive en  icons/logo.png . Para cambiar el logo se reemplaza ese
archivo y se vuelve a correr este programa; no hay que tocar nada mas.
"""
import struct
import zlib
import os

FONDO = (238, 240, 244, 255)    # --papel, el mismo background_color del manifest
MARGEN = 0.14                   # aire a cada lado del icono
ALTO_CHICO = 128                # el logo para adentro de la aplicacion

BASE = os.path.dirname(os.path.abspath(__file__))


def leer_png(ruta):
    """Devuelve (ancho, alto, filas RGBA). Solo 8 bits, sin entrelazado."""
    with open(ruta, 'rb') as f:
        datos = f.read()
    if datos[:8] != b'\x89PNG\r\n\x1a\n':
        raise ValueError('%s no es un PNG' % ruta)

    i = 8
    idat = b''
    paleta = trans = None
    while i < len(datos):
        largo = struct.unpack('>I', datos[i:i + 4])[0]
        tipo = datos[i + 4:i + 8]
        cuerpo = datos[i + 8:i + 8 + largo]
        i += 12 + largo
        if tipo == b'IHDR':
            ancho, alto, bits, color, comp, filtro, entrelazado = \
                struct.unpack('>IIBBBBB', cuerpo)
            if bits != 8 or entrelazado:
                raise ValueError('solo se admiten PNG de 8 bits sin entrelazar')
        elif tipo == b'PLTE':
            paleta = cuerpo
        elif tipo == b'tRNS':
            trans = cuerpo
        elif tipo == b'IDAT':
            idat += cuerpo
        elif tipo == b'IEND':
            break

    canales = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[color]
    crudo = zlib.decompress(idat)
    paso = ancho * canales
    filas = []
    previa = bytearray(paso)
    p = 0
    for _ in range(alto):
        f = crudo[p]
        linea = bytearray(crudo[p + 1:p + 1 + paso])
        p += 1 + paso
        for x in range(paso):
            a = linea[x - canales] if x >= canales else 0
            b = previa[x]
            c = previa[x - canales] if x >= canales else 0
            if f == 1:
                linea[x] = (linea[x] + a) & 255
            elif f == 2:
                linea[x] = (linea[x] + b) & 255
            elif f == 3:
                linea[x] = (linea[x] + (a + b) // 2) & 255
            elif f == 4:
                pa, pb, pc = abs(b - c), abs(a - c), abs(a + b - 2 * c)
                pred = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                linea[x] = (linea[x] + pred) & 255
        previa = linea
        filas.append(a_rgba(linea, ancho, color, canales, paleta, trans))
    return ancho, alto, filas


def a_rgba(linea, ancho, color, canales, paleta, trans):
    """Lleva una fila de cualquier tipo de color a una lista de tuplas RGBA."""
    fila = []
    for x in range(ancho):
        p = linea[x * canales:(x + 1) * canales]
        if color == 6:
            fila.append((p[0], p[1], p[2], p[3]))
        elif color == 2:
            fila.append((p[0], p[1], p[2], 255))
        elif color == 0:
            fila.append((p[0], p[0], p[0], 255))
        elif color == 4:
            fila.append((p[0], p[0], p[0], p[1]))
        else:  # paleta
            k = p[0]
            a = trans[k] if (trans and k < len(trans)) else 255
            fila.append((paleta[k * 3], paleta[k * 3 + 1], paleta[k * 3 + 2], a))
    return fila


def escribir_png(ruta, ancho, alto, pixeles):
    """Escribe un PNG RGBA de 8 bits."""
    crudo = bytearray()
    for y in range(alto):
        crudo.append(0)  # filtro "none" al inicio de cada fila
        for x in range(ancho):
            crudo += bytes(pixeles[y][x])

    def trozo(tipo, datos):
        c = struct.pack('>I', len(datos)) + tipo + datos
        return c + struct.pack('>I', zlib.crc32(tipo + datos) & 0xffffffff)

    with open(ruta, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n')
        f.write(trozo(b'IHDR', struct.pack('>IIBBBBB', ancho, alto, 8, 6, 0, 0, 0)))
        f.write(trozo(b'IDAT', zlib.compress(bytes(crudo), 9)))
        f.write(trozo(b'IEND', b''))


def recortar(filas, ancho, alto):
    """Saca el aire transparente de los bordes.

    Sin esto no se puede decir "el logo mide lo mismo que la palabra ASHA":
    la altura en CSS incluiria el margen vacio del dibujo y el logo se veria
    mas chico que la letra."""
    x0, y0, x1, y1 = ancho, alto, -1, -1
    for y in range(alto):
        for x in range(ancho):
            if filas[y][x][3] > 8:
                if x < x0: x0 = x
                if x > x1: x1 = x
                if y < y0: y0 = y
                if y > y1: y1 = y
    if x1 < 0:
        return filas, ancho, alto
    corte = [fila[x0:x1 + 1] for fila in filas[y0:y1 + 1]]
    return corte, x1 - x0 + 1, y1 - y0 + 1


def escalar(filas, ancho, alto, nw, nh):
    """Promedio por caja, ponderando el color por el alfa: sin halos oscuros."""
    salida = []
    for y in range(nh):
        y0, y1 = y * alto // nh, max(y * alto // nh + 1, (y + 1) * alto // nh)
        fila = []
        for x in range(nw):
            x0, x1 = x * ancho // nw, max(x * ancho // nw + 1, (x + 1) * ancho // nw)
            r = g = b = a = 0.0
            n = 0
            for yy in range(y0, y1):
                for xx in range(x0, x1):
                    pr, pg, pb, pa = filas[yy][xx]
                    r += pr * pa; g += pg * pa; b += pb * pa; a += pa
                    n += 1
            if a > 0:
                fila.append((int(round(r / a)), int(round(g / a)),
                             int(round(b / a)), int(round(a / n))))
            else:
                fila.append((0, 0, 0, 0))
        salida.append(fila)
    return salida


def componer(logo, lw, lh, n):
    """Apoya el logo sobre el fondo solido, centrado, para el icono cuadrado."""
    x0, y0 = (n - lw) // 2, (n - lh) // 2
    pix = []
    for y in range(n):
        fila = []
        for x in range(n):
            if x0 <= x < x0 + lw and y0 <= y < y0 + lh:
                r, g, b, a = logo[y - y0][x - x0]
                k = a / 255.0
                fila.append((int(round(r * k + FONDO[0] * (1 - k))),
                             int(round(g * k + FONDO[1] * (1 - k))),
                             int(round(b * k + FONDO[2] * (1 - k))),
                             255))
            else:
                fila.append(FONDO)
        pix.append(fila)
    return pix


def main():
    carpeta = os.path.join(BASE, 'icons')
    origen = os.path.join(carpeta, 'logo.png')
    ancho, alto, filas = leer_png(origen)
    filas, ancho, alto = recortar(filas, ancho, alto)
    print('    origen: %s  recortado a %dx%d' % (os.path.basename(origen), ancho, alto))

    # El logo que se ve adentro de la aplicacion: sin fondo, al lado del nombre.
    lw = max(1, int(round(ancho * ALTO_CHICO / float(alto))))
    ruta = os.path.join(carpeta, 'logo-chico.png')
    escribir_png(ruta, lw, ALTO_CHICO, escalar(filas, ancho, alto, lw, ALTO_CHICO))
    print('OK  %s  %dx%d  %.1f KB' % (os.path.basename(ruta), lw, ALTO_CHICO,
                                      os.path.getsize(ruta) / 1024.0))

    # Los dos iconos de la pantalla de inicio.
    for n in (192, 512):
        caja = int(n * (1 - 2 * MARGEN))
        if ancho >= alto:
            iw, ih = caja, max(1, int(round(alto * caja / float(ancho))))
        else:
            ih, iw = caja, max(1, int(round(ancho * caja / float(alto))))
        pix = componer(escalar(filas, ancho, alto, iw, ih), iw, ih, n)
        ruta = os.path.join(carpeta, 'icon-%d.png' % n)
        escribir_png(ruta, n, n, pix)
        print('OK  %s  %.1f KB' % (os.path.basename(ruta), os.path.getsize(ruta) / 1024.0))


if __name__ == '__main__':
    main()
