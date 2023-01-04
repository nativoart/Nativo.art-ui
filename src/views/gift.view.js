import React, { useEffect } from "react";

//components
import Gift from "../components/gift.component";
import Aos from "aos";
import "aos/dist/aos.css";
import { useTranslation } from "react-i18next";


export default function LandingGift() {
  const [Landing, setLanding] = React.useState({ theme: "yellow" });
  window.localStorage.setItem("page",0);
  window.localStorage.setItem("auctionpage",0);
  window.localStorage.setItem("tokenspage",30);
  useEffect(() => {
    Aos.init({
      duration:2000,
      once: true
    });
  });
  return (
    <div>
      <Gift />
    </div>
  );
}
