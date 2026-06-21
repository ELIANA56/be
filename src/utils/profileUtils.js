/**
 * PROFILE UTILS — Helpers for the profile setup flow.
 *
 * New Google users only have name + email. We require age, weight, height,
 * gender, and goal before they can use the rest of the app.
 */

/** Returns true when all required profile fields are filled */
export function isProfileComplete(user) {
  if (!user) return false;
  return Boolean(
    user.Full_Name &&
    user.Age &&
    user.Weight &&
    user.Height &&
    user.Gender &&
    user.Goal_Type &&
    user.Email
  );
}

/** Build form default values from a user object from the API */
export function profileFormFromUser(user) {
  return {
    Full_Name: user?.Full_Name || '',
    Age: user?.Age ?? '',
    Weight: user?.Weight ?? '',
    Height: user?.Height ?? '',
    Gender: user?.Gender || '',
    Goal_Type: user?.Goal_Type || 'תחזוקה',
    Activity_Factor: String(user?.Activity_Factor ?? '1.2'),
    Email: user?.Email || '',
    Current_Password: '',
    New_Password: '',
  };
}

/** Custom browser event — ProtectedRoute listens so it re-checks profile after save */
export const PROFILE_UPDATED_EVENT = 'profile-updated';

export function notifyProfileUpdated() {
  window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
}
