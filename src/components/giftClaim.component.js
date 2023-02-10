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
	const [keyPair, setKeyPair] = useState({});
	const [drop, setDrop] = useState({});
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
      console.log("🪲 ~ file: giftClaim.component.js:32 ~ secretKey", secretKey)
      setSecret(secretKey);
      const _keyPair = KeyPair.fromString(secretKey.secretKey);
      setKeyPair(_keyPair);
      console.log("🪲 ~ file: giftClaim.component.js:51 ~ _keyPair", _keyPair)
      let _drop, _keyInfo


      try {
        _drop = await view('get_drop_information', { key: _keyPair.publicKey.toString() })
        console.log("🪲 ~ file: giftClaim.component.js:48 ~ _drop", _drop)
        setDrop(_drop)
        
        _keyInfo = await view('get_key_information', { key: _keyPair.publicKey.toString() })
        console.log("🪲 ~ file: giftClaim.component.js:52 ~ _keyInfo", _keyInfo)
        setKeyInfo(_keyInfo)
        
       
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
     let secretKey = "ed25519:4nr8zMibRvgKS8E1BgXdZNspmrf8REU3ShkUAwbMois48Tywriytrus3JhoJG8sySRX9hr4LHJW49Dr9ML3VqBHQ";
     //let secretKey = window.localStorage.getItem(WalledinfLogged.secretKeyVar).toString();
   
    // console.log("same: ",window.localStorage.getItem(WalledinfLogged.secretKeyVar).toString())
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

  const claimDrop = async () => {
  
    // try {
 
 
       
        console.log("🪲 ~ file: giftClaim.component.js:146 ~ claimDrop ~ keyPair", keyPair)
        const account = await getClaimAccount(keyPair.secretKey)


    // let res=  await claim({
    //     secretKey: keyInfo.pk,
    //     accountId: accountId,
    // })
    // console.log("🪲 ~ file: giftClaim.component.js:148 ~ claimDrop ~ res", res)

        // const res = await call(process.env.REACT_APP_KEYPOM, 'claim', { account_id: accountId } , '300000000000000')
        // console.log("🪲 ~ file: giftClaim.component.js:156 ~ claimDrop ~ res", res)
      // if (res?.status?.SuccessValue !== '') {
      //   console.log("🪲 ~ file: giftClaim.component.js:142 ~ claimDrop ~ res", res)
        
      //   // window.location.reload()
      //   // window.location.href = window.location.href
      //   return
      // }
      //poms()
      // set(CLAIMED, true)
      // setClaimed(true)
    // } catch (e) {
    //   window.location.reload()
    //   window.location.href = window.location.href
    //   return
    // } finally {
    //   // update('app.loading', false)
    // }
  }
  return (
    <section className="text-gray-600 body-font bg-White_gift lg:bg-White_gift h-[823px] lg:h-[594px] bg-no-repeat bg-cover bg-top ">
      <div className="container mx-auto pt-4 flex px-5 lg:px-0 pb-10 flex-col items-center  lg:items-center  justify-center ">
        <div className=" h-[763px] bg-white rounded-lg lg:h-[564px] lg:w-[700px] lg:flex-grow flex flex-col md:text-center items-center lg:items-center" >
          <img class="h-[150px] mt-6 lg:h-[150px] bg-center w-[150px] lg:w-[150px] " src="/static/media/ntvToken.340716be.png" alt="/static/media/ntvToken.340716be.png"></img>
{keyInfo?.drop_id ?
          <div className="z-20 mt-6 lg:mt-[16px] gap-4 ">
          <h1 className="font-bold text-lg text-white bg-slate-300 rounded-lg">Drop: <a className={`font-light text-lg ${keyInfo?.remaining_uses > keyInfo?.last_used ? "text-green-700":"text-red-400"}`}>{keyInfo?.drop_id}</a></h1>
            
         <div className="flex flex-row my-4">
           <h2 className="font-extrabold text-lg">Status:</h2>
              <div> {keyInfo?.remaining_uses > keyInfo?.last_used ? 
                <p className="w-40 rounded-lg bg-green-700  text-white text-lg font-bold">{"Available"}</p>
              :<p className="w-40 rounded-lg bg-red-700  text-white text-lg font-bold">{"Not Available"}</p>}</div>
         </div>
          <div className="w-full my-6 ">
                <button className={` w-full rounded-lg font-extrabold text-xl text-white hover:scale-110  ${keyInfo?.remaining_uses > keyInfo?.last_used ? "bg-green-700" : "bg-slate-600"}`}
                onClick={claimDrop}> Claim</button>
          </div>
            {/* <p className="dark:text-black text-[16px] lg:text-2xl md:text-2xl font-clash-grotesk font-semibold leading-9 tracking-wider text-center w-[323px] lg:w-[590px]">{t("Landing.giftclaim")}</p> */}
          </div>:   <div >LOADING DROP...</div>}
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
