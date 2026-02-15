import type { WalletInfo } from "./types";

export const WALLETS: WalletInfo[] = [
  // ── Sparrow (highest priority - most capable Bitcoin wallet) ──────────────
  {
    id: "sparrow",
    name: "Sparrow Wallet",
    description: "Desktop power-user wallet with full PSBT support",
    url: "https://sparrowwallet.com",
    platforms: ["desktop"],
    openSource: true,
    keywords: ["sparrow", "desktop", "psbt", "power", "coldcard", "hardware"],
    rbf: {
      method: "RBF",
      support: "native",
      nativeSteps: [
        {
          instruction: "Open Sparrow and go to the **Transactions** tab",
        },
        {
          instruction:
            "Find your stuck unconfirmed transaction in the list",
        },
        {
          instruction:
            'Right-click the transaction and select **"Increase Fee (RBF)"**',
        },
        {
          instruction:
            "Use the fee slider to set a higher fee rate - aim for the target rate shown by TxFix",
          note: "You can also check mempool.space for current next-block fee rates",
        },
        {
          instruction:
            'Click **"Create Transaction"**, then **"Finalize Transaction for Signing"**',
        },
        {
          instruction:
            "Sign with your key or connected hardware wallet",
        },
        {
          instruction: 'Click **"Broadcast Transaction"**',
        },
      ],
      psbtImportMethods: ["file", "qr", "clipboard"],
      psbtSteps: [
        {
          instruction:
            "In Sparrow, go to **File > Open Transaction**",
        },
        {
          instruction:
            "Choose your import method: load the .psbt file, scan the QR code, or paste the base64/hex from clipboard",
        },
        {
          instruction:
            "Review the transaction details and verify the fee looks correct",
        },
        {
          instruction:
            'Click **"Finalize Transaction for Signing"**, then **"Sign"**',
        },
        {
          instruction: 'Click **"Broadcast Transaction"**',
        },
      ],
    },
    cpfp: {
      method: "CPFP",
      support: "native",
      nativeSteps: [
        {
          instruction: "Open Sparrow and go to the **UTXOs** tab",
        },
        {
          instruction:
            "Find the unconfirmed output from the stuck transaction",
          note: "It will show as unconfirmed (0 confirmations) - look for the matching amount",
        },
        {
          instruction:
            "Right-click the unconfirmed UTXO and select **Send Selected**",
        },
        {
          instruction:
            "Set the destination to one of your own addresses (from the **Addresses** tab)",
        },
        {
          instruction:
            "Set a high fee rate - it needs to compensate for both the parent and child transaction",
          note: "Use the target fee rate shown by TxFix as your guide",
        },
        {
          instruction:
            'Click **"Create Transaction"**, sign, and **"Broadcast Transaction"**',
        },
      ],
      psbtImportMethods: ["file", "qr", "clipboard"],
      psbtSteps: [
        {
          instruction:
            "In Sparrow, go to **File > Open Transaction**",
        },
        {
          instruction:
            "Load the CPFP child transaction PSBT (file, QR, or clipboard)",
        },
        {
          instruction: "Review the transaction details and fee",
        },
        {
          instruction: "Sign and broadcast",
        },
      ],
    },
  },

  // ── Bitkit ─────────────────────────────────────────────────────────────────
  {
    id: "bitkit",
    name: "Bitkit",
    description: "Mobile Bitcoin + Lightning wallet by Synonym",
    url: "https://bitkit.to",
    platforms: ["mobile"],
    openSource: true,
    keywords: ["bitkit", "synonym", "mobile", "lightning", "ios", "android"],
    rbf: {
      method: "RBF",
      support: "native",
      nativeSteps: [
        {
          instruction:
            "Open **Bitkit** on your phone and find the pending transaction in your activity list",
          note: 'It should show as "Pending" or "Unconfirmed" - look for the transaction with the matching amount',
        },
        {
          instruction: "Tap on the pending transaction to open its details",
        },
        {
          instruction:
            'Tap the **"Boost"** button (you may need to swipe on the transaction to reveal it, depending on your Bitkit version)',
        },
        {
          instruction:
            "Choose a higher fee level - pick the fastest option available",
          note: "Tip: screenshot this page first so you can reference the target fee rate while in Bitkit",
        },
        {
          instruction:
            "Confirm the boost - Bitkit will send the updated transaction automatically",
          note: "Your original transaction will be replaced (not duplicated). You will not pay twice - only the fee difference",
        },
        {
          instruction:
            "Come back to TxFix and tap **\"Done!\"** below to track confirmation",
        },
      ],
      autoFee: true,
      caveat:
        "This only works if you SENT this transaction from Bitkit. If someone sent Bitcoin TO you, Bitkit cannot speed it up - try changing your wallet to Sparrow or use an accelerator.",
    },
    cpfp: {
      method: "CPFP",
      support: "none",
      caveat:
        "Bitkit cannot speed up incoming transactions. If you are the recipient, ask the sender to bump the fee (share this TxFix link with them), or try the RBF method instead if you are the sender.",
    },
  },

  // ── Electrum ─────────────────────────────────────────────────────────────
  {
    id: "electrum",
    name: "Electrum",
    description: "Lightweight desktop + Android wallet (since 2011)",
    url: "https://electrum.org",
    platforms: ["desktop", "mobile"],
    openSource: true,
    keywords: [
      "electrum",
      "desktop",
      "android",
      "lightweight",
      "spv",
      "hardware",
    ],
    rbf: {
      method: "RBF",
      support: "native",
      nativeSteps: [
        {
          instruction:
            "Open Electrum and go to the **History** tab",
        },
        {
          instruction:
            "Find your stuck unconfirmed transaction in the list - it will show a yellow triangle icon and be labeled **\"Replaceable\"**",
        },
        {
          instruction:
            "**Right-click** the transaction and select **\"Increase Fee\"**",
        },
        {
          instruction:
            "A fee window appears - drag the slider to a higher fee, or click the **wrench icon** (top right) and select **\"Edit fees manually\"** to type an exact sat/vB rate",
          note: "Use the target fee rate shown by TxFix as your guide",
        },
        {
          instruction:
            "Click **\"OK\"**, then **\"Sign\"**, then **\"Broadcast\"**",
        },
      ],
      psbtImportMethods: ["file", "qr", "clipboard"],
      psbtSteps: [
        {
          instruction:
            "In Electrum, go to **Tools > Load transaction**",
        },
        {
          instruction:
            "Choose **\"From file\"** to load a .psbt file, **\"From text\"** to paste hex/base64, or **\"From QR code\"** to scan",
        },
        {
          instruction:
            "Review the transaction details and fee, then click **\"Sign\"** and **\"Broadcast\"**",
        },
      ],
    },
    cpfp: {
      method: "CPFP",
      support: "native",
      nativeSteps: [
        {
          instruction:
            "Open Electrum and go to the **History** tab",
        },
        {
          instruction:
            "Find the stuck unconfirmed transaction in the list",
        },
        {
          instruction:
            "**Right-click** the transaction and select **\"Child pays for parent\"**",
          note: "This option appears when there is a spendable output from the stuck transaction in your wallet",
        },
        {
          instruction:
            "A fee window appears - set a high fee rate to compensate for both the parent and child transaction",
          note: "Use the target fee rate shown by TxFix. Click the wrench icon to enter an exact sat/vB rate",
        },
        {
          instruction:
            "Click **\"OK\"**, then **\"Sign\"**, then **\"Broadcast\"**",
        },
      ],
      psbtImportMethods: ["file", "qr", "clipboard"],
      psbtSteps: [
        {
          instruction:
            "In Electrum, go to **Tools > Load transaction**",
        },
        {
          instruction:
            "Load the CPFP child transaction PSBT (from file, text, or QR code)",
        },
        {
          instruction: "Review, sign, and broadcast",
        },
      ],
      caveat:
        "If \"Child pays for parent\" doesn't appear in the right-click menu, the transaction may not have a spendable output in your wallet. In that case, try the RBF method if you are the sender.",
    },
  },

  // ── Ashigaru (Samourai Wallet fork) ──────────────────────────────────────
  {
    id: "ashigaru",
    name: "Ashigaru",
    description: "Privacy-focused Android wallet (Samourai fork)",
    url: "https://ashigaru.rs",
    platforms: ["mobile"],
    openSource: true,
    keywords: [
      "ashigaru",
      "samourai",
      "dojo",
      "whirlpool",
      "android",
      "privacy",
    ],
    rbf: {
      method: "RBF",
      support: "native",
      nativeSteps: [
        {
          instruction:
            "Open **Ashigaru** and find the stuck (unconfirmed) transaction on your main screen",
        },
        {
          instruction:
            "Tap the transaction to open its details",
        },
        {
          instruction:
            'At the bottom of the details screen, tap **\"Boost Transaction Fee\"**',
          note: "If you don't see this button, the transaction may already be confirmed - check the status at the top",
        },
        {
          instruction:
            "Ashigaru will show you the new fee amount - review it and tap **Confirm**",
          note: "The wallet picks a higher fee automatically. You only pay the fee difference, not double - your Bitcoin amount stays the same",
        },
        {
          instruction:
            "Done! The updated transaction is sent automatically. Come back to TxFix and tap **\"Done\"** below to track confirmation",
          note: "Your original transaction is replaced - you won't see two transactions, just the new faster one",
        },
      ],
      autoFee: true,
      caveat:
        "This only works for transactions you SENT from Ashigaru, and only if \"Spend using RBF\" was enabled in Settings > Transactions before sending. Not sure if it was enabled? Use the CPFP method instead - it works either way.",
    },
    cpfp: {
      method: "CPFP",
      support: "native",
      nativeSteps: [
        {
          instruction:
            "Check your Ashigaru version: go to **Settings > About** and make sure you have **version 1.1.0 or higher**",
          note: "Older versions had a bug with this feature. If you need to update, download the latest APK from ashigaru.rs",
        },
        {
          instruction:
            "Open **Ashigaru** and find the stuck (unconfirmed) transaction on your main screen",
          note: "This works for transactions you sent AND transactions sent to you",
        },
        {
          instruction:
            "Tap the transaction to open its details",
        },
        {
          instruction:
            'At the bottom, tap **\"Boost Transaction Fee\"**',
          note: "Ashigaru creates a small follow-up transaction with a higher fee that helps your stuck transaction confirm faster",
        },
        {
          instruction:
            "Review the fee amount shown and tap **Confirm**",
          note: "The wallet calculates the right fee automatically. This costs a small extra fee for the boost only - your original Bitcoin amount is unchanged",
        },
        {
          instruction:
            "Done! The boost transaction is sent automatically. Come back to TxFix and tap **\"Done\"** below to track confirmation",
        },
      ],
      autoFee: true,
      caveat:
        "Your wallet needs some extra Bitcoin to pay for the boost transaction fee. Make sure you're on Ashigaru v1.1.0 or later (check in Settings > About).",
    },
  },

  // ── BlueWallet ───────────────────────────────────────────────────────────
  {
    id: "bluewallet",
    name: "BlueWallet",
    description: "Mobile Bitcoin + Lightning wallet (iOS & Android)",
    url: "https://bluewallet.io",
    platforms: ["mobile"],
    openSource: true,
    keywords: [
      "bluewallet",
      "blue",
      "mobile",
      "ios",
      "android",
      "lightning",
    ],
    rbf: {
      method: "RBF",
      support: "native",
      nativeSteps: [
        {
          instruction:
            "Open **BlueWallet** and tap on the wallet that contains the stuck transaction",
        },
        {
          instruction:
            "Find the pending transaction and tap it to view details",
        },
        {
          instruction:
            'Tap the **\"Bump Fee\"** button at the bottom of the transaction details',
        },
        {
          instruction:
            "Choose a higher fee - you can pick a preset or enter a custom sat/vB rate",
          note: "Use the target fee rate shown by TxFix as your guide",
        },
        {
          instruction:
            'Tap **\"Create\"** to send the replacement transaction',
          note: "You only pay the fee difference, not double. Your Bitcoin amount stays the same",
        },
      ],
      caveat:
        "Bump Fee only works with native SegWit (bech32) wallets. If your wallet uses a legacy address format, this won't work - try using Sparrow or Electrum instead.",
    },
    cpfp: {
      method: "CPFP",
      support: "none",
      caveat:
        "BlueWallet does not support CPFP for incoming transactions. If you are the recipient, ask the sender to bump the fee, or import your seed into Electrum or Sparrow to create a CPFP manually.",
    },
  },

  // ── Bitcoin Core ────────────────────────────────────────────────────────────
  {
    id: "bitcoin-core",
    name: "Bitcoin Core",
    description: "The reference Bitcoin node + wallet (full node)",
    url: "https://bitcoin.org",
    platforms: ["desktop"],
    openSource: true,
    keywords: [
      "bitcoin core",
      "core",
      "node",
      "full node",
      "reference",
      "btc",
    ],
    rbf: {
      method: "RBF",
      support: "native",
      nativeSteps: [
        {
          instruction:
            "Open Bitcoin Core and go to the **Transactions** tab",
        },
        {
          instruction:
            "Find your stuck unconfirmed transaction in the list",
        },
        {
          instruction:
            '**Right-click** the transaction and select **\"Increase transaction fee\"**',
        },
        {
          instruction:
            "Confirm the fee bump in the dialog that appears",
          note: "Bitcoin Core will automatically calculate a higher fee. The fee is shown in BTC, not sat/vB",
        },
      ],
      caveat:
        "Your transaction must have been created with RBF enabled (this is the default in recent versions). If you use the command line, you can also use the `bumpfee` command for more control.",
    },
    cpfp: {
      method: "CPFP",
      support: "native",
      nativeSteps: [
        {
          instruction:
            "Go to **Settings > Options > Wallet** and enable **\"Enable coin control features\"**",
        },
        {
          instruction:
            "Go to the **Send** tab and click the **\"Inputs...\"** button",
        },
        {
          instruction:
            "Select the unconfirmed output from the stuck transaction in the coin list",
          note: "You may need to check \"List mode\" to see individual UTXOs",
        },
        {
          instruction:
            "Enter one of your own addresses as the recipient (from the Receive tab)",
        },
        {
          instruction:
            "Set a high custom fee - it needs to be enough to pay for both the parent and child transactions",
          note: "Bitcoin Core shows fees in BTC/kB. To convert: multiply sat/vB by 0.00001 to get BTC/kB",
        },
        {
          instruction:
            "Click **Send** and confirm the transaction",
        },
      ],
      caveat:
        "CPFP in Bitcoin Core requires using coin control to manually select the unconfirmed UTXO. This is more advanced - if you're not comfortable, consider using Electrum or Sparrow which have a simpler CPFP option.",
    },
  },

  // ── Wasabi Wallet ───────────────────────────────────────────────────────────
  {
    id: "wasabi",
    name: "Wasabi Wallet",
    description: "Privacy-focused desktop wallet with CoinJoin",
    url: "https://wasabiwallet.io",
    platforms: ["desktop"],
    openSource: true,
    keywords: [
      "wasabi",
      "privacy",
      "coinjoin",
      "desktop",
      "whirlpool",
    ],
    rbf: {
      method: "RBF",
      support: "native",
      nativeSteps: [
        {
          instruction:
            "Open **Wasabi Wallet** and find the pending transaction in your history",
        },
        {
          instruction:
            '**Right-click** the transaction and select **\"Speed Up Transaction\"**',
        },
        {
          instruction:
            "Confirm the action in the dialog - Wasabi will show you the additional fee",
        },
        {
          instruction:
            "Enter your wallet passphrase when prompted to authorize the replacement",
        },
      ],
      autoFee: true,
      caveat:
        "Speed Up is not available for CoinJoin transactions or hardware wallet-connected wallets. Wasabi automatically calculates the new fee - you cannot set an exact sat/vB rate.",
    },
    cpfp: {
      method: "CPFP",
      support: "native",
      nativeSteps: [
        {
          instruction:
            "Open **Wasabi Wallet** and find the pending transaction in your history",
        },
        {
          instruction:
            '**Right-click** the transaction and select **\"Speed Up Transaction\"**',
          note: "Wasabi automatically tries RBF first and falls back to CPFP if needed",
        },
        {
          instruction:
            "Confirm the action and enter your passphrase",
          note: "If RBF isn't possible, Wasabi creates a child transaction automatically to help the stuck transaction confirm faster",
        },
      ],
      autoFee: true,
      caveat:
        "Speed Up is not available for CoinJoin transactions. Wasabi handles the RBF/CPFP choice automatically - you don't need to pick.",
    },
  },

  // ── Ledger Live ─────────────────────────────────────────────────────────────
  {
    id: "ledger",
    name: "Ledger Live",
    description: "Hardware wallet companion app for Ledger devices",
    url: "https://www.ledger.com",
    platforms: ["desktop", "mobile", "hardware"],
    openSource: false,
    keywords: [
      "ledger",
      "ledger live",
      "hardware",
      "nano",
      "nano s",
      "nano x",
      "stax",
      "flex",
    ],
    rbf: {
      method: "RBF",
      support: "native",
      nativeSteps: [
        {
          instruction:
            "Open **Ledger Live** and find the pending transaction (showing 0 confirmations)",
        },
        {
          instruction:
            "Click on the transaction to open its details",
        },
        {
          instruction:
            'Click the **\"Boost\"** button at the bottom of the transaction details',
        },
        {
          instruction:
            "Choose a higher fee tier or set a custom fee amount",
        },
        {
          instruction:
            "**Confirm on your Ledger device** - verify the transaction details on the hardware wallet screen and approve",
          note: "You must have your Ledger device connected and the Bitcoin app open",
        },
      ],
      caveat:
        "Boost only works for transactions you sent from Ledger Live. You must have your Ledger device connected and unlocked to sign the replacement transaction.",
    },
    cpfp: {
      method: "CPFP",
      support: "none",
      caveat:
        "Ledger Live doesn't have a built-in CPFP option. For incoming stuck transactions, you can pair your Ledger with Electrum or Sparrow to perform CPFP - your keys stay on the Ledger device.",
    },
  },

  // ── Trezor Suite ────────────────────────────────────────────────────────────
  {
    id: "trezor",
    name: "Trezor Suite",
    description: "Hardware wallet companion app for Trezor devices",
    url: "https://trezor.io",
    platforms: ["desktop", "hardware"],
    openSource: true,
    keywords: [
      "trezor",
      "trezor suite",
      "hardware",
      "model t",
      "model one",
      "safe",
    ],
    rbf: {
      method: "RBF",
      support: "native",
      nativeSteps: [
        {
          instruction:
            "Open **Trezor Suite** and go to your Bitcoin account's transaction list",
        },
        {
          instruction:
            "Find the pending transaction and click on it",
        },
        {
          instruction:
            'Click the **\"Bump fee\"** button on the transaction details screen',
        },
        {
          instruction:
            "Choose a fee preset or switch to the **Advanced** tab to enter a custom sat/vB rate",
          note: "Use the target fee rate shown by TxFix as your guide",
        },
        {
          instruction:
            'Click **\"Replace transaction\"** and then **confirm on your Trezor device**',
          note: "Your Trezor will display the original transaction and the new fee - verify and approve on the device",
        },
      ],
      caveat:
        "You must have your Trezor device connected and unlocked. For full-balance transactions, the extra fee is deducted from the amount being sent.",
    },
    cpfp: {
      method: "CPFP",
      support: "native",
      nativeSteps: [
        {
          instruction:
            'In **Trezor Suite**, go to the **Send** tab and click **\"Coin control\"**',
        },
        {
          instruction:
            "Select the unconfirmed output from the stuck transaction",
          note: "Look for the UTXO that shows 0 confirmations - this is from your stuck transaction",
        },
        {
          instruction:
            "Enter one of your own addresses as the recipient (from the Receive tab)",
        },
        {
          instruction:
            "Set a high custom fee in the **Advanced** fee tab - it must be enough to pay for both the parent and child transactions",
          note: "Use the target fee rate shown by TxFix as your guide",
        },
        {
          instruction:
            "Send the transaction and **confirm on your Trezor device**",
        },
      ],
      caveat:
        "CPFP in Trezor Suite requires manual coin control to select the unconfirmed UTXO. Your Trezor device must be connected to sign.",
    },
  },

  // ── Exodus ──────────────────────────────────────────────────────────────────
  {
    id: "exodus",
    name: "Exodus",
    description: "Multi-asset desktop + mobile wallet",
    url: "https://exodus.com",
    platforms: ["desktop", "mobile"],
    openSource: false,
    keywords: [
      "exodus",
      "multi-asset",
      "desktop",
      "mobile",
      "beginner",
    ],
    rbf: {
      method: "RBF",
      support: "native",
      nativeSteps: [
        {
          instruction:
            "Open **Exodus** and go to your Bitcoin wallet",
        },
        {
          instruction:
            "Find the stuck pending transaction and tap/click on it to view details",
        },
        {
          instruction:
            'Tap the **\"Accelerate\"** button',
          note: "On desktop, click the arrow next to the transaction first, then \"Accelerate\"",
        },
        {
          instruction:
            "Review the additional fee shown and tap **\"Accelerate\"** again to confirm",
          note: "Exodus automatically picks between RBF and CPFP based on your transaction. You only pay the fee difference",
        },
      ],
      autoFee: true,
      caveat:
        "Accelerate requires additional BTC in your wallet to cover the higher fee. Exodus automatically chooses the best method (RBF or CPFP) - you don't need to pick.",
    },
    cpfp: {
      method: "CPFP",
      support: "native",
      nativeSteps: [
        {
          instruction:
            "Open **Exodus** and go to your Bitcoin wallet",
        },
        {
          instruction:
            "Find the stuck pending transaction and tap/click on it",
        },
        {
          instruction:
            'Tap **\"Accelerate\"** - Exodus will automatically use CPFP if RBF isn\'t available',
          note: "CPFP works by creating a follow-up transaction with a higher fee to pull the stuck transaction through",
        },
        {
          instruction:
            "Confirm the acceleration and wait for the transactions to be included in a block",
        },
      ],
      autoFee: true,
      caveat:
        "CPFP only works if the stuck transaction has a change output back to your wallet. You need enough BTC to cover the child transaction fee.",
    },
  },

  // ── Muun ────────────────────────────────────────────────────────────────────
  {
    id: "muun",
    name: "Muun",
    description: "Simple mobile Bitcoin + Lightning wallet",
    url: "https://muun.com",
    platforms: ["mobile"],
    openSource: true,
    keywords: ["muun", "mobile", "simple", "lightning", "ios", "android"],
    rbf: {
      method: "RBF",
      support: "none",
      caveat:
        "Muun does not support RBF fee bumping. If your transaction is stuck, you'll need to wait for it to confirm or drop from the mempool (usually 2 weeks). Consider importing your funds to a wallet with RBF support (like Electrum or Sparrow) using Muun's recovery tool.",
    },
    cpfp: {
      method: "CPFP",
      support: "none",
      caveat:
        "Muun does not support CPFP. Unfortunately, there's no way to speed up a stuck transaction in Muun. Try using an accelerator service or wait for the transaction to confirm on its own.",
    },
  },

  // ── Blockstream Green ──────────────────────────────────────────────────────
  {
    id: "green",
    name: "Blockstream Green",
    description: "Mobile + desktop wallet by Blockstream",
    url: "https://blockstream.com/green",
    platforms: ["desktop", "mobile"],
    openSource: true,
    keywords: [
      "blockstream",
      "green",
      "jade",
      "hardware",
      "mobile",
      "desktop",
    ],
    rbf: {
      method: "RBF",
      support: "native",
      nativeSteps: [
        {
          instruction:
            "Open **Blockstream Green** and find the stuck unconfirmed transaction",
        },
        {
          instruction:
            "Tap/click the transaction to open its details",
        },
        {
          instruction:
            'Tap **\"Increase Fee\"** at the bottom of the transaction details',
        },
        {
          instruction:
            "Set a higher fee rate - follow the prompts similar to sending a normal transaction",
          note: "Use the target fee rate shown by TxFix as your guide",
        },
        {
          instruction:
            "Confirm the fee bump to broadcast the replacement transaction",
          note: "If using a Jade hardware wallet, you'll need to approve on the device",
        },
      ],
    },
    cpfp: {
      method: "CPFP",
      support: "none",
      caveat:
        "Blockstream Green doesn't have a dedicated CPFP button. For incoming stuck transactions, try using the RBF method if you are the sender, or pair your Jade with Sparrow for more advanced options.",
    },
  },

  // ── Other / Not Listed (always last - generic PSBT fallback) ─────────────
  {
    id: "other",
    name: "Other / Not Listed",
    description: "Generate a PSBT to import into any compatible wallet",
    url: "",
    platforms: ["desktop", "mobile", "web", "hardware"],
    openSource: false,
    keywords: ["other", "psbt", "generic", "custom", "not listed"],
    rbf: {
      method: "RBF",
      support: "psbt-import",
      psbtSteps: [
        {
          instruction:
            "TxFix will generate a **PSBT** (Partially Signed Bitcoin Transaction) for the RBF replacement",
        },
        {
          instruction:
            "Download the .psbt file, scan the QR code, or copy the hex - whichever your wallet supports",
        },
        {
          instruction:
            "Import the PSBT into your wallet and review the transaction details",
        },
        {
          instruction: "Sign the transaction in your wallet",
        },
        {
          instruction:
            "Broadcast the signed transaction (from your wallet or paste the signed hex back here)",
        },
      ],
      psbtImportMethods: ["file", "qr", "clipboard"],
    },
    cpfp: {
      method: "CPFP",
      support: "psbt-import",
      psbtSteps: [
        {
          instruction:
            "TxFix will generate a **CPFP child transaction** as a PSBT",
        },
        {
          instruction:
            "Import the PSBT into your wallet using file, QR code, or clipboard",
        },
        {
          instruction: "Review the transaction, sign it, and broadcast",
        },
      ],
      psbtImportMethods: ["file", "qr", "clipboard"],
    },
  },
];

/** Look up a wallet by its id */
export function getWalletById(id: string): WalletInfo | undefined {
  return WALLETS.find((w) => w.id === id);
}
