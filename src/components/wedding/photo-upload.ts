// Prototype constraints only; final upload policy belongs to backend integration.
export const photoMimeTypes = ["image/jpeg", "image/png", "image/webp"];
export const maxPhotoBytes = 10 * 1024 * 1024;

export function photoFileError(file: Pick<File, "type" | "size">) {
  if (!photoMimeTypes.includes(file.type)) return "Choose a JPEG, PNG or WebP image. Videos and other files are not supported.";
  if (!file.size) return "This file is empty. Choose another image.";
  if (file.size > maxPhotoBytes) return "This image exceeds the prototype limit of 10 MB per file.";
  return null;
}
