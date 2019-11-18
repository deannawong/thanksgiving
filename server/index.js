const { app } = require("./app");
const PORT = 3000;
const { db, Person, Dish } = require("../db");

const person1 = { name: "mark", isAttending: true };
const person2 = { name: "russell", isAttending: false };
const person3 = { name: "ryan", isAttending: true };

async function syncAndSeedDatabase() {
  try {
    await db.sync({ force: true });
    await Promise.all([
      Person.create(person1),
      Person.create(person2),
      Person.create(person3)
    ]);
  } catch (e) {
    console.log(e);
  }

  console.log("done seeding and associating!");
}

syncAndSeedDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
  });
});
