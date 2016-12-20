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

  function getHintElements() {
    return document.querySelectorAll('[data-turbokeyshint]');
  }

  function removeHints() {
    const hints = getHintElements();

    hints.forEach(node => {
      node.dataset.turbokeyshint = 'hidden';
    })
  }

  function enableInputs() {
    const nodes = getInputs();
    nodes.forEach(node => node.removeAttribute('readonly'));
  }

  function reset() {
    removeHints();
    enableInputs();
    usedHints = [];
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

  function appendHint(node) {
    node.dataset.turbokeyshint = generateUniqueHintText();
  }

  function disableInputs() {
    const nodes = getInputs();
    nodes.forEach(node => node.setAttribute('readonly','readonly'));
  }

  function handleTriggerKey() {
    if (active) {
      reset();
    } else {
      active = true;
      disableInputs();
      const targetNodes = document.querySelectorAll(navigable_selectors);

      targetNodes.forEach(node => {
        appendHint(node)
      })
    }
  }

  function findByHintText() {
    const hintText = hintInput.join('');
    const hints = getHintElements();

    for (let i = 0; i < hints.length; i++) {
      if (hints[i].dataset.turbokeyshint.toLowerCase() === hintText) {
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
})();
