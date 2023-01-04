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
      <div className="container mx-auto lg:pl-28 flex px-5 lg:px-0 pb-10 flex-col items-center  lg:items-start  justify-center ">
        <div className=" h-[823px] lg:h-[594px] lg:flex-grow  flex flex-col md:text-left items-center lg:items-start" >
          <img class="near-logo" src="near-logo.c27c19c0.svg" alt="NEAR logo" height="32">
            <div class="empty-icon">🧧</div>
              <p class="empty-title h5">NEAR Redpackets</p>
                <p class="empty-subtitle">Login and Send NEAR Redpackets.</p>
                  <div class="empty-action"><div class="near-user">
                     <a class="btn" href="#"><div img class="btn-icon" src="icon-account.607c457b.svg" alt="NEAR user" height="40"></div>
                      <span class="text-ellipsis">Login with NEAR</span>
                      </a>                            
                  </div>
                </div>
          </img>
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
