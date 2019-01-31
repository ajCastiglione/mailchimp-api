// NPM Modules
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const _ = require("lodash");
const https = require("https");
const fs = require("fs");

const key = fs.readFileSync("ssl/key.key", "utf8");
const cert = fs.readFileSync("ssl/certificate.crt", "utf8");
// const key = fs.readFileSync("key.pem", "utf8");
// const cert = fs.readFileSync("certificate.pem", "utf8");

const credentials = { key, cert };
const app = express();
const port = 8443;

app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, x-auth, Content-Type, Post-Type"
  );
  next();
});

app.get("/", (req, res) => {
  res.send({
    default: "This is your home page"
  });
});

app.post("/add-email", (req, res) => {
  let { email } = _.pick(req.body, ["email"]);

  // validate form submission
  if (!email) {
    res.status(404).send({ err: "Missing required fields." });
    return;
  }

  // Fields grabbed from docs: https://developer.mailchimp.com/documentation/mailchimp/reference/lists/#create-post_lists_list_id
  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed"
      }
    ]
  };

  const postData = JSON.stringify(data);

  // POST to mailchimp endpoint options
  const options = {
    url: "https://us19.api.mailchimp.com/3.0/lists/0fdb8544d2",
    method: "POST",
    headers: {
      Authorization: "auth 5ec5f3e3b6325f774c61f27d7d572ee3-us19"
    },
    body: postData
  };

  request(options, (err, response, body) => {
    if (err) {
      res.status(404).send({ msg: "Failure adding email, please try again." });
    } else {
      if (response.statusCode === 200) {
        let resBody = JSON.parse(body);
        let msg;
        resBody.errors.length > 0 ? (msg = resBody.errors[0].error) : null;
        msg
          ? res.send({ msg, status: "failure" })
          : res.status(404).send({ msg: "Added email successfully!" });
      } else {
        res.status(404).send({ msg: "Failure: Unable to add email to list." });
      }
    }
  });
});

// app.listen(port, () => console.log("Server is running on port " + port));
let secure = https.createServer(credentials, app);
secure.listen(port, () => console.log(`Secure server running on ${port}`));
