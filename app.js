const express = require('express')
const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))
app.set('view engine', 'ejs');
app.use(express.json())

const port = 3000
const LocalStrategy = require('passport-local').Strategy;
var session = require('express-session')
var passport = require('passport')
var passportLocalMongoose = require('passport-local-mongoose')


const mongoose = require('mongoose');

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  // cookie: { secure: false }
}))

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect(
  `mongodb://127.0.0.1:27017/calorie`, 
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});
// mongoose.connect('mongodb+srv://swe363:swe363@cluster0.vzavf7e.mongodb.net/?retryWrites=true&w=majority');

//item data base

const foodshema= new mongoose.Schema({
  date: Date, 
  name: String, 
  Calorie: Number, 
  meal:String,
  user:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  });
const Food = mongoose.model('Food',foodshema );

// user data base 
const dayshema= new mongoose.Schema({
  date: Date, 
  CalorieOftheDay:Number , 
  user:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  foods:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Food' }]  });

const Day = mongoose.model('Day',dayshema );

const userSchema= new mongoose.Schema({ username: String ,role:String, password:String, avg: { type: Number, default: 0 }, lastweek:String,thisweek:String,  foods:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Food' }]}); //items:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }]
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model('User',userSchema );
passport.use(User.createStrategy());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




//          routing
app.get('/', async (req, res) => { 
//   const found=await Item.find({})
  // console.log( found);
    res.render('index');  
  })

  app.get('/aregister', async (req, res) => { 
    res.render('admainLog');  
})
app.get('/uregister', async (req, res) => { 
    res.render('userLog');  
})

  app.post('/register/:role', async (req, res) => { 
        
    const username=req.body.username;
    const role=req.params.role;
    const password=req.body.password;
    User.register({username: username,role:role }, password, function(err, user) {
      if (err) { 
        res.redirect('/register')
       } 
       req.login(user, function(err) {
        if (err) {
          console.log(err);
          res.redirect('/uregister');
        } else {
          // console.log('User has been logged in after registration');
         
          res.redirect('/checkrole');
        }


         });
      
    });

  })
  app.post('/login', passport.authenticate('local', {
    successRedirect: '/checkrole',
    failureRedirect: '/uregister',
  }));

  app.get('/userview', async (req, res) => { 

    res.render("userView", {Userid:req.user.id})
});

app.get('/adminview', async (req, res) => { 
  if(req.user.role==="a"){
    const AllFood = await Food.find({});
    const AllUser = await User.find({role:"u"});
    AllUser.forEach(async user => {
      const DAYS_IN_WEEK = 7;
      const dateRangeStart = new Date();
      dateRangeStart.setDate(dateRangeStart.getDate() - DAYS_IN_WEEK);
    
      var thisweek= await  Food.countDocuments({
        user: user._id,
        date: { $gte: dateRangeStart }
      })


      const endDate = new Date();
      endDate.setDate(endDate.getDate() - DAYS_IN_WEEK);
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - DAYS_IN_WEEK);
    
      var lastweek= await Food.countDocuments({
        user: user._id,
        date: { $gte: startDate, $lt: endDate }
      })
      user.thisweek=thisweek;
      user.lastweek=lastweek;

      // console.log(thisweek)
      // console.log(lastweek)

      await user.save()


    })




// console.log(AllUser)
setTimeout(() => {
  res.render("adminView", {AllFood:AllFood,AllUser:AllUser})
}, 1000);

  }
  else{
    res.redirect("/userview")

  }
  
});

app.get('/checkrole', async (req, res) => { 
    if(req.user.role==="a"){
      res.redirect("/adminView")      }
      else{
        res.redirect("/userview")

      }
});

// entries api 

app.post('/addEntries/:id', async (req, res) => { 
  const id=req.user.id;
  const food = new Food({
    name: req.body.name,
    Calorie: Number(req.body.Calorie),
    meal:req.body.meal,
    date:req.body.date,
    user:id,
  });
  await food.save()
  const foundUser = await User.findOne({ _id: id}); 
  const foundDay = await Day.findOne({
    $and: [
      { date: req.body.date },
      { user: id }
    ]
  });
  
  if (foundDay) {
    // day exists
    foundDay.foods.push(food);
    foundDay.CalorieOftheDay=foundDay.CalorieOftheDay+Number(req.body.Calorie);
    await foundDay.save()
  } else {
    // day does not exist
    var fods=[]
    fods.push(food);
    const day = new Day({
      CalorieOftheDay: Number(req.body.Calorie),
      user:id,
      date:req.body.date,
      foods:fods
    });
    await day.save()
  }
  foundUser.foods.push(food);
  foundUser.avg=foundUser.avg+((Number(req.body.Calorie)-foundUser.avg)/foundUser.foods.length)
  await foundUser.save()

})

app.delete('/deleteFood/:id', async (req, res) => { 
  const id=req.params.id;
  const foundFood = await Food.deleteOne({_id: id });
  console.log(foundFood)
  res.redirect("/adminview")
})
app.get('/api/foodEntries', async (req, res) => { 
  const id=req.user.id;
  const AllFood = await Food.find({user: id });
  AllFood.sort((a, b) => a.date - b.date)
  console.log(AllFood)

  res.json(AllFood)
});

app.get('/api/getDayCalories/:date', async (req, res) => { 
  const id=req.user.id;
  // const id="645bb2badc2b2b4f03eeed20";
  const date=req.params.date+"T00:00:00.000+00:00";
  const foundDay = await Day.findOne({
    $and: [
      { date: date },
      { user: id }
    ]
  });  
  if (foundDay) {
    // console.log(foundDay.CalorieOftheDay)
    res.json(foundDay)
  }
  else{
    res.json("null")
  }
});

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })

 

