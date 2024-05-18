const mongoose = require('mongoose');

const stickyMessageSchema = new mongoose.Schema({
    guildId: String,
    channelId: String,
    messageId: String,
    content: String,
    lastStickyMessageId: String
});

module.exports = mongoose.model('StickyMessage', stickyMessageSchema);
