const http = require('http'); //pull in http module
//url module for parsing url string
const url = require('url'); 
//querystring module for parsing querystrings from url
const query = require('querystring');
//pull in our custom files
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// const urlStruct = {
//   'GET': {
//     '/': htmlHandler.getIndex,
//     '/style.css': htmlHandler.getCSS,
//     '/getUsers': jsonHandler.getUsers,
//     '/updateUser': jsonHandler.updateUser,
//     notFound: jsonHandler.notFound,
//   },
//   'HEAD': {
//     '/getUsers': jsonHandler.getUsersMeta,
//     notFound: jsonHandler.getUsersMeta,
//   },
//   'POST':{
//     '/addUsers':handlePost
//   }
// };

//handle POST requests
const handlePost = (request, response, parsedUrl) => {
  //if post is to /addUser (our only POST url)
  if (parsedUrl.pathname === '/addUser') {
    const res = response;

    const body = [];

    //a bad request and send it back 
    request.on('error', (err) => {
      console.dir(err);
      res.statusCode = 400;
      res.end();
    });

    //on 'data' is for each byte of data that comes in
    //from the upload. We will add it to our byte array.
    request.on('data', (chunk) => {
      body.push(chunk); 
    });

    //on end of upload stream. 
    request.on('end', () => {
      //combine our byte array (using Buffer.concat)
      //and convert it to a string value (in this instance)
      const bodyString = Buffer.concat(body).toString();
      //since we are getting x-www-form-urlencoded data
      //the format will be the same as querystrings
      //Parse the string into an object by field name
      const bodyParams = query.parse(bodyString);

      //pass to our addUser function
      jsonHandler.addUser(request, res, bodyParams);
    });
  }
};

//handle GET requests
const handleGet = (request, response, parsedUrl) => {
  //route to correct method based on url
  if (parsedUrl.pathname === '/style.css') {
    htmlHandler.getCSS(request, response);
  } else if (parsedUrl.pathname === '/getUsers') {
    jsonHandler.getUsers(request, response);
  } else if (parsedUrl.pathname === '/notReal') {
    jsonHandler.getUsers(request, response);
  } else {
    htmlHandler.getIndex(request, response);
  }
};

const onRequest = (request, response) => {
  //parse url into individual parts
  //returns an object of url parts by name
  const parsedUrl = url.parse(request.url);

  //check if method was POST, otherwise assume GET 
  //for the sake of this example
  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  } else{
    handleGet(request, response, parsedUrl);
  }
};

http.createServer(onRequest).listen(port);