import React, {   useEffect, useState } from "react";
import { Link,useParams } from "react-router-dom";

import PropTypes from "prop-types";
import Swal from 'sweetalert2';
import { useWalletSelector } from "../utils/walletSelector";
import { useTranslation } from "react-i18next";
import {KeyPair}  from 'near-api-js';
import { view, call, getClaimAccount , connection } from '../utils/near_interaction'

import {initKeypom,getEnv,createDrop,getDrops,getDropSupply,execute,generateKeys,claim} from "keypom-js";


function ClaimDrop(props) {
  const { selector, modal, accounts, accountId } = useWalletSelector();
  const [t, i18n] = useTranslation("global");
  const [stateLogin, setStateLogin] = useState(false);
  const [drops, setdrops] = useState("");
  const [secret, setSecret] = useState();
	const [keyPair, setKeyPair] = useState({});
	const [drop, setDrop] = useState({});
  const [validdrop, setValiDrop] = useState(false);
  const [loading,setLoading] =useState(false);
	const [keyInfo, setKeyInfo] = useState({});
  const [DropInfo,setDropInfo] =useState({
    allowance:0,
    drop_id:"",
    key_id:0,
    last_used:0,
    pk:"",
    remaining_uses:0
  });

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
      
      setSecret(secretKey);
      const _keyPair = KeyPair.fromString(secretKey.secretKey);
      setKeyPair(_keyPair);
       
      let _drop, _keyInfo


      try {
        _drop = await view('get_drop_information', { key: _keyPair.publicKey.toString() })
        console.log("🪲 ~ file: giftClaim.component.js:56 ~ _drop", _drop)
        
        setDrop(_drop)
        
        _keyInfo = await view('get_key_information', { key: _keyPair.publicKey.toString() })
         console.log("🪲 ~ file: giftClaim.component.js:60 ~ _keyInfo", _keyInfo)
         
        setKeyInfo(_keyInfo)

        setTimeout((e)=>{
          setValiDrop(true);
          setLoading(true);}, 3000);
        
      
       
      } catch(e) {
        setLoading(true);
        console.log("🪲 ~ file: giftClaim.component.js:69 ~ e", e);
        console.warn(e);
        setDrop(null);
        window.location.href="/gift/claimed"
        return
      }
    })();
  }, []);

  
 
   const reloadview =()=>{
    setTimeout((e)=>{ window.location.href="/gift"}, 10000);
   }

 
  return (


    <>
    

    <section className="text-gray-600 body-font bg-White_gift lg:bg-White_gift h-[823px] lg:h-full bg-no-repeat bg-cover bg-top ">
      <div className="container mx-auto pt-4 flex px-5 lg:px-0 pb-10 flex-col items-center  lg:items-center  justify-center ">
      {loading ?   
       <div className=" h-[763px]  gap-2 bg-white shadown-lg rounded-lg border lg:h-full md:w-[500px] lg:w-[700px] md:flex-grow flex flex-col  items-center lg:items-center" >
          <img class="h-[150px] my-16 lg:h-[150px] bg-center w-[150px] lg:w-[150px] " src="/static/media/ntvToken.340716be.png" alt="/static/media/ntvToken.340716be.png"></img>
          <div className="w-full z-20 mt-6 lg:mt-[16px] ">
            <h6 className="dark:text-black text-lg  mx-auto lg:text-5xl md:text-2xl font-clash-grotesk font-semibold leading-9 tracking-wider text-center w-[323px] lg:w-[700px]">{t("Landing.giftclaim")}</h6>
          </div>
          <p className="mt-6 lg:mt-[23px] lg:text-1xl text-base dark:text-black z-20 font-open-sans font-semibold text-center leading-6 tracking-wider w-[253px] lg:w-[630px]">
          Drop: <a className={`font-light text-lg ${keyInfo?.key_info.remaining_uses >=1 ? "text-green-700":"text-red-400"}`}>{keyInfo?.drop_id}</a>
          </p>
 
          <div className="flex flex-col lg:flex-row justify-between z-20">
            <a href={"https://testnet.mynearwallet.com/linkdrop/v1.keypom.testnet/"+secret.secretKey} target="_blank" rel="noreferrer noopener">
              <button  onClick={reloadview} className="inline-flex rounded-xlarge animate-pulse lg:w-[267px] h-[50px]">
                <div className="flex flex-col font-bold h-full text-white  text-center  justify-center shadow-s w-full bg-yellow4 hover:scale-110 hover:bg-yellowHover active:bg-yellowPressed rounded-md">
                <svg className="fill-current w-[262px] h-[48px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>
                  <span className="title-font  text-white font-open-sans font-normal lg:font-semibold text-base p-5 uppercase leading-6">{t("Landing.claim")} </span>
                </div>
            </button>
            </a>
          </div>
          
          
        </div>:
        
        <div className="flex justify-center items-center mt-80 ">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
        <svg className="animate-spin h-3 w-3 rounded-full  bg-yellow4 " viewBox="0 0 24 24">
      </svg>
      <svg className="animate-spin h-4 w-4 rounded-full  bg-black " viewBox="0 0 24 24">
      </svg>
      <svg className="animate-spin h-2 w-2 rounded-full  bg-yellow4 " viewBox="0 0 24 24">
      </svg>
        </div>
        
        <span className="visually-hidden ml-5 font-extrabold text-lg uppercase ">{t("tokCollection.loading")}</span>
      </div>}
      </div>
    </section>

   
    </>
    
  );
}

ClaimDrop.defaultProps = {
  theme: "indigo",
};

ClaimDrop.propTypes = {
  theme: PropTypes.string.isRequired,
};

export default ClaimDrop;
