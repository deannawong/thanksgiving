const router = require("express").Router();
const { Dish, Person } = require("../../db");

// make sure to use router.get, router.post etc..., instead of app.get, app.post, or etc... in this file.
// see https://expressjs.com/en/api.html#router

router.get("/", (req, res, next) => {
  Dish.findAll()
    .then(dishes => res.status(200).send(dishes))
    .catch(e => res.status(400).send(e));
});

router.get("/:id", (req, res, next) => {
  const { id } = req.params;
  Dish.findOne({ where: { id: id } })
    .then(response => {
      if (response === null) {
        res.status(400).send("id not found");
      } else {
        res.status(200).send(response);
      }
    })
    .catch(e => res.status(400).send(e));
});

router.post("/", (req, res, next) => {
  Dish.create(req.body)
    .then(() => Dish.findAll())
    .then(dishes => res.status(200).send(dishes))
    .catch(e => res.status(400).send(e));
});

router.put("/:id", (req, res, next) => {
  const { id } = req.params;
  Dish.findOne({ where: { id: id } }).then(response => {
    if (response === null) {
      res.status(400).send("id not found");
    } else {
      Dish.update({ ...req.body }, { where: { id: id } })
        .then(() => Dish.findAll())
        .then(dishes => res.status(200).send(dishes))
        .catch(e => res.status(400).send(e));
    }
  });
});

router.delete("/:id", (req, res, next) => {
  const { id } = req.params;
  Dish.destroy({ where: { id: id } })
    .then(() => Dish.findAll())
    .then(dishes => res.status(200).send(dishes))
    .catch(e => res.status(400).send(e));
});

module.exports = router;
