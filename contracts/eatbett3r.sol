// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FoodMarketplace {
    mapping(address => uint) public bett3rTokenBalances;

    struct Item {
        uint id;
        address vendor;
        uint price;
        uint quantity;
        uint dateListed;
        uint dateExpiry;
        uint co2Emission;
        uint healthScore;
        uint sustainabilityScore;
    }

    struct Review {
        address reviewer;
        uint rating;
        uint stake;
    }

    struct Vendor {
        address vendorAddress;
        uint totalRatings;
        uint ratingSum;
        uint reviewCount;
        mapping(uint => Review) reviews;
    }

    mapping(uint => Item) public items;
    mapping(address => Vendor) public vendors;

    uint public itemCount;
    uint public reviewCount;
    uint public rewardPool;

    event ItemListed(uint indexed itemId, address indexed vendor, uint price, uint quantity);
    event ItemPurchased(uint indexed itemId, address indexed buyer, uint quantity, uint reward);
    event ReviewSubmitted(uint indexed itemId, address indexed reviewer, uint rating, uint stake);
    event RewardsDistributed(address indexed reviewer, uint reward);
    event VendorRewarded(address indexed vendor, uint reward);

    function listItem(uint price, uint quantity, uint dateExpiry, uint co2Emission, uint healthScore, uint sustainabilityScore) external {
        itemCount++;
        items[itemCount] = Item({
            id: itemCount,
            vendor: msg.sender,
            price: price,
            quantity: quantity,
            dateListed: block.timestamp,
            dateExpiry: dateExpiry,
            co2Emission: co2Emission,
            healthScore: healthScore,
            sustainabilityScore: sustainabilityScore
        });

        emit ItemListed(itemCount, msg.sender, price, quantity);
    }

    function buyItem(uint itemId, uint quantity) external payable {
        Item storage item = items[itemId];
        require(item.quantity >= quantity, "Not enough quantity available");
        uint totalPrice = item.price * quantity;
        require(msg.value >= totalPrice, "Insufficient Ether sent");

        payable(item.vendor).transfer(totalPrice);

        item.quantity -= quantity;

        uint reward = calculateReward(item);
        bett3rTokenBalances[msg.sender] += reward;

        emit ItemPurchased(itemId, msg.sender, quantity, reward);
    }

    function submitReview(uint itemId, uint rating, uint stake) external {
        require(bett3rTokenBalances[msg.sender] >= stake, "Insufficient stake");
        bett3rTokenBalances[msg.sender] -= stake;
        rewardPool += stake;

        Vendor storage vendor = vendors[items[itemId].vendor];
        vendor.reviews[reviewCount] = Review({
            reviewer: msg.sender,
            rating: rating,
            stake: stake
        });

        vendor.ratingSum += rating;
        vendor.reviewCount++;
        reviewCount++;

        emit ReviewSubmitted(itemId, msg.sender, rating, stake);
    }

    function calculateReward(Item memory item) internal pure returns (uint) {
        return (item.healthScore + item.sustainabilityScore) * 1e18;
    }

    function distributeRewards(uint itemId) external {
        Vendor storage vendor = vendors[items[itemId].vendor];

        uint averageRating = vendor.ratingSum / vendor.reviewCount;
        for (uint i = 0; i < vendor.reviewCount; i++) {
            Review storage review = vendor.reviews[i];
            uint deviation = absDiff(averageRating, review.rating);
            uint reviewerReward = review.stake * (1e18 - deviation) / 1e18;
            bett3rTokenBalances[review.reviewer] += reviewerReward;

            emit RewardsDistributed(review.reviewer, reviewerReward);
        }

        if (averageRating >= 4) {
            uint vendorReward = rewardPool / 10;
            bett3rTokenBalances[vendor.vendorAddress] += vendorReward;

            emit VendorRewarded(vendor.vendorAddress, vendorReward);
        }
    }

    function absDiff(uint a, uint b) internal pure returns (uint) {
        return a > b ? a - b : b - a;
    }

    // Utility functions for managing bett3rTokenBalances
    function deposit(uint amount) external {
        bett3rTokenBalances[msg.sender] += amount;
    }

    function withdraw(uint amount) external {
        require(bett3rTokenBalances[msg.sender] >= amount, "Insufficient balance");
        bett3rTokenBalances[msg.sender] -= amount;
        // Add code to transfer the tokens back to the user (if needed)
    }
}
