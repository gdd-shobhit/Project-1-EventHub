let eventCount=0;
const animations = () =>{
    var c = document.getElementById("c1");
    var hub = document.getElementById("hub");
    var eventBox = document.getElementById("eventBox");
var ctx = c.getContext("2d");
var cH;
var cW;
var bgColor = "#66d483";
hub.style.color = "#2980B9";
eventBox.style.color="#2980B9";
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

const parseJSON = (xhr, content) => {
  const obj = JSON.parse(xhr.response);
  console.dir(obj);

  if(obj.events) {
    eventCount++;
    console.dir(obj.events);
    // const p = document.createElement('p');
    // p.id=obj.events[0].eventName;
    // p.textContent = `Event: ${obj.events.eventName}`;
    // content.appendChild(p);
  }
};

const handleResponse = (xhr,parse) => {
  const content = document.querySelector('#content');
  //parse response 
  switch(xhr.status)
  {
    case 201:var li = document.createElement('li');
    li.textContent = eventNameField.value;
    document.querySelector("#eventList").append(li);
    break;
    case 204: console.dir("already exists");
    return;
    default: console.dir("default");
  }

  if(parse){
    parseJSON(xhr, content);
  }
};

const sendGet = (xhr,url) =>{

  xhr.open("GET",url);
  xhr.setRequestHeader ('Accept', 'application/json');
  xhr.onload = () => handleResponse(xhr,true);
}

const sendPost = (e,incomingForm) =>{
  
  const incomingFormAction = incomingForm.getAttribute('action');
  const incomingFormMethod = incomingForm.getAttribute('method');

  const xhr = new XMLHttpRequest();
  let formData;
  if(incomingFormAction === '/addEvent')
  {
    const eventNameField = incomingForm.querySelector('#eventNameField');
    xhr.open(incomingFormMethod, incomingFormAction);
  
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader ('Accept', 'application/json');
    
    xhr.onload = () => handleResponse(xhr,true);
    
    formData = `eventName=${eventNameField.value}`;
  }
  else if(incomingFormAction === '/addUser')
  {
    // will get events list and then check if the user typed the right event or not
    // and then only he can enter that event
    const events = sendGet(xhr,'/getEvent');
    const eventNameField = incomingForm.querySelector('#eventNameField');
    xhr.open(incomingFormMethod, incomingFormAction);
  
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader ('Accept', 'application/json');
    
    xhr.onload = () => handleResponse(xhr,true);
    
    formData = `userName=${eventNameField.value}&eventName=${ageField.value}`;
  }

  xhr.send(formData);

  e.preventDefault();
  return false;
};

const init = () => {
  // starting animation
  animations();
  // Button will Add event as a card, Right now its just on the backend
  const eventForm = document.querySelector('#eventForm');
  // const userForm = document.querySelector('#userForm');

  const addEvent = (e) => sendPost(e, eventForm);
  // const addUser = (e) => sendPost(e,userForm);

  eventForm.addEventListener('submit',addEvent);
  // userForm.addEventListener('submit',addUser);
};

window.onload = init;