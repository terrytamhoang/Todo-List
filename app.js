const mongoose = require("mongoose")
const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");



mongoose.set('strictQuery', false);
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin_tamut:test123@cluster0.umgodwu.mongodb.net/todolistDB");

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item",itemsSchema);  //Item in argument is collection name

const item1 = new Item({
  name:" Welcome to your todoList!"
});

const item2 = new Item({
  name:" Hit the + button to add a new item."
});

const item3 = new Item({
  name:"<-- Hit this to delete an item."
});

const defaultItems = [item1, item2,item3];

const listSchema = {
  name:String,
  items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems,function(error){
        if(error){console.log(error);}
        else{console.log("insert items success!");}
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("List", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  })
});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("Successfully removed");
        res.redirect("/");
      }
    });
  }

  else{
    List.findOneAndUpdate(
        {name: listName},
        {$pull:{items:{_id:checkedItemId}}},
        function(err,foundList){
          if(!err){
            res.redirect("/"+listName);
          }
        })
  }

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);

    })
  }
});






app.listen(3000, function() {
  console.log("Server started on port 3000");
});
