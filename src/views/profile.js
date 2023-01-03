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
import nullPicProfile from "../assets/img/profile/nullprofilepic.png";
import nullBanner from "../assets/img/profile/nullBanner.png";
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
              mediaBanner
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
                  mediaBanner: "",
                  biography: "",
                  socialMedia: "",
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
            mediaBanner: userData.mediaBanner,
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

  function clickTab(evt) {
    console.log('evt',evt);
  }

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  async function handleCreatebutton() {
      Swal.fire({
        background: '#0a0a0a',
        width: '800',
        heightAuto: false,
        html:
          '<div class=" flex flex-col overflow-hidden">' +
          '<div class="font-open-sans  text-base font-extrabold text-white my-4 text-left w-full uppercase">' +  t("Navbar.createMsg") + '</div>' +
          '</div>',
        showCloseButton: true,
        confirmButtonText:  t("Navbar.create"),
        cancelButtonText:  t("Navbar.createCollection"),
        showCancelButton: true,
        showConfirmButton: true,
        buttonsStyling: false,
        customClass: {
          confirmButton: 'flex py-2 w-full h-[40px]  mt-0 ml-5  lg:w-[200px] title-font  text-white font-open-sans font-normal lg:font-extrabold text-base uppercase leading-6  justify-center hover:text-textOutlineHover active:text-textOutlinePressed flex flex-col font-extrabold h-full text-white  text-center  justify-center shadow-s w-full border-solid border-2 rounded-md border-white2 hover:bg-outlineHover active:bg-outlinePressed " ',
          cancelButton: 'flex py-2 w-full h-[40px]  mt-0 ml-5  lg:w-[200px] title-font  text-white font-open-sans font-normal lg:font-extrabold text-base uppercase leading-6  justify-center hover:text-textOutlineHover active:text-textOutlinePressed flex flex-col font-extrabold h-full text-white  text-center  justify-center shadow-s w-full border-solid border-2 rounded-md border-white2 hover:bg-outlineHover active:bg-outlinePressed " ',
        },
        position: window.innerWidth < 1024 ? 'bottom' : 'center'
      }).then((result) => {
          if (result.isConfirmed) {
              window.location.href = "/create"
          } 
          if(result.dismiss == 'cancel') {
              window.location.href = "/collectionData/create" 
          }
        });

  }




  return (
    <>
      <section className="text-gray-600 body-font h-full  xl:h-[421px] bg-no-repeat bg-cover bg-center ">
        <div className="  w-full absolute z-0" >
        <img
                alt="ecommerce"
                className=" xl:h-[421px] h-56 object-cover w-full my-auto "
                src={state?.data.mediaBanner == "" ? nullBanner : `https://nativonft.mypinata.cloud/ipfs/${state?.data.mediaBanner}`} />

        </div>
        
        <div className="container m-auto py-6 xl:py-8 inherit z-10 relative ">
          
          <div className="xl:w-full  flex flex-wrap xl:h-[339px]">
            {/*Profile Pic*/}
            <div className="xl:w-1/3 2xl:w-1/4 w-full xl:h-64 flex px-5">
              <img
                alt="ecommerce"
                className={`rounded-xlarge w-[180px]  h-[180px] xl:h-[339px] xl:w-[339px] xl:my-auto  ${state?.data.media != "" ? 'object-cover border-4 border-white ' : "" }`}
                src={state?.data.media == "" ? nullPicProfile : `https://nativonft.mypinata.cloud/ipfs/${state?.data.media}`}
              />
              {myProfile ?
                <div className="flex justify-end xl:hidden absolute top-[20px] right-[20px]">
                  <button className="w-[24px]" onClick={handleEditProfile}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="#FDFCFD" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M18.5 2.49998C18.8978 2.10216 19.4374 1.87866 20 1.87866C20.5626 1.87866 21.1022 2.10216 21.5 2.49998C21.8978 2.89781 22.1213 3.43737 22.1213 3.99998C22.1213 4.56259 21.8978 5.10216 21.5 5.49998L12 15L8 16L9 12L18.5 2.49998Z" stroke="#FDFCFD" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </button>
                </div>
                : ""}
            </div>

            <div className="xl:w-1/3 2xl:w-2/4  w-full  xl:mt-auto xl:flex flex-col px-5 xl:px-0 pt-10">
              <div className="-ml-0 xl:-ml-11 2xl:-ml-0">
                {/*User account*/}
                <h1 className=" text-[#0A0A0A] xl:text-white text-2xl text-left title-font font-bold  font-open-sans text-ellipsis  leading-8">
                  {state?.data.account}
                </h1>

                {/*Twitter account*/}
                {state?.data.socialMedia ? 
                  <div
                    className={`flex py-0  my-0 xl:py-2  xl:my-2  rounded-xlarge content-start items-center`}>
                    <div className="w-[24px] h-[24px] text-[#0A0A0A] xl:text-white hidden xl:flex items-center ">
                      <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.1572 3.47754C16.1682 3.62909 16.1682 3.78065 16.1682 3.9336C16.1682 8.59405 12.4534 13.969 5.6607 13.969V13.9662C3.65411 13.969 1.68921 13.42 0 12.385C0.291773 12.4185 0.585009 12.4353 0.878976 12.436C2.54186 12.4374 4.15722 11.9045 5.46545 10.9232C3.88519 10.8946 2.49945 9.91055 2.01536 8.47393C2.56892 8.57589 3.13931 8.55494 3.68263 8.41317C1.95978 8.08073 0.720293 6.63503 0.720293 4.95606C0.720293 4.9407 0.720293 4.92603 0.720293 4.91137C1.23364 5.18444 1.80841 5.336 2.39634 5.35276C0.773675 4.31702 0.273492 2.25533 1.25338 0.643414C3.12834 2.84688 5.8947 4.18642 8.86435 4.3282C8.56673 3.1032 8.97331 1.81953 9.93272 0.958395C11.4201 -0.376955 13.7594 -0.308512 15.1576 1.11135C15.9846 0.955601 16.7773 0.665763 17.5027 0.255101C17.2271 1.07154 16.6501 1.76505 15.8793 2.20575C16.6113 2.12333 17.3265 1.93616 18 1.65051C17.5042 2.36009 16.8797 2.97818 16.1572 3.47754Z" fill="#FDFCFD" />
                      </svg>
                    </div>
                    <div className="w-[24px] h-[24px] xl:hidden flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="15" viewBox="0 0 18 15" fill="none">
                        <path d="M16.1572 3.53809C16.1682 3.68964 16.1682 3.84119 16.1682 3.99415C16.1682 8.6546 12.4534 14.0295 5.6607 14.0295V14.0267C3.65411 14.0295 1.68921 13.4806 0 12.4455C0.291773 12.4791 0.585009 12.4958 0.878976 12.4965C2.54186 12.4979 4.15722 11.965 5.46545 10.9838C3.88519 10.9551 2.49945 9.97109 2.01536 8.53447C2.56892 8.63644 3.13931 8.61549 3.68263 8.47371C1.95978 8.14127 0.720293 6.69557 0.720293 5.01661C0.720293 5.00125 0.720293 4.98658 0.720293 4.97191C1.23364 5.24499 1.80841 5.39654 2.39634 5.4133C0.773675 4.37757 0.273492 2.31588 1.25338 0.703961C3.12834 2.90743 5.8947 4.24697 8.86435 4.38874C8.56673 3.16374 8.97331 1.88007 9.93272 1.01894C11.4201 -0.316408 13.7594 -0.247965 15.1576 1.17189C15.9846 1.01615 16.7773 0.72631 17.5027 0.315648C17.2271 1.13208 16.6501 1.8256 15.8793 2.26629C16.6113 2.18388 17.3265 1.99671 18 1.71106C17.5042 2.42064 16.8797 3.03873 16.1572 3.53809Z" fill="#0A0A0A" />
                      </svg>
                    </div>
                    <span className="font-open-sans text-[#0A0A0A] xl:text-white font-normal pr-3  text-base leading-6  flex items-center">
                      <a href={`https://twitter.com/${state?.data.socialMedia}`}>{state?.data.socialMedia}</a>
                    </span>
                  </div> : "" }
                

                {/*User description*/}
                {state?.data.biography ? <div
                  className={`flex-col py-2  my-2  rounded-xlarge`}>
                  <div>
                    <span className=" text-[#0A0A0A] xl:text-white  text-base pr-3 font-open-sans  font-normal leading-6">
                      {state?.data.biography}
                    </span>
                  </div>
                </div> : ""
                } 
                
              </div>
            </div>
            {myProfile ? 
              <div className=" xl:w-1/3 2xl:w-1/4 w-full xl:flex flex-col px-6">
                <div className="hidden xl:flex justify-end ">
                  <button className="w-[24px]" onClick={handleEditProfile}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="#FDFCFD" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M18.5 2.49998C18.8978 2.10216 19.4374 1.87866 20 1.87866C20.5626 1.87866 21.1022 2.10216 21.5 2.49998C21.8978 2.89781 22.1213 3.43737 22.1213 3.99998C22.1213 4.56259 21.8978 5.10216 21.5 5.49998L12 15L8 16L9 12L18.5 2.49998Z" stroke="#FDFCFD" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </button>
                  </div> 
                <div className="flex flex-col mt-auto">
                  <div className="flex justify-between mb-3 ">
                    <button className="rounded-xl bg-white w-1/2 h-[96px] mr-2 shadow-md">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" >
                        <path d="M22 12H18L15 21L9 3L6 12H2" stroke="#F79336" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                      <p className="font-open-sans font-bold text-base leading-6 text-center text-black mt-1 ">{t("MyNFTs.userActivity")}</p>
                    </button>
                    <button className="rounded-xl bg-white w-1/2 h-[96px]  ml-2 shadow-md">
                      <img
                        alt={ofertas}
                        className="w-[24px] h-[24px] m-auto"
                        src={ofertas}
                      />
                      <p className="font-open-sans font-bold text-base leading-6 text-center text-black mt-1 ">{t("MyNFTs.userBids")}</p>
                    </button >
                  </div>
                </div>
                <button className="flex rounded-xlarge w-full h-[50px]  mt-0 xl:mx-auto" onClick={() => handleCreatebutton()} >
                  <div className="flex flex-col font-bold h-full text-white  text-center  justify-center shadow-s w-full bg-yellow4 hover:bg-yellowHover active:bg-yellowPressed rounded-md">
                    <span className="title-font  text-white font-open-sans font-extrabold xl:font-semibold text-base  uppercase leading-6">{t("MyNFTs.userCreate")}</span>
                  </div>
                </button>
              </div>
             : <></>}
          </div>
        { /*User secitons*/}
        </div>
      
      </section>
      <div className="w-full bg-white container mx-auto py-5">
            <div className="font-open-sans font-bold text-3xl text-black px-5">
              <p className="">{t("MyNFTs.userNft")}</p>
            </div>
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 lg:px-5 w-full lg:w-1/2 overflow-scroll lg:overflow-hidden">
            <Tab
              key={"MisTokens"}
              className={({ selected }) =>
                classNames(
                  'w-[500px] lg:w-full  px-4 py-1.5    leading-8 font-bold text-base lg:text-2xl ',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 font-open-sans  font-bold ',
                  selected
                    ? 'bg-white  text-darkgray  border-b-2 border-yellow2 direction-rtl'
                    : 'font-open-sans text-[#616161] '
                )
              }
            >
              {t("MyNFTs.adquisitions")}
            </Tab>
            <Tab
              key={"Creaciones"}
              className={({ selected }) =>
                classNames(
                  'w-[500px] lg:w-full px-4 py-1.5   leading-8 font-bold text-base lg:text-2xl',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 font-open-sans    font-bold ',
                  selected
                    ? 'bg-white  text-darkgray  border-b-2 border-yellow2'
                    : 'font-open-sans text-[#616161] '
                )
              }
            >
              {t("MyNFTs.creations")}
            </Tab>
            <Tab
              key={"Colecciones"}
              className={({ selected }) =>
                classNames(
                  'w-[500px] lg:w-full  px-4 py-1.5    leading-8 font-bold text-base lg:text-2xl',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 font-open-sans    font-bold ',
                  selected
                    ? 'bg-white  text-darkgray  border-b-2 border-yellow2 direction-ltr'
                    : 'font-open-sans text-[#616161] '
                )
              }
            >
              {t("MyNFTs.collections")}
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