(function() {
  const hintContainerId = 'turbokeys-hint-container';
  const navigable_selectors = ['a', 'button', 'input'];
  const triggerKey = 'Alt';
  const resetKey = 'Escape';
  const twoCharMaxPermutations = 676;
  const minHintLength = 2;
  const maxHintLength = 3;
  let hintLength = minHintLength;
  let hintInput = [];
  let active = false;
  let usedHints = [];
  let hintPermuations = 0;

  const isAJAXPending = (function() {
    const oldSend = XMLHttpRequest.prototype.send;
    let currentRequests = [];

    XMLHttpRequest.prototype.send = function() {
      currentRequests.push(this);
      oldSend.apply(this, arguments);

      this.addEventListener('readystatechange', function() {
        var idx;

        if (this.readyState === XMLHttpRequest.DONE) {
            idx = currentRequests.indexOf(this);
            if (idx > -1) {
                currentRequests.splice(idx, 1);
            }
        }
      }, false);
    };

    return function() {
      return currentRequests.length > 0;
    }
  }());

  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }

  function getHintContainer() {
    return document.getElementById(hintContainerId);
  }

  function getInputs() {
    return document.querySelectorAll('input');
  }

  function getHintedElements() {
    return document.querySelectorAll('[data-turbokeys-hintable-id]');
  }

  function getHintElements() {
    return document.querySelectorAll('[data-turbokeys-hint-id]');
  }

  function hideHints() {
    const bodyClass = document.body.className += ' turbokeys-hidden';
    document.body.className = bodyClass;
  }

  function showHints() {
    const bodyClass = document.body.className.replace(/\sturbokeys-hidden/g, '');
    document.body.className = bodyClass;
  }

  function enableInputs(readOnly=false) {
    const nodes = getInputs();
    nodes.forEach(node => {
      if (!readOnly) node.removeAttribute('readonly');
      node.removeAttribute('disabled');
    });
  }

  function disableInputs() {
    const nodes = getInputs();
    nodes.forEach(node => {
      node.setAttribute('disabled', 'disabled');
      node.setAttribute('readonly', 'readonly');
    });
  }

  function generateRandomHintText(length=hintLength) {
    const possibleChars = 'abcdefghijklmnopqrstuvwxyz';
    const hintChars = [];

    for (let i = 0; i < length; i++) {
      const char = possibleChars.charAt(Math.floor(Math.random() * possibleChars.length))
      hintChars.push(char);
    }

    hintPermuations++

    return hintChars.join('');
  }

  function generateUniqueHintText() {
    const hint = generateRandomHintText();

    if (usedHints.includes(hint) || usedHints.includes(hint.substr(0, 2))) {
      if (hintPermuations > twoCharMaxPermutations) {
        hintLength = maxHintLength;
        return generateUniqueHintText();
      } else {
        return generateUniqueHintText();
      }
    } else {
      usedHints.push(hint);
      return hint;
    }
  }

  function createHintForNode(node) {
    const hintText = generateUniqueHintText();
    node.dataset.turbokeysHintableId = hintText;

    const hintNode = document.createElement('span');
    hintNode.dataset.turbokeysHintId = hintText;
    hintNode.innerText = hintText;
    hintNode.className = 'turbokeys__hint';

    const hintContainer = getHintContainer();
    hintContainer.appendChild(hintNode);
  }

  function positionHintNode(hintNode, hintedNode) {
    const { left, top } = hintedNode.getBoundingClientRect();
    hintNode.style.top = top + 'px';
    hintNode.style.left = left + 'px';
  }

  function positionHintNodes() {
    const hintElemets = getHintElements();

    hintElemets.forEach(hintNode => {
      const hintedNode = document.querySelector(`[data-turbokeys-hintable-id="${hintNode.dataset.turbokeysHintId}"]`);
      if (hintedNode) positionHintNode(hintNode, hintedNode);
    })
  }

  function reset() {
    const hinted = getHintedElements();
    const hintContainer = getHintContainer();

    deactivate();
    hintLength = minHintLength;
    usedHints = [];
    hintPermuations = 0;

    hinted.forEach(node => node.removeAttribute('data-turbokeys-hintable-id'));
    hintContainer.innerHTML = '';
  }

  function deactivate() {
    hideHints();
    enableInputs();
    hintInput = [];
    active = false;
  }

  function activate() {
    active = true;
    disableInputs();
    showHints();
  }

  function handleTriggerKey() {
    if (active) {
      deactivate();
    } else {
      activate();
    }
  }

  function findByHintText() {
    const hintText = hintInput.join('');
    const hinted = getHintedElements();

    for (let i = 0; i < hinted.length; i++) {
      if (hinted[i].dataset.turbokeysHintableId.toLowerCase() === hintText) {
        return hinted[i];
      }
    }
  }

  function postNavigate() {
    setTimeout(() => {
      if (isAJAXPending()) {
        postNavigate();
      } else {
        reset();
        setUp();
      }
    }, 500)
  }

  function navigateToTarget() {
    const node = findByHintText();

    if (node) {
      enableInputs(true);
      node.click();
      postNavigate();
    }

    deactivate();
  }

  function handleHintInput(e) {
    hintInput.push(e.key)

    if (hintInput > maxHintLength) {
      deactivate();
    } else if (hintInput.length >= minHintLength) {
      navigateToTarget();
    }
  }

  function setupHints() {
    const targetNodes = document.querySelectorAll(navigable_selectors);

    targetNodes.forEach(node => {
      if (!node.dataset.turbokeysHintableId) createHintForNode(node);
    });
  }

  function setUp() {
    hideHints();
    setupHints();
    positionHintNodes();
  }

  function createHintContainer() {
    const hintContainer = document.createElement('div');
    hintContainer.id = hintContainerId;
    document.body.appendChild(hintContainer);
  }

  const postScroll = debounce(setUp, 100)

  document.addEventListener('scroll', e => {
    if (active) deactivate();
    if (!active) postScroll();
  });

  document.addEventListener('keydown', e => {
    if (e.key === triggerKey) return handleTriggerKey();
    if (e.key === resetKey) deactivate();
    if (active) handleHintInput(e);
  })

  createHintContainer();
  setUp();
})();
