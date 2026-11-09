import { PhotoUploadPage } from "../../../components/wedding/photo-upload-page";

// The route parameter is only a demo identifier; it grants no real access.
export default async function UploadRoute({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <PhotoUploadPage key={token} />;
}
