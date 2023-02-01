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

export default function BuyTokenModalConfirm(props) {
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
        <div className="  justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none rounded-xlarge">
          <div className="w-9/12 md:w-6/12 my-6  rounded-xlarge">
            {/*content*/}
            <div className=" rounded-xlarge shadow-lg  flex flex-col  bg-white outline-none focus:outline-none">
              {/*header*/}

              <div className="relative p-6 flex flex-col md:flex-row  ">
                <div className="w-full md:w-1/2 flex justify-center">
                  <div className="w-full xs:w-[158px] h-[279px] sm:w-[180px] md:w-[160px] lg:w-[210px] xl:w-[275px] 2xl:w-[335px] xl:h-[395px] 2xl:h-[485px] " >
                    <div className="flex flex-row justify-center " >
                      <div className="trending-token w-full h-full rounded-xl shadow-lg ">
                        <div className=" bg-white rounded-xl">
                          <div className="pb-3">
                            <img
                              className="object-cover object-center rounded-t-xl w-full h-[163px] lg:w-[340px] xl:h-[250px] 2xl:h-[340px]"
                              src={`https://nativonft.mypinata.cloud/ipfs/${props.tokens.image}`}
                              alt={props.tokens.description}
                            />
                          </div>
                          <div className="px-3 py-1">
                            <p className=" text-black text-base leading-6 text-ellipsis overflow-hidden whitespace-nowrap font-open-sans font-extrabold uppercase">{props.tokens.title}</p>
                            <div className="flex justify-start">
                              <div className=" text-base font-open-sans font-semibold py-2 text-yellow4 flex">  <img
                                className="w-[16px] h-[16px] my-auto mr-2"
                                src={nearImage}
                                alt={props.tokens.description}
                                width={15}
                                height={15}
                              /> {props.tokens.price} NEAR</div>
                            </div>
                            <a href=""><p className="text-black py-3 font-open-sans text-[10px] xl:pb-[23px] font-semibold leading-4 text-ellipsis overflow-hidden whitespace-nowrap uppercase">{t("tokCollection.createdBy") + ":"} {props.tokens.creator}</p></a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
                <div className="w-full md:w-1/2 flex flex-col justify-center mt-3 md:mt-0">

                  <div className="flex justify-center w-full items-center py-2">
                    <p className=" text-4xl md:text-3xl lg:text-5xl leading-relaxed text-[#0a0a0a] font-clash-grotesk font-semibold w-full text-center">
                    {t('Detail.finalizeBuy')}
                    </p>
                  </div>
                  <div className="flex justify-center w-full items-center py-2">
                    <p className=" text-base leading-relaxed text-[#0a0a0a] font-open-sans font-normal w-full text-center">
                    {props.tokens.title} {t('Detail.finalizeBuySubtitle')}
                    </p>
                  </div>
                  {/* Formulario para ofertar */}

                  {/* Boton de cancelar en la ventana modal */}
                  <div className="flex justify-end py-2">
                    <button className="flex  rounded-xlarge w-full  h-[50px]  mt-0 mx-2" onClick={() => { window.location.href = "/token/"+props.tokens.tokenID }} >
                      <div className="flex flex-col font-bold h-full text-white  text-center  justify-center shadow-s w-full bg-yellow4 hover:bg-yellowHover active:bg-yellowPressed rounded-md">
                        <span className="title-font  text-white font-open-sans font-normal lg:font-semibold text-base p-5 uppercase leading-6">{t("Detail.backToMyNFT")}</span>
                      </div>
                    </button>
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
