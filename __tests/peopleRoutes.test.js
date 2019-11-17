// tests for api/people

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
describe("/api/people routes", () => {
  const person1 = { name: "mark", isAttending: true };
  const person2 = { name: "russell", isAttending: false };
  const person3 = { name: "ryan", isAttending: true };

  const dish1 = { name: "turkey", description: "delicious briney turkey" };
  const dish2 = { name: "pie", description: "delicious pumpkiney pie" };
  describe("GET to /api/people", () => {
    // example test using vanilla promise syntax (no async/await)
    it("should retrieve all people if no params are given", () => {
      // we will seed the db before every test so that we can isolate each test as much as possible
      // NOTE: we are not testing the database itself, just that our api endpoints are giving back the correct data

      // we need to return promises contained inside of jest test blocks
      // in order for jest to know we are dealing with an async test case.
      // if we dont return the promise jest will pass this test block since it will think the there are no assertions.
      return Promise.all([Person.create(person1), Person.create(person2)]).then(
        () => {
          // we wrap our server (app) in request(supertest) so that we can mock it
          // api calls are always async so we need to return them so that jest knows we are dealing with a promise
          return request(app) // have to return this promise as well
            .get("/api/people")
            .expect("Content-Type", /json/) // you can make assertions about the response using supertest's built in methods
            .expect(200) // you should always be sending status codes when sending a response from your server
            .then(response => {
              // once the promise is fulfilled we have access to the entire response
              const people = response.body;
              expect(people.length).toBe(2);
              expect(people).toEqual(
                expect.arrayContaining([
                  expect.objectContaining(person1),
                  expect.objectContaining(person2)
                ])
              );
            })
            .catch(err => {
              fail(err);
            });
        }
      );
    });
    // using async/await
    it("should filter users using the is_attending query string", async () => {
      try {
        // seed the db
        await Promise.all([
          Person.create(person1),
          Person.create(person2),
          Person.create(person3)
        ]);

        // grab the response
        const isAttendingResponse = await request(app).get(
          "/api/people/?is_attending=true"
        );

        // test our assertions
        expect(isAttendingResponse.statusCode).toBe(200);
        expect(isAttendingResponse.headers["content-type"]).toEqual(
          expect.stringContaining("json")
        );

        const attendingPeople = isAttendingResponse.body;
        expect(attendingPeople.length).toBe(2);
        expect(attendingPeople).toEqual(
          expect.arrayContaining([
            expect.objectContaining(person1),
            expect.objectContaining(person3)
          ])
        );

        const isNotAttendingResponse = await request(app)
          .get("/api/people/?is_attending=false")
          .expect("Content-Type", /json/) // you can still chain the built in supertest methods if you want when using async/await
          .expect(200);

        const notAttendingPeople = isNotAttendingResponse.body;
        expect(notAttendingPeople).toEqual([expect.objectContaining(person2)]);
      } catch (err) {
        fail(err);
      }
    });

    it("should return users and their Dishes using `include_dishes=true` query string", async () => {
      try {
        const [mark, russell, ryan] = await Promise.all([
          Person.create(person1),
          Person.create(person2),
          Person.create(person3)
        ]);

        const [turk, pie] = await Promise.all([
          Dish.create({ ...dish1, personId: mark.id }),
          Dish.create({ ...dish2, personId: ryan.id })
        ]);

        const includeDishesResponse = await request(app)
          .get("/api/people/?include_dishes=true")
          .expect("Content-Type", /json/)
          .expect(200);

        const peopleIncludingDishes = includeDishesResponse.body;

        expect(Array.isArray(peopleIncludingDishes[0].dishes)).toEqual(true);
      } catch (err) {
        fail(err);
      }
    });
  });
  describe("POST to /api/people", () => {
    it("should create a new person and return that persons information if all the required information is given", async () => {
      // HINT: You will be sending data then checking response. No pre-seeding required
      // Make sure you test both the API response and whats inside the database anytime you create, update, or delete from the database

      try {
        const eliot = { name: "eliot", isAttending: true };

        const postingEliot = await request(app)
          .post("/api/people")
          .send(eliot)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200);

        expect(postingEliot.text.includes("eliot")).toBe(true);
      } catch (err) {
        fail(err);
      }
    });
    it("should return status code 400 if missing required information", async () => {
      try {
        const profMaybeAttending = { name: "prof" };

        const postingProf = await request(app)
          .post("/api/people")
          .send(profMaybeAttending)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(400);
      } catch (err) {
        fail(err);
      }
    });
  });

  describe("PUT to /api/people/:id", () => {
    it("should update a persons information", async () => {
      try {
        const eliot = { name: "eliot", isAttending: true };

        const postingEliot = await request(app)
          .post("/api/people")
          .send(eliot);

        const updatingEliot = await request(app)
          .put("/api/people/1")
          .send({ isAttending: false })
          .expect("Content-Type", /json/)
          .expect(200);
        const updatingEliotResponse = updatingEliot.body[0];
        expect(updatingEliotResponse.isAttending).toBe(false);
      } catch (err) {
        fail(err);
      }
    });
    it("should return a 400 if given an invalid id", async () => {
      try {
        const eliot = { name: "eliot", isAttending: true };

        const postingEliot = await request(app)
          .post("/api/people")
          .send(eliot);

        const updatingEliot = await request(app)
          .put("/api/people/10")
          .send({ isAttending: false })
          .expect(400);

        const badUpdate = updatingEliot.text;
        expect(badUpdate).toBe("id not found");
      } catch (err) {
        fail(err);
      }
    });
  });

  describe("DELETE to /api/people/:id", () => {
    it("should remove a person from the database", async () => {
      try {
        const [mark, russell, ryan] = await Promise.all([
          Person.create(person1),
          Person.create(person2),
          Person.create(person3)
        ]);

        const removingPerson1 = await request(app)
          .delete("/api/people/1")
          .expect("Content-Type", /json/)
          .expect(200);

        const removingPerson1Response = removingPerson1.body;
        expect(removingPerson1Response.length).toBe(2);
      } catch (err) {
        fail(err);
      }
    });
    it("should return a 400 if given an invalid id", async () => {
      try {
        const [mark, russell, ryan] = await Promise.all([
          Person.create(person1),
          Person.create(person2),
          Person.create(person3)
        ]);

        const removingPersonTen = await request(app)
          .delete("/api/people/10")
          .expect(400);

        const badDelete = removingPersonTen.text;
        expect(badDelete).toBe("id not found");
      } catch (err) {
        fail(err);
      }
    });
  });
});
