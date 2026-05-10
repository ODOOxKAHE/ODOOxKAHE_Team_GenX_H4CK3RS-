// Currency service with live exchange rates and crypto support

// Fiat currency exchange rates cache
let exchangeRatesCache = null;
let cacheTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Supported fiat currencies
export const FIAT_CURRENCIES = {
    INR: { symbol: '₹', name: 'Indian Rupee' },
    USD: { symbol: '$', name: 'US Dollar' },
    EUR: { symbol: '€', name: 'Euro' },
    GBP: { symbol: '£', name: 'British Pound' },
    JPY: { symbol: '¥', name: 'Japanese Yen' },
    AUD: { symbol: 'A$', name: 'Australian Dollar' },
    CAD: { symbol: 'C$', name: 'Canadian Dollar' },
    CHF: { symbol: 'Fr', name: 'Swiss Franc' },
    CNY: { symbol: '¥', name: 'Chinese Yuan' },
    AED: { symbol: 'د.إ', name: 'UAE Dirham' },
    SGD: { symbol: 'S$', name: 'Singapore Dollar' }
};

// Supported cryptocurrencies
export const CRYPTO_CURRENCIES = {
    ETH: { symbol: 'Ξ', name: 'Ethereum', network: 'ethereum' },
    BTC: { symbol: '₿', name: 'Bitcoin', network: 'bitcoin' },
    SOL: { symbol: '◎', name: 'Solana', network: 'solana' },
    USDT: { symbol: '₮', name: 'Tether', network: 'ethereum' },
    USDC: { symbol: '$', name: 'USD Coin', network: 'ethereum' },
    MATIC: { symbol: 'MATIC', name: 'Polygon', network: 'polygon' },
    BNB: { symbol: 'BNB', name: 'Binance Coin', network: 'bsc' }
};

// Fetch live exchange rates (using free API)
export async function getExchangeRates ( baseCurrency = 'USD' )
{
    const now = Date.now();

    // Return cached if still valid
    if ( exchangeRatesCache && ( now - cacheTime ) < CACHE_DURATION )
    {
        return exchangeRatesCache;
    }

    try
    {
        // Using exchangerate-api.com free tier
        const response = await fetch( `https://api.exchangerate-api.com/v4/latest/${ baseCurrency }` );
        const data = await response.json();

        exchangeRatesCache = {
            base: baseCurrency,
            rates: data.rates,
            timestamp: new Date().toISOString()
        };
        cacheTime = now;

        return exchangeRatesCache;
    } catch ( error )
    {
        console.error( 'Exchange rate fetch error:', error );
        // Return fallback rates
        return getFallbackRates( baseCurrency );
    }
}

// Fallback exchange rates (approximate)
function getFallbackRates ( base )
{
    const usdRates = {
        USD: 1, INR: 83.5, EUR: 0.92, GBP: 0.79, JPY: 149.5,
        AUD: 1.53, CAD: 1.36, CHF: 0.87, CNY: 7.24, AED: 3.67, SGD: 1.34
    };

    const baseToUsd = usdRates[ base ] || 1;
    const rates = {};

    for ( const [ currency, rate ] of Object.entries( usdRates ) )
    {
        rates[ currency ] = rate / baseToUsd;
    }

    return { base, rates, timestamp: new Date().toISOString(), fallback: true };
}

// Convert between currencies
export async function convertCurrency ( amount, fromCurrency, toCurrency )
{
    const rates = await getExchangeRates( fromCurrency );
    const rate = rates.rates[ toCurrency ];

    if ( !rate )
    {
        throw new Error( `Unsupported currency pair: ${ fromCurrency } to ${ toCurrency }` );
    }

    return {
        from: { currency: fromCurrency, amount },
        to: { currency: toCurrency, amount: amount * rate },
        rate,
        timestamp: rates.timestamp
    };
}

// Get crypto prices in USD
export async function getCryptoPrices ()
{
    try
    {
        const ids = 'ethereum,bitcoin,solana,tether,usd-coin,matic-network,binancecoin';
        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${ ids }&vs_currencies=usd,inr`
        );
        const data = await response.json();

        return {
            ETH: data.ethereum,
            BTC: data.bitcoin,
            SOL: data.solana,
            USDT: data.tether,
            USDC: data[ 'usd-coin' ],
            MATIC: data[ 'matic-network' ],
            BNB: data.binancecoin,
            timestamp: new Date().toISOString()
        };
    } catch ( error )
    {
        console.error( 'Crypto price fetch error:', error );
        // Fallback prices
        return {
            ETH: { usd: 2300, inr: 192000 },
            BTC: { usd: 42000, inr: 3500000 },
            SOL: { usd: 100, inr: 8350 },
            USDT: { usd: 1, inr: 83.5 },
            USDC: { usd: 1, inr: 83.5 },
            MATIC: { usd: 0.85, inr: 71 },
            BNB: { usd: 315, inr: 26300 },
            timestamp: new Date().toISOString(),
            fallback: true
        };
    }
}

// Convert fiat to crypto
export async function fiatToCrypto ( amount, fiatCurrency, cryptoCurrency )
{
    // First convert to USD if not already
    let amountInUsd = amount;
    if ( fiatCurrency !== 'USD' )
    {
        const conversion = await convertCurrency( amount, fiatCurrency, 'USD' );
        amountInUsd = conversion.to.amount;
    }

    const cryptoPrices = await getCryptoPrices();
    const cryptoPrice = cryptoPrices[ cryptoCurrency ]?.usd;

    if ( !cryptoPrice )
    {
        throw new Error( `Unsupported cryptocurrency: ${ cryptoCurrency }` );
    }

    return {
        from: { currency: fiatCurrency, amount },
        to: { currency: cryptoCurrency, amount: amountInUsd / cryptoPrice },
        rate: cryptoPrice,
        timestamp: cryptoPrices.timestamp
    };
}

// Generate Ethereum payment request
export function generateEthereumPaymentRequest ( recipientAddress, amountInEth, invoiceNumber )
{
    // EIP-681 payment request URI
    const uri = `ethereum:${ recipientAddress }@1?value=${ Math.round( amountInEth * 1e18 ) }&label=Invoice-${ invoiceNumber }`;

    return {
        uri,
        address: recipientAddress,
        amount: amountInEth,
        network: 'Ethereum Mainnet',
        chainId: 1
    };
}

// Generate Solana payment request
export function generateSolanaPaymentRequest ( recipientAddress, amountInSol, invoiceNumber )
{
    // Solana Pay URI
    const uri = `solana:${ recipientAddress }?amount=${ amountInSol }&label=Invoice-${ invoiceNumber }`;

    return {
        uri,
        address: recipientAddress,
        amount: amountInSol,
        network: 'Solana Mainnet'
    };
}

export default {
    FIAT_CURRENCIES,
    CRYPTO_CURRENCIES,
    getExchangeRates,
    convertCurrency,
    getCryptoPrices,
    fiatToCrypto,
    generateEthereumPaymentRequest,
    generateSolanaPaymentRequest
};
