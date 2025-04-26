const Genre = require("../models/genre");
const asyncHandler = require("express-async-handler");
const Book = require("../models/book");
const { body, validationResult } = require("express-validator");

// Display list of all Genre.
exports.genre_list = asyncHandler(async (req, res, next) => {
  const allGenre = await Genre.find().sort({name: 1 }).exec();
  res.json({
    genre_list: allGenre,
  });
});

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async (req, res, next) => {
  // Get details of genre and all associated books (in parallel)
  const [genre, booksInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, "title summary").exec(),
  ]);
  if (genre === null) {
    // No results.
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  res.json({
    genre: genre,
    genre_books: booksInGenre,
  });
});

// Handle Genre create on POST.
exports.genre_create = [
  body("name", "Genre name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
        genre: genre,
      });
      return;
    } else {
      const genreExists = await Genre.findOne({ name: req.body.name }).exec();
      if (genreExists) {
        res.status(200).json({
          message: "Genre already exists",
          genre: genreExists,
        });
      } else {
        await genre.save();
        res.status(201).json({
          message: "Genre created successfully",
          genre: genre,
        });
      }
    }
  }),
];

// Handle Genre update on POST.
exports.genre_update = [
  body("name", "Genre name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const genre = {
      name: req.body.name,
    };

    if (!errors.isEmpty()) {
      res.status(400).json({
        errors: errors.array(),
      });
      return;
    }

    const updatedGenre = await Genre.findByIdAndUpdate(req.params.id, genre, {
      new: true,
    });

    if (!updatedGenre) {
      res.status(404).json({ status: 404, message: "Genre not found" });
      return;
    }

    res.json({
      message: "Genre updated successfully",
      genre: updatedGenre,
    });
  }),
];

// Handle Genre delete on POST.
exports.genre_delete = asyncHandler(async (req, res, next) => {
  const genreId = req.params.id;

  const [genre, booksInGenre] = await Promise.all([
    Genre.findById(genreId).exec(),
    Book.find({ genre: genreId }).exec(),
  ]);

  if (!genre) {
    res.status(404).json({ status: 404, message: "Genre not found" });
    return;
  }

  if (booksInGenre.length > 0) {
    res.status(400).json({
      message: "Cannot delete genre with associated books",
      genre: genre,
      genre_books: booksInGenre,
    });
    return;
  }

  await Genre.findByIdAndDelete(genreId);
  res.json({ message: "Genre deleted successfully" });
});

// Display Genre create form on GET.
exports.genre_create_form = asyncHandler(async (req, res, next) => {
  const allGenres = await Genre.find().sort({ name: 1 }).exec();

  res.json({ genre_list: allGenres });
});