const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

app.set('trust proxy', 1);

app.use(session({
  secret: '1234',  
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'views')));

mongoose.connect('mongodb+srv://jidaar718:tRelmEXYu7NEcGFz@cluster0.j9n5kuh.mongodb.net/jabbas', { useNewUrlParser: true, useUnifiedTopology: true });


const QuestionSchema = new  mongoose.Schema({
  question: String,
  points: Number
});

const ScoreSchema = new  mongoose.Schema({
  userId: {
    type: Number,
    ref: 'User',
    required: true
  },
  score: Number
});

const Question = mongoose.model('Question', QuestionSchema);
const Score = mongoose.model('Score', ScoreSchema);
const UserSchema = new mongoose.Schema({
  _id: Number,
  username: String,
  password: String,
  role: String
});
const User = mongoose.model('User', UserSchema);

;




// Middleware to check if the user is logged in and is a manager
const isManager = (req, res, next) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.redirect('/user');
  }

  // Fetch the user from the database using findById() and exec()
  User.findById(userId).exec()
    .then(user => {
      if (!user || user.role !== 'manager') {
        return res.redirect('/user');
      }
      next();
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    });
};

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/login.html'));
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(`Received login request for username: ${username}`);

  const user = await User.findOne({ username });
  if (!user || user.password !== password) {
    console.log(`Login failed for username: ${username}`);
    return res.status(400).send('Invalid username or password');
  }

  // Store user's ID in session
  req.session.userId = user._id;  // Use _id instead of userId

  if (user.role === 'manager') {
    console.log(`Redirecting manager to /manager page`);
    return res.redirect('/manager');
  } else {
    console.log(`Redirecting user to /user page`);
    return res.redirect('/user');
  }
});

//Popularity
app.get('/popularity', isManager, (req, res) => {
  res.sendFile(path.join(__dirname, '/views/popularity.html'));
});

// Apply isManager middleware to the manager route
app.get('/manager', isManager, (req, res) => {
  res.sendFile(path.join(__dirname, '/views/manager.html'));
});

app.get('/user', function(req, res) {
  var userId = req.session.userId;

  User.findById(userId)
    .then(user => {
      if (user) {
        res.sendFile(path.join(__dirname, '/views/user.html'));
      } else {
        res.redirect('/login');
      }
    })
    .catch(err => {
      console.error(err);
      res.redirect('/login');
    });
});

app.get('/hrround', (req, res) => {
  res.sendFile(__dirname + '/views/hrround.html');
});

app.get('/codinground', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/codinground.html'));
});

app.get('/aptitude', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/aptitude.html'));
});
app.get('/viewanalysis', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/viewanalysis.html'));
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
