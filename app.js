//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")
const e = require("express");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
// mongoose.connect("mongodb://localhost:27017/todolistDB");
mongoose.connect("mongodb+srv://prem:test@cluster0.s2xod.mongodb.net/todolistDB");


// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

// const itemSchema = new mongoose.Schema({
//   name : string
// })

const itemSchema = {
  name: String
}

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your TodoList"
});
const item2 = new Item({
  name: "Hit + button to add todolist"
});
const item3 = new Item({
  name: "<-- hit this to delete todolist task"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema)

app.get("/", function (req, res) {

  // const day = date.getDate();

  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("successfully added")
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }

  })



});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  })

  if (listName === "Today") {
    item.save();

    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();

      res.redirect("/" + listName);
    })
  }




  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", function (req, res) {
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.remove({ _id: checkedItem }, function (err) {
      if (err) {
        console.log(err)
      } else {
        console.log("Deleted")
        res.redirect("/")
      }
    })
  }else{
    List.findOneAndUpdate({name:listName},{ $pull : {items : {_id:checkedItem}}},function(err,foundList){
      if(!err){
      
        res.redirect("/"+listName)
      }
    })
  }



})

app.get("/:topic", function (req, res) {
  const customList = _.capitalize( req.params.topic);
  List.findOne({ name: customList }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        //  console.log("doesn't exists !!");
        const list = new List({
          name: customList,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customList)
      } else {
        //  console.log("Exsists !!!!");

        res.render("list", { listTitle: foundList.name, newListItems: foundList.items })
      }
    }
  })






})

// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "Work List", newListItems: workItems });
// });

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});
