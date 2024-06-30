import {
    WalletButton,
    useWallet,
    useWalletModal,
    useConnex
} from '@vechain/dapp-kit-react';
import { useEffect, useState } from 'react';
import { ProductPage, Cart, products } from './product';
import './app.css';

const vendorAddress = '0xc4beaCd5c84180b26f7E7F3a307cCf3b000BFAFB';
const stakingAddress = '0xa9679AF89d48652e2cFB9C849bc94aE35c667884';
const reviews = [];

const Navbar = ({ isConnected, setConnected }) => {
    const { account } = useWallet();
    const { open, onConnectionStatusChange } = useWalletModal();
    const { thor, vendor } = useConnex();
    const [buttonText, setButtonText] = useState('');
    const [reward, setReward] = useState(0);
    const [tempReward, setTempReward] = useState(0);
    const [allReward, setAllReward] = useState({});
    const [showSummary, setShowSummary] = useState(false);
    const [totalPrice, setTotalPrice] = useState(0);
    const [bought, setBought] = useState(false);
    const [showReviews, setShowReviews] = useState(false);
    const [newReview, setNewReview] = useState('');
    const [stakingAmount, setStakingAmount] = useState(0);

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
        if (Object.keys(Cart.items).length === 0) {
            alert("Cart is empty");
            return;
        }

        let total = 0;
        const rewards = {};
        let all_reward = 0;

        for (const id in Cart.items) {
            if (Cart.items.hasOwnProperty(id)) {
                const product = products[id];
                total += Cart.items[id] * products[id].price * 1e9;
                const co2 = product.travel_history[Object.keys(product.travel_history)[0]].co2;
                const productReward = (2100 - co2) / 100;
                rewards[id] = productReward;
                all_reward += productReward;
                setAllReward(rewards);
            }
        }
        setTotalPrice(total);
        setShowSummary(true);
        setTempReward(all_reward);
    }

    const proceedCheckout = ()=>{

        const totalWei = totalPrice; 
        // console.log(totalWei);

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
            .comment('Checking out goods')
            .request()
            .then(result=>{
                console.log(result)
                setShowSummary(false);
                setReward(reward + tempReward);
                Cart.clearCart();
                setBought(true);
            })
        }
    };
    const handleReview = ()=>{
        if (showReviews){
            setShowReviews(false);
        }else{
            setShowReviews(true);
        }
    }
    const handleReviewSubmit = async () => {

        if (stakingAmount <= 0 || stakingAmount >= reward) {
            alert("Invalid staking amount");
            return;
        }
        const transferABI = {"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}
        const transferMethod = thor.account('0x0000000000000000000000000000456E65726779').method(transferABI)
        const energyClause = transferMethod.asClause(vendorAddress, `${stakingAmount *1e12}`)

        vendor.sign('tx', [
            {
                to: vendorAddress,
                value: `${stakingAmount *1e12}`,
                data: '0x',
                comment: 'Staking on reviews'
            },
            {
                comment: 'Stacking on reviews',
                ...energyClause
            }
        ])
        .signer(buttonText) // Enforce signer
        .gas(200000) // Set maximum gas
        .link('https://connex.vecha.in/{txid}') // User will be back to the app by the url https://connex.vecha.in/0xffff....
        .comment('staking for reviews')
        .request()
        .then(result=>{
            console.log(result);
            setReward(prevReward => prevReward - stakingAmount);
            // Add the new review to the reviews list
            reviews.push(newReview);
            setNewReview('');
            setStakingAmount(0);
        })

    };

    return (
        <>
            <nav className='flex-horizontal navbar'>
                <WalletButton />
                {buttonText != '' && <p>My Reward: {reward} B3TR</p>}
                <p style={{ display: 'none' }} className='connect-status' onClick={open}>
                    {buttonText}
                </p>
                <button onClick={handleCheckout}>Checkout</button>
                {bought && <button onClick={handleReview}>Review</button>}
            </nav>
            {showSummary && (
                <div className='overlay'>
                    <div className='summary-page'>
                        <h2>Cart Summary</h2>
                        {Object.entries(Cart.items).map(([id, quantity]) => (
                            <div className='summary-item' key={id}>
                                <span>{products[id].class}</span>
                                <span>Quantity: {quantity}</span>
                                <span>Price: {products[id].price * quantity}</span>
                                <span>Reward: {allReward[id]}</span>
                            </div>
                        ))}
                        <div className='summary-total'>
                            <span>Total: {totalPrice} wei</span>
                            <span>Total Reward: {tempReward} B3TR</span>
                        </div>
                        <button className='proceed-button' onClick={proceedCheckout}>
                            Proceed
                        </button>
                    </div>
                </div>
            )}
            {showReviews && (
                <div className='overlay'>
                    <div className='summary-page'>
                        {reviews.map((rev, index) => (
                            <div key={index}>
                                {rev}
                            </div>
                        ))}
                        <textarea
                            value={newReview}
                            onChange={(e) => setNewReview(e.target.value)}
                            placeholder="Write your review here"
                        />
                        <input
                            type="number"
                            value={stakingAmount}
                            onChange={(e) => setStakingAmount(Number(e.target.value))}
                            placeholder="Staking Amount (B3TR)"
                        />
                        <button onClick={handleReviewSubmit}>Post Review</button>
                    </div>
                </div>
            )}
        </>
    );
}

const Header = () => {
    return (
        <>
            <header className='flex-vertical'>
                <h1>EatBett3r</h1>
            </header>
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
