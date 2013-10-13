var http = require('http'),
    database = {};

module.exports = http.createServer(function (req, res) {
// handle urls:
// PUT :db/
//    create a document, or return 412 if conflict
// GET :db/:doc
//    return a document, or return 404 if absent
// GET :db/_all_docs?include_docs=true
//    return all documents
});