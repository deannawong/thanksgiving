// tests for /api/dishes

// supertest is a module that allows us to test our express server
const request = require("supertest");
const { app } = require("./../server/app.js");
const { db, Dish, Person } = require("./../db/index.js");

beforeEach(async done => {
  // wipe the db before each test block
  await db.sync({ force: true });
  done();
});
afterAll(async done => {
  // close the db connection upon completion of all tests
  await db.close();
  done();
});
describe("/api/dishes routes", () => {
  // its up to you to create the test conditions for /api/dishes
  // add as many tests as you feel necessary to fully cover each routes functionality
  const person1 = { name: "Joey", isAttending: true };
  const person2 = { name: "Chandler", isAttending: false };
  const person3 = { name: "Monica", isAttending: true };
  const person4 = { name: "Rachel", isAttending: true };

  const dish1 = { name: "mashed potatoes", description: "buttery mash" };
  const dish2 = { name: "pie", description: "cherry" };
  const dish3 = { name: "turkey", description: "large poultry" };
  const dish4 = {
    name: "trifle",
    description: "custard raspberries beef and peas"
  };

  describe("GET to /api/dishes", () => {
    it("should retrieve all dishes if no params are given", async () => {
      try {
        const [joey, chandler] = await Promise.all([
          Person.create(person1),
          Person.create(person2)
        ]);
        const [mash, pie] = await Promise.all([
          Dish.create({ ...dish1, personId: joey.id }),
          Dish.create(dish2)
        ]);

        const getDishes = await request(app)
          .get("/api/dishes")
          .expect("Content-Type", /json/)
          .expect(200);

        const listOfDishes = getDishes.body;

        expect(listOfDishes.length).toBe(2);
      } catch (err) {
        fail(err);
      }
    });
  });

  describe("GET to /api/dishes/:id", () => {
    it("can grab a dish by id!", async () => {
      try {
        const [monica, rachel] = await Promise.all([
          Person.create(person3),
          Person.create(person4)
        ]);
        const [turkey, trifle] = await Promise.all([
          Dish.create({ ...dish3, personId: monica.id }),
          Dish.create({ ...dish4, personId: rachel.id })
        ]);

        const getDishes = await request(app)
          .get("/api/dishes/2")
          .expect("Content-Type", /json/)
          .expect(200);
        const getDishName = getDishes.body.name;
        expect(typeof getDishName).toEqual("string");
      } catch (err) {
        fail(err);
      }
    });
    it("should return a 400 if given an invalid id", async () => {
      try {
        const [monica, rachel] = await Promise.all([
          Person.create(person3),
          Person.create(person4)
        ]);
        const [turkey, trifle] = await Promise.all([
          Dish.create({ ...dish3, personId: monica.id }),
          Dish.create({ ...dish4, personId: rachel.id })
        ]);

        const getDishes = await request(app)
          .get("/api/dishes/20")
          .expect(400);

        const getDishesWrong = getDishes.text;
        expect(getDishesWrong).toBe("id not found");
      } catch (err) {
        fail(err);
      }
    });
  });

  describe("POST to /api/dishes/", () => {
    it("It posts dishes!!", async () => {
      try {
        const tofu = { name: "tofu", description: "just soy" };

        const postingTofu = await request(app)
          .post("/api/dishes")
          .send(tofu)
          .expect("Content-Type", /json/)
          .expect(200);

        const getPostedTofu = await request(app)
          .get("/api/dishes")
          .expect(200);
        const tofuList = getPostedTofu.body[0];
        expect(tofuList.name).toBe("tofu");
      } catch (err) {
        fail(err);
      }
    });
  });

  describe("PUT to /api/dishes/:id", () => {
    it("it updates dishes!", async () => {
      try {
        const tofu = { name: "tofu", description: "just soy" };
        const phoebe = { name: "Phoebe", isAttending: true };

        const postingTofu = await request(app)
          .post("/api/dishes")
          .send(tofu)
          .expect("Content-Type", /json/)
          .expect(200);
        const postingPerson = await request(app)
          .post("/api/people")
          .send(phoebe);

        const addingTofuToPhoebe = await request(app)
          .put("/api/dishes/1")
          .send({ personId: 1 })
          .expect("Content-Type", /json/)
          .expect(200);

        const addingTofuToPhoebeResponse = addingTofuToPhoebe.body;
        expect(addingTofuToPhoebeResponse[0].id).toBe(1);
      } catch (err) {
        fail(err);
      }
    });
  });

  describe("DELETE to /api/dishes/:id", () => {
    it("Deletes dishes!", async () => {
      try {
        const [joey, chandler] = await Promise.all([
          Person.create(person1),
          Person.create(person2)
        ]);
        const [mash, pie] = await Promise.all([
          Dish.create({ ...dish1, personId: joey.id }),
          Dish.create(dish2)
        ]);

        const deletingDish = await request(app)
          .delete("/api/dishes/1")
          .expect("Content-Type", /json/)
          .expect(200);

        const deletingDishResponse = deletingDish.body;

        expect(deletingDishResponse.length).toBe(1);

        expect;
      } catch (err) {
        fail(err);
      }
    });
  });
});
