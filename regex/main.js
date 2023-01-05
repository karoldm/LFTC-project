let expressao_regular_input = document.querySelector('#expressao-regular-input');
let text_1_input = document.querySelector('#text-1');
let text_2_input = document.querySelector('#text-2');

expressao_regular_input.addEventListener('change', validRegex);
text_1_input.addEventListener('keyup', validRegex);
text_2_input.addEventListener('keyup', validRegex);

const convertToGR = document.querySelector("#convert-er-to-gr");
const convertToAF = document.querySelector("#convert-er-to-af");
const convertContent = document.querySelector("#convert-content-er");

var nodeDataArray = [];
var linkDataArray = [];

convertToAF.addEventListener("click", () => {
  let input = expressao_regular_input.value;

  if (!input) {
    alert("Defina uma expressão!");
    return;
  }

  convertContent.innerHTML = "";

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

  input = input.split("");
  if (input[0] === "^") input.shift();
  if (input[input.length - 1] === "$") input.pop();

  let key = 0;
  const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
    'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  nodeDataArray = [{ key: key, text: alphabet[key], color: 'yellow' }];
  key++;
  linkDataArray = [];

  let nodesOpen = [];
  let node = null;
  let i;
  let newNode = null;

  for (i = 0; i < input.length; i++) {

    if (input[i] === "(") {
      newNode = { key: key, text: alphabet[key], color: 'yellow' };
      key++;
      nodeDataArray.push(newNode);
      if (i === 0)
        nodesOpen.push(nodeDataArray[0]);
      else
        nodesOpen.push(newNode);
    }

    else if (input[i] === ")") node = nodesOpen.shift();

    //(alguma coisa)* ou a*
    else if (input[i] === "*") {

      if (input[i - 1] === ")") {
        linkDataArray.push({
          from: nodeDataArray[nodeDataArray.length - 1].key,
          to: node.key,
          text: ""
        });
      }

      else {
        key--;
        nodeDataArray.pop();
        linkDataArray.pop();
        linkDataArray.push({
          from: nodeDataArray[nodeDataArray.length - 1].key,
          to: nodeDataArray[nodeDataArray.length - 1].key,
          text: input[i - 1]
        });
      }
    }

    else if (input[i] === "|") {
      linkDataArray.push({
        from: nodeDataArray[nodeDataArray.length - 2].key,
        to: nodeDataArray[nodeDataArray.length - 1].key,
        text: input[i + 1]
      });
      i++;
    }

    else {
      if (input[i - 1] !== "(" || input[i - 1] === "*") {
        newNode = { key: key, text: alphabet[key], color: 'yellow' };
        key++;
        nodeDataArray.push(newNode);
      }
      linkDataArray.push({ from: nodeDataArray[nodeDataArray.length - 2].key, to: newNode.key, text: input[i] });
    }
  }

  nodeDataArray[nodeDataArray.length - 1].color = 'red';

  init();

});


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


function init() {

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
