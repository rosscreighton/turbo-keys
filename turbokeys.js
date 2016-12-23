(function() {
  const navigable_selectors = ['a', 'button', 'input'];
  const triggerKey = 'Alt';
  const resetKey = 'Escape';
  const maxPermutations = 676;
  let hintInput = [];
  let active = false;
  let usedHints = [];
  let hintPermuations = 0;

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
    const bodyClass = document.body.className.slice().replace('turbokeys-hidden', '');
    document.body.className = bodyClass;
  }

  function enableInputs() {
    const nodes = getInputs();
    nodes.forEach(node => node.removeAttribute('readonly'));
  }

  function disableInputs() {
    const nodes = getInputs();
    nodes.forEach(node => {
      node.setAttribute('readonly','readonly');
      node.blur();
    });
  }

  function reset() {
    hideHints();
    enableInputs();
    active = false;
  }

  function generateRandomHintText() {
    const possibleChars = 'abcdefghijklmnopqrstuvwxyz';
    const hintChars = [];

    for (let i = 0; i < 2; i++) {
      const char = possibleChars.charAt(Math.floor(Math.random() * possibleChars.length))
      hintChars.push(char);
    }

    hintPermuations++

    return hintChars.join('');
  }

  function generateUniqueHintText() {
    const hint = generateRandomHintText();

    if (usedHints.includes(hint)) {
      if (hintPermuations > maxPermutations) {
        return false;
      } else {
        return generateUniqueHintText();
      }
    } else {
      usedHints.push(hint);
      return hint;
    }
  }

  function setHintPosition(hintNode, hintedNode) {
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
    setHintPosition(hintNode, node);

    document.body.appendChild(hintNode);
  }

  function reCalcHintPositions() {
    const hintElemets = getHintElements();

    hintElemets.forEach(hintNode => {
      const hintedNode = document.querySelector(`[data-turbokeys-hintable-id="${hintNode.dataset.turbokeysHintId}"]`);

      if (hintedNode) { // this is terrible, but not all hint elements have an acutal id bc there aren't enough permutations of the hint text
        setHintPosition(hintNode, hintedNode);
      }
    })
  }

  function activate() {
    active = true;
    disableInputs();
    setupHints();
    reCalcHintPositions();
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
    const hints = getHintedElements();

    for (let i = 0; i < hints.length; i++) {
      if (hints[i].dataset.turbokeysHintableId.toLowerCase() === hintText) {
        return hints[i];
      }
    }
  }

  function clickTarget() {
    const node = findByHintText();

    try {
      node.click()
    } catch (e) {
      console.warn('could not trigger click on target: ', e)
    }
  }

  function handleHintInput(e) {
    hintInput.push(e.key)
    if (hintInput.length === 2) {
      clickTarget()
      hintInput = [];
      reset();
    }
  }

  document.addEventListener('keydown', e => {
    if (e.key === triggerKey) return handleTriggerKey();
    if (e.key === resetKey) return reset();
    if (active) handleHintInput(e);
  })

  function setupHints() {
    const targetNodes = document.querySelectorAll(navigable_selectors);

    targetNodes.forEach(node => {
      if (!node.dataset.turbokeysHintableId) createHintForNode(node);
    });
  }

  hideHints();
  setupHints();
})();
