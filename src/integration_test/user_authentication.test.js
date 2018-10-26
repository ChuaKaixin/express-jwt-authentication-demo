process.env.NODE_ENV = "integration";

const testDB = require("../../test_helper/in_memory_mongodb_setup");
const fixtureLoader = require("../../test_helper/fixtures");
const fixtures = require("../../test_helper/fixtures").fixtures;
const request = require("supertest");
const app = require("../app");
const status = require("http-status");

beforeAll(testDB.setup);
beforeAll(fixtureLoader.load);
afterAll(testDB.teardown);

describe("User authentication", () => {
  test.skip("User login successfully -- old [for checking JWT in the body]", async () => {
    let email = fixtures.users.tom.email;
    let password = fixtures.users.tom.password;
    let username = fixtures.users.tom.username;
    let response = await request(app)
      .post("/api/user/login")
      .send({ user: { username, email, password } });

    let userJson = response.body.user;
    expect(response.statusCode).toBe(status.OK);
    expect(userJson).toBeDefined();
    expect(userJson.email).toEqual(email);
    expect(userJson.token).toBeDefined();
    expect(userJson.token).not.toBeNull();
  });

  test("User login successfully [JWT in cookie implementation]", async () => {
    let email = fixtures.users.tom.email;
    let password = fixtures.users.tom.password;
    let username = fixtures.users.tom.username;
    let response = await request(app)
      .post("/api/user/login")
      .send({ user: { username, email, password } });

    let userJson = response.body.user;
    expect(response.statusCode).toBe(200);
    expect(userJson).toBeDefined();
    expect(userJson.email).toEqual(email);
    const jwtTokenCookie = [expect.stringMatching(/jwt/)];
    expect(response.headers["set-cookie"]).toEqual(
      expect.arrayContaining(jwtTokenCookie)
    );
  });

  test("Login with invalid username", async () => {
    let email = "bogus@example.com";
    let password = "bogus";
    let username = "bogususer";
    let response = await request(app)
      .post("/api/user/login")
      .send({ user: { username, email, password } });
    expect(response.statusCode).toBe(status.UNAUTHORIZED);
    let responseErrors = response.body.error.message;
    expect(responseErrors).toEqual("username or password is invalid");
  });

  test("Login with invalid password", async () => {
    let email = fixtures.users.tom.email;
    let username = fixtures.users.tom.username;
    let password = "bogus";
    let response = await request(app)
      .post("/api/user/login")
      .send({ user: { username, email, password } });
    expect(response.statusCode).toBe(status.UNAUTHORIZED);
    let responseErrors = response.body.error.message;
    expect(responseErrors).toEqual("username or password is invalid");
  });

  test("Login with missing email", async () => {
    let username = fixtures.users.tom.username;
    let password = "bogus";
    let response = await request(app)
      .post("/api/user/login")
      .send({ user: { username, password } });
    expect(response.statusCode).toBe(status.UNAUTHORIZED);
    let responseErrors = response.body.error.message;
    expect(responseErrors).toEqual(
      "username, email and password are required for login"
    );
  });
});
