
import validExpression from './validExpression.js';

let validButton = document.querySelector("#valid-button");
let addRowButton = document.querySelector("#add-row-button");
let containerInputs = document.querySelector("#inputs-container");
let validExpressionInput = document.querySelector("#valid-expression-input");
let clearButton = document.querySelector("#clear-button");

const convertToAF = document.querySelector("#convert-gr-to-af");
const convertContent = document.querySelector("#convert-content-gr");

convertToAF.addEventListener("click", () => {

  const input = document.querySelector("#left-input-0");

  if (!input.value) {
    alert("Defina uma gramática!");
    return;
  }

  convertContent.innerHTML = "";

  const { grammar, first } = getGrammar();


  const htmlContent = document.createElement("div");
  htmlContent.id = 'allSampleContent';
  htmlContent.innerHTML = `
  <div id="sample">
    <div id="myDiagramDiv">
      <canvas tabindex="0" width="398" height="398"
        style="position: absolute; top: 0px; left: 0px; z-index: 2; user-select: none; touch-action: none; width: 398px; height: 398px; cursor: auto;">
        This text is displayed if your browser does not support the Canvas HTML element.
      </canvas>
    </div>
  </div>
  `;

  convertContent.appendChild(htmlContent);
  init(grammar, first);

});

let inputCount = 0;

clearButton.addEventListener("click", () => {
  containerInputs.innerHTML = "";
  inputCount = 0;

  const htmlNewRow = document.createElement('div');
  htmlNewRow.className = 'input-container';
  htmlNewRow.innerHTML = //Adicionando nova linha de inputs 
    `<input id="left-input-${inputCount}" />
    <img src="../assets/right-arrow.png" alt="arrow right icon" />
    <input id="right-input-${inputCount}" />`;

  containerInputs.appendChild(htmlNewRow);

  validExpressionInput.value = "";
  validExpressionInput.style.backgroundColor = "white";

});

addRowButton.addEventListener("click", () => {
  inputCount++;

  const htmlNewRow = document.createElement('div');
  htmlNewRow.className = 'input-container';
  htmlNewRow.innerHTML = //Adicionando nova linha de inputs 
    `<input id="left-input-${inputCount}" />
    <img src="../assets/right-arrow.png" alt="arrow right icon" />
    <input id="right-input-${inputCount}" />`;

  containerInputs.appendChild(htmlNewRow);

});

function getGrammar() {
  let grammar = [];

  let left = document.querySelector(`#left-input-0`);
  const first = left.value;

  let right;

  for (let i = 0; i <= inputCount; i++) {
    left = document.querySelector(`#left-input-${i}`);
    if (left.value.trim() !== '') {
      grammar[left.value] = [];
    }
  }

  for (let i = 0; i <= inputCount; i++) {
    left = document.querySelector(`#left-input-${i}`);
    right = document.querySelector(`#right-input-${i}`);

    if (right.value.split('').length === 1 && right.value === right.value.toLowerCase()) {
      grammar[left.value].unshift(right.value)
    }

    else {
      if (grammar[left.value].includes('')) { //jogando símbolo vazio para o final do array
        grammar[left.value] = grammar[left.value].filter(e => e != '');
        grammar[left.value].push(right.value);
        grammar[left.value].push('');
      }
      else {
        grammar[left.value].push(right.value);
      }
    }
  }

  return { grammar, first };
}


validButton.addEventListener("click", () => {

  const word = validExpressionInput.value;

  if (word.trim() === '') { //verificando se a expressão a ser validada não é vazia
    alert('Insira uma expressão para ser validada!');
  }
  else {

    let { grammar, first } = getGrammar(); //get regras da gramática e não terminal inicial

    if (Object.keys(grammar).length == 0) { //nenhuma regra a ser validada
      validExpressionInput.style.backgroundColor = "green";
    }

    else {
      if (validExpression(grammar, first, word) !== -1)
        if (validExpression(grammar, first, word)) {
          validExpressionInput.style.backgroundColor = "green";
        }
        else {
          validExpressionInput.style.backgroundColor = "red";
        }
    }

  }

});

function init(grammar, first) {
  let key = 0;
  var nodeDataArray = [];
  var linkDataArray = [];

  //convertendo gramatica para af

  //criando todos os estados para cada não terminal
  for (let G in grammar) {

    nodeDataArray.push({
      key: key, text: G, color: 'yellow',
    });

    key++;
  }

  //criando um estado adicional para ele ser final
  nodeDataArray.push({
    key: key, text: 'FINAL', color: 'red',
  });

  // criando os links entre os estados
  for (let G in grammar) {
    for (let g in grammar[G]) {

      const rightSide = grammar[G][g].split("");
      let terminal = null;
      let nonTerminal = null;

      if (rightSide.length === 1) {
        //A --> a 
        if (rightSide[0] === rightSide[0].toLowerCase()) {
          terminal = rightSide[0];
          linkDataArray.push({
            from: nodeDataArray.findIndex((v) => v.text === G),
            to: key,
            text: terminal
          });
        }
        //A --> B
        else {
          nonTerminal = rightSide[0];
          linkDataArray.push({
            from: nodeDataArray.findIndex((v) => v.text === G),
            to: nodeDataArray.findIndex((v) => v.text === nonTerminal),
            text: ""
          });
        }
      }

      //Como é GLUD: A --> aB
      else if (rightSide.length === 2) {
        terminal = rightSide[0];
        nonTerminal = rightSide[1];

        linkDataArray.push({
          from: nodeDataArray.findIndex((v) => v.text === G),
          to: nodeDataArray.findIndex((v) => v.text === nonTerminal),
          text: terminal
        });
      }

      //A --> vazio
      else if (rightSide.length === 0) {
        nodeDataArray.map((v) => {
          if (v.text === G) {
            v.color = 'red';
          }
        });
      }
    }
  }

  //removendo estado FINAL caso ele não tenha sido usado
  let finalStateUsed = false;

  linkDataArray.map((v) => {
    if (v.to === key || v.from === key) finalStateUsed = true;
  });

  if (!finalStateUsed) {
    nodeDataArray.pop();
  }

  const $ = go.GraphObject.make;  // for conciseness in defining templates

  let myDiagram =
    $(go.Diagram, "myDiagramDiv");

  function nodeInfo(d) {  // Tooltip info for a node data object
    var str = "Node " + d.key + ": " + d.text + "\n";
    if (d.group)
      str += "member of " + d.group;
    else
      str += "top-level node";
    return str;
  }

  myDiagram.nodeTemplate =
    $(go.Node, "Auto",
      { desiredSize: new go.Size(50, 50) },
      { locationSpot: go.Spot.Center },
      $(go.Shape, "Circle",
        {
          fill: "yellow", // the default fill, if there is no data bound value
          portId: "", cursor: "pointer",  // the Shape is the port, not the whole Node
        },
        new go.Binding("figure", "fig"),
        new go.Binding("fill", "color")),
      $(go.TextBlock,
        {
          font: "bold 14px sans-serif",
          stroke: '#333',
          margin: 6,  // make some extra space for the shape around the text
          isMultiline: false,  // don't allow newlines in text
        },
        new go.Binding("text", "text").makeTwoWay()),  // the label shows the node data's text
      { // this tooltip Adornment is shared by all nodes
        toolTip:
          $("ToolTip",
            $(go.TextBlock, { margin: 4 },  // the tooltip shows the result of calling nodeInfo(data)
              new go.Binding("text", "", nodeInfo))
          ),
      }
    );

  myDiagram.linkTemplate =
    $(go.Link,  // the whole link panel
      {
        curve: go.Link.Bezier,
        adjusting: go.Link.Stretch,
        reshapable: true,
        toShortLength: 3
      },
      new go.Binding("points").makeTwoWay(),
      new go.Binding("curviness"),
      $(go.Shape,  // the link shape
        { strokeWidth: 1.5 },
        new go.Binding('stroke', 'progress', progress => progress ? "#52ce60" /* green */ : 'black'),
        new go.Binding('strokeWidth', 'progress', progress => progress ? 2.5 : 1.5)),
      $(go.Shape,  // the arrowhead
        { toArrow: "standard", stroke: null },
        new go.Binding('fill', 'progress', progress => progress ? "#52ce60" /* green */ : 'black')),
      $(go.Panel, "Auto",
        $(go.Shape,  // the label background, which becomes transparent around the edges
          {
            fill: $(go.Brush, "Radial",
              { 0: "rgb(245, 245, 245)", 0.7: "rgb(245, 245, 245)", 1: "rgba(245, 245, 245, 0)" }),
            stroke: null
          }),
        $(go.TextBlock, "transition",  // the label text
          {
            textAlign: "center",
            font: "9pt helvetica, arial, sans-serif",
            margin: 4,
          },
          // editing the text automatically updates the model data
          new go.Binding("text").makeTwoWay())
      )
    );

  function diagramInfo(model) {  // Tooltip info for the diagram's model
    return "Model:\n" + model.nodeDataArray.length + " nodes, " + model.linkDataArray.length + " links";
  }
  // provide a tooltip for the background of the Diagram, when not over any Part
  myDiagram.toolTip =
    $("ToolTip",
      $(go.TextBlock, { margin: 4 },
        new go.Binding("text", "", diagramInfo))
    );

  myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);

  //definindo estado inicial
  const nodeInitial = myDiagram.findNodeForKey(0);
  const data = nodeInitial.data;
  myDiagram.model.setDataProperty(data, "fig", "RoundedRectangle");
}
