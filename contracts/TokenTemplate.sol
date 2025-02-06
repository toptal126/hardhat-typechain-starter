// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenTemplate is ERC20, Ownable, ERC20Burnable {
    uint256 public constant MAX_WALLET_PERCENT = 100; // 1% = 100 basis points
    uint256 public constant MAX_WALLET_DURATION = 12 hours;
    uint256 public immutable maxWalletDeadline;

    mapping(address => bool) public isExempt;
    bool public maxWalletEnabled = true;

    event MaxWalletDisabled(address indexed by);
    event ExemptStatusUpdated(address indexed account, bool status);

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
        isExempt[msg.sender] = true;
        maxWalletDeadline = block.timestamp + MAX_WALLET_DURATION;
    }

    function _update(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        if (!isExempt[to] && to != address(0)) {
            // Check max wallet limit
            if (maxWalletEnabled && block.timestamp < maxWalletDeadline) {
                require(
                    balanceOf(to) + amount <=
                        (totalSupply() * MAX_WALLET_PERCENT) / 10000,
                    "Exceeds max wallet limit of 1%"
                );
            }
        }
        super._update(from, to, amount);
    }

    function disableMaxWallet() external onlyOwner {
        require(maxWalletEnabled, "Max wallet already disabled");
        maxWalletEnabled = false;
        emit MaxWalletDisabled(msg.sender);
    }

    function updateExemptStatus(
        address account,
        bool status
    ) external onlyOwner {
        isExempt[account] = status;
        emit ExemptStatusUpdated(account, status);
    }

    function isMaxWalletActive() public view returns (bool) {
        return maxWalletEnabled && block.timestamp < maxWalletDeadline;
    }
}
