const router = require("express").Router();
const { Person, Dish } = require("../../db");

// make sure to use router.get, router.post etc..., instead of app.get, app.post, or etc... in this file.
// see https://expressjs.com/en/api.html#routers

router.get("/", (req, res, next) => {
  const { is_attending, include_dishes } = req.query;

  if (is_attending) {
    Person.findAll({ where: { isAttending: is_attending } })
      .then(attendees => res.status(200).send(attendees))
      .catch(e => res.status(400).send(e));
  } else if (include_dishes) {
    Person.findAll({ include: [Dish] })
      .then(attendees => res.status(200).send(attendees))
      .catch(e => res.status(400).send(e));
  } else {
    Person.findAll()
      .then(people => res.status(200).send(people))
      .catch(e => res.status(400).send(e));
  }
});

router.post("/", (req, res, next) => {
  Person.create(req.body)
    .then(() => Person.findAll({ where: { name: req.body.name } }))
    .then(people => res.status(200).send(people))
    .catch(e => res.status(400).send(e));
});

router.put("/:id", (req, res, next) => {
  const { id } = req.params;

  Person.findOne({ where: { id: id } }).then(response => {
    if (response === null) {
      res.status(400).send("id not found");
    } else {
      Person.update({ ...req.body }, { where: { id: id } })
        .then(() => Person.findAll())
        .then(people => res.status(200).send(people))
        .catch(e => res.status(400).send(e));
    }
  });
});

router.delete("/:id", (req, res, next) => {
  const { id } = req.params;
  Person.findOne({ where: { id: id } }).then(response => {
    if (response === null) {
      res.status(400).send("id not found");
    } else {
      Person.destroy({ where: { id: id } })
        .then(() => Person.findAll())
        .then(people => res.status(200).send(people))
        .catch(e => res.status(400).send(e));
    }
  });
});
module.exports = router;
