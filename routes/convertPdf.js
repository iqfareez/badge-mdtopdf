var express = require('express');
var router = express.Router();
const stream = require('stream');
const {promisify} = require('util');
const fetch = require('node-fetch');
const {URLSearchParams} = require('url');
const url = require('url');

const pipeline = promisify(stream.pipeline);

/// handle GitHub link. If it is not raw link, convert it to raw link first

function githubLinkChecker(ghUrl)
{
    // just skip if it already github raw link
    if (ghUrl.includes('raw.githubusercontent.com')) return ghUrl;

    // skip if it is not github link
    if (!ghUrl.includes("github.com")) return ghUrl;

    // Parse the URL using the "url.parse" method
    const parsedUrl = url.parse(ghUrl, true);

    // Extract the username, repository name, branch name, and file path from the parsed URL
    const owner = parsedUrl.pathname.split("/")[1];
    const repo = parsedUrl.pathname.split("/")[2];
    const branch = parsedUrl.pathname.split("/")[3];
    const filePath = parsedUrl.pathname.slice(parsedUrl.pathname.indexOf(branch) + branch.length + 1);

    console.log(branch)
    console.log(filePath)

    return `https://raw.githubusercontent.com/${owner}/${repo}/${filePath}`;
}

/* Convert Markdown to PDF. */
router.get('/', async function (req, res, next) {
    // access query paramater (url) to get the raw markdown file
    const url = req.query.url;
    // const url = 'https://raw.githubusercontent.com/iqfareez/mcte4342-embedded-system-design/main/Week11/README.md';

    const fileUrl = githubLinkChecker(url);

    console.log(fileUrl)

    let mdResponse;

    try {
        if (!fileUrl) throw new Error('url is required');
        mdResponse = await fetch(fileUrl);
    } catch (error) {
        res.render('error', {message: 'Error: ' + error.message, error: error})
        return
    }

    // get the markdown filename and removes its extension if any
    const filenameWithExtension = url.substring(url.lastIndexOf('/') + 1);
    const filename = filenameWithExtension.split('.').slice(0, -1).join('.');

    console.log(filename)

    let encodedParams = new URLSearchParams();
    encodedParams.set('name', filename);
    encodedParams.set('unmd', await mdResponse.text());
    encodedParams.set('formatting', '');
    encodedParams.set('preview', 'false');

    let url_dillinger = 'https://dillinger.io/factory/fetch_pdf';

    let options_dillinger = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: encodedParams
    };

    let pdf = await fetch(url_dillinger, options_dillinger);
    let pdf_data = await pdf.body

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`);
    await pipeline(pdf_data, res);

});

module.exports = router;
