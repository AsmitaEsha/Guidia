import { memoryRepository } from '../repositories/memoryRepository.js';
import { ApiError } from '../middleware/errorHandler.js';

export const memoryService = {
  list(userId) {
    return memoryRepository.list(userId);
  },

  create(userId, data) {
    return memoryRepository.create({ userId, ...data });
  },

  async setStarred(id, userId, starred) {
    const entry = await memoryRepository.findById(id);
    if (!entry || entry.userId !== userId) {
      throw new ApiError(404, 'That memory was not found.', 'NOT_FOUND');
    }
    return memoryRepository.setStarred(id, starred);
  },

  async remove(id, userId) {
    const entry = await memoryRepository.findById(id);
    if (!entry || entry.userId !== userId) {
      throw new ApiError(404, 'That memory was not found.', 'NOT_FOUND');
    }
    await memoryRepository.remove(id);
  },
};
