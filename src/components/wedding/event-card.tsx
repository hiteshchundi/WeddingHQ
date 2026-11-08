import { Card } from "../ui/card";

type EventCardProps = {
  name: string;
  startsAt: string;
  date: string;
  time: string;
  relativeTime: string;
};

export function EventCard({ name, startsAt, date, time, relativeTime }: EventCardProps) {
  return (
    <li>
      <Card className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="text-right text-sm text-secondary-text">{relativeTime}</p>
        </div>
        <time dateTime={startsAt} className="block text-sm text-secondary-text">
          {date} · {time}
        </time>
      </Card>
    </li>
  );
}
