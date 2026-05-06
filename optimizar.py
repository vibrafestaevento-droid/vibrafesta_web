import os
from PIL import Image
import time

# --- CONFIGURACIÓN ---
# 1. Esta es la carpeta de 1.7 GB que vamos a optimizar
SOURCE_DIR = r"C:/Users/rosch/OneDrive/Desktop/Vibra/VIBRA BALANCE"

# 2. Carpeta destino dentro del proyecto (directo a la galería)
OUTPUT_DIR = r"C:/Users/rosch/OneDrive/Desktop/Vibra/VibraFesta/assets/gallery/VIBRA BALANCE_2026/fotos"

# 3. Ajustes de optimización
MAX_WIDTH = 1200       # Ancho máximo (en píxeles)
WEBP_QUALITY = 80      # Calidad para WebP (de 0 a 100)
# ---

def optimize_image(source_path, output_path):
    try:
        with Image.open(source_path) as img:
            if getattr(img, "is_animated", False):
                print(f"Omitiendo (GIF animado): {source_path}")
                return
            if img.mode not in ('RGB', 'RGBA'):
                img = img.convert('RGBA')
            if img.width > MAX_WIDTH:
                w_percent = (MAX_WIDTH / float(img.width))
                h_size = int((float(img.height) * float(w_percent)))
                img = img.resize((MAX_WIDTH, h_size), Image.LANCZOS)

            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            img.save(output_path, "WEBP", quality=WEBP_QUALITY, method=6)
            return True
    except Exception as e:
        print(f"Error procesando {source_path}: {e}")
        return False

def main():
    start_time = time.time()
    processed_count = 0
    total_size_before = 0
    total_size_after = 0
    print(f"Iniciando optimización de '{SOURCE_DIR}'...")
    for root, dirs, files in os.walk(SOURCE_DIR):
        for file in files:
            ext = file.lower().split('.')[-1]
            if ext not in ['jpg', 'jpeg', 'png', 'bmp']:
                continue
            source_file_path = os.path.join(root, file)
            rel_path = os.path.relpath(root, SOURCE_DIR)
            output_sub_dir = os.path.join(OUTPUT_DIR, rel_path)
            base_name = os.path.splitext(file)[0]
            output_file_path = os.path.join(output_sub_dir, f"{base_name}.webp")
            if optimize_image(source_file_path, output_file_path):
                processed_count += 1
                size_before = os.path.getsize(source_file_path)
                size_after = os.path.getsize(output_file_path)
                total_size_before += size_before
                total_size_after += size_after
                print(f"OK: {source_file_path} ({size_before/1024:.0f} KB) -> {output_file_path} ({size_after/1024:.0f} KB)")
    end_time = time.time()
    print("/n--- ¡Proceso completado! ---")
    print(f"Tiempo total: {end_time - start_time:.2f} segundos")
    print(f"Imágenes procesadas: {processed_count}")
    print(f"Tamaño original: {total_size_before / (1024*1024):.2f} MB")
    print(f"Tamaño optimizado: {total_size_after / (1024*1024):.2f} MB")
    print(f"Reducción: {((total_size_before - total_size_after) / total_size_before) * 100:.2f}%")

if __name__ == "__main__":
    main()