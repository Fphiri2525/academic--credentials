import Web3 from "web3";

let web3;

if (window.ethereum) {
    try {
        // Initialize Web3 with MetaMask's provider
        web3 = new Web3(window.ethereum);

        // Request account access (modern method)
        window.ethereum
            .request({ method: "eth_requestAccounts" })
            .then(accounts => {
                console.log("MetaMask connected with account:", accounts[0]);
            })
            .catch(error => {
                console.error("User denied account access:", error);
            });

        console.log("Web3 initialized with MetaMask provider");
    } catch (error) {
        console.error("Error connecting to MetaMask:", error);
    }
} else if (window.web3) {
    // Use existing Web3 provider for legacy dApp browsers
    web3 = new Web3(window.web3.currentProvider);
    console.log("Web3 initialized with legacy provider");
} else {
    // Fallback to a Ganache or other local provider
    const provider = new Web3.providers.HttpProvider("http://127.0.0.1:7545");
    web3 = new Web3(provider);
    console.warn("No MetaMask detected; using fallback provider (http://127.0.0.1:7545)");
    web3.eth.net.getId().then(console.log);
}

// Export the initialized web3 instance
export default web3;
