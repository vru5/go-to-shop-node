var mongoose = require("mongoose"),
  bycrypt = require("bcrypt"),
  schema = mongoose.Schema;

var RegisteredUserSchema = new schema({
  username: {
    type: String,
    /**It's basically there to ensure the strings you save through the schema are properly trimmed. If you add 
     * { type: String, trim: true } to a field in your schema, then trying to save strings like "  hello", or "hello ", or "  hello ", 
     * would end up being saved as "hello" in Mongo - i.e. white spaces will be removed from both sides of the string
    */
   trim: true,
   required: true
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    required: true
  },
  password: {
    type: String,
    trim: false,
    required: true
  }
});

var RegisteredUser = mongoose.model('RegisteredUser', RegisteredUserSchema);
module.exports = RegisteredUser;