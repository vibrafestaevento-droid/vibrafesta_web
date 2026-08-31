"""
Optimiza un lote de fotos y las deja listas en la galeria de VibraFesta.

Uso:
    python subir_fotos.py "C:/ruta/a/las/fotos" "AGOSTO 2026"
    python subir_fotos.py "C:/ruta/a/las/fotos" "AGOSTO 2026" --cover IMG_6269.JPG

Hace todo esto:
  1. Redimensiona a 1200px de ancho y convierte a WebP (calidad 80).
  2. Corrige la rotacion EXIF (las fotos de WhatsApp suelen venir acostadas).
  3. Las guarda en assets/gallery/<EVENTO>/fotos/
  4. Genera el photos.json que lee gallery.html
  5. Genera el cover.webp de la portada del evento
  6. Imprime el bloque para pegar en eventos.json
"""
import argparse
import json
import os
import re
import time
import unicodedata

from PIL import Image, ImageOps

GALLERY_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "gallery")
EXTENSIONES = ('.jpg', '.jpeg', '.png', '.bmp', '.heic', '.webp')
MAX_WIDTH = 1200
WEBP_QUALITY = 80


def slugify(texto):
    txt = unicodedata.normalize('NFKD', texto).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', txt.lower()).strip('-')


def orden_natural(nombre):
    """Ordena IMG_2 antes que IMG_10."""
    return [int(p) if p.isdigit() else p.lower() for p in re.split(r'(\d+)', nombre)]


def optimizar(origen, destino, max_width=MAX_WIDTH):
    with Image.open(origen) as img:
        if getattr(img, "is_animated", False):
            return None
        img = ImageOps.exif_transpose(img)
        if img.mode != 'RGB':
            img = img.convert('RGB')
        if img.width > max_width:
            alto = int(img.height * (max_width / img.width))
            img = img.resize((max_width, alto), Image.LANCZOS)
        os.makedirs(os.path.dirname(destino), exist_ok=True)
        img.save(destino, "WEBP", quality=WEBP_QUALITY, method=6)
    return os.path.getsize(destino)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("origen", help="Carpeta con las fotos originales")
    ap.add_argument("evento", help="Nombre de la carpeta del evento, ej: 'AGOSTO 2026'")
    ap.add_argument("--cover", default=None, help="Nombre del archivo a usar de portada")
    args = ap.parse_args()

    if not os.path.isdir(args.origen):
        raise SystemExit(f"No existe la carpeta de origen: {args.origen}")

    destino_evento = os.path.join(GALLERY_DIR, args.evento)
    destino_fotos = os.path.join(destino_evento, "fotos")
    os.makedirs(destino_fotos, exist_ok=True)

    archivos = sorted(
        (f for f in os.listdir(args.origen)
         if f.lower().endswith(EXTENSIONES) and os.path.isfile(os.path.join(args.origen, f))),
        key=orden_natural,
    )
    if not archivos:
        raise SystemExit(f"No se encontraron imagenes en {args.origen}")

    print(f"Procesando {len(archivos)} fotos -> {destino_fotos}\n")
    inicio = time.time()
    antes = despues = 0
    generadas = []
    fallidas = []

    for i, archivo in enumerate(archivos, 1):
        origen = os.path.join(args.origen, archivo)
        nombre_webp = os.path.splitext(archivo)[0] + ".webp"
        salida = os.path.join(destino_fotos, nombre_webp)
        try:
            peso = optimizar(origen, salida)
            if peso is None:
                fallidas.append((archivo, "GIF animado"))
                continue
            antes += os.path.getsize(origen)
            despues += peso
            generadas.append(nombre_webp)
            print(f"[{i}/{len(archivos)}] {archivo} -> {nombre_webp} ({peso/1024:.0f} KB)")
        except Exception as e:
            fallidas.append((archivo, str(e)))
            print(f"[{i}/{len(archivos)}] ERROR en {archivo}: {e}")

    if not generadas:
        raise SystemExit("No se genero ninguna foto.")

    photos_json = os.path.join(destino_fotos, "photos.json")
    with open(photos_json, "w", encoding="utf-8") as f:
        json.dump({"images": generadas}, f, ensure_ascii=False, indent=2)

    cover_origen = args.cover or archivos[0]
    ruta_cover = os.path.join(args.origen, cover_origen)
    if os.path.isfile(ruta_cover):
        optimizar(ruta_cover, os.path.join(destino_evento, "cover.webp"))
        print(f"\nPortada generada desde: {cover_origen}")
    else:
        print(f"\nAVISO: no se encontro '{cover_origen}', no se genero cover.webp")

    print(f"\n--- Listo en {time.time()-inicio:.1f}s ---")
    print(f"Fotos generadas : {len(generadas)}")
    print(f"Peso original   : {antes/(1024*1024):.1f} MB")
    print(f"Peso optimizado : {despues/(1024*1024):.1f} MB  ({(1-despues/antes)*100:.1f}% menos)")
    if fallidas:
        print(f"\nFallaron {len(fallidas)}:")
        for nombre, motivo in fallidas:
            print(f"  - {nombre}: {motivo}")

    print("\nPega este bloque al INICIO del array en assets/gallery/eventos.json:")
    print(json.dumps({
        "title": args.evento.title(),
        "slug": slugify(args.evento),
        "date": time.strftime("%Y-%m-%d"),
        "cover": f"assets/gallery/{args.evento}/cover.webp",
        "folder": args.evento,
        "subtitle": f"Edicion {args.evento.title()}",
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
