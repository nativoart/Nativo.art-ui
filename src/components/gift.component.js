import React, {   useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useWalletSelector } from "../utils/walletSelector";
import { useTranslation } from "react-i18next";
import {initKeypom,createDrop,getEnv,getDrops,getDropSupply,execute,generateKeys} from "keypom-js";
import { view, call, getClaimAccount,ext_call ,fromNearToYocto, connection,_near } from '../utils/near_interaction'
import { estimateRequiredDeposit, ATTACHED_GAS_FROM_WALLET } from '../utils/keypom-utils'

import Swal from 'sweetalert2';
import { nftDrop, NFT_CONTRACT_ID, NFT_METADATA } from '../utils/nft';
import { generateSeedPhrase } from 'near-seed-phrase';

import { set, file ,get } from '../utils/store';

const { KeyPair, keyStores, connect } = require("near-api-js");
const { parseNearAmount, formatNearAmount } = require("near-api-js/lib/utils/format");
const keyPairs = {
	simple: [],
	ft: [],
	nft: [],
	fc: [],
}
export const ROOT_KEY = '__ROOT_KEY'
function CreateDrops(props) {
  const { selector, modal, accounts, accountId } = useWalletSelector();
  const [t, i18n] = useTranslation("global");
  const [stateLogin, setStateLogin] = useState(false);
  const [WalledinfLogged, setWalledinfLogged] = useState(null);
  const [dropId, setDropId] = useState(0);
  const [createDropInfo, setCreateDropInfo] = useState("");
  const [updatephrase, setUpdatephrase] = useState();
  const [NFT_Form, setNFT_Form] = useState({
    NFT_CONTRACT_ID:"nft.examples.testnet",
    tokenId:"Keypom1-1675451681359",
    DEPOSIT_PER_USE:"200000000000000000000000",

  });

  const contractId =process.env.REACT_APP_KEYPOM; 
  const hashBuf = (str) => crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))

  const genKey = async (rootKey, meta, nonce) => {
    const hash = await hashBuf(`${rootKey}_${meta}_${nonce}`)
    const { secretKey } = generateSeedPhrase(hash)
    return KeyPair.fromString(secretKey)
  }
  let drops, fundingAccount;

  /**
   * *Array to store the wallet names and it props
   * @param name:wallet name
   * @param active: if the wallet is active to create a drop
   * @param secretKeyVar: the access name to the localstorage variable that store the secret key
 
   */
  const wallets=[
    {name:"near-wallet",active:true,secretKeyVar:`near-api-js:keystore:${accountId}:${process.env.REACT_APP_NEAR_ENV}`},
    {name:"my-near-wallet",active:true,secretKeyVar:`near-api-js:keystore:${accountId}:${process.env.REACT_APP_NEAR_ENV}`},
    {name:"meteor-wallet",active:false,secretKeyVar:`_meteor_wallet${accountId}:${process.env.REACT_APP_NEAR_ENV}`},
    {name:"here-wallet",active:true,secretKeyVar:"hola4"},
    {name:"math-wallet",active:false,secretKeyVar:"undefined"},
    {name:"nightly",active:false,secretKeyVar:"undefined"}];
  useEffect(() => {
    (async () => {
      // *get the wallet name
      let walletselected = window.localStorage.getItem("near-wallet-selector:selectedWalletId");
      //* is logged?
      if(walletselected!== null) {
        //* find the wallet cennected info
        let walletRecovered =wallets.find(wallet => `"${wallet.name}"`=== walletselected);
        console.log("🪲 ~ file: gift.component.js:24 ~ walletselected",  walletRecovered);
        //* save the wallet info 
        setWalledinfLogged(walletRecovered);
        setStateLogin(accountId !=null ? true : false);
      }
     
     
      console.log("🪲🪲🪲🪲🪲🪲🪲🪲🪲🪲🪲🪲🪲🪲🪲🪲🪲",connection);

      


    })();
  }, []);

  const handleSignIn = () =>{
    modal.show()
  }

  const init = async() =>{
    
    //* Validate if the wallet works with keypom
    if(false /*!WalledinfLogged?.active*/){

      Swal.fire({
        background: '#0a0a0a',
        width: '800',
        html:
          '<div class="">' +
          '<div class="font-open-sans  text-base font-extrabold text-white mb-4 text-left uppercase">' +  t("Keypom-create.WalletError") + '</div>' +
          '<div class="font-open-sans  text-sm text-white text-left">' + t("Keypom-create.WalletError-des") + '</div>' +
          '</div>',
        confirmButtonText: t("Alerts.continue"),
        buttonsStyling: false,
        customClass: {
          confirmButton: 'font-open-sans uppercase text-base  font-extrabold  text-white  text-center bg-yellow2 rounded-md bg-yellow2 px-3 py-[10px] mx-2',
        },
        confirmButtonColor: '#f79336',
        position: window.innerWidth < 1024 ? 'bottom' : 'center'
      }).then((result) => {
        if (result.isConfirmed) {
         return;
        }
      });      
    }else{

    //* recover the secrect key at the localstorage
       let secretKey = "ed25519:4nr8zMibRvgKS8E1BgXdZNspmrf8REU3ShkUAwbMois48Tywriytrus3JhoJG8sySRX9hr4LHJW49Dr9ML3VqBHQ";
      //let secretKey = window.localStorage.getItem(WalledinfLogged.secretKeyVar).toString();
    
     // console.log("same: ",window.localStorage.getItem(WalledinfLogged.secretKeyVar).toString())
        let inted =await initKeypom({
          connection,
          network:process.env.REACT_APP_NEAR_ENV,
          funder: {
            accountId,
            secretKey,
          },
          keypomContractId:process.env.REACT_APP_KEYPOM
        })
        console.log("🪲 ~ file: gift.component.js:110 ~ init ~ inted", inted)
      

        const { fundingAccount: keypomFundingAccount } = getEnv()
        fundingAccount = keypomFundingAccount
      
        console.log('fundingAccount', keypomFundingAccount)
        return fundingAccount;
    }
   
  }

  const simpleDropNear=async ()=>{
    // Initiate connection to the NEAR blockchain.
    const dropId = Date.now().toString()
    const publicKeys = []
    const amount = fromNearToYocto("0.4");
    const gas=300000000000000;
    const methodName="create_drop";
    const tokenId="Keypom2-1675451681359"
    const contract =process.env.REACT_APP_KEYPOM;
		const keys = await generateKeys({
			numKeys: 1,
			rootEntropy: 'some secret entropy' + Date.now(),
			metaEntropy: `${dropId}_0`
		});

    
    const payload={
      "public_keys": [keys.publicKeys[0]],
      "deposit_per_use": "300000000000000000000000",
      "config": {
        "uses_per_key": 1,
        "delete_on_empty": true,
        "auto_withdraw": true,
        "start_timestamp": null,
        "throttle_timestamp": null,
        "on_claim_refund_deposit": null,
        "claim_permission": null,
        "drop_root": null
      },
      "metadata":  dropId.toString(),
      "nft_data": {
        "contract_id": "nft.examples.testnet",
        "sender_id": accountId,
      }
    };
		console.log("🪲 ~ file: gift.component.js:132 ~ simpleDropNear ~ keys", keys)
		
	 
		// keyPairs.nft.push(keys.keyPairs[0])
		// publicKeys.push(keys.publicKeys[0]);
   
  //  let  create_drop = await ext_call(contract,methodName, payload, gas, amount);
  //   console.log("🪲 ~ file: gift.component.js:160 ~ simpleDropNear ~ create_drop", create_drop)

   
  const nextDropId = await view("get_next_drop_id" );
  console.log("🪲 ~ file: gift.component.js:166 ~ simpleDropNear ~ nextDropId", nextDropId)

  
  let requiredDeposit =  parseNearAmount("1.0405");
  console.log("El dani estuvo aqui")
  const wallet = await selector.wallet();
  const res = await wallet.signAndSendTransactions({
    transactions: [{
      receiverId: contract,
      actions: [{
        type: 'FunctionCall',
        params: {
          methodName: methodName,
          args: {
            public_keys: [keys.publicKeys[0]],
            deposit_per_use: fromNearToYocto("1"),
            config: {
              "uses_per_key": 1,
              "delete_on_empty": true,
              "auto_withdraw": true,
              "start_timestamp": null,
              "throttle_timestamp": null,
              "on_claim_refund_deposit": null,
              "claim_permission": null,
              "drop_root": null
            },
            metadata: JSON.stringify(dropId),
            nft_data:  {
              "contract_id": "nft.examples.testnet",
              "sender_id": accountId,
            },
          },
          gas: '250000000000000',
          deposit: requiredDeposit,
        }
      }]
    }, 
    {
      receiverId: NFT_CONTRACT_ID,
      actions: [{
        type: 'FunctionCall',
        params: {
          methodName: 'nft_transfer_call',
          args: {
            receiver_id: contract,
            token_id: tokenId,
            msg: nextDropId.toString(),
          },
          gas: '50000000000000',
          deposit: '1',
        }
      }]
    }
  ]
  })

  //   const wallet = await selector.wallet();
  //  let result = await wallet.signAndSendTransaction({
  //         signerId: accountId,
  //         receiverId: contract,
  //         actions: [
  //           {
  //             type: "FunctionCall",
  //             params: {
  //               methodName:methodName,
  //               args: payload,
  //               gas: 300000000000000,
  //               deposit:amount,
  //             }
  //           }
  //         ],
  //        // callbackUrl:  window.location.protocol + "//" + window.location.host+'/detail/'+props.tokenID+'?action=updateprice'

  //       })
  //  console.log("🪲 ~ file: gift.component.js:184 ~ simpleDropNear ~ result", result)
  }
  


  let nftTokenIds = []
 
  const NFT_METADATA = {
    title: "Keypom FTW!",
    description: "Keypom is lit fam!",
    media: "https://bafkreidsht2pxoytl3d4zdnpsjmxedtk7dhuef2vmr3muz7si3vlthbcr4.ipfs.nftstorage.link",
}
  // *'create nft drop and add 1 key'
const CreateNFTDrop = async (t) => {
  let fundingAccount =await init();
  console.log("🪲 ~ file: gift.component.js:172 ~ CreateNFTDrop ~ fundingAccount", fundingAccount)
 
	/// Auto minting 2 NFTs for testing

	let tokenId1 = `Keypom1-${Date.now()}`;
	let tokenId2 = `Keypom2-${Date.now()}`;
	const action1 = {
		type: 'FunctionCall',
		params: {
			methodName: 'nft_mint',
			args: {
				receiver_id: accountId,
				metadata: NFT_METADATA,
				token_id: tokenId1,
			},
			gas: '100000000000000',
			deposit: parseNearAmount('0.1')
		}
	}
	const action2 = JSON.parse(JSON.stringify(action1))
	action2.params.args.token_id = tokenId2
	nftTokenIds.push(tokenId1, tokenId2)

	const nftRes = await execute({
		fundingAccount,
		transactions: [{
			receiverId: NFT_CONTRACT_ID,
			actions: [action1, action2]
		}]
	})
	console.log("🪲 ~ file: gift.component.js:206 ~ CreateNFTDrop ~ nftRes", nftRes)
 
  const dropId = Date.now().toString()

	const publicKeys = []
	for (var i = 0; i < 1; i++) {
		const keys = await generateKeys({
			numKeys: 1,
			rootEntropy: 'some secret entropy' + Date.now(),
			metaEntropy: `${dropId}_${i}`
		})
		console.log("🪲 ~ file: gift.component.js:217 ~ CreateNFTDrop ~ keys", keys);
		
		keyPairs.nft.push(keys.keyPairs[0])
		publicKeys.push(keys.publicKeys[0]);
	}
  
 
	const res = await createDrop({
    dropId,
		depositPerUseNEAR: 0.02,
		publicKeys,
		nftData: {
			contractId: NFT_CONTRACT_ID,
			senderId: accountId,
			/// if you're passing keys, what NFT tokens to auto send to Keypom so keys can claim them?
			tokenIds: nftTokenIds.slice(0, 1),
		}
	})


	const { responses } = res;
	console.log("🪲 ~ file: gift.component.js:217 ~ CreateNFTDrop ~ responses", responses);

  setCreateDropInfo(res);
	// console.log(responses)
	// const resWithDropId = responses.find((res) => Buffer.from(res.status.SuccessValue, 'base64').toString());
	// console.log("🪲 ~ file: gift.component.js:220 ~ CreateNFTDrop ~ resWithDropId", resWithDropId);

	// t.is(Buffer.from(resWithDropId.status.SuccessValue, 'base64').toString().replaceAll('"', ''), dropId);
	// console.log("🪲 ~ file: gift.component.js:221 ~ CreateNFTDrop ~ t", t);


}



const createNFTDrop = async (values) => {
  const wallet = await selector.wallet();
  const NUM_KEYS = parseInt("1".toString())
  const DROP_METADATA = Date.now().toString() // unique identifier for keys

  const {
    DROP_CONFIG,
    STORAGE_REQUIRED,
    NFT_DATA,
  } = nftDrop;
  console.log("🪲 ~ file: gift.component.js:365 ~ createNFTDrop ~ nftDrop", nftDrop)

  NFT_DATA.sender_id = accountId
  console.log("🪲 ~ file: gift.component.js:367 ~ createNFTDrop ~ NFT_DATA", NFT_DATA)

  return;
  //!this was hardcoded probably may cause a fail //parseNearAmount("1.0405");
   let requiredDeposit = await estimateRequiredDeposit({
    _near,
    depositPerUse: NFT_Form.DEPOSIT_PER_USE,
    numKeys: NUM_KEYS,
    usesPerKey: DROP_CONFIG.uses_per_key,
    attachedGas: ATTACHED_GAS_FROM_WALLET,
    storage: STORAGE_REQUIRED,
  })
    console.log("🪲 ~ file: gift.component.js:380 ~ createNFTDrop ~ near", _near)
  //console.log("🪲 ~ file: gift.component.js:372 ~ createNFTDrop ~ requiredDeposit", requiredDeposit)


  // console.log(formatNearAmount(requiredDeposit))

  let keyPairs = [], pubKeys = [];
  for (var i = 0; i < NUM_KEYS; i++) {
    const keyPair = await genKey(get(ROOT_KEY), DROP_METADATA, i)
    keyPairs.push(keyPair)
    pubKeys.push(keyPair.publicKey.toString());
  }

  /// redirect with mynearwallet
  const nextDropId = await view("get_next_drop_id" );

  // return console.log(nextDropId, tokenId)

  return;
  const res = wallet.signAndSendTransactions({
    transactions: [{
      receiverId: 'v1.keypom.testnet',
      actions: [{
        type: 'FunctionCall',
        params: {
          methodName: 'create_drop',
          args: {
            public_keys: pubKeys,
            deposit_per_use: NFT_Form.DEPOSIT_PER_USE,
            config: DROP_CONFIG,
            metadata: JSON.stringify(DROP_METADATA),
            nft_data: NFT_DATA,
          },
          gas: '250000000000000',
          deposit: requiredDeposit,
        }
      }]
    }, {
      receiverId: NFT_CONTRACT_ID,
      actions: [{
        type: 'FunctionCall',
        params: {
          methodName: 'nft_transfer_call',
          args: {
            receiver_id: contractId,
            token_id: NFT_Form.tokenId,
            msg: nextDropId.toString(),
          },
          gas: '50000000000000',
          deposit: '1',
        }
      }]
    }]
  })
}

  return (
    <section className="text-gray-600 body-font bg-White_gift lg:bg-White_gift h-[823px] lg:h-full bg-no-repeat bg-cover bg-top ">
      <div className="container mx-auto pt-4 flex px-5 lg:px-0 pb-10 flex-col items-center  lg:items-center  justify-center ">
        <div className=" h-[763px] drop-shadow-2xl gap-2 bg-white shadown-lg rounded-lg border lg:h-full md:w-[500px] lg:w-[700px] md:flex-grow flex flex-col md:text-center items-center lg:items-center" >
          <img class="h-[150px] my-16 lg:h-[150px] bg-center w-[150px] lg:w-[150px] " src="/static/media/ntvToken.340716be.png" alt="/static/media/ntvToken.340716be.png"></img>
          <div className="w-full z-20 mt-6 lg:mt-[16px] ">
            <h6 className="dark:text-black text-lg mx-auto  lg:text-5xl md:text-2xl font-clash-grotesk font-semibold leading-9 tracking-wider text-center w-[323px] lg:w-[700px]">{t("Landing.gift")}</h6>
          </div>
          <p className="mt-6 lg:mt-[23px] lg:text-1xl text-base dark:text-black z-20 font-open-sans font-semibold text-center leading-6 tracking-wider w-[253px] lg:w-[630px]">
            {t("Landing.giftsub")}
          </p>
          <p className="mt-[1px] lg:mt-[1px] lg:text-1xl text-base dark:text-black z-20 font-open-sans font-semibold text-center leading-6 tracking-wider w-[313px] lg:w-[630px]">
            {t("Landing.giftsub2")}
          </p>
          <div className="flex flex-col lg:pb-16 lg:flex-row justify-between z-20">
            <a href="https://forms.gle/wL2Qm7YPJhTt9vZt8">
              <button className="  inline-flex rounded-xlarge w-full lg:w-[267px] h-[50px]">
                <div className="flex flex-col font-bold h-full text-white  text-center  justify-center shadow-s w-full bg-yellow4 hover:bg-yellowHover active:bg-yellowPressed rounded-md">
                <svg className="fill-current w-[242px] h-[48px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>
                  <span className="title-font  text-white font-open-sans font-normal lg:font-semibold text-base p-5 uppercase leading-6">{t("Landing.generate")} </span>
                </div>
            </button>
            </a>

            <button onClick={createNFTDrop}>click me plase</button>
          </div>
          
          
        </div>
      </div>
    </section>
  );
}

CreateDrops.defaultProps = {
  theme: "indigo",
};

CreateDrops.propTypes = {
  theme: PropTypes.string.isRequired,
};

export default CreateDrops;
