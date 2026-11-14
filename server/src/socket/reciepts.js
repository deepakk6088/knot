/**
 * Receipt lifecycle utilities for KNOT message receipts.
 *
 * Enforces the strict SENT → DELIVERED → READ status progression and
 * provides a consistent payload builder used by all three receipt events.
 *
 * Rules:
 *   - Status may only move forward: SENT → DELIVERED → READ
 *   - Any backward or lateral move (e.g. READ → DELIVERED) is rejected
 *   - Equal transitions (DELIVERED → DELIVERED) are treated as no-ops
 */

// Numeric rank for each status — higher rank = further along the lifecycle.
const STATUS_RANK = {
  SENT: 0,
  DELIVERED: 1,
  READ: 2
};

/**
 * Returns true only when transitioning to a strictly higher status rank.
 * Equal or backward transitions are rejected to prevent status regression.
 *
 * @param {string} currentStatus - Existing message status from the database
 * @param {string} targetStatus  - Desired new status
 * @returns {boolean}
 */
function canTransition(currentStatus, targetStatus) {
  const currentRank = STATUS_RANK[currentStatus];
  const targetRank  = STATUS_RANK[targetStatus];

  // Both statuses must be known; target must be strictly ahead
  if (currentRank === undefined || targetRank === undefined) return false;
  return targetRank > currentRank;
}

/**
 * Builds a consistent receipt payload shared across message:sent,
 * message:delivered, and message:read socket events.
 *
 * Fields always present:
 *   messageId, conversationId, status
 * Fields conditionally present (included only when truthy):
 *   senderId, recipientId, readerId, tempId,
 *   createdAt, deliveredAt, readAt
 *
 * @param {object} message  - Prisma message row (or partial)
 * @param {object} [extra]  - Additional fields to merge (e.g. tempId, readerId)
 * @returns {object}
 */
function buildReceiptPayload(message, extra = {}) {
  const payload = {
    messageId:      message.id,
    conversationId: message.conversationId,
    status:         message.status
  };

  // Optional timestamp fields — only included when the DB has set them
  if (message.createdAt)   payload.createdAt   = message.createdAt;
  if (message.deliveredAt) payload.deliveredAt = message.deliveredAt;
  if (message.readAt)      payload.readAt      = message.readAt;

  // Merge caller-supplied extras (senderId, recipientId, readerId, tempId …)
  // Extra fields intentionally override computed ones where needed.
  return Object.assign(payload, extra);
}

module.exports = {
  canTransition,
  buildReceiptPayload,
  STATUS_RANK
};
