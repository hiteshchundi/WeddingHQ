export type GuestRsvp = {
  response: "YES" | "NO" | "MAYBE";
  adultsAttending: number;
  childrenAttending: number;
};

export const guestRsvpLabels = { YES: "Confirmed", NO: "Declined", MAYBE: "Maybe" };

// Keep validation independent of browser input constraints, including empty and
// fractional values. These prototype rules will also need server enforcement.
export function guestRsvpErrors(
  response: string,
  adults: string,
  children: string,
  limits: { adultsInvited: number; childrenInvited: number },
) {
  const errors: { response?: string; adults?: string; children?: string } = {};
  if (!["YES", "NO", "MAYBE"].includes(response)) errors.response = "Choose Yes, No or Maybe.";
  if (response === "YES") {
    if (!adults.trim() || !Number.isInteger(Number(adults)) || Number(adults) < 0 || Number(adults) > limits.adultsInvited) {
      errors.adults = `Enter a whole number from 0 to ${limits.adultsInvited}.`;
    }
    if (!children.trim() || !Number.isInteger(Number(children)) || Number(children) < 0 || Number(children) > limits.childrenInvited) {
      errors.children = `Enter a whole number from 0 to ${limits.childrenInvited}.`;
    }
  }
  return errors;
}
