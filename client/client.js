
let eventCount=0;
let events ={};

// Took the idea from Alex Zaworski https://codepen.io/alexzaworski/pen/mEkvAG
const animations = () =>{
    var c = document.getElementById("c1");
    var hub = document.getElementById("hub");
    var eventBox = document.getElementById("eventBox");
    var count = document.querySelector("#eventCount");
var ctx = c.getContext("2d");
var cH;
var cW;
var bgColor = "#66d483";
hub.style.color = "#2980B9";
eventBox.style.color="#2980B9";
count.style.color="#2980B9";
var animations = [];
var circles = [];

var colorPicker = (function() {

  var colors = ["#66d483", "#2980B9","#FF4dd5", "#282741"];
  var index = 0;
  var hubIndex=1;
  function next() {
    index = index++ < colors.length-1 ? index : 0;
    hubIndex = hubIndex++<colors.length-1 ? hubIndex : 0;
    hub.style.color=colors[hubIndex];
    eventBox.style.color=colors[hubIndex];
    count.style.color=colors[hubIndex];
    return colors[index];
  }
  function current() {
    return colors[index]
  }
  return {
    next: next,
    current: current
  }
})();

function removeAnimation(animation) {
  var index = animations.indexOf(animation);
  if (index > -1) animations.splice(index, 1);
}

function calcPageFillRadius(x, y) {
  var l = Math.max(x - 0, cW - x);
  var h = Math.max(y - 0, cH - y);
  return Math.sqrt(Math.pow(l, 2) + Math.pow(h, 2));
}

function addClickListeners() {
  document.addEventListener("touchstart", handleEvent);
  document.addEventListener("mousedown", handleEvent);
};

function handleEvent(e) {
    if (e.touches) { 
      e.preventDefault();
      e = e.touches[0];
    }
    var currentColor = colorPicker.current();
    var nextColor = colorPicker.next();
    var targetR = calcPageFillRadius(e.pageX, e.pageY);
    var rippleSize = Math.min(200, (cW * .4));
    var minCoverDuration = 750;
    
    var pageFill = new Circle({
      x: e.pageX,
      y: e.pageY,
      r: 0,
      fill: nextColor
    });
    var fillAnimation = anime({
      targets: pageFill,
      r: targetR,
      duration:  Math.max(targetR / 2 , minCoverDuration ),
      easing: "easeOutQuart",
      complete: function(){
        bgColor = pageFill.fill;
        removeAnimation(fillAnimation);
      }
    });
    
    var ripple = new Circle({
      x: e.pageX,
      y: e.pageY,
      r: 0,
      fill: currentColor,
      stroke: {
        width: 3,
        color: currentColor
      },
      opacity: 1
    });
    var rippleAnimation = anime({
      targets: ripple,
      r: rippleSize,
      opacity: 0,
      easing: "easeOutExpo",
      duration: 900,
      complete: removeAnimation
    });
    
    var particles = [];
    for (var i=0; i<32; i++) {
      var particle = new Circle({
        x: e.pageX,
        y: e.pageY,
        fill: currentColor,
        r: anime.random(24, 48)
      })
      particles.push(particle);
    }
    var particlesAnimation = anime({
      targets: particles,
      x: function(particle){
        return particle.x + anime.random(rippleSize, -rippleSize);
      },
      y: function(particle){
        return particle.y + anime.random(rippleSize * 1.15, -rippleSize * 1.15);
      },
      r: 0,
      easing: "easeOutExpo",
      duration: anime.random(1000,1300),
      complete: removeAnimation
    });
    animations.push(fillAnimation, rippleAnimation, particlesAnimation);
}

function extend(a, b){
  for(var key in b) {
    if(b.hasOwnProperty(key)) {
      a[key] = b[key];
    }
  }
  return a;
}

var Circle = function(opts) {
  extend(this, opts);
}

Circle.prototype.draw = function() {
  ctx.globalAlpha = this.opacity || 1;
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
  if (this.stroke) {
    ctx.strokeStyle = this.stroke.color;
    ctx.lineWidth = this.stroke.width;
    ctx.stroke();
  }
  if (this.fill) {
    ctx.fillStyle = this.fill;
    ctx.fill();
  }
  ctx.closePath();
  ctx.globalAlpha = 1;
}

var animate = anime({
  duration: Infinity,
  update: function() {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, cW, cH);
    animations.forEach(function(anim) {
      anim.animatables.forEach(function(animatable) {
        animatable.target.draw();
      });
    });
  }
});

var resizeCanvas = function() {
  cW = window.innerWidth;
  cH = window.innerHeight;
  c.width = cW * devicePixelRatio;
  c.height = cH * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
};

(function init() {
  resizeCanvas();
  if (window.CP) {
    // CodePen's loop detection was causin' problems
    // and I have no idea why, so...
    window.CP.PenTimer.MAX_TIME_IN_LOOP_WO_EXIT = 6000; 
  }
  window.addEventListener("resize", resizeCanvas);
  addClickListeners();
  if (!!window.location.pathname.match(/fullcpgrid/)) {
    startFauxClicking();
  }
  handleInactiveUser();
})();

function handleInactiveUser() {
  var inactive = setTimeout(function(){
    fauxClick(cW/2, cH/2);
  }, 2000);
  
  function clearInactiveTimeout() {
    clearTimeout(inactive);
    document.removeEventListener("mousedown", clearInactiveTimeout);
    document.removeEventListener("touchstart", clearInactiveTimeout);
  }
  
  document.addEventListener("mousedown", clearInactiveTimeout);
  document.addEventListener("touchstart", clearInactiveTimeout);

 
}

function startFauxClicking() {
  setTimeout(function(){
    fauxClick(anime.random( cW * .2, cW * .8), anime.random(cH * .2, cH * .8));
    startFauxClicking();
  }, anime.random(200, 900));
}

function fauxClick(x, y) {
  var fauxClick = new Event("mousedown");
  fauxClick.pageX = x;
  fauxClick.pageY = y;
  document.dispatchEvent(fauxClick);
}
}

// parses the incoming json and updates the client side
const parseJSON = (xhr, update) => {
  const obj = JSON.parse(xhr.response);
  const count = document.getElementById("eventCount");
  events = obj.events;

  // deletes the list on client side and update it
  if(update)
  {
  let eventList = document.querySelector("#eventList");
  while(eventList.firstChild)
  {
    eventList.removeChild(eventList.firstChild);
    eventCount=0;
  }
 
// if events exist that means they need to be printed
  if(events)
  {
    Object.keys(events).forEach(key=>{
      let li = document.createElement('li')
      console.dir(key + "  " +events[key].eventName)
      li.textContent=key;
      eventCount++;
      eventList.append(li);
    });
  }  
  }

  // if eventCount is not 0, enable the sign up button because now events exists to add users to it
  if(eventCount!=0)
{
  document.querySelector("#userInputButton").disabled = false;
  document.querySelector("#userInputButton").value = "Sign me up!";
}

  count.textContent = `Count: ${eventCount}`;  
};

// Handles the resposes, parse means that it should be parsed or not and update means, 
// should the list be updated or not.
const handleResponse = (xhr,parse,update) => {
  //parse response 
  switch(xhr.status)
  {
    case 200: console.dir("Success");
    break;
    case 201: console.dir("Created")  
    break;
    case 204: console.dir("Already Exists") // since already exists, there's no need to update.
    // if  i update event with the same name, the users will get lost inside.
    return;
    case 400:console.dir("Bad Request");
    break;
    case 404:console.dir("Not Found");
    break;
    default: console.dir("not the normal codes");
  }

  if(parse){
    parseJSON(xhr, update);
  }
};

// Sends GET/HEAD Request
const sendGetHead = (e,form) =>{

  document.querySelector("#userInputButton").disabled = false;
  document.querySelector("#userInputButton").value = "Sign me up!";
  const incomingFormAction = form.getAttribute('action');
  const incomingFormMethod = form.getAttribute('method');

  const xhr = new XMLHttpRequest();
  xhr.open(incomingFormMethod,incomingFormAction);
  xhr.setRequestHeader ('Accept', 'application/json');
  if(incomingFormMethod === 'GET')
  {
    xhr.onload = () => handleResponse(xhr,true,true);
  }
  else if(incomingFormMethod ==="HEAD")
  {
    xhr.onload = () => handleResponse(xhr,false,false);
  }
  
  xhr.send();

  e.preventDefault();

  return false;
}

// sends post request
const sendPost = (e,incomingForm) =>{
  
  let incomingFormAction = incomingForm.getAttribute('action');
  let incomingFormMethod = incomingForm.getAttribute('method');

  const xhr = new XMLHttpRequest();
  let formData;
  if(incomingFormAction === '/addEvent')
  {
    const eventNameField = incomingForm.querySelector('#eventNameField');
    xhr.open(incomingFormMethod, incomingFormAction);
  
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader ('Accept', 'application/json');
    
    xhr.onload = () => handleResponse(xhr,true,true);
    
    formData = `eventName=${eventNameField.value}`;
  }

  // if the action is addUser then get information that form and send it.
  else if(incomingFormAction === '/addUser')
  {
    
    const userNameField = incomingForm.querySelector('#userNameField');
    const userEventNameField = incomingForm.querySelector('#userEventNameField');
    xhr.open(incomingFormMethod, incomingFormAction);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader ('Accept', 'application/json');
    
    xhr.onload = () => handleResponse(xhr,true,false);
    
    formData = `userName=${userNameField.value}&eventName=${userEventNameField.value}`;
  }

  xhr.send(formData);

  e.preventDefault();
  return false;
};

const init = () => {
  // starting animation
  animations();

  // loading the forms
  const eventForm = document.querySelector('#eventForm');
  const userForm = document.querySelector('#userForm');
  const eventList = document.querySelector('#eventListForm');

  // defining requests
  const addEvent = (e) => sendPost(e, eventForm);
  const addUser = (e) => sendPost(e,userForm);
  const getEvent = (e) => sendGetHead(e,eventList);

  // adding event handlers/listeners
  eventForm.addEventListener('submit',addEvent);
  userForm.addEventListener('submit',addUser);
  eventList.addEventListener('submit',getEvent)
 
};

window.onload = init;