var typingIndex = 0;

var scrollActions = {};

const timeSetting = 15;
const randomSetting = 20;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isVisible(el) {
  var rect = el.getBoundingClientRect();
  var elemTop = rect.top;
  var elemBottom = rect.bottom;

  var isVisible = elemTop >= 0 && elemBottom <= window.innerHeight * 0.9;
  return isVisible;
}

function initTypewriter() {
  for (const tw of Array.prototype.slice.call(document.querySelectorAll('.typewriter'))) {
    tw.setAttribute('value', tw.innerText);
    tw.innerHTML = '';
  }
}

function initScroll() {
  scrollActions = [
    {
      elements: Array.prototype.slice.call(document.querySelectorAll('.typewriter')),
      action: function (el) {
        return type('', el, 15, 100);
      },
    },
    {
      elements: Array.prototype.slice.call(document.querySelectorAll('.progress-bar')),
      action: async function (el) {
        return progress(el);
      },
    },
  ];

  window.onscroll = async function () {
    for (const scrollAction of scrollActions) {
      for (const el of scrollAction.elements) {
        if (isVisible(el)) {
          scrollAction.elements.shift();
          await scrollAction.action(el);
          // console.log('action executed')
        }
      }
    }
  };
}

function type(input, target, time, random) {
  return new Promise(async (resolve, reject) => {
    input = input ? input : target.getAttribute('value') || target.innerText;
    target.innerText = '';

    for (let w of input.split('')) {
      if (w == '<') {
        if (target.value != undefined) target.value = target.value.slice(0, -1);
        if (target.innerHTML != undefined) target.innerHTML = target.innerHTML.slice(0, -1);
      } else {
        if (target.value != undefined) target.value += w;
        if (target.innerHTML != undefined) target.innerHTML += w;
      }
      await sleep(time + Math.random() * random);
    }

    resolve();
  });
}

function progress(el, time = 3000) {
  return new Promise(async (resolve, reject) => {
    let progressMax = await Number(el.getAttribute('value'));
    let progressStatus = await el.querySelector('.progress-status');
    let progressCounter = await el.querySelector('.progress-counter');

    let progressInterval = Math.ceil(time / progressMax);

    progressStatus.style.transition = `width ${time / 1000}s`;
    progressStatus.style.width = `${progressMax}%`;

    for (let i = 0; i <= progressMax; i++) {
      progressCounter.innerText = `${i}%`;
      await sleep(progressInterval);
    }

    resolve();
  });
}

window.onload = async function () {
  initTypewriter();
  initScroll();

  // Initialize the Terminal object
  var term = new Terminal('#terminal', '.terminal-cmdline', '#terminal output');
  term.init();

  // Enter the 'whoami' command on the terminal
  await type('whoami', document.querySelector('.terminal-cmdline'), 15, 100);
  let e = new Event('keydown');
  e.keyCode = 13;
  document.querySelector('.terminal-cmdline').dispatchEvent(e);

  // let ctx = document.querySelector('#skills-chart')
  // var myRadarChart = new Chart(ctx, {
  //     type: 'radar',
  //     data: {
  //         labels: ['Javascript', 'jQuery', 'NodeJS', 'VueJS'],
  //         datasets: [{
  //             borderColor: 'rgb(255, 255, 255)',
  //             backgroundColor: 'rgb(255, 255, 255)',
  //             data: [20, 20, 20, 20]
  //         }]
  //     },
  //     options: {
  //         scale: {
  //             angleLines: {
  //                 display: false
  //             },
  //             ticks: {
  //                 suggestedMin: 50,
  //                 suggestedMax: 20
  //             }
  //         }
  //     }
  // });
};
