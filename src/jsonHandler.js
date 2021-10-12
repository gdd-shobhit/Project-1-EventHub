const events = {};

const respondJSONMeta = (request, response, status) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end();
};

const respondJSON = (request, response, status, object) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(object));
  response.end();
};

// Used to get Event information from server
const getEvent = (request, response) => {
  const responseJSON = {
    events,
  };

  if (request.method === 'HEAD') {
    return respondJSONMeta(request, response, 200);
  }

  return respondJSON(request, response, 200, responseJSON);
};

// Adds event to the server
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
    events[body.eventName] = {};
  }
  events[body.eventName].eventName = body.eventName;
  events[body.eventName].users = {};

  // sends events as json
  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    responseJSON.events = events;
    return respondJSON(request, response, responseCode, responseJSON);
  }
  // returns metaData so that if it is 204, dont send any information
  // we dont want to overwrite events with same name because they exist already
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

  // check if the eventName exist
  let eventNameExists = false;
  Object.keys(events).forEach((key) => {
    if (key === body.eventName) {
      eventNameExists = true;
    }
  });
  // if it doesnt exist then you cannot add yourself
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
  // add or update fields for this user name.
  // In this case its just the name so you cannot really do anything
  events[body.eventName].users[body.userName].name = body.userName;

  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    responseJSON.events = events;
    return respondJSON(request, response, responseCode, responseJSON);
  }

  // same reason as above, there is no reason to overwrite the events
  return respondJSONMeta(request, response, responseCode);
};

// random page not found
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
