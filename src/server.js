const http = require('http'); 
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlHandler.js');
const jsonHandler = require('./jsonHandler.js');
const port = process.env.PORT || process.env.NODE_PORT || 3000;


const urlStruct = {
  '/': htmlHandler.getIndex,
  '/style.css':htmlHandler.getCSS,
  '/bundle.js': htmlHandler.getBundle,
  '/addEvent':jsonHandler.addEvent,
  '/success': jsonHandler.success,
  '/badRequest': jsonHandler.badRequest,
  notFound: jsonHandler.notFound,
};

const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);
  const params = query.parse(parsedUrl.query);

  if (urlStruct[parsedUrl.pathname]) {
    urlStruct[parsedUrl.pathname](request, response, params);
  } else {
    urlStruct.notFound(request, response, params);
  }
};

http.createServer(onRequest).listen(port);
