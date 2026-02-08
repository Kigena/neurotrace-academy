import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['message', 'comment', 'reply', 'case_status', 'achievement', 'level_up', 'mention'],
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false,
        index: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Compound index for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

// Auto-cleanup: Keep only last 100 notifications per user
notificationSchema.statics.cleanupOldNotifications = async function (userId) {
    const notifications = await this.find({ userId })
        .sort({ createdAt: -1 })
        .skip(100)
        .select('_id');

    if (notifications.length > 0) {
        const idsToDelete = notifications.map(n => n._id);
        await this.deleteMany({ _id: { $in: idsToDelete } });
    }
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
