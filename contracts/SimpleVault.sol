// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleVault is Ownable {
    using ECDSA for bytes32;    
    using MessageHashUtils for bytes32;


    address public signerAddress;
    mapping(bytes32 => bool) public usedSignatures;

    event Claimed(address indexed user, address indexed token, uint256 amount);

    constructor(address _signerAddress) Ownable(msg.sender) {
        signerAddress = _signerAddress;
    }

    function setSigner(address _newSigner) external onlyOwner {
        signerAddress = _newSigner;
    }

    function getMessageHash(
        address _to,
        address _tokenAddress,
        uint256 _amount
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_to, _tokenAddress, _amount));
    }

    function claim(address _token, uint256 _amount, bytes memory _signature) external {
        require(_amount > 0, "Amount must be greater than 0");
        
        // Create message hash including all required elements        
        bytes32 messageHash = getMessageHash(msg.sender, _token, _amount);
        
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        
        // Verify signature
        address recoveredSigner = ethSignedMessageHash.recover(_signature);
        
        require(recoveredSigner == signerAddress, "Invalid signature");

        // Prevent signature reuse
        require(!usedSignatures[ethSignedMessageHash], "Signature already used");
        usedSignatures[ethSignedMessageHash] = true;

        // Transfer tokens
        require(IERC20(_token).balanceOf(address(this)) >= _amount, "Insufficient balance in vault");
        IERC20(_token).transfer(msg.sender, _amount);

        emit Claimed(msg.sender, _token, _amount);
    }

    // Function to allow the owner to withdraw any tokens from the vault
    function withdrawToken(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).transfer(owner(), _amount);
    }
}
