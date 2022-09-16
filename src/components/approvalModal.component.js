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
import { Tab,  RadioGroup } from "@headlessui/react";

import { getNearContract, fromNearToYocto } from "../utils/near_interaction";
import { useTranslation } from "react-i18next";
import { useWalletSelector } from "../utils/walletSelector";
import { providers, utils } from "near-api-js";

//import { useHistory } from "react-router";

const nftOptions = [
  {
    name: "sale"
  },
  {
    name: "auction"
  }
]

export default function ApprovalModal(props) {
  //const history = useHistory();
  const { selector, modal, accounts, accountId } = useWalletSelector(); 
  const [state, setState] = useState({ disabled: false});
  const [t, i18n] = useTranslation("global")
  const [highestbidder, setHighestbidder] = useState(0);
  const [selected, setSelected] = useState(nftOptions[0])
  useEffect(() => {
    if (props.tokens) {
      setHighestbidder(props.tokens.highestbidder);
    }
  });


  const formik = useFormik({
    initialValues: {
      terms: false,
      price: 0
    },
    validationSchema: Yup.object({
      price: Yup.number()
        .required(t("Modal.required"))
        .positive(t("Modal.positive"))
        .min(0.1, t("Modal.positive")),
      terms: Yup.bool()
        .required(t("Modal.required"))
    }),
    //Metodo para el boton ofertar del formulario
    onSubmit: async (values) => {
      if (!values.terms) {
        Swal.fire({
          title: t("Modal.transAlert2"),
          text: t("Modal.transAlert2Txt"),
          icon: 'error',
          confirmButtonColor: '#E79211'
        })
        return
      }

      let ofertar;
      let contract = await getNearContract();
      let price = fromNearToYocto(values.price)


      if (selected.name == "sale") {
        let amount = fromNearToYocto(0.01);
        let msgData = JSON.stringify({ market_type: "on_sale", price: price, title: props.title, media: props.media, creator_id: props.creator, description: props.description })
        let payload = {
          token_id: props.tokenID,
          account_id: process.env.REACT_APP_CONTRACT_MARKET,
          msg: msgData
        }
        /*let approval = contract.nft_approve(
          payload,
          300000000000000,
          amount
        )*/
        const wallet = await selector.wallet();
        wallet.signAndSendTransaction({
          signerId: accountId,
          receiverId: process.env.REACT_APP_CONTRACT_MARKET,
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
          ]
        })
      }

      if (selected.name == "auction") {
        console.log('props subasta',props);
        let msgobj = {
          auction_amount_requested: fromNearToYocto(values.price)
        }

        let payload = {
          receiver_id: process.env.REACT_APP_CONTRACT_AUCTIONS,
          token_id: props.tokenID,
          msg: JSON.stringify(msgobj)
        }

        let amountVal = values.price;
        let amount = fromNearToYocto(amountVal);
        let bigAmount = BigInt(amount);
        try {
          /*let res = await contract.nft_transfer_call(
            payload,
            300000000000000,
            1,
          );*/
          const wallet = await selector.wallet();
          wallet.signAndSendTransaction({
            signerId: accountId,
            receiverId: process.env.REACT_APP_CONTRACT,
            actions: [
              {
                type: "FunctionCall",
                params: {
                  methodName: "nft_transfer_call",
                  args: payload,
                  gas: 300000000000000,
                  deposit: 1,
                }
              }
            ]
          })
        } catch (err) {
          console.log('err', err);
        }
      }
    },
  });

  return (
    props.show && (
      <>
        <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none  rounded-xlarge">
          <div className="w-9/12 md:w-6/12 my-6  rounded-xlarge ">
            {/*content*/}
            <div className="rounded-xlarge shadow-lg  flex flex-col  bg-white outline-none focus:outline-none font-raleway">
              {/*header*/}

              <div
                className={`flex flex-row justify-between bg-yellow2 flex items-start justify-center font-bold uppercase p-5 border-b border-solid border-yellowGray-200  text-white rounded-t-xlarge font-raleway`}>
                   
    <div className="font-raleway">{props.title} </div>
                <div><button
                  className={`  text-white  font-bold uppercase px-[20px]  text-sm font-raleway`}
                  type="button"
                  disabled={props.disabled}
                  onClick={() => {
                    props.change({ show: false });
                  }}
                >
                  <span className="font-raleway">{props.buttonName}</span>
                </button>
                </div>
              </div>


              <div className="relative p-6 flex flex-col ">
                <div className="flex justify-center">
                  <p className=" my-4 text-center  leading-relaxed text-darkgray text-xl font-raleway">
                    {props.message}
                  </p>


                </div>
                <div className="flex relative xlarge justify-center">
                                    <img
                                      alt="gallery"
                                      className=" w-[110px] h-[110px] md:w-[250px] md:h-[250px] object-contain object-center rounded-xlarge"
                                      src={ "https://nativonft.mypinata.cloud/ipfs/" + props.media}
                                    />
                  </div>
                <div className="flex justify-between  md:px-5">
                      <label
                        htmlFor="price"
                        className="leading-7  text-darkgray text-sm font-raleway"
                      >
                        {t("Modal.action")}
                      </label>
                    </div>
                <div className="flex flex-row w-full justify-center">
                  <RadioGroup value={selected} onChange={setSelected} > 
                    <div className="flex w-full">
                      {nftOptions.map((option) => (
                        <RadioGroup.Option
                          key={option.name}
                          value={option}
                          className={({ active, checked }) =>
                            `${active
                              ? 'ring-2 ring-white  ring-offset-2 bg-yellow2'
                              : ''
                            }
                  ${checked ? 'bg-yellow2  text-white' : 'bg-white'
                            }
                    relative flex cursor-pointer rounded-lg px-5 py-4 shadow-md focus:outline-none m-3 w-[120px] md:w-[150px]`
                          }
                        >
                          {({ active, checked }) => (
                            <>
                              <div className="flex w-full items-center justify-between">
                                <div className="flex items-center">
                                  <div className="text-sm">
                                    <RadioGroup.Label
                                      as="p"
                                      className={`font-medium px-2 ${checked ? 'text-white' : 'text-darkgray'
                                        }`}
                                    >
                                      {t(`Modal.${option.name}`)}
                                    </RadioGroup.Label>
                                  </div>
                                </div>
                                {checked && (
                                  <div className="shrink-0 text-white">
                                    <CheckIcon className="h-6 w-6" />
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </RadioGroup.Option>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {/* Formulario para ofertar */}
                <form
                  onSubmit={formik.handleSubmit}
                  className="grid grid-cols-1 divide-y flex px-5 py-15 md:flex-row flex-col items-center text-sm font-raleway"
                >
                  <div>
                    <div className="flex justify-between items-center">
                      <label
                        htmlFor="price"
                        className="leading-7  text-darkgray text-sm font-raleway"
                      >
                        {t("Modal.price")}
                      </label>
                      {formik.touched.price && formik.errors.price ? (
                        <div className="leading-7 text-sm text-red-600 font-open-sans">
                          {formik.errors.price}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex m-auto items-center">
                      <input
                        type="number"
                        id="price"
                        name="price"
                        min="0.1"
                        max="100000000000000"
                        step="0.1"
                        className={`text-sm font-raleway border-none w-full bg-gray-100 bg-opacity-50 rounded   focus:bg-transparent  text-base outline-none text-darkgray py-1 px-3 leading-8 transition-colors duration-200 ease-in-out-${props.theme}-500 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out`}
                        {...formik.getFieldProps("price")}
                      />
                      NEAR
                    </div>
                    <div className="mt-3">
                      <input type="checkbox" className="" name="terms" id="terms" {...formik.getFieldProps("terms")}/> <label className="text-sm text-darkgray">{t("Modal.accept")}</label>
                    </div>
                    {/* Ofertar */}
                    {props.tokenId && (
                      <div className="w-full flex justify-end font-raleway">
                        <div className="relative group mt-3 rounded-full">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#f2b159] to-[#ca7e16] rounded-full blur opacity-70 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt group-hover:-inset-1"></div>
                          <button
                            className={`relative bg-yellow2 text-white font-bold uppercase text-sm px-6 py-3 rounded-full shadow hover:shadow-lg outline-none focus:outline-none  ease-linear transition-all duration-150`}
                            type="submit"
                            disabled={state.disabled}
                          >
                            <span className="font-raleway">{t("Modal.putSale")}</span>
                            
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
        <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
      </>
    )
  );
}

function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx={12} cy={12} r={12} fill="#fff" opacity="0.2" />
      <path
        d="M7 13l3 3 7-7"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
