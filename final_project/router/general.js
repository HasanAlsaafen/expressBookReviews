const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const isExisted = (user) => {
  for (let i = 0; i < users.length; i++) {
      if (users[i].username === user) return true;
  }
  return false;
};

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
      if (!isExisted(username)) {
          users.push({"username": username, "password": password});
          return res.status(200).json({message: "User successfully registered. Now you can login"});
      } else {
          return res.status(404).json({message: "User already exists!"});
      }
  }
  return res.status(404).json({message: "Unable to register user."});
});

public_users.get('/', function (req, res) {
  res.json(books);
});

public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn; 
  const book = books[isbn]; 

  if (book) {
      res.json(book);
  } else {
      res.status(404).json({ message: "Book not found" });
  }
});

public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const booksByAuthor = Object.values(books).filter(book => book.author === author); // البحث عن الكتب بواسطة اسم المؤلف

  if (booksByAuthor.length > 0) {
      res.json(booksByAuthor);
  } else {
      res.status(404).json({ message: "No books found by this author" });
  }
});

public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const booksByTitle = Object.values(books).filter(book => book.title === title); // البحث عن الكتب بواسطة العنوان

  if (booksByTitle.length > 0) {
      res.json(booksByTitle);
  } else {
      res.status(404).json({ message: "No books found with this title" });
  }
});

public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
      res.json(book.reviews);
  } else {
      res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
