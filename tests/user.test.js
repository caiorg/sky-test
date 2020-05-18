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

afterAll(async () => {
  await User.deleteMany({});
  await Profile.deleteMany({});

  await app.close();
  await closeDb();
});

describe("Signup Route", () => {
  it("should create a new user", async () => {
    const res = await request(app).post("/api/user/signup").send(userData);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("user");
  });

  it("should find an existing user and block new user creation", async () => {
    const res = await request(app).post("/api/user/signup").send(userData);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("mensagem.errors", [
      {
        mensagem: "E-mail já existente",
        parametro: "email",
        valor: userData.email,
      },
    ]);
  });
});

describe("Signin Route", () => {
  it("should return a bad request status with validation error messages", async () => {
    const res = await request(app).post("/api/user/signin").send({
      email: userData.email,
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("mensagem.errors", [
      { mensagem: "Senha é obrigatória", parametro: "senha" },
    ]);
  });

  it("should signin user", async () => {
    const res = await request(app).post("/api/user/signin").send({
      email: userData.email,
      senha: userData.senha,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("user.token");
  });

  it("should not signin user with wrong email", async () => {
    const res = await request(app).post("/api/user/signin").send({
      email: "emailerrado@gmail.com",
      senha: userData.senha,
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("mensagem", "Usuário e/ou senha inválidos");
  });

  it("should not signin user with wrong password", async () => {
    const res = await request(app).post("/api/user/signin").send({
      email: userData.email,
      senha: "senhaerrada",
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("mensagem", "Usuário e/ou senha inválidos");
  });
});

describe("Signout Route", () => {
  let token = "";
  beforeAll(async () => {
    const res = await request(app).post("/api/user/signin").send({
      email: userData.email,
      senha: userData.senha,
    });

    if (res.statusCode === 200) {
      token = res.body.user.token;
    }
  });

  it("should signout user", async () => {
    const res = await request(app)
      .post("/api/user/signout")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("mensagem", String("Usuário desconectado"));
  });
});

describe("User Route", () => {
  let token = "";
  beforeAll(async () => {
    const res = await request(app).post("/api/user/signin").send({
      email: userData.email,
      senha: userData.senha,
    });

    if (res.statusCode === 200) {
      token = res.body.user.token;
    }
  });

  it("should return user's data", async () => {
    const res = await request(app)
      .get("/api/user")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("_id");
  });
});
