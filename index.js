import express from "express";
import bodyParser from "body-parser";
import pg from "pg"

const app = express();
const port = 3000;
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "BookNotes",
  password: "cbai0896",
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentBookId = 1

let books = [
  { id : 1, book_name : "The Diary of a Young Girl", isbn : 9780553296983,
    comment : "The book is a profound, powerful, and poignant autobiographical work. It chronicles the two years Anne Frank spent hiding from the Nazis during World War II.",
    user_id : 1 },
];

async function getBook(){
  const result = await db.query("SELECT * FROM books");

  books = result.rows;

  return books
}

app.get("/", async (req, res) => {
  const books = await getBook();

  res.render("index.ejs", {
    bookNotes : "BookNotes",
    listBooks : books,
  })
});

app.post("/add", async (req, res) => {
  if (req.body.add === "newBook"){
    res.render("newBook.ejs");

  } else {
    currentBookId = req.body.listBooks;
    res.redirect("/")
  }
});
app.post("/newbook", async (req, res) => {
  const name = req.body.newBookName
  const isbn = req.body.newBookISBN
  const note = req.body.newBookNote
  const result = await db.query(
      "INSERT INTO books(book_name, isbn, comment) VALUES($1,$2,$3) RETURNING *",
      [name, isbn, note]
  )
  const id = result.rows[0].id;
  currentBookId = id;

  res.redirect("/")

});

app.post("/edit", async (req, res) => {
  const id = req.body.updatedBookId;
  const book = req.body.updatedBookNote;

  try {
    await db.query("UPDATE books SET comment = $1 WHERE id = $2", [book , id]);
    res.redirect("/");

  } catch (err) {
    console.log(err);

  }
});

app.post("/delete", async (req, res) => {
  const id = req.body.deleteBookId;

  try {
    await db.query("DELETE FROM books WHERE id = $1", [id]);
    res.redirect("/")

  } catch (err) {
    console.log(err);

  }

});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});