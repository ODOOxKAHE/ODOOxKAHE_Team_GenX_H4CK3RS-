import { memo, useState } from 'react';
import CurrencySelector from './CurrencySelector';
import TemplateSelector from './TemplateSelector';

const CURRENCIES = {
    INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥',
    AUD: 'A$', CAD: 'C$', AED: 'د.إ', SGD: 'S$'
};

const CRYPTO_INFO = {
    eth: { name: 'Ethereum', symbol: 'ETH', icon: 'Ξ', color: '#627EEA', placeholder: '0x...' },
    btc: { name: 'Bitcoin', symbol: 'BTC', icon: '₿', color: '#F7931A', placeholder: 'bc1q... or 1...' },
    sol: { name: 'Solana', symbol: 'SOL', icon: '◎', color: '#9945FF', placeholder: '...(base58)' }
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

const InvoiceForm = memo( ( {
    data,
    updateData,
    addLineItem,
    updateLineItem,
    deleteLineItem,
    subtotal,
    tax,
    discount,
    total,
    currencySymbol = '₹',
    onShare,
    onNotify,
    onPayment,
    onCrypto,
    onPrint,
    viewCurrency,
    onViewCurrencyChange
} ) =>
{
    const [ showCryptoConfig, setShowCryptoConfig ] = useState( false );
    const [ showGiftConfig, setShowGiftConfig ] = useState( false );
    const [ showSupportConfig, setShowSupportConfig ] = useState( false );
    const [ showBusinessLinks, setShowBusinessLinks ] = useState( false );

    const formatCurrency = ( amount ) =>
    {
        const symbol = CURRENCIES[ data.currency ] || currencySymbol;
        return `${ symbol }${ amount.toLocaleString( 'en-IN', { minimumFractionDigits: 2 } ) }`;
    };

    const updateCryptoWallet = ( crypto, field, value ) =>
    {
        const currentWallets = data.cryptoWallets || { eth: {}, btc: {}, sol: {} };
        updateData( {
            cryptoWallets: {
                ...currentWallets,
                [ crypto ]: { ...currentWallets[ crypto ], [ field ]: value }
            }
        } );
    };

    return (
        <div className="glass-card">
            <div className="card-header">
                <h2 className="card-title">
                    <span className="card-title-icon">✏️</span>
                    Invoice Details
                </h2>
            </div>

            {/* Settings Row - Currency & Template */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div className="form-group">
                    <label className="form-label">Invoice Currency</label>
                    <select
                        className="form-input"
                        value={data.currency || 'INR'}
                        onChange={(e) => updateData({ currency: e.target.value })}
                    >
                        {Object.entries(CURRENCIES).map(([code, symbol]) => (
                            <option key={code} value={code}>{symbol} {code}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">💱 View In</label>
                    <select
                        className="form-input"
                        value={viewCurrency || 'INR'}
                        onChange={(e) => onViewCurrencyChange && onViewCurrencyChange(e.target.value)}
                        style={{
                            background: viewCurrency !== data.currency ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))' : undefined,
                            border: viewCurrency !== data.currency ? '1px solid rgba(102, 126, 234, 0.5)' : undefined
                        }}
                    >
                        {Object.entries(CURRENCIES).map(([code, symbol]) => (
                            <option key={code} value={code}>{symbol} {code}</option>
                        ))}
                    </select>
                    {viewCurrency !== data.currency && (
                        <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', marginTop: '4px', display: 'block' }}>
                            Viewing conversion
                        </span>
                    )}
                </div>
                <TemplateSelector
                    value={data.template || 'modern'}
                    onChange={(template) => updateData({ template })}
                />
            </div>

            <div className="section-divider"></div>

            {/* Company Information */ }
            <div className="form-section">
                <h3 className="section-title">Your Company</h3>

                {/* Company Logo */ }
                <div style={ { display: 'flex', gap: '20px', marginBottom: '16px' } }>
                    <div style={ { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' } }>
                        <div
                            style={ {
                                width: '80px',
                                height: '80px',
                                border: data.companyLogo ? 'none' : '2px dashed rgba(255,255,255,0.3)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                overflow: 'hidden',
                                background: 'var(--bg-tertiary)',
                                flexShrink: 0
                            } }
                            title="Click and paste logo (Ctrl+V)"
                            tabIndex={ 0 }
                            onPaste={ ( e ) =>
                            {
                                const items = e.clipboardData?.items;
                                for ( let i = 0; i < items?.length; i++ )
                                {
                                    if ( items[ i ].type.indexOf( 'image' ) !== -1 )
                                    {
                                        const blob = items[ i ].getAsFile();
                                        const reader = new FileReader();
                                        reader.onload = ( event ) =>
                                        {
                                            updateData( { companyLogo: event.target.result } );
                                        };
                                        reader.readAsDataURL( blob );
                                        e.preventDefault();
                                        break;
                                    }
                                }
                            } }
                            onClick={ ( e ) => e.target.focus() }
                        >
                            { data.companyLogo ? (
                                <img
                                    src={ data.companyLogo }
                                    alt="Company Logo"
                                    style={ { width: '100%', height: '100%', objectFit: 'contain' } }
                                />
                            ) : (
                                <div style={ { textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', padding: '8px' } }>
                                    🏢<br />Paste Logo
                                </div>
                            ) }
                        </div>
                        {/* File Upload Button */ }
                        <label style={ {
                            fontSize: '10px',
                            padding: '4px 8px',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        } }>
                            📁 Upload
                            <input
                                type="file"
                                accept="image/*"
                                style={ { display: 'none' } }
                                onChange={ ( e ) =>
                                {
                                    const file = e.target.files?.[ 0 ];
                                    if ( file )
                                    {
                                        const reader = new FileReader();
                                        reader.onload = ( event ) =>
                                        {
                                            updateData( { companyLogo: event.target.result } );
                                        };
                                        reader.readAsDataURL( file );
                                    }
                                } }
                            />
                        </label>
                    </div>
                    <div style={ { flex: 1 } }>
                        <div className="form-group" style={ { marginBottom: '8px' } }>
                            <label className="form-label">Company Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={ data.companyName }
                                onChange={ ( e ) => updateData( { companyName: e.target.value } ) }
                                placeholder="Your Company Name"
                            />
                        </div>
                        { data.companyLogo && (
                            <button
                                type="button"
                                onClick={ () => updateData( { companyLogo: null } ) }
                                style={ {
                                    background: 'rgba(245, 87, 108, 0.2)',
                                    border: 'none',
                                    padding: '4px 10px',
                                    borderRadius: '4px',
                                    color: '#f5576c',
                                    fontSize: '11px',
                                    cursor: 'pointer'
                                } }
                            >
                                Remove Logo
                            </button>
                        ) }
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={ data.companyEmail }
                            onChange={ ( e ) => updateData( { companyEmail: e.target.value } ) }
                            placeholder="company@email.com"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input
                            type="tel"
                            className="form-input"
                            value={ data.companyPhone }
                            onChange={ ( e ) => updateData( { companyPhone: e.target.value } ) }
                            placeholder="+91 98765 43210"
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Address</label>
                    <input
                        type="text"
                        className="form-input"
                        value={ data.companyAddress }
                        onChange={ ( e ) => updateData( { companyAddress: e.target.value } ) }
                        placeholder="Business Address"
                    />
                </div>
            </div>

            <div className="section-divider"></div>

            {/* Invoice Meta */ }
            <div className="form-section">
                <h3 className="section-title">Invoice Information</h3>
                <div className="form-row-3">
                    <div className="form-group">
                        <label className="form-label">Invoice Number</label>
                        <input
                            type="text"
                            className="form-input"
                            value={ data.invoiceNumber }
                            onChange={ ( e ) => updateData( { invoiceNumber: e.target.value } ) }
                            placeholder="INV-001"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Invoice Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={ data.invoiceDate }
                            onChange={ ( e ) => updateData( { invoiceDate: e.target.value } ) }
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Due Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={ data.dueDate }
                            onChange={ ( e ) => updateData( { dueDate: e.target.value } ) }
                        />
                    </div>
                </div>
            </div>

            <div className="section-divider"></div>

            {/* Customer Information */ }
            <div className="form-section">
                <h3 className="section-title">Bill To</h3>
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Customer Name</label>
                        <input
                            type="text"
                            className="form-input"
                            value={ data.customerName }
                            onChange={ ( e ) => updateData( { customerName: e.target.value } ) }
                            placeholder="Customer Name"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Customer Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={ data.customerEmail }
                            onChange={ ( e ) => updateData( { customerEmail: e.target.value } ) }
                            placeholder="customer@email.com"
                        />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input
                            type="tel"
                            className="form-input"
                            value={ data.customerPhone }
                            onChange={ ( e ) => updateData( { customerPhone: e.target.value } ) }
                            placeholder="+91 98765 43210"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Address</label>
                        <input
                            type="text"
                            className="form-input"
                            value={ data.customerAddress }
                            onChange={ ( e ) => updateData( { customerAddress: e.target.value } ) }
                            placeholder="Customer Address"
                        />
                    </div>
                </div>
            </div>

            <div className="section-divider"></div>

            {/* Bill of Materials */ }
            <div className="form-section">
                <h3 className="section-title">Bill of Materials</h3>
                <table className="bom-table">
                    <thead>
                        <tr>
                            <th style={ { width: '8%' } }>Image</th>
                            <th style={ { width: '30%' } }>Description</th>
                            <th style={ { width: '15%' } }>Product Code</th>
                            <th style={ { width: '10%' } }>Qty</th>
                            <th style={ { width: '15%' } }>Price ({ CURRENCIES[ data.currency ] || '₹' })</th>
                            <th style={ { width: '15%' } }>Amount</th>
                            <th style={ { width: '5%' } }></th>
                        </tr>
                    </thead>
                    <tbody>
                        { data.items.map( ( item ) => (
                            <tr key={ item.id }>
                                {/* Image Placeholder Column */ }
                                <td className="input-cell">
                                    <div style={ { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' } }>
                                        <div
                                            style={ {
                                                width: '50px',
                                                height: '50px',
                                                border: item.image ? 'none' : '2px dashed rgba(255,255,255,0.2)',
                                                borderRadius: '6px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                overflow: 'hidden',
                                                background: 'var(--bg-tertiary)',
                                                fontSize: '10px',
                                                color: 'var(--text-muted)',
                                                textAlign: 'center'
                                            } }
                                            title="Click to paste image (Ctrl+V)"
                                            tabIndex={ 0 }
                                            onPaste={ ( e ) =>
                                            {
                                                const items = e.clipboardData?.items;
                                                for ( let i = 0; i < items?.length; i++ )
                                                {
                                                    if ( items[ i ].type.indexOf( 'image' ) !== -1 )
                                                    {
                                                        const blob = items[ i ].getAsFile();
                                                        const reader = new FileReader();
                                                        reader.onload = ( event ) =>
                                                        {
                                                            updateLineItem( item.id, 'image', event.target.result );
                                                        };
                                                        reader.readAsDataURL( blob );
                                                        e.preventDefault();
                                                        break;
                                                    }
                                                }
                                            } }
                                            onClick={ ( e ) => e.target.focus() }
                                        >
                                            { item.image ? (
                                                <img
                                                    src={ item.image }
                                                    alt="Product"
                                                    style={ { width: '100%', height: '100%', objectFit: 'cover' } }
                                                />
                                            ) : (
                                                <span>📷<br />Paste</span>
                                            ) }
                                        </div>
                                        {/* File Upload for BOM Image */ }
                                        <label style={ {
                                            fontSize: '9px',
                                            padding: '2px 6px',
                                            background: 'var(--bg-secondary)',
                                            border: '1px solid rgba(255,255,255,0.15)',
                                            borderRadius: '3px',
                                            cursor: 'pointer',
                                            color: 'var(--text-muted)'
                                        } }>
                                            📁
                                            <input
                                                type="file"
                                                accept="image/*"
                                                style={ { display: 'none' } }
                                                onChange={ ( e ) =>
                                                {
                                                    const file = e.target.files?.[ 0 ];
                                                    if ( file )
                                                    {
                                                        const reader = new FileReader();
                                                        reader.onload = ( event ) =>
                                                        {
                                                            updateLineItem( item.id, 'image', event.target.result );
                                                        };
                                                        reader.readAsDataURL( file );
                                                    }
                                                } }
                                            />
                                        </label>
                                    </div>
                                </td>
                                {/* Description Column */ }
                                <td className="input-cell">
                                    <input
                                        type="text"
                                        value={ item.description }
                                        onChange={ ( e ) => updateLineItem( item.id, 'description', e.target.value ) }
                                        placeholder="Item description"
                                    />
                                </td>
                                {/* Product Code Column */ }
                                <td className="input-cell">
                                    <input
                                        type="text"
                                        value={ item.productCode || '' }
                                        onChange={ ( e ) => updateLineItem( item.id, 'productCode', e.target.value ) }
                                        placeholder="e.g. POS-v1"
                                        style={ { fontSize: '12px' } }
                                    />
                                </td>
                                {/* Quantity Column */ }
                                <td className="input-cell">
                                    <input
                                        type="number"
                                        min="1"
                                        value={ item.quantity }
                                        onChange={ ( e ) => updateLineItem( item.id, 'quantity', parseInt( e.target.value ) || 0 ) }
                                    />
                                </td>
                                {/* Price Column */ }
                                <td className="input-cell">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={ item.price }
                                        onChange={ ( e ) => updateLineItem( item.id, 'price', parseFloat( e.target.value ) || 0 ) }
                                    />
                                </td>
                                {/* Amount Column */ }
                                <td className="bom-row-total">
                                    { formatCurrency( item.quantity * item.price ) }
                                </td>
                                {/* Delete Column */ }
                                <td>
                                    { data.items.length > 1 && (
                                        <button
                                            className="delete-btn"
                                            onClick={ () => deleteLineItem( item.id ) }
                                            title="Remove item"
                                        >
                                            🗑️
                                        </button>
                                    ) }
                                </td>
                            </tr>
                        ) ) }
                    </tbody>
                </table>
                <button className="add-item-btn" onClick={ addLineItem }>
                    <span>+</span> Add Line Item
                </button>
            </div>

            {/* Tax, Discount & Totals */ }
            <div className="totals-section">
                <div style={ { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' } }>
                    <div className="form-group" style={ { marginBottom: '0' } }>
                        <label className="form-label">Tax Rate (%)</label>
                        <input
                            type="number"
                            className="form-input"
                            min="0"
                            max="100"
                            value={ data.taxRate }
                            onChange={ ( e ) => updateData( { taxRate: parseFloat( e.target.value ) || 0 } ) }
                        />
                    </div>
                    <div className="form-group" style={ { marginBottom: '0' } }>
                        <label className="form-label">Discount</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <select
                                className="form-input"
                                style={{ width: '60px' }}
                                value={data.discount?.type || 'percentage'}
                                onChange={(e) => updateData({ discount: { ...data.discount, type: e.target.value } })}
                            >
                                <option value="percentage">%</option>
                                <option value="fixed">{currencySymbol}</option>
                            </select>
                            <input
                                type="number"
                                className="form-input"
                                style={{ flex: 1 }}
                                min="0"
                                value={data.discount?.value || 0}
                                onChange={(e) => updateData({ discount: { ...data.discount, value: parseFloat(e.target.value) || 0 } })}
                                placeholder={data.discount?.type === 'percentage' ? 'e.g. 10' : 'e.g. 500'}
                            />
                        </div>
                    </div>
                </div>
                <div className="total-row subtotal">
                    <span>Subtotal</span>
                    <span>{ formatCurrency( subtotal ) }</span>
                </div>
                {discount > 0 && (
                    <div className="total-row" style={{ color: '#10b981' }}>
                        <span>🏷️ Discount {data.discount?.type === 'percentage' ? `(${data.discount.value}%)` : ''}</span>
                        <span>-{ formatCurrency( discount ) }</span>
                    </div>
                )}
                <div className="total-row tax">
                    <span>Tax ({ data.taxRate }%)</span>
                    <span>{ formatCurrency( tax ) }</span>
                </div>
                <div className="total-row grand-total">
                    <span>Total</span>
                    <span>{ formatCurrency( total ) }</span>
                </div>
            </div>

            {/* Crypto Wallet Configuration for Invoice */}
            <div className="section-divider"></div>
            <div className="form-section">
                <div
                    onClick={() => setShowCryptoConfig(!showCryptoConfig)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        padding: '12px 16px',
                        background: 'linear-gradient(135deg, rgba(247, 147, 26, 0.15), rgba(98, 126, 234, 0.15))',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(247, 147, 26, 0.3)',
                        marginBottom: showCryptoConfig ? '16px' : '0'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '18px' }}>₿</span>
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>Crypto Payment on Invoice</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                Add wallet addresses to display in invoice PDF
                            </div>
                        </div>
                    </div>
                    <span style={{ fontSize: '16px', transform: showCryptoConfig ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                        ▼
                    </span>
                </div>

                {showCryptoConfig && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {Object.entries(CRYPTO_INFO).map(([key, info]) => {
                            const walletData = data.cryptoWallets?.[key] || { address: '', enabled: false };
                            return (
                                <div
                                    key={key}
                                    style={{
                                        padding: '14px',
                                        background: walletData.enabled ? `linear-gradient(135deg, ${info.color}15, ${info.color}05)` : 'var(--bg-tertiary)',
                                        borderRadius: 'var(--radius-md)',
                                        border: walletData.enabled ? `1px solid ${info.color}40` : '1px solid rgba(255,255,255,0.1)'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '20px', color: info.color }}>{info.icon}</span>
                                            <span style={{ fontWeight: '600', fontSize: '13px' }}>{info.name}</span>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({info.symbol})</span>
                                        </div>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={walletData.enabled || false}
                                                onChange={(e) => updateCryptoWallet(key, 'enabled', e.target.checked)}
                                                style={{ width: '16px', height: '16px', accentColor: info.color }}
                                            />
                                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Show in Invoice</span>
                                        </label>
                                    </div>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder={info.placeholder}
                                        value={walletData.address || ''}
                                        onChange={(e) => updateCryptoWallet(key, 'address', e.target.value)}
                                        style={{
                                            fontSize: '12px',
                                            fontFamily: 'monospace',
                                            opacity: walletData.enabled ? 1 : 0.5
                                        }}
                                    />
                                </div>
                            );
                        })}
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '4px' }}>
                            💡 Enabled wallets will show QR codes and addresses in the invoice PDF
                        </div>
                    </div>
                )}
            </div>

            {/* Gift the Customer Section */}
            <div className="form-section">
                <div
                    onClick={() => setShowGiftConfig(!showGiftConfig)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        padding: '12px 16px',
                        background: data.giftConfig?.enabled 
                            ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(102, 126, 234, 0.15))'
                            : 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(102, 126, 234, 0.1))',
                        borderRadius: 'var(--radius-md)',
                        border: data.giftConfig?.enabled ? '1px solid rgba(236, 72, 153, 0.4)' : '1px solid rgba(236, 72, 153, 0.2)',
                        marginBottom: showGiftConfig ? '16px' : '0'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '18px' }}>🎁</span>
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>Gift the Customer</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                Add vouchers, offers, lucky draws to invoice
                            </div>
                        </div>
                    </div>
                    <span style={{ fontSize: '16px', transform: showGiftConfig ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                        ▼
                    </span>
                </div>

                {showGiftConfig && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Enable Gift */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <label style={{ fontSize: '13px', fontWeight: '500' }}>Enable Gift on Invoice</label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={data.giftConfig?.enabled || false}
                                    onChange={(e) => updateData({ giftConfig: { ...data.giftConfig, enabled: e.target.checked } })}
                                    style={{ width: '18px', height: '18px', accentColor: '#ec4899' }}
                                />
                            </label>
                        </div>

                        {/* Gift Type Dropdown */}
                        <div className="form-group" style={{ marginBottom: '0' }}>
                            <label className="form-label">Gift Type</label>
                            <select
                                className="form-input"
                                value={data.giftConfig?.type || 'voucher'}
                                onChange={(e) => updateData({ giftConfig: { ...data.giftConfig, type: e.target.value } })}
                                style={{ background: 'var(--bg-tertiary)' }}
                            >
                                {Object.entries(GIFT_TYPES).map(([key, info]) => (
                                    <option key={key} value={key}>{info.icon} {info.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Gift Message */}
                        <div className="form-group" style={{ marginBottom: '0' }}>
                            <label className="form-label">Gift Message (optional)</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Congratulations! You've won a special gift!"
                                value={data.giftConfig?.message || ''}
                                onChange={(e) => updateData({ giftConfig: { ...data.giftConfig, message: e.target.value } })}
                            />
                        </div>

                        {/* Redemption Link */}
                        <div className="form-group" style={{ marginBottom: '0' }}>
                            <label className="form-label">🔗 Redemption/Lucky Draw Link</label>
                            <input
                                type="url"
                                className="form-input"
                                placeholder="https://example.com/redeem?code=..."
                                value={data.giftConfig?.link || ''}
                                onChange={(e) => updateData({ giftConfig: { ...data.giftConfig, link: e.target.value } })}
                            />
                        </div>

                        {/* Preview */}
                        {data.giftConfig?.enabled && (
                            <div style={{
                                padding: '12px',
                                background: `linear-gradient(135deg, ${GIFT_TYPES[data.giftConfig?.type]?.color || '#667eea'}15, transparent)`,
                                borderRadius: 'var(--radius-md)',
                                border: `1px dashed ${GIFT_TYPES[data.giftConfig?.type]?.color || '#667eea'}50`,
                                textAlign: 'center'
                            }}>
                                <span style={{ fontSize: '24px' }}>{GIFT_TYPES[data.giftConfig?.type]?.icon || '🎁'}</span>
                                <div style={{ fontSize: '13px', fontWeight: '600', marginTop: '4px' }}>
                                    {GIFT_TYPES[data.giftConfig?.type]?.name || 'Gift'}
                                </div>
                                {data.giftConfig?.message && (
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        "{data.giftConfig.message}"
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Support/Crowdfunding Section */}
            <div className="form-section">
                <div
                    onClick={() => setShowSupportConfig(!showSupportConfig)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        padding: '12px 16px',
                        background: data.supportConfig?.enabled 
                            ? 'linear-gradient(135deg, rgba(254, 202, 87, 0.2), rgba(255, 107, 107, 0.15))'
                            : 'linear-gradient(135deg, rgba(254, 202, 87, 0.1), rgba(255, 107, 107, 0.1))',
                        borderRadius: 'var(--radius-md)',
                        border: data.supportConfig?.enabled ? '1px solid rgba(254, 202, 87, 0.4)' : '1px solid rgba(254, 202, 87, 0.2)',
                        marginBottom: showSupportConfig ? '16px' : '0'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '18px' }}>☕</span>
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>Support / Crowdfunding</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                Request donations for causes (hospital, education, etc.)
                            </div>
                        </div>
                    </div>
                    <span style={{ fontSize: '16px', transform: showSupportConfig ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                        ▼
                    </span>
                </div>

                {showSupportConfig && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Enable Support */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <label style={{ fontSize: '13px', fontWeight: '500' }}>Enable on Invoice</label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={data.supportConfig?.enabled || false}
                                    onChange={(e) => updateData({ supportConfig: { ...data.supportConfig, enabled: e.target.checked } })}
                                    style={{ width: '18px', height: '18px', accentColor: '#feca57' }}
                                />
                            </label>
                        </div>

                        {/* Title */}
                        <div className="form-group" style={{ marginBottom: '0' }}>
                            <label className="form-label">Button Title</label>
                            <select
                                className="form-input"
                                value={data.supportConfig?.title || 'Buy Me a Coffee'}
                                onChange={(e) => updateData({ supportConfig: { ...data.supportConfig, title: e.target.value } })}
                            >
                                <option value="Buy Me a Coffee">☕ Buy Me a Coffee</option>
                                <option value="Support Us">💝 Support Us</option>
                                <option value="Donate">🙏 Donate</option>
                                <option value="Help Our Cause">❤️ Help Our Cause</option>
                                <option value="Hospital Fund">🏥 Hospital Fund</option>
                                <option value="Education Fund">📚 Education Fund</option>
                                <option value="Blood Donation">🩸 Blood Donation</option>
                            </select>
                        </div>

                        {/* Message */}
                        <div className="form-group" style={{ marginBottom: '0' }}>
                            <label className="form-label">Cause Description</label>
                            <textarea
                                className="form-input"
                                rows="2"
                                placeholder="e.g. Help us raise funds for a local school's computer lab..."
                                value={data.supportConfig?.message || ''}
                                onChange={(e) => updateData({ supportConfig: { ...data.supportConfig, message: e.target.value } })}
                            />
                        </div>

                        {/* Donation Link */}
                        <div className="form-group" style={{ marginBottom: '0' }}>
                            <label className="form-label">🔗 Donation Link (Ko-fi, PayPal, UPI, etc.)</label>
                            <input
                                type="url"
                                className="form-input"
                                placeholder="https://ko-fi.com/yourname or upi://pay?..."
                                value={data.supportConfig?.link || ''}
                                onChange={(e) => updateData({ supportConfig: { ...data.supportConfig, link: e.target.value } })}
                            />
                        </div>

                        {/* Preview */}
                        {data.supportConfig?.enabled && (
                            <div style={{
                                padding: '12px',
                                background: 'linear-gradient(135deg, rgba(254, 202, 87, 0.15), rgba(255, 107, 107, 0.1))',
                                borderRadius: 'var(--radius-md)',
                                border: '1px dashed rgba(254, 202, 87, 0.4)',
                                textAlign: 'center'
                            }}>
                                <span style={{ fontSize: '20px' }}>☕💝</span>
                                <div style={{ fontSize: '13px', fontWeight: '600', marginTop: '4px', color: '#feca57' }}>
                                    {data.supportConfig?.title || 'Support Us'}
                                </div>
                                {data.supportConfig?.message && (
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        {data.supportConfig.message}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Business Links Section */}
            <div className="form-section">
                <div
                    onClick={() => setShowBusinessLinks(!showBusinessLinks)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        padding: '12px 16px',
                        background: data.businessLinks?.enabled 
                            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(59, 130, 246, 0.15))'
                            : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(59, 130, 246, 0.1))',
                        borderRadius: 'var(--radius-md)',
                        border: data.businessLinks?.enabled ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(99, 102, 241, 0.2)',
                        marginBottom: showBusinessLinks ? '16px' : '0'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '18px' }}>🔗</span>
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>Business Links</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                Add business cards, LinkedIn, website links to invoice
                            </div>
                        </div>
                    </div>
                    <span style={{ fontSize: '16px', transform: showBusinessLinks ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                        ▼
                    </span>
                </div>

                {showBusinessLinks && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Enable Business Links */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <label style={{ fontSize: '13px', fontWeight: '500' }}>Show on Invoice</label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={data.businessLinks?.enabled || false}
                                    onChange={(e) => updateData({ businessLinks: { ...data.businessLinks, enabled: e.target.checked } })}
                                    style={{ width: '18px', height: '18px', accentColor: '#6366f1' }}
                                />
                            </label>
                        </div>

                        {/* Business Card Link */}
                        <div className="form-group" style={{ marginBottom: '0' }}>
                            <label className="form-label">💼 Business Card / vCard Link</label>
                            <input
                                type="url"
                                className="form-input"
                                placeholder="https://yoursite.com/business-card or vcard link"
                                value={data.businessLinks?.businessCard || ''}
                                onChange={(e) => updateData({ businessLinks: { ...data.businessLinks, businessCard: e.target.value } })}
                            />
                        </div>

                        {/* AR Business Card */}
                        <div className="form-group" style={{ marginBottom: '0' }}>
                            <label className="form-label">🥽 AR Business Card</label>
                            <input
                                type="url"
                                className="form-input"
                                placeholder="https://ar-card.example.com or AR experience link"
                                value={data.businessLinks?.arBusinessCard || ''}
                                onChange={(e) => updateData({ businessLinks: { ...data.businessLinks, arBusinessCard: e.target.value } })}
                            />
                        </div>

                        {/* LinkedIn */}
                        <div className="form-group" style={{ marginBottom: '0' }}>
                            <label className="form-label">💼 Company LinkedIn</label>
                            <input
                                type="url"
                                className="form-input"
                                placeholder="https://linkedin.com/company/yourcompany"
                                value={data.businessLinks?.linkedIn || ''}
                                onChange={(e) => updateData({ businessLinks: { ...data.businessLinks, linkedIn: e.target.value } })}
                            />
                        </div>

                        {/* Listing Website */}
                        <div className="form-group" style={{ marginBottom: '0' }}>
                            <label className="form-label">📍 Listing Website (Google, Yelp, etc.)</label>
                            <input
                                type="url"
                                className="form-input"
                                placeholder="https://g.page/your-business or listing URL"
                                value={data.businessLinks?.listingWebsite || ''}
                                onChange={(e) => updateData({ businessLinks: { ...data.businessLinks, listingWebsite: e.target.value } })}
                            />
                        </div>

                        {/* Landing Page */}
                        <div className="form-group" style={{ marginBottom: '0' }}>
                            <label className="form-label">🌐 Landing Page / Website</label>
                            <input
                                type="url"
                                className="form-input"
                                placeholder="https://yourcompany.com"
                                value={data.businessLinks?.landingPage || ''}
                                onChange={(e) => updateData({ businessLinks: { ...data.businessLinks, landingPage: e.target.value } })}
                            />
                        </div>

                        {/* Preview */}
                        {data.businessLinks?.enabled && (
                            <div style={{
                                padding: '12px',
                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(59, 130, 246, 0.1))',
                                borderRadius: 'var(--radius-md)',
                                border: '1px dashed rgba(99, 102, 241, 0.4)',
                            }}>
                                <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#6366f1' }}>
                                    🔗 Links Preview
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {data.businessLinks?.businessCard && (
                                        <span style={{ padding: '4px 8px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '12px', fontSize: '10px' }}>
                                            💼 Business Card
                                        </span>
                                    )}
                                    {data.businessLinks?.arBusinessCard && (
                                        <span style={{ padding: '4px 8px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '12px', fontSize: '10px' }}>
                                            🥽 AR Card
                                        </span>
                                    )}
                                    {data.businessLinks?.linkedIn && (
                                        <span style={{ padding: '4px 8px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '12px', fontSize: '10px' }}>
                                            💼 LinkedIn
                                        </span>
                                    )}
                                    {data.businessLinks?.listingWebsite && (
                                        <span style={{ padding: '4px 8px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '12px', fontSize: '10px' }}>
                                            📍 Listing
                                        </span>
                                    )}
                                    {data.businessLinks?.landingPage && (
                                        <span style={{ padding: '4px 8px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '12px', fontSize: '10px' }}>
                                            🌐 Website
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Notes */ }
            <div className="form-group" style={ { marginTop: '24px' } }>
                <label className="form-label">Notes / Terms</label>

                {/* Quick Note Templates */ }
                <div style={ { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' } }>
                    {/* Gratitude */ }
                    <button
                        type="button"
                        onClick={ () => updateData( { notes: 'Thank you for your business! We truly appreciate your trust in us. 🙏' } ) }
                        style={ {
                            padding: '6px 12px',
                            background: 'rgba(56, 239, 125, 0.15)',
                            border: '1px solid rgba(56, 239, 125, 0.3)',
                            borderRadius: '20px',
                            color: '#38ef7d',
                            fontSize: '11px',
                            cursor: 'pointer'
                        } }
                    >
                        🙏 Gratitude
                    </button>

                    {/* Retention */ }
                    <button
                        type="button"
                        onClick={ () => updateData( { notes: 'We hope to serve you again soon! Visit us for exclusive offers and discounts. See you next time! 🌟' } ) }
                        style={ {
                            padding: '6px 12px',
                            background: 'rgba(102, 126, 234, 0.15)',
                            border: '1px solid rgba(102, 126, 234, 0.3)',
                            borderRadius: '20px',
                            color: '#667eea',
                            fontSize: '11px',
                            cursor: 'pointer'
                        } }
                    >
                        🔄 Retention
                    </button>

                    {/* Payment Terms */ }
                    <button
                        type="button"
                        onClick={ () => updateData( { notes: 'Payment is due within 30 days. Late payments may incur a 2% monthly interest. Bank details provided above.' } ) }
                        style={ {
                            padding: '6px 12px',
                            background: 'rgba(245, 87, 108, 0.15)',
                            border: '1px solid rgba(245, 87, 108, 0.3)',
                            borderRadius: '20px',
                            color: '#f5576c',
                            fontSize: '11px',
                            cursor: 'pointer'
                        } }
                    >
                        📋 Terms
                    </button>

                    {/* Visit Again */ }
                    <button
                        type="button"
                        onClick={ () => updateData( { notes: 'Please visit again! Your satisfaction is our priority. Looking forward to serving you soon! 😊' } ) }
                        style={ {
                            padding: '6px 12px',
                            background: 'rgba(0, 206, 201, 0.15)',
                            border: '1px solid rgba(0, 206, 201, 0.3)',
                            borderRadius: '20px',
                            color: '#00cec9',
                            fontSize: '11px',
                            cursor: 'pointer'
                        } }
                    >
                        👋 Visit Again
                    </button>

                    {/* Referral */ }
                    <button
                        type="button"
                        onClick={ () => updateData( { notes: 'Love our service? Refer a friend and get 10% off your next purchase! Share the joy! 💝' } ) }
                        style={ {
                            padding: '6px 12px',
                            background: 'rgba(253, 121, 168, 0.15)',
                            border: '1px solid rgba(253, 121, 168, 0.3)',
                            borderRadius: '20px',
                            color: '#fd79a8',
                            fontSize: '11px',
                            cursor: 'pointer'
                        } }
                    >
                        💝 Referral
                    </button>

                    {/* Festive */ }
                    <button
                        type="button"
                        onClick={ () => updateData( { notes: 'Wishing you joy and happiness! Thank you for celebrating with us. Happy festivities! 🎉' } ) }
                        style={ {
                            padding: '6px 12px',
                            background: 'rgba(255, 193, 7, 0.15)',
                            border: '1px solid rgba(255, 193, 7, 0.3)',
                            borderRadius: '20px',
                            color: '#ffc107',
                            fontSize: '11px',
                            cursor: 'pointer'
                        } }
                    >
                        🎉 Festive
                    </button>
                </div>

                <textarea
                    className="form-input"
                    value={ data.notes }
                    onChange={ ( e ) => updateData( { notes: e.target.value } ) }
                    placeholder="Payment terms, thank you message, etc."
                    rows={ 3 }
                />
            </div>

            {/* Action Buttons - Row 1 */ }
            <div style={ { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '24px' } }>
                <button
                    className="btn-primary"
                    onClick={ onShare }
                    style={ { background: 'var(--primary-gradient)' } }
                >
                    <span>📤</span> Share
                </button>
                <button
                    className="btn-primary"
                    onClick={ onNotify }
                    style={ { background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' } }
                >
                    <span>🔔</span> Notify
                </button>
                <button
                    className="btn-primary"
                    onClick={ onPayment }
                    style={ { background: 'linear-gradient(135deg, #528FF0 0%, #0052CC 100%)' } }
                >
                    <span>💳</span> Payment
                </button>
            </div>

            {/* Action Buttons - Row 2 */ }
            <div style={ { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '12px' } }>
                <button
                    className="btn-primary"
                    onClick={ onCrypto }
                    style={ { background: 'linear-gradient(135deg, #F7931A 0%, #627EEA 100%)' } }
                >
                    <span>₿</span> Crypto Pay
                </button>
                <button
                    className="btn-primary"
                    onClick={ onPrint }
                    style={ { background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)' } }
                >
                    <span>🖨️</span> Print
                </button>
            </div>
        </div>
    );
} );

InvoiceForm.displayName = 'InvoiceForm';

export default InvoiceForm;
