import  React, {useState, useEffect} from "react";
import {
  getNearAccount,
  ext_view,
  fromYoctoToNear
} from "../utils/near_interaction";
import InfiniteScroll from "react-infinite-scroll-component";
import dayjs from 'dayjs';
import { useTranslation } from "react-i18next";
import AuctionCard from "../components/auctionCard.component";


function Auctions() {

  const [t, i18n] = useTranslation("global")
  const [auctions, setAuctions] = useState({
    total_active: 0,
    all: [],
    hasMore: true,
    lastIDfetched: -1
  });
  const [index,setIndex] = React.useState(0);
  const [Landing, setLanding] = React.useState({
    tokensPerPage: 9
  });


  useEffect(() => {
    (async () => {
      let contract = process.env.REACT_APP_CONTRACT_AUCTIONS;
      let account = await getNearAccount();
      let payload = {};
      let total = [];
      total = await ext_view(contract, 'get_auctions_stats', payload)

      if ((total.total_auctions-1) >= 0) {
        if((total.total_auctions-1)<=Landing.tokensPerPage){

          let payload = {
            from_index: (0).toString(),
            limit: total.total_auctions,
          }
          setIndex(0)
          let all_auctions = await ext_view(contract, 'get_all_nfts_for_auction', payload).then(results => {
            //do any results transformations
            console.log('result', results);
            return results;
          });

          setAuctions({ ...auctions, all: all_auctions.reverse()});
          //setIndex(total.total_auctions - 1);
        } else {
          let payload = {
            from_index: ((total.total_auctions)-Landing.tokensPerPage).toString(),
            limit: Landing.tokensPerPage,
          };
  
          let all_auctions = await ext_view(contract, 'get_all_nfts_for_auction', payload).then(results => {
            //do any results transformations
            console.log('result', results);
            return results;
          });
          setIndex((total.total_auctions - 1)-Landing.tokensPerPage)
          setAuctions({ ...auctions, all: auctions.all.concat(all_auctions.reverse())});

        }
      }
      
    })();
  }, []);

  let fetchMoreAuctions = async () => {
    let contract = process.env.REACT_APP_CONTRACT_AUCTIONS;
    let total = await ext_view(contract, 'get_last_auction');

    let limit = true;
    let indexQuery;
    let lastLimit;
    if(index>Landing.tokensPerPage){
      indexQuery = index-Landing.tokensPerPage
      setIndex(index-Landing.tokensPerPage)
    }
    else{
      indexQuery=0
      lastLimit=parseInt(index)
      limit=false
      setIndex(0)
    }
    if (index<=0) {
      setAuctions({ ...auctions, hasMore: false});
      return;
    }
    let payload = {
      from_index: indexQuery.toString(),
      limit: (limit ? Landing.tokensPerPage: lastLimit),
    }


    let all_auctions = await ext_view(contract, 'get_all_nfts_for_auction', payload).then(results => {
      //do any results transformations
      console.log('result', results);
      return results;
    });
    setAuctions({ ...auctions, all: auctions.all.concat(all_auctions.reverse())});
  }
      


  
  return (
    <section className="text-gray-600 body-font  dark:bg-darkgray ">
      <div className="flex flex-col text-center w-full">
        <div className="w-full h-[30px] flex my-8 justify-center">
          <p className="text-3xl lg:text-6xl font-black   dark:text-white  bg-darkgray m-0 px-10 font-raleway uppercase self-center">
          {t("auctions.au_title")}
          </p>
        </div>
        <p className="lg:w-full leading-relaxed text-base bg-white text-darkgray font-raleway">
        {t("auctions.au_subtitle")}
       </p>
      </div>
        <div className="container px-5 pt-5 mx-auto asda">
          <div className="flex flex-col text-center w-full">
            <div className="w-full  px-2 py-5 sm:px-0">
           {auctions.all.length !=0 ? 
           <InfiniteScroll
            dataLength={auctions.all}
            next={fetchMoreAuctions}
            hasMore={auctions.hasMore}
            loader={<h1 className="text-center w-full py-10 text-xl font-bold text-yellow2"> {t("auctions.au_loading")}</h1>}
            endMessage={
              <p className="text-center w-full py-10 text-xl text-yellow2">
                <b>{t("auctions.au_finish")}</b>
              </p>
            }
            className={"flex flex-wrap md:px-[40px]"}
          >
            {auctions.all.map((nft, key) => {
              return (
                <AuctionCard {...nft}></AuctionCard>
              )
            })}
            </InfiniteScroll>
           : <>{t("auctions.au_notAvailable")}</> }
            </div>
          </div>
          </div>
      </section>
  );
}

export default Auctions;
