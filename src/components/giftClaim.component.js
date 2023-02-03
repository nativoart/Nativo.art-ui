import React, {   useEffect, useState } from "react";
import { Link,useParams } from "react-router-dom";

import PropTypes from "prop-types";
import Swal from 'sweetalert2';
import { useWalletSelector } from "../utils/walletSelector";
import { useTranslation } from "react-i18next";
import {KeyPair}  from 'near-api-js';
import { view, call, getClaimAccount } from '../utils/near_interaction'

import {initKeypom,getEnv,createDrop,getDrops,getDropSupply,execute,generateKeys,claim} from "keypom-js";


function LightHeroE(props) {
  const { selector, modal, accounts, accountId } = useWalletSelector();
  const [t, i18n] = useTranslation("global");
  const [stateLogin, setStateLogin] = useState(false);
  const [drops, setdrops] = useState("");
  const [secret, setSecret] = useState();
	const [keyPair, setKeyPair] = useState({})
	const [drop, setDrop] = useState({})
	const [keyInfo, setKeyInfo] = useState({})

  const [WalledinfLogged, setWalledinfLogged] = useState(null);
	const  secretKey  = useParams()

  let   fundingAccount;
  const wallets=[
    {name:"near-wallet",active:true,secretKeyVar:`near-api-js:keystore:${accountId}:${process.env.REACT_APP_NEAR_ENV}`},
    {name:"my-near-wallet",active:true,secretKeyVar:`near-api-js:keystore:${accountId}:${process.env.REACT_APP_NEAR_ENV}`},
    {name:"meteor-wallet",active:false,secretKeyVar:`_meteor_wallet${accountId}:${process.env.REACT_APP_NEAR_ENV}`},
    {name:"here-wallet",active:true,secretKeyVar:"hola4"},
    {name:"math-wallet",active:false,secretKeyVar:"undefined"},
    {name:"nightly",active:false,secretKeyVar:"undefined"}];
  useEffect(() => {
    (async () => {
      setStateLogin(accountId !=null ? true : false);
      console.log("🪲 ~ file: giftClaim.component.js:32 ~ accountId", secretKey)
      setSecret(secretKey);
      const _keyPair = KeyPair.fromString(secretKey.secretKey);
      setKeyPair(_keyPair);
      console.log("🪲 ~ file: giftClaim.component.js:51 ~ _keyPair", _keyPair)
      let _drop, _keyInfo


      try {
        _drop = await view('get_drop_information', { key: _keyPair.publicKey.toString() })
        setDrop(_drop)
        console.log(_drop)
        _keyInfo = await view('get_key_information', { key: _keyPair.publicKey.toString() })
        setKeyInfo(_keyInfo)
        console.log(_keyInfo)
      } catch(e) {
        console.warn(e)
        setDrop(null)
        return
      }
      // init();
      // let claim= await claimDrop(accountId);
      // console.log("🪲 ~ file: giftClaim.component.js:30 ~ claim", claim);
      // let resdrops = await getDrops({
      //   accountId
      // });

      // setdrops(resdrops);
      // console.log("🪲 ~ file: giftClaim.component.js:37 ~ resdrops", resdrops)


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
//let secretKey = "ed25519:4nr8zMibRvgKS8E1BgXdZNspmrf8REU3ShkUAwbMois48Tywriytrus3JhoJG8sySRX9hr4LHJW49Dr9ML3VqBHQ";
      //let secretKey = window.localStorage.getItem(WalledinfLogged.secretKeyVar).toString();
    
     // console.log("same: ",window.localStorage.getItem(WalledinfLogged.secretKeyVar).toString())
        await initKeypom({
          // near,
          network:process.env.REACT_APP_NEAR_ENV,
          funder: {
            accountId,
          //  secretKey,
          }
        })
      
        const { fundingAccount: keypomFundingAccount } = getEnv()
        fundingAccount = keypomFundingAccount
      
        console.log('fundingAccount', keypomFundingAccount)
        return fundingAccount;
    }
   
  }

  const claimDrop = async (_accountId) => {
   let secretKey="5GneH3AWE5ufcDfjpzSFyhP7399YBSc2A2V4efSpj3HDek3TbnTPHswBShRe7anGoxsJko2P3NAy5NDFskxcxRXm"
   return await claim({
       	secretKey: secretKey,
       	accountId: _accountId,

       });
    
  }
  return (
    <section className="text-gray-600 body-font bg-White_gift lg:bg-White_gift h-[823px] lg:h-[594px] bg-no-repeat bg-cover bg-top ">
      <div className="container mx-auto pt-4 flex px-5 lg:px-0 pb-10 flex-col items-center  lg:items-center  justify-center ">
        <div className=" h-[763px] bg-white rounded-lg lg:h-[564px] lg:w-[700px] lg:flex-grow flex flex-col md:text-center items-center lg:items-center" >
          <img class="h-[150px] mt-6 lg:h-[150px] bg-center w-[150px] lg:w-[150px] " src="/static/media/ntvToken.340716be.png" alt="/static/media/ntvToken.340716be.png"></img>
        <div className="z-20 mt-6 lg:mt-[16px] ">
          <h1>Drop</h1>
          
            {/* <p className="dark:text-black text-[16px] lg:text-2xl md:text-2xl font-clash-grotesk font-semibold leading-9 tracking-wider text-center w-[323px] lg:w-[590px]">{t("Landing.giftclaim")}</p> */}
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
