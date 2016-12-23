(function() {
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
  let hasScrolledSinceReset = false;

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
    const bodyClass = document.body.className.replace(' turbokeys-hidden', '');
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

  function reset() {
    hideHints();
    enableInputs();
    hintInput = [];
    active = false;
    hasScrolledSinceReset = false;
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

  function positionHintNode(hintNode, hintedNode) {
    const { left, top } = hintedNode.getBoundingClientRect();
    hintNode.style.top = top + 'px';
    hintNode.style.left = left + 'px';
  }

  function createHintForNode(node) {
    const hintText = generateUniqueHintText();
    node.dataset.turbokeysHintableId = hintText;

    const hintNode = document.createElement('span');
    hintNode.dataset.turbokeysHintId = hintText;
    hintNode.innerText = hintText;
    hintNode.className = 'turbokeys__hint';
    positionHintNode(hintNode, node);

    document.body.appendChild(hintNode);
  }

  function reCalcHintPositions() {
    const hintElemets = getHintElements();

    hintElemets.forEach(hintNode => {
      const hintedNode = document.querySelector(`[data-turbokeys-hintable-id="${hintNode.dataset.turbokeysHintId}"]`);
      if (hintedNode) positionHintNode(hintNode, hintedNode);
    })
  }

  function activate() {
    active = true;
    disableInputs();
    setupHints();
    if (hasScrolledSinceReset) reCalcHintPositions();
    showHints();
  }

  function handleTriggerKey() {
    if (active) {
      reset();
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

  function navigateToTarget() {
    const node = findByHintText();

    if (node) {
      enableInputs(true);
      node.click();
      reset();
    }
  }

  function handleHintInput(e) {
    hintInput.push(e.key)

    if (hintInput > maxHintLength) {
      reset();
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

  document.addEventListener('scroll', e => {
    if (!hasScrolledSinceReset) hasScrolledSinceReset = true;
    if (active) reset();
  });

  document.addEventListener('keydown', e => {
    if (e.key === triggerKey) return handleTriggerKey();
    if (e.key === resetKey) return reset();
    if (active) handleHintInput(e);
  })

  hideHints();
  setupHints();
})();
