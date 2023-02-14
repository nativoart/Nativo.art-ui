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
        setLoading(false);
        console.log("🪲 ~ file: giftClaim.component.js:69 ~ e", e);
        console.warn(e);
        setDrop(null);
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

  
 

  const claimDrop = async () => {
  
     
        console.log("🪲 ~ file: giftClaim.component.js:158 ~ claimDrop ~ secret", secret)

   //window.location.href="https://testnet.mynearwallet.com/linkdrop/v1.keypom.testnet/"+secret.secretKey;
   window.location.assign("https://testnet.mynearwallet.com/linkdrop/v1.keypom.testnet/"+secret.secretKey)
       
  }
  return (
    <section className="text-gray-600 body-font bg-White_gift lg:bg-White_gift h-[823px] lg:h-[594px] bg-no-repeat bg-cover bg-top ">
      <div className="container mx-auto pt-4 flex px-5 lg:px-0 pb-10 flex-col items-center  lg:items-center  justify-center ">
        {loading ?   
        <div className=" h-[763px] bg-white rounded-lg lg:h-[564px] lg:w-[700px] lg:flex-grow flex flex-col md:text-center items-center lg:items-center" >
          <img class="h-[150px] mt-6 lg:h-[150px] bg-center w-[150px] lg:w-[150px] " src="/static/media/ntvToken.340716be.png" alt="/static/media/ntvToken.340716be.png"></img>

{validdrop ?
          <div className="z-20 mt-6 lg:mt-[16px] gap-4 ">
          <h1 className="font-bold text-lg text-white bg-slate-300 rounded-lg">Drop: <a className={`font-light text-lg ${keyInfo?.key_info.remaining_uses >=1 ? "text-green-700":"text-red-400"}`}>{keyInfo?.drop_id}</a></h1>
 
         <div className="flex flex-row my-4">
           <h2 className="font-extrabold text-lg">Status:</h2>
              <div> {keyInfo?.key_info.remaining_uses >=1 ? 
                <p className="w-40 rounded-lg bg-green-700  text-white text-lg font-bold">{"Available"}</p>
              :<p className="w-40 rounded-lg bg-red-700  text-white text-lg font-bold">{"Not Available"}</p>}</div>
         </div>
          <div className="w-full my-6 ">
                
                <a href={"https://testnet.mynearwallet.com/linkdrop/v1.keypom.testnet/"+secret.secretKey} target="_blank" rel="noreferrer noopener"
                 >
                <button className={` w-full rounded-lg font-extrabold text-xl text-white hover:scale-110  ${keyInfo?.key_info.remaining_uses >= 1 ? "bg-green-700" : "bg-slate-600"}`} > Claim</button>
                   </a>
          </div>
            {/* <p className="dark:text-black text-[16px] lg:text-2xl md:text-2xl font-clash-grotesk font-semibold leading-9 tracking-wider text-center w-[323px] lg:w-[590px]">{t("Landing.giftclaim")}</p> */}
          </div>:   
           <div className="z-20 mt-6 lg:mt-[16px] gap-4 ">
          <h1 className="font-bold text-lg text-white bg-slate-300 rounded-lg">Drop: <a className={`font-light text-lg text-red-400`}>Linkdrop Invalid</a></h1>
 
         <div className="flex flex-row my-4">
           <h2 className="font-extrabold text-lg">Status:</h2>
              <div>  
                
              <p className="w-40 rounded-lg bg-red-700  text-white text-lg font-bold">{"Not Available"}</p></div>
         </div>
        
         <div className="flex flex-row my-4 rounded-lg mx-2">
           <h2 className="font-extrabold text-xl  bg-red-700  text-white ">This drop is invalid or has been claimed:</h2>
             
         </div>
            {/* <p className="dark:text-black text-[16px] lg:text-2xl md:text-2xl font-clash-grotesk font-semibold leading-9 tracking-wider text-center w-[323px] lg:w-[590px]">{t("Landing.giftclaim")}</p> */}
          </div>}
          
          </div>:
         <div class="flex justify-center items-center">
         <div class="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
           <span class="visually-hidden">Loading...</span>
         </div>
       </div>}
      </div>
    </section>
  );
}

ClaimDrop.defaultProps = {
  theme: "indigo",
};

ClaimDrop.propTypes = {
  theme: PropTypes.string.isRequired,
};

export default ClaimDrop;
