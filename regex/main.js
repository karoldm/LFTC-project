let expressao_regular_input = document.querySelector('#expressao-regular-input');
let text_1_input = document.querySelector('#text-1');
let text_2_input = document.querySelector('#text-2');

expressao_regular_input.addEventListener('change', validRegex);
text_1_input.addEventListener('keyup', validRegex);
text_2_input.addEventListener('keyup', validRegex);

function validRegex() {

  let pattern = new RegExp(expressao_regular_input.value);

  if (pattern.test(text_1_input.value)) {
    text_1_input.style.backgroundColor = '#67d658';
  }
  else {
    text_1_input.style.backgroundColor = '#fc5142';
  }
  if (pattern.test(text_2_input.value)) {
    text_2_input.style.backgroundColor = '#67d658';
  }
  else {
    text_2_input.style.backgroundColor = '#fc5142';
  }
}