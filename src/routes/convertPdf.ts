import express from "express";
import mdToPdf from "md-to-pdf";

const router = express.Router();

// Handle GitHub link. If it is not a raw link, convert it to a raw link first.
function githubLinkChecker(ghUrl: string): string {
  // Skip if it is already a github raw link.
  if (ghUrl.includes("raw.githubusercontent.com")) return ghUrl;

  // Skip if it is not a github link.
  if (!ghUrl.includes("github.com")) return ghUrl;

  const parsedUrl = new URL(ghUrl);
  const segments = parsedUrl.pathname.split("/").filter(Boolean);

  if (segments.length < 5 || segments[2] !== "blob") {
    return ghUrl;
  }

  const owner = segments[0];
  const repo = segments[1];
  const branch = segments[3];
  const filePath = segments.slice(4).join("/");

  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
}

/* Convert Markdown to PDF. */
router.get("/", async (req, res) => {
  const urlParam = req.query.url;

  if (typeof urlParam !== "string" || !urlParam) {
    res.render("error", { message: "Error: url is required", error: {} });
    return;
  }

  const fileUrl = githubLinkChecker(urlParam);

  let mdResponse;

  try {
    mdResponse = await fetch(fileUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.render("error", { message: "Error: " + message, error });
    return;
  }

  const filenameWithExtension = urlParam.substring(
    urlParam.lastIndexOf("/") + 1,
  );
  const filename =
    filenameWithExtension.split(".").slice(0, -1).join(".") || "document";

  const mdContent = await mdResponse.text();

  let pdf;
  try {
    pdf = await mdToPdf({ content: mdContent });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.render("error", { message: "Error: " + message, error });
    return;
  }

  if (!pdf?.content) {
    res.render("error", {
      message: "Error: Failed to convert Markdown to PDF",
    });
    return;
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}.pdf`);
  res.setHeader("Content-Length", String(Buffer.byteLength(pdf.content)));
  res.end(pdf.content);
});

export default router;
