var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BearSchema = new Schema({
  name: String
});

// Prevent OverwriteModelError by checking if model exists first
module.exports = mongoose.models.Bear || mongoose.model('Bear', BearSchema);
