const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser"), config = require('./config');
const { MongoClient } = require("mongodb");
var mongoose = require("mongoose"),
  RegisteredUser = require("./models/register.model");
var jwt = require('jsonwebtoken');

const url =
  "mongodb+srv://goToShop:12345678sh@gotoapp.uznvm0v.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(
  url,
  { useUnifiedTopology: true },
  { useNewUrlParser: true },
  { connectTimeoutMS: 30000 },
  { keepAlive: 1 }
);
const dbName = "GoToShop";

const app = express();

const PORT = process.env.PORT || 8084;

var corsOption = {
  origin: "http://localhost:4200",
};

async function connectToMongoDB(){
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log("DB connected successfully!")
  
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

app.use(cors(corsOption));
app.use(bodyParser.json());

app.get("/", (req, res) => res.send("Hello World!"));

app.post("/register", async (req, res) => {
  await client.connect();
  console.log("Connected correctly to server in post request");
  const db = client.db(dbName);
  const col = db.collection("registeredPeople");
  const { email } = req.body;

  try {
    let user = await col.findOne({ email });

    if (user) {
      return res.status(404).json({ message: "User already exists" });
    } else {
      newUser = new RegisteredUser({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
      });
      user = {
        username: newUser.username,
        email: newUser.email,
        password: newUser.password
      }
      console.log("user details: ", user, "-------->------");

      await col.insertOne(user);
      return res
        .status(200)
        .json({ message: "User registered successfully" });
    }
  } catch (err) {
    console.log("Inside catch", err);
    return res
        .status(500)
        .json({ message: "Something went wrong, try again" });
  } finally {
    await client.close();
  }
});

app.post("/login", async(req, res) => {
  try{
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection("registeredPeople");
    const {email, password} = req.body;
    let authenticatedUser = await col.findOne({ email });
    if(authenticatedUser){
      console.log(authenticatedUser);
      if(email === authenticatedUser.email && password === authenticatedUser.password){
        var token = jwt.sign({id: authenticatedUser._id }, config.secret, { expiresIn: 7200 })
        res.status(200).json({ message: "User logged in successfully!", accessToken: token, username: authenticatedUser.username, email: authenticatedUser.token });
      } else {
        res.status(400).json({ message: "Invalid credentials" });
      }
    } else{
      res.status(400).json({ message: "No such user exists, please register"});
    }
  } catch (err) {
    res.status(500).json({ message: "Something went wrong, try again" });
  } finally {
    await client.close();
  }
})

app.listen(PORT, () => {
  console.log(`App is running at ${PORT}`);
  connectToMongoDB();
});
