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

export const PROFILE_UPDATED_EVENT = 'profile-updated';

export function notifyProfileUpdated() {
  window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
}
