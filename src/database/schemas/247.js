const mongoose = require('mongoose');

const twentyFourSevenSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true,
  },
  msgChannelId: {
    type: String,
    required: true,
  },
  vcID: {
    type: String,
    required: true,
  },
  isEnabled: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('TwentyFourSeven', twentyFourSevenSchema);
