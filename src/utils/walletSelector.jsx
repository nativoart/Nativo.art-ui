import React, { useCallback, useContext, useEffect, useState } from "react";
import { map, distinctUntilChanged } from "rxjs";
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { setupNearWallet } from "@near-wallet-selector/near-wallet";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupMathWallet } from "@near-wallet-selector/math-wallet";
import { setupNightly } from "@near-wallet-selector/nightly";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { providers, utils } from "near-api-js";

const WalletSelectorContext = React.createContext(null);

export const WalletSelectorContextProvider = ({ children }) => {
    const [selector, setSelector] = useState(null);
    const [modal, setModal] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const init = useCallback(async () => {
        const _selector = await setupWalletSelector({
            network: process.env.REACT_APP_NEAR_ENV,
            debug: true,
            modules: [
                setupNearWallet(),
                setupMyNearWallet(),
                setupMeteorWallet(),
                setupHereWallet(),
                setupMathWallet(),
                setupNightly(),
            ],
        });
        console.log("🪲 ~ file: walletSelector.jsx:32 ~ init ~ _selector", _selector)
        const _modal = setupModal(_selector, { contractId: process.env.REACT_APP_CONTRACT });
        console.log("🪲 ~ file: walletSelector.jsx:34 ~ init ~ _modal", _modal)
        const state = _selector.store.getState();
        console.log("🪲 ~ file: walletSelector.jsx:36 ~ init ~ state", state)
        setAccounts(state.accounts);
        window.selector = _selector;
        window.modal = _modal;
        setSelector(_selector);
        setModal(_modal);
    }, []);
    useEffect(() => {
        init().catch((err) => {
            console.error(err);
            alert("Failed to initialise wallet selector");
        });
    }, [init]);
    useEffect(() => {
        if (!selector) {
            return;
        }
        const subscription = selector.store.observable
            .pipe(map((state) => state.accounts), distinctUntilChanged())
            .subscribe((nextAccounts) => {
            console.log("Accounts Update", nextAccounts);
            setAccounts(nextAccounts);
        });
        console.log("🪲 ~ file: walletSelector.jsx:59 ~ useEffect ~ subscription", subscription)
        return () => subscription.unsubscribe();
    }, [selector]);
    if (!selector || !modal) {
        return null;
    }
    const accountId = accounts.find((account) => account.active)?.accountId || null;
    const logged = accounts.find((account) => account.active)?.active || false;
    return (<WalletSelectorContext.Provider value={{
            selector,
            modal,
            accounts,
            accountId,
            logged,
        }}>
      {children}
    </WalletSelectorContext.Provider>);
};
export function useWalletSelector() {
    const context = useContext(WalletSelectorContext);
    if (!context) {
        throw new Error("useWalletSelector must be used within a WalletSelectorContextProvider");
    }
    return context;
}