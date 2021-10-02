const anime = require('animejs');

var updates = 0;


const boxRotate = () =>{
    anime({
        targets: '.box',
        translateX: 270,
        delay: 1000,
        direction: 'alternate',
        loop: 3,
        easing: 'easeInOutCirc',
        update: function(anim) {
          updates++;
          progressLogEl.value = 'progress : '+Math.round(anim.progress)+'%';
        }
      });
}

module.exports.boxRotate = boxRotate;