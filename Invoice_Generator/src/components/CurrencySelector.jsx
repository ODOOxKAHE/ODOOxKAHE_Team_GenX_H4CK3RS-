import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3001/api';

const CURRENCIES = {
    INR: { symbol: '₹', name: 'Indian Rupee' },
    USD: { symbol: '$', name: 'US Dollar' },
    EUR: { symbol: '€', name: 'Euro' },
    GBP: { symbol: '£', name: 'British Pound' },
    JPY: { symbol: '¥', name: 'Japanese Yen' },
    AUD: { symbol: 'A$', name: 'Australian Dollar' },
    CAD: { symbol: 'C$', name: 'Canadian Dollar' },
    AED: { symbol: 'د.إ', name: 'UAE Dirham' },
    SGD: { symbol: 'S$', name: 'Singapore Dollar' }
};

const CurrencySelector = ( { value, onChange, amount, onConvertedChange } ) =>
{
    const [ rates, setRates ] = useState( null );
    const [ converting, setConverting ] = useState( false );
    const [ showConverter, setShowConverter ] = useState( false );
    const [ convertFrom, setConvertFrom ] = useState( 'INR' );
    const [ convertTo, setConvertTo ] = useState( 'USD' );
    const [ convertAmount, setConvertAmount ] = useState( amount || 0 );
    const [ convertedAmount, setConvertedAmount ] = useState( null );

    useEffect( () =>
    {
        fetchRates();
    }, [] );

    const fetchRates = async () =>
    {
        try
        {
            const response = await fetch( `${ API_BASE }/currency/rates?base=USD` );
            const data = await response.json();
            if ( data.success )
            {
                setRates( data.rates );
            }
        } catch ( error )
        {
            console.error( 'Failed to fetch rates:', error );
        }
    };

    const handleConvert = async () =>
    {
        setConverting( true );
        try
        {
            const response = await fetch(
                `${ API_BASE }/currency/convert?amount=${ convertAmount }&from=${ convertFrom }&to=${ convertTo }`
            );
            const data = await response.json();
            if ( data.success )
            {
                setConvertedAmount( data.to.amount );
                if ( onConvertedChange )
                {
                    onConvertedChange( data.to.amount, convertTo );
                }
            }
        } catch ( error )
        {
            console.error( 'Conversion failed:', error );
        }
        setConverting( false );
    };

    return (
        <div style={ { marginBottom: '20px' } }>
            <div className="form-group">
                <label className="form-label">Currency</label>
                <div style={ { display: 'flex', gap: '12px', alignItems: 'center' } }>
                    <select
                        className="form-input"
                        value={ value }
                        onChange={ ( e ) => onChange( e.target.value ) }
                        style={ { flex: 1 } }
                    >
                        { Object.entries( CURRENCIES ).map( ( [ code, info ] ) => (
                            <option key={ code } value={ code }>
                                { info.symbol } { code } - { info.name }
                            </option>
                        ) ) }
                    </select>
                    <button
                        type="button"
                        onClick={ () => setShowConverter( !showConverter ) }
                        style={ {
                            background: showConverter ? 'var(--primary-gradient)' : 'var(--bg-tertiary)',
                            border: 'none',
                            padding: '12px 16px',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            color: 'var(--text-primary)',
                            fontSize: '16px'
                        } }
                        title="Currency Converter"
                    >
                        💱
                    </button>
                </div>
            </div>

            { showConverter && (
                <div style={ {
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    marginTop: '12px'
                } }>
                    <div style={ { fontSize: '13px', fontWeight: '600', marginBottom: '12px' } }>
                        💱 Currency Converter
                    </div>
                    <div style={ { display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'end' } }>
                        <div>
                            <label style={ { fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' } }>From</label>
                            <input
                                type="number"
                                className="form-input"
                                value={ convertAmount }
                                onChange={ ( e ) => setConvertAmount( parseFloat( e.target.value ) || 0 ) }
                                style={ { marginBottom: '8px' } }
                            />
                            <select
                                className="form-input"
                                value={ convertFrom }
                                onChange={ ( e ) => setConvertFrom( e.target.value ) }
                            >
                                { Object.entries( CURRENCIES ).map( ( [ code, info ] ) => (
                                    <option key={ code } value={ code }>{ code }</option>
                                ) ) }
                            </select>
                        </div>
                        <button
                            onClick={ handleConvert }
                            disabled={ converting }
                            style={ {
                                background: 'var(--primary-gradient)',
                                border: 'none',
                                padding: '12px 20px',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                color: 'white',
                                fontWeight: '600',
                                marginBottom: '8px'
                            } }
                        >
                            { converting ? '...' : '→' }
                        </button>
                        <div>
                            <label style={ { fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' } }>To</label>
                            <input
                                type="text"
                                className="form-input"
                                readOnly
                                value={ convertedAmount !== null ? convertedAmount.toFixed( 2 ) : '' }
                                placeholder="--"
                                style={ { marginBottom: '8px' } }
                            />
                            <select
                                className="form-input"
                                value={ convertTo }
                                onChange={ ( e ) => setConvertTo( e.target.value ) }
                            >
                                { Object.entries( CURRENCIES ).map( ( [ code, info ] ) => (
                                    <option key={ code } value={ code }>{ code }</option>
                                ) ) }
                            </select>
                        </div>
                    </div>
                    { convertedAmount !== null && (
                        <div style={ {
                            marginTop: '12px',
                            padding: '12px',
                            background: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-sm)',
                            textAlign: 'center'
                        } }>
                            <span style={ { fontSize: '18px', fontWeight: '600', color: 'var(--accent-cyan)' } }>
                                { CURRENCIES[ convertFrom ].symbol }{ convertAmount.toFixed( 2 ) } = { CURRENCIES[ convertTo ].symbol }{ convertedAmount.toFixed( 2 ) }
                            </span>
                        </div>
                    ) }
                </div>
            ) }
        </div>
    );
};

export default CurrencySelector;
