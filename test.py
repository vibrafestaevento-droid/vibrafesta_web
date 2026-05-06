import os
import json

# Carpeta base donde están los eventos
BASE_GALLERY_DIR = os.path.join("assets", "gallery")

# Extensiones de imágenes que vamos a considerar
IMAGE_EXTS = (".webp", ".jpg", ".jpeg", ".png", ".bmp")

def crear_photos_json(nombre_evento):
    """
    Crea un photos.json dentro de:
    assets/gallery/<nombre_evento>/fotos/photos.json
    listando todas las imágenes de esa carpeta.
    """
    # Ruta a la carpeta del evento
    evento_dir = os.path.join(BASE_GALLERY_DIR, nombre_evento)
    fotos_dir = os.path.join(evento_dir, "fotos")

    if not os.path.isdir(fotos_dir):
        print(f"[ERROR] No existe la carpeta de fotos: {fotos_dir}")
        return

    # Listar imágenes
    archivos = sorted(
        f for f in os.listdir(fotos_dir)
        if f.lower().endswith(IMAGE_EXTS)
    )

    if not archivos:
        print(f"[AVISO] No se encontraron imágenes en: {fotos_dir}")
        return

    data = {
        "images": archivos
    }

    photos_json_path = os.path.join(fotos_dir, "photos.json")
    with open(photos_json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"[OK] photos.json creado en: {photos_json_path}")
    print(f"    Imágenes incluidas: {len(archivos)}")


if __name__ == "__main__":
    # Pedir el nombre de la carpeta por consola
    print("Ejemplo de nombre de evento: ANIVERSARIO VIBRA")
    nombre = input("Nombre EXACTO de la carpeta del evento dentro de assets/gallery: ").strip()

    if not nombre:
        print("No ingresaste un nombre de carpeta. Saliendo...")
    else:
        crear_photos_json(nombre)
