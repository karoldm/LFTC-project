
let validButton = document.querySelector("#valid-button");
let addRowButton = document.querySelector("#add-row-button");
let containerInputs = document.querySelector("#inputs-container");

addRowButton.addEventListener("click", () => {
  const htmlNewRow = document.createElement('div');
  htmlNewRow.className = 'input-container';
  htmlNewRow.innerHTML =
    `<input />
    <img src="../assets/right-arrow.png" alt="arrow right icon" />
    <input />`;

  containerInputs.appendChild(htmlNewRow);

});