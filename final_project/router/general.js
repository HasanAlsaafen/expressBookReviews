const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

const isExisted = (user) => {
  return users.some(u => u.username === user);
};

// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
      if (!isExisted(username) && isValid(username)) {
          users.push({ "username": username, "password": password });
          return res.status(200).json({ message: "User successfully registered. Now you can login" });
      } else {
          return res.status(404).json({ message: "User already exists or the username is invalid!" });
      }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Fetch all books
public_users.get('/', async (req, res) => {
  try {
    const booksData = await new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          resolve(books);
        } catch (error) {
          reject(error);
        }
      }, 1000);
    });
    res.json(booksData);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const book = await new Promise((resolve, reject) => {
      setTimeout(() => {
        const foundBook = books[isbn];
        resolve(foundBook || null);
      }, 1000);
    });

    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

public_users.get('/author/:author', async (req, res) => {
  try {
    const author = req.params.author;
    const booksByAuthor = Object.values(books).filter(book => book.author === author);

    if (booksByAuthor.length > 0) {
      res.json(booksByAuthor);
    } else {
      res.status(404).json({ message: "No books found for this author" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

public_users.get('/title/:title', async (req, res) => {
  try {
    const author = req.params.title;

    const book = await new Promise((resolve, reject) => {
      setTimeout(() => {
        const booksByTitle = Object.values(books).filter(book => book.author === author);
        if (booksByTitle.length > 0) {
          resolve(booksByTitle);
        } else {
          reject(new Error("No books found with this title"));
        }
      }, 1000); 
    });

    res.json(book);

  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});


// Fetch book reviews by ISBN
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    res.json(book.reviews);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
