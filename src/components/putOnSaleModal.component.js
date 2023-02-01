/* global BigInt */
import React, {  useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from 'sweetalert2'
//importamos metodos para interactuar con el smart contract, la red de aurora y el account


import { getNearContract, fromNearToYocto, ext_call, ext_view, fromYoctoToNear } from "../utils/near_interaction";
import { useTranslation } from "react-i18next";
import { useWalletSelector } from "../utils/walletSelector";
import nearImage from '../assets/img/landing/trendingSection/Vector.png';

//import { useHistory } from "react-router";

export default function PutOnSaleModal(props) {
  //const history = useHistory();
  const { selector, modal, accounts, accountId } = useWalletSelector();
  const [t, i18n] = useTranslation("global")
  const [highestbidder, setHighestbidder] = useState(0);
  useEffect(() => {
    if (props.tokens) {
      setHighestbidder(props.tokens.highestbidder);
    }
  });
  
  //Configuramos el formulario para ofertar por un token
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      terms: false,
      price: 0
    },
    validationSchema: Yup.object({
      price: Yup.number()
        .required(t("Detail.required"))
        .positive(t("Detail.positive"))
        .moreThan(0.09999999999999, t("Detail.positive"))
        .min(0.1, t("Detail.positive")),
      terms: Yup.bool()
        .required(t("Detail.required"))
    }),
    //Metodo para el boton ofertar del formulario
    onSubmit: async (values) => {
      console.log('NYA', values);
      let ofertar;
        let contract = await getNearContract();
        let amount = fromNearToYocto(process.env.REACT_APP_FEE_PUT_ON_SALE_NFT);
        let priceChange = fromNearToYocto(values.price);
        let msgData = JSON.stringify({market_type:"on_sale", price: priceChange, title: props.title, media: props.media, creator_id: props.creator, description: props.description})
        console.log('msgData',msgData)
        let payload = {
          account_id: process.env.REACT_APP_CONTRACT_MARKET,
          token_id: props.tokenID,
          msg: msgData 
        }
        console.log(payload)
        if(!values.terms){
          Swal.fire({
            background: '#0a0a0a',
            html:
            '<div class="">' +
            '<div class="font-open-sans  text-base font-extrabold text-white mb-4 text-left uppercase">' +  t("Modal.transAlert2") + '</div>' +
            '<div class="font-open-sans  text-sm text-white text-left">' + t("Modal.putOnSaleAlert2Txt") + '</div>' +
            '</div>',
            confirmButtonColor: '#F79336',
            position: window.innerWidth < 1024 ? 'bottom' : 'center'
          })
          return
        }
        // ext_call(process.env.REACT_APP_CONTRACT_MARKET,"update_price",payload,300000000000000,1)
        const wallet = await selector.wallet();
        wallet.signAndSendTransaction({
          signerId: accountId,
          receiverId: process.env.REACT_APP_CONTRACT,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "nft_approve",
                args: payload,
                gas: 300000000000000,
                deposit: amount,
              }
            }
          ],
          callbackUrl:  window.location.protocol + "//" + window.location.host+'/token/'+props.tokenID+'?action=buytoken'

        }).then(() => {
          Swal.fire({
            background: '#0a0a0a',
            width: '800',
            html:
              '<div class="">' +
              '<div class="font-open-sans  text-base font-extrabold text-white mb-4 text-left uppercase">' +  t("Alerts.changePriceTit") + '</div>' +
              '<div class="font-open-sans  text-sm text-white text-left">' + t("Alerts.changePriceMsg") + '</div>' +
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
              window.location.href = "/token/"+props.tokenID
            }
          });
        }).catch((err) => {
          console.log("error: ", err);
        });
        // 
        

   
        
      // if (highestbidder != 'notienealtos') {
      //   if (bigAmount <= BigInt(highestbidder)) {
      //     Swal.fire({
      //       title: 'El Precio es menor a la ultima oferta',
      //       text: 'Para poder ofertar por este NFT es necesario que el precio mayor a la ultima oferta',
      //       icon: 'error',
      //       confirmButtonColor: '#E79211'
      //     })
      //     return
      //   }
      // }
        

        
      //   ofertar = await contract.market_bid_generic(
      //     payload,
      //     300000000000000, // attached GAS (optional)
      //     bigAmount.toString()//amount
      //   ).
      //   catch(e=>{
      //     console.log('error',e);
      //   });
      

      // setState({ disabled: false });
    },
  });

  async function getSaleData(tokenID){
    let extPayload={
      nft_contract_token : process.env.REACT_APP_CONTRACT+"."+tokenID
    }
    let extData = await ext_view(process.env.REACT_APP_CONTRACT_MARKET,'get_sale',extPayload)
    return extData
  }
  return (
    props.show && (
      <>
      {console.log('PutONSALE de price', props)}
        <div className="  justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none rounded-xlarge">
          <div className="w-9/12 md:w-6/12 my-6  rounded-xlarge">
            {/*content*/}
            <div className=" rounded-xlarge shadow-lg  flex flex-col  bg-white outline-none focus:outline-none">
              {/*header*/}

              <div
                className={`flex flex-row   items-start justify-between font-bold uppercase p-5  rounded-t-xlarge text-white`}>
                <div className="font-raleway">{props.title} </div>
                <div><button
                  className={`  text-[#0a0a0a]  font-bold uppercase px-[20px]  `}
                  type="button"
                  disabled={props.disabled}
                  onClick={() => {
                    props.change({ show: false });
                  }}
                >
                  {props.buttonName}
                </button>
                </div>
              </div>

              <div className="relative p-6 flex flex-col md:flex-row  ">
                <div className="w-full md:w-1/2 flex justify-center">
                  <div className="w-full xs:w-[158px] h-[279px] sm:w-[180px] md:w-[160px] lg:w-[210px] xl:w-[275px] 2xl:w-[335px] xl:h-[395px] 2xl:h-[485px] " >
                    <div className="flex flex-row justify-center " >
                      <div className="trending-token w-full h-full rounded-xl shadow-lg ">
                        <div className=" bg-white rounded-xl">
                          <div className="pb-3">
                            <img
                              className="object-cover object-center rounded-t-xl w-full h-[163px] lg:w-[340px] xl:h-[250px] 2xl:h-[340px]"
                              src={`https://nativonft.mypinata.cloud/ipfs/${props.image}`}
                              alt={props.description}
                            />
                          </div>
                          <div className="px-3 py-1">
                            <p className=" text-black text-base leading-6 text-ellipsis overflow-hidden whitespace-nowrap font-open-sans font-extrabold uppercase">{props.title}</p>
                            <div className="flex justify-start">
                              <div className=" text-base font-open-sans font-semibold py-2 text-yellow4 flex">  <img
                                className="w-[16px] h-[16px] my-auto mr-2"
                                src={nearImage}
                                alt={props.description}
                                width={15}
                                height={15}
                              /> {formik.values.price} NEAR</div>
                            </div>
                            <a href=""><p className="text-black py-3 font-open-sans text-[10px] xl:pb-[23px] font-semibold leading-4 text-ellipsis overflow-hidden whitespace-nowrap uppercase">{t("tokCollection.createdBy") + ":"} {props.creator}</p></a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
                <div className="w-full md:w-1/2 flex flex-col justify-center mt-3 md:mt-0">

                  <div className="flex justify-center w-full items-center">
                    <p className=" text-2xl leading-relaxed text-[#0a0a0a] font-open-sans font-bold w-full">
                    {t("Detail.putPrice")}
                    </p>
                  </div>

                  {/* Formulario para ofertar */}
                  <form
                    onSubmit={formik.handleSubmit}
                    className="grid grid-cols-1 divide-y  py-15 md:flex-row flex-col items-center w-full"
                  >
                    <div>
                      <div className="flex justify-between ">
                        <label
                          htmlFor="price"
                          className="leading-7 text-base text-[#0a0a0a] font-open-sans font-bold"
                        >
                          {t("Modal.price")}
                        </label>
                        {formik.touched.price && formik.errors.price ? (
                          <div className="leading-7 text-sm text-red-600 font-open-sans">
                            {formik.errors.price}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex flex-row items-center ">
                        <div className="flex items-center w-[50px] h-[40px] border border-[#A4A2A4] rounded-full mr-3">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18.5362 2.29645L14.0212 8.99995C13.9569 9.09649 13.9297 9.21305 13.9447 9.32807C13.9597 9.4431 14.0159 9.5488 14.1028 9.62564C14.1897 9.70248 14.3014 9.74525 14.4174 9.74604C14.5334 9.74683 14.6458 9.70559 14.7337 9.62995L19.1782 5.77495C19.2043 5.75165 19.2365 5.73643 19.2711 5.73116C19.3056 5.72589 19.341 5.73079 19.3728 5.74526C19.4046 5.75974 19.4315 5.78316 19.4502 5.81267C19.4689 5.84218 19.4787 5.8765 19.4782 5.91145V17.9804C19.4782 18.0174 19.4668 18.0534 19.4456 18.0837C19.4244 18.114 19.3944 18.137 19.3597 18.1496C19.3249 18.1622 19.2872 18.1638 19.2515 18.1542C19.2158 18.1446 19.1839 18.1243 19.1602 18.0959L5.72622 2.01445C5.51014 1.75929 5.24108 1.55426 4.93774 1.4136C4.63441 1.27294 4.30408 1.20004 3.96972 1.19995H3.50022C2.88995 1.19995 2.30469 1.44238 1.87317 1.8739C1.44164 2.30542 1.19922 2.89069 1.19922 3.50095V20.499C1.19922 21.1092 1.44164 21.6945 1.87317 22.126C2.30469 22.5575 2.88995 22.7999 3.50022 22.7999C3.89369 22.8001 4.28063 22.6993 4.6241 22.5074C4.96757 22.3154 5.25613 22.0386 5.46222 21.7035L9.97722 15C10.0415 14.9034 10.0687 14.7868 10.0537 14.6718C10.0387 14.5568 9.98258 14.4511 9.89568 14.3743C9.80878 14.2974 9.697 14.2547 9.58101 14.2539C9.46501 14.2531 9.35266 14.2943 9.26472 14.37L4.82022 18.225C4.79417 18.2483 4.7619 18.2635 4.72735 18.2687C4.6928 18.274 4.65747 18.2691 4.62566 18.2546C4.59385 18.2402 4.56694 18.2167 4.54821 18.1872C4.52949 18.1577 4.51976 18.1234 4.52022 18.0884V6.01645C4.52023 5.9795 4.53162 5.94345 4.55282 5.9132C4.57403 5.88294 4.60404 5.85995 4.63877 5.84733C4.6735 5.83472 4.71127 5.8331 4.74695 5.84269C4.78263 5.85228 4.8145 5.87262 4.83822 5.90095L18.2707 21.9855C18.4868 22.2406 18.7559 22.4456 19.0592 22.5863C19.3625 22.727 19.6929 22.7999 20.0272 22.7999H20.4967C20.799 22.8001 21.0984 22.7408 21.3777 22.6252C21.6571 22.5097 21.9109 22.3402 22.1247 22.1265C22.3386 21.9128 22.5082 21.6591 22.6239 21.3799C22.7397 21.1006 22.7992 20.8012 22.7992 20.499V3.50095C22.7992 2.89069 22.5568 2.30542 22.1253 1.8739C21.6937 1.44238 21.1085 1.19995 20.4982 1.19995C20.1047 1.19985 19.7178 1.30058 19.3743 1.49254C19.0309 1.68449 18.7423 1.96127 18.5362 2.29645Z" fill="#0A0A0A" />
                          </svg>
                        </div>
                        <input
                          type="number"
                          id="price"
                          name="price"
                          min="0.1"
                          step="0.1"
                          className={`border border-[#A4A2A4] w-full bg-white bg-opacity-50 rounded-md   focus:bg-transparent  text-base outline-none  py-1 px-3 leading-8 transition-colors duration-200 ease-in-out-${props.theme}-500 text-base outline-none  py-1 px-3 leading-8 transition-colors duration-200 ease-in-out text-[#0a0a0a] font-open-sans font-bold`}
                          {...formik.getFieldProps("price")}
                        />
                      </div>
                      <div className="mt-3">
                        <input type="checkbox" className="" name="terms" id="terms" {...formik.getFieldProps("terms")} /> <label className="text-sm text-darkgray font-open-sans">{t("Modal.accept")}</label>
                      </div>
                      {/* Ofertar */}
                      {props.tokenId && (
                        <div className="w-full flex justify-end ">
                          <div className="relative group mt-3 rounded-full w-full">
                            <button
                              className={`relative bg-[#F79336] text-white font-extrabold uppercase text-sm px-6 py-3 rounded-md  outline-none focus:outline-none  ease-linear transition-all duration-150 w-full`}
                              type="submit"
                            >
                              <span className="font-open-sans">{t("Detail.putOnSale")}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>



                  </form>
                  {/* Boton de cancelar en la ventana modal */}
                  <div className="flex justify-end">

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
      </>
    )
  );
}
