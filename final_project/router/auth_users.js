const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  if (!username || typeof username !== 'string') {
    return false;
  }
  if (username.length < 3) {
    return false;
  }
  const validUsername = /^[a-zA-Z0-9]+$/.test(username);
  return validUsername;
};

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ username }, 'access', { expiresIn: '1h' });

    req.session.authorization = {
      accessToken, username
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(401).json({ message: "Invalid Login. Check username and password" });
  }
});
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const book = books[isbn];
  const username = req.session.authorization.username; // Get the username from the session

  if (book) {
    if (review) {
      // Check if the review already exists and belongs to the current user
      book.reviews = book.reviews || [];
      const existingReviewIndex = book.reviews.findIndex(r => r.username === username);
      
      if (existingReviewIndex !== -1) {
        book.reviews[existingReviewIndex].review = review; // Update existing review
      } else {
        book.reviews.push({ username, review }); // Add new review
      }

      return res.status(200).json({ message: "Review added/updated successfully" });
    } else {
      return res.status(400).json({ message: "Review content is required" });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Delete a book review endpoint
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  const username = req.session.authorization.username; // Get the username from the session

  if (book) {
    // Find and filter out the review that belongs to the current user
    book.reviews = book.reviews.filter(review => review.username !== username);

    return res.status(200).json({ message: "Review deleted successfully" });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
