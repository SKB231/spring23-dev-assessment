import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import UserModel from "./Models/User.model.js";
import AnimalModel from "./Models/Animal.model.js";
import TrainingModel from "./Models/Training.model.js";

dotenv.config();
const app = express();
const APP_PORT = process.env.APP_PORT;
app.use(cors({ origin: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const mongoDBuri = `mongodb+srv://skb231:${process.env.MPASS}@cluster0.p2bu5.mongodb.net/?retryWrites=true&w=majority`;

async function connect() {
  try {
    await mongoose.connect(mongoDBuri);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log(err);
  }
}

connect();

app.get("/", (req, res) => {
  res.json({ Hello: "World", Version: 2 });
});

app.get("/api/health", (req, res) => {
  res.json({ healthy: true });
});

app.post("/api/user", (req, res, next) => {
  if (req.body == null || req.body == undefined) {
    res.status(400).json("empty body.");
  }
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  var email = req.body.email;
  var password = req.body.password;

  if (
    firstName == undefined ||
    lastName == undefined ||
    email == undefined ||
    password == undefined
  ) {
    res.status(400).json("body vairable empty.");
  }

  const newUser = new UserModel({
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password,
  });
  newUser.save((err) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json(`User Saved. Their objectID is: ${newUser.id}`);
    }
  });
});

app.post("/api/animal", (req, res, next) => {
  if (req.body == null || req.body == undefined) {
    res.status(400).json("empty body.");
  }
  var name = req.body.name;
  var hoursTrained = req.body.hoursTrained;
  var owner = req.body.owner;
  var dateOfBirth = req.body.dateOfBirth;

  if (name == undefined || hoursTrained == undefined || owner == undefined) {
    console.log(`${name} ${hoursTrained} ${owner}`);
    res.status(400).json("body vairable empty.");
  }

  const newAnimal = new AnimalModel({
    name: name,
    hoursTrained: hoursTrained,
    owner: owner,
    dateOfBirth: dateOfBirth,
  });
  newAnimal.save((err) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json(`Animal Saved. Animal ObjectID: ${newAnimal.id}`);
    }
  });
});

app.post("/api/training", (req, res, next) => {
  if (req.body == null || req.body == undefined) {
    res.status(400).json("empty body.");
  }
  var date = req.body.date;
  var description = req.body.description;
  var hours = req.body.hours;
  var animal = req.body.animal;
  var user = req.body.user;

  if (
    date == undefined ||
    description == undefined ||
    hours == undefined ||
    animal == undefined ||
    user == undefined
  ) {
    res.status(400).json("body vairable empty.");
  }
  AnimalModel.findById(animal, (err, obj) => {
    if (obj == undefined) {
      res.status(400).json("Animal doesn't exist");
    }
    if (obj.owner != user) {
      res
        .status(400)
        .json("Training log's user and animal model's owner are not the same.");
    }
  });

  const newTraining = new TrainingModel({
    date: date,
    description: description,
    hours: hours,
    animal: animal,
    user: user,
  });

  newTraining.save((err) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json("Training Saved");
    }
  });
});

app.get("/api/admin/users", (req, res, next) => {
  UserModel.find((err, allUsers) => {
    if (err) {
      next(err);
    }
    var returnObject = [];
    for (var userObject in allUsers) {
      returnObject[userObject] = {
        firstName: allUsers[userObject].firstName,
        lastName: allUsers[userObject].lastName,
        email: allUsers[userObject].email,
      };
    }
    res.send(returnObject)
  });
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.send({
    status: error.status || 500,
    message: `${error.message} at ${error.lineNumber}`,
  });
});

app.listen(APP_PORT, () => {
  console.log(`api listening at http://localhost:${APP_PORT}`);
});
