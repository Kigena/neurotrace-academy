import ChatRoom from '../models/ChatRoom.js';
import { isObjectIdLike } from '../utils/validation.js';

export const MAX_MESSAGE_LENGTH = 4000;
export const MAX_ATTACHMENTS = 10;

export async function isRoomMember(roomId, userId) {
    if (!isObjectIdLike(roomId) || !isObjectIdLike(userId)) return false;
    const room = await ChatRoom.exists({ _id: roomId, 'participants.userId': userId, isActive: { $ne: false } });
    return !!room;
}

/**
 * Whether `userId` may see `message` (used for reactions/read receipts).
 */
export async function canAccessMessage(message, userId) {
    if (!message) return false;
    switch (message.type) {
        case 'public':
            return true;
        case 'private':
            return message.senderId === userId || message.recipientId === userId;
        case 'ai':
            return message.senderId === userId || message.recipientId === userId;
        case 'group':
            return isRoomMember(message.roomId, userId);
        default:
            return false;
    }
}

export function cleanContent(content) {
    if (typeof content !== 'string') return null;
    const trimmed = content.trim();
    if (!trimmed || trimmed.length > MAX_MESSAGE_LENGTH) return null;
    return trimmed;
}

/**
 * Accept only attachment objects with an https URL (or a same-server
 * /uploads path) and bounded metadata.
 */
export function cleanAttachments(attachments) {
    if (!Array.isArray(attachments)) return [];
    return attachments.slice(0, MAX_ATTACHMENTS).filter((a) =>
        a && typeof a.url === 'string' && (/^https:\/\//i.test(a.url) || /^http:\/\/localhost[:/]/i.test(a.url))
    ).map((a) => ({
        url: a.url,
        filename: typeof a.filename === 'string' ? a.filename.slice(0, 255) : undefined,
        type: ['image', 'file', 'document'].includes(a.type) ? a.type : 'file',
        size: Number.isFinite(a.size) ? a.size : undefined,
    }));
}
