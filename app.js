import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import UserModel from "./Models/User.model.js";
import AnimalModel from "./Models/Animal.model.js";
import TrainingModel from "./Models/Training.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fileUpload from "express-fileupload";
import fileModel from "./Models/File.model.js";
dotenv.config();
const app = express();
const APP_PORT = process.env.APP_PORT;
app.use(cors({ origin: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(fileUpload());
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

app.get("/api/health", authenticate, (req, res) => {
  res.json({ healthy: true });
});

app.post("/api/user/login", (req, res, next) => {
  if (req.body == null || req.body == undefined) {
    res.status(400).json("empty body.");
  }
  var email = req.body.email;
  var password = req.body.password;

  UserModel.find({ email: email }, (err, obj) => {
    if (err) {
      next(err);
    }
    if (!obj) {
      res.status(403).json("Email/Password provided is incorrect");
    }
    var originalHashPassword = obj[0].password;
    bcrypt.compare(password, originalHashPassword, (err, result) => {
      if (err) {
        next(err);
      }
      if (result == false) {
        res.status(403).json("Email/Password provided is incorrect");
      }
      const jwtUser = {
        firstName: obj[0].firstName,
        obj_id: obj[0].id,
      };
      const accessToken = jwt.sign(jwtUser, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "5m",
      });
      res.json({ accessToken });
    });
  });
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

  const saltRounds = 10;

  bcrypt.hash(password, saltRounds, function (err, hash) {
    if (err) {
      next(err);
    }
    const newUser = new UserModel({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hash,
    });
    newUser.save((err) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json(`User Saved. Their objectID is: ${newUser.id}`);
      }
    });
  });
});

app.post("/api/animal", authenticate, (req, res, next) => {
  if (req.body == null || req.body == undefined) {
    res.status(400).json("empty body.");
  }
  var name = req.body.name;
  var hoursTrained = req.body.hoursTrained;
  var owner = req.user.obj_id;
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

app.post("/api/training", authenticate, (req, res, next) => {
  if (req.body == null || req.body == undefined) {
    res.status(400).json("empty body.");
  }
  var date = req.body.date;
  var description = req.body.description;
  var hours = req.body.hours;
  var animal = req.body.animal;
  var user = req.user.obj_id;

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

app.get("/api/admin/users", authenticate, (req, res, next) => {
  UserModel.find((err, allUsers) => {
    if (err) {
      next(err);
    }

    var page = req.query.page;
    var limit = req.query.limit;
    var returnObject = [];

    var totalRecords = allUsers.length;
    var nextPage = `http://localhost:${APP_PORT}/api/admin/users?page=${
      page + 1
    }`;
    var prevPage = `http://localhost:${APP_PORT}/api/admin/users?page=${
      page - 1
    }`;
    if (page - 1 < 0 || page == undefined) {
      prevPage = null;
    }
    if (page + 1 <= 0 || page == undefined) {
      nextPage = null;
    }
    if (allUsers.length <= limit) {
      nextPage = null;
    }

    if (!page || !limit) {
      page = Math.max(0, page);
      limit = 100;
      allUsers = allUsers.splice(0, limit);
    } else {
      page = Math.max(0, page);
      limit = Math.max(0, limit);
      limit = Math.min(limit, 100);
      startIndex = (page - 1) * limit;
      endIndex = page * limit;
      allUsers = allUsers.splice(startIndex, endIndex);
    }
    for (var userObject in allUsers) {
      returnObject[userObject] = {
        firstName: allUsers[userObject].firstName,
        lastName: allUsers[userObject].lastName,
        email: allUsers[userObject].email,
      };
    }
    if (!page) {
      page = 1;
    }
    var returnObjectUsers = returnObject;
    let returnResponse = {
      data: returnObjectUsers,
      meta: {
        total_records: totalRecords,
        current_page: page,
        per_page: limit,
        next_page: nextPage,
        prev_page: prevPage,
      },
    };
    res.send(returnResponse);
  });
});

app.get("/api/admin/animals", authenticate, (req, res, next) => {
  AnimalModel.find((err, allUsers) => {
    if (err) {
      next(err);
    }

    var page = req.query.page;
    var limit = req.query.limit;
    var returnObject = [];

    var totalRecords = allUsers.length;
    var nextPage = `http://localhost:${APP_PORT}/api/admin/users?page=${
      page + 1
    }`;
    var prevPage = `http://localhost:${APP_PORT}/api/admin/users?page=${
      page - 1
    }`;
    if (page - 1 < 0 || page == undefined) {
      prevPage = null;
    }
    if (page + 1 <= 0 || page == undefined) {
      nextPage = null;
    }
    if (allUsers.length <= limit) {
      nextPage = null;
    }

    if (!page || !limit) {
      page = Math.max(0, page);
      limit = 100;
      allUsers = allUsers.splice(0, limit);
    } else {
      page = Math.max(0, page);
      limit = Math.max(0, limit);
      limit = Math.min(limit, 100);
      startIndex = (page - 1) * limit;
      endIndex = page * limit;
      allUsers = allUsers.splice(startIndex, endIndex);
    }
    for (var userObject in allUsers) {
      returnObject[userObject] = {
        name: allUsers[userObject].name,
        hoursTrained: allUsers[userObject].hoursTrained,
        dateOfBirth: allUsers[userObject].dateOfBirth,
        owner: allUsers[userObject].owner,
      };
    }
    if (!page) {
      page = 1;
    }
    var returnObjectUsers = returnObject;
    let returnResponse = {
      data: returnObjectUsers,
      meta: {
        total_records: totalRecords,
        current_page: page,
        per_page: limit,
        next_page: nextPage,
        prev_page: prevPage,
      },
    };
    res.send(returnResponse);
  });
});

app.get("/api/admin/training", authenticate, (req, res, next) => {
  TrainingModel.find((err, allUsers) => {
    if (err) {
      next(err);
    }

    var page = req.query.page;
    var limit = req.query.limit;
    var returnObject = [];

    var totalRecords = allUsers.length;
    var nextPage = `http://localhost:${APP_PORT}/api/admin/users?page=${
      page + 1
    }`;
    var prevPage = `http://localhost:${APP_PORT}/api/admin/users?page=${
      page - 1
    }`;
    if (page - 1 < 0 || page == undefined) {
      prevPage = null;
    }
    if (page + 1 <= 0 || page == undefined) {
      nextPage = null;
    }
    if (allUsers.length <= limit) {
      nextPage = null;
    }

    if (!page || !limit) {
      page = Math.max(0, page);
      limit = 100;
      allUsers = allUsers.splice(0, limit);
    } else {
      page = Math.max(0, page);
      limit = Math.max(0, limit);
      limit = Math.min(limit, 100);
      startIndex = (page - 1) * limit;
      endIndex = page * limit;
      allUsers = allUsers.splice(startIndex, endIndex);
    }
    for (var userObject in allUsers) {
      returnObject[userObject] = {
        date: allUsers[userObject].date,
        description: allUsers[userObject].description,
        hours: allUsers[userObject].hours,
        animal: allUsers[userObject].animal,
        user: allUsers[userObject].user,
      };
    }
    if (!page) {
      page = 1;
    }
    var returnObjectUsers = returnObject;
    let returnResponse = {
      data: returnObjectUsers,
      meta: {
        total_records: totalRecords,
        current_page: page,
        per_page: limit,
        next_page: nextPage,
        prev_page: prevPage,
      },
    };
    res.send(returnResponse);
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

app.post("/api/user/verify", authenticate, (req, res, next) => {
  res.status(200).json("Verification done");
});

app.post("/api/file/upload", (req, res, next) => {
  let sampleFile;
  let uploadPath;
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  let type = req.body.fileType;
  let contextId = req.body.contextId;
  let reqFile = req.files.myfile;
  console.log(req.files);
  const newFile = new fileModel({
    data: reqFile.data,
    name: reqFile.name,
    mimetype: reqFile.mimetype,
  });
  if (type == "animalImage") {
    newFile.save((err, savedFile) => {
      if (err) {
        next(err);
      }
      AnimalModel.updateOne(
        { _id: contextId },
        { $set: { profilePicture: savedFile.id } },
        (err) => {
          if (err) {
            next(err);
          }
          res.status(200).json("Profile Picture Updated.");
        }
      );
    });
  } else if (type == "userImage") {
    newFile.save((err, savedFile) => {
      if (err) {
        next(err);
      }
      UserModel.updateOne(
        { _id: contextId },
        { $set: { profilePicture: savedFile.id } },
        (err) => {
          if (err) {
            next(err);
          }
          res.status(200).json("Profile Picture Updated.");
        }
      );
    });
  } else {
    //trainingLogVideo
    newFile.save((err, savedFile) => {
      if (err) {
        next(err);
      }
      TrainingModel.updateOne(
        { _id: contextId },
        { $set: { trainingLogVideo: savedFile.id } },
        (err) => {
          if (err) {
            next(err);
          }
          res.status(200).json("Profile Picture Updated.");
        }
      );
    });
  }
});

function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(403);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    req.user = user;
    next();
  });
}
