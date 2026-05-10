import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3001/api';

const CRYPTO_CURRENCIES = {
    ETH: { symbol: 'Ξ', name: 'Ethereum', color: '#627EEA', network: 'Ethereum' },
    BTC: { symbol: '₿', name: 'Bitcoin', color: '#F7931A', network: 'Bitcoin' },
    SOL: { symbol: '◎', name: 'Solana', color: '#9945FF', network: 'Solana' },
    USDT: { symbol: '₮', name: 'Tether', color: '#26A17B', network: 'Ethereum' },
    USDC: { symbol: '$', name: 'USD Coin', color: '#2775CA', network: 'Ethereum' },
    MATIC: { symbol: 'Ξ', name: 'Polygon', color: '#8247E5', network: 'Polygon' }
};

const WALLETS = {
    metamask: { name: 'MetaMask', icon: '🦊', networks: [ 'ETH', 'USDT', 'USDC', 'MATIC' ] },
    phantom: { name: 'Phantom', icon: '👻', networks: [ 'SOL' ] },
    trust: { name: 'Trust Wallet', icon: '🛡️', networks: [ 'ETH', 'BTC', 'SOL', 'USDT', 'USDC', 'MATIC' ] },
    coinbase: { name: 'Coinbase', icon: '💰', networks: [ 'ETH', 'BTC', 'SOL', 'USDT', 'USDC' ] }
};

const CryptoPaymentModal = ( { data, total, currency, onClose, showToast } ) =>
{
    const [ prices, setPrices ] = useState( null );
    const [ selectedCrypto, setSelectedCrypto ] = useState( 'ETH' );
    const [ cryptoAmount, setCryptoAmount ] = useState( null );
    const [ walletAddress, setWalletAddress ] = useState( '' );
    const [ isConnecting, setIsConnecting ] = useState( false );
    const [ connectedWallet, setConnectedWallet ] = useState( null );

    useEffect( () =>
    {
        fetchPrices();
    }, [] );

    useEffect( () =>
    {
        if ( prices && total )
        {
            calculateCryptoAmount();
        }
    }, [ prices, total, selectedCrypto ] );

    const fetchPrices = async () =>
    {
        try
        {
            const response = await fetch( `${ API_BASE }/crypto/prices` );
            const data = await response.json();
            if ( data.success )
            {
                setPrices( data.prices );
            }
        } catch ( error )
        {
            console.error( 'Failed to fetch crypto prices:', error );
        }
    };

    const calculateCryptoAmount = async () =>
    {
        try
        {
            const response = await fetch(
                `${ API_BASE }/crypto/convert?amount=${ total }&fiat=${ currency || 'INR' }&crypto=${ selectedCrypto }`
            );
            const data = await response.json();
            if ( data.success )
            {
                setCryptoAmount( data.to.amount );
            }
        } catch ( error )
        {
            console.error( 'Failed to convert:', error );
        }
    };

    const connectMetaMask = async () =>
    {
        if ( typeof window.ethereum === 'undefined' )
        {
            showToast( 'MetaMask not installed! Please install MetaMask extension.', 'error' );
            window.open( 'https://metamask.io/download/', '_blank' );
            return;
        }

        setIsConnecting( true );
        try
        {
            const accounts = await window.ethereum.request( { method: 'eth_requestAccounts' } );
            if ( accounts.length > 0 )
            {
                setWalletAddress( accounts[ 0 ] );
                setConnectedWallet( 'metamask' );
                showToast( 'MetaMask connected!', 'success' );
            }
        } catch ( error )
        {
            showToast( 'Failed to connect MetaMask', 'error' );
        }
        setIsConnecting( false );
    };

    const connectPhantom = async () =>
    {
        if ( typeof window.solana === 'undefined' )
        {
            showToast( 'Phantom not installed! Please install Phantom wallet.', 'error' );
            window.open( 'https://phantom.app/', '_blank' );
            return;
        }

        setIsConnecting( true );
        try
        {
            const resp = await window.solana.connect();
            setWalletAddress( resp.publicKey.toString() );
            setConnectedWallet( 'phantom' );
            showToast( 'Phantom connected!', 'success' );
        } catch ( error )
        {
            showToast( 'Failed to connect Phantom', 'error' );
        }
        setIsConnecting( false );
    };

    const initiatePayment = async () =>
    {
        if ( !walletAddress )
        {
            showToast( 'Please connect a wallet first', 'error' );
            return;
        }

        if ( selectedCrypto === 'ETH' || selectedCrypto === 'USDT' || selectedCrypto === 'USDC' || selectedCrypto === 'MATIC' )
        {
            // Ethereum-based payment
            if ( typeof window.ethereum === 'undefined' )
            {
                showToast( 'MetaMask required for this payment', 'error' );
                return;
            }

            try
            {
                const amountInWei = Math.floor( cryptoAmount * 1e18 ).toString( 16 );
                const txHash = await window.ethereum.request( {
                    method: 'eth_sendTransaction',
                    params: [ {
                        from: walletAddress,
                        to: data.companyWalletAddress || '0x0000000000000000000000000000000000000000', // Replace with actual address
                        value: `0x${ amountInWei }`,
                        data: `0x${ Buffer.from( `Invoice:${ data.invoiceNumber }` ).toString( 'hex' ) }`
                    } ]
                } );
                showToast( `Transaction sent! Hash: ${ txHash.slice( 0, 10 ) }...`, 'success' );
            } catch ( error )
            {
                showToast( 'Transaction failed: ' + error.message, 'error' );
            }
        } else if ( selectedCrypto === 'SOL' )
        {
            // Solana payment
            if ( typeof window.solana === 'undefined' )
            {
                showToast( 'Phantom required for Solana payments', 'error' );
                return;
            }
            showToast( 'Solana payment initiated. Complete in Phantom wallet.', 'success' );
        }
    };

    const formatCrypto = ( amount, crypto ) =>
    {
        if ( !amount ) return '---';
        const decimals = crypto === 'BTC' ? 8 : crypto === 'ETH' || crypto === 'SOL' ? 6 : 2;
        return amount.toFixed( decimals );
    };

    return (
        <div
            className="modal-backdrop"
            style={ {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(10, 10, 15, 0.95)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '24px'
            } }
            onClick={ ( e ) => e.target === e.currentTarget && onClose() }
        >
            <div
                className="modal-content glass-card"
                style={ { maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' } }
            >
                <div className="card-header">
                    <h2 className="card-title">
                        <span className="card-title-icon">₿</span>
                        Crypto Payment
                    </h2>
                    <button
                        onClick={ onClose }
                        style={ {
                            background: 'var(--bg-tertiary)',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            width: '32px',
                            height: '32px',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontSize: '18px'
                        } }
                    >
                        ✕
                    </button>
                </div>

                {/* Invoice Summary */ }
                <div style={ {
                    background: 'linear-gradient(135deg, rgba(247, 147, 26, 0.2), rgba(98, 126, 234, 0.2))',
                    borderRadius: 'var(--radius-md)',
                    padding: '20px',
                    marginBottom: '24px',
                    textAlign: 'center'
                } }>
                    <div style={ { fontSize: '14px', color: 'var(--text-muted)' } }>Amount to Pay</div>
                    <div style={ { fontSize: '32px', fontWeight: '700', color: 'var(--accent-cyan)' } }>
                        { currency === 'INR' ? '₹' : '$' }{ total?.toFixed( 2 ) }
                    </div>
                    { cryptoAmount && (
                        <div style={ { fontSize: '18px', marginTop: '8px' } }>
                            ≈ { formatCrypto( cryptoAmount, selectedCrypto ) } { selectedCrypto }
                        </div>
                    ) }
                </div>

                {/* Crypto Selection */ }
                <div style={ { marginBottom: '24px' } }>
                    <label style={ { fontSize: '13px', fontWeight: '600', marginBottom: '12px', display: 'block' } }>
                        Select Cryptocurrency
                    </label>
                    <div style={ { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' } }>
                        { Object.entries( CRYPTO_CURRENCIES ).map( ( [ code, info ] ) => (
                            <button
                                key={ code }
                                onClick={ () => setSelectedCrypto( code ) }
                                style={ {
                                    padding: '14px 12px',
                                    background: selectedCrypto === code
                                        ? `linear-gradient(135deg, ${ info.color }40, ${ info.color }20)`
                                        : 'var(--bg-tertiary)',
                                    border: selectedCrypto === code
                                        ? `2px solid ${ info.color }`
                                        : '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    color: 'var(--text-primary)',
                                    textAlign: 'center'
                                } }
                            >
                                <div style={ { fontSize: '24px', marginBottom: '4px' } }>{ info.symbol }</div>
                                <div style={ { fontSize: '12px', fontWeight: '600' } }>{ code }</div>
                                <div style={ { fontSize: '10px', color: 'var(--text-muted)' } }>{ info.network }</div>
                            </button>
                        ) ) }
                    </div>
                </div>

                {/* Live Price */ }
                { prices && prices[ selectedCrypto ] && (
                    <div style={ {
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px 16px',
                        marginBottom: '24px',
                        display: 'flex',
                        justifyContent: 'space-between'
                    } }>
                        <span style={ { color: 'var(--text-muted)' } }>Current { selectedCrypto } Price</span>
                        <span style={ { fontWeight: '600' } }>
                            ${ prices[ selectedCrypto ]?.usd?.toLocaleString() || '---' }
                        </span>
                    </div>
                ) }

                {/* Wallet Connection */ }
                <div style={ { marginBottom: '24px' } }>
                    <label style={ { fontSize: '13px', fontWeight: '600', marginBottom: '12px', display: 'block' } }>
                        Connect Wallet
                    </label>

                    { !connectedWallet ? (
                        <div style={ { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' } }>
                            <button
                                onClick={ () =>
                                {
                                    console.log( 'MetaMask button clicked' );
                                    console.log( 'window.ethereum:', typeof window.ethereum );
                                    connectMetaMask();
                                } }
                                disabled={ isConnecting }
                                style={ {
                                    padding: '16px',
                                    background: 'linear-gradient(135deg, #F6851B20, #E4761B10)',
                                    border: '1px solid #F6851B40',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: isConnecting ? 'wait' : 'pointer',
                                    color: 'var(--text-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    opacity: isConnecting ? 0.7 : 1
                                } }
                            >
                                <span style={ { fontSize: '28px' } }>🦊</span>
                                <div style={ { textAlign: 'left' } }>
                                    <div style={ { fontWeight: '600' } }>MetaMask</div>
                                    <div style={ { fontSize: '11px', color: 'var(--text-muted)' } }>ETH, USDT, USDC</div>
                                </div>
                            </button>
                            <button
                                onClick={ () =>
                                {
                                    console.log( 'Phantom button clicked' );
                                    connectPhantom();
                                } }
                                disabled={ isConnecting }
                                style={ {
                                    padding: '16px',
                                    background: 'linear-gradient(135deg, #9945FF20, #8247E510)',
                                    border: '1px solid #9945FF40',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: isConnecting ? 'wait' : 'pointer',
                                    color: 'var(--text-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    opacity: isConnecting ? 0.7 : 1
                                } }
                            >
                                <span style={ { fontSize: '28px' } }>👻</span>
                                <div style={ { textAlign: 'left' } }>
                                    <div style={ { fontWeight: '600' } }>Phantom</div>
                                    <div style={ { fontSize: '11px', color: 'var(--text-muted)' } }>Solana</div>
                                </div>
                            </button>
                            {/* WalletConnect Option */ }
                            <button
                                onClick={ () =>
                                {
                                    showToast( 'WalletConnect: Scan QR with any mobile wallet', 'info' );
                                    window.open( 'https://walletconnect.com/', '_blank' );
                                } }
                                style={ {
                                    padding: '16px',
                                    background: 'linear-gradient(135deg, #3B99FC20, #3B99FC10)',
                                    border: '1px solid #3B99FC40',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    color: 'var(--text-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                } }
                            >
                                <span style={ { fontSize: '28px' } }>🔗</span>
                                <div style={ { textAlign: 'left' } }>
                                    <div style={ { fontWeight: '600' } }>WalletConnect</div>
                                    <div style={ { fontSize: '11px', color: 'var(--text-muted)' } }>Mobile Wallets</div>
                                </div>
                            </button>
                            {/* Coinbase Wallet */ }
                            <button
                                onClick={ () =>
                                {
                                    showToast( 'Opening Coinbase Wallet...', 'info' );
                                    window.open( 'https://www.coinbase.com/wallet', '_blank' );
                                } }
                                style={ {
                                    padding: '16px',
                                    background: 'linear-gradient(135deg, #0052FF20, #0052FF10)',
                                    border: '1px solid #0052FF40',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    color: 'var(--text-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                } }
                            >
                                <span style={ { fontSize: '28px' } }>💰</span>
                                <div style={ { textAlign: 'left' } }>
                                    <div style={ { fontWeight: '600' } }>Coinbase</div>
                                    <div style={ { fontSize: '11px', color: 'var(--text-muted)' } }>Multi-chain</div>
                                </div>
                            </button>
                        </div>
                    ) : (
                        <div style={ {
                            background: 'var(--bg-tertiary)',
                            borderRadius: 'var(--radius-md)',
                            padding: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        } }>
                            <div style={ { display: 'flex', alignItems: 'center', gap: '12px' } }>
                                <span style={ { fontSize: '24px' } }>
                                    { WALLETS[ connectedWallet ]?.icon }
                                </span>
                                <div>
                                    <div style={ { fontWeight: '600', color: 'var(--success)' } }>
                                        ✓ Connected
                                    </div>
                                    <div style={ { fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' } }>
                                        { walletAddress.slice( 0, 6 ) }...{ walletAddress.slice( -4 ) }
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={ () =>
                                {
                                    setConnectedWallet( null );
                                    setWalletAddress( '' );
                                } }
                                style={ {
                                    background: 'var(--bg-secondary)',
                                    border: 'none',
                                    padding: '8px 12px',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer',
                                    color: 'var(--text-secondary)',
                                    fontSize: '12px'
                                } }
                            >
                                Disconnect
                            </button>
                        </div>
                    ) }
                </div>

                {/* Pay Button */ }
                <button
                    className="btn-primary"
                    onClick={ initiatePayment }
                    disabled={ !connectedWallet || !cryptoAmount }
                    style={ {
                        background: `linear-gradient(135deg, ${ CRYPTO_CURRENCIES[ selectedCrypto ]?.color || '#667eea' }, #764ba2)`,
                        opacity: ( !connectedWallet || !cryptoAmount ) ? 0.5 : 1
                    } }
                >
                    <span>{ CRYPTO_CURRENCIES[ selectedCrypto ]?.symbol }</span>
                    Pay { formatCrypto( cryptoAmount, selectedCrypto ) } { selectedCrypto }
                </button>

                <div style={ {
                    marginTop: '16px',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: 'var(--text-muted)'
                } }>
                    Supports MetaMask, Phantom, and other Web3 wallets
                </div>
            </div>
        </div>
    );
};

export default CryptoPaymentModal;
