import express from 'express';
import cors from 'cors'; // Importing cors

const app = express();

// Use cors middleware
app.use(cors());

app.use(express.json());

let books = [
  { id: 1, title: 'Harry Potter and the Philosopher\'s Stone', author: 'J.K. Rowling' },
  { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee' },
  { id: 3, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' },
  { id: 3, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' },
  { id: 3, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' },
  { id: 3, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' },
  
];
let books2 = [
  { id: 1, title: 'Harry Potter and the Philosopher\'s Stone', author: 'J.K. Rowling' },
  { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee' },


];

let users = [
  { username: 'user1', password: 'password1' },
  { username: 'user2', password: 'password2' },
];

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // Find user matching the username and password
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    // Successful login
    res.json({ message: 'Login successful', user: user });
    
  } else {
    // Failed login
    res.status(401).json({ message: 'Invalid username or password' });
  }
});



app.get('/api/books', (req, res) => {
  res.json(books);
});


app.get('/api/books2', (req, res) => {
  res.json(books2);
});


app.listen(3001, () => {
  console.log(`Server is running on port 5173`);
});
