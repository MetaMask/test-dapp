import * as d3 from "d3";

//
// Constants
//
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
const NODE_PADDING = 20;
const NODE_SCALE = 1.3;
const NODE_TEXT_START = "-2.4em";
const NODE_TEXT_SPACING = "1.2em";

const USE_SUBSCRIPTIONS = true; // use false for polling
// subscriptions
const SUBSCRIPTION_STAGGER = 10000;
const SUBSCRIPTION_DEBOUNCE = 2000;
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
            updateNode(newScopeString, "black")
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

function getNodeLabelText(scopeString) {
    const {name, contractAddress} = BridgeableScopes[scopeString];
    const accountsText = accounts.map(account => {
        const balance = balances[scopeString]?.[account] || 0
        return `${account.slice(0,7)}...${account.slice(37,42)}: ${balance.toFixed(4)} ETH`
    }).join('\n')

    const contractBalance = balances[scopeString]?.[contractAddress] || 0
    return`${name}\nBridge Contract: ${contractBalance.toFixed(4)} ETH\n--------------------------\n${accountsText}`
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
    .force("collide", d3.forceCollide().radius(d => getRadius(d.label) * NODE_SCALE + NODE_PADDING + 40)); // Further increased radius

let link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("stroke-width", 2)
    .attr("stroke", "#999")
    .on("click", function(event, d) {
        const sourceNode = nodes.find(node => node.id === d.source.id);
        const targetNode = nodes.find(node => node.id === d.target.id);
        showModal(`Source: ${sourceNode.label}\nTarget: ${targetNode.label}`);
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
    .attr("r", d => getRadius(d.label) * NODE_SCALE + NODE_PADDING)
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
    .attr("stroke-width", 2)
    .attr("stroke", "#999")
    .on("click", function(event, d) {
        const sourceNode = nodes.find(node => node.id === d.source.id);
        const targetNode = nodes.find(node => node.id === d.target.id);
        showModal(`Source: ${sourceNode.label}\nTarget: ${targetNode.label}`);
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
        .attr("r", d => getRadius(d.label) * NODE_SCALE + NODE_PADDING)
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
    return Math.max(20, Math.sqrt(maxWidth * maxWidth + textHeight * textHeight) / 2 + 10); // Ensure a minimum radius of 20
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

function showModal(content) {
    modalText.textContent = content;
    modal.style.display = "block";
}


function generateBlockExplorerAddressLink(blockExplorerUrl, address, label) {
  return `<a href="${blockExplorerUrl}/address/${address}" target="_blank">${label || address}</a>`
}

function showNodeModal(id) {
    const {name, contractAddress, supports, blockExplorerUrl} = BridgeableScopes[id]
    modalText.innerHTML = `
        <h1>${name}</h1>
        <p><a href="${blockExplorerUrl}" target="_blank">Block Explorer</a></p>
        <p><b>Bridge Contract:</b> ${generateBlockExplorerAddressLink(blockExplorerUrl, contractAddress)} (${(balances[id]?.[contractAddress] || 0).toFixed(4)} ETH)</p>
        <p><b>Bridgeable Scopes:</b> ${supports.map(scopeString => BridgeableScopes[scopeString].name).join(', ')}</p>
        <hr>
        <b>Accounts:</b>
        <br>
        <ul>
        ${accounts.map(account => {
            const balance = balances[id]?.[account] || 0
            return `<li>${generateBlockExplorerAddressLink(blockExplorerUrl, account)} (${balance.toFixed(4)} ETH)</li>`
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
    //     .attr("r", d => getRadius(d.label) * NODE_SCALE + NODE_PADDING)
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

function updateNode(id, color) {
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
    node.select("circle").attr("r", d => getRadius(d.label) * NODE_SCALE + NODE_PADDING);

    if (color) {
        const targetNodeCircle = d3.select(node.nodes()[nodes.indexOf(targetNode)]).select("circle");
        targetNodeCircle.attr("stroke", color).attr("stroke-width", 3);
        setTimeout(() => {
            targetNodeCircle.attr("stroke", null).attr("stroke-width", null);
        }, 2000);
    }
    // Restart simulation to adjust positions
    simulation.alpha(1).restart();
}

// DOM
document.getElementById("connectExtensionButton").addEventListener("click", connectExtension);
document.getElementById("connectButton").addEventListener("click", connectWallet);


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

  console.log(`Subscription: updating account balances and contract balance for scope ${scopeString}`)
  await updateAccountBalancesForScope(scopeString)
  await updateContractBalanceForScope(scopeString)

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
              updateNode(scopeString, !oldBalance || balances[scopeString][account] > oldBalance ? "green" : "red")
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
                    updateNode(scopeString, !oldBalance || balances[scopeString][account] > oldBalance ? "green" : "red")
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
          updateNode(scopeString)
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
                updateNode(scopeString)
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

let isPolling;
async function startPolling() {
    if (!isPolling) {
        isPolling = true
        updateAccountBalancesPoll()
        updateContractBalancesPoll()
    }
}
