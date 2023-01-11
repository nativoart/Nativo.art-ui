import React, { useCallback, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import ImageSlider from "./imageSlider.component";
import { useWalletSelector } from "../utils/walletSelector";
import { useTranslation } from "react-i18next";
import verifyImage from '../assets/img/Check.png';
import rocket from '../assets/img/Rocket.png';
import arrowRight from '../assets/img/landing/firstSection/ARROW.png';
import plus from '../assets/img/landing/firstSection/plus.png';


function LightHeroE(props) {
  const { selector, modal, accounts, accountId } = useWalletSelector();
  const [t, i18n] = useTranslation("global");
  const [stateLogin, setStateLogin] = useState(false);

  useEffect(() => {
    (async () => {
      setStateLogin(accountId !=null ? true : false);
    })();
  }, []);

  const handleSignIn = () =>{
    modal.show()
  }

  return (
    <section className="text-gray-600 body-font bg-White_gift lg:bg-White_gift h-[823px] lg:h-[594px] bg-no-repeat bg-cover bg-top ">
      <div className="container mx-auto pt-4 flex px-5 lg:px-0 pb-10 flex-col items-center  lg:items-center  justify-center ">
        <div className=" h-[763px] bg-white rounded-lg lg:h-[564px] lg:flex-grow flex flex-col md:text-center items-center lg:items-center" >
          <img class="h-[150px] mt-6 lg:h-[150px] bg-center w-[150px] lg:w-[150px] " src="/static/media/ntvToken.340716be.png" alt="/static/media/ntvToken.340716be.png"></img>
        <div className="w-full z-20 mt-6 lg:mt-[16px] ">
            <p className="dark:text-black text-[16px]  lg:text-2xl md:text-2xl font-clash-grotesk font-semibold leading-9 tracking-wider text-center w-[343px] lg:w-[700px]">{t("Landing.giftclaim")}</p>
          </div>
          <Link>
            <button className="flex inline-flex rounded-xlarge w-full lg:w-[267px] h-[50px]" onClick={createDrop}>
                <div className="flex flex-col font-bold h-full text-white  text-center  justify-center shadow-s w-full bg-yellow4 hover:bg-yellowHover active:bg-yellowPressed rounded-md">
                <svg className="fill-current w-[342px] h-[48px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>
                  <span className="title-font text-white font-open-sans font-normal lg:font-semibold text-base p-3 uppercase leading-6">{t("Landing.giftnewaccount")} </span>
                </div>
            </button>
            </Link>
          <p className=" lg:mt-[13px] lg:text-1xl text-base dark:text-black z-20 font-open-sans font-semibold text-center leading-6 tracking-wider w-[343px] lg:w-[630px]">
            {t("Landing.giftOr")}
          </p>
            <Link>
            <button className="flex inline-flex rounded-xlarge w-full lg:w-[267px] h-[50px]" onClick={createDrop}>
                <div className="flex flex-col font-bold h-full text-white  text-center  justify-center shadow-s w-full bg-yellow4 hover:bg-yellowHover active:bg-yellowPressed rounded-md">
                <svg className="fill-current w-[342px] h-[48px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>
                  <span className="title-font text-white font-open-sans font-normal lg:font-semibold text-base p-3 uppercase leading-6">{t("Landing.giftLogIn")} </span>
                </div>
            </button>
            </Link>
          <p className="mt-2 lg:mt-[23px] lg:text-1xl text-base dark:text-black z-20 font-clash-grotesk font-semibold text-center leading-6 tracking-wider w-[343px] lg:w-[630px]">
            {t("Landing.giftown")}
          </p>
          <Link>
            <button className="flex inline-flex rounded-xlarge w-full lg:w-[267px] h-[50px]" onClick={createDrop}>
                <div className="flex flex-col font-bold h-full text-white  text-center  justify-center shadow-s w-full bg-yellow4 hover:bg-yellowHover active:bg-yellowPressed rounded-md">
                <svg className="fill-current w-[342px] h-[48px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>
                  <span className="title-font text-white font-open-sans font-normal lg:font-semibold text-base p-3 uppercase leading-6">{t("Landing.giftDrops")} </span>
                </div>
            </button>
            </Link>
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
