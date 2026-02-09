/**
 * Browser Notification Utilities
 * Handles permission requests and notification display
 */

/**
 * Request notification permission from user
 */
export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        console.warn('Browser does not support notifications');
        return 'denied';
    }

    if (Notification.permission === 'granted') {
        return 'granted';
    }

    if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        return permission;
    }

    return Notification.permission;
};

/**
 * Show a browser notification
 * @param {string} title - Notification title
 * @param {string} body - Notification body text
 * @param {Function} onClick - Callback when notification is clicked
 */
export const showNotification = (title, body, onClick) => {
    if (!('Notification' in window)) {
        return;
    }

    if (Notification.permission !== 'granted') {
        return;
    }

    const notification = new Notification(title, {
        body,
        icon: '/logo.png',
        badge: '/logo.png',
        tag: 'neurotrace-chat', // Prevents duplicate notifications
        requireInteraction: false,
        silent: false
    });

    if (onClick) {
        notification.onclick = () => {
            window.focus();
            onClick();
            notification.close();
        };
    }

    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000);
};

/**
 * Play notification sound
 */
export const playNotificationSound = () => {
    try {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.3;
        audio.play().catch(err => console.warn('Could not play notification sound:', err));
    } catch (error) {
        console.warn('Notification sound error:', error);
    }
};

/**
 * Update document title with unread count
 * @param {number} count - Number of unread messages
 */
export const updateDocumentTitle = (count) => {
    const baseTitle = 'NeuroLinea';
    if (count > 0) {
        document.title = `(${count}) ${baseTitle}`;
    } else {
        document.title = baseTitle;
    }
};
