export const PositionStore = [
  {
    "inputs": [
      { "internalType": "contract RoleStore", "name": "rs", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "prevGov",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "nextGov",
        "type": "address"
      }
    ],
    "name": "SetGov",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "BPS_DIVIDER",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "CONTRACT",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_KEEPER_FEE_SHARE",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          { "internalType": "address", "name": "user", "type": "address" },
          { "internalType": "address", "name": "asset", "type": "address" },
          { "internalType": "string", "name": "market", "type": "string" },
          { "internalType": "bool", "name": "isLong", "type": "bool" },
          { "internalType": "uint256", "name": "size", "type": "uint256" },
          { "internalType": "uint256", "name": "margin", "type": "uint256" },
          {
            "internalType": "int256",
            "name": "fundingTracker",
            "type": "int256"
          },
          { "internalType": "uint256", "name": "price", "type": "uint256" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "internalType": "struct PositionStore.Position",
        "name": "position",
        "type": "tuple"
      }
    ],
    "name": "addOrUpdate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "asset", "type": "address" },
      { "internalType": "string", "name": "market", "type": "string" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "bool", "name": "isLong", "type": "bool" }
    ],
    "name": "decrementOI",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "asset", "type": "address" },
      { "internalType": "string", "name": "market", "type": "string" }
    ],
    "name": "getOI",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "asset", "type": "address" },
      { "internalType": "string", "name": "market", "type": "string" }
    ],
    "name": "getOILong",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "asset", "type": "address" },
      { "internalType": "string", "name": "market", "type": "string" }
    ],
    "name": "getOIShort",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "address", "name": "asset", "type": "address" },
      { "internalType": "string", "name": "market", "type": "string" }
    ],
    "name": "getPosition",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "user", "type": "address" },
          { "internalType": "address", "name": "asset", "type": "address" },
          { "internalType": "string", "name": "market", "type": "string" },
          { "internalType": "bool", "name": "isLong", "type": "bool" },
          { "internalType": "uint256", "name": "size", "type": "uint256" },
          { "internalType": "uint256", "name": "margin", "type": "uint256" },
          {
            "internalType": "int256",
            "name": "fundingTracker",
            "type": "int256"
          },
          { "internalType": "uint256", "name": "price", "type": "uint256" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "internalType": "struct PositionStore.Position",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPositionCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32[]", "name": "keys", "type": "bytes32[]" }
    ],
    "name": "getPositions",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "user", "type": "address" },
          { "internalType": "address", "name": "asset", "type": "address" },
          { "internalType": "string", "name": "market", "type": "string" },
          { "internalType": "bool", "name": "isLong", "type": "bool" },
          { "internalType": "uint256", "name": "size", "type": "uint256" },
          { "internalType": "uint256", "name": "margin", "type": "uint256" },
          {
            "internalType": "int256",
            "name": "fundingTracker",
            "type": "int256"
          },
          { "internalType": "uint256", "name": "price", "type": "uint256" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "internalType": "struct PositionStore.Position[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "length", "type": "uint256" },
      { "internalType": "uint256", "name": "offset", "type": "uint256" }
    ],
    "name": "getPositions",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "user", "type": "address" },
          { "internalType": "address", "name": "asset", "type": "address" },
          { "internalType": "string", "name": "market", "type": "string" },
          { "internalType": "bool", "name": "isLong", "type": "bool" },
          { "internalType": "uint256", "name": "size", "type": "uint256" },
          { "internalType": "uint256", "name": "margin", "type": "uint256" },
          {
            "internalType": "int256",
            "name": "fundingTracker",
            "type": "int256"
          },
          { "internalType": "uint256", "name": "price", "type": "uint256" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "internalType": "struct PositionStore.Position[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address[]", "name": "users", "type": "address[]" },
      { "internalType": "address[]", "name": "assets", "type": "address[]" },
      { "internalType": "string[]", "name": "markets", "type": "string[]" }
    ],
    "name": "getPositions",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "user", "type": "address" },
          { "internalType": "address", "name": "asset", "type": "address" },
          { "internalType": "string", "name": "market", "type": "string" },
          { "internalType": "bool", "name": "isLong", "type": "bool" },
          { "internalType": "uint256", "name": "size", "type": "uint256" },
          { "internalType": "uint256", "name": "margin", "type": "uint256" },
          {
            "internalType": "int256",
            "name": "fundingTracker",
            "type": "int256"
          },
          { "internalType": "uint256", "name": "price", "type": "uint256" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "internalType": "struct PositionStore.Position[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "getUserPositions",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "user", "type": "address" },
          { "internalType": "address", "name": "asset", "type": "address" },
          { "internalType": "string", "name": "market", "type": "string" },
          { "internalType": "bool", "name": "isLong", "type": "bool" },
          { "internalType": "uint256", "name": "size", "type": "uint256" },
          { "internalType": "uint256", "name": "margin", "type": "uint256" },
          {
            "internalType": "int256",
            "name": "fundingTracker",
            "type": "int256"
          },
          { "internalType": "uint256", "name": "price", "type": "uint256" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "internalType": "struct PositionStore.Position[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "gov",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "asset", "type": "address" },
      { "internalType": "string", "name": "market", "type": "string" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "bool", "name": "isLong", "type": "bool" }
    ],
    "name": "incrementOI",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "keeperFeeShare",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "address", "name": "asset", "type": "address" },
      { "internalType": "string", "name": "market", "type": "string" }
    ],
    "name": "remove",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "removeMarginBuffer",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "roleStore",
    "outputs": [
      { "internalType": "contract RoleStore", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_gov", "type": "address" }
    ],
    "name": "setGov",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "bps", "type": "uint256" }],
    "name": "setKeeperFeeShare",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "bps", "type": "uint256" }],
    "name": "setRemoveMarginBuffer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]
