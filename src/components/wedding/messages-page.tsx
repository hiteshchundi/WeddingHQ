"use client";

import { Plus, X } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { messageStatusLabels, weddingFixture, type WeddingMessage } from "../../fixtures/wedding";
import { PageHeader } from "../layout/page-header";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { IconButton } from "../ui/icon-button";
import { useWeddingEvents } from "./events-context";
import { audienceCount, audienceLabel, messageTime } from "./message-display";
import { MessageForm } from "./message-form";

const views = ["SCHEDULED", "SENT", "DRAFT"] as const;
const tabLabels = { SCHEDULED: "Scheduled", SENT: "Sent", DRAFT: "Drafts" };
const empty = {
  SCHEDULED: { title: "No scheduled messages", description: "Schedule a reminder when guests need a nudge." },
  SENT: { title: "No sent messages yet", description: "Messages you mark as sent in this preview will appear here." },
  DRAFT: { title: "No drafts", description: "Messages you save without sending will appear here." },
};
// Dates render in browser-local time after hydration, without server-time drift.
const subscribeToClient = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function MessagesPage() {
  const { events } = useWeddingEvents();
  const [messages, setMessages] = useState(weddingFixture.messages);
  const [view, setView] = useState<WeddingMessage["status"]>("SCHEDULED");
  const [editing, setEditing] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const drawer = useRef<HTMLDialogElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const inBrowser = useSyncExternalStore(subscribeToClient, clientReady, serverReady);
  const selected = messages.find((message) => message.id === editing);
  const readOnly = selected?.status === "SENT";
  const visible = messages.filter((message) => message.status === view).sort((a, b) => view === "SCHEDULED"
    ? Date.parse(a.scheduledAt!) - Date.parse(b.scheduledAt!)
    : Date.parse(b.sentAt ?? b.createdAt) - Date.parse(a.sentAt ?? a.createdAt));

  useEffect(() => {
    if (editing) {
      if (!drawer.current?.open) drawer.current?.showModal();
      const focusTarget = drawer.current?.querySelector<HTMLElement>(selected?.status === "SENT" ? "h2" : "select");
      focusTarget?.focus();
    } else drawer.current?.close();
  }, [editing, selected?.status]);

  function openMessage(id: string) { setNotice(""); setEditing(id); }
  function save(message: WeddingMessage) {
    setMessages((current) => current.some((item) => item.id === message.id) ? current.map((item) => item.id === message.id ? message : item) : [message, ...current]);
    setView(message.status);
    setNotice(`${message.subject}: ${message.status === "DRAFT" ? "draft saved" : message.status === "SENT" ? "marked as sent in this preview; no email was delivered" : "scheduled in this preview; no email will be sent automatically"}.`);
    setEditing(null);
    requestAnimationFrame(() => tabs.current[views.indexOf(message.status)]?.focus());
  }
  function tabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === "ArrowRight" ? (index + 1) % views.length : event.key === "ArrowLeft" ? (index + views.length - 1) % views.length : event.key === "Home" ? 0 : event.key === "End" ? views.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    setView(views[next]);
    tabs.current[next]?.focus();
  }
  function timestamp(message: WeddingMessage) {
    const value = message.status === "SCHEDULED" ? message.scheduledAt : message.status === "SENT" ? message.sentAt : null;
    if (!value) return null;
    return <p className="text-sm text-secondary-text">{message.status === "SENT" ? "Sent" : "Scheduled for"} <time dateTime={value}>{inBrowser ? messageTime(value) : "Loading local time…"}</time> · browser-local time</p>;
  }
  return (
    <>
      <PageHeader title="Messages" action={<Button onClick={() => openMessage("new")} className="gap-2"><Plus size={18} aria-hidden="true" />New message</Button>} />
      <main id="organiser-content" tabIndex={-1} className="organiser-content space-y-6">
        <p className="text-sm text-secondary-text">Email preview only. No email is delivered, including messages marked Sent. Scheduled messages do not send automatically. Changes reset when you leave this page or reload.</p>
        <div role="tablist" aria-label="Message views" className="flex flex-wrap gap-2">
          {views.map((status, index) => <Button key={status} ref={(element) => { tabs.current[index] = element; }} id={`message-tab-${status}`} role="tab" aria-selected={view === status} aria-controls="message-panel" tabIndex={view === status ? 0 : -1} variant="tertiary" className="aria-selected:bg-sage-soft" onClick={() => setView(status)} onKeyDown={(event) => tabKey(event, index)}>{tabLabels[status]} · {messages.filter((message) => message.status === status).length}</Button>)}
        </div>
        {notice ? <p role="status" className="break-words text-sm font-semibold">{notice}</p> : null}
        <section id="message-panel" role="tabpanel" aria-labelledby={`message-tab-${view}`} tabIndex={0} className="space-y-4">
          <h2 className="text-lg font-semibold">{view === "DRAFT" ? "Drafts" : `${tabLabels[view]} messages`} · {visible.length}</h2>
          {!visible.length ? <Card className="space-y-3"><h3 className="text-lg font-semibold">{empty[view].title}</h3><p className="text-sm text-secondary-text">{empty[view].description}</p><Button variant="secondary" onClick={() => openMessage("new")}>New message</Button></Card>
            : <ul className="space-y-4">{visible.map((message) => <li key={message.id}><Card className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3"><h3 className="min-w-0"><button onClick={() => openMessage(message.id)} className="min-h-[44px] break-words text-left text-lg font-semibold underline decoration-border underline-offset-4">{message.subject}<span className="sr-only"> · {message.status === "SENT" ? "Read message" : "Edit message"}</span></button></h3><Badge>{messageStatusLabels[message.status]}</Badge></div>
              <p className="break-words text-sm">{audienceLabel(message.audience, events)}</p>
              <p className="text-sm text-secondary-text">{audienceCount(message.audience, weddingFixture.households)} sample households · not a recipient count</p>
              {timestamp(message)}
            </Card></li>)}</ul>}
        </section>
      </main>
      <dialog ref={drawer} aria-labelledby="message-drawer-title" className="shell-dialog message-drawer" onClose={() => setEditing(null)} onClick={(event) => { if (event.target === event.currentTarget) setEditing(null); }}>
        <header className="flex items-start justify-between gap-4 border-b border-border bg-surface p-4 md:p-6"><h2 id="message-drawer-title" tabIndex={-1} className="text-2xl font-semibold">{readOnly ? "Message details" : selected ? "Edit message" : "New message"}</h2><IconButton aria-label="Close message" onClick={() => setEditing(null)}><X size={20} /></IconButton></header>
        <div className="space-y-6 p-4 md:p-6">
          {selected ? <div className="space-y-3"><Badge>{messageStatusLabels[selected.status]}</Badge>{timestamp(selected)}</div> : null}
          {selected && readOnly ? <>
            <p className="text-sm text-secondary-text">Read-only preview. No email was delivered.</p>
            <dl className="space-y-6"><div><dt className="text-sm text-secondary-text">Subject</dt><dd className="break-words text-lg font-semibold">{selected.subject}</dd></div><div><dt className="text-sm text-secondary-text">Audience</dt><dd className="break-words">{audienceLabel(selected.audience, events)}</dd></div><div><dt className="text-sm text-secondary-text">Message</dt><dd className="whitespace-pre-wrap break-words">{selected.body}</dd></div></dl>
            <Button variant="secondary" onClick={() => setEditing(null)}>Close</Button>
          </> : editing ? <MessageForm key={editing} message={selected} events={events} onSave={save} onCancel={() => setEditing(null)} /> : null}
        </div>
      </dialog>
    </>
  );
}
