import { useState } from 'react';

const API_BASE = 'http://localhost:3001/api';

const PaymentModal = ( { data, total, subtotal, tax, onClose, showToast, onAddToInvoice } ) =>
{
    const [ isCreating, setIsCreating ] = useState( false );
    const [ paymentLink, setPaymentLink ] = useState( '' );
    const [ customerPhone, setCustomerPhone ] = useState( data.customerPhone || '+917550293777' );
    const [ reminderType, setReminderType ] = useState( 'all' );

    const formatCurrency = ( amount ) =>
    {
        return new Intl.NumberFormat( 'en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        } ).format( amount );
    };

    const createPaymentLink = async () =>
    {
        setIsCreating( true );
        try
        {
            const response = await fetch( `${ API_BASE }/payment/create-link`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( {
                    amount: total,
                    invoiceNumber: data.invoiceNumber,
                    customerName: data.customerName,
                    customerEmail: data.customerEmail,
                    customerPhone: customerPhone,
                    dueDate: data.dueDate,
                    description: `Payment for Invoice ${ data.invoiceNumber } - ${ data.companyName }`
                } )
            } );
            const result = await response.json();
            if ( result.success )
            {
                setPaymentLink( result.paymentLink );
                showToast( 'Payment link created!', 'success' );
            } else
            {
                showToast( `Failed: ${ result.error }`, 'error' );
            }
        } catch ( error )
        {
            showToast( 'Failed to create payment link. Make sure Razorpay is configured.', 'error' );
        }
        setIsCreating( false );
    };

    const sendPaymentReminder = async () =>
    {
        if ( !paymentLink )
        {
            showToast( 'Create a payment link first', 'error' );
            return;
        }
        setIsCreating( true );
        try
        {
            const response = await fetch( `${ API_BASE }/payment/send-reminder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( {
                    invoiceNumber: data.invoiceNumber,
                    customerName: data.customerName,
                    customerPhone: customerPhone,
                    customerEmail: data.customerEmail,
                    amount: total,
                    dueDate: data.dueDate,
                    paymentLink: paymentLink,
                    reminderType: reminderType
                } )
            } );
            const result = await response.json();
            if ( result.success )
            {
                const successMethods = [];
                if ( result.results.sms?.success ) successMethods.push( 'SMS' );
                if ( result.results.email?.success ) successMethods.push( 'Email' );
                if ( result.results.call?.success ) successMethods.push( 'Call' );
                showToast( `Reminder sent via: ${ successMethods.join( ', ' ) || 'None' }`, 'success' );
            } else
            {
                showToast( `Failed: ${ result.error }`, 'error' );
            }
        } catch ( error )
        {
            showToast( 'Failed to send reminder', 'error' );
        }
        setIsCreating( false );
    };

    const copyPaymentLink = async () =>
    {
        if ( paymentLink )
        {
            await navigator.clipboard.writeText( paymentLink );
            showToast( 'Payment link copied!', 'success' );
        }
    };

    const addToCalendar = async ( calendarType ) =>
    {
        const eventTitle = `Payment Due: Invoice ${ data.invoiceNumber }`;
        const eventDescription = `Payment of ${ formatCurrency( total ) } due for invoice ${ data.invoiceNumber } from ${ data.companyName }`;
        const startDate = new Date( data.dueDate );
        startDate.setHours( 9, 0, 0 );
        const endDate = new Date( startDate );
        endDate.setHours( 10, 0, 0 );

        const params = new URLSearchParams( {
            title: eventTitle,
            description: eventDescription,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        } );

        if ( calendarType === 'ical' )
        {
            window.open( `${ API_BASE }/calendar/ical?${ params }`, '_blank' );
            showToast( 'Downloading calendar file...', 'success' );
        } else if ( calendarType === 'google' )
        {
            try
            {
                const response = await fetch( `${ API_BASE }/calendar/google?${ params }` );
                const result = await response.json();
                window.open( result.url, '_blank' );
            } catch ( error )
            {
                showToast( 'Failed to open Google Calendar', 'error' );
            }
        } else if ( calendarType === 'outlook' )
        {
            try
            {
                const response = await fetch( `${ API_BASE }/calendar/outlook?${ params }` );
                const result = await response.json();
                window.open( result.url, '_blank' );
            } catch ( error )
            {
                showToast( 'Failed to open Outlook Calendar', 'error' );
            }
        }
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
                style={ { maxWidth: '550px', width: '100%', maxHeight: '90vh', overflowY: 'auto' } }
            >
                <div className="card-header">
                    <h2 className="card-title">
                        <span className="card-title-icon">💳</span>
                        Payment & Reminders
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
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))',
                    borderRadius: 'var(--radius-md)',
                    padding: '20px',
                    marginBottom: '24px',
                    border: '1px solid rgba(102, 126, 234, 0.3)'
                } }>
                    <div style={ { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' } }>
                        <span style={ { color: 'var(--text-secondary)' } }>Invoice</span>
                        <span style={ { fontWeight: '600' } }>{ data.invoiceNumber }</span>
                    </div>
                    <div style={ { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' } }>
                        <span style={ { color: 'var(--text-secondary)' } }>Customer</span>
                        <span>{ data.customerName || 'Not specified' }</span>
                    </div>
                    <div style={ { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' } }>
                        <span style={ { color: 'var(--text-secondary)' } }>Due Date</span>
                        <span style={ { color: 'var(--warning)' } }>{ data.dueDate }</span>
                    </div>
                    <div style={ {
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingTop: '12px',
                        borderTop: '1px solid rgba(255,255,255,0.1)'
                    } }>
                        <span style={ { fontWeight: '600', fontSize: '16px' } }>Amount Due</span>
                        <span style={ {
                            fontWeight: '700',
                            fontSize: '24px',
                            color: 'var(--accent-cyan)'
                        } }>
                            { formatCurrency( total ) }
                        </span>
                    </div>
                </div>

                {/* Create Payment Link */ }
                <div style={ { marginBottom: '24px' } }>
                    <h3 style={ { fontSize: '14px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' } }>
                        <span>💳</span> Razorpay Payment Link
                    </h3>

                    <div className="form-group">
                        <label className="form-label">Customer Phone (for payment notifications)</label>
                        <input
                            type="tel"
                            className="form-input"
                            value={ customerPhone }
                            onChange={ ( e ) => setCustomerPhone( e.target.value ) }
                            placeholder="+91 7550293777"
                        />
                    </div>

                    { !paymentLink ? (
                        <button
                            className="btn-primary"
                            onClick={ createPaymentLink }
                            disabled={ isCreating }
                            style={ {
                                background: 'linear-gradient(135deg, #528FF0 0%, #0052CC 100%)',
                                opacity: isCreating ? 0.7 : 1
                            } }
                        >
                            { isCreating ? 'Creating...' : '💳 Create Razorpay Payment Link' }
                        </button>
                    ) : (
                        <div>
                            <div style={ {
                                background: 'var(--bg-tertiary)',
                                padding: '14px 16px',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                border: '1px solid var(--success)'
                            } }>
                                <span style={ { color: 'var(--success)' } }>✓</span>
                                <span style={ { flex: 1, fontSize: '13px', wordBreak: 'break-all' } }>{ paymentLink }</span>
                                <button
                                    onClick={ copyPaymentLink }
                                    style={ {
                                        background: 'var(--bg-secondary)',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: 'var(--radius-sm)',
                                        cursor: 'pointer',
                                        color: 'var(--text-primary)',
                                        fontSize: '13px'
                                    } }
                                >
                                    Copy
                                </button>
                            </div>

                            {/* Add to Invoice Button */ }
                            <button
                                className="btn-primary"
                                onClick={ () =>
                                {
                                    if ( onAddToInvoice )
                                    {
                                        onAddToInvoice( paymentLink );
                                        showToast( 'Payment link added to invoice with QR code!', 'success' );
                                    }
                                } }
                                style={ {
                                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                    marginBottom: '12px'
                                } }
                            >
                                📄 Add Payment Link & QR to Invoice
                            </button>

                            <a
                                href={ paymentLink }
                                target="_blank"
                                rel="noopener noreferrer"
                                style={ {
                                    display: 'block',
                                    textAlign: 'center',
                                    padding: '10px',
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--accent-cyan)',
                                    textDecoration: 'none',
                                    fontSize: '13px'
                                } }
                            >
                                🔗 Open Payment Page
                            </a>
                        </div>
                    ) }
                </div>

                <div className="section-divider"></div>

                {/* Payment Reminder */ }
                <div style={ { marginBottom: '24px' } }>
                    <h3 style={ { fontSize: '14px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' } }>
                        <span>⏰</span> Send Payment Reminder
                    </h3>

                    <div className="form-group">
                        <label className="form-label">Reminder Method</label>
                        <div style={ { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' } }>
                            { [
                                { id: 'sms', label: '📱 SMS' },
                                { id: 'email', label: '✉️ Email' },
                                { id: 'call', label: '📞 Call' },
                                { id: 'all', label: '🔔 All' }
                            ].map( method => (
                                <button
                                    key={ method.id }
                                    onClick={ () => setReminderType( method.id ) }
                                    style={ {
                                        padding: '12px 8px',
                                        background: reminderType === method.id ? 'var(--primary-gradient)' : 'var(--bg-tertiary)',
                                        border: '1px solid',
                                        borderColor: reminderType === method.id ? 'transparent' : 'rgba(255,255,255,0.1)',
                                        borderRadius: 'var(--radius-sm)',
                                        color: reminderType === method.id ? 'white' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: '500'
                                    } }
                                >
                                    { method.label }
                                </button>
                            ) ) }
                        </div>
                    </div>

                    <button
                        className="btn-primary"
                        onClick={ sendPaymentReminder }
                        disabled={ isCreating || !paymentLink }
                        style={ {
                            background: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
                            opacity: ( isCreating || !paymentLink ) ? 0.5 : 1
                        } }
                    >
                        { isCreating ? 'Sending...' : '⏰ Send Payment Reminder' }
                    </button>
                    { !paymentLink && (
                        <p style={ { fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' } }>
                            Create a payment link first to send reminders
                        </p>
                    ) }
                </div>

                <div className="section-divider"></div>

                {/* Calendar Integration */ }
                <div>
                    <h3 style={ { fontSize: '14px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' } }>
                        <span>📅</span> Add Due Date to Calendar
                    </h3>

                    <div style={ { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' } }>
                        <button
                            onClick={ () => addToCalendar( 'google' ) }
                            style={ {
                                padding: '16px',
                                background: 'var(--bg-tertiary)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px',
                                color: 'var(--text-primary)',
                                transition: 'all 0.2s ease'
                            } }
                            onMouseOver={ ( e ) => e.currentTarget.style.borderColor = '#4285F4' }
                            onMouseOut={ ( e ) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }
                        >
                            <span style={ { fontSize: '24px' } }>📆</span>
                            <span style={ { fontSize: '12px' } }>Google</span>
                        </button>
                        <button
                            onClick={ () => addToCalendar( 'outlook' ) }
                            style={ {
                                padding: '16px',
                                background: 'var(--bg-tertiary)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px',
                                color: 'var(--text-primary)',
                                transition: 'all 0.2s ease'
                            } }
                            onMouseOver={ ( e ) => e.currentTarget.style.borderColor = '#0078D4' }
                            onMouseOut={ ( e ) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }
                        >
                            <span style={ { fontSize: '24px' } }>📧</span>
                            <span style={ { fontSize: '12px' } }>Outlook</span>
                        </button>
                        <button
                            onClick={ () => addToCalendar( 'ical' ) }
                            style={ {
                                padding: '16px',
                                background: 'var(--bg-tertiary)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px',
                                color: 'var(--text-primary)',
                                transition: 'all 0.2s ease'
                            } }
                            onMouseOver={ ( e ) => e.currentTarget.style.borderColor = '#FF3B30' }
                            onMouseOut={ ( e ) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }
                        >
                            <span style={ { fontSize: '24px' } }>🍎</span>
                            <span style={ { fontSize: '12px' } }>Apple</span>
                        </button>
                    </div>
                </div>

                <div style={ {
                    marginTop: '20px',
                    paddingTop: '16px',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    textAlign: 'center'
                } }>
                    <span style={ { fontSize: '12px', color: 'var(--text-muted)' } }>
                        Powered by Razorpay • Twilio • SendGrid
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
