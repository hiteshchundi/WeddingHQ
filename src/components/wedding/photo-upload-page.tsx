"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { weddingFixture } from "../../fixtures/wedding";
import { AppearanceControl } from "../theme/appearance-control";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { PhotoPreview } from "./photo-preview";
import { photoFileError, photoMimeTypes } from "./photo-upload";

type SelectedPhoto = { id: string; file: File; previewUrl: string; ready: boolean };

export function PhotoUploadPage() {
  const event = weddingFixture.events.find((event) => event.id === weddingFixture.photoUploadEventId)!;
  const [selected, setSelected] = useState<SelectedPhoto[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [stage, setStage] = useState<"select" | "uploading" | "success">("select");
  const [uploadedCount, setUploadedCount] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const selectionTitle = useRef<HTMLHeadingElement>(null);
  const successTitle = useRef<HTMLHeadingElement>(null);
  const objectUrls = useRef(new Set<string>());
  const uploadTimer = useRef<number | null>(null);

  useEffect(() => {
    const urls = objectUrls.current;
    return () => {
      if (uploadTimer.current !== null) window.clearTimeout(uploadTimer.current);
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  function releasePreviews() {
    objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrls.current.clear();
  }
  function choosePhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    if (!files.length) return;
    releasePreviews();
    const problems: string[] = [];
    const selection: SelectedPhoto[] = [];
    for (const file of files) {
      const error = photoFileError(file);
      if (error) { problems.push(`${file.name}: ${error}`); continue; }
      const previewUrl = URL.createObjectURL(file);
      objectUrls.current.add(previewUrl);
      selection.push({ id: crypto.randomUUID(), file, previewUrl, ready: false });
    }
    setSelected(selection); setErrors(problems);
    event.currentTarget.value = "";
    requestAnimationFrame(() => selectionTitle.current?.focus());
  }
  function previewFailed(photo: SelectedPhoto) {
    // Ignore late events from replaced selections.
    if (!objectUrls.current.has(photo.previewUrl)) return;
    URL.revokeObjectURL(photo.previewUrl); objectUrls.current.delete(photo.previewUrl);
    setSelected((current) => current.filter((item) => item.id !== photo.id));
    setErrors((current) => [...current, `${photo.file.name}: This image could not be opened. Choose another JPEG, PNG or WebP file.`]);
  }
  function upload() {
    if (!selected.length || selected.some((photo) => !photo.ready) || uploadTimer.current !== null) return;
    setStage("uploading");
    const count = selected.length;
    // A brief local UI simulation only. No network request or persistent record.
    uploadTimer.current = window.setTimeout(() => {
      uploadTimer.current = null;
      releasePreviews(); setSelected([]); setErrors([]); setUploadedCount(count); setStage("success");
      requestAnimationFrame(() => successTitle.current?.focus());
    }, 350);
  }
  function reset() {
    releasePreviews(); setSelected([]); setErrors([]); setStage("select"); setUploadedCount(0);
    if (fileInput.current) fileInput.current.value = "";
    requestAnimationFrame(() => fileInput.current?.focus());
  }
  return (
    <main className="mx-auto min-h-dvh max-w-2xl space-y-6 p-4 md:p-8">
      <header className="flex items-start justify-between gap-4"><div className="min-w-0 space-y-2"><p className="break-words font-editorial text-3xl">{weddingFixture.identity.coupleNames}</p><p className="text-sm font-semibold">{event.name}</p></div><AppearanceControl /></header>
      <p className="text-sm text-secondary-text">Prototype preview · files stay in this browser.</p>
      {stage === "success" ? <Card className="space-y-6">
        <h1 ref={successTitle} tabIndex={-1} className="font-editorial text-3xl">Thank you!</h1>
        <p>Your photos were sent to {weddingFixture.identity.coupleNames}&apos;s wedding gallery.</p>
        <p role="status" className="text-sm text-secondary-text">Simulated upload complete: {uploadedCount} {uploadedCount === 1 ? "photo" : "photos"}. Nothing was uploaded and the organiser gallery is unchanged.</p>
        <Button onClick={reset}>Add more photos</Button>
      </Card> : <>
        <section className="space-y-4" aria-labelledby="upload-title">
          <h1 id="upload-title" className="font-editorial text-3xl">Share your photos from the {event.name}</h1>
          <p>Help {weddingFixture.identity.coupleNames} collect everyone&apos;s favourite moments.</p>
          <div className="grid gap-2"><label htmlFor="photo-upload-files" className="text-sm font-semibold">Choose photos</label><input ref={fileInput} id="photo-upload-files" type="file" multiple accept={photoMimeTypes.join(",")} disabled={stage === "uploading"} onChange={choosePhotos} aria-describedby="photo-upload-help" className="min-h-[44px] w-full min-w-0 max-w-full rounded-md border border-border bg-surface p-3 text-sm file:mr-3 file:min-h-[44px] file:cursor-pointer file:rounded-md file:border file:border-border file:bg-surface-alt file:px-3 file:text-primary-text disabled:opacity-50" /></div>
          <p id="photo-upload-help" className="text-sm text-secondary-text">JPEG, PNG or WebP only. Prototype limit: 10 MB per image. Choosing again replaces the current selection.</p>
        </section>
        {errors.length ? <div role="alert" className="space-y-2"><p className="text-sm font-semibold">Some files could not be selected</p><ul className="list-inside list-disc space-y-2 text-sm">{errors.map((error, index) => <li key={index} className="break-words">{error}</li>)}</ul></div> : null}
        {selected.length || errors.length ? <section aria-labelledby="selected-photos-title" className="space-y-4">
          <h2 ref={selectionTitle} id="selected-photos-title" tabIndex={-1} className="text-lg font-semibold">{selected.length} {selected.length === 1 ? "photo" : "photos"} selected</h2>
          <ul className="grid grid-cols-2 gap-3 md:gap-4">{selected.map((photo) => <li key={photo.id} className="min-w-0 space-y-2"><PhotoPreview previewUrl={photo.previewUrl} filename={photo.file.name} onLoad={() => setSelected((current) => current.map((item) => item.id === photo.id ? { ...item, ready: true } : item))} onError={() => previewFailed(photo)} /><p className="break-words text-sm">{photo.file.name}</p></li>)}</ul>
          {selected.length ? <div className="space-y-3"><Button disabled={stage === "uploading" || selected.some((photo) => !photo.ready)} onClick={upload}>{stage === "uploading" ? "Uploading…" : `Upload ${selected.length} ${selected.length === 1 ? "photo" : "photos"}`}</Button>{stage === "uploading" ? <p role="status" className="text-sm text-secondary-text">Simulating upload locally…</p> : selected.some((photo) => !photo.ready) ? <p role="status" className="text-sm text-secondary-text">Opening selected images…</p> : null}</div> : null}
        </section> : null}
      </>}
    </main>
  );
}
