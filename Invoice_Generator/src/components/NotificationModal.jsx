import { useState } from 'react';
import html2pdf from 'html2pdf.js';

const API_BASE = 'http://localhost:3001/api';

const NotificationModal = ( { data, total, subtotal, tax, onClose, showToast } ) =>
{
    const [ activeTab, setActiveTab ] = useState( 'sms' );
    const [ phoneNumber, setPhoneNumber ] = useState( data.customerPhone || '+917550293777' );
    const [ email, setEmail ] = useState( data.customerEmail || '' );
    const [ isSending, setIsSending ] = useState( false );
    const [ message, setMessage ] = useState( '' );
    const [ attachPdf, setAttachPdf ] = useState( true );

    const formatCurrency = ( amount ) =>
    {
        return new Intl.NumberFormat( 'en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        } ).format( amount );
    };

    const getDefaultMessage = () =>
    {
        return `🧾 Invoice ${ data.invoiceNumber }\n\nFrom: ${ data.companyName }\nTo: ${ data.customerName || 'Customer' }\n\n💰 Total: ${ formatCurrency( total ) }\nDue: ${ data.dueDate }\n\n${ data.notes || 'Thank you for your business!' }`;
    };

    const handleSendSMS = async () =>
    {
        setIsSending( true );
        try
        {
            const response = await fetch( `${ API_BASE }/notify/sms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( {
                    to: phoneNumber,
                    message: message || getDefaultMessage()
                } )
            } );
            const result = await response.json();
            if ( result.success )
            {
                showToast( 'SMS sent successfully!', 'success' );
            } else
            {
                showToast( `Failed: ${ result.error }`, 'error' );
            }
        } catch ( error )
        {
            showToast( 'Failed to send SMS', 'error' );
        }
        setIsSending( false );
    };

    const handleMakeCall = async () =>
    {
        setIsSending( true );
        try
        {
            const callMessage = `Hello ${ data.customerName || 'Customer' }. This is a reminder for invoice ${ data.invoiceNumber }. The total amount due is ${ total } rupees. The payment is due on ${ data.dueDate }. Thank you for your business!`;

            const response = await fetch( `${ API_BASE }/notify/call`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( {
                    to: phoneNumber,
                    message: callMessage
                } )
            } );
            const result = await response.json();
            if ( result.success )
            {
                showToast( 'Call initiated! Phone will ring shortly.', 'success' );
            } else
            {
                showToast( `Failed: ${ result.error }`, 'error' );
            }
        } catch ( error )
        {
            showToast( 'Failed to make call', 'error' );
        }
        setIsSending( false );
    };

    const handleSendWhatsApp = async () =>
    {
        setIsSending( true );
        try
        {
            const response = await fetch( `${ API_BASE }/notify/whatsapp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( {
                    to: phoneNumber,
                    message: message || getDefaultMessage()
                } )
            } );
            const result = await response.json();
            if ( result.success )
            {
                showToast( 'WhatsApp message sent!', 'success' );
            } else
            {
                showToast( `Failed: ${ result.error }`, 'error' );
            }
        } catch ( error )
        {
            showToast( 'Failed to send WhatsApp message', 'error' );
        }
        setIsSending( false );
    };

    const handleSendEmail = async () =>
    {
        if ( !email )
        {
            showToast( 'Please enter an email address', 'error' );
            return;
        }
        setIsSending( true );

        try
        {
            let pdfBase64 = null;

            // Generate PDF if attachment is enabled
            if ( attachPdf )
            {
                const invoiceElement = document.querySelector( '.invoice-preview' );
                if ( invoiceElement )
                {
                    showToast( 'Generating PDF...', 'info' );

                    const opt = {
                        margin: 0,
                        filename: `Invoice-${ data.invoiceNumber }.pdf`,
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { scale: 2, useCORS: true },
                        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                    };

                    // Generate PDF as base64
                    const pdfBlob = await html2pdf().set( opt ).from( invoiceElement ).outputPdf( 'blob' );
                    pdfBase64 = await new Promise( ( resolve ) =>
                    {
                        const reader = new FileReader();
                        reader.onloadend = () =>
                        {
                            const base64 = reader.result.split( ',' )[ 1 ];
                            resolve( base64 );
                        };
                        reader.readAsDataURL( pdfBlob );
                    } );
                }
            }

            const response = await fetch( `${ API_BASE }/notify/email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( {
                    to: email,
                    invoiceData: {
                        ...data,
                        subtotal,
                        tax,
                        total
                    },
                    pdfBase64: pdfBase64
                } )
            } );
            const result = await response.json();
            if ( result.success )
            {
                showToast( attachPdf ? 'Email with PDF sent!' : 'Email sent!', 'success' );
            } else
            {
                showToast( `Failed: ${ result.error }`, 'error' );
            }
        } catch ( error )
        {
            console.error( 'Email error:', error );
            showToast( 'Failed to send email', 'error' );
        }
        setIsSending( false );
    };

    const tabs = [
        { id: 'sms', label: '📱 SMS', icon: '📱' },
        { id: 'call', label: '📞 Call', icon: '📞' },
        { id: 'whatsapp', label: '💬 WhatsApp', icon: '💬' },
        { id: 'email', label: '✉️ Email', icon: '✉️' }
    ];

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
                style={ { maxWidth: '550px', width: '100%' } }
            >
                <div className="card-header">
                    <h2 className="card-title">
                        <span className="card-title-icon">🔔</span>
                        Send Notification
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
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px 20px',
                    marginBottom: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                } }>
                    <div>
                        <div style={ { fontSize: '13px', color: 'var(--text-muted)' } }>Invoice { data.invoiceNumber }</div>
                        <div style={ { fontWeight: '600' } }>{ data.customerName || 'Customer' }</div>
                    </div>
                    <div style={ { fontSize: '20px', fontWeight: '700', color: 'var(--accent-cyan)' } }>
                        { formatCurrency( total ) }
                    </div>
                </div>

                {/* Tabs */ }
                <div style={ {
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '20px',
                    background: 'var(--bg-tertiary)',
                    padding: '4px',
                    borderRadius: 'var(--radius-md)'
                } }>
                    { tabs.map( tab => (
                        <button
                            key={ tab.id }
                            onClick={ () => setActiveTab( tab.id ) }
                            style={ {
                                flex: 1,
                                padding: '12px',
                                background: activeTab === tab.id ? 'var(--primary-gradient)' : 'transparent',
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontWeight: '500',
                                fontSize: '13px',
                                transition: 'all 0.2s ease'
                            } }
                        >
                            { tab.label }
                        </button>
                    ) ) }
                </div>

                {/* SMS & Call & WhatsApp Tab */ }
                { ( activeTab === 'sms' || activeTab === 'call' || activeTab === 'whatsapp' ) && (
                    <div>
                        {/* WhatsApp Sandbox Instructions */ }
                        { activeTab === 'whatsapp' && (
                            <div style={ {
                                background: 'rgba(37, 211, 102, 0.1)',
                                border: '1px solid rgba(37, 211, 102, 0.3)',
                                borderRadius: 'var(--radius-md)',
                                padding: '14px 16px',
                                marginBottom: '16px',
                                fontSize: '12px',
                                color: '#25d366'
                            } }>
                                <strong>📱 WhatsApp Sandbox Setup:</strong>
                                <ol style={ { margin: '8px 0 0 16px', padding: 0, lineHeight: 1.8 } }>
                                    <li>Recipient must first send <strong style={ { background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' } }>join crop-path</strong> to <strong>+1 415 523 8886</strong></li>
                                    <li>Then you can send WhatsApp messages to them</li>
                                </ol>
                            </div>
                        ) }

                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input
                                type="tel"
                                className="form-input"
                                value={ phoneNumber }
                                onChange={ ( e ) => setPhoneNumber( e.target.value ) }
                                placeholder="+91 7550293777"
                            />
                        </div>

                        { activeTab !== 'call' && (
                            <div className="form-group">
                                <label className="form-label">Message</label>
                                <textarea
                                    className="form-input"
                                    rows={ 4 }
                                    value={ message }
                                    onChange={ ( e ) => setMessage( e.target.value ) }
                                    placeholder={ getDefaultMessage() }
                                />
                            </div>
                        ) }

                        <button
                            className="btn-primary"
                            onClick={ activeTab === 'sms' ? handleSendSMS : activeTab === 'call' ? handleMakeCall : handleSendWhatsApp }
                            disabled={ isSending }
                            style={ { opacity: isSending ? 0.7 : 1 } }
                        >
                            { isSending ? (
                                <span>Sending...</span>
                            ) : (
                                <>
                                    <span>{ activeTab === 'sms' ? '📱' : activeTab === 'call' ? '📞' : '💬' }</span>
                                    { activeTab === 'sms' ? 'Send SMS via Twilio' : activeTab === 'call' ? 'Make Voice Call' : 'Send WhatsApp Message' }
                                </>
                            ) }
                        </button>
                    </div>
                ) }

                {/* Email Tab */ }
                { activeTab === 'email' && (
                    <div>
                        {/* Configuration Instructions */ }
                        <div style={ {
                            background: 'rgba(96, 165, 250, 0.1)',
                            border: '1px solid rgba(96, 165, 250, 0.3)',
                            borderRadius: 'var(--radius-md)',
                            padding: '14px 16px',
                            marginBottom: '16px',
                            fontSize: '12px',
                            color: '#60a5fa'
                        } }>
                            <strong>📧 SendGrid Setup (Single Sender Verification):</strong>
                            <ol style={ { margin: '8px 0 0 16px', padding: 0, lineHeight: 1.8 } }>
                                <li>Go to <a href="https://app.sendgrid.com/settings/sender_auth/senders" target="_blank" rel="noopener noreferrer" style={ { color: '#fbbf24' } }>Single Sender Verification</a></li>
                                <li>Click "Create New Sender" → Enter your email (jayadithya.g10@gmail.com)</li>
                                <li>Check your inbox and click the verification link</li>
                            </ol>
                            <div style={ { marginTop: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.6)' } }>
                                ⚠️ Don't use "Domain Authentication" - that requires DNS access you don't have for gmail.com
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-input"
                                value={ email }
                                onChange={ ( e ) => setEmail( e.target.value ) }
                                placeholder="customer@email.com"
                            />
                        </div>

                        {/* Attach PDF Toggle */ }
                        <label style={ {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '14px 16px',
                            background: attachPdf ? 'rgba(56, 239, 125, 0.1)' : 'var(--bg-tertiary)',
                            border: attachPdf ? '1px solid rgba(56, 239, 125, 0.3)' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '16px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        } }>
                            <input
                                type="checkbox"
                                checked={ attachPdf }
                                onChange={ ( e ) => setAttachPdf( e.target.checked ) }
                                style={ { width: '18px', height: '18px', accentColor: '#38ef7d' } }
                            />
                            <div>
                                <div style={ { fontWeight: '600', fontSize: '14px', color: attachPdf ? '#38ef7d' : 'var(--text-primary)' } }>
                                    📎 Attach Invoice PDF
                                </div>
                                <div style={ { fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' } }>
                                    { attachPdf ? 'PDF will be generated and attached' : 'Only HTML email will be sent' }
                                </div>
                            </div>
                        </label>

                        <div style={ {
                            background: 'var(--bg-tertiary)',
                            borderRadius: 'var(--radius-md)',
                            padding: '16px',
                            marginBottom: '20px'
                        } }>
                            <div style={ { fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' } }>
                                EMAIL PREVIEW
                            </div>
                            <div style={ { fontSize: '14px' } }>
                                <strong>Subject:</strong> Invoice { data.invoiceNumber } from { data.companyName }
                            </div>
                            <div style={ { fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' } }>
                                { attachPdf
                                    ? '📎 Professional HTML email + PDF attachment'
                                    : 'Professional HTML invoice with all details, line items, and totals.'
                                }
                            </div>
                        </div>

                        <button
                            className="btn-primary"
                            onClick={ handleSendEmail }
                            disabled={ isSending }
                            style={ { opacity: isSending ? 0.7 : 1 } }
                        >
                            { isSending ? 'Sending...' : '✉️ Send Email via SendGrid' }
                        </button>
                    </div>
                ) }

                <div style={ {
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    textAlign: 'center'
                } }>
                    <span style={ { fontSize: '12px', color: 'var(--text-muted)' } }>
                        Powered by Twilio & SendGrid
                    </span>
                </div>
            </div>
        </div>
    );
};

export default NotificationModal;
