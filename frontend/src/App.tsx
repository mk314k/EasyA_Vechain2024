import {
    WalletButton,
    useWallet,
    useWalletModal,
    useConnex
} from '@vechain/dapp-kit-react';
import { useEffect, useState } from 'react';
import { ProductPage, cart, products } from './product';
import './app.css';

const vendorAddress = '0xc4beaCd5c84180b26f7E7F3a307cCf3b000BFAFB';

const Navbar = ({ isConnected, setConnected }) => {
    const { account } = useWallet();
    const { open, onConnectionStatusChange } = useWalletModal();
    const { thor, vendor } = useConnex();
    const [buttonText, setButtonText] = useState('');

    useEffect(() => {
        const handleConnected = (address) => {
            if (address) {
                // const formattedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
                setConnected(true);
                setButtonText(address);
            } else {
                setButtonText('Connect Custom Button');
                setConnected(false);
            }
        };

        handleConnected(account);

        onConnectionStatusChange(handleConnected);
    }, [account, onConnectionStatusChange]);

    const handleCheckout = async () => {
        let totalPrice = 0;

        for (const id in cart) {
            if (cart.hasOwnProperty(id)) {
                totalPrice += cart[id] * products[id].price;
            }
        }

        const totalWei = totalPrice *1e5; // Assuming prices are in Ether
        console.log(totalWei);

        if (isConnected && totalWei > 0) {
            const transferABI = {"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}
            const transferMethod = thor.account('0x0000000000000000000000000000456E65726779').method(transferABI)
            const energyClause = transferMethod.asClause(vendorAddress, `${totalWei}`)

            vendor.sign('tx', [
                {
                    to: vendorAddress,
                    value: `${totalWei}`,
                    data: '0x',
                    comment: 'Checking out'
                },
                {
                    comment: 'Checking out goods',
                    ...energyClause
                }
            ])
            .signer(buttonText) // Enforce signer
            .gas(200000) // Set maximum gas
            .link('https://connex.vecha.in/{txid}') // User will be back to the app by the url https://connex.vecha.in/0xffff....
            .comment('Donate 100 VET and 1000 VeThor to the author of connex')
            .request()
            .then(result=>{
                console.log(result)
            })
        }
    };

    return (
        <>
            <nav className='flex-horizontal navbar'>
                <WalletButton />
                <p style={{ display: 'none' }} className='connect-status' onClick={open}>
                    {buttonText}
                </p>
                <button onClick={handleCheckout}>Checkout</button>
            </nav>
        </>
    );
}

const Header = () => {
    return (
        <>
            <div className='flex-vertical'>
                <h1>EatBett3r</h1>
            </div>
        </>
    );
}

const LandingPage = () => {
    return (
        <div className='flex-vertical landing-page'>
            <div className='landing-header'>
                <h1>Welcome to EatBett3r</h1>
                <p>Healthy, Sustainable, and Honest Groceries at Your Fingertips</p>
            </div>
            <section className='landing-content'>
                <div className='benefits'>
                    <h2>Why Choose EatBett3r?</h2>
                    <ul>
                        <li>Fresh and Organic Products</li>
                        <li>Track Your Food's Journey</li>
                        <li>Earn Rewards for Sustainable Choices</li>
                        <li>Honest Reviews and Ratings</li>
                    </ul>
                </div>
                <div className='cta'>
                    <h2>Get Started</h2>
                    <p>Connect your wallet to explore our marketplace and start shopping sustainably.</p> 
                </div>
            </section>
            <footer className='landing-footer'>
                <p>&copy; 2024 EatBett3r. All rights reserved.</p>
            </footer>
        </div>
    );
}


function App() {
    const [isConnected, setConnected] = useState(false);

    return (
        <>
            <Navbar isConnected={isConnected} setConnected={setConnected} />
            <Header/>
            {isConnected ? <ProductPage /> : <LandingPage />}
        </>
    );
}

export default App;
