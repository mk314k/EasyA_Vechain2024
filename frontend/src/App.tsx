import {
    WalletButton,
    useWallet,
    useWalletModal,
} from '@vechain/dapp-kit-react';
import { useEffect, useState } from 'react';
import ProductPage from './product';


const Navbar = () =>{
    const { account } = useWallet();
    const { open, onConnectionStatusChange } = useWalletModal();
    const [buttonText, setButtonText] = useState('Connect Custom Button');

    useEffect(() => {
        const handleConnected = (address: string | null) => {
            if (address) {
                const formattedAddress = `${address.slice(
                    0,
                    6,
                )}...${address.slice(-4)}`;
                setButtonText(`Disconnect from ${formattedAddress}`);
            } else {
                setButtonText('Connect Custom Button');
            }
        };

        handleConnected(account);

        onConnectionStatusChange(handleConnected);
    }, [account, onConnectionStatusChange]);

    return (
        <>
            <div className='flex-horizonzal navbar'>
                <WalletButton />
                <p className='connect-status' onClick={open}>
                    {buttonText}
                </p>
            </div>
        </>
    )
}



function App() {

    return (
        <>
            <Navbar/>
            <ProductPage/>
            
        </>
    );
}

export default App;
