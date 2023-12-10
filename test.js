function calculateHealthFactor(borrowed, supplied) {
    const totalBorrowedValue = borrowed.reduce((acc, asset) => {
        return acc + asset.balance * asset.usdPrice;
    }, 0);

    const totalSuppliedValue = supplied.reduce((acc, asset) => {
        return acc + asset.balance * asset.usdPrice;
    }, 0);

    // Calculate the health factor
    const healthFactor = totalSuppliedValue / totalBorrowedValue;

    return healthFactor;
}

// Example usage:
const borrowedAssets = [
    {
        token: "0x619beb58998ed2278e08620f97007e1116d5d25b",
        balance: 108546.029211,
        usdPrice: 0.00043,
    },
    // Add more borrowed assets if needed
];

const suppliedAssets = [
    {
        token: "0x028171bca77440897b824ca71d1c56cac55b68a3",
        balance: 0.000285855711223118,
        usdPrice: 0.00043,
    },
    {
        token: "0x9a14e23a58edf4efdcb360f68cd1b95ce2081a2f",
        balance: 224.20775789963503,
        usdPrice: 0.0042,
    },
    {
        token: "0x030ba81f1c18d280636f32af80b9aad02cf0854e",
        balance: 206.1097613550247,
        usdPrice: 1.00,
    },
    // Add more supplied assets if needed
];

const healthFactor = calculateHealthFactor(borrowedAssets, suppliedAssets);
console.log("Health Factor:", healthFactor);

