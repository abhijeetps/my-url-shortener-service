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

  
// your first API endpoint... 

app.post("/api/shorturl/new", (req, res) => {
  console.log(req.body.url)
  let original_url = req.body.url
  URL.find({"original_url": original_url}, (err, data) => {
    if(err) {
      URL.create()
    }
  })

})


app.get("/api/shorturl/:original_url", function (req, res) {
  let original_url = req.params.original_url
  let options = {all: true}
  dns.lookup(original_url, options, (err, addresses) => {
    if (err) {
      res.json({"error":"invalid URL"})
    } 
    else {
      res.json({"original_url": req.params.original_url, "short_url": ""});
    }
  })
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});