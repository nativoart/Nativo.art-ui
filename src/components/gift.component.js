import React, {   useEffect, useState } from "react";
 
import PropTypes from "prop-types";
 
import { useWalletSelector } from "../utils/walletSelector";
import { useTranslation } from "react-i18next";
 
import {initKeypom,getEnv,createDrop,getDrops,getDropSupply,execute,generateKeys} from "keypom-js";
import Swal from 'sweetalert2'
const {
	Near,
	KeyPair,
	utils: { format: {
		parseNearAmount
	} },
	keyStores: { InMemoryKeyStore },
} = require("near-api-js");
const keyPairs = {
	simple: [],
	ft: [],
	nft: [],
	fc: [],
}

function LightHeroE(props) {
  const { selector, modal, accounts, accountId } = useWalletSelector();

  const [t, i18n] = useTranslation("global");
  const [stateLogin, setStateLogin] = useState(false);
  const [WalledinfLogged, setWalledinfLogged] = useState(null);
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
     
     
      console.log("🪲🪲🪲🪲🪲🪲🪲🪲🪲🪲🪲🪲🪲🪲🪲🪲🪲");

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
    
      console.log("same: ",window.localStorage.getItem(WalledinfLogged.secretKeyVar).toString())
        await initKeypom({
          // near,
          network:process.env.REACT_APP_NEAR_ENV,
          funder: {
            accountId,
            secretKey,
          }
        })
      
        const { fundingAccount: keypomFundingAccount } = getEnv()
        fundingAccount = keypomFundingAccount
      
        console.log('fundingAccount', keypomFundingAccount)
        return fundingAccount;
    }
   
  }

  const createSimple = async () => {
   await init()
   console.log("entreo despues del return")
   if( WalledinfLogged!==null) {
    try {
      
      const dropId =Date.now().toString()
	    let NFTData ={
        //* * The account ID that the NFT contract is deployed to. This contract is where all the NFTs for the specific drop must come from. */
        contractId: process.env.REACT_APP_CONTRACT,
        //* * By default, anyone can fund your drop with NFTs. This field allows you to set a specific account ID that will be locked into sending the NFTs. */
        senderId: accountId,
        /* * 
         * If there are any token IDs that you wish to be automatically sent to the Keypom contract in order to register keys as part of `createDrop`, specify them here.
         * A maximum of 2 token IDs can be sent as part of the transaction. If you wish to register more keys by sending more NFTs, you must do this in a separate call by invoking
         * the `nftTransferCall` method separately.
         */
        tokenIds: ["148","149"],
      }
      const res = await createDrop({
		    dropId,
        numKeys: 4,
		    depositPerUseNEAR: 0.02,
        NFTData,
	    })

      
	    const { responses } = res
	    console.log("🪲 ~ file: gift.component.js:121 ~ createSimple ~ res", res)
	    const resWithDropId = responses.find((res) => Buffer.from(res.status.SuccessValue, 'base64').toString())
      console.log(responses)
      
    } catch (e) {
      console.warn(e)
      throw e
    }
    //window.location.reload()
  }
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
	// console.log(responses)
	const resWithDropId = responses.find((res) => Buffer.from(res.status.SuccessValue, 'base64').toString());
	console.log("🪲 ~ file: gift.component.js:220 ~ CreateNFTDrop ~ resWithDropId", resWithDropId);

	// t.is(Buffer.from(resWithDropId.status.SuccessValue, 'base64').toString().replaceAll('"', ''), dropId);
	// console.log("🪲 ~ file: gift.component.js:221 ~ CreateNFTDrop ~ t", t);


}
  return (
    <section className="text-gray-600 body-font bg-White_gift lg:bg-White_gift h-[823px] lg:h-[594px] bg-no-repeat bg-cover bg-top ">
      <div className="container mx-auto pt-4 flex px-5 lg:px-0 pb-10 flex-col items-center  lg:items-center  justify-center ">
        <div className=" h-[763px] bg-white rounded-lg lg:h-[564px] g:w-[700px] lg:flex-grow flex flex-col md:text-center items-center lg:items-center" >
          <img class="h-[150px] mt-16 lg:h-[150px] bg-center w-[150px] lg:w-[150px] " src="/static/media/ntvToken.340716be.png" alt="/static/media/ntvToken.340716be.png"></img>
          <div className="w-full z-20 mt-6 lg:mt-[16px] ">
            <h6 className="dark:text-black text-[42px]  lg:text-5xl md:text-2xl font-clash-grotesk font-semibold leading-9 tracking-wider text-center w-[323px] lg:w-[700px]">{t("Landing.gift")}</h6>
          </div>
          <p className="mt-6 lg:mt-[23px] lg:text-1xl text-base dark:text-black z-20 font-open-sans font-semibold text-center leading-6 tracking-wider w-[253px] lg:w-[630px]">
            {t("Landing.giftsub")}
          </p>
          <p className="mt-[1px] lg:mt-[1px] lg:text-1xl text-base dark:text-black z-20 font-open-sans font-semibold text-center leading-6 tracking-wider w-[313px] lg:w-[630px]">
            {t("Landing.giftsub2")}
          </p>
          <div className="flex flex-col lg:flex-row justify-between z-20">
            <a href="https://forms.gle/wL2Qm7YPJhTt9vZt8">
              <button className="flex inline-flex rounded-xlarge w-full lg:w-[267px] h-[50px]">
                <div className="flex flex-col font-bold h-full text-white  text-center  justify-center shadow-s w-full bg-yellow4 hover:bg-yellowHover active:bg-yellowPressed rounded-md">
                <svg className="fill-current w-[242px] h-[48px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>
                  <span className="title-font  text-white font-open-sans font-normal lg:font-semibold text-base p-5 uppercase leading-6">{t("Landing.generate")} </span>
                </div>
            </button>
            </a>
          </div>
          <div className="flex flex-col lg:flex-row justify-between z-20">
            <a>
              <button className="inline-flex   rounded-xlarge w-full lg:w-[267px] h-[50px]" onClick={CreateNFTDrop}>
                <div className="flex flex-col font-bold h-full text-white  text-center  justify-center shadow-s w-full bg-yellow4 hover:bg-yellowHover active:bg-yellowPressed rounded-md">
                <svg className="fill-current w-[242px] h-[48px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>
                  <span className="title-font  text-white font-open-sans font-normal lg:font-semibold text-base p-5 uppercase leading-6">{t("Landing.generate")} </span>
                </div>
            </button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

LightHeroE.defaultProps = {
  theme: "indigo",
};

LightHeroE.propTypes = {
  theme: PropTypes.string.isRequired,
};

export default LightHeroE;
