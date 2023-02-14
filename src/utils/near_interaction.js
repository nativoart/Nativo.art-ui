import {
  keyStores,
  connect,
  WalletConnection,
  Contract,
  utils,Account,
  Near,
  KeyPair,
} from "near-api-js";

import axios from "axios";
import * as nearAPI from "near-api-js";
import { async } from "rxjs";

const {
	keyStores: { InMemoryKeyStore, BrowserLocalStorageKeyStore },
 	utils: {
		format: { parseNearAmount },
	},
} = nearAPI;
const fs = require("fs");
let keystorew;

export const storage_byte_cost = 10000000000000000000;
//export const contract_name = "nativo.near";
//export const contract_name = "dokxo.testnet";
export const contract_name =process.env.REACT_APP_CONTRACT;
export const config = {
  testnet: {
    networkId: "testnet",
    keyStore: new keyStores.BrowserLocalStorageKeyStore(),
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://wallet.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://explorer.testnet.near.org",
    isBrowser: new Function("try {return this===window;}catch(e){ return false;}")(),
  },

  mainnet: {
    networkId: "mainnet",
    keyStore: new keyStores.BrowserLocalStorageKeyStore(),
    nodeUrl: "https://rpc.mainnet.near.org",
    walletUrl: "https://wallet.near.org",
    helperUrl: "https://helper.mainnet.near.org",
    explorerUrl: "https://explorer.near.org",
    isBrowser: new Function("try {return this===window;}catch(e){ return false;}")(),
  },
};
let networkConfig= process.env.REACT_APP_NEAR_ENV === "mainnet" ? config.mainnet :config.testnet;
let networkId=networkConfig.networkId;
let nodeUrl=networkConfig.nodeUrl;
let walletUrl=networkConfig.walletUrl;
let contractId  = process.env.REACT_APP_KEYPOM;

let credentials, keyStore;

  
  if (networkConfig.isBrowser) {
    keyStore = new BrowserLocalStorageKeyStore();
    console.log("🪲 ~ file: near_interaction.js:59 ~ keyStore isBrowser", keyStore)
} else {
	/// nodejs (for tests)
  console.log("🪲 ~ file: near_interaction.js:62 ~ keyStore  noisBrowser", keyStore)
	try {
		//console.log(`Loading Credentials: ${process.env.HOME}/.near-credentials/${networkId}/${contractId}.json`);
		credentials = JSON.parse(
			fs.readFileSync(
				`${process.env.HOME}/.near-credentials/${networkId}/${contractId}.json`
			)
		);
	} catch(e) {
		console.warn(`Loading Credentials: ./neardev/${networkId}/${contractId}.json`);
		credentials = JSON.parse(
			fs.readFileSync(
				`./neardev/${networkId}/${contractId}.json`
			)
		);
	}
	keyStore = new InMemoryKeyStore();
	keyStore.setKey(
		networkId,
		contractId,
		KeyPair.fromString(credentials.private_key)
	);
	console.log("🪲 ~ file: near_interaction.js:84 ~ keyStore", keyStore)
}
 



//son los metodos que tenemos en el smart contract
export const methodOptions = {
  viewMethods: [
    "obtener_pagina_v5",
    "obtener_pagina_v5_auction",
    "get_token",
    "get_on_sale_toks",
    "get_on_auction_toksV2",
    "storage_byte_cost",
    "enum_get_token",
    "nft_token",
    "nft_total_supply",
    "nft_tokens_for_owner",
    "nft_supply_for_owner",
    "nft_tokens",
    "tokens_of",
    "obtener_pagina_v3_by_owner",
    "get_ids_onsale",
    "get_ids_onauction",
    "get_pagination_onsale",
    "get_pagination_onsale_filters_v2",
    "get_pagination_onauction",
    "obtener_pagina_on_sale_V2",
    "obtener_pagina_on_auction_V2",
    "obtener_pagina_by_owner",
    "obtener_pagina_by_creator",
    "get_pagination_creator_filters",
    "obtener_pagina_creator",
    "get_pagination_owner_filters",
    "obtener_pagina_owner",
     "nft_supply_for_creator",
     "nft_tokens_for_creator"
    
   
  ],
  changeMethods: [
    "update_token",
    "minar",
    "ofertar_subasta",
    "extraer_token",
    "nft_transfer_call",
    // "minar",
    "comprar_nft",
    "revender",
    "subastar_nft",
    "finalizar_subasta",
    "quitar_del_market_place",
    "get_by_on_sale",
    "market_mint_generic",
    "add_user_collection",
    "market_buy_generic",
    "market_remove_generic",
    "market_sell_generic",
    "market_bid_generic",
    "market_close_bid_generic",
    "nft_mint",
    "nft_transfer",
    "nft_approve",
    "nft_revoke"
  ],
};
/**
 *hacemos el signIn con near
 */
export async function nearSignIn(URL) {
  (process.env.REACT_APP_NEAR_ENV == "mainnet" ? window.near = await connect(config.mainnet) : window.near = await connect(config.testnet))
  //window.near = await connect(config.testnet);
  window.wallet = new WalletConnection(window.near, "latina");
  window.wallet.requestSignIn(
    contract_name, // contract requesting access
    "Latin-Art", // optional,
    URL, //EXITO
    URL // FRACASO
  );
}


const near = new Near({
	networkId,
	nodeUrl,
	walletUrl,
	deps: { keyStore },
});
export const { connection } = near;
export async function isNearReady() {
  // conectarse a near
  const near = (process.env.REACT_APP_NEAR_ENV == "mainnet" ? await connect(config.mainnet) : await connect(config.testnet))
  //const near = await connect(config.testnet);

  // crear una wallet
  const wallet = new WalletConnection(near);
  //esta logueado ?
  return wallet.isSignedIn();
}

/**
 * nos regresa una instancia del contrato
 */
export async function getNearContract() {
  // conectarse a near
  const near = (process.env.REACT_APP_NEAR_ENV == "mainnet" ? await connect(config.mainnet) :  await connect(config.testnet))
  //const near = await connect(config.testnet);

  // crear una wallet de
  const wallet = new WalletConnection(near);
  return new Contract(
    wallet.account(), // the account object that is connecting
    contract_name,
    {
      ...methodOptions,
      sender: wallet.account(), // account object to initialize and sign transactions.
    }
  );
}
/**
 * convierte de nears a yoctos
 *
 * */
export function fromNearToYocto(near) {
  //console.log(utils.format.parseNearAmount(near.toString()));
  return utils.format.parseNearAmount(near.toString());
}
/**
 *
 *
 * convierte de yocto a near
 */
export function fromYoctoToNear(yocto) {
  return utils.format.formatNearAmount(yocto.toString());
}
/**
 * con esta funcion obtenemos el accountid de la cartera
 * */
export async function getNearAccount() {
  // conectarse a near
  const near = (process.env.REACT_APP_NEAR_ENV == "mainnet" ? await connect(config.mainnet) : await connect(config.testnet))
  //const near = await connect(config.testnet);

  // crear una wallet de
  const wallet = new WalletConnection(near);

  return wallet.getAccountId();
}

export async function signOut() {
  // conectarse a near
  const near = (process.env.REACT_APP_NEAR_ENV == "mainnet" ? await connect(config.mainnet) : await connect(config.testnet))
  //const near = await connect(config.testnet);

  // crear una wallet de
  const wallet = new WalletConnection(near);
  wallet.signOut();
}

export async function ext_call(contract,method,args,gas,amount){
  // conectarse a near
  const near = (process.env.REACT_APP_NEAR_ENV == "mainnet" ? await connect(config.mainnet) : await connect(config.testnet))
  // crear una wallet de NEAR
  const wallet = new WalletConnection(near);
  //Realizar la ejecucion de la llamada
  const result = await wallet.account().functionCall(contract, method, args, gas, amount)
  console.log(result)
}

export async function ext_view(contract,method,args){
  // conectarse a near
  const near = (process.env.REACT_APP_NEAR_ENV == "mainnet" ? await connect(config.mainnet) : await connect(config.testnet))
  // crear una wallet de NEAR
  const wallet = new WalletConnection(near);
  //Realizar la ejecucion de la llamada
  const result = await wallet.account().viewFunction(contract,method,args)
  return result
}



export async function getNFTContractsByAccount(accountId) {
    const test = process.env.REACT_APP_NEAR_ENV === "mainnet" ? "" : "testnet-";
    const serviceUrl = `https://${test}api.kitwallet.app/account/${accountId}/likelyNFTs`;
    try {
      const result = await axios.get(serviceUrl);
      return result.data;
      } catch(e){
        console.log('err',e);
        return [];
      }
}

export async function getNFTByContract(contract_id, owner_account_id) {
  const near = (process.env.REACT_APP_NEAR_ENV == "mainnet" ? await connect(config.mainnet) : await connect(config.testnet))
  const wallet = new WalletConnection(near);
  try {
    const contract = new Contract(wallet.account(), contract_id, {
      viewMethods: ["nft_tokens_for_owner"],
      sender: wallet.account(),
    });

    const result = await contract.nft_tokens_for_owner({
      account_id: owner_account_id,
    });
    return result;
  } catch (err) {
    console.log("err", contract_id);
    return [];
  }
}

export async function getNFTById(nft_contract_id, nft_id,owner_account_id) {
  const near = (process.env.REACT_APP_NEAR_ENV == "mainnet" ? await connect(config.mainnet) : await connect(config.testnet))
  const wallet = new WalletConnection(near);
  const contract = new Contract(wallet.account(), nft_contract_id, {
    viewMethods: ["nft_token"],
    sender: wallet.account(),
  });

  const params = { token_id: nft_id, account_id: owner_account_id };

  try {
    let result = await contract.nft_token(params);

    return result;
  } catch (err) {
    console.log("err on getting ID on this contract", nft_contract_id);
    return [];
  }
}

export const view = (methodName, args) => {
	const account = new Account(connection, process.env.REACT_APP_NEAR_ENV == "mainnet" ? '.near' : '.testnet');
	return account.viewFunction( process.env.REACT_APP_KEYPOM,
     methodName, args)
}

export const call = (account, methodName, args, _gas) => {
 let contractId= process.env.REACT_APP_CONTRACT
	return account.functionCall({
		contractId,
		methodName,
		args,
		gas: _gas,
	})
}

export const getClaimAccount = async (secretKey) => {
	 
  const account = await connection.account(process.env.REACT_APP_KEYPOM);
  console.log("🪲 ~ file: near_interaction.js:337 ~ getClaimAccount ~ account", account)

  return;
// await account.addKey(
//   “8hSHprDq2StXwMtNd43wDTXQYsjXcD4MJTXQYsjXcc”, // public key for new account
//   “example-account.testnet”, // contract this key is allowed to call (optional)
//   “example_method”, // methods this key is allowed to call (optional)
//   “2500000000000” // allowance key can use to call methods (optional)
// );

 // const account = new nearAPI.Account(connection,  process.env.REACT_APP_KEYPOM);

	//const account = new Account(connection, process.env.REACT_APP_KEYPOM);
	 console.log("🪲 ~ file: near_interaction.js:333 ~ getClaimAccount ~ account", account)
	 
   keyStore.setKey(networkId,  process.env.REACT_APP_KEYPOM, KeyPair.fromString(secretKey))
   console.log("🪲 ~ file: near_interaction.js:336 ~ getClaimAccount ~ keyStore", keyStore)
	 
	return account
}