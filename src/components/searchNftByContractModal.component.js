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

import { getNearAccount, getNFTById, getNFTContractsByAccount, getNFTByContract } from "../utils/near_interaction";
import { useTranslation } from "react-i18next";
import OtherSitesAuctionModal from "./otherSitesAuctionModal.component";

//import { useHistory } from "react-router";

export default function SearchNftByContractModal(props) {
  //const history = useHistory();
  const [state, setState] = useState({ disabled: false, nftsSearched: [], account: ''});
  const [allNfts, setAllNfts] = useState({nfts:[],contracts:[]});
  const [t, i18n] = useTranslation("global")
  const [modalOtherSitesAuction, setModalOtherSitesAuction] = useState({
    //state para la ventana modal
    show: false,
    nft: ""
  });



  //Configuramos el formulario para ofertar por un token
  const formik = useFormik({
    initialValues: {
      nftID: ""
    },
    validationSchema: Yup.object({
      nftID: Yup.string()
        .required("Requerido"),
      contractID: Yup.string()
        .required("Requerido")
    }),
    //Metodo para el boton ofertar del formulario
    onSubmit: async (value) => {
      let allNFTS=[];
      let account = await getNearAccount();
      console.log('form value', value);
      let thereIsContract  = props.contracts.find(e=>e == value.contractID);
      if(thereIsContract != null){
        let searchedNfts = await getNFTById(value.contractID, value.nftID, state.account);
        if(searchedNfts !== null && searchedNfts.owner_id == state.account){
          allNFTS.push({...searchedNfts,contract:value.contractID})
        }
      } 

      if(allNFTS.length < 1){
        Swal.fire({
          title: t("searchNftById.modalSearch"),
          text: t("searchNftById.modalSearchText"),
          icon: 'warning',
          confirmButtonColor: '#E79211'
        })
      }
      setState({...state, nftsSearched: allNFTS, account : account})
    }
  });

  useEffect(() => {
    (async () => {
      let account = await getNearAccount();
      setState({...state, account : account})
      console.log('JOTOOOOO',props);
      let contracts = await getNFTContractsByAccount(account).catch(data=>{
        console.log('data contracts',data);
        
      });
      console.log('contratos',contracts);
      
      let allNfts = [];
  
  
      for await (let [i, contract] of contracts.entries()) {
        console.log('dentro de contratos',contract+i);
       let nfts = await getNFTByContract(contract, account).catch(data=>{
          console.log('data contracts',data);
        });
  
        let obj = {
          contract : contract,
          contractNfts: nfts
        }
  
        allNfts.push(obj);
      }

  
      setAllNfts({nfts: allNfts});
    })();
  }, []);

  async function makeOtherSitesAuction(){
    setModalOtherSitesAuction({
      ...modalOtherSitesAuction,
      show: true,
      tokenId: "1",
      currency: "1",
      blockchain: "1",
      message: ""  ,
      title: ""  ,
      buttonName: "X",
      nft: state.nftsSearched,
      change: setModalOtherSitesAuction
    });
   
  
}

  return (
    props.show && (
      <>
        <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
          <div className="w-9/12  rounded-xlarge ">
            {/*content*/}
            <div className="rounded-xlarge  shadow-lg  flex flex-col  bg-white outline-none focus:outline-none">
              {/*header*/}

              <div
                className={`flex flex-row justify-between bg-yellow2 flex items-start justify-center font-bold uppercase p-5 border-b border-solid border-yellowGray-200 rounded-t-xlarge text-white`}>
                <div className="font-raleway text-sm md:text-base">{props.title} </div>
                <div><button
                  className={`  text-white  font-bold uppercase px-[20px]  font-raleway`}
                  type="button"
                  disabled={props.disabled}
                  onClick={() => {
                    setState({...state,nftsSearched: []});
                    formik.resetForm()
                    props.change({ show: false });
                    document.body.classList.remove('overflow-modal');
                  }}
                >
                  {props.buttonName}
                </button>
                </div>
              </div>

              <div className="relative p-6 flex flex-col max-h-[400px] ">

                {/* Formulario para ofertar */}
                <form
                  onSubmit={formik.handleSubmit}
                  className="grid grid-cols-1 divide-y flex px-5 py-15 md:flex-row flex-col items-center"
                >
                  <div>

                    <div className="flex flex-row">
                      <div className="flex flex-col w-full">
                        <div className="">
                          <input
                            type="text"
                            id="contractID"
                            name="contractID"
                            placeholder={t("otherSitesAuctionModal.typeContract")}
                            className={`border-none w-full bg-gray-100 bg-opacity-50 rounded   focus:bg-gray-100   text-base outline-none text-gray-700  leading-8 transition-colors duration-200 ease-in-out-yellow-500 text-base outline-none text-gray-700 leading-8 transition-colors duration-200 ease-in-out font-raleway m-2`}
                            {...formik.getFieldProps("contractID")}
                          />
                          <div className="flex justify-between ">
                            {formik.touched.contractID && formik.errors.contractID ? (
                              <div className="leading-7 text-sm text-red-600 font-open-sans">
                                {formik.errors.contractID}
                              </div>
                            ) : null}
                          </div>
                        </div>
                        <div className="">
                          <input
                            type="text"
                            id="nftID"
                            name="nftID"
                            placeholder={t("otherSitesAuctionModal.typeNFTID")}
                            className={`border-none w-full bg-gray-100 bg-opacity-50 rounded   focus:bg-gray-100   text-base outline-none text-gray-700  leading-8 transition-colors duration-200 ease-in-out-yellow-500 text-base outline-none text-gray-700 leading-8 transition-colors duration-200 ease-in-out font-raleway m-2`}
                            {...formik.getFieldProps("nftID")}
                          />
                          <div className="flex justify-between ">
                            {formik.touched.nftID && formik.errors.nftID ? (
                              <div className="leading-7 text-sm text-red-600 font-open-sans">
                                {formik.errors.nftID}
                              </div>
                            ) : null}
                          </div>
                        </div>
                        <button
                          className={`bg-yellow2 w-1/3 md:w-1/4  text-white active:bg-brown font-bold uppercase text-sm md:px-6 md:py-3 rounded-full shadow hover:shadow-lg outline-none focus:outline-none  ease-linear transition-all duration-150  self-center`}
                          type="submit"
                        >
                          <span className="font-raleway text-xs md:text-sm">{t("searchNftById.search")}</span>
                        </button>
                      </div>
                    </div>
                  </div>



                </form>
                {/* Boton de cancelar en la ventana modal */}
                <div className="flex flex-wrap  overflow-y-scroll no-scrollbar">
                  {state.nftsSearched.length > 0 ? state.nftsSearched.map((nftData,key)=>{
                        return (
                          <div className="lg:w-1/3 md:w-1/2 w-full ssmw-1  px-2 lg:px-6 my-5  xlarge" key={key}>
                          <div className="flex relative xlarge  h-[300px]">
                            <img
                              alt="gallery"
                              className=" absolute inset-0 z-0 w-full h-full object-cover object-center rounded-xlarge"
                              src={"https://nativonft.mypinata.cloud/ipfs/" + nftData.metadata.media}
                            />
                            <h1 className="absolute justify-center px-2 py-1 text-sm font-bold leading-none text-white dark:bg-yellow2 rounded-xlarge top-4 left-3 right-3 font-raleway text-ellipsis overflow-hidden whitespace-nowrap">{nftData.metadata.title}</h1>
                            <div className="px-8 py-6 relative z-10 w-full  bg-darkgray opacity-0 hover:opacity-100 hover:shadow-yellow1  rounded-xlarge ">
                              <h1 className="title-font text-base md:text-lg  text-gray-900 mb-3 dark:text-white dark:font-bold font-raleway font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                                {nftData.metadata.title}
                              </h1>
                              <p className=" rounded-xlarge dark:text-white text-ellipsis overflow-hidden whitespace-nowrap text-sm font-medium"><b className="dark:font-bold font-raleway ">{t("MyNFTs.creator")}</b > {nftData.creator_id}</p>
                              <p
                                className={`text-sm title-font font-medium text-white font-raleway text-ellipsis overflow-hidden whitespace-nowrap`}
                              ><b className="dark:font-bold font-raleway ">Token id</b>{`: ${nftData.token_id}  `}</p>
                              <p
                                className={` text-sm title-font font-medium text-white font-raleway text-ellipsis overflow-hidden whitespace-nowrap`}
                              ><b className="dark:font-bold font-raleway ">{t("searchNftById.contract")}</b>{`: ${nftData.contract}  `}</p>
                                <div className="text-center">
                                  <div
                                    onClick={async () => {
                                      makeOtherSitesAuction();
                                    }}
                                    className={`inline-block w-full text-md text-brown bg-white border-0 py-2 px-4 focus:outline-none hover:bg-yellow2 2 hover:text-white rounded-xlarge font-raleway font-medium `}
                                  >{t("otherSitesAuctionModal.putOnAuction")}</div>
                                </div>
                            </div>
                          </div>
                        </div> 
                        )
                  }) :
                  <div>
                    <p className="text-darkgray p-6 text-base md:text-lg">{t("searchNftById.results")}</p>
                  </div>
                  
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        <OtherSitesAuctionModal {...modalOtherSitesAuction}/>
      </>
    )
  );
}
