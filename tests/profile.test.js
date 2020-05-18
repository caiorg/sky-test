const request = require("supertest");
const app = require("../server");
const { closeDb } = require("../config/db");

const User = require("../models/User");
const Profile = require("../models/Profile");

const userData = {
  nome: "Fulano de Tal",
  email: "fulanodetal@gmail.com",
  senha: "123456",
};

const adminData = {
  nome: "Caio Guimarães",
  email: "caio.guimaraes@gmail.com",
  senha: "123456",
};

const userProfileData = {
  telefones: [
    {
      numero: "40041234",
      ddd: "11",
    },
  ],
  endereco: {
    logradouro: "teste",
    numero: 1,
    cep: "012345-678",
  },
};

const adminProfileData = {
  telefones: [
    {
      numero: "40041234",
      ddd: "11",
    },
  ],
  endereco: {
    logradouro: "teste",
    numero: 1,
    cep: "012345-678",
  },
  papel: "admin",
};

beforeAll(async () => {
  const user = await User.findOne({ email: userData.email });
  const admin = await User.findOne({ email: adminData.email });

  if (!user) {
    await request(app).post("/api/user/signup").send(userData);
  }

  if (!admin) {
    await request(app).post("/api/user/signup").send(adminData);
  }
});

afterAll(async () => {
  await User.deleteMany({});
  await Profile.deleteMany({});

  await app.close();
  await closeDb();
});

describe("Create/Update Profile Route", () => {
  it("should create or update a profile with user role to logged in user", async () => {
    const userRes = await request(app).post("/api/user/signin").send({
      email: userData.email,
      senha: userData.senha,
    });

    expect(userRes.statusCode).toEqual(200);
    expect(userRes.body).toHaveProperty("user.token");

    const res = await request(app)
      .post("/api/profile")
      .send(userProfileData)
      .set("Authorization", `Bearer ${userRes.body.user.token}`);

    expect([200, 201]).toContain(res.statusCode);
    expect(res.body).toHaveProperty("_id");
  });

  it("should create or update a profile with admin role to logged in user", async () => {
    const adminRes = await request(app).post("/api/user/signin").send({
      email: adminData.email,
      senha: adminData.senha,
    });

    expect(adminRes.statusCode).toEqual(200);
    expect(adminRes.body).toHaveProperty("user.token");

    const res = await request(app)
      .post("/api/profile")
      .send(adminProfileData)
      .set("Authorization", `Bearer ${adminRes.body.user.token}`);

    expect([200, 201]).toContain(res.statusCode);
    expect(res.body).toHaveProperty("_id");
  });

  it("should validate request data and return error messages", async () => {
    const testData = {
      endereco: {
        logradouro: "teste",
        numero: 1,
        cep: "012345-678",
      },
    };

    const adminRes = await request(app).post("/api/user/signin").send({
      email: adminData.email,
      senha: adminData.senha,
    });

    expect(adminRes.statusCode).toEqual(200);
    expect(adminRes.body).toHaveProperty("user.token");

    const res = await request(app)
      .post("/api/profile")
      .send(testData)
      .set("Authorization", `Bearer ${adminRes.body.user.token}`);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("mensagem.errors", [
      {
        mensagem: "Lista de telefones obrigatória",
        parametro: "telefones",
      },
    ]);
  });
});

describe("All Logged In User Routes", () => {
  let userRes = null;
  let userProfileRes = null;

  beforeAll(async () => {
    userRes = await request(app).post("/api/user/signin").send({
      email: userData.email,
      senha: userData.senha,
    });

    if (userRes.statusCode === 200) {
      userProfileRes = await request(app)
        .post("/api/profile")
        .send(adminProfileData)
        .set("Authorization", `Bearer ${userRes.body.user.token}`);
    }
  });

  it("should return logged in user's profile", async () => {
    expect(userRes.statusCode).toEqual(200);
    expect(userRes.body).toHaveProperty("user.token");

    const res = await request(app)
      .get("/api/profile/me")
      .set("Authorization", `Bearer ${userRes.body.user.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("_id");
  });

  it("should delete an user and he's profile", async () => {
    expect(userRes.statusCode).toEqual(200);
    expect(userRes.body).toHaveProperty("user.token");

    expect([200, 201]).toContain(userProfileRes.statusCode);
    expect(userProfileRes.body).toHaveProperty("_id");

    const res = await request(app)
      .delete("/api/profile")
      .set("Authorization", `Bearer ${userRes.body.user.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("mensagem", "Usuário excluído");
  });
});

describe("Admin Only Routes", () => {
  let adminRes = null;
  let adminProfileRes = null;

  beforeAll(async () => {
    adminRes = await request(app).post("/api/user/signin").send({
      email: adminData.email,
      senha: adminData.senha,
    });

    if (adminRes.statusCode === 200) {
      adminProfileRes = await request(app)
        .post("/api/profile")
        .send(adminProfileData)
        .set("Authorization", `Bearer ${adminRes.body.user.token}`);
    }
  });

  it("should return all user's profiles", async () => {
    expect(adminRes.statusCode).toEqual(200);
    expect(adminRes.body).toHaveProperty("user.token");

    const res = await request(app)
      .get("/api/profile/all")
      .set("Authorization", `Bearer ${adminRes.body.user.token}`);

    expect(res.statusCode).toEqual(200);
  });

  it("should find a user by id and return he's data", async () => {
    expect(adminRes.statusCode).toEqual(200);
    expect(adminRes.body).toHaveProperty("user.token");

    expect([200, 201]).toContain(adminProfileRes.statusCode);
    expect(adminProfileRes.body).toHaveProperty("_id");

    const allUsersRes = await request(app)
      .get("/api/profile/all")
      .set("Authorization", `Bearer ${adminRes.body.user.token}`);

    expect(allUsersRes.statusCode).toEqual(200);

    const res = await request(app)
      .get(`/api/profile/user/${allUsersRes.body[0].user._id}`)
      .set("Authorization", `Bearer ${adminRes.body.user.token}`);

    expect(res.statusCode).toEqual(200);
    expect(allUsersRes.body[0]).toHaveProperty("_id", String(res.body._id));
  });

  it("should not find an user with an invalid id", async () => {
    expect(adminRes.statusCode).toEqual(200);
    expect(adminRes.body).toHaveProperty("user.token");

    expect([200, 201]).toContain(adminProfileRes.statusCode);
    expect(adminProfileRes.body).toHaveProperty("_id");

    const res = await request(app)
      .get(`/api/profile/user/11111111`)
      .set("Authorization", `Bearer ${adminRes.body.user.token}`);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("mensagem", "Perfil não encontrado");
  });

  it("should not find an user with a nonexistent id", async () => {
    expect(adminRes.statusCode).toEqual(200);
    expect(adminRes.body).toHaveProperty("user.token");

    expect([200, 201]).toContain(adminProfileRes.statusCode);
    expect(adminProfileRes.body).toHaveProperty("_id");

    const res = await request(app)
      .get(`/api/profile/user/5ec1fd56c58c9b6c7007428c`)
      .set("Authorization", `Bearer ${adminRes.body.user.token}`);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("mensagem", "Perfil não encontrado");
  });
});
