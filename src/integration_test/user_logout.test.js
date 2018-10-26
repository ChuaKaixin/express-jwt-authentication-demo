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

async function loginAsTom(password, agent) {
  let email = fixtures.users.tom.email;
  let username = fixtures.users.tom.username;
  let response = await agent
    .post("/api/user/login")
    .send({ user: { username, email, password } });

  expect(response.statusCode).toBe(status.OK);
}

test("Logout should clear the cookie storing JWT token", async () => {
  const agent = request.agent(app);

  await loginAsTom(fixtures.users.tom.password, agent);

  let logoutResponse = await agent.post("/api/user/logout").send();
  expect(logoutResponse.statusCode).toBe(status.OK);

  // if we try to change password after logout, we expect to get back
  // Unauthorized (HTTP 401) in the response
  const newPassword = "new-password";
  const updatedUser = {
    password: newPassword
  };

  let changePwdResponse = await agent
    .put("/api/user/change_password")
    .send({ user: updatedUser });

  expect(changePwdResponse.statusCode).toBe(status.UNAUTHORIZED);
});
