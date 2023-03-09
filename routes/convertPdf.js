var express = require('express');
var router = express.Router();
const stream = require('stream');
const {promisify} = require('util');
const fetch = require('node-fetch');
const {URLSearchParams} = require('url');

const pipeline = promisify(stream.pipeline);

/* Convert Markdown to PDF. */
router.get('/', async function (req, res, next) {
    // access query paramater (url) to get the raw markdown file
    const url = req.query.url;
    // const url = 'https://raw.githubusercontent.com/iqfareez/mcte4342-embedded-system-design/main/Week11/README.md';

    let mdResponse;

    try {
        if (!url) throw new Error('url is required');
        mdResponse = await fetch(url);
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
