import { PageHeader } from "../../../components/layout/page-header";
import { Card } from "../../../components/ui/card";

export default function WeddingPage() {
  return (
    <>
      <PageHeader title="Overview" />
      <main id="organiser-content" tabIndex={-1} className="organiser-content">
        <Card>
          <p className="text-secondary-text">Overview content will be implemented in Phase E.</p>
        </Card>
      </main>
    </>
  );
}
