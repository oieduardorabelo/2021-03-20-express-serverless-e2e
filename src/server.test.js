let supertest = require("supertest");

let given = require("../config/given");

let { server } = require("./server");

test("GET /", async () => {
  let req = await supertest(server).get("/");
  expect(req.statusCode).toBe(200);
  expect(req.body).toMatchObject({
    ok: true,
    payload: {
      uptime: expect.any(Number),
    },
  });
});

describe("when working with users", () => {
  let users;
  beforeAll(async () => {
    users = await given.anUserPoolWithUsers({ count: 3 });
  });
  afterAll(async () => {
    await users.teardown();
  });

  test("error when limit is gt than 16", async () => {
    let req = await supertest(server).get("/users?limit=17");
    expect(req.statusCode).toBe(400);
    expect(req.body.error).toBe("Max limit is 16");
  });

  test("we can list users in the pool", async () => {
    let req = await supertest(server).get("/users");
    expect(req.statusCode).toBe(200);
    expect(req.body.payload.users).toHaveLength(3);
  });
});

describe("when working with an item", () => {
  let item;

  test("we can create a new item", async () => {
    let req = await supertest(server).post("/items").send({
      text: "some-text",
    });
    item = req.body.payload;
    expect(req.body.ok).toBe(true);
    expect(req.body.payload).toMatchObject({
      text: expect.any(String),
      id: expect.any(String),
    });
  });

  test("we can read new item", async () => {
    let req = await supertest(server).get(`/items/${item.id}`);
    expect(req.body.ok).toBe(true);
    expect(req.body.payload).toMatchObject(item);
  });

  test("we can delete an item", async () => {
    let req = await supertest(server).delete(`/items/${item.id}`);
    expect(req.body.ok).toBe(true);
    expect(req.body.payload).toMatchObject(item);
  });
});

describe("when working with items", () => {
  let items;
  beforeAll(async () => {
    items = await given.anItemsTableWith({ count: 3 });
  });
  afterAll(async () => {
    await items.teardown();
  });

  test("get each of them by id", async () => {
    let item1 = await supertest(server).get(`/items/${items.data[0].id}`);
    let item2 = await supertest(server).get(`/items/${items.data[1].id}`);
    let item3 = await supertest(server).get(`/items/${items.data[2].id}`);

    expect(item1.body.ok).toBe(true);
    expect(item1.body.payload).toMatchObject(items.data[0]);

    expect(item2.body.ok).toBe(true);
    expect(item2.body.payload).toMatchObject(items.data[1]);

    expect(item3.body.ok).toBe(true);
    expect(item3.body.payload).toMatchObject(items.data[2]);
  });
});
