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
import { Tab  } from "@headlessui/react";
import MyAuctions from "./MyAuctions.view";

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
  const [account, setAccount] = React.useState("");


  useEffect(() => {
    (async () => {
      let contract = process.env.REACT_APP_CONTRACT_AUCTIONS;
      let account = await getNearAccount();
      setAccount(account);
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

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
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
        <Tab.Group>
            <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
              <Tab
                key={"MyAuctions"}
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-xs md:text-lg font-medium leading-5 ',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 font-raleway  font-bold ',
                    selected
                      ? 'bg-white shadow text-darkgray'
                      : 'text-blue-100 hover:bg-white/[0.12] text-white '
                  )
                }
              >
                 {t("auctions.au_liveAuctions")}

              </Tab>
              {account ? <Tab
                key={"Creaciones"}
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-xs md:text-lg font-medium leading-5 ',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 font-raleway font-bold ',
                    selected
                      ? 'bg-white shadow text-darkgray'
                      : 'text-blue-100 hover:bg-white/[0.12]  text-white'
                  )
                }
              >
               {t("auctions.au_myAuctions")}
              </Tab> : ""}
            </Tab.List>
            <Tab.Panels className="mt-2 bg-darkgray">
              <Tab.Panel
                key={"LiveAuctions"}
                className={classNames(
                  'rounded-xl  bg-darkgray'
                )}
              >
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
                <AuctionCard {...nft} key={key}></AuctionCard>
              )
            })}
            </InfiniteScroll>
           : 
           <div className="text-yellow2 text-2xl w-full text-center mt-6 font-bold">
            <p>{t("auctions.au_notAvailable")}</p>
           </div> }
            </div>
          </div>
              </Tab.Panel>
              {account ? <Tab.Panel
                key={"MyAuctions"}
                className={classNames(
                  'rounded-xl  bg-darkgray'
                )}
              >
                <MyAuctions></MyAuctions>
              </Tab.Panel> : ""}
            </Tab.Panels>
        </Tab.Group>

          </div>
      </section>
  );
}

export default Auctions;
