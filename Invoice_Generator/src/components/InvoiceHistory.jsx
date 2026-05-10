import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3001/api';

const InvoiceHistory = ( { onLoadInvoice, showToast, onClose } ) =>
{
    const [ invoices, setInvoices ] = useState( [] );
    const [ loading, setLoading ] = useState( true );

    useEffect( () =>
    {
        fetchHistory();
    }, [] );

    const fetchHistory = async () =>
    {
        setLoading( true );
        try
        {
            const response = await fetch( `${ API_BASE }/history` );
            const data = await response.json();
            if ( data.success )
            {
                setInvoices( data.invoices );
            }
        } catch ( error )
        {
            // Fallback to localStorage
            const saved = localStorage.getItem( 'invoiceHistory' );
            if ( saved )
            {
                setInvoices( JSON.parse( saved ) );
            }
        }
        setLoading( false );
    };

    const deleteInvoice = async ( id ) =>
    {
        try
        {
            await fetch( `${ API_BASE }/history/${ id }`, { method: 'DELETE' } );
            // Also remove from localStorage
            const saved = JSON.parse( localStorage.getItem( 'invoiceHistory' ) || '[]' );
            localStorage.setItem( 'invoiceHistory', JSON.stringify( saved.filter( i => i.invoiceNumber !== id ) ) );
            setInvoices( prev => prev.filter( i => i.invoiceNumber !== id ) );
            showToast( 'Invoice deleted', 'success' );
        } catch ( error )
        {
            showToast( 'Failed to delete', 'error' );
        }
    };

    const formatDate = ( dateStr ) =>
    {
        return new Date( dateStr ).toLocaleDateString( 'en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        } );
    };

    const formatCurrency = ( amount, currency = 'INR' ) =>
    {
        return new Intl.NumberFormat( 'en-IN', {
            style: 'currency',
            currency,
            minimumFractionDigits: 0
        } ).format( amount );
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
                background: 'rgba(10, 10, 15, 0.9)',
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
                style={ { maxWidth: '700px', width: '100%', maxHeight: '80vh', overflowY: 'auto' } }
            >
                <div className="card-header">
                    <h2 className="card-title">
                        <span className="card-title-icon">📋</span>
                        Invoice History
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

                { loading ? (
                    <div style={ { textAlign: 'center', padding: '40px', color: 'var(--text-muted)' } }>
                        Loading...
                    </div>
                ) : invoices.length === 0 ? (
                    <div style={ { textAlign: 'center', padding: '60px 20px' } }>
                        <div style={ { fontSize: '48px', marginBottom: '16px' } }>📭</div>
                        <div style={ { fontSize: '16px', color: 'var(--text-muted)' } }>
                            No saved invoices yet
                        </div>
                        <div style={ { fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px' } }>
                            Create and save an invoice to see it here
                        </div>
                    </div>
                ) : (
                    <div style={ { display: 'flex', flexDirection: 'column', gap: '12px' } }>
                        { invoices.map( ( invoice ) => (
                            <div
                                key={ invoice.invoiceNumber }
                                style={ {
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '16px 20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    border: '1px solid transparent'
                                } }
                                onMouseEnter={ ( e ) => e.currentTarget.style.borderColor = 'var(--primary)' }
                                onMouseLeave={ ( e ) => e.currentTarget.style.borderColor = 'transparent' }
                            >
                                <div
                                    style={ { flex: 1 } }
                                    onClick={ () =>
                                    {
                                        onLoadInvoice( invoice );
                                        showToast( `Loaded invoice ${ invoice.invoiceNumber }`, 'success' );
                                        onClose();
                                    } }
                                >
                                    <div style={ { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' } }>
                                        <span style={ {
                                            background: 'var(--primary-gradient)',
                                            padding: '4px 10px',
                                            borderRadius: 'var(--radius-sm)',
                                            fontSize: '12px',
                                            fontWeight: '600'
                                        } }>
                                            { invoice.invoiceNumber }
                                        </span>
                                        <span style={ { fontSize: '13px', color: 'var(--text-muted)' } }>
                                            { formatDate( invoice.savedAt || invoice.invoiceDate ) }
                                        </span>
                                    </div>
                                    <div style={ { display: 'flex', alignItems: 'center', gap: '16px' } }>
                                        <span style={ { fontWeight: '500' } }>
                                            { invoice.customerName || 'No customer' }
                                        </span>
                                        <span style={ { color: 'var(--accent-cyan)', fontWeight: '600' } }>
                                            { formatCurrency( invoice.total || 0, invoice.currency || 'INR' ) }
                                        </span>
                                    </div>
                                </div>
                                <div style={ { display: 'flex', gap: '8px' } }>
                                    <button
                                        onClick={ ( e ) =>
                                        {
                                            e.stopPropagation();
                                            onLoadInvoice( invoice );
                                            showToast( `Loaded invoice ${ invoice.invoiceNumber }`, 'success' );
                                            onClose();
                                        } }
                                        style={ {
                                            background: 'var(--primary-gradient)',
                                            border: 'none',
                                            padding: '8px 16px',
                                            borderRadius: 'var(--radius-sm)',
                                            cursor: 'pointer',
                                            color: 'white',
                                            fontSize: '13px',
                                            fontWeight: '500'
                                        } }
                                    >
                                        Load
                                    </button>
                                    <button
                                        onClick={ ( e ) =>
                                        {
                                            e.stopPropagation();
                                            if ( confirm( 'Delete this invoice?' ) )
                                            {
                                                deleteInvoice( invoice.invoiceNumber );
                                            }
                                        } }
                                        style={ {
                                            background: 'rgba(239, 68, 68, 0.2)',
                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                            padding: '8px 12px',
                                            borderRadius: 'var(--radius-sm)',
                                            cursor: 'pointer',
                                            color: '#ef4444',
                                            fontSize: '14px'
                                        } }
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ) ) }
                    </div>
                ) }
            </div>
        </div>
    );
};

export default InvoiceHistory;
