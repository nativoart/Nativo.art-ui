/* global BigInt */
import React, {  useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from 'sweetalert2'
//importamos metodos para interactuar con el smart contract, la red de aurora y el account
import {
  syncNets,
  getContract,
  getSelectedAccount,
  fromETHtoWei,
} from "../utils/blockchain_interaction";
import dayjs from 'dayjs';

import { getNearContract, fromNearToYocto, fromYoctoToNear, ext_call } from "../utils/near_interaction";
import { useTranslation } from "react-i18next";

//import { useHistory } from "react-router";

export default function OtherSitesAuctionModal(props) {
  //const history = useHistory();
  const [state, setState] = useState({ disabled: false});
  const [t, i18n] = useTranslation("global")
  const [highestbidder, setHighestbidder] = useState(0);
  const [modalSub, setModalSub] = useState({
    //state para la ventana modal
    show: false,
    nft: ""
  });
  
  useEffect(() => {
    console.log('dentro de la modal de Auction',props);
  },[]);
  
  //Configuramos el formulario para ofertar por un token
  const formik = useFormik({
    initialValues: {
      terms: false,
      price: 0
    },
    validationSchema: Yup.object({
      price: Yup.number()
        .required(t("auctionModal.au_required"))
        .positive(t("auctionModal.au_minThan"))
        .min(0.1, t("auctionModal.au_minThan")),
      terms: Yup.bool()
        .required(t("auctionModal.au_required"))
    }),
    //Metodo para el boton ofertar del formulario
    onSubmit: async (values) => {
      if(!values.terms){
        Swal.fire({
          title: t("Modal.transAlert2"),
          text: t("Modal.offerAlert1Txt"),
          icon: 'error',
          confirmButtonColor: '#E79211'
        })
        return
      }
      let contract = await getNearContract();
      let contractCall = props.nft[0].contract;
      console.log("props",props);
      console.log("contractCall",props.nft[0].contract);
      console.log("contract",contract);
      console.log("contract",values);
      console.log("contract",props.tokenId);

      let msgobj = {
        auction_amount_requested: fromNearToYocto(values.price)
      }

      let payload = {
        receiver_id: process.env.REACT_APP_CONTRACT_AUCTIONS,
        token_id: props.nft[0].token_id,
        msg: JSON.stringify(msgobj)
      }
      
      let amountVal = values.price;
      let amount = fromNearToYocto(amountVal);
      let bigAmount = BigInt(amount);
      console.log('pyload', payload);
      try {
        ext_call(contractCall,'nft_transfer_call', payload, 300000000000000,1)
      } catch (err) {
        console.log('err', err);
      } 


    setState({ disabled: false });
  },
  });

  return (
    props.show && (
      <>
        <div className="  justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none ">
          <div className="w-9/12 my-6  rounded ">
            {/*content*/}
            <div className=" shadow-lg  flex flex-col  bg-white outline-none focus:outline-none rounded-xlarge">
              {/*header*/}

              <div
                className={`flex flex-row justify-between bg-yellow2 flex items-start justify-center font-bold uppercase p-5 border-b border-solid border-yellowGray-200 rounded text-white rounded-t-xlarge`}>
                <div className="font-raleway">{props.title} </div>
                <div><button
                  className={`  text-white  font-bold uppercase px-[20px]  `}
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

              <div className="relative p-6 flex flex-col ">
                <div className="flex justify-center">
                  <p className=" my-4 text-center text-2xl leading-relaxed text-darkgray font-raleway">
                    {props.message}
                  </p>
                  <div className="flex relative xlarge justify-center">
                    <img
                      alt="gallery"
                      className=" w-[110px] h-[110px] md:w-[250px] md:h-[250px] object-contain object-center rounded-xlarge"
                      src={"https://nativonft.mypinata.cloud/ipfs/" + props.nft[0].metadata.media}
                    />
                  </div>
                </div>

                {/* Formulario para ofertar */}
                <form
                  onSubmit={formik.handleSubmit}
                  className="grid grid-cols-1 divide-y flex px-5 py-15 md:flex-row flex-col items-center"
                >
                  <div>
                    {/*CONTRACT*/}
                    <div className="flex justify-between ">
                      <label
                        htmlFor="contract"
                        className="leading-7 text-sm  text-darkgray"
                      >
                        {t("otherSitesAuctionModal.contract")}
                      </label> 
                      <div>
                        {props.nft[0].contract}
                      </div>
                    </div>

                    {/*TOKEN ID*/}
                    <div className="flex justify-between ">
                      <label
                        htmlFor="price"
                        className="leading-7 text-sm  text-darkgray"
                      >
                       {t("otherSitesAuctionModal.tokenID")}
                      </label>
                      <div>
                      {props.nft[0].token_id}
                      </div>
                    </div>
                    {/*PRICE*/}
                    <div className="flex justify-between ">
                      <label
                        htmlFor="price"
                        className="leading-7 text-sm  text-darkgray"
                      >
                        {t("bidModal.au_basePrice")} 
                        
                      </label>
                      {formik.touched.price && formik.errors.price ? (
                        <div className="leading-7 text-sm text-red-600 font-open-sans">
                          {formik.errors.price}
                        </div>
                      ) : null}
                    </div>                    
                    <div className="flex flex-row">
                      <input
                        type="number"
                        id="price"
                        name="price"
                        min="0.1"
                        max="100000000000000"
                        step="0.1"
                        className={`border-none w-full bg-gray-100 bg-opacity-50 rounded   focus:bg-transparent  text-base outline-none text-darkgray py-1 px-3 leading-8 transition-colors duration-200 ease-in-out-${props.theme}-500 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out font-raleway`}
                        {...formik.getFieldProps("price")}
                      />
                      <div className="p-4 font-open-sans">
                        NEAR
                      </div>
                    </div>
   
                    {/*Remaining time*/}<div className="flex justify-center ">
                      <label
                        htmlFor="price"
                        className="leading-7 text-sm  text-darkgray"
                      >
                        {t("otherSitesAuctionModal.note")}: {t("auctionModal.au_finish")} {dayjs().add(15, 'minute').format("DD/MMM/YYYY HH:mm:ss") }
                      </label>
                      </div>

                      
                    <div className="mt-3">
                      <input type="checkbox" className="" name="terms" id="terms" {...formik.getFieldProps("terms")}/> <label className="text-sm text-darkgray font-raleway">{t("Modal.accept")}</label>
                    </div>
                    
                    
                    {/* Ofertar */}
                    {(
                      <div className="w-full flex justify-end">
                        <button
                          className={`bg-yellow2 w- mt-3  text-white active:bg-brown font-bold uppercase text-sm px-6 py-3 rounded-full shadow hover:shadow-lg outline-none focus:outline-none  ease-linear transition-all duration-150 `}
                          type="submit"
                          disabled={state.disabled}
                        >
                          OK
                        </button>
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
        <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
      </>
    )
  );
}
