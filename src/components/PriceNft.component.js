import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useWalletSelector } from "../utils/walletSelector";
import Swal from 'sweetalert2'
import { avatarClasses } from "@mui/material";
import PriceModal from "./priceModal.component"
import PutOnSaleModal from "./putOnSaleModal.component"
import nearImage from '../assets/img/landing/trendingSection/Vector.png';
import { fromNearToYocto } from "../utils/near_interaction";

function PriceNft(props) {
  const [t, i18n] = useTranslation("global");
  const { selector, modal, accounts, accountId } = useWalletSelector();
  const [myNFT, setMyNFT] = useState();
  const [priceModal, setPriceModal] = useState({
    show: false
  });
  const [putOnSaleModal, setPutOnSaleModal] = useState({
    show: false
  });
  const [state, setState] = useState(props);
  let [enabled, setEnabled] = useState(true);

  async function makeChangePrice(tokenID) {
    setPriceModal({
      ...props,
      show: true,
      message: t("MyNFTs.modalPriMsg"),
      loading: false,
      disabled: false,
      tokenID: tokenID,
      change: setPriceModal,
      buttonName: 'X',
      tokenId: 'hardcoded'
    })
  }

  async function putOnSale(tokenID) {
    setPutOnSaleModal({
      ...props,
      show: true,
      loading: false,
      disabled: false,
      tokenID: tokenID,
      change: setPutOnSaleModal,
      buttonName: 'X',
      tokenId: 'hardcoded'
    })
  }

  /**
   * Función que cambia a "no disponible" un token nft que esta a la venta siempre que se sea el owner
   * @param tokenId representa el token id del nft a quitar del marketplace
   * @return void
   */

  async function removeSale(tokenID) {
    let payload = {
      token_id: tokenID,
      account_id: process.env.REACT_APP_CONTRACT_MARKET
    }
    const wallet = await selector.wallet();
    Swal.fire({
      background: '#0a0a0a',
      width: '800',
      html:
        '<div class="">' +
        '<div class="font-open-sans  text-base font-extrabold text-white mb-4 text-left uppercase">' +  t("Alerts.removeSaleTit") + '</div>' +
        '<div class="font-open-sans  text-sm text-white text-left">' + t("Alerts.removeSaleMsg") + '</div>' +
        '</div>',
      confirmButtonText: t("Alerts.continue"),
      buttonsStyling: false,
      customClass: {
        confirmButton: 'font-open-sans uppercase text-base  font-extrabold  text-white  text-center bg-yellow2 rounded-md bg-yellow2 px-3 py-[10px] mx-2',
      },
      confirmButtonColor: '#f79336',
      position: window.innerWidth < 1024 ? 'bottom' : 'center'
    }).then(async (result) => {
      if (result.isConfirmed) {}
      wallet.signAndSendTransaction({
        signerId: accountId,
        receiverId: process.env.REACT_APP_CONTRACT,
        actions: [
          {
            type: "FunctionCall",
            params: {
              methodName: "nft_revoke",
              args: payload,
              gas: 300000000000000,
              deposit: 1,
            }
          }
        ]
      }).then(() => {
        
      })
      .catch((err) => {
        console.log("error: ", err);
      });

    })
    
  }

  async function buyToken() {
    //evitar doble compra
    setEnabled(false)
    let account, toks;
    if (localStorage.getItem("blockchain") == "0") {
      return
    } else {
      console.log("props.price", props.price)
      let amount = parseFloat(props.price.replace(',', ''));
      console.log("amount", amount)

      //instanciar contracto
      let payload = {
        nft_contract_id: process.env.REACT_APP_CONTRACT,
        token_id: props.tokenID
      }
      // let toks = await ext_call(process.env.REACT_APP_CONTRACT_MARKET,"offer",payload,300000000000000,fromNearToYocto(amount))
      const wallet = await selector.wallet();
      
      wallet.signAndSendTransaction({
        signerId: accountId,
        receiverId: process.env.REACT_APP_CONTRACT_MARKET,
        actions: [
          {
            type: "FunctionCall",
            params: {
              methodName: "offer",
              args: payload,
              gas: 300000000000000,
              deposit: fromNearToYocto(amount),
            }
          }
        ]
      }).then(() => {
        setEnabled(true)
      }).catch((err) => {
        console.log("error: ", err);
      });
    }
  }

  React.useEffect(() => {
      console.log('accountId',accountId)
      console.log('props.owner',props)
      console.log('props.owner',props.owner)
      if(accountId == props.owner){
        setMyNFT(true);
      } else {
        setMyNFT(false);
      }
  }, [props]);

  const handleSignIn = () =>{
    console.log('PRICE');
  }

  
  
  

  return (
    <section className="w-full">
      {console.log('props',props)}
      {console.log('this token is on sale?',props.sale)}
      {props.sale ? <>{myNFT ?
        <>
          {/*on sale and its my NFT*/}
          <div className="w-full flex items-center">
            <div className="w-1/3 flex items-center">
              <div className="">
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.1713 2.87062L17.5275 11.25C17.4471 11.3707 17.4132 11.5164 17.4319 11.6602C17.4506 11.8039 17.5208 11.9361 17.6294 12.0321C17.738 12.1282 17.8778 12.1816 18.0228 12.1826C18.1678 12.1836 18.3082 12.1321 18.4181 12.0375L23.9738 7.21875C24.0063 7.18962 24.0466 7.1706 24.0898 7.16401C24.133 7.15742 24.1772 7.16355 24.217 7.18164C24.2567 7.19973 24.2904 7.22901 24.3138 7.2659C24.3372 7.30279 24.3493 7.34569 24.3488 7.38938V22.4756C24.3487 22.5218 24.3345 22.5669 24.308 22.6047C24.2815 22.6425 24.244 22.6713 24.2006 22.687C24.1572 22.7028 24.1099 22.7048 24.0653 22.6928C24.0207 22.6808 23.9809 22.6554 23.9513 22.62L7.15875 2.51813C6.88865 2.19918 6.55232 1.94288 6.17316 1.76706C5.79399 1.59124 5.38108 1.50011 4.96313 1.5H4.37625C3.61342 1.5 2.88184 1.80303 2.34243 2.34243C1.80303 2.88184 1.5 3.61342 1.5 4.37625V25.6238C1.5 26.3866 1.80303 27.1182 2.34243 27.6576C2.88184 28.197 3.61342 28.5 4.37625 28.5C4.86809 28.5001 5.35176 28.3742 5.7811 28.1343C6.21045 27.8943 6.57113 27.5484 6.82875 27.1294L12.4725 18.75C12.5529 18.6293 12.5868 18.4836 12.5681 18.3398C12.5494 18.1961 12.4792 18.0639 12.3706 17.9679C12.262 17.8718 12.1222 17.8184 11.9772 17.8174C11.8322 17.8164 11.6918 17.868 11.5819 17.9625L6.02625 22.7813C5.99369 22.8104 5.95336 22.8294 5.91017 22.836C5.86698 22.8426 5.82281 22.8365 5.78305 22.8184C5.74328 22.8003 5.70965 22.771 5.68624 22.7341C5.66284 22.6972 5.65068 22.6543 5.65125 22.6106V7.52063C5.65127 7.47444 5.6655 7.42938 5.69201 7.39156C5.71852 7.35374 5.75603 7.32499 5.79944 7.30923C5.84285 7.29346 5.89006 7.29143 5.93466 7.30343C5.97927 7.31542 6.0191 7.34084 6.04875 7.37625L22.8394 27.4819C23.1095 27.8008 23.4458 28.0571 23.825 28.2329C24.2041 28.4088 24.6171 28.4999 25.035 28.5H25.6219C25.9997 28.5002 26.374 28.426 26.7231 28.2816C27.0723 28.1372 27.3896 27.9253 27.6569 27.6582C27.9242 27.3911 28.1362 27.074 28.2809 26.7249C28.4255 26.3758 28.5 26.0016 28.5 25.6238V4.37625C28.5 3.61342 28.197 2.88184 27.6576 2.34243C27.1182 1.80303 26.3866 1.5 25.6238 1.5C25.1319 1.49987 24.6482 1.62579 24.2189 1.86573C23.7896 2.10568 23.4289 2.45165 23.1713 2.87062Z" fill="#0A0A0A" />
                </svg>
              </div>
              <div className="font-bold text-3xl ml-4">
                {props.price} NEAR
              </div>
            </div>
            <div className="w-2/3 flex items-center justify-end ">
              <button className="flex  rounded-xlarge w-1/2 h-[50px]  mt-0 mx-2" onClick={() => { makeChangePrice(props.tokenID) }} >
                <div className="flex flex-col font-bold h-full text-white  text-center  justify-center shadow-s w-full bg-yellow4 hover:bg-yellowHover active:bg-yellowPressed rounded-md">
                  <span className="title-font  text-white font-open-sans font-normal lg:font-semibold text-base p-5 uppercase leading-6">{t("Detail.changePrice")}</span>
                </div>
              </button>
              <button className="flex  rounded-xlarge w-1/2 h-[50px]  mt-0 mx-2" onClick={()=> {removeSale(props.tokenID)}} >
                  <div className="flex flex-col font-bold h-full text-[#0a0a0a]  text-center  justify-center shadow-s w-full border-solid border-2 rounded-md border-[#0a0a0a] hover:bg-[#0a0a0a] active:bg-outlinePressed ">
                    <span className="title-font  text-[#0a0a0a] font-open-sans font-normal lg:font-semibold text-base p-5 uppercase leading-6 flex justify-center hover:text-white active:text-textOutlinePressed  "> {t("MyNFTs.remove")}</span>
                  </div>
                </button>
            </div>
          </div>
        </> :
        <>
        {/*on sale and its NOT my NFT*/}
        <div className="w-1/2 flex items-center">
          <div className="">
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.1713 2.87062L17.5275 11.25C17.4471 11.3707 17.4132 11.5164 17.4319 11.6602C17.4506 11.8039 17.5208 11.9361 17.6294 12.0321C17.738 12.1282 17.8778 12.1816 18.0228 12.1826C18.1678 12.1836 18.3082 12.1321 18.4181 12.0375L23.9738 7.21875C24.0063 7.18962 24.0466 7.1706 24.0898 7.16401C24.133 7.15742 24.1772 7.16355 24.217 7.18164C24.2567 7.19973 24.2904 7.22901 24.3138 7.2659C24.3372 7.30279 24.3493 7.34569 24.3488 7.38938V22.4756C24.3487 22.5218 24.3345 22.5669 24.308 22.6047C24.2815 22.6425 24.244 22.6713 24.2006 22.687C24.1572 22.7028 24.1099 22.7048 24.0653 22.6928C24.0207 22.6808 23.9809 22.6554 23.9513 22.62L7.15875 2.51813C6.88865 2.19918 6.55232 1.94288 6.17316 1.76706C5.79399 1.59124 5.38108 1.50011 4.96313 1.5H4.37625C3.61342 1.5 2.88184 1.80303 2.34243 2.34243C1.80303 2.88184 1.5 3.61342 1.5 4.37625V25.6238C1.5 26.3866 1.80303 27.1182 2.34243 27.6576C2.88184 28.197 3.61342 28.5 4.37625 28.5C4.86809 28.5001 5.35176 28.3742 5.7811 28.1343C6.21045 27.8943 6.57113 27.5484 6.82875 27.1294L12.4725 18.75C12.5529 18.6293 12.5868 18.4836 12.5681 18.3398C12.5494 18.1961 12.4792 18.0639 12.3706 17.9679C12.262 17.8718 12.1222 17.8184 11.9772 17.8174C11.8322 17.8164 11.6918 17.868 11.5819 17.9625L6.02625 22.7813C5.99369 22.8104 5.95336 22.8294 5.91017 22.836C5.86698 22.8426 5.82281 22.8365 5.78305 22.8184C5.74328 22.8003 5.70965 22.771 5.68624 22.7341C5.66284 22.6972 5.65068 22.6543 5.65125 22.6106V7.52063C5.65127 7.47444 5.6655 7.42938 5.69201 7.39156C5.71852 7.35374 5.75603 7.32499 5.79944 7.30923C5.84285 7.29346 5.89006 7.29143 5.93466 7.30343C5.97927 7.31542 6.0191 7.34084 6.04875 7.37625L22.8394 27.4819C23.1095 27.8008 23.4458 28.0571 23.825 28.2329C24.2041 28.4088 24.6171 28.4999 25.035 28.5H25.6219C25.9997 28.5002 26.374 28.426 26.7231 28.2816C27.0723 28.1372 27.3896 27.9253 27.6569 27.6582C27.9242 27.3911 28.1362 27.074 28.2809 26.7249C28.4255 26.3758 28.5 26.0016 28.5 25.6238V4.37625C28.5 3.61342 28.197 2.88184 27.6576 2.34243C27.1182 1.80303 26.3866 1.5 25.6238 1.5C25.1319 1.49987 24.6482 1.62579 24.2189 1.86573C23.7896 2.10568 23.4289 2.45165 23.1713 2.87062Z" fill="#0A0A0A" />
            </svg>
          </div>
          <div className="font-bold text-3xl ml-4">
            {props.price} NEAR
          </div>
        </div>
          <div className="w-full flex mt-3">
            <button className="flex  rounded-xlarge w-1/2  h-[50px] lg:mr-2  mt-0 " onClick={() => { buyToken() }} disabled={!enabled}>
              <div className="flex flex-col font-bold h-full text-white  text-center  justify-center shadow-s w-full bg-yellow4 hover:bg-yellowHover active:bg-yellowPressed rounded-md">
                <span className="title-font  text-white font-open-sans font-normal lg:font-semibold text-base p-5 uppercase leading-6">{t("Detail.buy")}</span>
              </div>
            </button>
            <button className="flex  rounded-xlarge w-1/2 h-[50px]  mt-0  " onClick={handleSignIn} >
              <div className="flex flex-col font-bold h-full text-[#0a0a0a]  text-center  justify-center shadow-s w-full border-solid border-2 rounded-md border-[#0a0a0a] hover:bg-outlineHover active:bg-outlinePressed ">
                <span className="title-font  text-[#0a0a0a] font-open-sans font-normal lg:font-semibold text-base p-5 uppercase leading-6 flex justify-center hover:text-textOutlineHover active:text-textOutlinePressed  "> {t("Detail.modalMakeBid")}</span>
              </div>
            </button>
          </div>
        </>}</> :
        <>
          {myNFT ? <>
             {/*not on sale and its my NFT*/}
            <div className="w-full flex justify-end ">
              <button className="flex  rounded-xlarge w-full  h-[50px]  mt-0 " onClick={() => { putOnSale(props.tokenID) }} >
                <div className="flex flex-col font-bold h-full text-white  text-center  justify-center shadow-s w-full bg-yellow4 hover:bg-yellowHover active:bg-yellowPressed rounded-md">
                  <span className="title-font  text-white font-open-sans font-normal lg:font-semibold text-base p-5 uppercase leading-6">{t("Detail.putOnSale")}</span>
                </div>
              </button>
            </div></> : <>
            {/*NOT on sale and its NOT my NFT*/}
              <div className="w-full flex justify-end ">
                <button className="flex  rounded-xlarge w-full h-[50px]  mt-0  " onClick={handleSignIn} >
                  <div className="flex flex-col font-bold h-full text-[#0a0a0a]  text-center  justify-center shadow-s w-full border-solid border-2 rounded-md border-[#0a0a0a] hover:bg-[#0a0a0a] active:bg-outlinePressed ">
                    <span className="title-font  text-[#0a0a0a] font-open-sans font-normal lg:font-semibold text-base p-5 uppercase leading-6 flex justify-center hover:text-white active:text-textOutlinePressed  "> {t("Detail.modalMakeBid")}</span>
                  </div>
                </button>
              </div></>}
        </>}
      <PriceModal {...priceModal} />
      <PutOnSaleModal {...putOnSaleModal} />
    </section>
  );
}


export default PriceNft;
