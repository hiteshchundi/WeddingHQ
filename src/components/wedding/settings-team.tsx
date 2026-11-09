"use client";

import { useRef, useState, type FormEvent } from "react";
import { weddingFixture, type TeamMember } from "../../fixtures/wedding";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const editableRoles = ["PLANNER", "ADMIN", "COLLABORATOR"] as const;
const roleLabels = { OWNER: "Owner", PLANNER: "Planner", ADMIN: "Admin", COLLABORATOR: "Collaborator" };
const selectClass = "min-h-[44px] w-full min-w-0 rounded-md border border-border bg-surface px-3 text-base";

export function SettingsTeam() {
  const [team, setTeam] = useState(() => weddingFixture.team.map((member) => ({ ...member })));
  const [adding, setAdding] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const addButton = useRef<HTMLButtonElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const removeButtons = useRef<Record<string, HTMLButtonElement | null>>({});
  const confirmRemove = useRef<HTMLButtonElement>(null);

  function finishAdding() {
    setAdding(false); setError("");
    requestAnimationFrame(() => addButton.current?.focus());
  }
  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const role = String(data.get("role") ?? "");
    if (!name || !email || !editableRoles.some((item) => item === role)) { setError("Enter a name, email and an available role."); nameInput.current?.focus(); return; }
    if (team.some((member) => member.email?.toLowerCase() === email.toLowerCase())) { setError("This email is already on the prototype team."); return; }
    setTeam((current) => [...current, { id: crypto.randomUUID(), name, email, role: role as TeamMember["role"] }]);
    setNotice(`${name} added to the prototype team. No invitation email was sent.`);
    finishAdding();
  }
  function changeRole(id: string, role: string) {
    const member = team.find((item) => item.id === id);
    if (!member || member.role === "OWNER" || !editableRoles.some((item) => item === role)) return;
    setTeam((current) => current.map((item) => item.id === id ? { ...item, role: role as TeamMember["role"] } : item));
    setNotice(`${member.name}'s role changed to ${roleLabels[role as TeamMember["role"]]} in this prototype.`);
  }
  function remove(id: string) {
    const member = team.find((item) => item.id === id);
    if (pendingRemoval !== id || !member || member.role === "OWNER") return;
    setTeam((current) => current.filter((item) => item.id !== id));
    setPendingRemoval(null); setNotice(`${member.name} removed from the prototype team.`);
    requestAnimationFrame(() => title.current?.focus());
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4"><h2 ref={title} tabIndex={-1} id="settings-team-title" className="text-2xl font-semibold">Team</h2><Button ref={addButton} onClick={() => { setAdding(true); setNotice(""); setPendingRemoval(null); requestAnimationFrame(() => nameInput.current?.focus()); }} disabled={adding}>+ Add team member</Button></div>
      <p className="text-sm text-secondary-text">Manage this prototype team locally. Account access and task assignments do not change. Planner and Admin have the same operational visibility in V1.</p>
      <p className="text-sm text-secondary-text">Owners are protected here. Inviting another Owner will be handled during backend integration.</p>
      {notice ? <p role="status" className="break-words text-sm font-semibold">{notice}</p> : null}
      {adding ? <form onSubmit={add} className="space-y-4 border-y border-border py-6" aria-labelledby="settings-add-member-title">
        <h3 id="settings-add-member-title" className="text-lg font-semibold">Add team member</h3>
        {error ? <p role="alert" className="text-sm font-semibold">{error}</p> : null}
        <div className="grid gap-4 md:grid-cols-2"><Input ref={nameInput} id="settings-member-name" name="name" label="Name *" required maxLength={100} /><Input id="settings-member-email" name="email" label="Email *" type="email" required /><div className="grid gap-2"><label htmlFor="settings-member-role" className="text-sm font-medium">Role *</label><select id="settings-member-role" name="role" required defaultValue="COLLABORATOR" className={selectClass}>{editableRoles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}</select></div></div>
        <p className="text-sm text-secondary-text">No account invitation or email will be sent.</p>
        <div className="flex flex-wrap gap-3"><Button type="submit">Add to prototype team</Button><Button variant="secondary" onClick={finishAdding}>Cancel</Button></div>
      </form> : null}
      <ul className="divide-y divide-border">{team.map((member) => <li key={member.id} className="space-y-4 py-4">
        <div className="grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,200px)_auto]">
          <div className="min-w-0 space-y-2"><h3 className="break-words text-lg font-semibold">{member.name}</h3>{member.email ? <p className="break-words text-sm text-secondary-text">{member.email}</p> : null}{member.id === weddingFixture.demoOrganiserMembershipId ? <p className="text-sm text-secondary-text">Wedding creator</p> : null}</div>
          {member.role === "OWNER" ? <div className="space-y-2"><Badge>Owner</Badge><p className="text-sm text-secondary-text">Cannot be removed or have their role changed.</p></div> : <><div className="grid gap-2"><label htmlFor={`settings-role-${member.id}`} className="text-sm font-medium">Role for {member.name}</label><select id={`settings-role-${member.id}`} value={member.role} className={selectClass} onChange={(event) => changeRole(member.id, event.target.value)}>{editableRoles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}</select></div><Button ref={(button) => { removeButtons.current[member.id] = button; }} variant="tertiary" aria-label={`Remove ${member.name}`} onClick={() => { setPendingRemoval(member.id); requestAnimationFrame(() => confirmRemove.current?.focus()); }}>Remove</Button></>}
        </div>
        {pendingRemoval === member.id && member.role !== "OWNER" ? <div className="space-y-3" role="group" aria-label={`Confirm removal of ${member.name}`}><p className="break-words">Remove {member.name} from the prototype team?</p><div className="flex flex-wrap gap-3"><Button ref={confirmRemove} variant="secondary" onClick={() => remove(member.id)}>Confirm removal</Button><Button variant="tertiary" onClick={() => { setPendingRemoval(null); requestAnimationFrame(() => removeButtons.current[member.id]?.focus()); }}>Cancel</Button></div></div> : null}
      </li>)}</ul>
    </div>
  );
}
