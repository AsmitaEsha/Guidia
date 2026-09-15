import { userRepository } from '../repositories/userRepository.js';
import { ApiError } from '../middleware/errorHandler.js';

function toPublicUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    preferredLanguage: user.preferredLanguage,
    preference: user.preference,
  };
}

export const userService = {
  async me(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, 'Account not found.', 'NOT_FOUND');
    return toPublicUser(user);
  },

  // Persists onboarding + Cognitive Load Governor state so it survives a
  // reload instead of resetting to defaults every session.
  async updatePreferences(userId, changes) {
    await userRepository.updatePreference(userId, changes);
    return this.me(userId);
  },
};
