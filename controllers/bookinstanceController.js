const BookInstance = require("../models/bookinstance");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const Book = require("../models/book");

// Display list of all BookInstances.
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  const allBookInstances = await BookInstance.find().populate("book").exec();

  res.json({
    bookinstance_list: allBookInstances,
  });
});

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id)
    .populate("book")
    .exec();

  if (bookInstance === null) {
    // No results.
    const err = new Error("Book copy not found");
    err.status = 404;
    return next(err);
  }

  res.json({
    bookinstance: bookInstance,
  });
});

// Handle BookInstance create on POST.
exports.bookinstance_create = [
  // Validate and sanitize fields.
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid date")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
  
  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      // There are errors.
      // Return errors with the list of all books and selected book in JSON format.
      const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();

      return res.json({
        book_list: allBooks,
        selected_book: bookInstance._id,
        errors: errors.array(),
        bookinstance: bookInstance,
      });
    } else {
      // Data from form is valid
      await bookInstance.save();

      // Return success message and the created book instance in JSON format
      return res.json({
        message: "Book instance created successfully",
        bookinstance: bookInstance,
      });
    }
  }),
];

// Handle BookInstance update on POST.
exports.bookinstance_update = [
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid date")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const updatedData = {
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    };

    if (!errors.isEmpty()) {
      const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();
      res.status(400).json({
        book_list: allBooks,
        errors: errors.array(),
        bookinstance: updatedData,
      });
      return;
    } else {
      const updatedBookInstance = await BookInstance.findByIdAndUpdate(
        req.params.id,
        updatedData,
        { new: true }
      );

      if (!updatedBookInstance) {
        return res
          .status(404)
          .json({ status: 404, message: "BookInstance not found" });
      }

      res.json({
        message: "Book instance updated successfully",
        bookinstance: updatedBookInstance,
      });
    }
  }),
];

// Handle BookInstance delete on POST.
exports.bookinstance_delete = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findByIdAndDelete(req.params.id);

  if (!bookInstance) {
    return res
      .status(404)
      .json({ status: 404, message: "BookInstance not found" });
  }

  res.json({ message: "BookInstance deleted successfully" });
});


// Display BookInstance create form on GET.
exports.bookinstance_create_form = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();

  res.json({
    book_list: allBooks,
  });
});