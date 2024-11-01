import * as d3 from "d3";
import { Contract } from 'web3-eth-contract';
import abi from './multichain_demo_contract_abi.json'
const bridgeContract = new Contract(abi)

//
// Constants
//
const WeiPerEth = 1000000000000000000

const BridgeableScopes = {
    // Sepolia
    "eip155:11155111": {
        name: "Sepolia",
        contractAddress: '0x2e2512fd69cba059DFf557cD6f683a3279402e91',
        blockExplorerUrl: 'https://sepolia.etherscan.io',
        supports: ["eip155:59141", "eip155:421614", "eip155:11155420", "eip155:168587773"]
    },
    // Linea Sepolia (no Arbitrium)
    "eip155:59141": {
        name: "Linea Sepolia",
        contractAddress: '0x786Cb4C684F9D4bA4aBEbddE2c8a4D4ec80a9b78',
        blockExplorerUrl: 'https://sepolia.lineascan.build/',
        supports: ["eip155:11155111", "eip155:11155420", "eip155:168587773"]
    },
    // Arbitrum Sepolia (no Linea)
    "eip155:421614": {
        name: "Arbitrum Sepolia",
        contractAddress: '0x697230B7c217F4F45C460d5d181F792AB0aC6549',
        blockExplorerUrl: 'https://sepolia.arbiscan.io/',
        supports: ["eip155:11155111", "eip155:11155420", "eip155:168587773"]
    },
    // OP Sepolia (no Blast)
    "eip155:11155420": {
        name: "OP Sepolia",
        contractAddress: '0x697230B7c217F4F45C460d5d181F792AB0aC6549',
        blockExplorerUrl: 'https://sepolia-optimism.etherscan.io/',
        supports: ["eip155:11155111", "eip155:59141", "eip155:421614"]
    },
    // Blast Sepolia (no OP)
    "eip155:168587773": {
        name: "Blast Sepolia",
        contractAddress: '0x697230B7c217F4F45C460d5d181F792AB0aC6549',
        blockExplorerUrl: 'https://sepolia.blastscan.io/',
        supports: ["eip155:11155111", "eip155:59141", "eip155:421614"]
    },
}

const pastelColors = [
    "#e8b6ae", "#f0c1ad", "#eed0ba", "#ebdec6", "#cdc0d6",
    "#b8b1cf", "#959bad", "#97aeb8", "#a5bcc1", "#b2c9c9",
    "#9ac7a8", "#b8dbc9", "#c5e3d2", "#d1ebdb", "#d6e1c8",
    "#e5c28c", "#e8d097", "#edd9aa", "#f2e6bb", "#f9f3dd"
];
const NODE_MIN_RADIUS = 130;
const NODE_PADDING = 20;
const NODE_SCALE = 1.3;
const NODE_TEXT_START = "-2.4em";
const NODE_TEXT_SPACING = "1.2em";
const NODE_FLASH_COLOR = "gray"
const EDGE_COLOR = "#999";
const EDGE_STROKE_WIDTH = 3;
const FLASH_DURATION = 3000;

const ETH_VALUE_PRECISION = 4;

const USE_SUBSCRIPTIONS = true; // use false for polling
// subscriptions
const SUBSCRIPTION_STAGGER = 5000;
const SUBSCRIPTION_DEBOUNCE = 2500;
const SUBSCRIPTION_REQUEST_DELAY = 666; // just to avoid rate limiting a bit better
// polling
const POLLING_RATE = 12500; // mainnet block time -ish

//
// State
//
let extensionPort;
let jsonRpcId;
let currentSessionScopes = {};
let accounts = [];
let scopeStrings = [];

let balances = {};
let transactions = [];
let subscriptionDebounce = {};

let nodes = [];
let links = [];

//
// Helpers
//

// Dapp <-> Wallet Connection Initialization
async function connectExtension() {
    const extensionId = document.getElementById("connectExtensionInput").value;
    try {
        extensionPort = chrome.runtime.connect(extensionId); // externally_connectable
        extensionPort.onMessage.addListener((msg) => {
            const { data: { method, params } } = msg;
            // Subscription Events
            if (method === "wallet_notify") {
                handleEthSubscription(
                    params.scope,
                    params.notification.params.result.number,
                );
            // Permission Events
            } else if (method === "wallet_sessionChanged") {
                onNewSessionScopes(params.sessionScopes);
            }
            // console.log(msg.data);
        });

        // Dapp Initialization
        checkWalletConnection();
    } catch (error) {
        console.error(error);
        alert("Failed to connect to extension!");
    }
}

// Permission Handling
async function onNewSessionScopes(sessionScopes) {
    const oldScopeStrings = scopeStrings;
    const oldAccounts = accounts;
    const eip155ScopeStrings = Object.keys(sessionScopes).filter((scopeString) => {
        // return /eip155:[0-9]+/u.test(scopeString)
        if (!BridgeableScopes[scopeString]) {
            // console.log(`ignoring ${scopeString} since it is not defined in BridgeableScopes`)
            return false
        }
        return true
    });

    const eip155AccountsSet = new Set();

    eip155ScopeStrings.forEach((scopeString) => {

        const scopeObject = sessionScopes[scopeString];

        scopeObject.accounts.forEach((account) => {
            const address = account.split(":")[2];
            eip155AccountsSet.add(address);
        });
    });

    currentSessionScopes = sessionScopes;
    accounts = [...eip155AccountsSet];
    scopeStrings = [...eip155ScopeStrings];

    const accountsDidChange = oldAccounts.length !== accounts.length || accounts.some(account => !oldAccounts.includes(account))

    oldScopeStrings.forEach((oldScopeString) => {
        if (!scopeStrings.includes(oldScopeString)) {
            removeNode(oldScopeString)
        }
    });
    scopeStrings.forEach(newScopeString => {
        if (!oldScopeStrings.includes(newScopeString)) {
            addNode(newScopeString)
            if (USE_SUBSCRIPTIONS) {
              setTimeout(() => {
                subscribeToBlockHeaders(newScopeString)
              }, Math.floor(Math.random() * (SUBSCRIPTION_STAGGER + 1)))
            }
        } else if (accountsDidChange) {
            refreshNodeContent(newScopeString)
        }
    })

    if (!USE_SUBSCRIPTIONS) {
      startPolling()
    }
}

async function subscribeToBlockHeaders(scopeString) {
  try {
    await extensionPortRequest({
      method: "wallet_invokeMethod",
      params: {
        scope: scopeString,
        request: {
          method: "eth_subscribe",
          params: ["newHeads"],
        },
      },
    });
  } catch (error) {
    console.error(error);
    alert("Subscription failed!");
  }
}

function getShortAddress(address) {
  return `${address.slice(0,7)}...${address.slice(37,42)}`
}

function getNodeLabelText(scopeString) {
    const {name, contractAddress} = BridgeableScopes[scopeString];
    const accountsText = accounts.map(account => {
        const balance = balances[scopeString]?.[account]?.toFixed(ETH_VALUE_PRECISION) ?? '------'
        return `${getShortAddress(account)}: ${balance} ETH`
    }).join('\n')

    const contractBalance = balances[scopeString]?.[contractAddress] || 0
    // return`${name}\nBridge Contract: ${contractBalance.toFixed(ETH_VALUE_PRECISION)} ETH\n--------------------------\n${accountsText}`
    return`${name}\n--------------------------\n${accountsText}`
}

// Permission Initialization
async function connectWallet() {
    if (!extensionPort) {
        alert("Connect to extension first.");
        return;
    }
    try {

    const { sessionScopes } = await extensionPortRequest({
            method: "wallet_createSession",
            params: {
                eip155: {
                    references: ["11155111", "59141", "421614", "11155420", "168587773"],
                    methods: [
                        "eth_getTransactionReceipt",
                        "eth_getBalance",
                        "eth_sendTransaction",
                        "eth_subscribe",
                    ],
                    notifications: ["eth_subscription"],
                },
            },
        });

        await onNewSessionScopes(sessionScopes);
    } catch (error) {
        console.error(error);
        alert("Failed to connect wallet!");
    }
}

async function checkWalletConnection() {
    try {
        const { sessionScopes } = await extensionPortRequest({
            method: "wallet_getSession",
        });
        await onNewSessionScopes(sessionScopes);
    } catch (error) {
        console.error("Failed to check wallet connection:", error);
        alert("Failed to check wallet connection");
    }
}

//
// externally_connectable helpers:
// normally this would be abstracted away
// by a helper library
//

function generateJsonRpcId(opts) {
    let max = Number.MAX_SAFE_INTEGER;
    jsonRpcId = jsonRpcId ?? Math.floor(Math.random() * max);

    jsonRpcId = jsonRpcId % max;
    jsonRpcId += 1;
    return jsonRpcId;
}

async function extensionPortRequest(request) {
    const id = generateJsonRpcId();

    extensionPort.postMessage({
        type: "caip-x",
        data: {
            jsonrpc: "2.0",
            id,
            ...request,
        },
    });

    return new Promise((resolve, reject) => {
    const listener = (msg) => {
        if (msg.type === "caip-x" && msg.data.id === id) {
            const { result, error } = msg.data;
            if (result) {
                resolve(result);
            } else {
                reject(error);
            }
            extensionPort.onMessage.removeListener(listener);
        }
    };

    extensionPort.onMessage.addListener(listener);
    });
}

//
// D3
//

const svg = d3.select("body").append("svg")
    .attr("width", window.innerWidth)
    .attr("height", window.innerHeight);

const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(400)) // Further increased distance
    .force("charge", d3.forceManyBody().strength(-1600)) // Further increased negative strength
    .force("center", d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2))
    .force("collide", d3.forceCollide().radius(d => getRadius(d.label) + 40)); // Further increased radius

let link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("stroke-width", EDGE_STROKE_WIDTH)
    .attr("stroke", EDGE_COLOR)
    .on("click", function(event, d) {
        showEdgeModal(d);
    });

let node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(nodes)
    .enter().append("g")
    .on("click", function(event, d) {
        showNodeModal(d.id);
    });

node.append("circle")
    .attr("r", d => getRadius(d.label))
    .attr("fill", () => pastelColors[Math.floor(Math.random() * pastelColors.length)]);

let text = node.append("text")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "top"); // this may need to be added elsewhere

text.selectAll("tspan")
    .data(d => d.label.split('\n'))
    .enter()
    .append("tspan")
    .attr("x", 0)
    .attr("dy", (d, i) => i === 0 ? NODE_TEXT_START : NODE_TEXT_SPACING)
    .text(d => d);


function updateGraph() {
    d3.selectAll("g > *").remove()

    link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("stroke-width", EDGE_STROKE_WIDTH)
    .attr("stroke", EDGE_COLOR)
    .on("click", function(event, d) {
      showEdgeModal(d);
    });

    node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(nodes)
        .enter().append("g")
        .on("click", function(event, d) {
            showNodeModal(d.id);
        });

    node.append("circle")
        .attr("r", d => getRadius(d.label))
        .attr("fill", () => pastelColors[Math.floor(Math.random() * pastelColors.length)]);

    text = node.append("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "top"); // this may need to be added elsewhere

    text.selectAll("tspan")
        .data(d => d.label.split('\n'))
        .enter()
        .append("tspan")
        .attr("x", 0)
        .attr("dy", (d, i) => i === 0 ? NODE_TEXT_START : NODE_TEXT_SPACING)
        .text(d => d);
}

simulation.on("tick", () => {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node
        .attr("transform", d => `translate(${d.x},${d.y})`);
});


function getRadius(text) {
    const context = document.createElement("canvas").getContext("2d");
    context.font = "10px sans-serif";
    const lines = text.split("\n");
    const maxWidth = Math.max(...lines.map(line => context.measureText(line).width));
    const lineHeight = 10; // Approximate line height
    const textHeight = lines.length * lineHeight;
    const original = Math.sqrt(maxWidth * maxWidth + textHeight * textHeight) / 2 + 10
    return Math.max(NODE_MIN_RADIUS, original * NODE_SCALE + NODE_PADDING);
}

window.addEventListener("resize", () => {
    svg.attr("width", window.innerWidth)
        .attr("height", window.innerHeight);
    simulation.force("center", d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2));
    simulation.alpha(1).restart(); // Restart simulation to adjust positions
});

// Modal functionality
const modal = document.getElementById("myModal");
const modalText = document.getElementById("modal-text");
const span = document.getElementsByClassName("close")[0];


function generateBlockExplorerAddressLink(blockExplorerUrl, address, label) {
  return `<a href="${blockExplorerUrl}/address/${address}" target="_blank">${label || address}</a>`
}

function showEdgeModal(edge) {
  const source = BridgeableScopes[edge.source.id]
  const target = BridgeableScopes[edge.target.id]

  let maxAmount = Math.min(
    balances[edge.source.id]?.[source.contractAddress] || 0,
    balances[edge.target.id]?.[target.contractAddress] || 0,
    balances[edge.source.id]?.[accounts[0]] || 0
  )

  modalText.innerHTML = `
    <h1>Bridge ${source.name} <-> ${target.name}</h1>
    <p><b>${source.name} Bridge Contract:</b> ${generateBlockExplorerAddressLink(source.blockExplorerUrl, source.contractAddress)} (${(balances[edge.source.id]?.[source.contractAddress] || 0).toFixed(ETH_VALUE_PRECISION)} ETH)</p>
    <p><b>${target.name} Bridge Contract:</b> ${generateBlockExplorerAddressLink(target.blockExplorerUrl, target.contractAddress)} (${(balances[edge.target.id]?.[target.contractAddress] || 0).toFixed(ETH_VALUE_PRECISION)} ETH)</p>
    <hr>
    <label for="fromScopeSelect">From:</label>
    <select id="fromScopeSelect">
      <option value="${edge.source.id}">${source.name} (${(balances[edge.source.id]?.[source.contractAddress] || 0).toFixed(ETH_VALUE_PRECISION)} ETH)</option>
      <option value="${edge.target.id}">${target.name} (${(balances[edge.target.id]?.[target.contractAddress] || 0).toFixed(ETH_VALUE_PRECISION)} ETH)</option>
    </select>
    <label for="toScopeSelect">To:</label>
    <select id="toScopeSelect">
      <option value="${edge.target.id}">${target.name} (${(balances[edge.target.id]?.[target.contractAddress] || 0).toFixed(ETH_VALUE_PRECISION)} ETH)</option>
      <option value="${edge.source.id}">${source.name} (${(balances[edge.source.id]?.[source.contractAddress] || 0).toFixed(ETH_VALUE_PRECISION)} ETH)</option>
    </select>
    <br>
    <label for="accountSelect">Account:</label>
    <select id="accountSelect">
      ${
        accounts.map(account => {
          const balance = balances[edge.source.id]?.[account] || 0
          return `<option value="${account}">${getShortAddress(account)} (${balance.toFixed(ETH_VALUE_PRECISION)} ETH)</option>`
        }).join('')
      }
    </select>
    <br>
    <label for="amountText">Amount:</label>
    <input type="text" id="amountText" value="${1/Math.pow(10, ETH_VALUE_PRECISION - 1)}" />
    Max: <span id="maxAmountDisplay">${maxAmount.toFixed(ETH_VALUE_PRECISION)}</span> ETH
    <br>
    <button id="bridgeButton">Bridge ETH</button>
  `;

  modal.style.display = "block";

  document.getElementById("fromScopeSelect").addEventListener("change", (event) => {
    const fromScope = event.target.value;
    const toScope = fromScope === edge.source.id ? edge.target.id : edge.source.id;
    document.getElementById("accountSelect").innerHTML = accounts.map(account => {
      const balance = balances[fromScope]?.[account] || 0
      return `<option value="${account}">${getShortAddress(account)} (${balance.toFixed(ETH_VALUE_PRECISION)} ETH)</option>`
    }).join('')

    document.getElementById("toScopeSelect").value = toScope

    const account = document.getElementById("accountSelect").value
    maxAmount = Math.min(
      balances[edge.source.id]?.[source.contractAddress] || 0,
      balances[edge.target.id]?.[target.contractAddress] || 0,
      balances[fromScope]?.[account] || 0
    )
    document.getElementById("maxAmountDisplay").innerText = maxAmount.toFixed(ETH_VALUE_PRECISION)
  });

  document.getElementById("toScopeSelect").addEventListener("change", (event) => {
    const toScope = event.target.value;
    const fromScope = toScope === edge.source.id ? edge.target.id : edge.source.id;
    document.getElementById("fromScopeSelect").value = fromScope
  });

  document.getElementById("accountSelect").addEventListener("change", (event) => {
    const account = event.target.value;
    const fromScope = document.getElementById("fromScopeSelect").value

    maxAmount = Math.min(
      balances[edge.source.id]?.[source.contractAddress] || 0,
      balances[edge.target.id]?.[target.contractAddress] || 0,
      balances[fromScope]?.[account] || 0
    )
    document.getElementById("maxAmountDisplay").innerText = maxAmount.toFixed(ETH_VALUE_PRECISION)
  });

  document.getElementById("bridgeButton").addEventListener("click", async () => {
    const account = document.getElementById("accountSelect").value
    const fromScope = document.getElementById("fromScopeSelect").value
    const toScope = document.getElementById("toScopeSelect").value

    const { contractAddress } = BridgeableScopes[fromScope]

    try {
      const amount = Number(document.getElementById("amountText").value)
      if (amount > maxAmount) {
        alert(`Amount must be less than ${maxAmount}`)
        return;
      }
      if (amount <= 0 || Number.isNaN(amount)) {
        alert(`Amount must be greater than 0`)
        return;
      }


      const transactionHash = await extensionPortRequest({
        method: "wallet_invokeMethod",
        params: {
            scope: fromScope,
            request: {
                "method": "eth_sendTransaction",
                "params": [{
                  to: contractAddress,
                  from: account,
                  data: "0x",
                  value: `0x${(amount * WeiPerEth).toString(16)}`
                }]
            }
        },
      })

      transactions.push({
        account,
        toScope,
        fromScope,
        amount,
        transactionHash,
        type: 'bridge'
      })
      updateEdgeColor(fromScope, toScope, "orange")
      updateNodeBorderColor(fromScope, "orange")
      modal.style.display = "none";
    } catch (error) {
      console.log(error)
      alert('failed to bridge!')
    }
  });
}


function showNodeModal(id) {
    const {name, contractAddress, supports, blockExplorerUrl} = BridgeableScopes[id]
    modalText.innerHTML = `
        <h1>${name}</h1>
        <p><a href="${blockExplorerUrl}" target="_blank">Block Explorer</a></p>
        <p><b>Bridge Contract:</b> ${generateBlockExplorerAddressLink(blockExplorerUrl, contractAddress)} (${(balances[id]?.[contractAddress] || 0).toFixed(ETH_VALUE_PRECISION)} ETH)</p>
        <p><b>Bridgeable Scopes:</b> ${supports.map(scopeString => BridgeableScopes[scopeString].name).join(', ')}</p>
        <hr>
        <b>Accounts:</b>
        <br>
        <ul>
        ${accounts.map(account => {
            const balance = balances[id]?.[account] || 0
            return `<li>${generateBlockExplorerAddressLink(blockExplorerUrl, account)} (${balance.toFixed(ETH_VALUE_PRECISION)} ETH)</li>`
        }).join('')}
        </ul>

    `;
    modal.style.display = "block";
}

span.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function updateEdgeColor(sourceId, targetId, color = EDGE_COLOR) {
    const targetLink = links.find(link =>
      (link.source.id === sourceId && link.target.id === targetId) ||
      (link.source.id === targetId && link.target.id === sourceId)
    )
    if (!targetLink) {
      console.log('couldnt find link', {sourceId, targetId, color})
      return
    }

    const linkSelection = d3.select(link.nodes()[links.indexOf(targetLink)])

    linkSelection.attr("stroke", color);

    // const sourceNode = nodes.find(node => node.id === randomLink.source.id);
    // const targetNode = nodes.find(node => node.id === randomLink.target.id);

    // const edgeLabel = svg.append("text")
    //     .attr("x", (sourceNode.x + targetNode.x) / 2)
    //     .attr("y", (sourceNode.y + targetNode.y) / 2)
    //     .attr("dy", -5)
    //     .attr("text-anchor", "middle")
    //     .attr("fill", "green")
    //     .text("sending...");

    // setTimeout(() => {
    //     edgeLabel.remove();
    // }, 3000);
}

function addNode(id) {
    // console.log('adding node', id)
    const newNode = { id, label: getNodeLabelText(id) };
    nodes.push(newNode);

    const supportedScopes = BridgeableScopes[id]?.supports || []

    supportedScopes.forEach((supportedScope) => {
        const targetNode = nodes.find(node => node.id === supportedScope)
        const targetLink = links.find(link =>
            (link.source.id === id && link.target.id === supportedScope) ||
            (link.source.id === supportedScope && link.target.id === id)
        )
        if (targetNode && !targetLink) {
            links.push({ source: id, target: targetNode.id });
        }
    })

    // Update the simulation with the new node and link
    simulation.nodes(nodes);
    simulation.force("link").links(links);

    // Add the new node to the SVG
    // const newNodeSelection = svg.select(".nodes")
    //     .selectAll("g")
    //     .data(nodes)
    //     .enter()
    //     .append("g")
    //     .on("click", function(event, d) {
    //         showModal(d.label);
    //     });

    // newNodeSelection.append("circle")
    //     .attr("r", d => getRadius(d.label))
    //     .attr("fill", () => pastelColors[Math.floor(Math.random() * pastelColors.length)]);

    // const newText = newNodeSelection.append("text")
    //     .attr("text-anchor", "middle");

    // newText.selectAll("tspan")
    //     .data(d => d.label.split('\n'))
    //     .enter()
    //     .append("tspan")
    //     .attr("x", 0)
    //     .attr("dy", (d, i) => i === 0 ? NODE_TEXT_START : NODE_TEXT_SPACING)
    //     .text(d => d);


    // Restart the simulation
    updateGraph()
    simulation.alpha(1).restart();
}

function removeNode(id) {
    // console.log('removing node', id)
    nodes = nodes.filter(node => node.id !== id);
    links = links.filter(link => link.source.id !== id && link.target.id !== id);

    // Update the simulation with the removed node and links
    simulation.nodes(nodes);
    simulation.force("link").links(links);

    // Remove the node and its edges from the SVG
    svg.select(".nodes").selectAll("g")
        .data(nodes, d => d.id)
        .exit().remove();

    svg.select(".links").selectAll("line")
        .data(links, d => `${d.source.id}-${d.target.id}`)
        .exit().remove();

    updateGraph()
    // Restart the simulation
    simulation.alpha(1).restart();
}

function refreshNodeContent(id) {
    const targetNode = nodes.find(node => node.id === id)
    targetNode.label = getNodeLabelText(id)
    text.selectAll("tspan").remove();
    text.selectAll("tspan")
        .data(d => d.label.split('\n'))
        .enter()
        .append("tspan")
        .attr("x", 0)
        .attr("dy", (d, i) => i === 0 ? NODE_TEXT_START : NODE_TEXT_SPACING)
        .text(d => d);
    node.select("circle").attr("r", d => getRadius(d.label));

    const originalColor = svg.selectAll(".nodes circle")
      .filter(d => d.id === id)
      .attr("fill");

    if(originalColor !== NODE_FLASH_COLOR) {
      svg.selectAll(".nodes circle")
        .filter(d => d.id === id)
        .attr("fill", NODE_FLASH_COLOR);

      setTimeout(() => {
        svg.selectAll(".nodes circle")
          .filter(d => d.id === id)
          .attr("fill", originalColor);
      }, FLASH_DURATION / 4)
    }


    // Restart simulation to adjust positions
    // simulation.alpha(1).restart();
}

function updateNodeBorderColor(id, color) {
  const targetNode = nodes.find(node => node.id === id)

  const targetNodeCircle = d3.select(node.nodes()[nodes.indexOf(targetNode)]).select("circle");
  if (color) {
    targetNodeCircle.attr("stroke", color).attr("stroke-width", 3);
  } else {
    targetNodeCircle.attr("stroke", null).attr("stroke-width", null);
  }

  // Restart simulation to adjust positions
  // simulation.alpha(1).restart();
}

// DOM
document.getElementById("connectExtensionButton").addEventListener("click", connectExtension);
document.getElementById("connectButton").addEventListener("click", connectWallet);

// Claim
async function claimBridgedEth(transaction) {
  const { toScope, fromScope, account, amount } = transaction
  const { contractAddress } = BridgeableScopes[toScope]

  if (!confirm(`Initial bridge tranasction on ${BridgeableScopes[fromScope].name} was successful. Finish by claiming the ${amount} ETH now waiting on ${BridgeableScopes[toScope].name}?`)) {
    console.log(`User chose not to finish claiming ${amount} ETH that has already been bridged from  ${BridgeableScopes[fromScope].name} to ${BridgeableScopes[toScope].name}`);
    return
  }

  const data = await bridgeContract.methods.withdraw(`0x${(amount * WeiPerEth).toString(16)}`).encodeABI();

  const transactionHash = await extensionPortRequest({
    method: "wallet_invokeMethod",
    params: {
        scope: toScope,
        request: {
            "method": "eth_sendTransaction",
            "params": [{
              to: contractAddress,
              from: account,
              data
            }]
        }
    },
  })

  transactions.push({
    account,
    toScope,
    fromScope,
    amount,
    transactionHash,
    type: 'claim'
  })
  updateEdgeColor(fromScope, toScope, "orange")
  updateNodeBorderColor(toScope, "orange")
}

// Events/Loops
async function handleEthSubscription(scopeString, _blockHead) {
  if (!scopeStrings.includes(scopeString)) {
    // Not sure how this would happen
    return
  }
  if(subscriptionDebounce[scopeString]) {
    return
  }
  subscriptionDebounce[scopeString] = true

  console.log(`Subscription: updating account balances, contract balance, tx statuses for scope ${scopeString}`)
  await updateTransactionStatusesForScope(scopeString)
  await updateContractBalanceForScope(scopeString)
  await updateAccountBalancesForScope(scopeString)

  setTimeout(() => {
    subscriptionDebounce[scopeString] = false
  }, SUBSCRIPTION_DEBOUNCE)
}

async function updateAccountBalancesForScope(scopeString) {
  if(!extensionPort) {
      return
  }
  if(!accounts.length || !scopeStrings.includes(scopeString)) {
      return
  }

  for (let account of accounts) {
      // console.log(`updating balance for account ${account} on scope ${scopeString}`)
      try {
          const balance = await extensionPortRequest({
              method: "wallet_invokeMethod",
              params: {
                  scope: scopeString,
                  request: {
                      "method": "eth_getBalance",
                      "params": [
                          account,
                          "latest"
                      ],
                  },
              },
          })
          balances[scopeString] = balances[scopeString] || {}
          const oldBalance = balances[scopeString][account] || 0
          balances[scopeString][account] = parseInt(balance, 16) / Math.pow(10, 18);

          if (oldBalance !== balances[scopeString][account]) {
              // console.log(`updating node for account ${account} on scope ${scopeString} with ${balances[scopeString][account]}`)
              // refreshNodeContent(scopeString, !oldBalance || balances[scopeString][account] > oldBalance ? "green" : "red")
              refreshNodeContent(scopeString)
          }

      } catch (error) {
          console.error(`failed updating balance for account ${account} on scope ${scopeString}`, error)
      }
      await new Promise((resolve) => setTimeout(resolve, SUBSCRIPTION_REQUEST_DELAY))
  }
}

async function updateAccountBalances() {
    if(!extensionPort) {
        return
    }
    if(!accounts.length || !scopeStrings.length) {
        return
    }

    for (let account of accounts) {
      console.log(`Polling: updating account balances for account ${account}`)
        // Notice how we hit multiple chains at once
        await Promise.allSettled(scopeStrings.map(async scopeString => {
            // console.log(`updating balance for account ${account} on scope ${scopeString}`)
            try {
                const balance = await extensionPortRequest({
                    method: "wallet_invokeMethod",
                    params: {
                        scope: scopeString,
                        request: {
                            "method": "eth_getBalance",
                            "params": [
                                account,
                                "latest"
                            ],
                        },
                    },
                })
                balances[scopeString] = balances[scopeString] || {}
                const oldBalance = balances[scopeString][account] || 0
                balances[scopeString][account] = parseInt(balance, 16) / Math.pow(10, 18);

                if (oldBalance !== balances[scopeString][account]) {
                    // console.log(`updating node for account ${account} on scope ${scopeString} with ${balances[scopeString][account]}`)
                    // refreshNodeContent(scopeString, !oldBalance || balances[scopeString][account] > oldBalance ? "green" : "red")
                    refreshNodeContent(scopeString)
                }

            } catch (error) {
                console.error(`failed updating balance for account ${account} on scope ${scopeString}`, error)
            }

        }))
    }
}
async function updateAccountBalancesPoll() {
    await updateAccountBalances()
    setTimeout(() => {
        updateAccountBalancesPoll()
    }, POLLING_RATE)
}


async function updateContractBalanceForScope(scopeString) {
  if(!extensionPort) {
      return
  }
  if(!accounts.length || !scopeStrings.includes(scopeString)) {
    return
  }

  const {contractAddress} = BridgeableScopes[scopeString]
  // console.log(`updating balance for contract ${contractAddress} on scope ${scopeString}`)
  try {
      const balance = await extensionPortRequest({
          method: "wallet_invokeMethod",
          params: {
              scope: scopeString,
              request: {
                  "method": "eth_getBalance",
                  "params": [
                      contractAddress,
                      "latest"
                  ],
              },
          },
      })
      balances[scopeString] = balances[scopeString] || {}
      const oldBalance = balances[scopeString][contractAddress] || 0
      balances[scopeString][contractAddress] = parseInt(balance, 16) / Math.pow(10, 18);

      if (oldBalance !== balances[scopeString][contractAddress]) {
          // console.log(`updating node for contract ${contractAddress} on scope ${scopeString} with ${balances[scopeString][contractAddress]}`)
          refreshNodeContent(scopeString)
      }

  } catch (error) {
      console.error(`failed updating balance for contract ${contractAddress} on scope ${scopeString}`, error)
  }
}

async function updateContractBalances() {
    if(!extensionPort) {
        return
    }
    if(!accounts.length || !scopeStrings.length) {
        return
    }


    await Promise.allSettled(scopeStrings.map(async scopeString => {
        const {contractAddress} = BridgeableScopes[scopeString]
        // console.log(`updating balance for contract ${contractAddress} on scope ${scopeString}`)
        try {
            const balance = await extensionPortRequest({
                method: "wallet_invokeMethod",
                params: {
                    scope: scopeString,
                    request: {
                        "method": "eth_getBalance",
                        "params": [
                            contractAddress,
                            "latest"
                        ],
                    },
                },
            })
            balances[scopeString] = balances[scopeString] || {}
            const oldBalance = balances[scopeString][contractAddress] || 0
            balances[scopeString][contractAddress] = parseInt(balance, 16) / Math.pow(10, 18);

            if (oldBalance !== balances[scopeString][contractAddress]) {
                // console.log(`updating node for contract ${contractAddress} on scope ${scopeString} with ${balances[scopeString][contractAddress]}`)
                refreshNodeContent(scopeString)
            }

        } catch (error) {
            console.error(`failed updating balance for contract ${contractAddress} on scope ${scopeString}`, error)
        }
    }))
}
async function updateContractBalancesPoll() {
    console.log("Polling: updating all contract balances")
    await updateContractBalances()
    setTimeout(() => {
        updateContractBalancesPoll()
    }, POLLING_RATE)
}

async function updateTransactionStatusesForScope(scopeString) {
  if(!extensionPort) {
      return
  }
  if(!accounts.length || !scopeStrings.length) {
      return
  }

  const pendingTransactions = transactions.filter(transaction => !transaction.status)

  await Promise.allSettled(pendingTransactions.map(async pendingTransaction => {
      const {fromScope, toScope, type, transactionHash } = pendingTransaction

      const isBridge = type === 'bridge'
      const targetScope = isBridge ? fromScope : toScope

      if(targetScope !== scopeString) {
        return
      }

      console.log(`getting tx receipt for tx hash ${transactionHash} on scope ${targetScope}`)
      try {
          const receipt = await extensionPortRequest({
              method: "wallet_invokeMethod",
              params: {
                  scope: targetScope,
                  request: {
                      "method": "eth_getTransactionReceipt",
                      "params": [
                          transactionHash
                      ],
                  },
              },
          })

          if(!receipt) {
              return;
          }

          pendingTransaction.status = receipt.status
          const color = receipt.status === '0x1' ? 'green' : 'red'
          updateEdgeColor(fromScope, toScope, color)
          updateNodeBorderColor(isBridge ? fromScope : toScope, color)
          setTimeout(() => {
            updateEdgeColor(fromScope, toScope)
            updateNodeBorderColor(isBridge ? fromScope : toScope)
          }, FLASH_DURATION)
          if (isBridge) {
            setTimeout(() => {
              claimBridgedEth(pendingTransaction)
            }, FLASH_DURATION + 500)
          }
          console.log(`got tx receipt for tx hash ${transactionHash} on scope ${targetScope}`, receipt.status)
      } catch (error) {
          console.error(`failed getting tx receipt for tx hash ${transactionHash} on scope ${targetScope}`)
      }
  }))
}

async function updateTransactionStatuses() {
  if(!extensionPort) {
      return
  }
  if(!accounts.length || !scopeStrings.length) {
      return
  }

  const pendingTransactions = transactions.filter(transaction => !transaction.status)

  await Promise.allSettled(pendingTransactions.map(async pendingTransaction => {
      const {fromScope, toScope, type, transactionHash } = pendingTransaction

      const targetScope = type === 'bridge' ? fromScope : toScope

      console.log(`getting tx receipt for tx hash ${transactionHash} on scope ${targetScope}`)
      try {
          const receipt = await extensionPortRequest({
              method: "wallet_invokeMethod",
              params: {
                  scope: targetScope,
                  request: {
                      "method": "eth_getTransactionReceipt",
                      "params": [
                          transactionHash
                      ],
                  },
              },
          })

          if(!receipt) {
              return;
          }

          pendingTransaction.status = receipt.status
          const color = receipt.status === '0x1' ? 'green' : 'red'
          updateEdgeColor(fromScope, toScope, color)
          updateNodeBorderColor(isBridge ? fromScope : toScope, color)
          setTimeout(() => {
            updateEdgeColor(fromScope, toScope)
            updateNodeBorderColor(isBridge ? fromScope : toScope)
          }, FLASH_DURATION)
          if (isBridge) {
            setTimeout(() => {
              claimBridgedEth(pendingTransaction)
            }, FLASH_DURATION + 500)
          }
          console.log(`got tx receipt for tx hash ${transactionHash} on scope ${targetScope}`, receipt.status)
      } catch (error) {
          console.error(`failed getting tx receipt for tx hash ${transactionHash} on scope ${targetScope}`)
      }
  }))
}
async function updateTransactionStatusesPoll() {
  console.log("Polling: updating all tx statuses")
  await updateTransactionStatuses()
  setTimeout(() => {
      updateTransactionStatusesPoll()
  }, POLLING_RATE)
}

let isPolling;
async function startPolling() {
    if (!isPolling) {
        isPolling = true
        updateTransactionStatusesPoll()
        updateContractBalancesPoll()
        updateAccountBalancesPoll()
    }
}

// Flash an edge
// setTimeout(() => {
//     const randomLink = d3.select(link.nodes()[Math.floor(Math.random() * links.length)]);
//     const originalColor = randomLink.attr("stroke");
//     randomLink.attr("stroke", "green");
//     setTimeout(() => {
//         randomLink.attr("stroke", originalColor);
//     }, 3000);
// }, 5000);


// setTimeout(() => {
//     const randomLink = links[Math.floor(Math.random() * links.length)];
//     const linkSelection = d3.select(link.nodes()[links.indexOf(randomLink)]);
//     const sourceNode = nodes.find(node => node.id === randomLink.source.id);
//     const targetNode = nodes.find(node => node.id === randomLink.target.id);

//     const edgeLabel = svg.append("text")
//         .attr("x", (sourceNode.x + targetNode.x) / 2)
//         .attr("y", (sourceNode.y + targetNode.y) / 2)
//         .attr("dy", -5)
//         .attr("text-anchor", "middle")
//         .attr("fill", "green")
//         .text("sending...");

//     setTimeout(() => {
//         edgeLabel.remove();
//     }, 3000);
// }, 5000);
