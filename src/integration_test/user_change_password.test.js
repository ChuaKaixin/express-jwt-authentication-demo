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

//let jwtToken;

async function loginAsTom(password, agent) {
  let email = fixtures.users.tom.email;
  let username = fixtures.users.tom.username;
  let response = await agent
    .post("/api/user/login")
    .send({ user: { username, email, password } });

  expect(response.statusCode).toBe(status.OK);
  //jwtToken = response.body.user.token;
}

async function loginAsTomFail(password, agent) {
  let email = fixtures.users.tom.email;
  let username = fixtures.users.tom.username;
  let response = await agent
    .post("/api/user/login")
    .send({ user: { username, email, password } });

  expect(response.statusCode).toBe(status.UNAUTHORIZED);
}

const secondNewPassword = "new-password";
test("Change password on the current user", async () => {
  const agent = request.agent(app);

  await loginAsTom(fixtures.users.tom.password, agent);

  const newPassword = secondNewPassword;
  const updatedUser = {
    password: newPassword
  };

  let response = await agent
    .put("/api/user/change_password")
    .send({ user: updatedUser });
  //.set("Authorization", "Bearer " + jwtToken); --for jwt implementation

  expect(response.statusCode).toBe(status.OK);

  const agent2 = request.agent(app);
  await loginAsTom(newPassword, agent2);
});

test("Change password to < min length", async () => {
  const agent = request.agent(app);
  await loginAsTom(secondNewPassword, agent);

  const newPassword = "new";
  const updatedUser = {
    password: newPassword
  };

  let response = await agent
    .put("/api/user/change_password")
    .send({ user: updatedUser });
  //.set("Authorization", "Bearer " + jwtToken);

  expect(response.statusCode).toBe(status.UNPROCESSABLE_ENTITY);
  expect(response.body.message).toBeDefined();
  expect(response.body.message).toEqual("Password min length is 4");

  const agent2 = request.agent(app);
  await loginAsTomFail(newPassword, agent2);
});

test("Change password without logging in should return 401", async () => {
  const agent = request.agent(app);
  const newPassword = "new-password";
  const updatedUser = {
    password: newPassword
  };

  let response = await agent
    .put("/api/user/change_password")
    .send({ user: updatedUser });

  expect(response.statusCode).toBe(status.UNAUTHORIZED);

  const agent2 = request.agent(app);
  await loginAsTom(newPassword, agent2);
});
