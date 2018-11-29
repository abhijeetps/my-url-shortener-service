'use strict';

const express = require('express');
const mongo = require('mongodb');
const mongoose = require('mongoose');

const bodyParser = require("body-parser");


const dns = require('dns')
const cors = require('cors');

const app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// Basic Configuration 
const port = process.env.PORT || 3000;
const randomstring = require('randomstring')

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGOLAB_URI, {
  useMongoClient: true
});

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

const urlSchema = mongoose.Schema({
  "original_url": String,
  "short_url": String
})

let URL = mongoose.model('URL', urlSchema)


app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post("/api/shorturl/new", (req, res) => {
  let original_url = req.body.url
  let options = {all: true}
  console.log(original_url)
  dns.lookup(original_url, options, (err, addresses) => {
    console.log('In dns lookup')
    if (err) {
      console.log('In dns lookup - error occured')
      res.json({"error":"invalid URL"})
    } 
    else {
      console.log('In dns lookup - successful')
      URL.findOne({"original_url": original_url}, (err, data) => {
        console.log("In URL.find")
        console.log(err)
        console.log(data)
        if(err) {
          console.log("In URL.find - URL not found ")
          let short_url = randomstring.generate(5)
          URL.create({"original_url": original_url, "short_url": short_url}, (err, done) => {
            console.log('In URL.create')
            if (err) {
              console.log('In URL.create - URL.create failed')
              console.log(err)
            }
            else {
              console.log('In URL.create - URL creation successful')
              res.json({"original_url": original_url, "short_url": process.env.PROJECT_URL + '/api/shorturl/' + short_url})
            }
          })
        }
        else {
          console.log('In URL.find - short_url already exists.')
          console.log(data)
        }
      })
    }
  })
})


app.get("/api/shorturl/:short_url", function (req, res) {
  let short_url = req.params.short_url
  URL.find({"short_url": short_url}, (err, data) => {
    if (err) {
      console.log('Page does not exist')
    }
    else {
      console.log(data.original_url)
    }
  })
  
  
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});