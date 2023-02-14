import React, {   useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useWalletSelector } from "../utils/walletSelector";
import { useTranslation } from "react-i18next";
import {initKeypom,createDrop,getEnv,getDrops,getDropSupply,execute,generateKeys} from "keypom-js";
import { view, call, getClaimAccount , connection } from '../utils/near_interaction'

import Swal from 'sweetalert2';
const { KeyPair, keyStores, connect } = require("near-api-js");
const { parseNearAmount, formatNearAmount } = require("near-api-js/lib/utils/format");
const keyPairs = {
	simple: [],
	ft: [],
	nft: [],
	fc: [],
}
function CreateDrops(props) {
  const { selector, modal, accounts, accountId } = useWalletSelector();
  const [t, i18n] = useTranslation("global");
  const [stateLogin, setStateLogin] = useState(false);
  const [WalledinfLogged, setWalledinfLogged] = useState(null);
  const [dropId, setDropId] = useState(0);
  const [createDropInfo, setCreateDropInfo] = useState("");

  
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

      await  simpleDropNear();


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
    const network = "testnet"
 
    
    let keyStore =" new keyStores.UnencryptedFileSystemKeyStore(credentialsPath)";
  
    let nearConfig = {
        networkId: network,
        keyStore: keyStore,
        nodeUrl: `https://rpc.${network}.near.org`,
        walletUrl: `https://wallet.${network}.near.org`,
        helperUrl: `https://helper.${network}.near.org`,
        explorerUrl: `https://explorer.${network}.near.org`,
    };
  
    // let near = await connect(nearConfig);
    // const fundingAccount = await near.account('keypom-docs-demo.testnet');
  
    // Keep track of an array of the key pairs we create and the public keys we pass into the contract
    let keyPairs = [];
    let pubKeys = [];
    // Generate keypairs and store them into the arrays defined above
    let keyPair = await KeyPair.fromRandom('ed25519:B2sDsMn5RMP6N75PDb3GT3nho8E8Qd6y8EqYJhk9Wd1M');
    keyPairs.push(keyPair);   
    pubKeys.push(keyPair.publicKey.toString());   
  
    // Create drop with pub keys, deposit_per_use
    // Note that the user is responsible for error checking when using NEAR-API-JS
    // The SDK automatically does error checking; ensuring valid configurations, enough attached deposit, drop existence etc.
    try {
      await fundingAccount.functionCall(
        'v1-3.keypom.testnet', 
        'create_drop', 
        {
          public_keys: pubKeys,
          deposit_per_use: parseNearAmount('1'),
        }, 
        "300000000000000",
        // Generous attached deposit of 1.5 $NEAR
        parseNearAmount("1.5")
      );
    } catch(e) {
      console.log('error creating drop: ', e);
    }
    var dropInfo = {};
    const KEYPOM_CONTRACT = "v1-3.keypom.testnet"
        // Creating list of pk's and linkdrops; copied from orignal simple-create.js
        for(var i = 0; i < keyPairs.length; i++) {
        let linkdropUrl = `https://wallet.testnet.near.org/linkdrop/${KEYPOM_CONTRACT}/${keyPair.secretKey[i]}`;
        dropInfo[pubKeys[i]] = linkdropUrl;
    }
    // Write file of all pk's and their respective linkdrops
    console.log('Public Keys and Linkdrops: ', dropInfo)
    console.log(`Keypom Contract Explorer Link: explorer.${network}.near.org/accounts/${KEYPOM_CONTRACT}.com`)
  }
  


  let nftTokenIds = []
  const NFT_CONTRACT_ID = "nft.examples.testnet";
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
  return (
    <section className="text-gray-600 body-font bg-White_gift lg:bg-White_gift h-[823px] lg:h-full bg-no-repeat bg-cover bg-top ">
      <div className="container mx-auto pt-4 flex px-5 lg:px-0 pb-10 flex-col items-center  lg:items-center  justify-center ">
        <div className=" h-[763px] gap-2 bg-white rounded-lg lg:h-full g:w-[700px] lg:flex-grow flex flex-col md:text-center items-center lg:items-center" >
          <img class="h-[150px] my-16 lg:h-[150px] bg-center w-[150px] lg:w-[150px] " src="/static/media/ntvToken.340716be.png" alt="/static/media/ntvToken.340716be.png"></img>
          <div className="w-full z-20 mt-6 lg:mt-[16px] ">
            <h6 className="dark:text-black text-[42px]  lg:text-5xl md:text-2xl font-clash-grotesk font-semibold leading-9 tracking-wider text-center w-[323px] lg:w-[700px]">{t("Landing.gift")}</h6>
          </div>
          <p className="mt-6 lg:mt-[23px] lg:text-1xl text-base dark:text-black z-20 font-open-sans font-semibold text-center leading-6 tracking-wider w-[253px] lg:w-[630px]">
            {t("Landing.giftsub")}
          </p>
          <p className="mt-[1px] lg:mt-[1px] lg:text-1xl text-base dark:text-black z-20 font-open-sans font-semibold text-center leading-6 tracking-wider w-[313px] lg:w-[630px]">
            {t("Landing.giftsub2")}
          </p>
          {/* <div className="flex flex-col lg:flex-row justify-between z-20">
            <a href="https://forms.gle/wL2Qm7YPJhTt9vZt8">
              <button className="flex inline-flex rounded-xlarge w-full lg:w-[267px] h-[50px]">
                <div className="flex flex-col font-bold h-full text-white  text-center  justify-center shadow-s w-full bg-yellow4 hover:bg-yellowHover active:bg-yellowPressed rounded-md">
                <svg className="fill-current w-[242px] h-[48px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>
                  <span className="title-font  text-white font-open-sans font-normal lg:font-semibold text-base p-5 uppercase leading-6">{t("Landing.generate")} </span>
                </div>
            </button>
            </a>
          </div>
          <div className="flex flex-row justify-between z-20">
            <a>
              <button className="inline-flex   rounded-xlarge w-full lg:w-[267px] h-[50px]" onClick={CreateNFTDrop}>
                <div className="flex flex-col font-bold h-full text-white  text-center  justify-center shadow-s w-full bg-yellow4 hover:bg-yellowHover active:bg-yellowPressed rounded-md">
                <svg className="fill-current w-[242px] h-[48px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>
                  <span className="title-font  text-white font-open-sans font-normal lg:font-semibold text-base p-5 uppercase leading-6">{t("Landing.generate")} </span>
                </div>
            </button>
            </a>
            <textarea className="w-full rounded h-16 border border-black" value={createDropInfo ? createDropInfo?.toString() : ""} ></textarea>
            <label>{createDropInfo?.keyPairs?.toString()}</label>
          </div> */}
          <div className="flex flex-col lg:flex-row justify-between z-20 gap-4">
            <input onChange={(e)=>{setDropId(e.target.value)}} className="w-1/2 border border-black  rounded-lg"/>
            <a  className="w-1/2" target="_blank" rel="noopener noreferrer" href= {`/gift/claim/${dropId}`} >
              <button className="inline-flex   rounded-xlarge w-full lg:  h-[50px]" >
                <div className="flex flex-col font-bold h-full text-white  text-center  justify-center shadow-s w-full bg-yellow4 hover:bg-yellowHover active:bg-yellowPressed rounded-md">
                 
                  <span className="title-font  text-white font-open-sans font-normal lg:font-semibold text-base p-5 uppercase leading-6">{t("Keypom-create.ClaimByID")} </span>
                </div>
            </button>
            </a>
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
