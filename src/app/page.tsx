import { BrandMark } from "../components/brand/brand-mark";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { IconButton } from "../components/ui/icon-button";
import { Input } from "../components/ui/input";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-[40rem] flex-col gap-8 px-6 py-12">
      <BrandMark />

      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Design foundation</h1>
        <p className="text-sm text-secondary-text">
          Development preview. These controls are visual specimens only.
        </p>
      </header>

      <Card className="flex flex-col gap-6">
        <h2 className="font-editorial text-3xl">Editorial headline sample</h2>

        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary action</Button>
          <Button variant="secondary">Secondary action</Button>
          <Button variant="tertiary">Text action</Button>
        </div>

        <Input
          id="preview-email"
          label="Email"
          type="email"
          helperText="Example field; no information is submitted."
        />

        <div className="flex flex-wrap items-center gap-4">
          <Badge>Confirmed</Badge>
          <BrandMark wordmark={false} />
          <IconButton aria-label="Example icon button">
            <span className="text-2xl">+</span>
          </IconButton>
        </div>
      </Card>
    </main>
  );
}
