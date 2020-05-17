const mongoose = require("mongoose");
const config = require("config");

const db = config.get("mongoURI");

const connectDb = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log("MongoDB conectado");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const closeDb = async () => {
  await mongoose.connection.close();
};

module.exports = { connectDb, closeDb };
