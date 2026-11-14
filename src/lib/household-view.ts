import type { Household } from "../fixtures/wedding";
import type { HouseholdDTO } from "../types/household";
export function householdView(household: HouseholdDTO): Household {
  return { id: household.id, householdName: household.householdName,
    primaryContactName: household.primaryContact.name ?? "", email: household.primaryContact.email ?? "", phone: household.primaryContact.phone ?? "",
    adultsInvited: household.adultsInvited, childrenInvited: household.childrenInvited,
    memberNames: household.members.map((member) => member.name), notes: household.notes ?? "",
    invitedEventIds: household.invitedEventIds, rsvpSummary: {}, guestLinkStatus: "Not sent" };
}
