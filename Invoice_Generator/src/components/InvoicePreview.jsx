import { memo, useRef, useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';

// Supported languages for translation and TTS
const LANGUAGES = {
    'en': { name: 'English', flag: '🇬🇧', gttsCode: 'en' },
    'hi': { name: 'हिंदी (Hindi)', flag: '🇮🇳', gttsCode: 'hi' },
    'ta': { name: 'தமிழ் (Tamil)', flag: '🇮🇳', gttsCode: 'ta' },
    'te': { name: 'తెలుగు (Telugu)', flag: '🇮🇳', gttsCode: 'te' },
    'kn': { name: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳', gttsCode: 'kn' },
    'ml': { name: 'മലയാളം (Malayalam)', flag: '🇮🇳', gttsCode: 'ml' },
    'mr': { name: 'मराठी (Marathi)', flag: '🇮🇳', gttsCode: 'mr' },
    'bn': { name: 'বাংলা (Bengali)', flag: '🇮🇳', gttsCode: 'bn' },
    'gu': { name: 'ગુજરાતી (Gujarati)', flag: '🇮🇳', gttsCode: 'gu' },
    'pa': { name: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳', gttsCode: 'pa' },
    'od': { name: 'ଓଡ଼ିଆ (Odia)', flag: '🇮🇳', gttsCode: 'or' }
};

// Template color schemes
const TEMPLATES = {
    modern: { primary: '#667eea', secondary: '#764ba2', gradient: true },
    classic: { primary: '#2c3e50', secondary: '#34495e', gradient: false },
    minimal: { primary: '#000000', secondary: '#666666', gradient: false },
    bold: { primary: '#e74c3c', secondary: '#c0392b', gradient: true },
    corporate: { primary: '#0066cc', secondary: '#004499', gradient: true },
    creative: { primary: '#9b59b6', secondary: '#8e44ad', gradient: true }
};

const CURRENCIES = {
    INR: { symbol: '₹', code: 'INR', locale: 'en-IN' },
    USD: { symbol: '$', code: 'USD', locale: 'en-US' },
    EUR: { symbol: '€', code: 'EUR', locale: 'de-DE' },
    GBP: { symbol: '£', code: 'GBP', locale: 'en-GB' },
    JPY: { symbol: '¥', code: 'JPY', locale: 'ja-JP' },
    AUD: { symbol: 'A$', code: 'AUD', locale: 'en-AU' },
    CAD: { symbol: 'C$', code: 'CAD', locale: 'en-CA' },
    AED: { symbol: 'د.إ', code: 'AED', locale: 'ar-AE' },
    SGD: { symbol: 'S$', code: 'SGD', locale: 'en-SG' }
};

const CRYPTO_INFO = {
    eth: { name: 'Ethereum', symbol: 'ETH', icon: 'Ξ', color: '#627EEA' },
    btc: { name: 'Bitcoin', symbol: 'BTC', icon: '₿', color: '#F7931A' },
    sol: { name: 'Solana', symbol: 'SOL', icon: '◎', color: '#9945FF' }
};

const GIFT_TYPES = {
    voucher: { name: 'Gift Voucher', icon: '✨🎁', color: '#667eea' },
    '1plus1': { name: '1+1 Sale', icon: '🔔🎉', color: '#f59e0b' },
    buy3get2: { name: 'Buy 3 Get 2 Free', icon: '🎊🥳', color: '#10b981' },
    movie: { name: 'Movie Ticket', icon: '🎬🍿', color: '#ef4444' },
    travel: { name: 'Travel Voucher', icon: '☀️🧳🏖️', color: '#06b6d4' },
    festive: { name: 'Festive Offer', icon: '🎋🪔🎆', color: '#f97316' },
    coupon: { name: 'Coupon', icon: '🏷️✂️', color: '#8b5cf6' },
    referral: { name: 'Referral Bonus', icon: '👥🤝', color: '#14b8a6' },
    discountOffer: { name: 'Discount Offer', icon: '💰🏷️', color: '#22c55e' },
    cashback: { name: 'Cashback Reward', icon: '💵↩️', color: '#0ea5e9' },
    luckyDraw: { name: 'Lucky Draw', icon: '🎰🍀', color: '#eab308' },
    hospitalFund: { name: 'Hospital/Medical', icon: '🏥❤️', color: '#dc2626' },
    bloodDonation: { name: 'Blood Donation', icon: '🩸💉', color: '#b91c1c' },
    education: { name: 'Education Fund', icon: '📚🎓', color: '#2563eb' },
    charity: { name: 'Charity/NGO', icon: '🤲💝', color: '#d946ef' },
    custom: { name: 'Custom Gift', icon: '🎀', color: '#ec4899' }
};

const InvoicePreview = memo( ( { 
    data, 
    subtotal, 
    tax, 
    discount = 0,
    total, 
    currencySymbol = '₹', 
    paymentLink = null, 
    showPaymentQR = false,
    viewCurrency,
    convertedTotal,
    exchangeRate,
    conversionLoading
} ) =>
{
    const previewRef = useRef( null );
    const audioRef = useRef( null );
    const template = TEMPLATES[ data.template ] || TEMPLATES.modern;
    const currencyInfo = CURRENCIES[ data.currency ] || CURRENCIES.INR;

    // Language & Audio State
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [translatedData, setTranslatedData] = useState(null);
    const [translationLoading, setTranslationLoading] = useState(false);
    const [audioLoading, setAudioLoading] = useState(false);
    const [audioPlaying, setAudioPlaying] = useState(false);
    const [audioSrc, setAudioSrc] = useState(null);
    const [audioLanguage, setAudioLanguage] = useState('en');

    // Get display text (translated or original)
    const getDisplayText = (originalText, translatedField) => {
        if (selectedLanguage === 'en' || !translatedData) {
            return originalText;
        }
        return translatedData[translatedField] || originalText;
    };

    // Translate invoice content when language changes
    const translateInvoice = async (targetLang) => {
        if (targetLang === 'en') {
            setTranslatedData(null);
            return;
        }

        setTranslationLoading(true);
        try {
            // Collect all text that needs translation
            const textsToTranslate = {
                invoice: 'INVOICE',
                billTo: 'Bill To',
                from: 'From',
                date: 'Date',
                dueDate: 'Due Date',
                description: 'Description',
                code: 'Code',
                qty: 'Qty',
                unitPrice: 'Unit Price',
                amount: 'Amount',
                subtotal: 'Subtotal',
                tax: 'Tax',
                discount: 'Discount',
                totalDue: 'Total Due',
                thankYou: 'Thank you for your business!',
                paymentDue: 'Payment is due within 30 days',
                // Translate item descriptions
                ...data.items.reduce((acc, item, idx) => {
                    acc[`item_${idx}`] = item.description || '';
                    return acc;
                }, {})
            };

            // Call Sarvam translate API
            const translations = {};
            for (const [key, text] of Object.entries(textsToTranslate)) {
                if (!text) continue;
                try {
                    const response = await fetch('http://localhost:3001/api/sarvam/translate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            text: text,
                            sourceLanguage: 'en-IN',
                            targetLanguage: `${targetLang}-IN`
                        })
                    });
                    const result = await response.json();
                    if (result.success) {
                        translations[key] = result.translated_text;
                    }
                } catch (e) {
                    console.error(`Translation error for ${key}:`, e);
                }
            }
            setTranslatedData(translations);
        } catch (error) {
            console.error('Translation error:', error);
        } finally {
            setTranslationLoading(false);
        }
    };

    // Handle language change
    useEffect(() => {
        translateInvoice(selectedLanguage);
    }, [selectedLanguage]);

    // Extract invoice text for audio
    const extractInvoiceText = () => {
        const parts = [];
        parts.push(getDisplayText('INVOICE', 'invoice'));
        parts.push(`${data.invoiceNumber || ''}`);
        if (data.companyName) parts.push(`${getDisplayText('From', 'from')} ${data.companyName}`);
        if (data.customerName) parts.push(`${getDisplayText('Bill To', 'billTo')} ${data.customerName}`);
        
        data.items.forEach((item, idx) => {
            const desc = translatedData?.[`item_${idx}`] || item.description || '';
            parts.push(`${desc}, ${getDisplayText('Qty', 'qty')} ${item.quantity}, ${currencyInfo.symbol}${item.price}`);
        });
        
        parts.push(`${getDisplayText('Total Due', 'totalDue')}: ${currencyInfo.symbol}${total.toFixed(2)}`);
        parts.push(getDisplayText('Thank you for your business!', 'thankYou'));
        
        return parts.join('. ');
    };

    // Generate audio using gTTS
    const generateAudio = async () => {
        setAudioLoading(true);
        try {
            const text = extractInvoiceText();
            const langCode = LANGUAGES[audioLanguage]?.gttsCode || 'en';
            
            const response = await fetch('http://localhost:3002/api/gtts/speak', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, language: langCode })
            });
            
            const result = await response.json();
            if (result.success && result.audio) {
                setAudioSrc(`data:audio/mp3;base64,${result.audio}`);
            } else {
                throw new Error(result.error || 'Failed to generate audio');
            }
        } catch (error) {
            console.error('Audio generation error:', error);
            alert('Failed to generate audio: ' + error.message);
        } finally {
            setAudioLoading(false);
        }
    };

    // Play/Pause audio
    const toggleAudio = () => {
        if (audioRef.current) {
            if (audioPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setAudioPlaying(!audioPlaying);
        }
    };

    // Handle audio end
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.onended = () => setAudioPlaying(false);
        }
    }, [audioSrc]);

    const formatCurrency = ( amount ) =>
    {
        return new Intl.NumberFormat( currencyInfo.locale, {
            style: 'currency',
            currency: currencyInfo.code,
            minimumFractionDigits: 2
        } ).format( amount );
    };

    // Check if we're viewing in a different currency
    const isConverting = viewCurrency && viewCurrency !== data.currency && exchangeRate;
    const viewCurrencyInfo = CURRENCIES[viewCurrency] || CURRENCIES.USD;

    // Format amount in view currency
    const formatViewCurrency = ( amount ) => {
        if (!isConverting) return '';
        const convertedAmount = amount * exchangeRate;
        return new Intl.NumberFormat( viewCurrencyInfo.locale, {
            style: 'currency',
            currency: viewCurrencyInfo.code,
            minimumFractionDigits: 2
        } ).format( convertedAmount );
    };

    const formatDate = ( dateStr ) =>
    {
        if ( !dateStr ) return '';
        const date = new Date( dateStr );
        return date.toLocaleDateString( 'en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        } );
    };

    const downloadPDF = () =>
    {
        const element = previewRef.current;
        const opt = {
            margin: 0,
            filename: `${ data.invoiceNumber || 'Invoice' }.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set( opt ).from( element ).save();
    };

    // Generate QR code data URL using Google Charts API
    const getQRCodeUrl = ( text ) =>
    {
        const encoded = encodeURIComponent( text );
        return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${ encoded }`;
    };

    const headerStyle = template.gradient
        ? { background: `linear-gradient(135deg, ${ template.primary } 0%, ${ template.secondary } 100%)` }
        : { background: template.primary };

    return (
        <div className="glass-card">
            <div className="card-header" style={{ flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <h2 className="card-title">
                        <span className="card-title-icon">👁️</span>
                        Live Preview
                    </h2>
                    <button className="btn-download" onClick={ downloadPDF } style={ {
                        padding: '10px 20px',
                        background: 'var(--success-gradient)',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        color: 'white',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        transition: 'transform 0.2s ease'
                    } }>
                        📥 Download PDF
                    </button>
                </div>

                {/* Language & Audio Controls */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, #667eea10, #764ba208)',
                    borderRadius: '10px',
                    border: '1px solid #667eea20',
                    width: '100%'
                }}>
                    {/* Language Selector for Invoice Translation */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px' }}>
                        <span style={{ fontSize: '16px' }}>🌐</span>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#555' }}>Invoice Language:</span>
                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            disabled={translationLoading}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                background: 'white',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                minWidth: '150px'
                            }}
                        >
                            {Object.entries(LANGUAGES).map(([code, lang]) => (
                                <option key={code} value={code}>
                                    {lang.flag} {lang.name}
                                </option>
                            ))}
                        </select>
                        {translationLoading && (
                            <span style={{ fontSize: '14px', animation: 'spin 1s linear infinite' }}>⏳</span>
                        )}
                    </div>

                    {/* Divider */}
                    <div style={{ width: '1px', height: '30px', background: '#ddd' }} />

                    {/* Audio Controls with gTTS */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>🔊</span>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#555' }}>Listen:</span>
                        <select
                            value={audioLanguage}
                            onChange={(e) => setAudioLanguage(e.target.value)}
                            style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: '1px solid #ddd',
                                background: 'white',
                                fontSize: '12px',
                                cursor: 'pointer'
                            }}
                        >
                            {Object.entries(LANGUAGES).map(([code, lang]) => (
                                <option key={code} value={code}>
                                    {lang.flag} {lang.name}
                                </option>
                            ))}
                        </select>
                        
                        {/* Generate Audio Button */}
                        <button
                            onClick={generateAudio}
                            disabled={audioLoading}
                            style={{
                                padding: '8px 14px',
                                background: audioLoading ? '#ccc' : 'linear-gradient(135deg, #667eea, #764ba2)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: audioLoading ? 'wait' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            {audioLoading ? '⏳' : '🎤'} {audioLoading ? 'Generating...' : 'Generate'}
                        </button>

                        {/* Play Button (shows when audio is ready) */}
                        {audioSrc && (
                            <button
                                onClick={toggleAudio}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    background: audioPlaying ? '#ef4444' : '#22c55e',
                                    color: 'white',
                                    border: 'none',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {audioPlaying ? '⏸️' : '▶️'}
                            </button>
                        )}
                    </div>

                    {/* Hidden audio element */}
                    {audioSrc && <audio ref={audioRef} src={audioSrc} style={{ display: 'none' }} />}
                </div>
            </div>

            <div className="invoice-preview-container">
                <div className="invoice-preview" ref={ previewRef }>
                    {/* Invoice Header */ }
                    <div className="invoice-header" style={ { ...headerStyle, color: 'white', padding: '20px 24px' } }>
                        <div className="invoice-company" style={ { display: 'flex', alignItems: 'center', gap: '12px', flex: 1 } }>
                            {/* Company Logo */ }
                            { data.companyLogo && (
                                <img
                                    src={ data.companyLogo }
                                    alt="Logo"
                                    style={ {
                                        width: '48px',
                                        height: '48px',
                                        objectFit: 'contain',
                                        background: 'white',
                                        borderRadius: '6px',
                                        padding: '3px',
                                        flexShrink: 0
                                    } }
                                />
                            ) }
                            <div style={ { minWidth: 0 } }>
                                <div className="invoice-company-name" style={ {
                                    color: 'white',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                    fontSize: '16px',
                                    fontWeight: '700',
                                    marginBottom: '4px'
                                } }>{ data.companyName || 'Your Company' }</div>
                                <div className="invoice-company-details" style={ {
                                    color: 'rgba(255,255,255,0.85)',
                                    fontSize: '11px',
                                    lineHeight: '1.4'
                                } }>
                                    { data.companyAddress && <div style={ { marginBottom: '2px' } }>{ data.companyAddress }</div> }
                                    { data.companyEmail && <div>✉️ { data.companyEmail }</div> }
                                    { data.companyPhone && <div>📞 { data.companyPhone }</div> }
                                </div>
                            </div>
                        </div>
                        <div className="invoice-meta" style={ { textAlign: 'right', flexShrink: 0 } }>
                            <div className="invoice-title" style={ {
                                color: 'white',
                                fontWeight: '800',
                                fontSize: '22px',
                                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                marginBottom: '4px'
                            } }>INVOICE</div>
                            <div className="invoice-number" style={ { color: 'white', fontWeight: '600', fontSize: '13px', marginBottom: '2px' } }>#{ data.invoiceNumber }</div>
                            <div className="invoice-date" style={ { color: 'rgba(255,255,255,0.85)', fontSize: '11px' } }>Date: { formatDate( data.invoiceDate ) }</div>
                            <div className="invoice-date" style={ { color: 'rgba(255,255,255,0.85)', fontSize: '11px' } }>Due: { formatDate( data.dueDate ) }</div>
                        </div>
                    </div>

                    {/* Currency Badge */ }
                    <div style={ {
                        display: 'flex',
                        justifyContent: 'flex-end',
                        padding: '8px 24px 0',
                        background: '#fff'
                    } }>
                        <span style={ {
                            background: template.primary,
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600'
                        } }>
                            { currencyInfo.symbol } { data.currency || 'INR' }
                        </span>
                    </div>

                    {/* Bill To / Ship To */ }
                    <div className="invoice-parties">
                        <div className="invoice-party">
                            <div className="invoice-party-label" style={ { color: template.primary } }>Bill To</div>
                            <div className="invoice-party-name">{ data.customerName || 'Customer Name' }</div>
                            <div className="invoice-party-details">
                                { data.customerAddress && <div>{ data.customerAddress }</div> }
                                { data.customerEmail && <div>{ data.customerEmail }</div> }
                                { data.customerPhone && <div>{ data.customerPhone }</div> }
                            </div>
                        </div>
                        <div className="invoice-party">
                            <div className="invoice-party-label" style={ { color: template.primary } }>From</div>
                            <div className="invoice-party-name">{ data.companyName || 'Your Company' }</div>
                            <div className="invoice-party-details">
                                { data.companyAddress && <div>{ data.companyAddress }</div> }
                            </div>
                        </div>
                    </div>

                    {/* BOM Title */ }
                    <div style={ {
                        padding: '16px 24px 8px',
                        background: '#fff'
                    } }>
                        <h3 style={ {
                            margin: 0,
                            fontSize: '14px',
                            fontWeight: '700',
                            color: template.primary || '#667eea',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        } }>
                            📋 Bill of Materials (Purchase Order)
                        </h3>
                    </div>

                    {/* Items Table */ }
                    <table className="invoice-items-table">
                        <thead>
                            <tr style={ headerStyle }>
                                <th style={ { color: 'white', width: '60px' } }>Image</th>
                                <th style={ { color: 'white' } }>Description</th>
                                <th style={ { color: 'white' } }>Code</th>
                                <th style={ { color: 'white' } }>Qty</th>
                                <th style={ { color: 'white' } }>Unit Price</th>
                                <th style={ { color: 'white' } }>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            { data.items.map( ( item, index ) => (
                                <>
                                    <tr key={ item.id || index }>
                                        <td style={ { padding: '8px' } }>
                                            { item.image ? (
                                                <img
                                                    src={ item.image }
                                                    alt=""
                                                    style={ { width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' } }
                                                />
                                            ) : (
                                                <div style={ { width: '40px', height: '40px', background: '#f0f0f0', borderRadius: '4px' } }></div>
                                            ) }
                                        </td>
                                        <td>
                                            { item.description || 'Item description' }
                                            {isConverting && (
                                                <div style={{
                                                    fontSize: '10px',
                                                    color: '#888',
                                                    marginTop: '2px'
                                                }}>
                                                    Original ({data.currency})
                                                </div>
                                            )}
                                        </td>
                                        <td style={ { fontSize: '12px', color: '#666' } }>{ item.productCode || '-' }</td>
                                        <td>{ item.quantity }</td>
                                        <td>{ formatCurrency( item.price ) }</td>
                                        <td>{ formatCurrency( item.quantity * item.price ) }</td>
                                    </tr>
                                    {/* Converted price row */}
                                    {isConverting && (
                                        <tr key={`${item.id || index}-converted`} style={{
                                            background: 'linear-gradient(90deg, #667eea10, #764ba210)'
                                        }}>
                                            <td></td>
                                            <td style={{
                                                fontSize: '11px',
                                                color: '#667eea',
                                                fontWeight: '500',
                                                padding: '4px 16px'
                                            }}>
                                                ↳ Converted ({viewCurrency})
                                            </td>
                                            <td></td>
                                            <td></td>
                                            <td style={{
                                                color: '#667eea',
                                                fontWeight: '600',
                                                fontSize: '12px'
                                            }}>
                                                {formatViewCurrency(item.price)}
                                            </td>
                                            <td style={{
                                                color: '#667eea',
                                                fontWeight: '600',
                                                fontSize: '12px'
                                            }}>
                                                {formatViewCurrency(item.quantity * item.price)}
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ) ) }
                            { data.items.length === 0 && (
                                <tr>
                                    <td colSpan={ 6 } style={ { textAlign: 'center', color: '#999' } }>
                                        No items added yet
                                    </td>
                                </tr>
                            ) }
                        </tbody>
                    </table>

                    {/* Live Exchange Rate Banner */}
                    {isConverting && (
                        <div style={{
                            margin: '8px 24px 0',
                            padding: '8px 16px',
                            background: 'linear-gradient(90deg, #38ef7d20, #11998e20)',
                            borderRadius: '6px',
                            border: '1px solid #38ef7d50',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px'
                        }}>
                            <span style={{
                                background: '#38ef7d',
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: '700'
                            }}>📊 LIVE RATE</span>
                            <span style={{
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#11998e'
                            }}>
                                1 {data.currency} = {exchangeRate.toFixed(4)} {viewCurrency}
                            </span>
                            <span style={{
                                fontSize: '10px',
                                color: '#666'
                            }}>
                                (from exchangerate-api.com)
                            </span>
                        </div>
                    )}

                    {/* Totals */ }
                    <div className="invoice-totals">
                        <div className="invoice-totals-box">
                            <div className="invoice-total-row subtotal">
                                <span>Subtotal</span>
                                <span>{ formatCurrency( subtotal ) }</span>
                            </div>
                            <div className="invoice-total-row tax">
                                <span>Tax ({ data.taxRate }%)</span>
                                <span>{ formatCurrency( tax ) }</span>
                            </div>
                            <div className="invoice-total-row grand" style={ {
                                background: template.gradient
                                    ? `linear-gradient(135deg, ${ template.primary }, ${ template.secondary })`
                                    : template.primary,
                                color: 'white',
                                borderRadius: '8px',
                                padding: '12px 16px'
                            } }>
                                <span style={ { fontWeight: '700' } }>Total Due</span>
                                <span style={ { fontWeight: '800' } }>{ formatCurrency( total ) }</span>
                            </div>
                        </div>
                    </div>

                    {/* Currency Conversion Display */}
                    { viewCurrency && viewCurrency !== data.currency && convertedTotal && (
                        <div style={{
                            margin: '16px 24px',
                            padding: '16px',
                            background: 'linear-gradient(135deg, #667eea15, #764ba220)',
                            borderRadius: '10px',
                            border: '1px solid #667eea50'
                        }}>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                marginBottom: '10px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '18px' }}>💱</span>
                                    <span style={{ fontWeight: '600', fontSize: '13px', color: '#333' }}>
                                        Currency Conversion
                                    </span>
                                    <span style={{
                                        background: '#38ef7d',
                                        color: '#fff',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontSize: '9px',
                                        fontWeight: '600'
                                    }}>LIVE</span>
                                </div>
                                <div style={{ 
                                    fontWeight: '700', 
                                    fontSize: '18px', 
                                    color: '#667eea' 
                                }}>
                                    {CURRENCIES[viewCurrency]?.symbol || ''}{convertedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </div>
                            
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px 12px',
                                background: 'rgba(255,255,255,0.8)',
                                borderRadius: '6px',
                                fontSize: '11px'
                            }}>
                                <div style={{ color: '#666' }}>
                                    <strong>Original:</strong> {CURRENCIES[data.currency]?.symbol || ''}{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })} {data.currency}
                                </div>
                                {exchangeRate && (
                                    <div style={{ 
                                        color: '#667eea', 
                                        fontWeight: '600',
                                        background: '#667eea15',
                                        padding: '4px 8px',
                                        borderRadius: '4px'
                                    }}>
                                        📊 1 {data.currency} = {exchangeRate.toFixed(4)} {viewCurrency}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Crypto Payment Section */}
                    { data.cryptoWallets && Object.values(data.cryptoWallets).some(w => w.enabled && w.address) && (
                        <div style={{
                            margin: '16px 24px',
                            padding: '16px',
                            background: '#f8f9fa',
                            borderRadius: '10px',
                            border: '1px solid #e9ecef'
                        }}>
                            <div style={{ 
                                fontWeight: '700', 
                                fontSize: '13px', 
                                marginBottom: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: '#333'
                            }}>
                                <span>₿</span> Crypto Payment Options
                            </div>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'center',
                                gap: '20px',
                                flexWrap: 'wrap'
                            }}>
                                {Object.entries(data.cryptoWallets || {}).map(([key, wallet]) => {
                                    if (!wallet.enabled || !wallet.address) return null;
                                    const info = CRYPTO_INFO[key];
                                    if (!info) return null;
                                    return (
                                        <div key={key} style={{ textAlign: 'center', minWidth: '100px' }}>
                                            <div style={{ 
                                                fontWeight: '600', 
                                                fontSize: '11px', 
                                                marginBottom: '6px',
                                                color: info.color,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '4px'
                                            }}>
                                                <span>{info.icon}</span> {info.name}
                                            </div>
                                            <img
                                                src={getQRCodeUrl(wallet.address)}
                                                alt={`${info.name} QR`}
                                                style={{ width: '70px', height: '70px', borderRadius: '6px', marginBottom: '4px' }}
                                            />
                                            <div style={{ 
                                                fontSize: '8px', 
                                                fontFamily: 'monospace', 
                                                color: '#666',
                                                wordBreak: 'break-all',
                                                maxWidth: '90px',
                                                margin: '0 auto'
                                            }}>
                                                {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Payment Section - QR and Link */}
                    { data.showPaymentOnInvoice && ( paymentLink || data.paymentLink ) && (
                        <div style={ {
                            margin: '24px',
                            padding: '20px',
                            background: '#f8f9fa',
                            borderRadius: '12px',
                            border: `2px dashed ${ template.primary }`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '24px'
                        } }>
                            {/* QR Code */}
                            <div style={ { textAlign: 'center' } }>
                                <img
                                    src={ getQRCodeUrl( paymentLink || data.paymentLink ) }
                                    alt="Payment QR"
                                    style={ { width: '100px', height: '100px', borderRadius: '8px' } }
                                />
                                <div style={ { fontSize: '10px', color: '#666', marginTop: '4px' } }>
                                    Scan to Pay
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div style={ { flex: 1 } }>
                                <div style={ {
                                    fontWeight: '700',
                                    color: template.primary,
                                    marginBottom: '8px',
                                    fontSize: '14px'
                                } }>
                                    💳 Pay Online
                                </div>
                                <div style={ { fontSize: '12px', color: '#666', marginBottom: '8px' } }>
                                    Click the link below or scan the QR code to pay securely:
                                </div>
                                <a
                                    href={ paymentLink || data.paymentLink }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={ {
                                        display: 'inline-block',
                                        background: template.gradient
                                            ? `linear-gradient(135deg, ${ template.primary }, ${ template.secondary })`
                                            : template.primary,
                                        color: 'white',
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        textDecoration: 'none',
                                        wordBreak: 'break-all'
                                    } }
                                >
                                    { ( paymentLink || data.paymentLink ).length > 40
                                        ? ( paymentLink || data.paymentLink ).substring( 0, 40 ) + '...'
                                        : ( paymentLink || data.paymentLink )
                                    }
                                </a>
                            </div>
                        </div>
                    ) }

                    {/* Gift Voucher Section */}
                    { data.giftConfig?.enabled && (
                        <div style={{
                            margin: '16px 24px',
                            padding: '20px',
                            background: `linear-gradient(135deg, ${GIFT_TYPES[data.giftConfig?.type]?.color || '#667eea'}15, ${GIFT_TYPES[data.giftConfig?.type]?.color || '#667eea'}05)`,
                            borderRadius: '12px',
                            border: `2px dashed ${GIFT_TYPES[data.giftConfig?.type]?.color || '#667eea'}60`,
                            textAlign: 'center'
                        }}>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                gap: '12px',
                                marginBottom: '12px'
                            }}>
                                <span style={{ fontSize: '32px' }}>
                                    {GIFT_TYPES[data.giftConfig?.type]?.icon || '🎁'}
                                </span>
                                <div>
                                    <div style={{ 
                                        fontWeight: '700', 
                                        fontSize: '16px', 
                                        color: GIFT_TYPES[data.giftConfig?.type]?.color || '#667eea'
                                    }}>
                                        {GIFT_TYPES[data.giftConfig?.type]?.name || 'Special Gift'}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#666' }}>
                                        🎉 Exclusively for you!
                                    </div>
                                </div>
                            </div>
                            
                            {data.giftConfig?.message && (
                                <div style={{
                                    fontSize: '13px',
                                    color: '#444',
                                    fontStyle: 'italic',
                                    marginBottom: '12px',
                                    padding: '8px 16px',
                                    background: 'rgba(255,255,255,0.7)',
                                    borderRadius: '6px'
                                }}>
                                    "{data.giftConfig.message}"
                                </div>
                            )}
                            
                            {data.giftConfig?.link && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                    <img
                                        src={getQRCodeUrl(data.giftConfig.link)}
                                        alt="Redemption QR"
                                        style={{ width: '80px', height: '80px', borderRadius: '8px' }}
                                    />
                                    <div>
                                        <div style={{ fontSize: '10px', color: '#666', marginBottom: '4px' }}>
                                            Scan to Redeem / Enter Lucky Draw
                                        </div>
                                        <a
                                            href={data.giftConfig.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'inline-block',
                                                background: GIFT_TYPES[data.giftConfig?.type]?.color || '#667eea',
                                                color: 'white',
                                                padding: '6px 14px',
                                                borderRadius: '20px',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                textDecoration: 'none'
                                            }}
                                        >
                                            🎁 Claim Your Gift
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Support/Crowdfunding Section */}
                    { data.supportConfig?.enabled && (
                        <div style={{
                            margin: '16px 24px',
                            padding: '20px',
                            background: 'linear-gradient(135deg, #fef3c7, #fde68a40)',
                            borderRadius: '12px',
                            border: '2px solid #f59e0b50',
                            textAlign: 'center'
                        }}>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                gap: '10px',
                                marginBottom: '12px'
                            }}>
                                <span style={{ fontSize: '28px' }}>☕❤️</span>
                                <div style={{ 
                                    fontWeight: '700', 
                                    fontSize: '16px', 
                                    color: '#b45309'
                                }}>
                                    {data.supportConfig?.title || 'Support Us'}
                                </div>
                            </div>
                            
                            {data.supportConfig?.message && (
                                <div style={{
                                    fontSize: '12px',
                                    color: '#78350f',
                                    marginBottom: '12px',
                                    padding: '10px 16px',
                                    background: 'rgba(255,255,255,0.6)',
                                    borderRadius: '8px',
                                    lineHeight: '1.5'
                                }}>
                                    {data.supportConfig.message}
                                </div>
                            )}
                            
                            {data.supportConfig?.link && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                    <img
                                        src={getQRCodeUrl(data.supportConfig.link)}
                                        alt="Support QR"
                                        style={{ width: '80px', height: '80px', borderRadius: '8px', border: '2px solid #f59e0b30' }}
                                    />
                                    <div>
                                        <div style={{ fontSize: '10px', color: '#92400e', marginBottom: '6px' }}>
                                            Scan to contribute
                                        </div>
                                        <a
                                            href={data.supportConfig.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'inline-block',
                                                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                                color: 'white',
                                                padding: '10px 20px',
                                                borderRadius: '25px',
                                                fontSize: '12px',
                                                fontWeight: '700',
                                                textDecoration: 'none',
                                                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                                            }}
                                        >
                                            ☕ Buy Me a Coffee
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Business Links Section */}
                    { data.businessLinks?.enabled && (
                        data.businessLinks?.businessCard || 
                        data.businessLinks?.arBusinessCard || 
                        data.businessLinks?.linkedIn || 
                        data.businessLinks?.listingWebsite || 
                        data.businessLinks?.landingPage
                    ) && (
                        <div style={{
                            margin: '16px 24px',
                            padding: '16px',
                            background: 'linear-gradient(135deg, #eef2ff, #e0e7ff40)',
                            borderRadius: '12px',
                            border: '1px solid #6366f150'
                        }}>
                            <div style={{ 
                                fontWeight: '700', 
                                fontSize: '13px', 
                                marginBottom: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: '#4338ca'
                            }}>
                                <span>🔗</span> Connect With Us
                            </div>
                            
                            {/* Clickable Icon Links Row */}
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '12px',
                                flexWrap: 'wrap',
                                marginBottom: '12px',
                                padding: '10px',
                                background: 'rgba(255,255,255,0.7)',
                                borderRadius: '8px'
                            }}>
                                {data.businessLinks?.businessCard && (
                                    <a
                                        href={data.businessLinks.businessCard}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '6px 12px',
                                            background: 'linear-gradient(135deg, #4338ca, #6366f1)',
                                            color: 'white',
                                            borderRadius: '20px',
                                            textDecoration: 'none',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            transition: 'transform 0.2s'
                                        }}
                                        title="View Business Card"
                                    >
                                        <span style={{ fontSize: '14px' }}>💼</span>
                                        Business Card
                                    </a>
                                )}
                                {data.businessLinks?.arBusinessCard && (
                                    <a
                                        href={data.businessLinks.arBusinessCard}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '6px 12px',
                                            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                                            color: 'white',
                                            borderRadius: '20px',
                                            textDecoration: 'none',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            transition: 'transform 0.2s'
                                        }}
                                        title="View AR Experience"
                                    >
                                        <span style={{ fontSize: '14px' }}>🥽</span>
                                        AR Card
                                    </a>
                                )}
                                {data.businessLinks?.linkedIn && (
                                    <a
                                        href={data.businessLinks.linkedIn}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '6px 12px',
                                            background: '#0077b5',
                                            color: 'white',
                                            borderRadius: '20px',
                                            textDecoration: 'none',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            transition: 'transform 0.2s'
                                        }}
                                        title="Visit LinkedIn Profile"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                        </svg>
                                        LinkedIn
                                    </a>
                                )}
                                {data.businessLinks?.listingWebsite && (
                                    <a
                                        href={data.businessLinks.listingWebsite}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '6px 12px',
                                            background: 'linear-gradient(135deg, #ea4335, #fbbc05)',
                                            color: 'white',
                                            borderRadius: '20px',
                                            textDecoration: 'none',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            transition: 'transform 0.2s'
                                        }}
                                        title="View on Google/Listing"
                                    >
                                        <span style={{ fontSize: '14px' }}>📍</span>
                                        Google/Listing
                                    </a>
                                )}
                                {data.businessLinks?.landingPage && (
                                    <a
                                        href={data.businessLinks.landingPage}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '6px 12px',
                                            background: 'linear-gradient(135deg, #059669, #10b981)',
                                            color: 'white',
                                            borderRadius: '20px',
                                            textDecoration: 'none',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            transition: 'transform 0.2s'
                                        }}
                                        title="Visit Website"
                                    >
                                        <span style={{ fontSize: '14px' }}>🌐</span>
                                        Website
                                    </a>
                                )}
                            </div>

                            {/* QR Codes Row */}
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'center',
                                gap: '12px',
                                flexWrap: 'wrap'
                            }}>
                                {data.businessLinks?.businessCard && (
                                    <div style={{ textAlign: 'center' }}>
                                        <img
                                            src={getQRCodeUrl(data.businessLinks.businessCard)}
                                            alt="Business Card QR"
                                            style={{ width: '50px', height: '50px', borderRadius: '4px' }}
                                        />
                                        <div style={{ fontSize: '8px', color: '#4338ca', fontWeight: '500', marginTop: '2px' }}>
                                            💼 vCard
                                        </div>
                                    </div>
                                )}
                                {data.businessLinks?.arBusinessCard && (
                                    <div style={{ textAlign: 'center' }}>
                                        <img
                                            src={getQRCodeUrl(data.businessLinks.arBusinessCard)}
                                            alt="AR Card QR"
                                            style={{ width: '50px', height: '50px', borderRadius: '4px' }}
                                        />
                                        <div style={{ fontSize: '8px', color: '#7c3aed', fontWeight: '500', marginTop: '2px' }}>
                                            🥽 AR
                                        </div>
                                    </div>
                                )}
                                {data.businessLinks?.linkedIn && (
                                    <div style={{ textAlign: 'center' }}>
                                        <img
                                            src={getQRCodeUrl(data.businessLinks.linkedIn)}
                                            alt="LinkedIn QR"
                                            style={{ width: '50px', height: '50px', borderRadius: '4px' }}
                                        />
                                        <div style={{ fontSize: '8px', color: '#0077b5', fontWeight: '500', marginTop: '2px' }}>
                                            in LinkedIn
                                        </div>
                                    </div>
                                )}
                                {data.businessLinks?.listingWebsite && (
                                    <div style={{ textAlign: 'center' }}>
                                        <img
                                            src={getQRCodeUrl(data.businessLinks.listingWebsite)}
                                            alt="Listing QR"
                                            style={{ width: '50px', height: '50px', borderRadius: '4px' }}
                                        />
                                        <div style={{ fontSize: '8px', color: '#ea4335', fontWeight: '500', marginTop: '2px' }}>
                                            📍 Maps
                                        </div>
                                    </div>
                                )}
                                {data.businessLinks?.landingPage && (
                                    <div style={{ textAlign: 'center' }}>
                                        <img
                                            src={getQRCodeUrl(data.businessLinks.landingPage)}
                                            alt="Website QR"
                                            style={{ width: '50px', height: '50px', borderRadius: '4px' }}
                                        />
                                        <div style={{ fontSize: '8px', color: '#059669', fontWeight: '500', marginTop: '2px' }}>
                                            🌐 Web
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div style={{
                                marginTop: '8px',
                                fontSize: '8px',
                                color: '#6366f1',
                                textAlign: 'center',
                                fontWeight: '500'
                            }}>
                                Click links above or scan QR codes to connect
                            </div>
                        </div>
                    )}


                    {/* Footer */ }
                    <div className="invoice-footer">
                        <div className="invoice-thank-you" style={ { color: template.primary } }>
                            Thank you for your business!
                        </div>
                        <div className="invoice-footer-text">
                            { data.notes || 'Payment is due within 30 days. Please make checks payable to ' + ( data.companyName || 'Your Company' ) }
                        </div>

                        {/* Notice Periods Section */ }
                        <div style={ {
                            marginTop: '16px',
                            padding: '12px 16px',
                            background: '#f8f9fa',
                            borderRadius: '8px',
                            border: '1px solid #e9ecef',
                            fontSize: '10px',
                            color: '#666',
                            lineHeight: '1.6'
                        } }>
                            <div style={ { fontWeight: '700', color: '#444', marginBottom: '8px', fontSize: '11px' } }>
                                📋 Important Notice Periods
                            </div>
                            <div style={ { display: 'flex', gap: '24px', flexWrap: 'wrap' } }>
                                <div>
                                    <strong>🛒 Product Purchase:</strong> Products are non-refundable after 7 days from date of purchase.
                                    Exchange available within 15 days with original packaging.
                                </div>
                                <div>
                                    <strong>⚠️ Grievance/Damages:</strong> All product damage complaints must be reported within 48 hours
                                    of delivery. Claims after this period may not be entertained.
                                </div>
                            </div>
                        </div>

                        {/* Copyright Footer */ }
                        <div style={ {
                            marginTop: '16px',
                            paddingTop: '12px',
                            borderTop: '1px solid #e9ecef',
                            textAlign: 'center',
                            fontSize: '10px',
                            color: '#999'
                        } }>
                            © 2026 { data.companyName || 'Company Name' }. All rights reserved.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} );

InvoicePreview.displayName = 'InvoicePreview';

export default InvoicePreview;
