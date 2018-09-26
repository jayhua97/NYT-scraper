// Students: Your work is in the front-end.
// Run this server file with node/nodemon, then open public/app.js.

// Get cracking and good luck!

// Dependencies
var express = require("express");
var request = require("request");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser")
var mongoose = require("mongoose")

// Require models
var db = require("./models")

// Initialize Express
var app = express();

// Set up Express to handle data parsing
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set up a static folder (public) for our web app
app.use(express.static("public"));
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/nyt", { useNewUrlParser: true });
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/nyt";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);


// Route to show all articles
app.get("/", function(req, res) {
    db.Article.find({}, function(error, data) {
      if (error) {
        console.log(error)
      } else {
        res.render("index", {
            article: data
        })
        console.log(data)
      }
    })
  })

app.get("/all", function(req, res) {
db.Article.find({}, function(error, data) {
    if (error) {
    console.log(error)
    } else {

    res.json(data)
    }
})
})

// Route to scrape articles
app.get("/scrape", function(req, res) {
    // Make a request for the news section of `ycombinator`
    request("http://www.nytimes.com", function(error, response, html) {
        // Load the html body from request into cheerio
        var $ = cheerio.load(html);
        // For each element with a "title" class
        $("article.css-180b3ld").each(function(i, element) {

            var result = {}
            // Save the text and href of each link enclosed in the current element
            result.link = "https://www.nytimes.com" + $(element).find("a").attr("href");
            // link += $(element).find("a").attr("href");
            // var title = $(element).find("h2").text();
            result.title = $(element).find("div.css-k8gosa").find("h2").text();
            result.summary = $(element).find("p").text();
            result.issaved = false;

            // If this found element had both a title and a link
            if (result.title && result.link && result.summary) {
                // Insert the data in the scrapedData db
                db.Article.create(result).then(function(dbArticle){
                    console.log(dbArticle)
                })
                .catch(function(err) {
                    return res.json(err)
                })
            }
        })
        res.redirect("/")
    });
})

// Route to delete all scraped articles
app.get("/empty", function(req, res) {
    db.Article.remove({}, function(error,data) {
        if (error) {
            console.log(error)
        } else {
            console.log(data)
        }
    })
    res.redirect("/")
})

// Route to find all saved articles
app.get("/saved", function(req, res) {
    db.Article.find({ issaved: true })
    .populate("notes")
    .then(function(dbArticle) {
        res.render("saved", {
            saved: dbArticle
        })
    })
    .catch(function(err) {
        res.json(err)
    })
})

// Route to grab an article and its notes
app.get("/saved/:id", function(req, res) {
    db.Article.findOne({ _id: req.params.id })
    .populate("notes")
    .then(function(dbArticle) {
        //render through here
        console.log(dbArticle)
        // res.json(dbArticle)
        res.render("saved", {
            saved: dbArticle
        })
    .catch(function(err) {
        res.json(err)
    })
    })
})

// Route to save an article
app.post("/save/:id", function(req, res) {
    db.Article.update (
        {
            _id: req.params.id
        },
        {
            $set: {issaved: true}
        },
        function(error, saved) {
            if (error) {
                console.log(error);
                res.send(error);
            }
            else {
                console.log(saved)
                res.send(saved);
            }
        }
    )
})

// Route to delete an article
app.post("/saved/delete/:id", function(req, res) {
    db.Article.update (
        {
            _id: req.params.id
        },
        {
            $set: {issaved: false}
        },
        function(error, removed) {
            if (error) {
                console.log(error);
                res.send(error);
            } else {
                console.log(removed);
                res.send(removed)
            }
        }
    )
})

// Route to create a note
app.post("/saved/:id", function(req, res) {
    db.Note.create(req.body)
    .then(function(dbNote) {
        console.log(dbNote)
        return db.Article.findOneAndUpdate({
            _id: req.params.id
        },
        {
            $push: { notes: dbNote }
        },
        {
            new: true
        })
    })
    .then(function(dbArticle) {
        res.json(dbArticle)
    })
    .catch(function(err) {
        res.json(err)
    })
})

// Route to delete a note
app.delete("/saved/:id", function(req, res) {
    db.Note.findOneAndRemove({
        _id: req.params.id
    })
    .then(function(dbArticle) {
        res.json(dbArticle)
    })
    .catch(function(err) {
        res.json(err)
    })
})
// Set the app to listen on port 3000
app.listen(MONGODB_URI, function() {
  console.log("App running on port 3000!");
});
