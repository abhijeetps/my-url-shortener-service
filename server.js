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
  console.log('In POST method')
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
        if(err) {
          console.log("In URL.find - Error occured " + err)
        }
        else {
          console.log('In URL.find - Success')
          if(data == null) {
            let short_url = randomstring.generate(5)
            URL.create({"original_url": original_url, "short_url": short_url}, (err, done) => {
              console.log('In URL.create')
              if (err) {
                console.log('In URL.create - URL.create failed' + err)
              }
              else {
                console.log('In URL.create - URL creation successful')
                res.json({"original_url": original_url, "short_url": process.env.PROJECT_URL + 'api/shorturl/' + short_url})
              }
            })
          }
          else {
            console.log('URL already exists.')
            res.json({"original_url": data.original_url, "short_url": process.env.PROJECT_URL + 'api/shorturl/' + data.short_url})
          }
        }
      })
    }
  })
})


app.get("/api/shorturl/:short_url", function (req, res) {
  console.log('In GET method')
  let short_url = req.params.short_url
  URL.findOne({"short_url": short_url}, (err, data) => {
    if (err) {
      console.log('Page does not exist')
    }
    else {
      console.log(data.original_url)
      let httpString = 'http://'
      if (data.original_url.includes('http://') || data.original_url.includes('https://'))
        httpString = ''
      res.redirect(httpString + data.original_url)
    }
  })
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});