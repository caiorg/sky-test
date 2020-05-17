module.exports = {
  async up(db) {
    await db.collection("roles").updateOne(
      {
        nome: "admin",
      },
      {
        $set: {
          nome: "admin",
          urlsPermitidas: "*",
        },
      },
      { upsert: true }
    );
    await db.collection("roles").updateOne(
      {
        nome: "user",
      },
      {
        $set: {
          nome: "user",
          urlsPermitidas: ["/api/profile/me", "/api/profile"],
        },
      },
      { upsert: true }
    );
    await db.collection("users").deleteMany({});
    await db.collection("profiles").deleteMany({});
  },

  async down(db) {
    await db.collection("roles").deleteMany({});
    await db.collection("users").deleteMany({});
    await db.collection("profiles").deleteMany({});
  },
};
