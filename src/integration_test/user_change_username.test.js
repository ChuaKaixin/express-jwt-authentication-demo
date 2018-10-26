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

let jwtToken;

async function login(username, password, agent) {
  let email = fixtures.users.tom.email;
  let response = await agent
    .post("/api/user/login")
    .send({ user: { username, email, password } });

  expect(response.statusCode).toBe(status.OK);
  jwtToken = response.body.user.token;
}

test("change username of the current user", async () => {
  const agent = request.agent(app);
  await login(fixtures.users.tom.username, fixtures.users.tom.password, agent);
  let newusername = "newtom";
  const updatedUser = {
    username: newusername
  };
  let response = await agent
    .put("/api/user/change_username")
    .send({ user: updatedUser })
    .set("Authorization", "Bearer " + jwtToken);

  expect(response.statusCode).toBe(status.OK);

  const agent2 = request.agent(app);
  await login(newusername, fixtures.users.tom.password, agent2);
});
