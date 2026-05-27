import express from "express";

const router = express.Router();

/* GET home page. */
router.get("/", (req, res) => {
  res.render("index", {
    title: "Markdown to PDF",
    github: "https://github.com/iqfareez/badge-mdtopdf",
  });
});

export default router;
