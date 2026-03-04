/**
 * Sube un archivo directamente a Cloudinary desde el navegador.
 * Usa un Upload Preset sin firma (unsigned), por lo que NO expone el API secret.
 *
 * Flujo:
 *   1. Admin elige un archivo en el formulario
 *   2. Se llama a uploadToCloudinary(file)
 *   3. Cloudinary devuelve la URL pública y el public_id
 *   4. Se guarda esa URL en el backend vía POST /api/productos/{id}/fotos
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

export interface CloudinaryResult {
    url: string;        // URL pública de la imagen
    secure_url: string; // URL pública con HTTPS (usar siempre esta)
    public_id: string;  // ID para poder eliminar la imagen después
    width: number;
    height: number;
}

export async function uploadToCloudinary(file: File): Promise<CloudinaryResult> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
    );

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message ?? `Cloudinary error ${res.status}`);
    }

    return res.json();
}

/**
 * Sube múltiples archivos en paralelo.
 * Devuelve los resultados en el mismo orden que los archivos de entrada.
 */
export async function uploadMultipleToCloudinary(
    files: File[]
): Promise<CloudinaryResult[]> {
    return Promise.all(files.map(uploadToCloudinary));
}
