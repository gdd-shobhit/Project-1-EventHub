"use strict";

var handleResponse = function handleResponse(xhr) {};

var sendAjax = function sendAjax(url) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.setRequestHeader("Accept", 'Application/json');

  xhr.onload = function () {
    return handleResponse(xhr);
  };

  xhr.send();
};

var init = function init() {
  // add Event Listeners
  sendAjax('/');
};

window.onload = init;
