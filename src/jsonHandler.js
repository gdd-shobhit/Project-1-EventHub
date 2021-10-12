const events = {};
// will tell how many people are registered throughout the events
// const totalUsers = {};

const respondJSONMeta = (request, response, status) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end();
};

const respondJSON = (request, response, status, object) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(object));
  response.end();
};

const getEvent = (request, response) => {
  const responseJSON = {
    events,
  };

  respondJSON(request, response, 200, responseJSON);

  // return respondJSONMeta(request,response,200);
};

const addEvent = (request, response, body) => {
  const responseJSON = {
    message: 'Event Name is required',
  };

  if (!body.eventName) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 201;

  if (events[body.eventName]) {
    responseCode = 204;
  } else {
    // otherwise create an object with that name
    events[body.eventName] = {};
  }
  events[body.eventName].eventName = body.eventName;
  events[body.eventName].users = {};

  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    responseJSON.events = events;
    return respondJSON(request, response, responseCode, responseJSON);
  }
  return respondJSONMeta(request, response, responseCode);
};
// function to add a user from a POST body
const addUser = (request, response, body) => {
  const responseJSON = {
    message: 'Name and Event Name are both required',
  };

  if (!body.userName || !body.eventName) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let eventNameExists = false;
  Object.keys(events).forEach((key) => {
    if (key === body.eventName) {
      eventNameExists = true;
    }
  });
  if (!eventNameExists) {
    responseJSON.message = 'Event does not exist';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 201;
  if (events[body.eventName].users[body.userName]) {
    responseCode = 204;
  } else {
    events[body.eventName].users[body.userName] = {};
  }
  // add or update fields for this user name
  events[body.eventName].users[body.userName].name = body.userName;

  // if response is created, then set our created message
  // and sent response with a message
  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    responseJSON.events = events;
    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondJSONMeta(request, response, responseCode);
};

const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  return respondJSON(request, response, 404, responseJSON);
};

module.exports = {
  notFound,
  addEvent,
  addUser,
  getEvent,
};
