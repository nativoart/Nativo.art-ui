/* global BigInt */
import React, { useState } from "react";
import PropTypes from "prop-types";
import { useParams, useHistory } from "react-router-dom";
import { isNearReady } from "../utils/near_interaction";
import { providers, utils } from "near-api-js";
import { nearSignIn, ext_view, ext_call } from "../utils/near_interaction";
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { currencys } from "../utils/constraint";
import {
  fromNearToYocto,
  fromYoctoToNear,
  getNearAccount,
  getNearContract,
} from "../utils/near_interaction";
import flechaiz from '../assets/landingSlider/img/flechaIz.png'
import defaultUser from '../assets/img/defaultUser.png'
import ReactHashtag from "react-hashtag";
import { useTranslation } from "react-i18next";
import Swal from 'sweetalert2'
import { date } from "yup";
import { useWalletSelector } from "../utils/walletSelector";
import ofertas from '../assets/img/profile/APROVAL.png';
import { Tab  } from "@headlessui/react";
import MyAcquisitions from "../components/MyAcquisitions.component";
import MyCreations from "../components/MyCreations.component";
import MyCollections from "../components/MyCollections.component";

function LightEcommerceB(props) {
  const { selector, modal, accounts, accountId } = useWalletSelector();
  //guarda el estado de  toda la vista
  const [state, setstate] = useState();
  const [btn, setbtn] = useState(true);
  const [t, i18n] = useTranslation("global")
  const [stateLogin, setStateLogin] = useState(false);
  const [hasRoyalty, setHasRoyalty] = useState(false)
  const [myProfile, setMyProfile] = useState(false)
  const [hasBids, setHasBids] = useState(false)
  //es el parametro de tokenid
  const { user } = useParams();

  const handleLanguage = () => {
    if (window.localStorage.getItem("LanguageState") == "en") {
      i18n.changeLanguage("es")
      window.localStorage.setItem("LanguageState", "es")
    }
    else {
      i18n.changeLanguage("en")
      window.localStorage.setItem("LanguageState", "en")
    }
  }

  const handleEditProfile = () => {
    console.log('editProfile')
    window.location.href = '/profileData/edit'
  }

  async function addNTVToken() {
    let account = accountId
    let payload = {
      receiver_id: account,
      amount: "0",
      memo: ":"
    }
    const wallet = await selector.wallet();
    Swal.fire({
      title: t("Footer.msg-ntv-title"),
      text: t("Footer.msg-ntv-desc"),
      icon: 'warning',
      confirmButtonColor: '#E79211',
      confirmButtonText: t("Footer.msg-ntv-btn")
    }).then(async (result) => {
      if (result.isConfirmed) {
        console.log("Transfer NTV")
        // ext_call(process.env.REACT_APP_CONTRACT_TOKEN, 'ft_transfer', payload, 300000000000000, 1)
        wallet.signAndSendTransaction({
          signerId: accountId,
          receiverId: process.env.REACT_APP_CONTRACT_TOKEN,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "ft_transfer",
                args: payload,
                gas: 300000000000000,
                deposit: 1,
              }
            }
          ]
        })
      }
    })
  }
  //es el historial de busqueda
  //let history = useHistory();
  const APIURL = process.env.REACT_APP_API_TG

  React.useEffect(() => {
    (async () => {
      setStateLogin(await isNearReady());
      let ownerAccount = await accountId;

      // let contract = await getNearContract();
      let totalTokensByOwner = 0;
      let totalTokensByCreator = 0;
      if (localStorage.getItem("blockchain") == "0") {

      } else {
        let userData
        let account
        if (process.env.REACT_APP_NEAR_ENV == 'mainnet') {
          account = user + '.near'
        }
        else {
          account = user + '.testnet'
        }

        let paramsSupply = {
          account_id: account
        };
        const args_b64 = btoa(JSON.stringify(paramsSupply))
        const { network } = selector.options;
        const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });
        const owner = await provider.query({
          request_type: "call_function",
          account_id: process.env.REACT_APP_CONTRACT,
          method_name: "nft_supply_for_owner",
          args_base64: args_b64,
          finality: "optimistic",
        })
        totalTokensByOwner = JSON.parse(Buffer.from(owner.result).toString())
        const creator = await provider.query({
          request_type: "call_function",
          account_id: process.env.REACT_APP_CONTRACT,
          method_name: "nft_supply_for_creator",
          args_base64: args_b64,
          finality: "optimistic",
        })
        totalTokensByCreator = JSON.parse(Buffer.from(creator.result).toString())
        if (account == accountId) {
          setMyProfile(true)
        }
        const query = `
          query ($account: String){
            profiles (where : {id : $account}){
              id
              username
              media
              biography
              socialMedia
              tokCreated
              tokBought
              timestamp
            }
          }
        `
        const client = new ApolloClient({
          uri: APIURL,
          cache: new InMemoryCache(),
        })

        await client.query({
          query: gql(query),
          variables: {
            account: account
          }
        })
          .then((data) => {
            console.log('profile: ', data.data.profiles.length)
            if (data.data.profiles.length <= 0) {
              if (account == ownerAccount) {
                window.location.href = '/profileData/create'
              }
              else {
                let date = new Date().getTime()
                userData = {
                  username: account,
                  media: "",
                  biography: "El usuario no ha guardado la informacion de su perfil",
                  socialMedia: "No ha registrado su Twitter",
                  tokCreated: 0,
                  tokBought: 0,
                  timestamp: date.toString()
                }
              }
            }
            else {
              userData = data.data.profiles[0]
            }
          })
          .catch((err) => {
            console.log('error: ', err)
          })
        let date = new Date(0)
        date.setUTCSeconds(userData.timestamp.substr(0, 10))
        setstate({
          ...state,
          data: {
            account: userData.username,
            media: userData.media,
            biography: userData.biography,
            socialMedia: userData.socialMedia,
            tokCreated: totalTokensByCreator,
            tokBought: totalTokensByOwner,
            timestamp: date,
          },
        });


      }
    })();
  }, []);

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }


  return (
    <>
      <section className="text-gray-600 body-font bg-Hero_mobile_2 lg:bg-Hero_profile  h-[823px] lg:h-[421px] bg-no-repeat bg-cover bg-center ">
        <div className="container m-auto py-8 ">
          
          <div className="lg:w-full  flex flex-wrap ">
            {/*Profile Pic*/}
            <div className="xl:w-1/3 2xl:w-1/4 w-full lg:h-auto h-64 flex px-5">
              <img
                alt="ecommerce"
                className=" object-contain md:object-contain rounded-xlarge shadow-yellow2 lg:h-auto h-64 lg:w-[339px] my-auto "
                src={state?.data.media == "" ? defaultUser : `https://nativonft.mypinata.cloud/ipfs/${state?.data.media}`}
              />
            </div>

            <div className="xl:w-1/3 2xl:w-2/4 w-full lg:mt-auto lg:flex flex-col">

              {/*User account*/}
              <h1 className="text-white text-3xl text-left title-font font-bold  font-raleway text-ellipsis overflow-hidden leading-8">
                {state?.data.account}
              </h1>

              {/*Twitter account*/}
              <div
                className={`flex py-2  my-2  rounded-xlarge content-start `}
              >
                <div className="w-[24px] h-[24px]">
                <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.1572 3.47754C16.1682 3.62909 16.1682 3.78065 16.1682 3.9336C16.1682 8.59405 12.4534 13.969 5.6607 13.969V13.9662C3.65411 13.969 1.68921 13.42 0 12.385C0.291773 12.4185 0.585009 12.4353 0.878976 12.436C2.54186 12.4374 4.15722 11.9045 5.46545 10.9232C3.88519 10.8946 2.49945 9.91055 2.01536 8.47393C2.56892 8.57589 3.13931 8.55494 3.68263 8.41317C1.95978 8.08073 0.720293 6.63503 0.720293 4.95606C0.720293 4.9407 0.720293 4.92603 0.720293 4.91137C1.23364 5.18444 1.80841 5.336 2.39634 5.35276C0.773675 4.31702 0.273492 2.25533 1.25338 0.643414C3.12834 2.84688 5.8947 4.18642 8.86435 4.3282C8.56673 3.1032 8.97331 1.81953 9.93272 0.958395C11.4201 -0.376955 13.7594 -0.308512 15.1576 1.11135C15.9846 0.955601 16.7773 0.665763 17.5027 0.255101C17.2271 1.07154 16.6501 1.76505 15.8793 2.20575C16.6113 2.12333 17.3265 1.93616 18 1.65051C17.5042 2.36009 16.8797 2.97818 16.1572 3.47754Z" fill="#FDFCFD" />
                </svg>
                </div>
                <span className="font-open-sans text-white font-normal pr-3  text-base leading-6 ml-3">
                  <a href={`https://twitter.com/${state?.data.socialMedia}`}>{state?.data.socialMedia}</a>
                </span>
              </div>

              {/*User description*/}
              <div
                className={`flex-col py-2  my-2  rounded-xlarge`}
              >
                <div>
                  <span className=" text-white  text-base pr-3 font-open-sans  font-normal leading-6">
                    {state?.data.biography}
                  </span>
                </div>
              </div>
            </div>
            {myProfile ? 
              <div className=" xl:w-1/3 2xl:w-1/4 w-full  l lg:flex flex-col px-6">
                <div className="flex flex-col mt-auto">
                  <div className="flex justify-between mb-3">
                    <button className="rounded-xl bg-white w-1/2 h-[96px] mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" >
                        <path d="M22 12H18L15 21L9 3L6 12H2" stroke="#F79336" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                      <p className="font-open-sans font-bold text-base leading-6 text-center text-black mt-1">Actividad</p>
                    </button>
                    <button className="rounded-xl bg-white w-1/2 h-[96px]  ml-2">
                      <img
                        alt={ofertas}
                        className="w-[24px] h-[24px] m-auto"
                        src={ofertas}
                      />
                      <p className="font-open-sans font-bold text-base leading-6 text-center text-black mt-1">Ofertas</p>
                    </button >
                  </div>
                </div>
                <button className="flex rounded-xlarge w-full h-[50px]  mt-0 lg:mx-auto"  >
                  <div className="flex flex-col font-bold h-full text-white  text-center  justify-center shadow-s w-full bg-yellow4 hover:bg-yellowHover active:bg-yellowPressed rounded-md">
                    <span className="title-font  text-white font-open-sans font-extrabold lg:font-semibold text-base  uppercase leading-6">CREATE</span>
                  </div>
                </button>
              </div>
             : <></>}
          </div>
        { /*User secitons*/}
        </div>
      </section>
      <div className="w-full bg-white container mx-auto">
            <div className="font-open-sans font-bold text-3xl text-black">
              <p className="p-5">User's NFTs</p>
            </div>
            <Tab.Group>
                <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 w-3/4">
                  <Tab
                    key={"MisTokens"}
                    className={({ selected }) =>
                      classNames(
                        'w-full  py-2.5   leading-8 font-bold text-2xl ',
                        'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 font-raleway  font-bold ',
                        selected
                          ? 'bg-white  text-darkgray  border-b-2 border-yellow2'
                          : 'font-open-sans text-[#616161] '
                      )
                    }
                  >
                   Adquisiciones
                   
                  </Tab>
                  <Tab
                    key={"Creaciones"}
                    className={({ selected }) =>
                      classNames(
                        'w-full  py-2.5   leading-8 font-bold text-2xl ',
                        'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 font-raleway  font-bold ',
                        selected
                          ? 'bg-white  text-darkgray  border-b-2 border-yellow2'
                          : 'font-open-sans text-[#616161] '
                      )
                    }
                  >
                    Creaciones
                  </Tab>
                  <Tab
                    key={"Colecciones"}
                    className={({ selected }) =>
                      classNames(
                        'w-full  py-2.5   leading-8 font-bold text-2xl',
                        'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 font-raleway  font-bold ',
                        selected
                          ? 'bg-white  text-darkgray  border-b-2 border-yellow2'
                          : 'font-open-sans text-[#616161] '
                      )
                    }
                  >
                    Colecciones
                  </Tab>
 
                </Tab.List>
                <Tab.Panels className="mt-2 bg-white">
                  <Tab.Panel
                    key={"MisTokens"}
                    className={classNames(
                      'rounded-xl  bg-white'
                    )}
                  >
                  <MyAcquisitions />
                  </Tab.Panel>

                  <Tab.Panel
                    key={"Creaciones"}
                    className={classNames(
                      'rounded-xl   bg-white'
                    )}
                  >
                    <MyCreations />

                  </Tab.Panel>

                  <Tab.Panel
                    key={"Colecciones"}
                    className={classNames(
                      'rounded-xl  bg-white'
                    )}
                  >
                  <MyCollections />
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>

          </div>
    </>
  );
}

LightEcommerceB.defaultProps = {
  theme: "yellow",
};

LightEcommerceB.propTypes = {
  theme: PropTypes.string.isRequired,
};

export default LightEcommerceB;