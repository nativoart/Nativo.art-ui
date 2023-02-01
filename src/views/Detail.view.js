/* global BigInt */
import React, { useState } from "react";
import PropTypes from "prop-types";
import { useParams, useHistory } from "react-router-dom";
import { isNearReady } from "../utils/near_interaction";
import { nearSignIn, ext_view, ext_call } from "../utils/near_interaction";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

import { currencys } from "../utils/constraint";
import {
  fromNearToYocto,
  fromYoctoToNear,
  getNearAccount,
  getNearContract,
} from "../utils/near_interaction";
import flechaiz from "../assets/landingSlider/img/flechaIz.png";
import ReactHashtag from "react-hashtag";
import OfferModal from "../components/offerModal.component";
import AddTokenModal from "../components/addTokenModal.component";
import PriceNft from "../components/PriceNft.component";
import InformationToken from "../components/InformationToken.component";
import loadingGif from "../assets/img/loadingGif.gif";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { use } from "i18next";
import { useWalletSelector } from "../utils/walletSelector";
import { providers, utils } from "near-api-js";
import PutOnSaleModalConfirm from "../components/putOnSaleModalConfirm.component";
import RemoveFromSaleModalConfirm from "../components/removeFromSaleModalConfirm.component";
import UpdatePriceModalConfirm from "../components/updatePriceModalConfirm.component";
import BuyTokenModalConfirm from "../components/buyTokenModalConfirm.component";

function TokenDetail(props) {
  //guarda el estado de  toda la vista
  const { selector, modal, accounts, accountId } = useWalletSelector();
  const [state, setstate] = useState();
  const [btn, setbtn] = useState(true);
  const [t, i18n] = useTranslation("global");
  const [loaded, setLoaded] = useState(false);

  //Esta logeado
  const [stateLogin, setStateLogin] = useState(false);
  const [hasRoyalty, setHasRoyalty] = useState(false);
  const [hasBids, setHasBids] = useState(false);
  const [creator, setCreator] = useState(false);
  const [noCollection, setNoCollection] = useState(false);
  const [loadInfo, setLoadInfo] = useState(false);
  //es el parametro de tokenid
  const { data, id } = useParams();
  //es el historial de busqueda
  //let history = useHistory();
  const APIURL = process.env.REACT_APP_API_TG;
  const handleSignIn = () => {
    modal.show();
  };
  const history = useHistory();
  const query = new URLSearchParams(window.location.search);
  const action = query.get('action');
  const errorCode = query.get('errorCode');
  const errorMessage = query.get('errorMessage');
  const [putOnSaleModalConfirm, setPutOnSaleModalConfirm] = useState({
    show: false
  });
  const [updatePriceModalConfirm, setUpdatePriceModalConfirm] = useState({
    show: false
  });
  const [removeFromSaleModalConfirm, setRemoveFromSaleModalConfirm] = useState({
    show: false
  });
  const [buyTokenModalConfirm, setBuyTokenModalConfirm] = useState({
    show: false
  });
        

  async function futureFeatureMsg(section) {
    Swal.fire({
      background: '#0a0a0a',
      width: '800',
      html:
        '<div class="">' +
        '<div class="font-open-sans  text-base font-extrabold text-white mb-4 text-left uppercase">' + t("Navbar.comming") + '</div>' +
        '<div class="font-open-sans  text-sm text-white text-left">' + t("Navbar.commingSubtitle") + '</div>' +
        '</div>',
      showCloseButton: true,
      showCancelButton: false,
      showConfirmButton: false,

      position: window.innerWidth < 1024 ? 'bottom' : 'center'
    });
  }

  React.useEffect(() => {
    (async () => {
      if(errorCode!=undefined ){
        setPutOnSaleModalConfirm({
          show: false
        });
        setUpdatePriceModalConfirm({
          show: false
        });
        setRemoveFromSaleModalConfirm({
          show: false
        });
        setBuyTokenModalConfirm({
          show: false
        });
      } else if(errorCode==undefined && action=='removesale'){
        removeFromSaleConfirm();
      } else if(errorCode==undefined && action=='updateprice'){
        updatePriceConfirm();
      } else if(errorCode==undefined && action=='buytoken'){
        buyTokenConfirm();
      } else if(errorCode==undefined && action=='putonsale'){
        putOnSaleConfirm();
      }
      
      setStateLogin(accountId !=null ? true : false);
      let ownerAccount = accountId;

      let totalSupply;

      if (localStorage.getItem("blockchain") == "0") {
      } else {
        let contract = await getNearContract();
        let account = await getNearAccount();
        let tokenId = id;
        let userData;
        let colTitle = ""
        let colID = ""

        const query = `
          query($tokenID: String){
            tokens (where : {id : $tokenID}){
              id
              collectionID
            }
          }
        `;
        const client = new ApolloClient({
          uri: APIURL,
          cache: new InMemoryCache(),
        });

        await client
          .query({
            query: gql(query),
            variables: {
              tokenID: tokenId,
            },
          })
          .then((data) => {
            console.log("token Data: ", data.data.tokens);
            if (data.data.tokens.length <= 0) {
              setNoCollection(true);
            } else {
              userData = data.data.tokens;
              colID = userData[0].collectionID
            }
          })
          .catch((err) => {
            console.log("error: ", err);
          });
          if (colID != ""){
            const query2 = `
            query($colID: String){
              collections (where : {id : $colID}){
                id
                title
              }
            }
          `;
          const client2 = new ApolloClient({
            uri: APIURL,
            cache: new InMemoryCache(),
          });

          await client2
            .query({
              query: gql(query2),
              variables: {
                colID: colID,
              },
            })
            .then((data) => {
              console.log("collection Data: ", data.data.collections);
              if (data.data.collections.length <= 0) {
                setNoCollection(true);
              } else {
                colTitle = data.data.collections[0].title
              }
            })
            .catch((err) => {
              console.log("error: ", err);
            });
        }

        let payload = {
          account_id: account,
          token_id: tokenId,
        };
        let onSale = false;
        let priceData = "";
        let bids = [];
        let bidder = "";
        let bidPrice = "";
        // let nft = await contract.nft_token(payload);
        const nft_payload = btoa(JSON.stringify(payload));
        const { network } = selector.options;
        const provider = new providers.JsonRpcProvider({
          url: network.nodeUrl,
        });
        const res = await provider.query({
          request_type: "call_function",
          account_id: process.env.REACT_APP_CONTRACT,
          method_name: "nft_token",
          args_base64: nft_payload,
          finality: "optimistic",
        });
        let nft = JSON.parse(Buffer.from(res.result).toString());
        console.log(nft);
        let bidsData = await getBids(tokenId);
        console.log(bidsData);
        if (nft.creator_id == accountId) {
          setCreator(true);
        }
        if (Object.keys(nft.royalty).length != 0) {
          setHasRoyalty(true);
        }
        if (nft.approved_account_ids.length != 0) {
          Object.entries(nft.approved_account_ids).map((approval, i) => {
            if (approval.includes(process.env.REACT_APP_CONTRACT_MARKET)) {
              onSale = true;
            }
          });
        }
        if (onSale) {
          let data = await getSaleData(tokenId);
          priceData = fromYoctoToNear(data.price);
        }
        console.log(bidsData.buyer_id);
        if (bidsData.buyer_id != "null") {
          console.log("Hay oferta :D");
          setHasBids(true);
          bidder = bidsData.buyer_id;
          bidPrice = fromYoctoToNear(bidsData.price);
        }
        setLoadInfo(true);
        setstate({
          ...state,
          tokens: {
            tokenID: nft.token_id,
            sale: onSale,
            price: priceData,
            bidder: bidder,
            bidPrice: bidPrice,
            account: accountId,
            owner: nft.owner_id,
            image: nft.metadata.media,
            title: nft.metadata.title,
            description: nft.metadata.description,
            royalty: Object.entries(nft.royalty),
            creator: nft.creator_id,
            colTitle: colTitle,
            colID: colID
            //chunk: parseInt(toks.token_id/2400),
          },
          jdata: {
            image: nft.metadata.media,
            title: nft.metadata.title,
            description: nft.metadata.description,
            royalty: Object.entries(nft.royalty),
            creator: nft.creator_id,
          },
          owner: nft.owner_id,
          ownerAccount: ownerAccount,
        });
      }
      setLoaded(true);
    })();
  }, []);

  async function getSaleData(tokenID) {
    let extPayload = {
      nft_contract_token: process.env.REACT_APP_CONTRACT + "." + tokenID,
    };
    // let extData = await ext_view(process.env.REACT_APP_CONTRACT_MARKET,"get_sale",extPayload)
    const args_b64 = btoa(JSON.stringify(extPayload));
    const { network } = selector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });
    const res = await provider.query({
      request_type: "call_function",
      account_id: process.env.REACT_APP_CONTRACT_MARKET,
      method_name: "get_sale",
      args_base64: args_b64,
      finality: "optimistic",
    });
    let extData = JSON.parse(Buffer.from(res.result).toString());
    return extData;
  }
  async function getBids(tokenID) {
    let extPayload = {
      nft_contract_id: process.env.REACT_APP_CONTRACT,
      token_id: tokenID,
    };
    // let extData = await ext_view(process.env.REACT_APP_CONTRACT_MARKET,"get_offer",extPayload)
    const args_b64 = btoa(JSON.stringify(extPayload));
    const { network } = selector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });
    const res = await provider.query({
      request_type: "call_function",
      account_id: process.env.REACT_APP_CONTRACT_MARKET,
      method_name: "get_offer",
      args_base64: args_b64,
      finality: "optimistic",
    });
    let extData = JSON.parse(Buffer.from(res.result).toString());
    return extData;
  }

  async function manageOffer(option) {
    //get contract
    let contract = await getNearContract();
    //construct payload
    let payload = {
      address_contract: state.tokens.contract,
      token_id: state.tokens.tokenID,
      collection_id: state.tokens.collectionID,
      collection: state.tokens.collection,
      status: Boolean(option), //true or false to  decline offer
    };

    let amount = BigInt(state.tokens.highestbidder);
    let bigAmount = BigInt(amount);

    //accept the offer
    let toks = await contract.market_close_bid_generic(
      payload,
      300000000000000,
      0
    );
    Swal.fire({
      title: option ? t("Detail.swTitOffer-1") : t("Detail.swTitOffer-2"),
      text: option ? t("Detail.swTxtOffer-1") : t("Detail.swTxtOffer-2"),
      icon: "success",
    }).then(function () {
      window.location.reload();
    });
  }

  async function comprar() {
    //evitar doble compra
    setstate({ ...state, btnDisabled: true });
    let account, toks;
    if (localStorage.getItem("blockchain") == "0") {
      return;
    } else {
      let amount = parseFloat(state.tokens.price);
      //console.log("amount", amount)

      //instanciar contracto
      let payload = {
        nft_contract_id: process.env.REACT_APP_CONTRACT,
        token_id: state.tokens.tokenID,
      };
      // let toks = await ext_call(process.env.REACT_APP_CONTRACT_MARKET,"offer",payload,300000000000000,fromNearToYocto(amount))
      const wallet = await selector.wallet();

      wallet
        .signAndSendTransaction({
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
              },
            },
          ],
        })
        .then(() => {
          Swal.fire({
            background: "#0a0a0a",
            width: "800",
            html:
              '<div class="">' +
              '<div class="font-open-sans  text-base font-extrabold text-white mb-4 text-left uppercase">' +
              t("Alerts.buyNFTTit") +
              "</div>" +
              '<div class="font-open-sans  text-sm text-white text-left">' +
              t("Alerts.buyNFTMsg") +
              "</div>" +
              "</div>",
            confirmButtonText: t("Alerts.continue"),
            buttonsStyling: false,
            customClass: {
              confirmButton:
                "font-open-sans uppercase text-base  font-extrabold  text-white  text-center bg-yellow2 rounded-md bg-yellow2 px-3 py-[10px] mx-2",
            },
            confirmButtonColor: "#f79336",
            position: window.innerWidth < 1024 ? "bottom" : "center",
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.href = "/mynfts";
            }
          });
        })
        .catch((err) => {
          console.log("error: ", err);
        });
    }
  }

  async function processCancelOffer(tokenID) {
    let payload = {
      nft_contract_id: process.env.REACT_APP_CONTRACT,
      token_id: tokenID,
    };
    // ext_call(process.env.REACT_APP_CONTRACT_MARKET,"delete_offer",payload,300000000000000,1)
    const wallet = await selector.wallet();
    wallet
      .signAndSendTransaction({
        signerId: accountId,
        receiverId: process.env.REACT_APP_CONTRACT_MARKET,
        actions: [
          {
            type: "FunctionCall",
            params: {
              methodName: "delete_offer",
              args: payload,
              gas: 300000000000000,
              deposit: 1,
            },
          },
        ],
      })
      .then(() => {
        Swal.fire({
          background: "#0a0a0a",
          width: "800",
          html:
            '<div class="">' +
            '<div class="font-open-sans  text-base font-extrabold text-white mb-4 text-left uppercase">' +
            t("Alerts.offerCanTit") +
            "</div>" +
            '<div class="font-open-sans  text-sm text-white text-left">' +
            t("Alerts.offerCanMsg") +
            "</div>" +
            "</div>",
          confirmButtonText: t("Alerts.continue"),
          buttonsStyling: false,
          customClass: {
            confirmButton:
              "font-open-sans uppercase text-base  font-extrabold  text-white  text-center bg-yellow2 rounded-md bg-yellow2 px-3 py-[10px] mx-2",
          },
          confirmButtonColor: "#f79336",
          position: window.innerWidth < 1024 ? "bottom" : "center",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "/token/" + props.tokens.tokenID;
          }
        });
      })
      .catch((err) => {
        console.log("error: ", err);
      });
  }

  async function processAcceptOffer(listed, tokenID) {
    let contract = await getNearContract();
    let amount = fromNearToYocto(0.01);
    let price = "1";
    console.log(state);
    let msgData = JSON.stringify({
      market_type: "accept_offer",
      price: price,
      title: state.jdata.title,
      media: state.jdata.image,
      creator_id: state.jdata.creator,
      description: state.jdata.description,
    });
    let payload = {
      token_id: state.tokens.tokenID,
      account_id: process.env.REACT_APP_CONTRACT_MARKET,
      msg: msgData,
    };
    console.log(payload);
    // let acceptOffer = contract.nft_approve(
    //   payload,
    //   300000000000000,
    //   amount
    // )
    const wallet = await selector.wallet();
    wallet
      .signAndSendTransaction({
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
            },
          },
        ],
      })
      .then(() => {
        Swal.fire({
          background: "#0a0a0a",
          width: "800",
          html:
            '<div class="">' +
            '<div class="font-open-sans  text-base font-extrabold text-white mb-4 text-left uppercase">' +
            t("Alerts.acceptOffTit") +
            "</div>" +
            '<div class="font-open-sans  text-sm text-white text-left">' +
            t("Alerts.acceptOffMsg") +
            "</div>" +
            "</div>",
          confirmButtonText: t("Alerts.continue"),
          buttonsStyling: false,
          customClass: {
            confirmButton:
              "font-open-sans uppercase text-base  font-extrabold  text-white  text-center bg-yellow2 rounded-md bg-yellow2 px-3 py-[10px] mx-2",
          },
          confirmButtonColor: "#f79336",
          position: window.innerWidth < 1024 ? "bottom" : "center",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
      })
      .catch((err) => {
        console.log("error: ", err);
      });
  }

  async function makeAnOffer() {
    console.log("Make a offer");
    setOfferModal({
      ...state,
      show: true,
      title: t("Detail.modalMakeBid"),
      message: t("Detail.modalMsg"),
      loading: false,
      disabled: false,
      change: setOfferModal,
      buttonName: "X",
      tokenId: "hardcoded",
    });
  }

  async function makeAddToken() {
    console.log("Add token to collection");
    setAddTokenModal({
      ...state,
      show: true,
      title: t("Detail.msgAddToken"),
      message: t("Detail.msgAddToken2"),
      loading: false,
      disabled: false,
      change: setAddTokenModal,
      buttonName: "X",
      tokenId: "hardcoded",
    });
  }

  async function putOnSaleConfirm() {
    setPutOnSaleModalConfirm({
      ...state,
      show: true,
      loading: false,
      disabled: false,
      tokenID: "1",
      change: setPutOnSaleModalConfirm,
      buttonName: 'X',
      tokenId: 'hardcoded'
    })
  }

  async function updatePriceConfirm() {
    setUpdatePriceModalConfirm({
      ...state,
      show: true,
      loading: false,
      disabled: false,
      tokenID: "1",
      change: setUpdatePriceModalConfirm,
      buttonName: 'X',
      tokenId: 'hardcoded'
    })
  }

  async function buyTokenConfirm() {
    setBuyTokenModalConfirm({
      ...state,
      show: true,
      loading: false,
      disabled: false,
      tokenID: "1",
      change: setBuyTokenModalConfirm,
      buttonName: 'X',
      tokenId: 'hardcoded'
    })
  }

  async function removeFromSaleConfirm() {
    setRemoveFromSaleModalConfirm({
      ...state,
      show: true,
      loading: false,
      disabled: false,
      tokenID: "1",
      change: setRemoveFromSaleModalConfirm,
      buttonName: 'X',
      tokenId: 'hardcoded'
    })
  }


  //setting state for the offer modal
  const [offerModal, setOfferModal] = useState({
    show: false,
  });

  const [addTokenModal, setAddTokenModal] = useState({
    show: false,
  });
  return (
    <>
      {loaded ? (
        <section className="text-white body-font overflow-hidden dark:bg-[#FAF9FB] font-open-sans">
          <div className="md:container m-auto px-5 py-8 mx-auto">
            <div className="mx-auto flex flex-wrap">
              <div className="w-full md:w-1/2 p-5 ">
                <div className="flex flex-row justify-center ">
                  <div className="trending-token w-full h-full rounded-xl md:shadow-lg ">
                    <div className="bg-transparent md:bg-white rounded-xl">
                      <div className="">
                        <img
                          alt="ecommerce"
                          className=" object-cover rounded-xl w-full  h-80 sm:h-96 lg:h-[500px] md:-border-4  border-white"
                          src={
                            loadInfo
                              ? `https://nativonft.mypinata.cloud/ipfs/${state?.jdata.image}`
                              : loadingGif
                          }
                        />
                      </div>
                      <div className="flex flex-row-reverse p-5">
                        {/* <div className="flex items-center">
                        <p className="font-open-sans text-[#000] text-sm">999</p>
                        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M30.8401 14.6101C30.3294 14.0991 29.7229 13.6938 29.0555 13.4172C28.388 13.1406 27.6726 12.9983 26.9501 12.9983C26.2276 12.9983 25.5122 13.1406 24.8448 13.4172C24.1773 13.6938 23.5709 14.0991 23.0601 14.6101L22.0001 15.6701L20.9401 14.6101C19.9084 13.5784 18.5092 12.9988 17.0501 12.9988C15.5911 12.9988 14.1918 13.5784 13.1601 14.6101C12.1284 15.6418 11.5488 17.0411 11.5488 18.5001C11.5488 19.9591 12.1284 21.3584 13.1601 22.3901L14.2201 23.4501L22.0001 31.2301L29.7801 23.4501L30.8401 22.3901C31.3511 21.8794 31.7565 21.2729 32.033 20.6055C32.3096 19.938 32.4519 19.2226 32.4519 18.5001C32.4519 17.7776 32.3096 17.0622 32.033 16.3948C31.7565 15.7273 31.3511 15.1209 30.8401 14.6101V14.6101Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </div>
                      <div className="flex items-center">
                        <p className="font-open-sans text-[#000] text-sm">3.2k</p>
                        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11 22C11 22 15 14 22 14C29 14 33 22 33 22C33 22 29 30 22 30C15 30 11 22 11 22Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                          <path d="M22 25C23.6569 25 25 23.6569 25 22C25 20.3431 23.6569 19 22 19C20.3431 19 19 20.3431 19 22C19 23.6569 20.3431 25 22 25Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </div>
                      */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2 p-5 flex-col ">
                <div>
                  <a href={"/collection/" + state?.tokens.colID} className="font-open-sans text-base font-normal text-[#0A0A0A]">
                    {state?.tokens.colTitle}
                  </a>
                </div>
                <div>
                  <p className="font-open-sans text-4xl font-semibold text-[#0A0A0A]">
                    {state?.jdata.title}
                  </p>
                </div>
                <div>
                  <p className="font-open-sans text-base font-semibold text-[#0A0A0A]">
                    ID {state?.tokens.tokenID}
                  </p>
                </div>

                {state?.tokens.sale ? (
                  <div className="w-[120px] rounded-20 bg-[#A4A2A4] flex justify-center items-center p-1 my-6">
                    <div className="w-[16px] h-[16px] mr-1">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clip-path="url(#clip0_27_2029)">
                          <path
                            d="M14.6668 7.38667V8C14.666 9.43761 14.2005 10.8364 13.3397 11.9879C12.4789 13.1393 11.269 13.9817 9.8904 14.3893C8.51178 14.7969 7.03834 14.7479 5.68981 14.2497C4.34128 13.7515 3.18993 12.8307 2.40747 11.6247C1.62501 10.4187 1.25336 8.99204 1.34795 7.55754C1.44254 6.12304 1.9983 4.75755 2.93235 3.66471C3.8664 2.57188 5.12869 1.81025 6.53096 1.49343C7.93322 1.17661 9.40034 1.32156 10.7135 1.90667"
                            stroke="#FDFCFD"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M14.6667 2.66667L8 9.34L6 7.34"
                            stroke="#FDFCFD"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_27_2029">
                            <rect width="16" height="16" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                    <p className="font-open-sans text-xs font-semibold text-white uppercase">
                      {t("Detail.available")}
                    </p>
                  </div>
                ) : (
                  <div className="w-[120px] rounded-20 bg-[#A4A2A4] flex justify-center items-center p-1 my-6">
                    <p className="font-open-sans text-xs font-semibold text-white uppercase">
                      {t("Detail.notAvailable")}
                    </p>
                  </div>
                )}
                <div className="flex">
                  <p className="font-open-sans text-base font-normal text-[#0A0A0A] mr-2">
                    {t("Detail.owner")}:
                  </p>
                  <p className="font-open-sans text-base font-semibold text-[#0A0A0A] capitalize">
                    {" " + state?.owner}
                  </p>
                </div>
                <div className="flex">
                  <p className="font-open-sans text-base font-normal text-[#0A0A0A] mr-2">
                    {t("Detail.creator")}:
                  </p>
                  <p className="font-open-sans text-base font-semibold text-[#0A0A0A] capitalize">
                    {" " + state?.jdata.creator}
                  </p>
                </div>
                <div className="w-full rounded-md md:shadow-lg  text-[#0A0A0A] flex lg:p-5 mt-6 overflow-x-hidden">
                  <PriceNft {...state?.tokens}></PriceNft>
                </div>

                <div className="w-full mt-6 overflow-hidden rounded-xl md:shadow-lg">
                  <InformationToken {...state?.tokens}></InformationToken>
                </div>
                {/* Boton historial de precio */}
                <div className="w-full mt-6 overflow-hidden rounded-xl text-[#0A0A0A] md:shadow-lg bg-white">
                  <button className="w-full" onClick={async () => { futureFeatureMsg(t("Navbar.auctions")); }}>
                    <div className="font-open-sans rounded-xl py-6 text-base font-bold">
                      <div className="flex flex-row px-[26px] place-content-between">
                        <div className="flex">
                          <svg
                            className="h-[22px] w-[22px]"
                            width="22"
                            height="12"
                            viewBox="0 0 22 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M2 12C1.45 12 0.979333 11.8043 0.588 11.413C0.196 11.021 0 10.55 0 10C0 9.45 0.196 8.979 0.588 8.587C0.979333 8.19567 1.45 8 2 8H2.263C2.33767 8 2.41667 8.01667 2.5 8.05L7.05 3.5C7.01667 3.41667 7 3.33733 7 3.262V3C7 2.45 7.196 1.979 7.588 1.587C7.97933 1.19567 8.45 1 9 1C9.55 1 10.021 1.19567 10.413 1.587C10.8043 1.979 11 2.45 11 3C11 3.03333 10.9833 3.2 10.95 3.5L13.5 6.05C13.5833 6.01667 13.6627 6 13.738 6H14.262C14.3373 6 14.4167 6.01667 14.5 6.05L18.05 2.5C18.0167 2.41667 18 2.33733 18 2.262V2C18 1.45 18.1957 0.979333 18.587 0.588C18.979 0.196 19.45 0 20 0C20.55 0 21.021 0.196 21.413 0.588C21.8043 0.979333 22 1.45 22 2C22 2.55 21.8043 3.02067 21.413 3.412C21.021 3.804 20.55 4 20 4H19.738C19.6627 4 19.5833 3.98333 19.5 3.95L15.95 7.5C15.9833 7.58333 16 7.66267 16 7.738V8C16 8.55 15.8043 9.02067 15.413 9.412C15.021 9.804 14.55 10 14 10C13.45 10 12.9793 9.804 12.588 9.412C12.196 9.02067 12 8.55 12 8V7.738C12 7.66267 12.0167 7.58333 12.05 7.5L9.5 4.95C9.41667 4.98333 9.33733 5 9.262 5H9C8.96667 5 8.8 4.98333 8.5 4.95L3.95 9.5C3.98333 9.58333 4 9.66267 4 9.738V10C4 10.55 3.804 11.021 3.412 11.413C3.02067 11.8043 2.55 12 2 12Z"
                              fill="#0A0A0A"
                            />
                          </svg>
                          <p className="pl-3.5">{t("Detail.c-historial")}</p>
                        </div>
                        <div className="flex h-[24px] w-[24px] rotate-180">
                          <svg
                            className=""
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="#0A0A0A"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g mask="url(#mask0_1567_19245)">
                              <path
                                d="M7.4 15.3751L6 13.9751L12 7.9751L18 13.9751L16.6 15.3751L12 10.7751L7.4 15.3751Z"
                                fill="#0A0A0A"
                              />
                            </g>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
                {/* Boton actividad */}
                <div className="w-full mt-6 overflow-hidden rounded-xl text-[#0A0A0A] md:shadow-lg bg-white">
                  <button className="w-full" onClick={async () => { futureFeatureMsg(t("Navbar.auctions")); }}>
                    <div className="font-open-sans rounded-xl py-6 text-base font-bold">
                      <div className="flex flex-row px-[26px] place-content-between">
                        <div className="flex">
                          <svg
                          className="w-[20px] h-[20px]"
                            width="18"
                            height="10"
                            viewBox="0 0 18 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M0 10V8H14V10H0ZM0 6V4H14V6H0ZM0 2V0H14V2H0ZM17 10C16.7167 10 16.4793 9.904 16.288 9.712C16.096 9.52067 16 9.28333 16 9C16 8.71667 16.096 8.479 16.288 8.287C16.4793 8.09567 16.7167 8 17 8C17.2833 8 17.5207 8.09567 17.712 8.287C17.904 8.479 18 8.71667 18 9C18 9.28333 17.904 9.52067 17.712 9.712C17.5207 9.904 17.2833 10 17 10ZM17 6C16.7167 6 16.4793 5.904 16.288 5.712C16.096 5.52067 16 5.28333 16 5C16 4.71667 16.096 4.479 16.288 4.287C16.4793 4.09567 16.7167 4 17 4C17.2833 4 17.5207 4.09567 17.712 4.287C17.904 4.479 18 4.71667 18 5C18 5.28333 17.904 5.52067 17.712 5.712C17.5207 5.904 17.2833 6 17 6ZM17 2C16.7167 2 16.4793 1.904 16.288 1.712C16.096 1.52067 16 1.28333 16 1C16 0.716667 16.096 0.479 16.288 0.287C16.4793 0.0956668 16.7167 0 17 0C17.2833 0 17.5207 0.0956668 17.712 0.287C17.904 0.479 18 0.716667 18 1C18 1.28333 17.904 1.52067 17.712 1.712C17.5207 1.904 17.2833 2 17 2Z"
                              fill="#1C1B1F"
                            />
                          </svg>

                          <p className="pl-3.5">{t("Detail.c-actividad")}</p>
                        </div>
                        <div className="flex h-[24px] w-[24px] rotate-180">
                          <svg
                            className=""
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="#0A0A0A"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g mask="url(#mask0_1567_19245)">
                              <path
                                d="M7.4 15.3751L6 13.9751L12 7.9751L18 13.9751L16.6 15.3751L12 10.7751L7.4 15.3751Z"
                                fill="#0A0A0A"
                              />
                            </g>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>


       
        <OfferModal {...offerModal}  />
        <AddTokenModal {...addTokenModal} />
        <PutOnSaleModalConfirm {...putOnSaleModalConfirm} />
        <UpdatePriceModalConfirm {...updatePriceModalConfirm} />
        <BuyTokenModalConfirm {...buyTokenModalConfirm} />
        <RemoveFromSaleModalConfirm {...removeFromSaleModalConfirm} />
      </section>
     ) : (                   
        <section className="text-white body-font overflow-hidden dark:bg-[#FAF9FB] font-open-sans h-screen">
          <div className="md:container m-auto px-5 py-8 mx-auto"></div>
        </section>
      )}
    </>
  );
}

export default TokenDetail;
